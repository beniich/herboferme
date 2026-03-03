import { Router, Request, Response } from 'express';
import { authenticate as auth } from '../middleware/security.js';
import AuditLog from '../models/AuditLog.js';
import { logger } from '../utils/logger.js';

const router = Router();

// GET /api/audit-logs - Retrieve audit logs
router.get('/', auth, async (req: Request, res: Response) => {
    try {
        const { limit = '50', page = '1', action, userId } = req.query;

        if ((global as any).IS_DEMO_MODE) {
            return res.json({
                data: [
                    { action: 'LOGIN', user: 'admin@reclamtrack.com', targetType: 'Session', timestamp: new Date() },
                    { action: 'SECURITY_AUDIT', user: 'system', targetType: 'System', timestamp: new Date(Date.now() - 3600000) },
                    { action: 'WAF_BLOCK', user: 'Firewall', targetType: 'Network', timestamp: new Date(Date.now() - 7200000) }
                ],
                pagination: { total: 3, page: 1, pages: 1 }
            });
        }

        const query: any = { /* Intentionally empty */ };
        if (action) query.action = action;
        if (userId) query.userId = userId;

        const limitNum = parseInt(limit as string, 10);
        const pageNum = parseInt(page as string, 10);
        const skip = (pageNum - 1) * limitNum;

        const logs = await AuditLog.find(query)
            .sort({ timestamp: -1 })
            .limit(limitNum)
            .skip(skip)
            .populate('userId', 'name email role') // Populate user details
            .lean();

        const total = await AuditLog.countDocuments(query);

        res.json({
            data: logs,
            pagination: {
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        logger.error('Error fetching audit logs:', error);
        res.status(500).json({ message: 'Server error retrieving audit logs' });
    }
});

// POST /api/audit-logs - Create a log (Internal use or specific client actions)
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
        res.status(201).json(log);
    } catch (error) {
        logger.error('Error creating audit log:', error);
        res.status(500).json({ message: 'Server error creating audit log' });
    }
});

export default router;
