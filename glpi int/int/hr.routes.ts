/**
 * routes/hr.routes.ts — Ressources Humaines (Agricole)
 */

import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { HERBUTE_ROUTES } from '@reclamtrack/shared';

const router = Router();
router.use(authenticate);

// Staff
router.get(HERBUTE_ROUTES.hr.staff,    async (req, res, next) => { try { res.json({ staff: [] }); } catch(e){next(e)} });
router.post(HERBUTE_ROUTES.hr.staff,   authorize('admin','manager'), async (req, res, next) => { try { res.status(201).json(req.body); } catch(e){next(e)} });

// Roster (équipes)
router.get(HERBUTE_ROUTES.hr.roster,   async (req, res, next) => { try { res.json({ roster: [] }); } catch(e){next(e)} });
router.post(HERBUTE_ROUTES.hr.roster,  authorize('admin','manager'), async (req, res, next) => { try { res.status(201).json(req.body); } catch(e){next(e)} });

// Congés
router.get(HERBUTE_ROUTES.hr.leaves,   async (req, res, next) => { try { res.json({ leaves: [] }); } catch(e){next(e)} });
router.post(HERBUTE_ROUTES.hr.leaves,  async (req, res, next) => { try { res.status(201).json(req.body); } catch(e){next(e)} });
router.patch(`${HERBUTE_ROUTES.hr.leaves}/:id/approve`, authorize('admin','manager'), async (req, res, next) => {
  try { res.json({ id: req.params.id, status: 'approved' }); } catch(e){next(e)}
});

export default router;
