import express, { Response } from 'express';
import { authenticate as auth } from '../middleware/security.js';
import { requireAdmin, requireOrganization } from '../middleware/security.js';
import ADSyncLog from '../models/ADSyncLog.js';
import { ActiveDirectoryService } from '../services/adService.js';
import { AuthenticatedRequest } from '../types/request.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Middleware: Auth + Org + Admin required for AD operations
router.use(auth, requireOrganization, requireAdmin);

const getADConfig = (req: AuthenticatedRequest) => {
  // TODO: Fetch from Organization model settings
  // For now verify env vars
  return {
    url: process.env.AD_URL || 'ldaps://localhost:636',
    baseDN: process.env.AD_BASE_DN || 'dc=example,dc=com',
    username: process.env.AD_USERNAME || 'admin@example.com',
    password: process.env.AD_PASSWORD || 'password',
  };
};

// GET /api/ad/status - Check AD connection
router.get('/status', asyncHandler(async (req: any, res: Response) => {
  try {
    const config = getADConfig(req);
    const adService = new ActiveDirectoryService(config);
    const connected = await adService.checkConnection();

    if (connected) {
      res.json({ status: 'connected', message: 'Successfully connected to Active Directory' });
    } else {
      res
        .status(503)
        .json({ status: 'disconnected', message: 'Failed to connect to Active Directory' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// GET /api/ad/users - List AD users (live query)
router.get('/users', asyncHandler(async (req: any, res: Response) => {
  try {
    const config = getADConfig(req);
    const adService = new ActiveDirectoryService(config);
    const users = await adService.getAllUsers();
    res.json({ users, count: users.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

// POST /api/ad/sync - Sync AD users to MongoDB
router.post('/sync', asyncHandler(async (req: any, res: Response) => {
  try {
    const config = getADConfig(req);
    const adService = new ActiveDirectoryService(config);

    // Check connection first
    const connected = await adService.checkConnection();
    if (!connected) {
      return res.status(503).json({ error: 'Cannot sync: AD is unreachable' });
    }

    if (!req.organizationId) {
      return res.status(400).json({ error: 'Organization context missing' });
    }

    const results = await adService.syncToMongoDB(req.organizationId);
    res.json(results);
  } catch (error: any) {
    console.error('AD Sync Error:', error);
    res.status(500).json({ error: error.message });
  }
}));

// GET /api/ad/logs - Get sync logs
router.get('/logs', asyncHandler(async (req: any, res: Response) => {
  try {
    const logs = await ADSyncLog.find({ organizationId: req.organizationId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ logs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}));

export default router;
