import cors from 'cors';

// Whitelist de domaines autorisés
const ALLOWED_ORIGINS = {
  development: ['http://localhost:3000', 'http://localhost:2070'],
  staging: ['https://staging.herboferme.com'],
  production: ['https://herboferme.com', 'https://app.herboferme.com'],
};

const allowedOrigins = ALLOWED_ORIGINS[(process.env.NODE_ENV as keyof typeof ALLOWED_ORIGINS) || 'development'] || [];

export const corsConfig = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // 1. Requête sans origin header (mobile app, curl) → ALLOW si origin undefined
    if (!origin && process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    // 2. Vérifier que origin est dans la whitelist
    if (origin && allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // 3. Sinon: DENY
    console.warn(`[CORS] Requête bloquée de: ${origin}`);
    return callback(new Error(`CORS policy: origin ${origin} not allowed`));
  },
  credentials: true, // Autoriser cookies + Authorization header
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization', // JWT token
    'x-organization-id', // Multi-tenant
    'x-request-id', // Tracing
  ],
  exposedHeaders: [
    'X-Cache', // Debugging
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],
  maxAge: 86400, // Cache préflightrequête 24h
};

export const corsMiddleware = cors(corsConfig);
