/**
 * routes/fleet.routes.ts — Gestion de la flotte
 */

import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize, requireFarmAccess } from '../middleware/authorize';
import { HERBUTE_ROUTES } from '@reclamtrack/shared';

const router = Router();
router.use(authenticate);

// GET /api/fleet/vehicles
router.get(HERBUTE_ROUTES.fleet.vehicles, async (req, res, next) => {
  try {
    // TODO: Vehicle.find({ farmId: req.user!.farmId })
    res.json({ vehicles: [], farmId: req.user!.farmId });
  } catch (err) { next(err); }
});

// POST /api/fleet/vehicles
router.post(HERBUTE_ROUTES.fleet.vehicles, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    res.status(201).json({ message: 'Véhicule créé', data: req.body });
  } catch (err) { next(err); }
});

// GET /api/fleet/vehicles/:id
router.get(HERBUTE_ROUTES.fleet.vehicleById(':id'), requireFarmAccess, async (req, res, next) => {
  try {
    res.json({ id: req.params.id });
  } catch (err) { next(err); }
});

// GET /api/fleet/maintenance
router.get(HERBUTE_ROUTES.fleet.maintenance, async (req, res, next) => {
  try {
    res.json({ maintenances: [] });
  } catch (err) { next(err); }
});

export default router;
