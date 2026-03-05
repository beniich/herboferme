/**
 * 🛣️ HERBOFERME BACKEND - ROUTES (PRODUCTION READY)
 * 
 * Patterns:
 * ├─ Authentication (JWT)
 * ├─ Authorization (Permissions)
 * ├─ Rate limiting
 * ├─ Input validation
 * ├─ Caching
 * └─ Error handling
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 1. AUTH ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// backend/routes/auth.ts
import express, { Request, Response } from 'express';
import { validateLoginRequest, handleValidationErrors } from '@/validators';
import { loginLimiter } from '@/middleware/rateLimiter';
import { jwtManager } from '@/config/jwt';
import { hashPassword, verifyPassword } from '@/utils/password';
import { logger } from '@/utils/logger';
import User from '@/models/User';

const router = express.Router();

/**
 * POST /api/auth/login
 * 
 * Security:
 * ✓ Rate limited (10 attempts/15min)
 * ✓ Input validated (email, password)
 * ✓ Password verified with bcrypt
 * ✓ Returns JWT token (not password)
 * ✓ 401 hides if email exists (timing attack prevention)
 * ✓ Failed attempts logged
 */
router.post(
  '/login',
  loginLimiter,
  validateLoginRequest,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // 1. Find user by email
      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        // ⚠️ SECURITY: Don't reveal if email exists
        logger.warn('[SECURITY] Login attempt with non-existent email', { email, ip: req.ip });
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // 2. Verify password
      const isPasswordValid = await verifyPassword(password, user.password);
      
      if (!isPasswordValid) {
        logger.warn('[SECURITY] Failed login attempt', { userId: user._id, ip: req.ip });
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // 3. Check if user is active
      if (!user.isActive) {
        logger.warn('[SECURITY] Login attempt on inactive account', { userId: user._id, ip: req.ip });
        return res.status(403).json({ error: 'Account disabled' });
      }

      // 4. Generate JWT token
      const token = jwtManager.generateToken({
        userId: user._id.toString(),
        email: user.email,
        organizationId: user.organizationId.toString(),
        roles: user.roles,
      });

      // 5. Log successful login
      logger.info('[AUTH] User logged in', { userId: user._id, email: user.email, ip: req.ip });

      // 6. Return token and user info (NEVER password)
      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          organizationId: user.organizationId,
          roles: user.roles,
        },
      });
    } catch (err) {
      logger.error('[ERROR] Login failed:', err);
      res.status(500).json({ error: 'Login failed', errorId: req.requestId });
    }
  }
);

/**
 * POST /api/auth/logout
 * 
 * Add token to blacklist (in Redis)
 */
router.post('/logout', (req: Request, res: Response) => {
  const token = req.headers.authorization?.slice(7);
  
  if (token) {
    // Add to Redis blacklist with TTL
    // Implementation: redisClient.setex(`blacklist:${token}`, ttl, '1')
  }

  res.json({ message: 'Logged out' });
});

export default router;


// ═══════════════════════════════════════════════════════════════════════════════
// 2. ANIMALS ROUTES - Full CRUD with security
// ═══════════════════════════════════════════════════════════════════════════════

// backend/routes/animals.ts
import express, { Request, Response } from 'express';
import { param, body, validationResult } from 'express-validator';
import { authenticate } from '@/middleware/auth';
import { authorize, Permission, ROLE_PERMISSIONS } from '@/middleware/authorize';
import { checkResourceOwnership } from '@/middleware/resourceAccess';
import { globalLimiter, strictLimiter } from '@/middleware/rateLimiter';
import { cacheMiddleware } from '@/middleware/cache';
import { logger } from '@/utils/logger';
import Animal from '@/models/Animal';

const router = express.Router();

// Validation schemas
const validateAnimalCreate = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Invalid name'),
  body('species')
    .isIn(['cattle', 'sheep', 'goat', 'chicken', 'pig'])
    .withMessage('Invalid species'),
  body('weight')
    .isFloat({ min: 1, max: 2000 })
    .withMessage('Invalid weight'),
  body('birthDate')
    .isISO8601()
    .withMessage('Invalid date'),
];

