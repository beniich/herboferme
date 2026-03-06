/**
 * routes/hr.routes.ts â€” Ressources Humaines (Agricole)
 */

import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { HERBUTE_ROUTES } from '@reclamtrack/shared';

const router = Router();
router.use(authenticate);

// Staff
router.get('/staff',    async (req, res, next) => { try { res.json({ staff: [] }); } catch(e){next(e)} });
router.post('/staff',   authorize('admin','manager'), async (req, res, next) => { try { res.status(201).json(req.body); } catch(e){next(e)} });

// Roster (Ã©quipes)
router.get('/roster',   async (req, res, next) => { try { res.json({ roster: [] }); } catch(e){next(e)} });
router.post('/roster',  authorize('admin','manager'), async (req, res, next) => { try { res.status(201).json(req.body); } catch(e){next(e)} });

// CongÃ©s
router.get('/leaves',   async (req, res, next) => { try { res.json({ leaves: [] }); } catch(e){next(e)} });
router.post('/leaves',  async (req, res, next) => { try { res.status(201).json(req.body); } catch(e){next(e)} });
router.patch('/leaves/:id/approve', authorize('admin','manager'), async (req, res, next) => {
  try { res.json({ id: req.params.id, status: 'approved' }); } catch(e){next(e)}
});

export default router;
