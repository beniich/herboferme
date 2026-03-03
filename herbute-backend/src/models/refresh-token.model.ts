/**
 * models/refresh-token.model.ts
 * Stockage des refresh tokens (hash SHA-256)
 * R    vocables individuellement          pas de blacklist Redis n    cessaire
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IRefreshToken extends Document {
  userId:    mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  isRevoked: boolean;
  userAgent?: string;
  ip?:        string;
  createdAt:  Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  isRevoked: { type: Boolean, default: false },
  userAgent: { type: String },
  ip:        { type: String },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

// TTL index          MongoDB supprime automatiquement les tokens expir    s
// (    quivalent du cron DELETE FROM refresh_tokens WHERE expires_at < NOW())
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
RefreshTokenSchema.index({ isRevoked: 1 });

export const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
