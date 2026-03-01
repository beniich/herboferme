import { Router } from 'express';
import { authenticate as protect, requireOrganization } from '../middleware/security.js';
import { Complaint } from '../models/Complaint.js';
import { Team } from '../models/Team.js';
import Animal from '../models/Animal.js';
import Crop from '../models/Crop.js';
import FarmKPI from '../models/FarmKPI.js';
import ITTicket from '../models/ITTicket.js';
import mongoose from 'mongoose';

const router = Router();

/* GET /api/dashboard */
router.get('/', [protect, requireOrganization], async (req: any, res, next) => {
    try {
        const organizationId = new mongoose.Types.ObjectId(req.organizationId);

        // 1. Agriculture Stats
        const latestKPI = await FarmKPI.findOne({ organizationId }).sort({ year: -1, month: -1 });

        // Optimization: Use MongoDB aggregation for animal counts instead of in-memory reduction
        const animalStats = await Animal.aggregate([
            { $match: { organizationId } },
            {
                $facet: {
                    total: [{ $group: { _id: null, count: { $sum: '$count' } } }],
                    poultry: [
                        { $match: { type: { $regex: /poul/i } } },
                        { $group: { _id: null, count: { $sum: '$count' } } }
                    ],
                    bovine: [
                        { $match: { type: { $regex: /vache|bovin/i } } },
                        { $group: { _id: null, count: { $sum: '$count' } } }
                    ]
                }
            }
        ]);

        const agroStats = {
            financials: latestKPI || {
                totalRevenue: 0,
                totalExpenses: 0,
                netProfit: 0,
                cashFlow: 0
            },
            cheptel: {
                total: animalStats[0]?.total[0]?.count || 0,
                poultry: animalStats[0]?.poultry[0]?.count || 0,
                bovine: animalStats[0]?.bovine[0]?.count || 0
            },
            cultures: {
                totalHa: 218, // Could be aggregated from parcel models
                categories: await Crop.aggregate([
                    { $match: { organizationId } },
                    { $group: { _id: '$category', count: { $sum: 1 } } }
                ])
            }
        };

        // 2. IT (GLPI) Stats
        // Optimization: Consolidate IT ticket stats into a single aggregation with $facet
        const itTicketResults = await ITTicket.aggregate([
            { $match: { organizationId } },
            {
                $facet: {
                    total: [{ $count: 'count' }],
                    byStatus: [
                        { $group: { _id: '$status', count: { $sum: 1 } } }
                    ],
                    byPriority: [
                        { $group: { _id: '$priority', count: { $sum: 1 } } }
                    ],
                    slaBreach: [
                        { $match: { 'sla.breached': true } },
                        { $count: 'count' }
                    ]
                }
            }
        ]);

        const itStats = {
            total: itTicketResults[0]?.total[0]?.count || 0,
            byStatus: itTicketResults[0]?.byStatus || [],
            byPriority: itTicketResults[0]?.byPriority || [],
            slaBreach: itTicketResults[0]?.slaBreach[0]?.count || 0
        };

        // 3. Maintenance/Operations (Complaints) Stats
        // Optimization: Consolidate complaint stats into a single aggregation with $facet
        const complaintResults = await Complaint.aggregate([
            { $match: { organizationId } },
            {
                $facet: {
                    total: [{ $count: 'count' }],
                    byStatus: [
                        { $group: { _id: '$status', count: { $sum: 1 } } }
                    ]
                }
            }
        ]);

        const totalComplaints = complaintResults[0]?.total[0]?.count || 0;
        const statusStats = complaintResults[0]?.byStatus || [];

        const teamStats = await Team.aggregate([
            { $match: { organizationId } },
            {
                $lookup: {
                    from: 'assignments',
                    localField: '_id',
                    foreignField: 'teamId',
                    as: 'assignments'
                }
            },
            {
                $project: {
                    name: 1,
                    color: 1,
                    activeAssignments: {
                        $size: {
                            $filter: {
                                input: '$assignments',
                                as: 'a',
                                cond: { $ne: ['$$a.status', 'terminÃ©'] }
                            }
                        }
                    }
                }
            }
        ]);

        res.json({
            success: true,
            agro: agroStats,
            it: itStats,
            maintenance: {
                total: totalComplaints,
                byStatus: statusStats.reduce((acc: any, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
                teamStats
            }
        });
    } catch (err) {
        next(err);
    }
});

export default router;
