import { Request, Response, NextFunction } from 'express';
export const cacheMiddleware = (_duration: number) => {
  return (_req: Request, _res: Response, next: NextFunction) => {
    next();
  };
};
export const CACHE_TTL = 3600;