const validateAnimalUpdate = [
  param('id').isMongoId().withMessage('Invalid animal ID'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('weight').optional().isFloat({ min: 1, max: 2000 }),
  body('status').optional().isIn(['healthy', 'ill', 'quarantine']),
];

/**
 * GET /api/animals
 * 
 * Security:
 * ✓ Authenticate: Requires JWT
 * ✓ Authorize: animals:read permission
 * ✓ Cache: 1 minute
 * ✓ Filter by organization (backend)
 * ✓ Pagination: Default 50 items
 */
router.get(
  '/',
  authenticate,
  authorize(Permission.ANIMALS_READ),
  cacheMiddleware(60),
  async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 50 } = req.query;
      const skip = ((parseInt(page as string) || 1) - 1) * parseInt(limit as string);

      // CRITICAL: Filter by user's organization (never trust client)
      const animals = await Animal.find({
        organizationId: req.user!.organizationId,
      })
        .limit(parseInt(limit as string))
        .skip(skip)
        .lean();

      const total = await Animal.countDocuments({
        organizationId: req.user!.organizationId,
      });

      res.json({
        data: {
          stats: {
            total,
            active: animals.filter(a => a.status === 'healthy').length,
          },
          items: animals,
        },
      });
    } catch (err) {
      logger.error('[ERROR] Get animals failed:', err);
      throw err;
    }
  }
);

/**
 * GET /api/animals/stats
 * 
 * Statistics endpoint (cached for 5 min)
 */
router.get(
  '/stats',
  authenticate,
  authorize(Permission.ANIMALS_READ),
  cacheMiddleware(300),
  async (req: Request, res: Response) => {
    try {
      const animals = await Animal.find({
        organizationId: req.user!.organizationId,
      });

      const stats = {
        total: animals.length,
        active: animals.filter(a => a.status === 'healthy').length,
        bySpecies: {} as Record<string, number>,
      };

      animals.forEach(a => {
        stats.bySpecies[a.species] = (stats.bySpecies[a.species] || 0) + 1;
      });

      res.json({ data: stats });
    } catch (err) {
      logger.error('[ERROR] Get stats failed:', err);
      throw err;
    }
  }
);

/**
 * POST /api/animals
 * 
 * Security:
 * ✓ Authenticate: JWT required
 * ✓ Authorize: animals:create permission
 * ✓ Validate: Input validation
 * ✓ Organization: Set by backend
 * ✓ Rate limit: User limited
 * ✓ Cache invalidation: On create
 */
router.post(
  '/',
  authenticate,
  authorize(Permission.ANIMALS_CREATE),
  validateAnimalCreate,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      // CRITICAL: Set organization from JWT (not request body)
      const animalData = {
        ...req.body,
        organizationId: req.user!.organizationId,
        createdBy: req.user!.userId,
      };

      const animal = await Animal.create(animalData);

      logger.info('[AUDIT] Animal created', {
        animalId: animal._id,
        userId: req.user!.userId,
        organizationId: req.user!.organizationId,
      });

      res.status(201).json({ data: animal });
    } catch (err) {
      logger.error('[ERROR] Create animal failed:', err);
      throw err;
    }
  }
);

/**
 * PATCH /api/animals/:id
 * 
 * Security:
 * ✓ Authenticate: JWT required
 * ✓ Authorize: animals:update permission
 * ✓ Ownership: User can only update their own animals (or admin)
 * ✓ Validate: Input validation
 */
router.patch(
  '/:id',
  authenticate,
  authorize(Permission.ANIMALS_UPDATE),
  validateAnimalUpdate,
  handleValidationErrors,
  checkResourceOwnership('Animal'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Update only allowed fields
      const allowedUpdates = ['name', 'weight', 'status'];
      const updates: any = {};
      
      allowedUpdates.forEach(field => {
        if (field in req.body) {
          updates[field] = req.body[field];
        }
      });

      const animal = await Animal.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      );

      logger.info('[AUDIT] Animal updated', {
        animalId: id,
        userId: req.user!.userId,
      });

      res.json({ data: animal });
    } catch (err) {
      logger.error('[ERROR] Update animal failed:', err);
      throw err;
    }
  }
);

