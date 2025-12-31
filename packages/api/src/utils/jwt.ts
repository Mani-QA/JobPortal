import * as jose from 'jose';
import type { AuthUser } from '../types';

const ALGORITHM = 'HS256';

interface TokenPayload {
  sub: string;
  email: string;
  role: 'admin' | 'employer' | 'seeker';
  type: 'access' | 'refresh';
}

/**
 * Create a JWT access token
 */
export async function createAccessToken(
  user: AuthUser,
  secret: string,
  expiresIn: string = '15m'
): Promise<string> {
  const secretKey = new TextEncoder().encode(secret);
  
  return await new jose.SignJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
    type: 'access',
  } as TokenPayload)
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey);
}

/**
 * Create a JWT refresh token
 */
export async function createRefreshToken(
  user: AuthUser,
  secret: string,
  expiresIn: string = '7d'
): Promise<string> {
  const secretKey = new TextEncoder().encode(secret);
  
  return await new jose.SignJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
    type: 'refresh',
  } as TokenPayload)
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey);
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(
  token: string,
  secret: string,
  expectedType: 'access' | 'refresh' = 'access'
): Promise<AuthUser> {
  const secretKey = new TextEncoder().encode(secret);
  
  try {
    const { payload } = await jose.jwtVerify(token, secretKey);
    
    const tokenPayload = payload as unknown as TokenPayload;
    
    if (tokenPayload.type !== expectedType) {
      throw new Error(`Invalid token type: expected ${expectedType}`);
    }
    
    return {
      id: tokenPayload.sub,
      email: tokenPayload.email,
      role: tokenPayload.role,
    };
  } catch (error) {
    if (error instanceof jose.errors.JWTExpired) {
      throw new Error('Token has expired');
    }
    if (error instanceof jose.errors.JWTInvalid) {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

/**
 * Decode a JWT token without verification (for debugging)
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const decoded = jose.decodeJwt(token);
    return decoded as unknown as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Get token expiration time in seconds
 */
export function parseExpiresIn(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error('Invalid expiresIn format');
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 60 * 60 * 24;
    default: throw new Error('Invalid time unit');
  }
}

