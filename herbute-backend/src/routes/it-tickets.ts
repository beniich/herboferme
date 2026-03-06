import express, { Response } from 'express';
import { authenticate, requireOrganization } from '../middleware/security.js';
import { authorize, Permission } from '../middleware/authorize.js';
import ITTicket from '../models/ITTicket.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const router = express.Router();

// Appliquer l'authentification et le contexte d'organisation sur toutes les routes
router.use(authenticate as any, requireOrganization as any);

// ──────────────────────────────────────────
// GET /api/it-tickets - Tous les tickets IT
// ──────────────────────────────────────────
router.get('/', 
  authorize(Permission.IT_READ),
  asyncHandler(async (req: any, res: Response) => {
    try {
      const { status, priority, category, assignedTo, requestedBy, search } = req.query;
      const query: any = { organizationId: req.organizationId };

      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (category) query.category = category;
      if (assignedTo) query.assignedTo = assignedTo;
      if (requestedBy) query.requestedBy = requestedBy;

      if (search) {
        query.$or = [
          { title: new RegExp(search as string, 'i') },
          { description: new RegExp(search as string, 'i') },
          { ticketNumber: new RegExp(search as string, 'i') },
        ];
      }

      const tickets = await ITTicket.find(query)
        .populate('requestedBy', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email')
        .populate('relatedAsset', 'name type assetTag')
        .sort({ createdAt: -1 });

      return sendSuccess(res, { tickets, count: tickets.length });
    } catch (error: any) {
      console.error('Error fetching IT tickets:', error);
      return sendError(res, error.message, 'FETCH_TICKETS_ERROR', 500);
    }
  })
);

// ──────────────────────────────────────────
// GET /api/it-tickets/stats - Statistiques
// ──────────────────────────────────────────
router.get('/stats', 
  authorize(Permission.IT_READ),
  asyncHandler(async (req: any, res: Response) => {
    try {
      const stats = {
        total: await ITTicket.countDocuments({ organizationId: req.organizationId }),

        byStatus: await ITTicket.aggregate([
          { $match: { organizationId: req.organizationId } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),

        byPriority: await ITTicket.aggregate([
          { $match: { organizationId: req.organizationId } },
          { $group: { _id: '$priority', count: { $sum: 1 } } },
        ]),

        byCategory: await ITTicket.aggregate([
          { $match: { organizationId: req.organizationId } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
        ]),

        slaBreach: await ITTicket.countDocuments({
          organizationId: req.organizationId,
          'sla.breached': true,
        }),

        avgResolutionTime: await ITTicket.aggregate([
          {
            $match: {
              organizationId: req.organizationId,
              status: { $in: ['resolved', 'closed'] },
              resolvedAt: { $exists: true },
            },
          },
          {
            $project: {
              resolutionTime: {
                $subtract: ['$resolvedAt', '$createdAt'],
              },
            },
          },
          {
            $group: {
              _id: null,
              avgTime: { $avg: '$resolutionTime' },
            },
          },
        ]),
      };

      return sendSuccess(res, { stats });
    } catch (error: any) {
      console.error('Error fetching ticket stats:', error);
      return sendError(res, error.message, 'FETCH_TICKETS_STATS_ERROR', 500);
    }
  })
);

// ──────────────────────────────────────────
// GET /api/it-tickets/:id - Ticket unique
// ──────────────────────────────────────────
router.get('/:id', 
  authorize(Permission.IT_READ),
  asyncHandler(async (req: any, res: Response) => {
    try {
      const ticket = await ITTicket.findOne({
        _id: req.params.id,
        organizationId: req.organizationId,
      })
        .populate('requestedBy', 'firstName lastName email phone')
        .populate('assignedTo', 'firstName lastName email')
        .populate('relatedAsset', 'name type assetTag ipAddress')
        .populate('updates.userId', 'firstName lastName')
        .populate('resolution.resolvedBy', 'firstName lastName');

      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      return sendSuccess(res, { ticket });
    } catch (error: any) {
      console.error('Error fetching ticket:', error);
      return sendError(res, error.message, 'FETCH_TICKET_ERROR', 500);
    }
  })
);

// ──────────────────────────────────────────
// POST /api/it-tickets - Création
// ──────────────────────────────────────────
router.post('/', 
  authorize(Permission.IT_CREATE),
  asyncHandler(async (req: any, res: Response) => {
    try {
      const slaMinutes = {
        critical: { response: 15, resolution: 240 },
        urgent: { response: 30, resolution: 480 },
        high: { response: 120, resolution: 1440 },
        medium: { response: 240, resolution: 4320 },
        low: { response: 480, resolution: 10080 },
      };

      const priority = req.body.priority || 'medium';
      const sla = slaMinutes[priority as keyof typeof slaMinutes];

      const now = new Date();
      const responseDeadline = new Date(now.getTime() + sla.response * 60000);
      const resolutionDeadline = new Date(now.getTime() + sla.resolution * 60000);

      const userId = req.user?.userId || req.user?.id;
      const ticket = await ITTicket.create({
        ...req.body,
        organizationId: req.organizationId,
        requestedBy: userId,
        sla: {
          responseTime: sla.response,
          resolutionTime: sla.resolution,
          responseDeadline,
          resolutionDeadline,
          breached: false,
        },
      });

      const populatedTicket = await ITTicket.findById(ticket._id)
        .populate('requestedBy', 'firstName lastName email')
        .populate('relatedAsset', 'name type assetTag');

      res.status(201).json({ ticket: populatedTicket });
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      res.status(500).json({ error: error.message });
    }
  })
);

// ──────────────────────────────────────────
// PUT /api/it-tickets/:id - Mise à jour
// ──────────────────────────────────────────
router.put('/:id', 
  authorize(Permission.IT_UPDATE),
  asyncHandler(async (req: any, res: Response) => {
    try {
      const updateData: any = { ...req.body };

      if (req.body.status === 'resolved' && !updateData.resolvedAt) {
        updateData.resolvedAt = new Date();
      }
      if (req.body.status === 'closed' && !updateData.closedAt) {
        updateData.closedAt = new Date();
      }

      const ticket = await ITTicket.findOneAndUpdate(
        { _id: req.params.id, organizationId: req.organizationId },
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .populate('requestedBy', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email')
        .populate('relatedAsset', 'name type assetTag');

      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      res.json({ ticket });
    } catch (error: any) {
      console.error('Error updating ticket:', error);
      res.status(500).json({ error: error.message });
    }
  })
);

// ──────────────────────────────────────────
// POST /api/it-tickets/:id/updates - Commentaire
// ──────────────────────────────────────────
router.post('/:id/updates', 
  authorize(Permission.IT_UPDATE),
  asyncHandler(async (req: any, res: Response) => {
    try {
      const userId = req.user?.userId || req.user?.id;
      const ticket = await ITTicket.findOneAndUpdate(
        { _id: req.params.id, organizationId: req.organizationId },
        {
          $push: {
            updates: {
              timestamp: new Date(),
              userId: userId,
              message: req.body.message,
              internal: req.body.internal || false,
            },
          },
        },
        { new: true }
      ).populate('updates.userId', 'firstName lastName');

      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      res.json({ ticket });
    } catch (error: any) {
      console.error('Error adding ticket update:', error);
      res.status(500).json({ error: error.message });
    }
  })
);

// ──────────────────────────────────────────
// POST /api/it-tickets/:id/resolve - Résolution
// ──────────────────────────────────────────
router.post('/:id/resolve', 
  authorize(Permission.IT_UPDATE),
  asyncHandler(async (req: any, res: Response) => {
    try {
      const userId = req.user?.userId || req.user?.id;
      const ticket = await ITTicket.findOneAndUpdate(
        { _id: req.params.id, organizationId: req.organizationId },
        {
          $set: {
            status: 'resolved',
            resolvedAt: new Date(),
            resolution: {
              summary: req.body.summary,
              rootCause: req.body.rootCause,
              solution: req.body.solution,
              resolvedBy: userId,
            },
          },
        },
        { new: true }
      ).populate('resolution.resolvedBy', 'firstName lastName');

      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      res.json({ ticket });
    } catch (error: any) {
      console.error('Error resolving ticket:', error);
      res.status(500).json({ error: error.message });
    }
  })
);

export default router;
