import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis.js';

export const userRateLimiter = (limits: { [key: string]: number }) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id || (req as any).user?.userId;
    const endpoint = req.path;

    if (!userId) return next();

    const key = `rl:user:${userId}:${endpoint}`;
    const limit = limits[endpoint] || 100;

    const current = await redisClient.incr(key);

    if (current === 1) {
      await redisClient.expire(key, 3600); // Expire après 1h
    }

    res.set({
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': Math.max(0, limit - current).toString(),
      'X-RateLimit-Reset': new Date(Date.now() + 3600000).toISOString(),
    });

    if (current > limit) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: 3600,
      });
    }

    next();
  };
};
