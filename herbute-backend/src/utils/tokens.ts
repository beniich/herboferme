import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { jwtConfig, JWTPayload } from '../config/jwt.js';

// Define local interfaces to avoid external dependency issues in this setup
export interface UserTokenData {
  id: string;
  email: string;
  role: string | string[];
  farmId?: string;
  plan?: string;
  organizationId?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshTokenHash: string;
  expiresIn: string;
}

export const generateTokenPair = (user: UserTokenData): TokenPair => {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId: user.id,
    email: user.email,
    organizationId: user.organizationId,
    roles: Array.isArray(user.role) ? user.role : [user.role],
  };

  const accessToken = jwt.sign(payload, jwtConfig.privateKey, {
    algorithm: jwtConfig.algorithm as any,
    expiresIn: jwtConfig.accessTokenTtl as any,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
  });

  const refreshToken = crypto.randomBytes(64).toString('hex');
  const refreshTokenHash = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  return {
    accessToken,
    refreshToken,
    refreshTokenHash,
    expiresIn: jwtConfig.accessTokenTtl,
  };
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, jwtConfig.publicKey, {
    algorithms: [jwtConfig.algorithm as any],
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
  }) as JWTPayload;
};

export const hashRefreshToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
