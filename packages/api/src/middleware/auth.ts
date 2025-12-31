import { createMiddleware } from 'hono/factory';
import type { Bindings, Variables } from '../types';
import { verifyToken } from '../utils/jwt';

/**
 * Authentication middleware - verifies JWT and adds user to context
 */
export const authMiddleware = createMiddleware<{
  Bindings: Bindings;
  Variables: Variables;
}>(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json(
      { success: false, error: 'Unauthorized', message: 'Missing or invalid authorization header' },
      401
    );
  }
  
  const token = authHeader.slice(7);
  
  try {
    const user = await verifyToken(token, c.env.JWT_SECRET);
    c.set('user', user);
    await next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid token';
    return c.json(
      { success: false, error: 'Unauthorized', message },
      401
    );
  }
});

/**
 * Optional auth middleware - doesn't fail if no token, but sets user if valid
 */
export const optionalAuthMiddleware = createMiddleware<{
  Bindings: Bindings;
  Variables: Variables;
}>(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const user = await verifyToken(token, c.env.JWT_SECRET);
      c.set('user', user);
    } catch {
      // Ignore invalid tokens for optional auth
    }
  }
  
  await next();
});

/**
 * Role-based authorization middleware
 */
export const requireRole = (...allowedRoles: Array<'admin' | 'employer' | 'seeker'>) => {
  return createMiddleware<{
    Bindings: Bindings;
    Variables: Variables;
  }>(async (c, next) => {
    const user = c.get('user');
    
    if (!user) {
      return c.json(
        { success: false, error: 'Unauthorized', message: 'Authentication required' },
        401
      );
    }
    
    if (!allowedRoles.includes(user.role)) {
      return c.json(
        { success: false, error: 'Forbidden', message: 'Insufficient permissions' },
        403
      );
    }
    
    await next();
  });
};

/**
 * Admin-only middleware
 */
export const adminOnly = requireRole('admin');

/**
 * Employer-only middleware
 */
export const employerOnly = requireRole('employer', 'admin');

/**
 * Seeker-only middleware
 */
export const seekerOnly = requireRole('seeker', 'admin');

