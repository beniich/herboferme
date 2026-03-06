/**
 * utils/apiResponse.ts
 * Standardized response shapes for all API endpoints.
 * Every response follows: { success, data|error, code, timestamp, requestId }
 */
import { Response } from 'express';

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  timestamp: string;
  requestId?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
  fields?: Record<string, string>;
  timestamp: string;
  requestId?: string;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  requestId?: string,
): Response {
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    ...(requestId ? { requestId } : {}),
  };
  return res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  message: string,
  code: string,
  statusCode = 400,
  requestId?: string,
  fields?: Record<string, string>,
): Response {
  const body: ApiErrorResponse = {
    success: false,
    error: message,
    code,
    timestamp: new Date().toISOString(),
    ...(requestId ? { requestId } : {}),
    ...(fields ? { fields } : {}),
  };
  return res.status(statusCode).json(body);
}

export function validationErrorResponse(
  res: Response,
  errors: Array<{ path: string; msg: string }>,
  requestId?: string,
): Response {
  const fields: Record<string, string> = {};
  for (const err of errors) {
    fields[err.path] = err.msg;
  }
  return sendError(res, 'Validation failed', 'VALIDATION_ERROR', 400, requestId, fields);
}
