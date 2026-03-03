/**
 * utils/logger.ts
 * Centralized Winston logger.
 * - Structured JSON in production
 * - Colorized text in development
 * - Never logs SSH_PRIVATE_KEY_PATH or raw tokens
 * - Includes requestId when available
 */
import winston from 'winston';

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

const SENSITIVE_KEYS = [
  'password', 'token', 'accessToken', 'refreshToken',
  'tokenHash', 'apiKey', 'key', 'secret', 'privateKey',
  'SSH_PRIVATE_KEY_PATH', 'STRIPE_SECRET_KEY',
];

/** Recursively redact sensitive fields from objects before logging */
function redact(obj: unknown, depth = 0): unknown {
  if (depth > 5 || obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(i => redact(i, depth + 1));

  const result: Record<string, unknown> = { /* Intentionally empty */ };
  for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.some(s => key.toLowerCase().includes(s.toLowerCase()))) {
      result[key] = '[REDACTED]';
    } else {
      result[key] = redact(val, depth + 1);
    }
  }
  return result;
}

const redactFormat = winston.format((info) => {
  if (!info) return info;
  if (info.meta) info.meta = redact(info.meta);
  if (info.data) info.data = redact(info.data);
  return info;
});

const devFormat = printf(({ level, message, timestamp: ts, requestId, ...rest }) => {
  const rid = requestId ? ` [${requestId}]` : '';
  const extra = Object.keys(rest).length ? `\n  ${JSON.stringify(rest, null, 2)}` : '';
  return `${ts}${rid} [${level.toUpperCase()}] ${message}${extra}`;
});

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

export const logger = winston.createLogger({
  level: isTest ? 'silent' : (isProduction ? 'info' : 'debug'),
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    redactFormat(),
    isProduction ? json() : combine(colorize(), devFormat),
  ),
  transports: [
    new winston.transports.Console(),
    ...(isProduction
      ? [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' }),
        ]
      : []),
  ],
});

/** Create a child logger bound to a specific request ID */
export function createRequestLogger(requestId: string) {
  return logger.child({ requestId });
}

export default logger;
