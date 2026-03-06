import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from '../config/redis.js';
import { Request, Response, NextFunction } from 'express';

const isEnabled = process.env.ENABLE_RATE_LIMITING === 'true';

const dummyLimiter = (req: Request, res: Response, next: NextFunction) => next();

// 1. GENERAL API LIMITER (100 req/15min)
export const globalLimiter = isEnabled ? rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    prefix: 'rl:global:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Trop de requêtes, essayez plus tard',
  standardHeaders: true, // Return RateLimit-* headers
  legacyHeaders: false,
}) : dummyLimiter;

// 2. STRICT RATE LIMITER pour endpoints sensibles
export const strictLimiter = isEnabled ? rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    prefix: 'rl:strict:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requêtes/min
  skipSuccessfulRequests: false,
  keyGenerator: (req: any) => req.user?.id || req.ip || 'unknown', // Par utilisateur ou IP
}) : dummyLimiter;

// 3. LOGIN RATE LIMITER (10 essais/15min → blocage temporaire)
export const loginLimiter = isEnabled ? rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    prefix: 'rl:login:',
  }),
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true, // Reset après succès
  message: 'Trop de tentatives échouées. Réessayez dans 15 minutes',
  handler: (req: any, res: any) => {
    console.error(`[SECURITY] Brute force attempt: ${req.ip} - ${req.body?.email || 'Unknown'}`);
    res.status(429).json({ error: 'Trop de tentatives échouées. Réessayez dans 15 minutes' });
  },
}) : dummyLimiter;
// 4. Alias for backward compatibility / specific imports
export const authLimiter = loginLimiter;
