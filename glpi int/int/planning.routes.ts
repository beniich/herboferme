/**
 * routes/planning.routes.ts — Planning, Scheduler, Interventions
 */

import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { HERBUTE_ROUTES } from '@reclamtrack/shared';

const router = Router();
router.use(authenticate);

// Planning / Schedule
router.get(HERBUTE_ROUTES.planning.schedule,       async (req, res, next) => { try { res.json({ schedule: [] }); } catch(e){next(e)} });
router.post(HERBUTE_ROUTES.planning.schedule,      authorize('admin','manager'), async (req, res, next) => { try { res.status(201).json(req.body); } catch(e){next(e)} });

// Interventions
router.get(HERBUTE_ROUTES.planning.interventions,  async (req, res, next) => { try { res.json({ interventions: [] }); } catch(e){next(e)} });
router.post(HERBUTE_ROUTES.planning.interventions, authorize('admin','manager'), async (req, res, next) => { try { res.status(201).json(req.body); } catch(e){next(e)} });

export default router;
