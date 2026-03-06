import { Router } from 'express';
import { authenticate as protect } from '../middleware/security.js';
import { body, param } from 'express-validator';
import { validator } from '../middleware/validator.js';
import { Requisition, RequisitionStatus } from '../models/Requisition.js';
import { io } from '../services/socketService.js';
import { eventBus } from '../services/eventBus.js';

const router = Router();

// Données mockées pour les articles d'inventaire
const inventoryItems = [
    { id: '1', code: 'ELEC-001', name: 'Câble Électrique 10mm', category: 'Électricité', unit: 'm', currentStock: 150, minStock: 50, price: 25.50 },
    { id: '2', code: 'EAU-002', name: 'Tuyau PVC 50mm', category: 'Plomberie', unit: 'm', currentStock: 80, minStock: 20, price: 18.00 },
    { id: '3', code: 'ROAD-003', name: 'Bitume à froid', category: 'Voirie', unit: 'kg', currentStock: 500, minStock: 100, price: 12.75 },
    { id: '4', code: 'LIGHT-004', name: 'Lampe LED 100W', category: 'Éclairage', unit: 'pcs', currentStock: 30, minStock: 10, price: 45.00 },
    { id: '5', code: 'ELEC-005', name: 'Disjoncteur 32A', category: 'Électricité', unit: 'pcs', currentStock: 25, minStock: 15, price: 35.00 },
    { id: '6', code: 'EAU-006', name: 'Robinet d\'arrêt', category: 'Plomberie', unit: 'pcs', currentStock: 40, minStock: 10, price: 22.50 },
    { id: '7', code: 'ROAD-007', name: 'Peinture routière blanche', category: 'Voirie', unit: 'L', currentStock: 120, minStock: 30, price: 28.00 },
    { id: '8', code: 'LIGHT-008', name: 'Ballast électronique', category: 'Éclairage', unit: 'pcs', currentStock: 18, minStock: 8, price: 52.00 },
    { id: '9', code: 'TOOL-009', name: 'Pelle', category: 'Outillage', unit: 'pcs', currentStock: 12, minStock: 5, price: 65.00 },
    { id: '10', code: 'TOOL-010', name: 'Pioche', category: 'Outillage', unit: 'pcs', currentStock: 10, minStock: 5, price: 58.00 },
    { id: '11', code: 'EAU-011', name: 'Colle PVC', category: 'Plomberie', unit: 'kg', currentStock: 15, minStock: 5, price: 32.00 },
    { id: '12', code: 'SIGN-012', name: 'Panneau Stop', category: 'Signalisation', unit: 'pcs', currentStock: 8, minStock: 3, price: 125.00 }
];

