/**
 * @file requestId.ts
 * @description Injects a unique trace ID into every request for distributed tracing
 *              and easier log correlation.
 * @module backend/middleware
 */

import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const requestId = (req: Request, res: Response, next: NextFunction): void => {
  // If a request ID is passed in headers (e.g., from an API gateway), use it.
  // Otherwise, generate a fresh unique UUID.
  const id = (req.headers['x-request-id'] as string) || uuidv4();

  req.id = id;
  res.setHeader('X-Request-Id', id);

  next();
};
