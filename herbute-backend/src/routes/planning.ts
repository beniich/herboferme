/**
 * routes/planning.routes.ts â€” Planning, Scheduler, Interventions
 */

import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { HERBUTE_ROUTES } from '@reclamtrack/shared';

const router = Router();
router.use(authenticate);

// Planning / Schedule
router.get('/schedule',       async (req, res, next) => { try { res.json({ schedule: [] }); } catch(e){next(e)} });
router.post('/schedule',      authorize('admin','manager'), async (req, res, next) => { try { res.status(201).json(req.body); } catch(e){next(e)} });

// Interventions
router.get('/interventions',  async (req, res, next) => { try { res.json({ interventions: [] }); } catch(e){next(e)} });
router.post('/interventions', authorize('admin','manager'), async (req, res, next) => { try { res.status(201).json(req.body); } catch(e){next(e)} });

export default router;
