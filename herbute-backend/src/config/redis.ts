import { createClient } from 'redis';
import { logger } from '../utils/logger.js';

// Obtenir l'URL redis (généralement redis://127.0.0.1:6379 en local)
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

export const redisClient = createClient({ url: redisUrl });

redisClient.on('error', (err) => logger.error('Redis Client Error', err));
redisClient.on('connect', () => logger.info('Redis Client Connected'));

// Export an initialization function to call on startup
export const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
};
