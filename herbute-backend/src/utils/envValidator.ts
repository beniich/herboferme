/**
 * envValidator.ts
 * Validates all required environment variables at startup.
 * Fails fast if any required var is missing          prevents silent misconfiguration.
 */

interface EnvConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
  ALLOWED_ORIGINS: string[];
  API_KEY_SALT: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  INTROSPECT_ALLOWED_IPS: string[];
  // Optional SSH vars
  SSH_HOST?: string;
  SSH_USER?: string;
  SSH_PRIVATE_KEY_PATH?: string;
}

const REQUIRED_VARS = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'ALLOWED_ORIGINS',
  'API_KEY_SALT',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
] as const;

const OPTIONAL_VARS = ['SSH_HOST', 'SSH_USER', 'SSH_PRIVATE_KEY_PATH'] as const;

export function validateEnv(): EnvConfig {
  const missing: string[] = [];

  for (const key of REQUIRED_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `[EnvValidator] Missing required environment variables:\n  ${missing.join('\n  ')}\n` +
      `Please check your .env file against .env.example`
    );
  }

  // Validate JWT secrets are long enough
  if (process.env.JWT_SECRET!.length < 32) {
    throw new Error('[EnvValidator] JWT_SECRET must be at least 32 characters');
  }
  if (process.env.JWT_REFRESH_SECRET!.length < 32) {
    throw new Error('[EnvValidator] JWT_REFRESH_SECRET must be at least 32 characters');
  }
  if (process.env.API_KEY_SALT!.length < 16) {
    throw new Error('[EnvValidator] API_KEY_SALT must be at least 16 characters');
  }

  const nodeEnv = (process.env.NODE_ENV || 'development') as EnvConfig['NODE_ENV'];
  if (!['development', 'production', 'test'].includes(nodeEnv)) {
    throw new Error(`[EnvValidator] NODE_ENV must be one of: development, production, test`);
  }

  const allowedOrigins = process.env.ALLOWED_ORIGINS!.split(',').map(o => o.trim()).filter(Boolean);
  if (allowedOrigins.length === 0) {
    throw new Error('[EnvValidator] ALLOWED_ORIGINS must contain at least one origin');
  }

  const introspectIPs = (process.env.INTROSPECT_ALLOWED_IPS || '127.0.0.1,::1')
    .split(',').map(ip => ip.trim()).filter(Boolean);

  // Warn about optional SSH vars
  const sshVars = ['SSH_HOST', 'SSH_USER', 'SSH_PRIVATE_KEY_PATH'];
  const sshProvided = sshVars.filter(v => !!process.env[v]);
  if (sshProvided.length > 0 && sshProvided.length < sshVars.length) {
    console.warn(
      `[EnvValidator] WARNING: Partial SSH config detected. ` +
      `All of SSH_HOST, SSH_USER, SSH_PRIVATE_KEY_PATH must be set together.`
    );
  }

  return {
    NODE_ENV: nodeEnv,
    PORT: parseInt(process.env.PORT || '5001', 10),
    MONGODB_URI: process.env.MONGODB_URI!,
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    ALLOWED_ORIGINS: allowedOrigins,
    API_KEY_SALT: process.env.API_KEY_SALT!,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
    INTROSPECT_ALLOWED_IPS: introspectIPs,
    SSH_HOST: process.env.SSH_HOST,
    SSH_USER: process.env.SSH_USER,
    SSH_PRIVATE_KEY_PATH: process.env.SSH_PRIVATE_KEY_PATH,
  };
}

export type { EnvConfig };
