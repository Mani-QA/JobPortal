import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

// Import API routes from the api package
import { authRoutes } from '../../api/src/routes/auth';
import { jobRoutes } from '../../api/src/routes/jobs';
import { employerRoutes } from '../../api/src/routes/employers';
import { seekerRoutes } from '../../api/src/routes/seekers';
import { profileRoutes } from '../../api/src/routes/profiles';
import { adminRoutes } from '../../api/src/routes/admin';
import { uploadRoutes } from '../../api/src/routes/upload';

// Types
interface Bindings {
  DB: D1Database;
  STORAGE: R2Bucket;
  ASSETS: Fetcher;
  ENVIRONMENT: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  REFRESH_TOKEN_EXPIRES_IN: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  LINKEDIN_CLIENT_ID?: string;
  LINKEDIN_CLIENT_SECRET?: string;
  EMAIL_API_KEY?: string;
  EMAIL_FROM?: string;
  EMAIL_FROM_NAME?: string;
  EMAIL_PROVIDER?: 'sendgrid' | 'mailgun' | 'resend' | 'console';
}

interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'employer' | 'seeker';
}

interface Variables {
  user?: AuthUser;
}

// Create Hono app
const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Global middleware for API routes
app.use('/api/*', logger());
app.use('/api/*', prettyJSON());
app.use('/api/*', secureHeaders());

// CORS for API routes - not needed when frontend is same-origin, but keeping for flexibility
app.use('/api/*', async (c, next) => {
  const corsMiddleware = cors({
    origin: '*', // Same origin, but allow external access too
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400,
  });
  return corsMiddleware(c, next);
});

// API Health check
app.get('/api', (c) => {
  return c.json({
    name: 'Job Portal API',
    version: '1.0.0',
    status: 'healthy',
    environment: c.env.ENVIRONMENT,
  });
});

// Mount API routes
app.route('/api/auth', authRoutes);
app.route('/api/jobs', jobRoutes);
app.route('/api/employers', employerRoutes);
app.route('/api/seekers', seekerRoutes);
app.route('/api/profiles', profileRoutes);
app.route('/api/admin', adminRoutes);
app.route('/api/upload', uploadRoutes);

// API 404 handler
app.all('/api/*', (c) => {
  return c.json(
    {
      success: false,
      error: 'Not Found',
      message: `Route ${c.req.method} ${c.req.path} not found`,
    },
    404
  );
});

// Static file extensions that should be served as-is
const STATIC_EXTENSIONS = [
  '.js', '.css', '.html', '.json', '.map',
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico',
  '.woff', '.woff2', '.ttf', '.eot',
  '.mp4', '.webm', '.ogg', '.mp3', '.wav',
  '.pdf', '.zip', '.xml', '.txt'
];

// Check if path is for a static file
function isStaticFile(path: string): boolean {
  return STATIC_EXTENSIONS.some(ext => path.toLowerCase().endsWith(ext));
}

// Serve static assets and handle SPA routing
app.get('*', async (c) => {
  const url = new URL(c.req.url);
  const path = url.pathname;
  
  try {
    // Try to serve the static file directly
    const assetResponse = await c.env.ASSETS.fetch(c.req.raw);
    
    // If we got a valid response (not 404), return it
    if (assetResponse.status !== 404) {
      return assetResponse;
    }
    
    // For static file requests that returned 404, return 404
    if (isStaticFile(path)) {
      return new Response('Not Found', { status: 404 });
    }
    
    // For non-static routes, serve index.html (SPA fallback)
    const indexRequest = new Request(new URL('/index.html', c.req.url).toString(), {
      method: 'GET',
      headers: c.req.raw.headers,
    });
    
    return await c.env.ASSETS.fetch(indexRequest);
  } catch (error) {
    console.error('Error serving static file:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
});

// Error handler for API routes
app.onError((err, c) => {
  console.error('Error:', err);
  
  // Only return JSON errors for API routes
  if (c.req.path.startsWith('/api')) {
    if (err.message.includes('Unauthorized')) {
      return c.json(
        { success: false, error: 'Unauthorized', message: err.message },
        401
      );
    }
    
    if (err.message.includes('Forbidden')) {
      return c.json(
        { success: false, error: 'Forbidden', message: err.message },
        403
      );
    }
    
    if (err.message.includes('Not found')) {
      return c.json(
        { success: false, error: 'Not Found', message: err.message },
        404
      );
    }
    
    if (err.message.includes('Validation')) {
      return c.json(
        { success: false, error: 'Validation Error', message: err.message },
        400
      );
    }
    
    return c.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: c.env.ENVIRONMENT === 'development' ? err.message : 'Something went wrong',
      },
      500
    );
  }
  
  // For non-API routes, return a simple error
  return new Response('Internal Server Error', { status: 500 });
});

export default app;

