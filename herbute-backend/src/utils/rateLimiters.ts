/**
 * middleware/rateLimiters.ts
 * All express-rate-limit configurations in one place.
 * Uses in-memory store for development; swap to Redis store in production.
 *
 * Limiters:
 *   authLimiter    â€” 10 req / 15 min  (login, register, password reset)
 *   apiLimiter     â€” 100 req / 15 min (general authenticated API)
 *   sshLimiter     â€” 5 req / 1 hour   (SSH operations â€” very restricted)
 *   webhookLimiter â€” 50 req / 1 min   (Stripe webhook)
 */
import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { sendError } from '../utils/apiResponse.js';

const rateLimitHandler = (req: Request, res: Response): void => {
  sendError(
    res,
    'Too many requests â€” please slow down and try again later.',
    'RATE_LIMIT_EXCEEDED',
    429,
    (req as any).id,
  );
};

/** Auth endpoints: login, register, refresh, forgot-password */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitHandler,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => req.ip ?? 'unknown',
  message: undefined, // handled by handler
});

/** General authenticated API calls */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator: (req) => {
    // Key by user ID if authenticated, else by IP
    const user = (req as any).user;
    return user?.id ?? req.ip ?? 'unknown';
  },
});

/** SSH management â€” extremely restricted */
export const sshLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator: (req) => {
    const user = (req as any).user;
    return `ssh:${user?.id ?? req.ip}`;
  },
});

/** Stripe webhook receiver */
export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator: (req) => req.ip ?? 'unknown',
});
