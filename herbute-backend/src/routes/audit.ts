import { Router, Request, Response } from 'express';
import { authenticate as auth } from '../middleware/security.js';
import AuditLog from '../models/AuditLog.js';
import { logger } from '../utils/logger.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const router = Router();

// GET /api/audit-logs - Retrieve audit logs
router.get('/', auth, async (req: Request, res: Response) => {
    try {
        const { limit = '50', page = '1', action, userId } = req.query;

        if ((global as any).IS_DEMO_MODE) {
            return sendSuccess(res, {
                logs: [
                    { action: 'LOGIN', user: 'admin@reclamtrack.com', targetType: 'Session', timestamp: new Date() },
                    { action: 'SECURITY_AUDIT', user: 'system', targetType: 'System', timestamp: new Date(Date.now() - 3600000) },
                    { action: 'WAF_BLOCK', user: 'Firewall', targetType: 'Network', timestamp: new Date(Date.now() - 7200000) }
                ],
                pagination: { total: 3, page: 1, pages: 1 }
            });
        }

        const query: any = {};
        if (action) query.action = action;
        if (userId) query.userId = userId;

        const limitNum = parseInt(limit as string, 10);
        const pageNum = parseInt(page as string, 10);
        const skip = (pageNum - 1) * limitNum;

        const logs = await AuditLog.find(query)
            .sort({ timestamp: -1 })
            .limit(limitNum)
            .skip(skip)
            .populate('userId', 'name email role')
            .lean();

        const total = await AuditLog.countDocuments(query);

        return sendSuccess(res, {
            logs,
            pagination: {
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error: any) {
        logger.error('Error fetching audit logs:', error);
        return sendError(res, 'Server error retrieving audit logs', 'SERVER_ERROR');
    }
});

// POST /api/audit-logs
router.post('/', auth, async (req: Request, res: Response) => {
    try {
        const { action, targetId, targetType, details } = req.body;

        const log = new AuditLog({
            action,
            userId: (req as any).user._id,
            targetId,
            targetType,
            details,
            ipAddress: req.ip
        });

        await log.save();
        return sendSuccess(res, log, 201);
    } catch (error: any) {
        logger.error('Error creating audit log:', error);
        return sendError(res, 'Server error creating audit log', 'SERVER_ERROR');
    }
});

export default router;
