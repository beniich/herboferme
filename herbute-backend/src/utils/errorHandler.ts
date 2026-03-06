/**
 * errorHandler.ts
 * Central error handling middleware â€” MUST be the last app.use() in index.ts.
 *
 * Handles:
 *   - AppError subclasses (operational)
 *   - express-validator ValidationError
 *   - Mongoose ValidationError
 *   - Mongoose CastError (invalid ObjectId)
 *   - JWT JsonWebTokenError / TokenExpiredError
 *   - Unexpected errors (programming bugs â†’ 500, no leak)
 */
import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import {
  AppError,
  TokenExpiredAppError,
  TokenInvalidAppError,
  ValidationAppError,
} from './AppError.js';
import { sendError } from './apiResponse.js';
import logger from './logger.js';

const isProduction = process.env.NODE_ENV === 'production';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): Response {
  const requestId = (req as any).id as string | undefined;

  /* â”€â”€ 1. AppError (our own operational errors) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  if (err instanceof AppError) {
    if (!isProduction) {
      logger.warn(`[AppError] ${err.code}: ${err.message}`, {
        requestId,
        path: req.path,
        stack: err.stack,
      });
    }
    return sendError(
      res,
      err.message,
      err.code,
      err.statusCode,
      requestId,
      (err as ValidationAppError).fields,
    );
  }

  /* â”€â”€ 2. JWT errors â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  if (err instanceof TokenExpiredError) {
    return sendError(res, 'Access token has expired', 'AUTH_TOKEN_EXPIRED', 401, requestId);
  }
  if (err instanceof JsonWebTokenError) {
    return sendError(res, 'Invalid or malformed token', 'AUTH_TOKEN_INVALID', 401, requestId);
  }

  /* â”€â”€ 3. Mongoose CastError (bad ObjectId) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  if (err instanceof MongooseError.CastError) {
    return sendError(
      res,
      `Invalid ${err.path}: ${err.value}`,
      'VALIDATION_INVALID_ID',
      400,
      requestId,
    );
  }

  /* â”€â”€ 4. Mongoose ValidationError â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  if (err instanceof MongooseError.ValidationError) {
    const fields: Record<string, string> = {};
    for (const [key, val] of Object.entries(err.errors)) {
      fields[key] = val.message;
    }
    return sendError(res, 'Database validation failed', 'VALIDATION_ERROR', 400, requestId, fields);
  }

  /* â”€â”€ 5. Mongoose Duplicate Key (code 11000) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  if ((err as any)?.code === 11000) {
    const field = Object.keys((err as any).keyPattern || {})[0] || 'field';
    return sendError(
      res,
      `A record with this ${field} already exists`,
      'DUPLICATE_KEY',
      409,
      requestId,
    );
  }

  /* â”€â”€ 6. Unexpected / programming errors â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  logger.error('[UnhandledError]', {
    requestId,
    path: req.path,
    method: req.method,
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });

  return sendError(
    res,
    isProduction ? 'An unexpected error occurred' : (err instanceof Error ? err.message : 'Unknown error'),
    'INTERNAL_SERVER_ERROR',
    500,
    requestId,
  );
}

/** Async route wrapper â€” eliminates try/catch boilerplate in every route */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
