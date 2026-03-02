/**
 * routes/events.ts
 * Server-Sent Events / Saga event handler.
 * Moved from index.ts to avoid inline require() and keep app clean.
 *
 * GET /api/events/:channel â†’ SSE stream for real-time updates
 * POST /api/events/notify  â†’ Internal: trigger notification event (dev only)
 */
import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/security.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

const router = Router();

// In-memory client store (replace with Redis pub/sub in production)
type SseClient = { userId: string; orgId?: string; res: Response };
const clients = new Map<string, SseClient>();

/* â”€â”€ GET /api/events/stream â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
router.get(
  '/stream',
  authenticate,
  (req: Request, res: Response) => {
    const userId = req.user!.sub as string;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    res.flushHeaders();

    // Send initial connected event
    res.write(`data: ${JSON.stringify({ type: 'connected', userId })}\n\n`);

    const clientId = `${userId}-${Date.now()}`;
    const clientData: SseClient = { userId, res };
    if (req.user!.orgId) clientData.orgId = req.user!.orgId;
    clients.set(clientId, clientData);

    logger.info('[events] SSE client connected', { requestId: req.id, userId, clientId });

    // Heartbeat every 30s to keep connection alive
    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 30_000);

    req.on('close', () => {
      clearInterval(heartbeat);
      clients.delete(clientId);
      logger.info('[events] SSE client disconnected', { clientId });
    });
  },
);

/* â”€â”€ POST /api/events/notify (internal / dev only) â”€â”€ */
router.post(
  '/notify',
  asyncHandler(async (req: Request, res: Response) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).json({ error: 'Not found' });
    }

    const { orgId, event, data } = req.body;
    let sent = 0;

    for (const [, client] of clients) {
      if (!orgId || client.orgId === orgId) {
        client.res.write(`data: ${JSON.stringify({ event, data })}\n\n`);
        sent++;
      }
    }

    return sendSuccess(res, { sent }, 200, req.id);
  }),
);

/** Broadcast to all clients in an org â€” called from other services */
export function broadcastToOrg(orgId: string, event: string, data: unknown): void {
  for (const [, client] of clients) {
    if (client.orgId === orgId) {
      client.res.write(`data: ${JSON.stringify({ event, data })}\n\n`);
    }
  }
}

export default router;