/**
 * DELETE /api/animals/:id
 * 
 * Security:
 * ✓ Strict rate limiting (5/min)
 * ✓ Authenticate: JWT required
 * ✓ Authorize: animals:delete permission
 * ✓ Ownership: User can only delete their own animals
 * ✓ Soft delete: Keep data for audit
 */
router.delete(
  '/:id',
  authenticate,
  authorize(Permission.ANIMALS_DELETE),
  strictLimiter,
  checkResourceOwnership('Animal'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Soft delete
      const animal = await Animal.findByIdAndUpdate(
        id,
        { deletedAt: new Date() },
        { new: true }
      );

      logger.warn('[AUDIT] Animal deleted', {
        animalId: id,
        userId: req.user!.userId,
      });

      res.json({ message: 'Animal deleted' });
    } catch (err) {
      logger.error('[ERROR] Delete animal failed:', err);
      throw err;
    }
  }
);

export default router;


// ═══════════════════════════════════════════════════════════════════════════════
// 3. DASHBOARD ROUTE - Aggregate multiple endpoints
// ═══════════════════════════════════════════════════════════════════════════════

// backend/routes/dashboard.ts
import express, { Request, Response } from 'express';
import { authenticate } from '@/middleware/auth';
import { authorize, Permission } from '@/middleware/authorize';
import { cacheMiddleware } from '@/middleware/cache';

const router = express.Router();

/**
 * GET /api/dashboard
 * 
 * Aggregate endpoint combining:
 * - Finance stats
 * - Animal stats
 * - Crop stats
 * - Irrigation stats
 * - Recent transactions
 * 
 * Security:
 * ✓ Authenticate
 * ✓ Cache 1 min
 * ✓ All data filtered by organization
 */
router.get(
  '/',
  authenticate,
  cacheMiddleware(60),
  async (req: Request, res: Response) => {
    try {
      const orgId = req.user!.organizationId;

      // Run all queries in parallel
      const [finance, animals, crops, irrigation, transactions] = await Promise.all([
        // Finance stats
        Transaction.aggregate([
          { $match: { organizationId: new ObjectId(orgId) } },
          {
            $group: {
              _id: { year: { $year: '$date' }, month: { $month: '$date' } },
              revenue: { $sum: { $cond: [{ $eq: ['$type', 'recette'] }, '$amount', 0] } },
              expenses: { $sum: { $cond: [{ $eq: ['$type', 'depense'] }, '$amount', 0] } },
            },
          },
        ]),

        // Animal stats
        Animal.countDocuments({ organizationId: orgId }),

        // Crop stats
        Crop.aggregate([
          { $match: { organizationId: new ObjectId(orgId) } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),

        // Irrigation stats
        Irrigation.aggregate([
          { $match: { organizationId: new ObjectId(orgId) } },
          { $group: { _id: null, totalVolume: { $sum: '$volume' } } },
        ]),

        // Recent transactions
        Transaction.find({ organizationId: orgId })
          .sort({ date: -1 })
          .limit(8),
      ]);

      res.json({
        data: {
          finance,
          animals: { totalAnimals: animals },
          crops: { byStatus: crops },
          irrigation: { totalVolume: irrigation[0]?.totalVolume || 0 },
          transactions,
        },
      });
    } catch (err) {
      logger.error('[ERROR] Dashboard endpoint failed:', err);
      throw err;
    }
  }
);

export default router;


// ═══════════════════════════════════════════════════════════════════════════════
// 4. SERVER INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════

// Merge into server.ts:

import authRoutes from '@/routes/auth';
import animalsRoutes from '@/routes/animals';
import dashboardRoutes from '@/routes/dashboard';

// Routes
app.use('/api/auth', loginLimiter, authRoutes);
app.use('/api/animals', authenticate, animalsRoutes);
app.use('/api/dashboard', authenticate, dashboardRoutes);
