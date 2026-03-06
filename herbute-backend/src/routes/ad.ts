import express, { Response } from 'express';
import { authenticate as auth } from '../middleware/security.js';
import { requireAdmin, requireOrganization } from '../middleware/security.js';
import ADSyncLog from '../models/ADSyncLog.js';
import { ActiveDirectoryService } from '../services/adService.js';
import { AuthenticatedRequest } from '../types/request.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const router = express.Router();

// Helper to get AD Config from request/org (Mock for now or from env)
const getADConfig = (_req: any) => ({
  url: process.env.AD_URL || 'ldaps://localhost:636',
  baseDN: process.env.AD_BASE_DN || 'dc=example,dc=com',
  username: process.env.AD_USERNAME || 'admin@example.com',
  password: process.env.AD_PASSWORD || 'password',
});

// Middleware: Auth + Org required
router.use(auth, requireOrganization);

/**
 * GET /api/ad/status
 */
router.get('/status', requireAdmin, asyncHandler(async (req: any, res: Response) => { // Added requireAdmin here
  try {
    const config = getADConfig(req);
    const adService = new ActiveDirectoryService(config);
    const connected = await adService.checkConnection();

    return sendSuccess(res, {
      status: connected ? 'connected' : 'disconnected',
      message: connected ? 'Successfully connected to Active Directory' : 'Failed to connect to Active Directory',
      lastChecked: new Date()
    });
  } catch (error: any) {
    return sendError(res, error.message, 'AD_CONNECTION_ERROR', 500);
  }
}));

/**
 * GET /api/ad/users
 */
router.get('/users', requireAdmin, asyncHandler(async (req: any, res: Response) => {
  try {
    const config = getADConfig(req);
    const adService = new ActiveDirectoryService(config);
    const users = await adService.getAllUsers();
    return sendSuccess(res, { users, count: users.length });
  } catch (error: any) {
    return sendError(res, error.message, 'AD_FETCH_USERS_ERROR', 500);
  }
}));

/**
 * POST /api/ad/sync
 */
router.post('/sync', requireAdmin, asyncHandler(async (req: any, res: Response) => {
  try {
    const config = getADConfig(req);
    const adService = new ActiveDirectoryService(config);

    if (!req.organizationId) {
      return sendError(res, 'Organization context missing', 'ORG_MISSING', 400);
    }

    const results = await adService.syncToMongoDB(req.organizationId);
    
    // Log is already created inside syncToMongoDB usually, but let's be sure or just return results
    return sendSuccess(res, results);
  } catch (error: any) {
    console.error('AD Sync Error:', error);
    return sendError(res, error.message, 'AD_SYNC_ERROR', 500);
  }
}));

/**
 * GET /api/ad/logs
 * Get synchronization history
 */
router.get('/logs', requireAdmin, asyncHandler(async (req: any, res: Response) => {
  try {
    const logs = await ADSyncLog.find({ organizationId: req.organizationId })
      .sort({ createdAt: -1 })
      .limit(10);
    
    return sendSuccess(res, { logs });
  } catch (error: any) {
    return sendError(res, error.message, 'AD_LOGS_ERROR', 500);
  }
}));

export default router;
