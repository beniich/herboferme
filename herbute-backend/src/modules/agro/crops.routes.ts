import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, requireOrganization } from '../../middleware/security.js';
import { authorize, Permission } from '../../middleware/authorize.js';
import { validator } from '../../middleware/validator.js';
import { cacheMiddleware, CACHE_TTL } from '../../middleware/cache.js';
import { cropController } from './crops.controller.js';

const router = Router();

// Auth + org scope sur toutes les routes
router.use(authenticate as any, requireOrganization as any);

const idParam = [param('id').isMongoId().withMessage('ID invalide')];
const cropCreate = [
  body('name').trim().notEmpty().withMessage('Nom requis'),
  body('category').isIn(['VEGETABLE', 'HERB', 'NURSERY', 'FOREST']).withMessage('Catégorie invalide'),
  body('plotId').trim().notEmpty().withMessage('Parcelle requise'),
  body('plantedDate').isISO8601().withMessage('Date de plantation invalide'),
  body('status').optional().isIn(['PLANTED', 'GROWING', 'READY', 'HARVESTED']),
  body('expectedHarvestDate').optional().isISO8601(),
  body('estimatedYield').optional().isFloat({ min: 0 }),
  body('surface').optional().isFloat({ min: 0 }),
  body('notes').optional().isString().isLength({ max: 2000 }),
];

// GET /api/crops/stats — lecture requise
router.get('/stats',
  authorize(Permission.CROPS_READ),
  cacheMiddleware(CACHE_TTL.cropStats),
  cropController.getStats.bind(cropController)
);

// GET /api/crops
router.get('/',
  authorize(Permission.CROPS_READ),
  [query('search').optional().isString().isLength({ max: 100 })],
  validator,
  cacheMiddleware(CACHE_TTL.default),
  cropController.findAll.bind(cropController)
);

// GET /api/crops/:id
router.get('/:id',
  authorize(Permission.CROPS_READ),
  idParam, validator,
  cropController.findById.bind(cropController)
);

// POST /api/crops
router.post('/',
  authorize(Permission.CROPS_CREATE),
  cropCreate, validator,
  cropController.create.bind(cropController)
);

// PUT /api/crops/:id
router.put('/:id',
  authorize(Permission.CROPS_UPDATE),
  [...idParam, ...cropCreate.map(v => (v as any).optional())],
  validator,
  cropController.update.bind(cropController)
);

// POST /api/crops/:id/harvest
router.post('/:id/harvest',
  authorize(Permission.CROPS_UPDATE),
  [...idParam, body('actualYield').isFloat({ min: 0 }).withMessage('Rendement réel requis')],
  validator,
  cropController.harvest.bind(cropController)
);

// DELETE /api/crops/:id
router.delete('/:id',
  authorize(Permission.CROPS_DELETE),
  idParam, validator,
  cropController.delete.bind(cropController)
);

export default router;
