/**
 * Cloudflare Worker for serving static assets
 * 
 * This worker handles:
 * 1. Serving static files from the built Vite app
 * 2. SPA routing - returns index.html for all non-asset routes
 * 3. Caching headers for optimal performance
 * 4. API proxy to the backend worker (optional - can also use custom domain routing)
 */

/// <reference types="@cloudflare/workers-types" />

export interface Env {
  ASSETS: Fetcher;
  API_URL?: string;
}

const worker: ExportedHandler<Env> = {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Proxy API requests to the backend worker
    if (url.pathname.startsWith('/api')) {
      const apiUrl = env.API_URL || 'https://job-portal-api.your-subdomain.workers.dev';
      const apiRequest = new Request(
        apiUrl + url.pathname.replace('/api', '') + url.search,
        {
          method: request.method,
          headers: request.headers,
          body: request.body,
        }
      );
      return fetch(apiRequest);
    }

    // Check if the request is for a static asset (has file extension)
    const hasExtension = /\.[a-zA-Z0-9]+$/.test(url.pathname);
    
    try {
      // Try to serve the static asset
      let response = await env.ASSETS.fetch(request);
      
      // If 404 and no file extension, serve index.html for SPA routing
      if (response.status === 404 && !hasExtension) {
        const indexRequest = new Request(new URL('/', request.url).toString(), request);
        response = await env.ASSETS.fetch(indexRequest);
      }
      
      // Clone response to add custom headers
      response = new Response(response.body, response);
      
      // Add caching headers based on asset type
      if (hasExtension) {
        const ext = url.pathname.split('.').pop()?.toLowerCase();
        
        // Long cache for immutable assets (hashed filenames)
        if (url.pathname.includes('/assets/') || ext === 'woff2' || ext === 'woff') {
          response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        }
        // Short cache for other static files
        else if (['js', 'css', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'webp'].includes(ext || '')) {
          response.headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
        }
      } else {
        // No cache for HTML (SPA navigation)
        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
      
      // Security headers
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      return response;
    } catch (error) {
      // Fallback to index.html for any errors (SPA fallback)
      const indexRequest = new Request(new URL('/', request.url).toString(), request);
      return env.ASSETS.fetch(indexRequest);
    }
  },
};

export default worker;

