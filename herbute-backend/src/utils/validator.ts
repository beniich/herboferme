/**
 * middleware/validator.ts
 * Wraps express-validator's validationResult into a consistent response.
 * Usage: router.post('/route', [...validationChains], validate, handler)
 */
import { Request, Response, NextFunction } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { validationErrorResponse } from '../utils/apiResponse.js';

/** Run validation chains and return 400 if any fail */
export function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map(err => ({
      path: (err as any).path || (err as any).param || 'unknown',
      msg: err.msg,
    }));
    validationErrorResponse(res, formatted, req.id);
    return;
  }
  next();
}

/** Helper to run validation chains in middleware array */
export function validateBody(chains: ValidationChain[]) {
  return [...chains, validate];
}
