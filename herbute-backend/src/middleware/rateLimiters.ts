/**
 * @file rateLimiters.ts
 * @description Pre-configured rate limiters to protect the API.
 * @module backend/middleware
 */

import rateLimit from 'express-rate-limit';
import { AppError } from '../utils/AppError.js';

// Base options to ensure standard AppError response for rate limits
const baseLimitOptions = {
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: () => {
    throw new AppError('Trop de requ    tes          r    essayez plus tard', 429, 'RATE_LIMIT_EXCEEDED');
  },
};

/** Global limiter for all API routes (1000 requ    tes / 15 minutes) */
export const globalLimiter = rateLimit({
  ...baseLimitOptions,
  windowMs: 15 * 60 * 1000,
  max: 1000,
});

/** Strict limiter for login/auth endpoints (10 requ    tes / 5 minutes) */
export const authLimiter = rateLimit({
  ...baseLimitOptions,
  windowMs: 5 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true, // Only rate-limit FAILED logins!
});

/** Limiter for heavy endpoints / exports (30 requ    tes / minute) */
export const exportLimiter = rateLimit({
  ...baseLimitOptions,
  windowMs: 60 * 1000,
  max: 30,
});
