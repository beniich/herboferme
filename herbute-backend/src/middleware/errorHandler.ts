   /**
 * @file errorHandler.ts
 * @description Centralized, type-aware global error handler for Express.
 *              Handles: AppError, Mongoose ValidationError, Mongoose CastError,
 *              JWT errors (expired vs invalid), and unknown server errors.
 * @module backend/middleware
 */

import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Error as MongooseError } from 'mongoose';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

interface ErrorResponse {
  success: false;
  error: string;
  code: string;
  timestamp: string;
  requestId?: string;
  details?: unknown;
}

const isDev = process.env.NODE_ENV === 'development';

/**
 * Build a consistent error response envelope.
 */
const buildResponse = (
  error: string,
  code: string,
  requestId?: string,
  details?: unknown
): ErrorResponse => ({
  success: false,
  error,
  code,
  timestamp: new Date().toISOString(),
  ...(requestId ? { requestId } : { /* Intentionally empty */ }),
  ...(details !== undefined ? { details } : { /* Intentionally empty */ }),
});

/**
 * Global Express error handler   must be the LAST middleware registered.
 */
const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
  const requestId = req.id;

  //                  1. Operational AppError
  if (err instanceof AppError) {
    logger.warn(`[ErrorHandler] Operational error ${err.statusCode}/${err.code}: ${err.message}`, {
      requestId,
      path: req.path,
    });
    const details = isDev
      ? ((err as any).details ?? undefined)
      : err.statusCode < 500
        ? ((err as any).details ?? undefined)
        : undefined;

    res.status(err.statusCode).json(buildResponse(err.message, err.code, requestId, details));
    return;
  }

  //                  2. JWT errors
  if (err instanceof jwt.TokenExpiredError) {
    logger.warn(`[ErrorHandler] JWT expired: ${err.message}`, { requestId });
    res
      .status(401)
      .json(
        buildResponse('Token expir       rafra    chissez votre session', 'AUTH_TOKEN_EXPIRED', requestId)
      );
    return;
  }
  if (err instanceof jwt.JsonWebTokenError) {
    logger.warn(`[ErrorHandler] JWT invalid: ${err.message}`, { requestId });
    res.status(401).json(buildResponse('Token invalide', 'AUTH_TOKEN_INVALID', requestId));
    return;
  }

  //                  3. Mongoose ValidationError
  if (err instanceof MongooseError.ValidationError) {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    logger.warn(`[ErrorHandler] Mongoose validation error`, { requestId, details });
    res
      .status(422)
      .json(
        buildResponse('Erreur de validation des donn    es', 'VALIDATION_ERROR', requestId, details)
      );
    return;
  }

  //                  4. Mongoose CastError (invalid ObjectId)
  if (err instanceof MongooseError.CastError) {
    logger.warn(`[ErrorHandler] Mongoose cast error on field '${err.path}': ${err.value}`, {
      requestId,
    });
    res
      .status(400)
      .json(
        buildResponse(`Identifiant invalide pour le champ '${err.path}'`, 'INVALID_ID', requestId)
      );
    return;
  }

  //                  5. Mongoose duplicate key (code 11000)
  const mongoErr = err as any;
  if (mongoErr?.code === 11000) {
    const field = Object.keys(mongoErr.keyPattern ?? { /* Intentionally empty */ })[0] ?? 'champ';
    logger.warn(`[ErrorHandler] Duplicate key on field: ${field}`, { requestId });
    res
      .status(409)
      .json(
        buildResponse(`La valeur du champ '${field}' est d    j    utilis    e`, 'CONFLICT', requestId)
      );
    return;
  }

  //                  6. Express body-parser SyntaxError (malformed JSON)
  if (err instanceof SyntaxError && (err as any).status === 400 && 'body' in err) {
    logger.warn(`[ErrorHandler] Malformed JSON body`, { requestId });
    res
      .status(400)
      .json(buildResponse('Corps de requ    te JSON invalide', 'INVALID_JSON', requestId));
    return;
  }

  //                  7. Unknown / programming error
  const unknownErr = err as Error;
  logger.error(`[ErrorHandler]        Unhandled server error: ${unknownErr?.message ?? 'Unknown'}`, {
    requestId,
    stack: isDev ? unknownErr?.stack : undefined,
    path: req.path,
    method: req.method,
  });

  res
    .status(500)
    .json(
      buildResponse(
        isDev ? (unknownErr?.message ?? 'Erreur interne du serveur') : 'Erreur interne du serveur',
        'INTERNAL_ERROR',
        requestId,
        isDev ? { stack: unknownErr?.stack } : undefined
      )
    );
};


/**
 * Async route wrapper   eliminates try/catch boilerplate in every route.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default errorHandler;

