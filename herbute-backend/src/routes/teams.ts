import { Router } from 'express';
import { authenticate as protect, requireAdmin as adminOnly } from '../middleware/security.js';
import { requireOrganization } from '../middleware/security.js';
import { Team } from '../models/Team.js';
import { body, param } from 'express-validator';
import { validator } from '../middleware/validator.js';
import { eventBus } from '../services/eventBus.js';

const router = Router();

// Apply organization context
router.use(protect, requireOrganization);

/* GET /api/teams */
router.get('/', async (req, res, next) => {
    try {
        const teams = await Team.find({ organizationId: (req as any).organizationId });
        res.json(teams);
    } catch (err) {
        next(err);
    }
});

/* POST /api/teams */
router.post(
    '/',
    adminOnly,
    [
        body('name').notEmpty(),
        body('color').optional().isHexColor(),
        body('status').optional().isIn(['disponible', 'intervention', 'repos']),
        body('members').optional().isArray(),
        body('leaderId').optional().isMongoId()
    ],
    validator,
    // ... imports

    // Create Route
    async (req, res, next) => {
        try {
            const team = await Team.create({
                ...req.body,
                organizationId: (req as any).organizationId
            });

            // Kafka Event
            await eventBus.publish('team-events', 'TEAM_CREATED', {
                teamId: team._id,
                name: team.name,
                status: team.status,
                timestamp: new Date()
            });

            res.status(201).json(team);
        } catch (err) {
            next(err);
        }
    }
);


/* PATCH /api/teams/:id */
router.patch(
    '/:id',
    adminOnly,
    async (req, res, next) => {
        try {
            const team = await Team.findOneAndUpdate(
                { _id: req.params.id, organizationId: (req as any).organizationId },
                req.body,
                { new: true }
            );
            if (!team) return res.status(404).json({ message: 'Équipe introuvable' });

            // Kafka Event
            await eventBus.publish('team-events', 'TEAM_UPDATED', {
                teamId: team._id,
                name: team.name,
                status: team.status,
                timestamp: new Date()
            });

            res.json(team);
        } catch (err) {
            next(err);
        }
    }
);

export default router;
