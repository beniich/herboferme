import express, { Response } from 'express';
import { authenticate, requireOrganization } from '../middleware/security.js';
import ITAsset from '../models/ITAsset.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../types/request.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Apply authentication and organization context to all routes
router.use(authenticate, requireOrganization);

// GET /api/it-assets - Get all IT assets
router.get('/', asyncHandler(async (req: any, res: Response) => {
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
    return res.status(500).json({ error: error.message });
  }
}));

// GET /api/it-assets/stats - Get asset statistics
router.get('/stats', asyncHandler(async (req: any, res: Response) => {
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
          $lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        },
      }),
    };

    res.json({ stats });
  } catch (error: any) {
    console.error('Error fetching asset stats:', error);
    res.status(500).json({ error: error.message });
  }
}));

// GET /api/it-assets/:id - Get single asset
router.get('/:id', asyncHandler(async (req: any, res: Response) => {
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

    res.json({ asset });
  } catch (error: any) {
    console.error('Error fetching asset:', error);
    res.status(500).json({ error: error.message });
  }
}));

// POST /api/it-assets - Create new asset
router.post('/', asyncHandler(async (req: any, res: Response) => {
  try {
    // Generate asset tag if not provided
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
}));

// PUT /api/it-assets/:id - Update asset
router.put('/:id', asyncHandler(async (req: any, res: Response) => {
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
}));

// DELETE /api/it-assets/:id - Delete asset
router.delete('/:id', asyncHandler(async (req: any, res: Response) => {
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
}));

// POST /api/it-assets/:id/maintenance - Add maintenance record
router.post('/:id/maintenance', asyncHandler(async (req: any, res: Response) => {
  try {
    const asset = await ITAsset.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      {
        $push: {
          maintenanceHistory: {
            date: new Date(),
            type: req.body.type,
            performedBy: req.user!._id || req.user!.id,
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
}));

export default router;
