import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, requireOrganization } from '../../middleware/security.js';
import { validator } from '../../middleware/validator.js';
import { cacheMiddleware, CACHE_TTL } from '../../middleware/cache.js';
import { cropController } from './crops.controller.js';

const router = Router();
router.use(authenticate, requireOrganization);

const idParam    = [param('id').isMongoId().withMessage('ID invalide')];
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

router.get('/stats',
  cacheMiddleware(CACHE_TTL.cropStats),
  cropController.getStats.bind(cropController)
);

router.get('/',
  [query('search').optional().isString().isLength({ max: 100 })],
  validator,
  cacheMiddleware(CACHE_TTL.default),
  cropController.findAll.bind(cropController)
);

router.get('/:id',
  idParam, validator,
  cropController.findById.bind(cropController)
);

router.post('/',
  cropCreate, validator,
  cropController.create.bind(cropController)
);

router.put('/:id',
  [...idParam, ...cropCreate.map(v => (v as any).optional())],
  validator,
  cropController.update.bind(cropController)
);

router.post('/:id/harvest',
  [...idParam, body('actualYield').isFloat({ min: 0 }).withMessage('Rendement réel requis')],
  validator,
  cropController.harvest.bind(cropController)
);

router.delete('/:id',
  idParam, validator,
  cropController.delete.bind(cropController)
);

export default router;
