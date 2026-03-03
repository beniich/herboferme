import { Router, Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import { authenticate, requireOrganization } from '../../middleware/security.js';
import { validator } from '../../middleware/validator.js';
import { Animal } from './animals.model.js';

const router = Router();
router.use(authenticate, requireOrganization);

// GET /api/animals/stats
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const organizationId = (req as any).organizationId;
    const filter: any = { organizationId };
    if (req.query.category) filter.category = req.query.category;

    const [totalCount, totalValue, byType] = await Promise.all([
      Animal.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: '$count' } } }
      ]),
      Animal.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: '$estimatedValue' } } }
      ]),
      Animal.aggregate([
        { $match: filter },
        { $group: { _id: '$type', count: { $sum: '$count' }, value: { $sum: '$estimatedValue' } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalAnimals: totalCount[0]?.total || 0,
        totalValue: totalValue[0]?.total || 0,
        byType
      }
    });
  } catch (err) { next(err); }
});

// GET /api/animals
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: any = { organizationId: (req as any).organizationId };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;

    const animals = await Animal.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: animals });
  } catch (err) { next(err); }
});

// GET /api/animals/:id
router.get('/:id',
  param('id').isMongoId(),
  validator,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const animal = await Animal.findOne({ _id: req.params.id, organizationId: (req as any).organizationId });
      if (!animal) return res.status(404).json({ success: false, message: 'Animal introuvable' });
      res.json({ success: true, data: animal });
    } catch (err) { next(err); }
  }
);

// POST /api/animals
router.post('/',
  [
    body('type').notEmpty().withMessage('Type requis'),
    body('breed').notEmpty().withMessage('Race requise'),
    body('count').isInt({ min: 1 }).withMessage('Nombre invalide'),
    body('averageAge').isFloat({ min: 0 }).withMessage('Âge invalide'),
    body('status').isIn(['PRODUCTION', 'ACTIVE', 'GROWING', 'LAYING', 'SICK', 'SOLD']).withMessage('Statut invalide'),
    body('estimatedValue').optional().isFloat({ min: 0 }),
    body('category').optional().isIn(['LIVESTOCK', 'POULTRY']),
    body('notes').optional().isString(),
  ],
  validator,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const animal = await Animal.create({
        ...req.body,
        organizationId: (req as any).organizationId,
      });
      res.status(201).json({ success: true, data: animal });
    } catch (err) { next(err); }
  }
);

// PUT /api/animals/:id
router.put('/:id',
  param('id').isMongoId(),
  validator,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const animal = await Animal.findOneAndUpdate(
        { _id: req.params.id, organizationId: (req as any).organizationId },
        { $set: req.body },
        { new: true, runValidators: true }
      );
      if (!animal) return res.status(404).json({ success: false, message: 'Animal introuvable' });
      res.json({ success: true, data: animal });
    } catch (err) { next(err); }
  }
);

// DELETE /api/animals/:id
router.delete('/:id',
  param('id').isMongoId(),
  validator,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const animal = await Animal.findOneAndDelete({ _id: req.params.id, organizationId: (req as any).organizationId });
      if (!animal) return res.status(404).json({ success: false, message: 'Animal introuvable' });
      res.json({ success: true, message: 'Supprimé avec succès' });
    } catch (err) { next(err); }
  }
);

export default router;
