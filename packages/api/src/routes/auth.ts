import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '@job-portal/shared';
import type { Bindings, Variables, UserRow, RefreshTokenRow } from '../types';
import { hashPassword, verifyPassword, generateToken, hashToken, generateId } from '../utils/crypto';
import { createAccessToken, createRefreshToken, verifyToken, parseExpiresIn } from '../utils/jwt';
import { authMiddleware } from '../middleware/auth';
import { rateLimitPresets } from '../middleware/rateLimit';

export const authRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Apply rate limiting to all auth routes
authRoutes.use('*', rateLimitPresets.auth);

/**
 * POST /api/auth/register
 * Register a new user account
 */
authRoutes.post('/register', zValidator('json', registerSchema), async (c) => {
  const { email, password, role, gdprConsent } = c.req.valid('json');
  
  // Check if email already exists
  const existingUser = await c.env.DB.prepare(
    'SELECT id FROM users WHERE email = ?'
  ).bind(email.toLowerCase()).first<UserRow>();
  
  if (existingUser) {
    return c.json(
      { success: false, error: 'Conflict', message: 'Email already registered' },
      409
    );
  }
  
  // Create user
  const userId = generateId();
  const passwordHash = await hashPassword(password);
  
  await c.env.DB.prepare(`
    INSERT INTO users (id, email, password_hash, role, gdpr_consent)
    VALUES (?, ?, ?, ?, ?)
  `).bind(userId, email.toLowerCase(), passwordHash, role, gdprConsent ? 1 : 0).run();
  
  // Create profile based on role
  const profileId = generateId();
  
  if (role === 'employer') {
    await c.env.DB.prepare(`
      INSERT INTO employer_profiles (id, user_id, company_name, description, industry, contact_details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(profileId, userId, '', '', '', JSON.stringify({ email })).run();
  } else if (role === 'seeker') {
    await c.env.DB.prepare(`
      INSERT INTO seeker_profiles (id, user_id, full_name, work_history, education, skills, preferences)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(profileId, userId, '', '[]', '[]', '[]', '{}').run();
  }
  
  // Generate tokens
  const user = { id: userId, email: email.toLowerCase(), role: role as 'employer' | 'seeker' };
  const accessToken = await createAccessToken(user, c.env.JWT_SECRET, c.env.JWT_EXPIRES_IN);
  const refreshToken = await createRefreshToken(user, c.env.JWT_SECRET, c.env.REFRESH_TOKEN_EXPIRES_IN);
  
  // Store refresh token
  const tokenHash = await hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + parseExpiresIn(c.env.REFRESH_TOKEN_EXPIRES_IN) * 1000).toISOString();
  
  await c.env.DB.prepare(`
    INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
    VALUES (?, ?, ?, ?)
  `).bind(generateId(), userId, tokenHash, expiresAt).run();
  
  return c.json({
    success: true,
    data: {
      user: {
        id: userId,
        email: email.toLowerCase(),
        role,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: parseExpiresIn(c.env.JWT_EXPIRES_IN),
      },
    },
    message: 'Registration successful',
  }, 201);
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
authRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');
  
  // Find user
  const user = await c.env.DB.prepare(
    'SELECT * FROM users WHERE email = ?'
  ).bind(email.toLowerCase()).first<UserRow>();
  
  if (!user) {
    return c.json(
      { success: false, error: 'Unauthorized', message: 'Invalid email or password' },
      401
    );
  }
  
  // Check if account is active
  if (!user.is_active) {
    return c.json(
      { success: false, error: 'Forbidden', message: 'Account is deactivated' },
      403
    );
  }
  
  // Verify password
  const isValid = await verifyPassword(password, user.password_hash);
  
  if (!isValid) {
    return c.json(
      { success: false, error: 'Unauthorized', message: 'Invalid email or password' },
      401
    );
  }
  
  // Generate tokens
  const authUser = {
    id: user.id,
    email: user.email,
    role: user.role as 'admin' | 'employer' | 'seeker',
  };
  
  const accessToken = await createAccessToken(authUser, c.env.JWT_SECRET, c.env.JWT_EXPIRES_IN);
  const refreshToken = await createRefreshToken(authUser, c.env.JWT_SECRET, c.env.REFRESH_TOKEN_EXPIRES_IN);
  
  // Store refresh token
  const tokenHash = await hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + parseExpiresIn(c.env.REFRESH_TOKEN_EXPIRES_IN) * 1000).toISOString();
  
  await c.env.DB.prepare(`
    INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
    VALUES (?, ?, ?, ?)
  `).bind(generateId(), user.id, tokenHash, expiresAt).run();
  
  return c.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerified: !!user.email_verified,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: parseExpiresIn(c.env.JWT_EXPIRES_IN),
      },
    },
  });
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
authRoutes.post('/refresh', async (c) => {
  const body = await c.req.json<{ refreshToken: string }>();
  const { refreshToken } = body;
  
  if (!refreshToken) {
    return c.json(
      { success: false, error: 'Bad Request', message: 'Refresh token required' },
      400
    );
  }
  
  try {
    // Verify refresh token
    const user = await verifyToken(refreshToken, c.env.JWT_SECRET, 'refresh');
    
    // Check if token exists in database
    const tokenHash = await hashToken(refreshToken);
    const storedToken = await c.env.DB.prepare(
      'SELECT * FROM refresh_tokens WHERE token_hash = ? AND user_id = ?'
    ).bind(tokenHash, user.id).first<RefreshTokenRow>();
    
    if (!storedToken) {
      return c.json(
        { success: false, error: 'Unauthorized', message: 'Invalid refresh token' },
        401
      );
    }
    
    // Check if token is expired
    if (new Date(storedToken.expires_at) < new Date()) {
      await c.env.DB.prepare('DELETE FROM refresh_tokens WHERE id = ?').bind(storedToken.id).run();
      return c.json(
        { success: false, error: 'Unauthorized', message: 'Refresh token expired' },
        401
      );
    }
    
    // Get fresh user data
    const dbUser = await c.env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(user.id).first<UserRow>();
    
    if (!dbUser || !dbUser.is_active) {
      return c.json(
        { success: false, error: 'Unauthorized', message: 'User not found or inactive' },
        401
      );
    }
    
    // Generate new tokens
    const authUser = {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role as 'admin' | 'employer' | 'seeker',
    };
    
    const newAccessToken = await createAccessToken(authUser, c.env.JWT_SECRET, c.env.JWT_EXPIRES_IN);
    const newRefreshToken = await createRefreshToken(authUser, c.env.JWT_SECRET, c.env.REFRESH_TOKEN_EXPIRES_IN);
    
    // Delete old refresh token and store new one
    await c.env.DB.prepare('DELETE FROM refresh_tokens WHERE id = ?').bind(storedToken.id).run();
    
    const newTokenHash = await hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + parseExpiresIn(c.env.REFRESH_TOKEN_EXPIRES_IN) * 1000).toISOString();
    
    await c.env.DB.prepare(`
      INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
      VALUES (?, ?, ?, ?)
    `).bind(generateId(), dbUser.id, newTokenHash, expiresAt).run();
    
    return c.json({
      success: true,
      data: {
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresIn: parseExpiresIn(c.env.JWT_EXPIRES_IN),
        },
      },
    });
  } catch (error) {
    return c.json(
      { success: false, error: 'Unauthorized', message: 'Invalid refresh token' },
      401
    );
  }
});

