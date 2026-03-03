import { Router } from 'express';
import { body, param } from 'express-validator';
import { complaintController } from './complaint.controller.js';
import { authenticate, requireOrganization, requireRole } from '../../middleware/security.js';
import { upload } from '../../middleware/upload.js';
import { validator } from '../../middleware/validator.js';

const router = Router();

router.use(authenticate, requireOrganization);

router.get('/stats', complaintController.getStats.bind(complaintController));
router.get('/', complaintController.getAll.bind(complaintController));
router.get('/:id', complaintController.getById.bind(complaintController));

router.post(
  '/',
  upload.array('photos', 5),
  [
    body('category').notEmpty().withMessage('Category is required'),
    body('subcategory').notEmpty().withMessage('Subcategory is required'),
    body('priority').isIn(['low', 'medium', 'high', 'urgent']),
    body('title').notEmpty(),
    body('description').notEmpty(),
    body('address').notEmpty(),
    body('city').notEmpty(),
    body('district').notEmpty(),
    body('isAnonymous').optional().isBoolean(),
  ],
  validator,
  complaintController.create.bind(complaintController)
);

router.put(
  '/:id',
  [
    param('id').isMongoId(),
    body('status').optional().isIn(['nouvelle', 'en cours', 'résolue', 'fermée', 'rejetée']),
    body('assignedTeamId').optional().isMongoId(),
    body('technicianId').optional().isMongoId(),
  ],
  validator,
  complaintController.update.bind(complaintController)
);

router.delete(
  '/:id',
  [param('id').isMongoId()],
  validator,
  complaintController.delete.bind(complaintController)
);

router.post(
  '/:id/approve',
  requireRole(['ADMIN', 'OWNER', 'TECH_LEAD']),
  [param('id').isMongoId()],
  validator,
  complaintController.approve.bind(complaintController)
);

router.post(
  '/:id/reject',
  requireRole(['ADMIN', 'OWNER', 'TECH_LEAD']),
  [
    param('id').isMongoId(),
    body('rejectionReason').notEmpty().withMessage('Rejection reason is required'),
  ],
  validator,
  complaintController.reject.bind(complaintController)
);

export default router;