// GET /api/inventory/items/search - Rechercher des articles
router.get('/items/search', protect, async (req: any, res, next) => {
    try {
        const { q, category, lowStock } = req.query;

        let results = [...inventoryItems];

        // Filtrer par terme de recherche
        if (q) {
            const searchTerm = q.toString().toLowerCase();
            results = results.filter(item =>
                item.name.toLowerCase().includes(searchTerm) ||
                item.code.toLowerCase().includes(searchTerm) ||
                item.category.toLowerCase().includes(searchTerm)
            );
        }

        // Filtrer par catégorie
        if (category) {
            results = results.filter(item => item.category === category);
        }

        // Filtrer par stock faible
        if (lowStock === 'true') {
            results = results.filter(item => item.currentStock <= item.minStock);
        }

        res.json({
            success: true,
            data: results,
            total: results.length
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/inventory/items - Liste tous les articles
router.get('/items', protect, async (req: any, res, next) => {
    try {
        res.json({
            success: true,
            data: inventoryItems,
            total: inventoryItems.length
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/inventory/items/:id - Détails d'un article
router.get('/items/:id', protect, async (req: any, res, next) => {
    try {
        const item = inventoryItems.find(i => i.id === req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Article introuvable'
            });
        }

        res.json({
            success: true,
            data: item
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/inventory/requisitions
router.get('/requisitions', protect, async (req: any, res, next) => {
    try {
        const query: any = {};

        // Filter by user role ?
        // If basic user, only see own requisitions
        if (['technician', 'staff'].includes(req.user.role)) {
            query.requesterId = req.user.id;
        }

        const requisitions = await Requisition.find(query)
            .populate('requesterId', 'name email')
            .populate('complaintId', 'number')
            .sort({ createdAt: -1 });

        res.json(requisitions);
    } catch (err) {
        next(err);
    }
});

// POST /api/inventory/requisitions
router.post(
    '/requisitions',
    protect,
    [
        body('items').isArray({ min: 1 }),
        body('items.*.description').notEmpty(),
        body('items.*.quantity').isInt({ min: 1 })
    ],
    validator,
    async (req: any, res, next) => {
        try {
            const requisition = await Requisition.create({
                ...req.body,
                requesterId: req.user.id,
                status: RequisitionStatus.DRAFT,
                history: [{
                    status: RequisitionStatus.DRAFT,
                    action: 'created',
                    userId: req.user.id,
                    timestamp: new Date()
                }]
            });

            // Kafka Event
            await eventBus.publish('inventory-events', 'REQUISITION_CREATED', {
                requisitionId: (requisition as any)._id,
                requesterId: req.user.id,
                timestamp: new Date()
            });

            res.status(201).json(requisition);
        } catch (err) {
            next(err);
        }
    }
);

// PATCH /api/inventory/requisitions/:id/status
router.patch(
    '/requisitions/:id/status',
    protect,
    [
        param('id').isMongoId(),
        body('status').isIn(Object.values(RequisitionStatus)),
        body('comment').optional().isString()
    ],
    validator,
    async (req: any, res, next) => {
        try {
            const { status, comment } = req.body;

            const requisition = await Requisition.findById(req.params.id);
            if (!requisition) return res.status(404).json({ message: 'Requisition not found' });

            // Add simple logic check here (e.g. only warehouse_manager can approve)
            // For now, allow loosely based on role presence, assuming frontend limits actions.

            requisition.status = status;
            requisition.history.push({
                status,
                action: 'status_change',
                userId: req.user.id,
                comment,
                timestamp: new Date()
            });

            await requisition.save();

            if (io) {
                io.emit('requisition-updated', requisition);
            }

            // Kafka Event
            await eventBus.publish('inventory-events', 'REQUISITION_STATUS_UPDATED', {
                requisitionId: requisition._id,
                status: status,
                updatedBy: req.user.id,
                timestamp: new Date()
            });

            res.json(requisition);
        } catch (err) {
            next(err);
        }
    }
);

// --- Aliases for Frontend Compatibility ---

// POST /api/inventory/requests -> POST /api/inventory/requisitions
router.post('/requests', protect,
    [
        body('items').isArray({ min: 1 }),
        body('items.*.description').notEmpty(),
        body('items.*.quantity').isInt({ min: 1 })
    ],
    validator,
    async (req: any, res, next) => {
        try {
            const requisition = await Requisition.create({
                ...req.body,
                requesterId: req.user.id,
                status: RequisitionStatus.DRAFT,
                history: [{
                    status: RequisitionStatus.DRAFT,
                    action: 'created',
                    userId: req.user.id,
                    timestamp: new Date()
                }]
            });

            // Kafka Event
            await eventBus.publish('inventory-events', 'REQUISITION_CREATED', {
                requisitionId: (requisition as any)._id,
                requesterId: req.user.id,
                timestamp: new Date()
            });

            res.status(201).json(requisition);
        } catch (err) {
            next(err);
        }
    }
);

// GET /api/inventory/requests -> GET /api/inventory/requisitions
router.get('/requests', protect, async (req: any, res, next) => {
    try {
        const query: any = {};

        // Filter by user role ?
        // If basic user, only see own requisitions
        if (['technician', 'staff'].includes(req.user.role)) {
            query.requesterId = req.user.id;
        }

        const requisitions = await Requisition.find(query)
            .populate('requesterId', 'name email')
            .populate('complaintId', 'number')
            .sort({ createdAt: -1 });

        res.json(requisitions);
    } catch (err) {
        next(err);
    }
});

// POST /api/inventory/requests/:id/approve
router.post('/requests/:id/approve', protect, async (req: any, res, next) => {
    try {
        const requisition = await Requisition.findById(req.params.id);
        if (!requisition) return res.status(404).json({ message: 'Requisition not found' });

        requisition.status = RequisitionStatus.APPROVED;
        requisition.history.push({
            status: RequisitionStatus.APPROVED,
            action: 'status_change',
            userId: req.user.id,
            comment: 'Approved via API',
            timestamp: new Date()
        });

        await requisition.save();

        if (io) {
            io.emit('requisition-updated', requisition);
        }

        // Kafka Event
        await eventBus.publish('inventory-events', 'REQUISITION_STATUS_UPDATED', {
            requisitionId: requisition._id,
            status: RequisitionStatus.APPROVED,
            updatedBy: req.user.id,
            timestamp: new Date()
        });

        res.json(requisition);
    } catch (err) {
        next(err);
    }
});

// POST /api/inventory/requests/:id/reject
router.post('/requests/:id/reject', protect, async (req: any, res, next) => {
    try {
        const requisition = await Requisition.findById(req.params.id);
        if (!requisition) return res.status(404).json({ message: 'Requisition not found' });

        requisition.status = RequisitionStatus.REJECTED;
        requisition.history.push({
            status: RequisitionStatus.REJECTED,
            action: 'status_change',
            userId: req.user.id,
            comment: req.body.comment || 'Rejected via API',
            timestamp: new Date()
        });

        await requisition.save();

        if (io) {
            io.emit('requisition-updated', requisition);
        }

        // Kafka Event
        await eventBus.publish('inventory-events', 'REQUISITION_STATUS_UPDATED', {
            requisitionId: requisition._id,
            status: RequisitionStatus.REJECTED,
            updatedBy: req.user.id,
            timestamp: new Date()
        });

        res.json(requisition);
    } catch (err) {
        next(err);
    }
});

export default router;

