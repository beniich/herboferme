import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import { createServer } from 'http';
import path from 'path';
import { connectDB } from './config/db.js';
import { envValidator } from './config/envValidator.js';
import errorHandler from './middleware/errorHandler.js';
import { globalLimiter } from './middleware/rateLimiters.js';
import { requestId } from './middleware/requestId.js';
import { securityHeaders } from './middleware/security.js';
import { logger } from './utils/logger.js';

// Auth
import authRoutes from './routes/auth.js';
import googleAuthRoutes from './routes/googleAuth.js';

// Consolidated Domain Routes
import hrRoutes from './routes/hr.js';
import planningRoutes from './routes/planning.js';
import fleetRoutes from './routes/fleet.js';

// Other domain routes
import feedbackRoutes from './routes/feedback.js';
import knowledgeRoutes from './routes/knowledge.js';
import messageRoutes from './routes/messages.js';
import uploadRoutes from './routes/upload.js';
import inventoryRoutes from './routes/inventory.js';
import complaintRoutes from './routes/complaints.js';
import itTicketRoutes from './routes/it-tickets.js';
import itAssetRoutes from './routes/it-assets.js';
import teamRoutes from './routes/teams.js';
import organizationRoutes from './routes/organizations.js';
import userRoutes from './routes/admin.js';
import auditRoutes from './routes/audit.js';
import apiKeyRoutes from './routes/api-keys.js';
// notifications route not yet implemented — removed to fix TS2307
import analyticsRoutes from './routes/analytics.js';
import dashboardRoutes from './routes/dashboard.js';

// Validate environment
envValidator();

const app = express();
const httpServer = createServer(app);

// Security middleware
app.use(requestId);
app.use(securityHeaders);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean) || [];
      // Allow requests with no origin (like mobile apps or curl requests)
      // or check against the whitelist
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use('/api/', globalLimiter);
app.use(cookieParser()); // Indispensable pour lire req.cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);

// Fleet / Vehicle management
app.use('/api/fleet', fleetRoutes);

// HR / Workforce (Consolidated: staff, roster, leave)
app.use('/api/hr', hrRoutes);

// Planning / Operations (Consolidated: planning, scheduler, interventions)
app.use('/api/planning', planningRoutes);

// Communication & knowledge
app.use('/api/messages', messageRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/feedback', feedbackRoutes);

// IT Management (Unified Helpdesk)
app.use('/api/admin/it/tickets', itTicketRoutes);
app.use('/api/admin/it/assets', itAssetRoutes);

// Operations & Inventory
app.use('/api/inventory', inventoryRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/teams', teamRoutes);

// Admin & System
app.use('/api/organizations', organizationRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/admin/audit-logs', auditRoutes);
app.use('/api/admin/security/api-keys', apiKeyRoutes);
// app.use('/api/notifications', notificationRoutes); // not yet implemented
app.use('/api/analytics', analyticsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Upload
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'Herbute API' });
});

// Error handler
app.use(errorHandler);

const start = async () => {
  try {
    await connectDB();

    const PORT = parseInt(process.env.PORT || '2065', 10);
    httpServer.listen(PORT, '0.0.0.0', () => {
      logger.info(`✅ API Herbute écoute sur le port ${PORT} (0.0.0.0)`);
    });
  } catch (err) {
    logger.error('âŒ Ã‰chec dÃ©marrage serveur Herbute', err);
    process.exit(1);
  }
};

start();
