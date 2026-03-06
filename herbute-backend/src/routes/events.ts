/**
 * @file events.ts
 * @description HTTP fallback for Saga events if Kafka is disabled.
 * @module backend/routes
 */

import { Request, Response, Router } from 'express';
import { Complaint } from '../modules/complaint/complaint.model.js';
import { logger } from '../utils/logger.js';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { eventType, data } = req.body;
  logger.info(`ðŸ“¥ [Backend HTTP] Received ${eventType} for ${data?.complaintId}`, {
    requestId: req.id,
  });

  try {
    if (eventType === 'COMPLAINT_ASSIGNED') {
      await Complaint.findByIdAndUpdate(data.complaintId, {
        assignedTeamId: data.teamId,
        status: 'en cours',
        updatedAt: new Date(),
      });
      logger.info(`âœ… [Saga HTTP] Complaint ${data.complaintId} updated with Team ${data.teamId}`, {
        requestId: req.id,
      });
    } else if (eventType === 'ASSIGNMENT_FAILED') {
      await Complaint.findByIdAndUpdate(data.complaintId, {
        priority: 'urgent',
        updatedAt: new Date(),
      });
      logger.warn(`â†©ï¸ [Saga HTTP] Complaint ${data.complaintId} priority escalated.`, {
        requestId: req.id,
      });
    }

    res.json({ success: true });
  } catch (e: unknown) {
    const error = e as Error;
    logger.error(`Error in Backend HTTP Event: ${error.message}`, { requestId: req.id });
    res.status(500).json({ error: error.message });
  }
});

export default router;
