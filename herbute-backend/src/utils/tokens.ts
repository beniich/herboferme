/**
 *
 * utils/tokens.ts          G    n    ration et v    rification JWT RS256
 *
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { jwtConfig } from '../config/jwt';
import type { JwtPayload, TokenPair, UserTokenData } from '@reclamtrack/shared';

//
// G    n    ration d'une paire de tokens
// Appel     UNIQUEMENT lors du login / refresh
//
export const generateTokenPair = (user: UserTokenData): TokenPair => {
  const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
    sub:    user.id,
    email:  user.email,
    role:   user.role,
    farmId: user.farmId,
    plan:   user.plan,
    org:    user.organizationId,
  };

  const accessToken = jwt.sign(payload, jwtConfig.privateKey, {
    algorithm: jwtConfig.algorithm as jwt.Algorithm,
    expiresIn: jwtConfig.accessTokenTtl as jwt.SignOptions['expiresIn'],
    issuer:    jwtConfig.issuer,
    audience:  jwtConfig.audience,
  } as jwt.SignOptions);

  // Le refresh token est un token opaque (UUID hash    )          pas un JWT
  // Stock     en DB          r    vocable individuellement sans blacklist Redis
  const refreshToken = crypto.randomBytes(64).toString('hex');
  const refreshTokenHash = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  return {
    accessToken,
    refreshToken,      // Token brut          envoy     au client (cookie HttpOnly)
    refreshTokenHash,  // Hash          stock     en DB
    expiresIn: jwtConfig.accessTokenTtl,
  };
};

//
// V    rification d'un access token
// Utilise UNIQUEMENT la cl     publique
//
export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, jwtConfig.publicKey, {
    algorithms: [jwtConfig.algorithm],
    issuer:     jwtConfig.issuer,
    audience:   jwtConfig.audience,
  }) as JwtPayload;
};

//
// Hash d'un refresh token pour stockage DB
//
export const hashRefreshToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
