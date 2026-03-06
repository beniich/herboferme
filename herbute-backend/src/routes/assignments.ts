import { Router } from 'express';
import { authenticate as protect } from '../middleware/security.js';
import { body } from 'express-validator';
import { validator } from '../middleware/validator.js';
import { Assignment } from '../models/Assignment.js';
import { Complaint } from '../modules/complaint/complaint.model.js';
import { Team } from '../models/Team.js';
import { io } from '../services/socketService.js';

const router = Router();

/* GET /api/assignments - Get assignments for the current user (via Team) */
router.get(
    '/',
    protect,
    async (req: any, res, next) => {
        try {
            // 1. Find teams where the user is a member
            const teams = await Team.find({ members: req.user.id });
            const teamIds = teams.map(t => t._id);

            // 2. Find assignments for these teams
            // We verify that status is not 'terminé' to get active/pending ones (or use query param to filter)
            const { status } = req.query;
            const filter: any = { teamId: { $in: teamIds } };

            if (status) {
                filter.status = status;
            }

            const assignments = await Assignment.find(filter)
                .populate('complaintId') // Get details of the complaint
                .populate('teamId', 'name color') // Get basic team info
                .sort({ createdAt: -1 }); // Newest first

            res.json(assignments);
        } catch (err) {
            next(err);
        }
    }
);

/* POST /api/assignments */
router.post(
    '/',
    protect,
    [
        body('complaintId').isMongoId(),
        body('teamId').isMongoId()
    ],
    validator,
    async (req, res, next) => {
        try {
            const { complaintId, teamId } = req.body;

            const complaint = await Complaint.findById(complaintId);
            const team = await Team.findById(teamId);
            if (!complaint || !team) {
                return res.status(404).json({ message: 'Réclamation ou équipe introuvable' });
            }

            const assignment = await Assignment.create({
                complaintId,
                teamId,
                status: 'affecté'
            });

            complaint.status = 'en cours';
            await complaint.save();

            team.status = 'intervention';
            await team.save();

            if (io) {
                io.emit('assignment-created', { assignment, complaint, team });
            }

            res.status(201).json(assignment);
        } catch (err) {
            next(err);
        }
    }
);

/* PATCH /api/assignments/:id */
router.patch(
    '/:id',
    protect,
    [
        body('status').isIn(['affecté', 'en cours', 'terminé'])
    ],
    validator,
    async (req, res, next) => {
        try {
            const assignment = await Assignment.findByIdAndUpdate(
                req.params.id,
                { status: req.body.status },
                { new: true }
            );
            if (!assignment) return res.status(404).json({ message: 'Affectation introuvable' });

            if (io) {
                io.emit('assignment-updated', assignment);
            }
            res.json(assignment);
        } catch (err) {
            next(err);
        }
    }
);

export default router;
