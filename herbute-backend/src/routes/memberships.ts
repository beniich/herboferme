import { Router, Response } from 'express';
import { body } from 'express-validator';
import { validator } from '../middleware/validator.js';
import { authenticate as protect } from '../middleware/security.js';
import { Membership } from '../models/Membership.js';
import { Organization } from '../models/Organization.js';
import { User } from '../models/user.model.js';
import AuditLog from '../models/AuditLog.js';

const router = Router();

/**
 * @route   GET /api/memberships/organizations/:orgId/members
 * @desc    Get all members of an organization
 * @access  Private (must be a member)
 */
router.get('/organizations/:orgId/members', protect, async (req: any, res: Response) => {
    try {
        const userId = req.user._id;
        const { orgId } = req.params;

        // Check if user is a member
        const userMembership = await Membership.findOne({
            userId,
            organizationId: orgId,
            status: 'ACTIVE'
        });

        if (!userMembership) {
            return res.status(403).json({ message: 'Accès refusé' });
        }

        // Get all members
        const members = await Membership.find({
            organizationId: orgId
        }).populate('userId', 'email name avatar');

        res.json({ success: true, members });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @route   POST /api/memberships/organizations/:orgId/invite
 * @desc    Invite a user to an organization
 * @access  Private (Admin only)
 */
router.post(
    '/organizations/:orgId/invite',
    protect,
    [body('email').isEmail()],
    validator,
    async (req: any, res: Response) => {
        try {
            const userId = req.user._id;
            const { orgId } = req.params;
            const { email, roles = ['MEMBER'] } = req.body;

            // Check if user is admin
            const userMembership = await Membership.findOne({
                userId,
                organizationId: orgId,
                status: 'ACTIVE'
            }) as any; // Cast to any or specific interface with methods

            if (!userMembership || !userMembership.isAdmin()) {
                return res.status(403).json({ message: 'Droits insuffisants' });
            }

            // Check organization limits
            const organization = await Organization.findById(orgId);
            if (!organization) {
                return res.status(404).json({ message: 'Organisation introuvable' });
            }

            const memberCount = await Membership.countDocuments({
                organizationId: orgId,
                status: { $in: ['ACTIVE', 'INVITED'] }
            });

            if (memberCount >= (organization.subscription.maxUsers || 5)) {
                return res.status(403).json({
                    message: 'Limite d\'utilisateurs atteinte pour votre plan'
                });
            }

            // Find user by email
            const invitedUser = await User.findOne({ email });
            if (!invitedUser) {
                return res.status(404).json({ message: 'Utilisateur introuvable' });
            }

            // Check if already a member
            const existing = await Membership.findOne({
                userId: invitedUser._id,
                organizationId: orgId
            });

            if (existing) {
                return res.status(409).json({ message: 'Déjà membre de cette organisation' });
            }

            // Create membership
            const membership = await Membership.create({
                userId: invitedUser._id,
                organizationId: orgId,
                roles,
                status: 'INVITED',
                invitedBy: userId
            });

            // TODO: Send invitation email

            await AuditLog.create({
                action: 'INVITE_MEMBER',
                userId,
                targetId: membership._id.toString(),
                targetType: 'Membership',
                details: { email, roles },
                ipAddress: req.ip
            });

            res.status(201).json({ success: true, membership });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
);

/**
 * @route   PATCH /api/memberships/:membershipId/roles
 * @desc    Update member roles
 * @access  Private (Admin only)
 */
router.patch(
    '/:membershipId/roles',
    protect,
    [body('roles').isArray()],
    validator,
    async (req: any, res: Response) => {
        try {
            const userId = req.user._id;
            const { membershipId } = req.params;
            const { roles } = req.body;

            const membership = await Membership.findById(membershipId);
            if (!membership) {
                return res.status(404).json({ message: 'Membership introuvable' });
            }

            // Check if user is admin of this org
            const userMembership = await Membership.findOne({
                userId,
                organizationId: membership.organizationId,
                status: 'ACTIVE'
            }) as any;

            if (!userMembership || !userMembership.isAdmin()) {
                return res.status(403).json({ message: 'Droits insuffisants' });
            }

            // Update roles
            membership.roles = roles;
            await membership.save();

            res.json({ success: true, membership });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
);

/**
 * @route   DELETE /api/memberships/:membershipId
 * @desc    Remove a member from organization
 * @access  Private (Admin only)
 */
router.delete('/:membershipId', protect, async (req: any, res: Response) => {
    try {
        const userId = req.user._id;
        const { membershipId } = req.params;

        const membership = await Membership.findById(membershipId);
        if (!membership) {
            return res.status(404).json({ message: 'Membership introuvable' });
        }

        // Check if user is admin
        const userMembership = await Membership.findOne({
            userId,
            organizationId: membership.organizationId,
            status: 'ACTIVE'
        }) as any;

        if (!userMembership || !userMembership.isAdmin()) {
            return res.status(403).json({ message: 'Droits insuffisants' });
        }

        // Prevent removing the owner
        if (membership.roles.includes('OWNER')) {
            const organization = await Organization.findById(membership.organizationId);
            if (organization && organization.ownerId.toString() === membership.userId.toString()) {
                return res.status(403).json({
                    message: 'Impossible de retirer le propriétaire'
                });
            }
        }

        await membership.deleteOne();

        res.json({ success: true, message: 'Membre retiré' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
