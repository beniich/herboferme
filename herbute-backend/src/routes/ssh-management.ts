/**
 * routes/ssh-management.ts
 * SSH server management          requires admin role + SSH rate limiter.
 * All operations are audited.
 *
 * POST /api/ssh/rotate-password           rotate user password via SSH
 * GET  /api/ssh/sessions                  list active SSH sessions
 * GET  /api/ssh/policy                    get password policy for user
 */
import { Router, Request, Response } from 'express';
import { body, query } from 'express-validator';
import { sshService } from '../services/sshService';
import { authenticate, requireAdmin } from '../middleware/security';
import { authLimiter as sshLimiter } from '../middleware/rateLimiters.js';
import { validator as validate } from '../middleware/validator.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess } from '../utils/apiResponse';
import logger from '../utils/logger';

const router = Router();

// All SSH routes: authenticated + admin + rate limited
router.use(authenticate, requireAdmin, sshLimiter);

/*                  POST /api/ssh/rotate-password                                                                                                                          */
router.post(
  '/rotate-password',
  [
    body('targetUser')
      .trim()
      .notEmpty().withMessage('targetUser is required')
      .matches(/^[a-zA-Z0-9_@.-]+$/).withMessage('Invalid username format'),

    body('newPassword')
      .isLength({ min: 12 }).withMessage('New password must be at least 12 characters')
      .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
      .matches(/[0-9]/).withMessage('Password must contain a number')
      .matches(/[^a-zA-Z0-9]/).withMessage('Password must contain a special character'),
  ],
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const { targetUser, newPassword } = req.body;

    logger.info('[SSH] Password rotation initiated', {
      requestId: req.id,
      initiatedBy: req.user!.sub,
      targetUser,
      // newPassword is NEVER logged
    });

    await sshService.rotatePassword(targetUser, newPassword, req.id);

    // Audit log
    logger.info('[SSH:AUDIT] Password rotated successfully', {
      requestId: req.id,
      actor: req.user!.sub,
      action: 'SSH_ROTATE_PASSWORD',
      target: targetUser,
      timestamp: new Date().toISOString(),
    });

    return sendSuccess(
      res,
      { message: `Password for ${targetUser} rotated successfully` },
      200,
      req.id,
    );
  }),
);

/*                  GET /api/ssh/sessions                                                                                                                                                                                                  */
router.get(
  '/sessions',
  asyncHandler(async (req: Request, res: Response) => {
    logger.info('[SSH:AUDIT] Active sessions requested', {
      requestId: req.id,
      actor: req.user!.sub,
      action: 'SSH_GET_SESSIONS',
    });

    const sessions = await sshService.getActiveSessions(req.id);
    return sendSuccess(res, { sessions, count: sessions.length }, 200, req.id);
  }),
);

/*                  GET /api/ssh/policy                                                                                                                                                                                                                  */
router.get(
  '/policy',
  [query('user').trim().notEmpty().withMessage('user query parameter is required')],
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const targetUser = req.query.user as string;

    logger.info('[SSH:AUDIT] Password policy check', {
      requestId: req.id,
      actor: req.user!.sub,
      action: 'SSH_GET_POLICY',
      targetUser,
    });

    const policy = await sshService.enforcePasswordPolicy(targetUser, req.id);
    return sendSuccess(res, { user: targetUser, policy }, 200, req.id);
  }),
);

export default router;
