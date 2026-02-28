/**
 * ═══════════════════════════════════════════════════════
 * server.ts — Herbute Backend (Backend Unique)
 * ═══════════════════════════════════════════════════════
 *
 * Architecture : Backend Herbute unifié
 *  - IAM (Auth, Users, Organizations) migré depuis ReclamTrack
 *  - Fleet & Maintenance
 *  - RH Agricole (Staff, Roster, Leaves)
 *  - Planning & Interventions
 *  - Messages & Knowledge Base
 *
 * Sécurité :
 *  - JWT RS256 (clé privée locale, clé publique distribuable)
 *  - Cookies HttpOnly (protège contre XSS)
 *  - Rate limiting, Helmet, CORS strict
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import mongoose from 'mongoose';

// Routes
import authRoutes     from './routes/auth.routes';
import fleetRoutes    from './routes/fleet.routes';
import hrRoutes       from './routes/hr.routes';
import planningRoutes from './routes/planning.routes';

// Config (charge et valide les clés JWT au démarrage)
import './config/jwt';

const app  = express();
const PORT = process.env.PORT || 2065;

// ─────────────────────────────────────────────
// Connexion MongoDB
// ─────────────────────────────────────────────
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI non définie dans .env');

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS:          30000,
  });
  console.log(`✅ MongoDB connecté: ${mongoose.connection.host}`);
};

// ─────────────────────────────────────────────
// Middlewares globaux
// ─────────────────────────────────────────────
app.set('trust proxy', 1); // Nécessaire pour req.ip derrière Nginx/LB

// Sécurité headers HTTP (équivalent Helmet de l'ancien backend)
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Permet les assets externes si nécessaire
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc:     ["'self'", 'data:', 'https:'],
    },
  },
}));

// CORS — Whitelist stricte (équivalent ALLOWED_ORIGINS)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (Postman, scripts server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS: Origine non autorisée: ${origin}`));
  },
  credentials:      true,  // ← REQUIS pour les cookies HttpOnly cross-origin
  allowedHeaders:   ['Content-Type', 'Authorization'],
  exposedHeaders:   ['X-Total-Count'],
  methods:          ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

// Cookie parser (requis pour lire les cookies HttpOnly)
app.use(cookieParser(process.env.COOKIE_SECRET || 'herbute-cookie-secret'));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging HTTP
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Rate limiting global (200 req / 15 min par IP)
app.use(rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             200,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { error: 'Trop de requêtes. Réessayez dans 15 minutes.' },
}));

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/fleet',    fleetRoutes);
app.use('/api/hr',       hrRoutes);
app.use('/api/planning', planningRoutes);

// Health check
app.get('/health', (_, res) => {
  res.json({
    status:   'ok',
    service:  'herbute-backend',
    version:  process.env.npm_package_version || '1.0.0',
    db:       mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime:   process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Route 404
app.use((req, res) => {
  res.status(404).json({
    error: `Route introuvable: ${req.method} ${req.path}`,
    code:  'NOT_FOUND',
  });
});

// ─────────────────────────────────────────────
// Gestionnaire d'erreurs global
// ─────────────────────────────────────────────
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Erreurs CORS
  if (err.message?.startsWith('CORS:')) {
    return res.status(403).json({ error: err.message, code: 'CORS_ERROR' });
  }

  // Erreurs de validation Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e: any) => e.message);
    return res.status(400).json({ error: 'Données invalides', details: errors, code: 'VALIDATION_ERROR' });
  }

  // Doublon MongoDB (email unique, etc.)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'champ';
    return res.status(409).json({ error: `${field} déjà utilisé.`, code: 'DUPLICATE_KEY' });
  }

  // Erreur JWT (ne devrait pas arriver ici, géré dans authenticate)
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token invalide.', code: 'INVALID_TOKEN' });
  }

  console.error(`[ERROR] ${req.method} ${req.path}:`, err);

  res.status(err.statusCode || err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Erreur interne du serveur.'
      : err.message,
    code: 'INTERNAL_ERROR',
  });
});

// ─────────────────────────────────────────────
// Démarrage
// ─────────────────────────────────────────────
const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`\n🌿 Herbute Backend démarré`);
      console.log(`   Port    : ${PORT}`);
      console.log(`   Env     : ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Origins : ${allowedOrigins.join(', ')}`);
      console.log(`   Auth    : JWT RS256 (IAM intégré)`);
      console.log(`   Health  : http://localhost:${PORT}/health\n`);
    });
  } catch (err) {
    console.error('❌ Erreur au démarrage:', err);
    process.exit(1);
  }
};

// Gestion propre de l'arrêt (SIGTERM Docker/PM2)
const shutdown = async (signal: string) => {
  console.log(`\n🛑 ${signal} reçu — Arrêt propre...`);
  await mongoose.connection.close();
  console.log('✅ MongoDB déconnecté. Au revoir.');
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

start();

export default app;
