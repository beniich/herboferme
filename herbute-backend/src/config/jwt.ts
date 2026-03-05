import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { config as dotenvConfig } from 'dotenv';

// Charger le .env si pas déjà chargé (important pour les scripts autonomes)
dotenvConfig({ path: path.resolve(process.cwd(), '.env') });


let privateKey = '';
let publicKey = '';

try {
  // Try to load RS256 keys
  if (process.env.JWT_PRIVATE_KEY_PATH && process.env.JWT_PUBLIC_KEY_PATH) {
    const privPath = path.resolve(process.cwd(), process.env.JWT_PRIVATE_KEY_PATH);
    const pubPath = path.resolve(process.cwd(), process.env.JWT_PUBLIC_KEY_PATH);
    privateKey = fs.readFileSync(privPath, 'utf8');
    publicKey = fs.readFileSync(pubPath, 'utf8');
  } else {
    // Fallback secret for local dev if paths are missing
    privateKey = process.env.JWT_SECRET || 'herboferme_fallback_secret_for_local_dev';
    publicKey = privateKey;
  }
} catch (error) {
  console.warn('[SECURITY] Could not load RS256 keys. Using fallback secret.');
  privateKey = process.env.JWT_SECRET || 'herboferme_fallback_secret_for_local_dev';
  publicKey = privateKey;
}

const isRS256 = !!process.env.JWT_PRIVATE_KEY_PATH;

export const jwtConfig = {
  privateKey,
  publicKey,
  algorithm: isRS256 ? 'RS256' : 'HS256',
  accessTokenTtl: '24h',
  issuer: 'herboferme',
  audience: 'herboferme-client'
};

export interface JWTPayload {
  userId: string;
  email: string;
  organizationId: string;
  roles: string[]; // ['user', 'admin', 'manager']
  iat?: number;
  exp?: number;
}

export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(
    {
      ...payload,
    },
    jwtConfig.privateKey,
    {
      algorithm: jwtConfig.algorithm as any,
      expiresIn: jwtConfig.accessTokenTtl as any,
    }
  );
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, jwtConfig.publicKey, {
      algorithms: [jwtConfig.algorithm as any],
    });
    return decoded as JWTPayload;
  } catch (err) {
    return null; // Invalid token
  }
}
