import { createMiddleware } from 'hono/factory';
import type { Bindings, Variables } from '../types';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyPrefix?: string; // Prefix for the rate limit key
}

/**
 * Simple in-memory rate limiting for Cloudflare Workers
 * Note: This uses a per-isolate store, so limits are approximate in distributed environments
 * For production, consider using Cloudflare Durable Objects or KV for distributed rate limiting
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiting middleware
 */
export const rateLimitMiddleware = (options: RateLimitOptions) => {
  const { windowMs, maxRequests, keyPrefix = 'rl' } = options;
  
  return createMiddleware<{
    Bindings: Bindings;
    Variables: Variables;
  }>(async (c, next) => {
    // Get client identifier (IP address from CF headers or fallback)
    const clientIP = c.req.header('CF-Connecting-IP') || 
                     c.req.header('X-Forwarded-For')?.split(',')[0] || 
                     'unknown';
    
    const key = `${keyPrefix}:${clientIP}`;
    const now = Date.now();
    
    // Clean up old entries periodically (run on each request)
    if (Math.random() < 0.01) { // 1% of requests trigger cleanup
      cleanupRateLimitStore();
    }
    
    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);
    
    if (!entry || now > entry.resetTime) {
      // Create new window
      entry = { count: 0, resetTime: now + windowMs };
      rateLimitStore.set(key, entry);
    }
    
    entry.count++;
    
    // Set rate limit headers
    const remaining = Math.max(0, maxRequests - entry.count);
    const resetSeconds = Math.ceil((entry.resetTime - now) / 1000);
    
    c.res.headers.set('X-RateLimit-Limit', maxRequests.toString());
    c.res.headers.set('X-RateLimit-Remaining', remaining.toString());
    c.res.headers.set('X-RateLimit-Reset', resetSeconds.toString());
    
    if (entry.count > maxRequests) {
      return c.json(
        {
          success: false,
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: resetSeconds,
        },
        429
      );
    }
    
    await next();
  });
};

/**
 * Cleanup old entries periodically
 */
function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Note: In Cloudflare Workers, we cannot use setInterval in global scope.
// Cleanup is performed on each request in rateLimitMiddleware instead.

/**
 * Preset rate limit configurations
 */
export const rateLimitPresets = {
  // Strict limit for auth endpoints (5 requests per minute)
  auth: rateLimitMiddleware({
    windowMs: 60 * 1000,
    maxRequests: 5,
    keyPrefix: 'auth',
  }),
  
  // Standard API limit (100 requests per minute)
  api: rateLimitMiddleware({
    windowMs: 60 * 1000,
    maxRequests: 100,
    keyPrefix: 'api',
  }),
  
  // Search limit (30 requests per minute)
  search: rateLimitMiddleware({
    windowMs: 60 * 1000,
    maxRequests: 30,
    keyPrefix: 'search',
  }),
  
  // Upload limit (10 requests per minute)
  upload: rateLimitMiddleware({
    windowMs: 60 * 1000,
    maxRequests: 10,
    keyPrefix: 'upload',
  }),
};

