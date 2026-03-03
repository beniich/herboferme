import { Router, Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import { authenticate, requireOrganization } from '../../middleware/security.js';
import { validator } from '../../middleware/validator.js';
import { IrrigationLog } from './irrigation.model.js';
import mongoose from 'mongoose';

const router = Router();
router.use(authenticate, requireOrganization);

router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = new mongoose.Types.ObjectId((req as any).organizationId);
    const [totalVolume, byMethod, recent] = await Promise.all([
      IrrigationLog.aggregate([
        { $match: { organizationId: orgId } },
        { $group: { _id: null, total: { $sum: '$volume' } } }
      ]),
      IrrigationLog.aggregate([
        { $match: { organizationId: orgId } },
        { $group: { _id: '$method', volume: { $sum: '$volume' }, count: { $sum: 1 } } }
      ]),
      IrrigationLog.find({ organizationId: orgId }).sort({ date: -1 }).limit(5)
    ]);

    res.json({
      success: true,
      data: {
        totalVolume: totalVolume[0]?.total || 0,
        byMethod,
        recent
      }
    });
  } catch (err) { next(err); }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: any = { organizationId: (req as any).organizationId };
    if (req.query.plotId) filter.plotId = req.query.plotId;
    if (req.query.status) filter.status = req.query.status;

    const logs = await IrrigationLog.find(filter).sort({ date: -1 });
    res.json({ success: true, data: logs });
  } catch (err) { next(err); }
});

router.post('/',
  [
    body('plotId').notEmpty().withMessage('Parcelle requise'),
    body('volume').isFloat({ min: 0 }).withMessage('Volume invalide'),
    body('duration').isFloat({ min: 0 }).withMessage('Durée invalide'),
    body('method').isIn(['DRIP', 'SPRINKLER', 'SURFACE']).withMessage('Méthode invalide'),
    body('date').optional().isISO8601(),
  ],
  validator,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const log = await IrrigationLog.create({
        ...req.body,
        organizationId: (req as any).organizationId,
      });
      res.status(201).json({ success: true, data: log });
    } catch (err) { next(err); }
  }
);

router.delete('/:id',
  param('id').isMongoId(), validator,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const log = await IrrigationLog.findOneAndDelete({ _id: req.params.id, organizationId: (req as any).organizationId });
      if (!log) return res.status(404).json({ success: false, message: 'Log introuvable' });
      res.json({ success: true, message: 'Supprimé avec succès' });
    } catch (err) { next(err); }
  }
);

export default router;
