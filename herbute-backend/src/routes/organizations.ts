import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { validator } from '../middleware/validator.js';
import { authenticate as protect } from '../middleware/security.js';
import { Organization } from '../models/Organization.js';
import { Membership } from '../models/Membership.js';
import AuditLog from '../models/AuditLog.js';

const router = Router();

/**
 * @route   POST /api/organizations
 * @desc    Create a new organization
 * @access  Private
 */
router.post(
    '/',
    protect,
    [
        body('name').notEmpty().trim().isLength({ min: 3, max: 100 }),
        body('slug').notEmpty().trim().isLength({ min: 3, max: 50 }).matches(/^[a-z0-9-]+$/)
    ],
    validator,
    async (req: any, res: Response) => {
        try {
            const { name, slug } = req.body;
            const userId = req.user?._id || req.user?.id;

            // Check if slug already exists
            const existing = await Organization.findOne({ slug });
            if (existing) {
                return res.status(409).json({ message: 'Ce slug est déjà utilisé' });
            }

            // Create organization
            const organization = await Organization.create({
                name,
                slug,
                ownerId: userId,
                subscription: {
                    plan: 'FREE',
                    status: 'TRIAL',
                    maxUsers: 5,
                    maxTickets: 100,
                    // Trial expires in 14 days
                    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
                }
            });

            // Create membership for the creator (OWNER role)
            await Membership.create({
                userId,
                organizationId: organization._id,
                roles: ['OWNER'],
                status: 'ACTIVE'
            });

            // Audit log
            await AuditLog.create({
                action: 'CREATE_ORGANIZATION',
                userId,
                targetId: organization._id.toString(),
                targetType: 'Organization',
                details: { name, slug },
                ipAddress: req.ip
            });

            res.status(201).json({
                success: true,
                organization
            });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
);

/**
 * @route   GET /api/organizations
 * @desc    Get all organizations the user is a member of
 * @access  Private
 */
router.get('/', protect, async (req: any, res: Response) => {
    try {
        const userId = req.user?._id || req.user?.id;

        // Find all memberships for this user
        const memberships = await Membership.find({
            userId,
            status: 'ACTIVE'
        }).populate('organizationId');

        const organizations = memberships.map(m => ({
            ...(m.organizationId as any).toObject(),
            membership: {
                roles: m.roles,
                joinedAt: m.joinedAt
            }
        }));

        res.json({ success: true, organizations });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @route   GET /api/organizations/:id
 * @desc    Get organization details
 * @access  Private (must be a member)
 */
router.get('/:id', protect, async (req: any, res: Response) => {
    try {
        const userId = req.user?._id || req.user?.id;
        const { id } = req.params;

        // Check membership
        const membership = await Membership.findOne({
            userId,
            organizationId: id,
            status: 'ACTIVE'
        });

        if (!membership) {
            return res.status(403).json({ message: 'Accès refusé à cette organisation' });
        }

        const organization = await Organization.findById(id);
        if (!organization) {
            return res.status(404).json({ message: 'Organisation introuvable' });
        }

        res.json({
            success: true,
            organization,
            membership: {
                roles: membership.roles,
                joinedAt: membership.joinedAt
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @route   PATCH /api/organizations/:id
 * @desc    Update organization settings
 * @access  Private (Admin only)
 */
router.patch('/:id', protect, async (req: any, res: Response) => {
    try {
        const userId = req.user?._id || req.user?.id;
        const { id } = req.params;

        // Check admin permission
        const membership = await Membership.findOne({
            userId,
            organizationId: id,
            status: 'ACTIVE'
        });

        if (!membership || !membership.isAdmin()) {
            return res.status(403).json({ message: 'Droits insuffisants' });
        }

        const organization = await Organization.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!organization) {
            return res.status(404).json({ message: 'Organisation introuvable' });
        }

        res.json({ success: true, organization });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
