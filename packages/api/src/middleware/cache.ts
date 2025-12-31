import { createMiddleware } from 'hono/factory';
import type { Bindings, Variables } from '../types';

interface CacheOptions {
  maxAge: number; // seconds
  staleWhileRevalidate?: number; // seconds
  private?: boolean;
  varyHeaders?: string[];
}

/**
 * Edge caching middleware using Cloudflare Cache API
 */
export const cacheMiddleware = (options: CacheOptions) => {
  return createMiddleware<{
    Bindings: Bindings;
    Variables: Variables;
  }>(async (c, next) => {
    // Skip caching for non-GET requests
    if (c.req.method !== 'GET') {
      await next();
      return;
    }
    
    // Skip caching if user is authenticated
    const authHeader = c.req.header('Authorization');
    if (authHeader) {
      await next();
      return;
    }
    
    const cacheUrl = new URL(c.req.url);
    const cacheKey = new Request(cacheUrl.toString(), {
      method: 'GET',
      headers: c.req.raw.headers,
    });
    
    // @ts-expect-error - Cloudflare Cache API
    const cache = caches.default;
    
    // Try to get from cache
    let response = await cache.match(cacheKey);
    
    if (response) {
      // Return cached response with cache status header
      const newHeaders = new Headers(response.headers);
      newHeaders.set('X-Cache-Status', 'HIT');
      return new Response(response.body, {
        status: response.status,
        headers: newHeaders,
      });
    }
    
    // Cache miss - proceed with request
    await next();
    
    // Only cache successful responses
    if (c.res.status === 200) {
      const cacheControl = buildCacheControl(options);
      
      // Clone the response for caching
      const responseToCache = c.res.clone();
      const newHeaders = new Headers(responseToCache.headers);
      newHeaders.set('Cache-Control', cacheControl);
      newHeaders.set('X-Cache-Status', 'MISS');
      
      if (options.varyHeaders?.length) {
        newHeaders.set('Vary', options.varyHeaders.join(', '));
      }
      
      const cachedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        headers: newHeaders,
      });
      
      // Store in cache (don't await - fire and forget)
      cache.put(cacheKey, cachedResponse.clone());
      
      // Return response with cache headers
      c.res = cachedResponse;
    }
  });
};

/**
 * Build Cache-Control header value
 */
function buildCacheControl(options: CacheOptions): string {
  const directives: string[] = [];
  
  if (options.private) {
    directives.push('private');
  } else {
    directives.push('public');
  }
  
  directives.push(`max-age=${options.maxAge}`);
  
  if (options.staleWhileRevalidate) {
    directives.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
  }
  
  return directives.join(', ');
}

/**
 * Preset cache configurations
 */
export const cachePresets = {
  // Job listings - cache for 5 minutes, revalidate for 1 minute
  jobListings: cacheMiddleware({
    maxAge: 300,
    staleWhileRevalidate: 60,
    varyHeaders: ['Accept-Encoding'],
  }),
  
  // Job details - cache for 1 minute, revalidate for 30 seconds
  jobDetails: cacheMiddleware({
    maxAge: 60,
    staleWhileRevalidate: 30,
    varyHeaders: ['Accept-Encoding'],
  }),
  
  // Static data (industries, skills, etc.) - cache for 1 hour
  staticData: cacheMiddleware({
    maxAge: 3600,
    staleWhileRevalidate: 300,
    varyHeaders: ['Accept-Encoding'],
  }),
  
  // Company profiles - cache for 10 minutes
  companyProfiles: cacheMiddleware({
    maxAge: 600,
    staleWhileRevalidate: 60,
    varyHeaders: ['Accept-Encoding'],
  }),
};

/**
 * Purge cache for a specific URL pattern
 */
export async function purgeCache(urlPattern: string): Promise<void> {
  // @ts-expect-error - Cloudflare Cache API
  const cache = caches.default;
  
  // Note: In production, you would use Cloudflare's API to purge by tag or prefix
  // This is a simplified version that deletes a single URL
  const request = new Request(urlPattern);
  await cache.delete(request);
}

/**
 * No-cache middleware for user-specific data
 */
export const noCacheMiddleware = createMiddleware<{
  Bindings: Bindings;
  Variables: Variables;
}>(async (c, next) => {
  await next();
  
  c.res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  c.res.headers.set('Pragma', 'no-cache');
  c.res.headers.set('Expires', '0');
});

