/**
 * routes/fleet.routes.ts â€” Gestion de la flotte
 */

import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize, requireFarmAccess } from '../middleware/authorize.js';
import { HERBUTE_ROUTES } from '@reclamtrack/shared';

const router = Router();
router.use(authenticate);

// GET /api/fleet/vehicles
router.get('/vehicles', async (req, res, next) => {
  try {
    // TODO: Vehicle.find({ farmId: req.user!.farmId })
    res.json({ vehicles: [], farmId: (req.user as any)?.farmId });
  } catch (err) { next(err); }
});

// POST /api/fleet/vehicles
router.post('/vehicles', authorize('admin', 'manager'), async (req, res, next) => {
  try {
    res.status(201).json({ message: 'VÃ©hicule crÃ©Ã©', data: req.body });
  } catch (err) { next(err); }
});

// GET /api/fleet/vehicles/:id
router.get('/vehicles/:id', requireFarmAccess, async (req, res, next) => {
  try {
    res.json({ id: req.params.id });
  } catch (err) { next(err); }
});

// GET /api/fleet/maintenance
router.get('/maintenance', async (req, res, next) => {
  try {
    res.json({ maintenances: [] });
  } catch (err) { next(err); }
});

export default router;
