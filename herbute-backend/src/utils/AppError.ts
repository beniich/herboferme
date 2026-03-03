/**
 * AppError.ts
 * Custom error class hierarchy for structured, predictable error handling.
 * All operational errors extend AppError so the error handler can distinguish
 * them from unexpected programming errors.
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  /** isOperational = true          safe to expose to client. false          500 internal */
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, code: string, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/*                  Auth Errors (401)                                                                                                                                                                                                                                                          */
export class AuthAppError extends AppError {
  constructor(message = 'Authentication required', code = 'AUTH_REQUIRED') {
    super(message, 401, code);
  }
}

export class TokenExpiredAppError extends AuthAppError {
  constructor() {
    super('Access token has expired', 'AUTH_TOKEN_EXPIRED');
  }
}

export class TokenInvalidAppError extends AuthAppError {
  constructor(message = 'Invalid or malformed token') {
    super(message, 'AUTH_TOKEN_INVALID');
  }
}

export class RefreshTokenError extends AuthAppError {
  constructor(message = 'Invalid or expired refresh token') {
    super(message, 'AUTH_REFRESH_INVALID');
  }
}

export class RefreshTokenReuseError extends AuthAppError {
  constructor() {
    super(
      'Refresh token reuse detected          all sessions have been invalidated for security.',
      'AUTH_REFRESH_REUSE'
    );
  }
}

/*                  Authorization Errors (403)                                                                                                                                                                                  */
export class ForbiddenAppError extends AppError {
  constructor(message = 'You do not have permission to perform this action', code = 'FORBIDDEN') {
    super(message, 403, code);
  }
}

export class SubscriptionError extends ForbiddenAppError {
  constructor(feature: string) {
    super(`Your current plan does not include access to: ${feature}`);
    (this as any).code = 'SUBSCRIPTION_FEATURE_REQUIRED';
  }
}

export class UserLimitError extends ForbiddenAppError {
  constructor() {
    super('Organization has reached its user limit for the current plan');
    (this as any).code = 'SUBSCRIPTION_USER_LIMIT';
  }
}

/*                  Validation Errors (400)                                                                                                                                                                                                          */
export class ValidationAppError extends AppError {
  public readonly fields?: Record<string, string>;

  constructor(message = 'Validation failed', fields?: Record<string, string>) {
    super(message, 400, 'VALIDATION_ERROR');
    this.fields = fields;
  }
}

/*                  Not Found Errors (404)                                                                                                                                                                                                                  */
export class NotFoundAppError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

/*                  API Key Errors                                                                                                                                                                                                                                                                                          */
export class ApiKeyError extends AppError {
  constructor(message = 'Invalid or missing API key') {
    super(message, 401, 'API_KEY_INVALID');
  }
}

/*                  SSH Errors                                                                                                                                                                                                                                                                                                                          */
export class SshAppError extends AppError {
  constructor(message = 'SSH operation failed') {
    // isOperational=true but never expose SSH details in message
    super(message, 500, 'SSH_ERROR');
  }
}

/*                  Rate Limit (429)                                                                                                                                                                                                                                                                          */
export class RateLimitError extends AppError {
  constructor(message = 'Too many requests          please try again later') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}
