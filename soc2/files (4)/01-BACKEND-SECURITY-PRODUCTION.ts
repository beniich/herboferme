/**
 * 🔒 HERBOFERME BACKEND - SECURITY SETUP (PRODUCTION READY)
 * 
 * Architecture:
 * ├─ Configuration sécurisée (JWT, passwords, environment)
 * ├─ Middleware layer (auth, cors, rate limit, validation)
 * ├─ Error handling robuste
 * └─ Monitoring & logging
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 1. CONFIG - Environment & Security Constants
// ═══════════════════════════════════════════════════════════════════════════════

// backend/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  PORT: z.string().default('2065'),
  
  // Database
  MONGO_URI: z.string().url(),
  
  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379'),
  
  // JWT
  JWT_PRIVATE_KEY_PATH: z.string(),
  JWT_PUBLIC_KEY_PATH: z.string(),
  JWT_EXPIRY: z.string().default('24h'),
  
  // CORS
  ALLOWED_ORIGINS: z.string(), // comma-separated
  
  // Security
  BCRYPT_ROUNDS: z.string().default('12'),
  
  // Monitoring
  SENTRY_DSN: z.string().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type Environment = z.infer<typeof envSchema>;

export function loadEnvironment(): Environment {
  const env = process.env;
  
  const result = envSchema.safeParse(env);
  
  if (!result.success) {
    console.error('❌ Environment variables validation failed:');
    result.error.errors.forEach(e => {
      console.error(`  - ${e.path.join('.')}: ${e.message}`);
    });
    process.exit(1);
  }
  
  return result.data;
}

export const config = loadEnvironment();


// ═══════════════════════════════════════════════════════════════════════════════
// 2. PASSWORD HASHING - Bcrypt avec salt rounds élevés
// ═══════════════════════════════════════════════════════════════════════════════

// backend/utils/password.ts
import bcrypt from 'bcryptjs';
import { config } from '@/config/env';

export async function hashPassword(plainPassword: string): Promise<string> {
  if (!plainPassword || typeof plainPassword !== 'string') {
    throw new Error('Invalid password input');
  }
  
  if (plainPassword.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
  
  if (plainPassword.length > 128) {
    throw new Error('Password is too long');
  }

  try {
    const salt = await bcrypt.genSalt(parseInt(config.BCRYPT_ROUNDS));
    return await bcrypt.hash(plainPassword, salt);
  } catch (err) {
    console.error('[ERROR] Password hashing failed:', err);
    throw new Error('Failed to hash password');
  }
}

export async function verifyPassword(
  plainPassword: string,
  hash: string
): Promise<boolean> {
  if (!plainPassword || !hash) {
    return false;
  }

  try {
    return await bcrypt.compare(plainPassword, hash);
  } catch (err) {
    console.error('[ERROR] Password verification failed:', err);
    return false;
  }
}


// ═══════════════════════════════════════════════════════════════════════════════
// 3. JWT - Asymmetric (RS256) Token Management
// ═══════════════════════════════════════════════════════════════════════════════

// backend/config/jwt.ts
import jwt from 'jsonwebtoken';
import fs from 'fs';
import { config } from '@/config/env';

export interface TokenPayload {
  userId: string;
  email: string;
  organizationId: string;
  roles: string[]; // ['user', 'admin', 'manager']
  iat: number;
  exp: number;
}

class JWTManager {
  private privateKey: string;
  private publicKey: string;

  constructor() {
    try {
      this.privateKey = fs.readFileSync(config.JWT_PRIVATE_KEY_PATH, 'utf8');
      this.publicKey = fs.readFileSync(config.JWT_PUBLIC_KEY_PATH, 'utf8');
    } catch (err) {
      console.error('[ERROR] Failed to load JWT keys:', err);
      process.exit(1);
    }
  }

  generateToken(
    payload: Omit<TokenPayload, 'iat' | 'exp'>
  ): string {
    try {
      return jwt.sign(payload, this.privateKey, {
        algorithm: 'RS256',
        expiresIn: config.JWT_EXPIRY,
        issuer: 'herboferme-api',
        audience: 'herboferme-app',
      });
    } catch (err) {
      console.error('[ERROR] Token generation failed:', err);
      throw new Error('Failed to generate token');
    }
  }

  verifyToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.publicKey, {
        algorithms: ['RS256'],
        issuer: 'herboferme-api',
        audience: 'herboferme-app',
      });
      
      return decoded as TokenPayload;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return null; // Token expired
      }
      if (err instanceof jwt.JsonWebTokenError) {
        return null; // Invalid token
      }
      console.error('[ERROR] Token verification failed:', err);
      return null;
    }
  }
}

export const jwtManager = new JWTManager();


// ═══════════════════════════════════════════════════════════════════════════════
// 4. MIDDLEWARE - CORS (Strict whitelist)
// ═══════════════════════════════════════════════════════════════════════════════

// backend/middleware/cors.ts
import cors from 'cors';
import { config } from '@/config/env';
import { logger } from '@/utils/logger';

const allowedOrigins = config.ALLOWED_ORIGINS
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests without origin (mobile apps, curl, same-origin)
    if (!origin) {
      return callback(null, true);
    }

    // Check whitelist
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Deny
    logger.warn('[SECURITY] CORS violation', { origin, path: origin });
    return callback(new Error('CORS policy violation'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-organization-id',
    'x-request-id',
  ],
  exposedHeaders: [
    'X-Cache',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],
  maxAge: 86400, // 24h
});


// ═══════════════════════════════════════════════════════════════════════════════
// 5. MIDDLEWARE - HTTPS Enforcement
// ═══════════════════════════════════════════════════════════════════════════════

// backend/middleware/https.ts
import { Request, Response, NextFunction } from 'express';
import { config } from '@/config/env';
import { logger } from '@/utils/logger';

export function httpsRedirect(req: Request, res: Response, next: NextFunction) {
  // In production, enforce HTTPS
  if (config.NODE_ENV === 'production') {
    const isHttps = req.get('x-forwarded-proto') === 'https' || 
                    req.protocol === 'https';
    
    if (!isHttps) {
      logger.warn('[SECURITY] HTTP request in production', { 
        path: req.path,
        ip: req.ip 
      });
      
      return res.redirect(301, `https://${req.get('host')}${req.url}`);
    }
  }
  
  next();
}

export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // HSTS: Force HTTPS for 1 year + subdomains
  res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // X-Content-Type-Options: Prevent MIME sniffing
  res.set('X-Content-Type-Options', 'nosniff');
  
  // X-Frame-Options: Prevent clickjacking
  res.set('X-Frame-Options', 'DENY');
  
  // X-XSS-Protection: Legacy XSS filter
  res.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer-Policy
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // CSP: Content Security Policy
  res.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
  );
  
  next();
}


// ═══════════════════════════════════════════════════════════════════════════════
// 6. MIDDLEWARE - Rate Limiting (Global + Per-User)
// ═══════════════════════════════════════════════════════════════════════════════

// backend/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import { Request, Response } from 'express';
import { logger } from '@/utils/logger';
import { config } from '@/config/env';

const redisClient = createClient({
  host: config.REDIS_HOST,
  port: parseInt(config.REDIS_PORT),
});

redisClient.on('error', (err) => {
  logger.error('[ERROR] Redis connection failed:', err);
});

// Global limiter: 100 requests per 15 minutes
export const globalLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient as any,
    prefix: 'rl:global:',
  }),
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    // Skip health checks
    return req.path === '/health';
  },
});

// Strict limiter: 5 requests per minute for sensitive operations
export const strictLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient as any,
    prefix: 'rl:strict:',
  }),
  windowMs: 60 * 1000,
  max: 5,
  skipSuccessfulRequests: false,
  message: 'Too many requests, try again later',
  onLimitReached: (req: Request) => {
    const userId = (req as any).user?.userId || req.ip;
    logger.warn('[SECURITY] Rate limit reached', { 
      userId, 
      path: req.path,
      ip: req.ip 
    });
  },
});

// Login limiter: 10 attempts per 15 minutes
export const loginLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient as any,
    prefix: 'rl:login:',
  }),
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, try again later',
  onLimitReached: (req: Request) => {
    const email = req.body?.email || 'unknown';
    logger.error('[SECURITY] Brute force attempt', { 
      email, 
      ip: req.ip 
    });
  },
});


// ═══════════════════════════════════════════════════════════════════════════════
// 7. MIDDLEWARE - Authentication (JWT Verification)
// ═══════════════════════════════════════════════════════════════════════════════

// backend/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { jwtManager, TokenPayload } from '@/config/jwt';
import { logger } from '@/utils/logger';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      requestId?: string;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    logger.warn('[SECURITY] Missing authorization header', { 
      path: req.path,
      ip: req.ip 
    });
    return res.status(401).json({ 
      error: 'Missing or invalid Authorization header',
      errorId: req.requestId,
    });
  }

  const token = authHeader.slice(7);
  const payload = jwtManager.verifyToken(token);

  if (!payload) {
    logger.warn('[SECURITY] Invalid or expired token', { 
      path: req.path,
      ip: req.ip 
    });
    return res.status(401).json({ 
      error: 'Invalid or expired token',
      errorId: req.requestId,
    });
  }

  // Attach user to request
  req.user = payload;
  next();
}


// ═══════════════════════════════════════════════════════════════════════════════
// 8. MIDDLEWARE - Authorization (Role-Based Access Control)
// ═══════════════════════════════════════════════════════════════════════════════

// backend/middleware/authorize.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

export enum Permission {
  ANIMALS_READ = 'animals:read',
  ANIMALS_CREATE = 'animals:create',
  ANIMALS_UPDATE = 'animals:update',
  ANIMALS_DELETE = 'animals:delete',
  CROPS_READ = 'crops:read',
  CROPS_CREATE = 'crops:create',
  CROPS_UPDATE = 'crops:update',
  CROPS_DELETE = 'crops:delete',
  ADMIN_USERS = 'admin:users',
  ADMIN_SETTINGS = 'admin:settings',
}

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  user: [
    Permission.ANIMALS_READ,
    Permission.CROPS_READ,
  ],
  manager: [
    Permission.ANIMALS_READ,
    Permission.ANIMALS_CREATE,
    Permission.ANIMALS_UPDATE,
    Permission.CROPS_READ,
    Permission.CROPS_CREATE,
    Permission.CROPS_UPDATE,
  ],
  admin: Object.values(Permission),
};

export function authorize(...requiredPermissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      logger.warn('[SECURITY] Missing user in request', { path: req.path });
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get primary role
    const primaryRole = req.user.roles[0];
    const userPermissions = ROLE_PERMISSIONS[primaryRole] || [];

    // Check if user has all required permissions
    const hasPermission = requiredPermissions.every(
      p => userPermissions.includes(p)
    );

    if (!hasPermission) {
      logger.warn('[SECURITY] Unauthorized access attempt', { 
        userId: req.user.userId,
        requiredPermissions,
        userRole: primaryRole,
        path: req.path,
      });
      return res.status(403).json({ 
        error: 'Forbidden',
        errorId: req.requestId,
      });
    }

    next();
  };
}


// ═══════════════════════════════════════════════════════════════════════════════
// 9. MIDDLEWARE - Input Validation
// ═══════════════════════════════════════════════════════════════════════════════

// backend/validators/index.ts
import { body, param, validationResult, ValidationError } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateLoginRequest = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be 8-128 characters'),
];

export const validateAnimalCreate = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2-100 characters')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Name contains invalid characters'),
  
  body('species')
    .isIn(['cattle', 'sheep', 'goat', 'chicken', 'pig'])
    .withMessage('Invalid species'),
  
  body('weight')
    .isFloat({ min: 1, max: 2000 })
    .withMessage('Weight must be 1-2000 kg'),
  
  body('birthDate')
    .isISO8601()
    .withMessage('Invalid date format'),
];

export const validateResourceId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid resource ID'),
];

export function handleValidationErrors(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    logger.warn('[VALIDATION] Input validation failed', { 
      path: req.path,
      errors: errors.array().map(e => ({
        field: (e as any).path || (e as ValidationError).param,
        message: e.msg,
      })),
    });

    return res.status(400).json({
      error: 'Validation failed',
      errorId: req.requestId,
      details: errors.array().map(e => ({
        field: (e as any).path || (e as ValidationError).param,
        message: e.msg,
      })),
    });
  }

  next();
}


// ═══════════════════════════════════════════════════════════════════════════════
// 10. MIDDLEWARE - Error Handler (Safe + Logged)
// ═══════════════════════════════════════════════════════════════════════════════

// backend/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import * as Sentry from '@sentry/node';

interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errorId = `ERR-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  // 1. Log detailed error (backend only)
  logger.error('[ERROR] Unhandled error', {
    errorId,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.userId,
    ip: req.ip,
  });

  // 2. Report to Sentry
  if (err.isOperational) {
    Sentry.captureException(err, {
      tags: { errorId, userId: req.user?.userId },
    });
  }

  // 3. Determine HTTP status
  let statusCode = err.statusCode || 500;
  let userMessage = 'An error occurred. Please try again later.';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    userMessage = 'Invalid input';
  } else if (err.name === 'UnauthorizedError' || err.message === 'Unauthorized') {
    statusCode = 401;
    userMessage = 'Unauthorized';
  } else if (err.name === 'ForbiddenError' || err.message === 'Forbidden') {
    statusCode = 403;
    userMessage = 'Forbidden';
  }

  // 4. Return safe error (NEVER stack trace)
  res.status(statusCode).json({
    error: userMessage,
    errorId,
  });
}


// ═══════════════════════════════════════════════════════════════════════════════
// 11. LOGGER - Structured Logging
// ═══════════════════════════════════════════════════════════════════════════════

// backend/utils/logger.ts
import winston from 'winston';
import { config } from '@/config/env';

export const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'herboferme-api' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
  ],
});

if (config.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// 12. SERVER - Express Application Setup
// ═══════════════════════════════════════════════════════════════════════════════

// backend/server.ts
import express from 'express';
import helmet from 'helmet';
import { config } from '@/config/env';
import { corsMiddleware } from '@/middleware/cors';
import { httpsRedirect, securityHeaders } from '@/middleware/https';
import { globalLimiter, loginLimiter } from '@/middleware/rateLimiter';
import { authenticate } from '@/middleware/auth';
import { errorHandler } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { connectDB } from '@/config/db';
import authRoutes from '@/routes/auth';
import animalsRoutes from '@/routes/animals';

const app = express();

// ────────────────────────────────────────────
// Security: Transport Layer
// ────────────────────────────────────────────
app.use(httpsRedirect);
app.use(helmet());
app.use(corsMiddleware);
app.use(securityHeaders);

// ────────────────────────────────────────────
// Parsing & Request ID
// ────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  const requestId = req.get('x-request-id') || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  req.requestId = requestId;
  res.set('x-request-id', requestId);
  next();
});

// ────────────────────────────────────────────
// Rate Limiting
// ────────────────────────────────────────────
app.use('/api/', globalLimiter);

// ────────────────────────────────────────────
// Health Check (skip rate limit)
// ────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ────────────────────────────────────────────
// Routes
// ────────────────────────────────────────────
app.use('/api/auth', loginLimiter, authRoutes);
app.use('/api/animals', authenticate, animalsRoutes);

// ────────────────────────────────────────────
// 404 Handler
// ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ────────────────────────────────────────────
// Error Handler (Last middleware!)
// ────────────────────────────────────────────
app.use(errorHandler);

// ────────────────────────────────────────────
// Start Server
// ────────────────────────────────────────────
async function start() {
  try {
    // Connect to database
    await connectDB();
    logger.info('✅ Database connected');

    // Start server
    const PORT = parseInt(config.PORT);
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`✅ Server running on port ${PORT}`);
    });
  } catch (err) {
    logger.error('❌ Server startup failed:', err);
    process.exit(1);
  }
}

start();

export default app;
