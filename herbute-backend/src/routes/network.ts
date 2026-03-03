import express, { Response } from 'express';
import { auth } from '../middleware/security.js';
import { requireOrganization } from '../middleware/organization.js';
import NetworkDevice from '../models/NetworkDevice';
import { AuthenticatedRequest } from '../types/request.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Apply authentication and organization context to all routes
router.use(auth, requireOrganization);

// GET /api/network/devices - Get all network devices
router.get('/devices', asyncHandler(async (req: any, res: Response) => {
  try {
    const { type, status, search } = req.query;

    const query: any = { organizationId: req.organizationId };

    if (type) query.type = type;
    if (search) {
      query.$or = [
        { name: new RegExp(search as string, 'i') },
        { hostname: new RegExp(search as string, 'i') },
        { ipAddress: new RegExp(search as string, 'i') },
      ];
    }

    const devices = await NetworkDevice.find(query).sort({ name: 1 });

    res.json({ devices, count: devices.length });
  } catch (error: any) {
    console.error('Error fetching network devices:', error);
    res.status(500).json({ error: error.message });
  }
}));

// GET /api/network/devices/:id - Get single device
router.get('/devices/:id', asyncHandler(async (req: any, res: Response) => {
  try {
    const device = await NetworkDevice.findOne({
      _id: req.params.id,
      organizationId: req.organizationId,
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.json({ device });
  } catch (error: any) {
    console.error('Error fetching device:', error);
    res.status(500).json({ error: error.message });
  }
}));

// POST /api/network/devices - Create new device
router.post('/devices', asyncHandler(async (req: any, res: Response) => {
  try {
    const device = await NetworkDevice.create({
      ...req.body,
      organizationId: req.organizationId,
    });

    res.status(201).json({ device });
  } catch (error: any) {
    console.error('Error creating device:', error);
    res.status(500).json({ error: error.message });
  }
}));

// PUT /api/network/devices/:id - Update device
router.put('/devices/:id', asyncHandler(async (req: any, res: Response) => {
  try {
    const device = await NetworkDevice.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.json({ device });
  } catch (error: any) {
    console.error('Error updating device:', error);
    res.status(500).json({ error: error.message });
  }
}));

// DELETE /api/network/devices/:id - Delete device
router.delete('/devices/:id', asyncHandler(async (req: any, res: Response) => {
  try {
    const device = await NetworkDevice.findOneAndDelete({
      _id: req.params.id,
      organizationId: req.organizationId,
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.json({ message: 'Device deleted successfully', device });
  } catch (error: any) {
    console.error('Error deleting device:', error);
    res.status(500).json({ error: error.message });
  }
}));

// GET /api/network/devices/:id/metrics - Get device metrics
router.get('/devices/:id/metrics', asyncHandler(async (req: any, res: Response) => {
  try {
    const device = await NetworkDevice.findOne({
      _id: req.params.id,
      organizationId: req.organizationId,
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Return current metrics
    const metrics = {
      device: {
        id: device._id,
        name: device.name,
        ipAddress: device.ipAddress,
      },
      current: device.currentMetrics || { /* Intentionally empty */ },
      interfaces: device.interfaces || [],
      timestamp: new Date(),
    };

    res.json({ metrics });
  } catch (error: any) {
    console.error('Error fetching device metrics:', error);
    res.status(500).json({ error: error.message });
  }
}));

// POST /api/network/devices/:id/metrics - Update device metrics (from monitoring service)
router.post('/devices/:id/metrics', asyncHandler(async (req: any, res) => {
  try {
    const device = await NetworkDevice.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      {
        $set: {
          currentMetrics: {
            ...req.body,
            lastChecked: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.json({ device });
  } catch (error: any) {
    console.error('Error updating device metrics:', error);
    res.status(500).json({ error: error.message });
  }
}));

// GET /api/network/stats - Get network statistics
router.get('/stats', asyncHandler(async (req: any, res) => {
  try {
    const stats = {
      total: await NetworkDevice.countDocuments({ organizationId: req.organizationId }),

      byType: await NetworkDevice.aggregate([
        { $match: { organizationId: req.organizationId } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),

      online: await NetworkDevice.countDocuments({
        organizationId: req.organizationId,
        'currentMetrics.isOnline': true,
      }),

      offline: await NetworkDevice.countDocuments({
        organizationId: req.organizationId,
        'currentMetrics.isOnline': false,
      }),

      highCPU: await NetworkDevice.countDocuments({
        organizationId: req.organizationId,
        'currentMetrics.cpuUsage': { $gte: 80 },
      }),

      highMemory: await NetworkDevice.countDocuments({
        organizationId: req.organizationId,
        'currentMetrics.memoryUsage': { $gte: 80 },
      }),
    };

    res.json({ stats });
  } catch (error: any) {
    console.error('Error fetching network stats:', error);
    res.status(500).json({ error: error.message });
  }
}));

export default router;
