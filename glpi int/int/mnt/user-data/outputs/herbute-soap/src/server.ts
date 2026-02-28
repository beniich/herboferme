/**
 * ═══════════════════════════════════════════════════════════════
 * server.ts — Herbute Backend (REST + SOAP coexistants)
 * ═══════════════════════════════════════════════════════════════
 *
 * Routage final :
 *
 *   ┌─────────────────────────────────────────────┐
 *   │  Browser / Mobile / Next.js                 │
 *   │  → axios withCredentials: true              │
 *   └──────────────┬──────────────────────────────┘
 *                  │
 *   ┌──────────────▼──────────────────────────────┐
 *   │  Herbute Backend Express (:2065)            │
 *   │                                             │
 *   │  REST  →  /api/auth/*       JSON            │
 *   │  REST  →  /api/fleet/*      JSON            │
 *   │  REST  →  /api/hr/*         JSON            │
 *   │  REST  →  /api/planning/*   JSON            │
 *   │                                             │
 *   │  SOAP  →  POST /soap/auth   XML Envelope    │
 *   │  WSDL  →  GET  /soap/auth?wsdl              │
 *   │  Docs  →  GET  /soap/auth/docs  HTML        │
 *   └─────────────────────────────────────────────┘
 */

import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import mongoose from 'mongoose';

// Routes REST (inchangées)
import authRoutes     from './routes/auth.routes';
import fleetRoutes    from './routes/fleet.routes';
import hrRoutes       from './routes/hr.routes';
import planningRoutes from './routes/planning.routes';

// Montage SOAP (nouveau)
import { mountSoapService } from './soap/soap.mount';

// Validation clés JWT au démarrage
import './config/jwt';

const app  = express();
const PORT = parseInt(process.env.PORT || '2065', 10);

// ─────────────────────────────────────────────
// Connexion MongoDB
// ─────────────────────────────────────────────
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI non définie');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log(`✅ MongoDB : ${mongoose.connection.host}`);
};

// ─────────────────────────────────────────────
// Middlewares Express (identiques à avant)
// ─────────────────────────────────────────────
app.set('trust proxy', 1);

app.use(helmet({ crossOriginEmbedderPolicy: false }));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',').map(o => o.trim());

app.use(cors({
  origin: (origin, cb) =>
    !origin || allowedOrigins.includes(origin) ? cb(null, true) : cb(new Error('CORS: non autorisé')),
  credentials:    true,
  allowedHeaders: ['Content-Type', 'Authorization', 'SOAPAction'], // ← SOAPAction requis pour SOAP
  methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ⚠️  IMPORTANT : strong-soap a besoin de lire le body XML brut
//     On active le parser text/xml AVANT les routes SOAP
app.use('/soap', express.text({ type: ['text/xml', 'application/soap+xml'], limit: '5mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

app.use(rateLimit({
  windowMs: 15 * 60 * 1000, max: 200,
  message: { error: 'Trop de requêtes.' },
}));

// ─────────────────────────────────────────────
// Routes REST
// ─────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/fleet',    fleetRoutes);
app.use('/api/hr',       hrRoutes);
app.use('/api/planning', planningRoutes);

// ─────────────────────────────────────────────
// Health check (affiche maintenant les deux protocoles)
// ─────────────────────────────────────────────
app.get('/health', (_, res) => {
  res.json({
    status:    'ok',
    service:   'herbute-backend',
    protocols: ['REST (JSON)', 'SOAP 1.2 (XML)'],
    endpoints: {
      rest: {
        auth:     '/api/auth/*',
        fleet:    '/api/fleet/*',
        hr:       '/api/hr/*',
        planning: '/api/planning/*',
      },
      soap: {
        endpoint: '/soap/auth',
        wsdl:     '/soap/auth?wsdl',
        docs:     '/soap/auth/docs',
      },
    },
    db:        mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime:    process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────────
// Gestionnaire d'erreurs global
// ─────────────────────────────────────────────
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Données invalides', details: Object.values(err.errors).map((e: any) => e.message) });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'champ';
    return res.status(409).json({ error: `${field} déjà utilisé.` });
  }
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Erreur interne.' : err.message,
  });
});

// ─────────────────────────────────────────────
// Démarrage — SOAP nécessite un http.Server natif
// (pas directement app.listen)
// ─────────────────────────────────────────────
const start = async () => {
  await connectDB();

  // ⚠️  Créer le serveur HTTP natif AVANT de monter SOAP
  //     strong-soap s'accroche au niveau du serveur HTTP,
  //     pas au niveau Express, pour intercepter les raw TCP streams
  const httpServer = http.createServer(app);

  // Monter le service SOAP sur le serveur HTTP
  mountSoapService(app, httpServer as any, {
    path:    '/soap/auth',
    verbose: process.env.NODE_ENV !== 'production',
  });

  httpServer.listen(PORT, () => {
    console.log(`\n🌿 Herbute Backend démarré`);
    console.log(`   Port     : ${PORT}`);
    console.log(`   REST     : http://localhost:${PORT}/api/auth/login`);
    console.log(`   SOAP     : http://localhost:${PORT}/soap/auth`);
    console.log(`   WSDL     : http://localhost:${PORT}/soap/auth?wsdl`);
    console.log(`   Docs     : http://localhost:${PORT}/soap/auth/docs`);
    console.log(`   Health   : http://localhost:${PORT}/health\n`);
  });
};

process.on('SIGTERM', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

start().catch(err => {
  console.error('❌ Erreur démarrage:', err);
  process.exit(1);
});

export default app;
