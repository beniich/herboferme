/**
 * services/tokenService.ts
 */
import { RefreshToken } from '../models/refresh-token.model.js';
import { generateTokenPair, hashRefreshToken, verifyAccessToken } from '../utils/tokens.js';
import { User } from '../models/user.model.js';
import { Types } from 'mongoose';
import { RefreshTokenError } from '../utils/AppError.js';
import type { JwtPayload } from '@reclamtrack/shared';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface UserTokenPayload {
  id: string;
  orgId: string;
  role: string;
}

export const tokenService = {
  async issueTokenPair(user: UserTokenPayload): Promise<TokenPair> {
    const { accessToken, refreshToken } = generateTokenPair({
      id: user.id,
      email: '',
      role: user.role as any,
      plan: 'essai',
      organizationId: user.orgId
    });

    return { accessToken, refreshToken };
  },

  async rotateRefreshToken(rawToken: string): Promise<TokenPair> {
    const tokenHash = hashRefreshToken(rawToken);
    const existing = await RefreshToken.findOne({ tokenHash, isRevoked: false, expiresAt: { $gt: new Date() } });

    if (!existing) {
      throw new RefreshTokenError('Refresh token invalid or expired');
    }

    const user = await User.findById(existing.userId);
    if (!user) throw new RefreshTokenError('User not found');

    const tokens = generateTokenPair({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      plan: user.plan,
      organizationId: user.organizationId?.toString()
    });

    existing.isRevoked = true;
    await existing.save();

    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  },

  async revokeRefreshToken(rawToken: string): Promise<void> {
    const tokenHash = hashRefreshToken(rawToken);
    await RefreshToken.updateOne({ tokenHash }, { isRevoked: true });
  },

  async introspect(rawToken: string): Promise<JwtPayload | null> {
    try {
      return verifyAccessToken(rawToken);
    } catch {
      return null;
    }
  }
};
