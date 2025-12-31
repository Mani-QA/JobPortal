import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import type { Bindings, Variables } from './types';

// Import routes
import { authRoutes } from './routes/auth';
import { jobRoutes } from './routes/jobs';
import { employerRoutes } from './routes/employers';
import { seekerRoutes } from './routes/seekers';
import { profileRoutes } from './routes/profiles';
import { adminRoutes } from './routes/admin';
import { uploadRoutes } from './routes/upload';

// Create Hono app
const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Global middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', secureHeaders());

// CORS configuration
app.use('*', async (c, next) => {
  const corsMiddleware = cors({
    origin: c.env.CORS_ORIGIN || 'http://localhost:5173',
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400,
  });
  return corsMiddleware(c, next);
});

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'Job Portal API',
    version: '1.0.0',
    status: 'healthy',
    environment: c.env.ENVIRONMENT,
  });
});

// API routes
app.route('/api/auth', authRoutes);
app.route('/api/jobs', jobRoutes);
app.route('/api/employers', employerRoutes);
app.route('/api/seekers', seekerRoutes);
app.route('/api/profiles', profileRoutes);
app.route('/api/admin', adminRoutes);
app.route('/api/upload', uploadRoutes);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: 'Not Found',
      message: `Route ${c.req.method} ${c.req.path} not found`,
    },
    404
  );
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  
  // Check for known error types
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
  
  // Generic error
  return c.json(
    {
      success: false,
      error: 'Internal Server Error',
      message: c.env.ENVIRONMENT === 'development' ? err.message : 'Something went wrong',
    },
    500
  );
});

export default app;

