import express, { Response } from 'express';
import { authenticate, requireOrganization } from '../middleware/security.js';
import { authorize, Permission } from '../middleware/authorize.js';
import ITAsset from '../models/ITAsset.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Appliquer l'authentification et le contexte d'organisation sur toutes les routes
router.use(authenticate as any, requireOrganization as any);

// ──────────────────────────────────────────
// GET /api/it-assets - Tous les assets IT
// ──────────────────────────────────────────
router.get('/', 
  authorize(Permission.IT_READ),
  asyncHandler(async (req: any, res: Response) => {
    try {
      const { type, status, search, assignedTo } = req.query;
      const query: any = { organizationId: req.organizationId };

      if (type) query.type = type;
      if (status) query.status = status;
      if (assignedTo) query.assignedTo = assignedTo;

      if (search) {
        query.$or = [
          { name: new RegExp(search as string, 'i') },
          { hostname: new RegExp(search as string, 'i') },
          { ipAddress: new RegExp(search as string, 'i') },
          { assetTag: new RegExp(search as string, 'i') },
        ];
      }

      const assets = await ITAsset.find(query)
        .populate('assignedTo', 'firstName lastName email')
        .sort({ createdAt: -1 });

      return sendSuccess(res, { assets, count: assets.length });
    } catch (error: any) {
      console.error('Error fetching assets:', error);
      return sendError(res, error.message, 'FETCH_ASSETS_ERROR', 500);
    }
  })
);

// ──────────────────────────────────────────
// GET /api/it-assets/stats - Statistiques
// ──────────────────────────────────────────
router.get('/stats', 
  authorize(Permission.IT_READ),
  asyncHandler(async (req: any, res: Response) => {
    try {
      const stats = {
        total: await ITAsset.countDocuments({ organizationId: req.organizationId }),

        byType: await ITAsset.aggregate([
          { $match: { organizationId: req.organizationId } },
          { $group: { _id: '$type', count: { $sum: 1 } } },
        ]),

        byStatus: await ITAsset.aggregate([
          { $match: { organizationId: req.organizationId } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),

        monitoringEnabled: await ITAsset.countDocuments({
          organizationId: req.organizationId,
          monitoringEnabled: true,
        }),

        warrantyExpiringSoon: await ITAsset.countDocuments({
          organizationId: req.organizationId,
          warrantyExpiration: {
            $gte: new Date(),
            $lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 jours
          },
        }),
      };

      return sendSuccess(res, { stats });
    } catch (error: any) {
      console.error('Error fetching asset stats:', error);
      return sendError(res, error.message, 'FETCH_ASSET_STATS_ERROR', 500);
    }
  })
);

// ──────────────────────────────────────────
// GET /api/it-assets/:id - Asset unique
// ──────────────────────────────────────────
router.get('/:id', 
  authorize(Permission.IT_READ),
  asyncHandler(async (req: any, res: Response) => {
    try {
      const asset = await ITAsset.findOne({
        _id: req.params.id,
        organizationId: req.organizationId,
      })
        .populate('assignedTo', 'firstName lastName email')
        .populate('maintenanceHistory.performedBy', 'firstName lastName');

      if (!asset) {
        return res.status(404).json({ error: 'Asset not found' });
      }

      return sendSuccess(res, { asset });
    } catch (error: any) {
      console.error('Error fetching asset:', error);
      return sendError(res, error.message, 'FETCH_ASSET_ERROR', 500);
    }
  })
);

// ──────────────────────────────────────────
// POST /api/it-assets - Création
// ──────────────────────────────────────────
router.post('/', 
  authorize(Permission.IT_CREATE),
  asyncHandler(async (req: any, res: Response) => {
    try {
      if (!req.body.assetTag) {
        const year = new Date().getFullYear();
        const count = await ITAsset.countDocuments({ organizationId: req.organizationId });
        req.body.assetTag = `IT-${year}-${String(count + 1).padStart(4, '0')}`;
      }

      const asset = await ITAsset.create({
        ...req.body,
        organizationId: req.organizationId,
      });

      res.status(201).json({ asset });
    } catch (error: any) {
      console.error('Error creating asset:', error);
      res.status(500).json({ error: error.message });
    }
  })
);

// ──────────────────────────────────────────
// PUT /api/it-assets/:id - Mise à jour
// ──────────────────────────────────────────
router.put('/:id', 
  authorize(Permission.IT_UPDATE),
  asyncHandler(async (req: any, res: Response) => {
    try {
      const asset = await ITAsset.findOneAndUpdate(
        { _id: req.params.id, organizationId: req.organizationId },
        { $set: req.body },
        { new: true, runValidators: true }
      ).populate('assignedTo', 'firstName lastName email');

      if (!asset) {
        return res.status(404).json({ error: 'Asset not found' });
      }

      res.json({ asset });
    } catch (error: any) {
      console.error('Error updating asset:', error);
      res.status(500).json({ error: error.message });
    }
  })
);

// ──────────────────────────────────────────
// DELETE /api/it-assets/:id - Suppression
// ──────────────────────────────────────────
router.delete('/:id', 
  authorize(Permission.IT_DELETE),
  asyncHandler(async (req: any, res: Response) => {
    try {
      const asset = await ITAsset.findOneAndDelete({
        _id: req.params.id,
        organizationId: req.organizationId,
      });

      if (!asset) {
        return res.status(404).json({ error: 'Asset not found' });
      }

      res.json({ message: 'Asset deleted successfully', asset });
    } catch (error: any) {
      console.error('Error deleting asset:', error);
      res.status(500).json({ error: error.message });
    }
  })
);

// ──────────────────────────────────────────
// POST /api/it-assets/:id/maintenance - Maintenance
// ──────────────────────────────────────────
router.post('/:id/maintenance', 
  authorize(Permission.IT_UPDATE),
  asyncHandler(async (req: any, res: Response) => {
    try {
      const userId = req.user?.userId || req.user?.id;
      const asset = await ITAsset.findOneAndUpdate(
        { _id: req.params.id, organizationId: req.organizationId },
        {
          $push: {
            maintenanceHistory: {
              date: new Date(),
              type: req.body.type,
              performedBy: userId,
              notes: req.body.notes,
              cost: req.body.cost || 0,
            },
          },
          $set: { lastMaintenance: new Date() },
        },
        { new: true }
      );

      if (!asset) {
        return res.status(404).json({ error: 'Asset not found' });
      }

      res.json({ asset });
    } catch (error: any) {
      console.error('Error adding maintenance record:', error);
      res.status(500).json({ error: error.message });
    }
  })
);

export default router;
