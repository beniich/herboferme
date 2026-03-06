import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { validator } from '../middleware/validator.js';
import { authenticate as protect } from '../middleware/security.js';
import { Membership } from '../models/Membership.js';
import { User } from '../models/user.model.js';
import { Organization } from '../models/Organization.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Middleware helper to check if requester is admin of the org
const requireAdmin = async (req: any, res: Response, next: any) => {
    try {
        const { orgId } = req.params;
        const userId = req.user._id;

        const membership = await Membership.findOne({
            userId,
            organizationId: orgId,
            status: 'ACTIVE'
        });

        if (!membership || !membership.isAdmin()) {
            return res.status(403).json({ message: 'Droits administrateur requis' });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Erreur de vérification des droits' });
    }
};

/**
 * @route   GET /api/organizations/:orgId/members
 * @desc    List all members of an organization
 * @access  Private (Member)
 */
router.get('/organizations/:orgId/members', protect, async (req: any, res: Response) => {
    try {
        const { orgId } = req.params;
        const userId = req.user._id;

        // Verify user is at least a member
        const requesterMembership = await Membership.findOne({
            userId,
            organizationId: orgId,
            status: 'ACTIVE'
        });

        if (!requesterMembership) {
            return res.status(403).json({ message: 'Accès refusé' });
        }

        const members = await Membership.find({ organizationId: orgId })
            .populate('userId', 'name email avatar')
            .populate('invitedBy', 'name');

        res.json({
            success: true,
            data: members.map(m => ({
                id: m._id,
                user: m.userId,
                roles: m.roles,
                status: m.status,
                joinedAt: m.joinedAt,
                invitedBy: m.invitedBy
            }))
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @route   POST /api/organizations/:orgId/members
 * @desc    Invite a user to the organization
 * @access  Private (Admin)
 */
router.post(
    '/organizations/:orgId/members',
    protect,
    requireAdmin,
    [
        body('email').isEmail().withMessage('Email invalide'),
        body('role').isIn(['ADMIN', 'MEMBER', 'TECHNICIAN']).withMessage('Rôle invalide')
    ],
    validator,
    async (req: any, res: Response) => {
        try {
            const { orgId } = req.params;
            const { email, role } = req.body;
            const inviterId = req.user._id;

            // Find user by email
            const user = await User.findOne({ email });

            // If user doesn't exist, we should theoretically create a placeholder or send an invite email
            // For this MVP, we'll require the user to exist
            if (!user) {
                return res.status(404).json({ message: 'Utilisateur non trouvé avec cet email' });
            }

            // Check if already a member
            const existingMembership = await Membership.findOne({
                userId: user._id,
                organizationId: orgId
            });

            if (existingMembership) {
                return res.status(409).json({ message: 'Cet utilisateur est déjà membre ou invité' });
            }

            // Create membership
            const membership = await Membership.create({
                userId: user._id,
                organizationId: orgId,
                roles: [role],
                status: 'INVITED', // Should be INVITED, but for MVP simplifying to ACTIVE or INVITED logic
                invitedBy: inviterId
            });

            // TODO: Send email invitation via nodemailer

            res.status(201).json({
                success: true,
                message: 'Invitation envoyée',
                membership
            });

        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
);

/**
 * @route   PATCH /api/organizations/:orgId/members/:memberId
 * @desc    Update member role
 * @access  Private (Admin)
 */
router.patch(
    '/organizations/:orgId/members/:membershipId',
    protect,
    requireAdmin,
    [
        body('roles').isArray().withMessage('Roles doit être un tableau')
    ],
    validator,
    async (req: any, res: Response) => {
        try {
            const { membershipId } = req.params;
            const { roles } = req.body;

            // Prevent removing last owner
            // (Implementation simplistic for MVP)

            const membership = await Membership.findByIdAndUpdate(
                membershipId,
                { $set: { roles } },
                { new: true }
            );

            if (!membership) {
                return res.status(404).json({ message: 'Membre introuvable' });
            }

            res.json({ success: true, membership });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
);

/**
 * @route   DELETE /api/organizations/:orgId/members/:memberId
 * @desc    Remove member from organization
 * @access  Private (Admin)
 */
router.delete(
    '/organizations/:orgId/members/:membershipId',
    protect,
    requireAdmin,
    async (req: any, res: Response) => {
        try {
            const { membershipId } = req.params;

            // Prevent self-deletion if owner? 
            // Allow for now, frontend should handle warnings

            await Membership.findByIdAndDelete(membershipId);

            res.json({ success: true, message: 'Membre retiré' });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
);

export default router;
