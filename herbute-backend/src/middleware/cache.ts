import { Request, Response, NextFunction } from 'express';

interface CacheEntry { data: unknown; expiresAt: number; }
const memStore = new Map<string, CacheEntry>();

// Nettoyage automatique toutes les 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memStore) {
    if (entry.expiresAt < now) memStore.delete(key);
  }
}, 300_000);

let redis: any = null;
(async () => {
  try {
    const { createClient } = await import('redis');
    redis = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
    redis.on('error', (err: Error) => { console.warn('[Cache] Redis error:', err.message); redis = null; });
    await redis.connect();
    console.log('[Cache] ✅ Redis connecté');
  } catch {
    console.warn('[Cache] Redis indisponible — cache in-memory actif');
  }
})();

export const CACHE_TTL = {
  financeStats:   600,  // 10 min
  animalStats:    300,  // 5 min
  cropStats:      300,  // 5 min
  irrigationStats:180,  // 3 min
  dashboard:      120,  // 2 min
  default:        300,  // 5 min
} as const;

const readCache = async (key: string): Promise<unknown | null> => {
  try {
    if (redis) { const r = await redis.get(key); return r ? JSON.parse(r) : null; }
    const e = memStore.get(key);
    return (e && e.expiresAt > Date.now()) ? e.data : null;
  } catch { return null; }
};

const writeCache = async (key: string, value: unknown, ttl: number): Promise<void> => {
  try {
    if (redis) await redis.setEx(key, ttl, JSON.stringify(value));
    else memStore.set(key, { data: value, expiresAt: Date.now() + ttl * 1000 });
  } catch (err) {
    // Ignore cache write errors
  }
};

export const cacheMiddleware = (ttlSeconds: number = CACHE_TTL.default) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.method !== 'GET') return next();
    const key = `api:${req.originalUrl}`;
    const cached = await readCache(key);
    if (cached !== null) { res.set('X-Cache', 'HIT'); res.json(cached); return; }
    const _json = res.json.bind(res);
    (res as any).json = (body: unknown) => {
      writeCache(key, body, ttlSeconds).catch(() => {});
      res.set('X-Cache', 'MISS');
      return _json(body);
    };
    next();
  };

export const invalidateCache = async (urlPrefix: string): Promise<void> => {
  const prefix = `api:${urlPrefix}`;
  try {
    if (redis) {
      const keys: string[] = await redis.keys(`${prefix}*`);
      if (keys.length) await redis.del(keys);
    } else {
      for (const k of memStore.keys()) if (k.startsWith(prefix)) memStore.delete(k);
    }
  } catch (err) {
    // Ignore cache invalidation errors
  }
};
