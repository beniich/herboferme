import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from '../config/redis.js';

// 1. GENERAL API LIMITER (100 req/15min)
export const globalLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    prefix: 'rl:global:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Trop de requêtes, essayez plus tard',
  standardHeaders: true, // Return RateLimit-* headers
  legacyHeaders: false,
});

// 2. STRICT RATE LIMITER pour endpoints sensibles
export const strictLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    prefix: 'rl:strict:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requêtes/min
  skipSuccessfulRequests: false,
  keyGenerator: (req: any) => req.user?.id || req.ip || 'unknown', // Par utilisateur ou IP
});

// 3. LOGIN RATE LIMITER (10 essais/15min → blocage temporaire)
export const loginLimiter = rateLimit({
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
});
