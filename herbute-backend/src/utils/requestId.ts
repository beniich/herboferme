/**
 * middleware/requestId.ts
 * Generates a UUID v4 per request, attaches to req.id and x-request-id header.
 * Used by error handler and logger for full request tracing.
 */
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = (req.headers['x-request-id'] as string) || uuidv4();
  req.id = id;
  res.setHeader('x-request-id', id);
  next();
}
