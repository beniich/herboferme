import { Router } from 'express';
import { body, param } from 'express-validator';
import { complaintController } from '../controllers/complaintController.js';
import { authenticate, requireOrganization, requireRole } from '../middleware/security.js';
import { upload } from '../middleware/upload.js';
import { validator } from '../middleware/validator.js';

const router = Router();

// Apply authentication and organization context to all complaint routes
router.use(authenticate, requireOrganization);

// GET /api/complaints/stats - Must be before /:id route
router.get('/stats', complaintController.getStats.bind(complaintController));

// GET /api/complaints
router.get('/', complaintController.getAll.bind(complaintController));

// GET /api/complaints/:id
router.get('/:id', complaintController.getById.bind(complaintController));

// POST /api/complaints
router.post(
  '/',
  upload.array('photos', 5), // Handle up to 5 photos
  [
    // Step 1: Info
    body('category').notEmpty().withMessage('Category is required'),
    body('subcategory').notEmpty().withMessage('Subcategory is required'),
    body('priority').isIn(['low', 'medium', 'high', 'urgent']),
    body('title').notEmpty(),
    body('description').notEmpty(),

    // Step 2: Location
    body('address').notEmpty(),
    body('city').notEmpty(),
    body('district').notEmpty(),

    // Step 4: Contact
    body('isAnonymous').optional().isBoolean(),
  ],
  validator,
  complaintController.create.bind(complaintController)
);

// PUT /api/complaints/:id
router.put(
  '/:id',
  [
    param('id').isMongoId(),
    body('status').optional().isIn(['nouvelle', 'en cours', 'r    solue', 'ferm    e', 'rejet    e']),
    body('assignedTeamId').optional().isMongoId(),
    body('technicianId').optional().isMongoId(),
  ],
  validator,
  complaintController.update.bind(complaintController)
);

// DELETE /api/complaints/:id
router.delete(
  '/:id',
  [param('id').isMongoId()],
  validator,
  complaintController.delete.bind(complaintController)
);

// POST /api/complaints/:id/approve - Approve a complaint (Admin/Owner/Tech Lead only)
router.post(
  '/:id/approve',
  requireRole(['ADMIN', 'OWNER', 'TECH_LEAD']),
  [param('id').isMongoId()],
  validator,
  complaintController.approve.bind(complaintController)
);

// POST /api/complaints/:id/reject - Reject a complaint (Admin/Owner/Tech Lead only)
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