/**
 * POST /api/auth/logout
 * Logout and invalidate refresh token
 */
authRoutes.post('/logout', authMiddleware, async (c) => {
  const user = c.get('user')!;
  const body = await c.req.json<{ refreshToken?: string }>().catch(() => ({}));
  
  if (body.refreshToken) {
    // Delete specific refresh token
    const tokenHash = await hashToken(body.refreshToken);
    await c.env.DB.prepare(
      'DELETE FROM refresh_tokens WHERE token_hash = ? AND user_id = ?'
    ).bind(tokenHash, user.id).run();
  } else {
    // Delete all refresh tokens for user
    await c.env.DB.prepare(
      'DELETE FROM refresh_tokens WHERE user_id = ?'
    ).bind(user.id).run();
  }
  
  return c.json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * POST /api/auth/forgot-password
 * Request password reset email
 */
authRoutes.post('/forgot-password', zValidator('json', forgotPasswordSchema), async (c) => {
  const { email } = c.req.valid('json');
  
  // Always return success to prevent email enumeration
  const user = await c.env.DB.prepare(
    'SELECT id FROM users WHERE email = ?'
  ).bind(email.toLowerCase()).first<UserRow>();
  
  if (user) {
    // Generate reset token
    const resetToken = generateToken(32);
    const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour
    
    // Store reset token (using refresh_tokens table with a special prefix)
    const tokenHash = await hashToken(`reset:${resetToken}`);
    await c.env.DB.prepare(`
      INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
      VALUES (?, ?, ?, ?)
    `).bind(generateId(), user.id, tokenHash, expiresAt).run();
    
    // TODO: Send email with reset token
    // This will be implemented when email service is configured
    console.log(`Password reset token for ${email}: ${resetToken}`);
  }
  
  return c.json({
    success: true,
    message: 'If an account exists with this email, you will receive a password reset link',
  });
});

/**
 * POST /api/auth/reset-password
 * Reset password using token
 */
authRoutes.post('/reset-password', zValidator('json', resetPasswordSchema), async (c) => {
  const { token, password } = c.req.valid('json');
  
  // Find reset token
  const tokenHash = await hashToken(`reset:${token}`);
  const storedToken = await c.env.DB.prepare(
    'SELECT * FROM refresh_tokens WHERE token_hash = ?'
  ).bind(tokenHash).first<RefreshTokenRow>();
  
  if (!storedToken) {
    return c.json(
      { success: false, error: 'Bad Request', message: 'Invalid or expired reset token' },
      400
    );
  }
  
  if (new Date(storedToken.expires_at) < new Date()) {
    await c.env.DB.prepare('DELETE FROM refresh_tokens WHERE id = ?').bind(storedToken.id).run();
    return c.json(
      { success: false, error: 'Bad Request', message: 'Reset token has expired' },
      400
    );
  }
  
  // Update password
  const passwordHash = await hashPassword(password);
  await c.env.DB.prepare(
    'UPDATE users SET password_hash = ?, updated_at = datetime("now") WHERE id = ?'
  ).bind(passwordHash, storedToken.user_id).run();
  
  // Delete all refresh tokens for user (force re-login)
  await c.env.DB.prepare(
    'DELETE FROM refresh_tokens WHERE user_id = ?'
  ).bind(storedToken.user_id).run();
  
  return c.json({
    success: true,
    message: 'Password reset successfully. Please login with your new password.',
  });
});

/**
 * POST /api/auth/change-password
 * Change password for authenticated user
 */
authRoutes.post('/change-password', authMiddleware, zValidator('json', changePasswordSchema), async (c) => {
  const user = c.get('user')!;
  const { currentPassword, newPassword } = c.req.valid('json');
  
  // Get user with password
  const dbUser = await c.env.DB.prepare(
    'SELECT * FROM users WHERE id = ?'
  ).bind(user.id).first<UserRow>();
  
  if (!dbUser) {
    return c.json(
      { success: false, error: 'Not Found', message: 'User not found' },
      404
    );
  }
  
  // Verify current password
  const isValid = await verifyPassword(currentPassword, dbUser.password_hash);
  
  if (!isValid) {
    return c.json(
      { success: false, error: 'Unauthorized', message: 'Current password is incorrect' },
      401
    );
  }
  
  // Update password
  const passwordHash = await hashPassword(newPassword);
  await c.env.DB.prepare(
    'UPDATE users SET password_hash = ?, updated_at = datetime("now") WHERE id = ?'
  ).bind(passwordHash, user.id).run();
  
  // Delete all refresh tokens (force re-login on other devices)
  await c.env.DB.prepare(
    'DELETE FROM refresh_tokens WHERE user_id = ?'
  ).bind(user.id).run();
  
  return c.json({
    success: true,
    message: 'Password changed successfully',
  });
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
authRoutes.get('/me', authMiddleware, async (c) => {
  const user = c.get('user')!;
  
  const dbUser = await c.env.DB.prepare(
    'SELECT id, email, role, is_active, email_verified, gdpr_consent, created_at FROM users WHERE id = ?'
  ).bind(user.id).first<UserRow>();
  
  if (!dbUser) {
    return c.json(
      { success: false, error: 'Not Found', message: 'User not found' },
      404
    );
  }
  
  return c.json({
    success: true,
    data: {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      isActive: !!dbUser.is_active,
      emailVerified: !!dbUser.email_verified,
      gdprConsent: !!dbUser.gdpr_consent,
      createdAt: dbUser.created_at,
    },
  });
});

/**
 * GET /api/auth/oauth/google
 * Initiate Google OAuth flow
 */
authRoutes.get('/oauth/google', async (c) => {
  const clientId = c.env.GOOGLE_CLIENT_ID;
  
  if (!clientId) {
    return c.json(
      { success: false, error: 'Not Configured', message: 'Google OAuth is not configured' },
      501
    );
  }
  
  const redirectUri = `${new URL(c.req.url).origin}/api/auth/oauth/google/callback`;
  const scope = 'openid email profile';
  const state = generateToken(16);
  
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', scope);
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('access_type', 'offline');
  
  return c.json({
    success: true,
    data: {
      authUrl: authUrl.toString(),
      state,
    },
  });
});

/**
 * GET /api/auth/oauth/linkedin
 * Initiate LinkedIn OAuth flow
 */
authRoutes.get('/oauth/linkedin', async (c) => {
  const clientId = c.env.LINKEDIN_CLIENT_ID;
  
  if (!clientId) {
    return c.json(
      { success: false, error: 'Not Configured', message: 'LinkedIn OAuth is not configured' },
      501
    );
  }
  
  const redirectUri = `${new URL(c.req.url).origin}/api/auth/oauth/linkedin/callback`;
  const scope = 'openid profile email';
  const state = generateToken(16);
  
  const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', scope);
  authUrl.searchParams.set('state', state);
  
  return c.json({
    success: true,
    data: {
      authUrl: authUrl.toString(),
      state,
    },
  });
});

/**
 * DELETE /api/auth/account
 * Delete user account (GDPR right to be forgotten)
 */
authRoutes.delete('/account', authMiddleware, async (c) => {
  const user = c.get('user')!;
  
  // Delete user (cascades to all related data)
  await c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(user.id).run();
  
  return c.json({
    success: true,
    message: 'Account deleted successfully',
  });
});

/**
 * GET /api/auth/export
 * Export all user data (GDPR data portability)
 */
authRoutes.get('/export', authMiddleware, async (c) => {
  const user = c.get('user')!;
  
  // Get user data
  const userData = await c.env.DB.prepare(
    'SELECT id, email, role, created_at, updated_at FROM users WHERE id = ?'
  ).bind(user.id).first();
  
  let profileData = null;
  let applications = null;
  let savedJobs = null;
  let alerts = null;
  
  if (user.role === 'employer') {
    profileData = await c.env.DB.prepare(
      'SELECT * FROM employer_profiles WHERE user_id = ?'
    ).bind(user.id).first();
  } else if (user.role === 'seeker') {
    profileData = await c.env.DB.prepare(
      'SELECT * FROM seeker_profiles WHERE user_id = ?'
    ).bind(user.id).first();
    
    if (profileData) {
      applications = await c.env.DB.prepare(
        'SELECT * FROM applications WHERE seeker_id = ?'
      ).bind((profileData as { id: string }).id).all();
      
      savedJobs = await c.env.DB.prepare(
        'SELECT * FROM saved_jobs WHERE seeker_id = ?'
      ).bind((profileData as { id: string }).id).all();
      
      alerts = await c.env.DB.prepare(
        'SELECT * FROM job_alerts WHERE seeker_id = ?'
      ).bind((profileData as { id: string }).id).all();
    }
  }
  
  return c.json({
    success: true,
    data: {
      user: userData,
      profile: profileData,
      applications: applications?.results || [],
      savedJobs: savedJobs?.results || [],
      alerts: alerts?.results || [],
      exportedAt: new Date().toISOString(),
    },
  });
});

