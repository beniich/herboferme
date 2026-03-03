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
import { compressionMiddleware } from './middleware/compression.js';
import { cacheMiddleware, CACHE_TTL } from './middleware/cache.js';
// Config (charge et valide les clés JWT RS256 au démarrage)
import './config/jwt.js';
import { mountSoapService } from './routes/soap.mount.js';

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
import complaintRoutes from './modules/complaint/complaint.routes.js';
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
import billingRoutes from './routes/billing.routes.js';
import glpiRoutes from './routes/glpi.routes.js';
import membersRoutes from './routes/members.js';
import animalsRoutes from './modules/agro/animals.routes.js';
import cropsRoutes from './modules/agro/crops.routes.js';
import financeRoutes from './modules/agro/finance.routes.js';
import irrigationRoutes from './modules/agro/irrigation.routes.js';
import infrastructureRoutes from './routes/infrastructure.js';
import agentReportsRoutes from './routes/reports.agent.js';
import { scheduleRecurringJobs } from './services/agent/queue.service.js';

// Validate environment
envValidator();

const app = express();
const httpServer = createServer(app);

// Webhook de Stripe AVANT express.json()
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser() as any);
app.use(requestId as any);
app.use(securityHeaders as any);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:2070')
      .split(',')
      .map(o => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-organization-id'],
  })
);

app.use(compressionMiddleware as any);
app.use('/api/', globalLimiter);
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

// Billing & Subscriptions
app.use('/api/billing', billingRoutes);

// GLPI integration
app.use('/api/glpi', glpiRoutes);

// Organization Members (routes /api/organizations/:orgId/members)
app.use('/api', membersRoutes);

// Agricultural domain routes
app.use('/api/animals', animalsRoutes);
app.use('/api/crops', cropsRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/irrigation', irrigationRoutes);
app.use('/api/infrastructure', infrastructureRoutes);

// Agent IA — rapports & analyses
app.use('/api/reports', agentReportsRoutes);

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
    httpServer.listen(PORT, '0.0.0.0', async () => {
      logger.info(`✅ API Herbute écoute sur le port ${PORT} (0.0.0.0)`);
      // Monter le service SOAP une fois le serveur HTTP prêt
      try {
        mountSoapService(app, httpServer);
        logger.info('✅ Service SOAP Herbute monté avec succès');
      } catch (soapErr) {
        logger.error('❌ Échec montage SOAP:', soapErr);
      }
      // Planifier les jobs IA (BullMQ — nécessite Redis)
      scheduleRecurringJobs().catch(err =>
        logger.warn('[Queue] Jobs IA non planifiés (Redis indisponible?):', err.message)
      );
    });
  } catch (err) {
    logger.error('âŒ Ã‰chec dÃ©marrage serveur Herbute', err);
    process.exit(1);
  }
};

start();
