import express, { Response } from 'express';
import { authenticate as auth } from '../middleware/security.js';
import { requireOrganization, requireRole } from '../middleware/security.js';
import { healthService } from '../services/healthService.js';
import { AuthenticatedRequest } from '../types/request.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// DevOps routes require highest privileges
router.use(auth, requireOrganization, requireRole(['OWNER', 'ADMIN']));

/**
 * GET /api/devops/services/health
 * Get health status of microservices
 */
router.get('/services/health', asyncHandler(async (req: any, res: Response) => {
  try {
    const services = await healthService.getServicesHealth();
    const metrics = healthService.getSystemMetrics();

    res.json({
      success: true,
      data: {
        services,
        metrics,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}));

/**
 * GET /api/devops/services/:id/restart
 * Restart a microservice (Simulated)
 */
router.post('/services/:id/restart', asyncHandler(async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    // Mock restart logic
    await new Promise((resolve) => setTimeout(resolve, 2000));

    res.json({
      success: true,
      message: `Service ${id} restarted successfully.`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}));

export default router;
