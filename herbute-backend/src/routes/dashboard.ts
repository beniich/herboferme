import { authenticate as protect, requireOrganization } from '../middleware/security.js';
import { Complaint } from '../models/Complaint.js';
import { Team } from '../models/Team.js';
import Animal from '../models/Animal.js';
import Crop from '../models/Crop.js';
import FarmKPI from '../models/FarmKPI.js';
import ITTicket from '../models/ITTicket.js';
import mongoose from 'mongoose';
import express from 'express';
const router = express.Router();

/* GET /api/dashboard */
router.get('/', [protect, requireOrganization], async (req: any, res, next) => {
    try {
        const organizationId = req.organizationId;
        const orgIdObj = new mongoose.Types.ObjectId(organizationId);

        // Execute all top-level queries in parallel to avoid sequential blocking
        const [latestKPI, animalStats, cropStats, itStatsResult, complaintStats, teamStats] = await Promise.all([
            // 1. Latest Financial KPI
            FarmKPI.findOne({ organizationId }).sort({ year: -1, month: -1 }).lean(),

            // 2. Animal Statistics (Aggregated on server to avoid fetching 1000s of docs)
            Animal.aggregate([
                { $match: { organizationId: orgIdObj } },
                {
                    $group: {
                        _id: null,
                        totalCount: { $sum: '$count' },
                        poultryCount: {
                            $sum: {
                                $cond: [{ $regexMatch: { input: '$type', regex: /poul/i } }, '$count', 0]
                            }
                        },
                        bovineCount: {
                            $sum: {
                                $cond: [
                                    { $regexMatch: { input: '$type', regex: /vache|bovin/i } },
                                    '$count',
                                    0
                                ]
                            }
                        }
                    }
                }
            ]),

            // 3. Crop Statistics
            Crop.aggregate([
                { $match: { organizationId: orgIdObj } },
                { $group: { _id: '$category', count: { $sum: 1 } } }
            ]),

            // 4. IT Ticket Statistics (Consolidated into single $facet query)
            ITTicket.aggregate([
                { $match: { organizationId: orgIdObj } },
                {
                    $facet: {
                        total: [{ $count: 'count' }],
                        byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
                        byPriority: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
                        slaBreach: [
                            { $match: { 'sla.breached': true } },
                            { $count: 'count' }
                        ]
                    }
                }
            ]),

            // 5. Complaint Statistics (Consolidated into single $facet query)
            Complaint.aggregate([
                { $match: { organizationId: orgIdObj } },
                {
                    $facet: {
                        total: [{ $count: 'count' }],
                        byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }]
                    }
                }
            ]),

            // 6. Team & Assignment Statistics
            Team.aggregate([
                { $match: { organizationId: orgIdObj } },
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
                                    cond: { $ne: ['$$a.status', 'terminé'] }
                                }
                            }
                        }
                    }
                }
            ])
        ]);

        // Process Animal aggregate results
        const animals = animalStats[0] || { totalCount: 0, poultryCount: 0, bovineCount: 0 };

        // Process IT stats from facet
        const it = itStatsResult[0];
        const processedItStats = {
            total: it?.total[0]?.count || 0,
            byStatus: it?.byStatus || [],
            byPriority: it?.byPriority || [],
            slaBreach: it?.slaBreach[0]?.count || 0
        };

        // Process Complaint stats from facet
        const complaints = complaintStats[0];
        const totalComplaints = complaints?.total[0]?.count || 0;
        const statusStats = complaints?.byStatus || [];

        res.json({
            success: true,
            agro: {
                financials: latestKPI || {
                    totalRevenue: 0,
                    totalExpenses: 0,
                    netProfit: 0,
                    cashFlow: 0
                },
                cheptel: {
                    total: animals.totalCount,
                    poultry: animals.poultryCount,
                    bovine: animals.bovineCount
                },
                cultures: {
                    totalHa: 218,
                    categories: cropStats
                }
            },
            it: processedItStats,
            maintenance: {
                total: totalComplaints,
                byStatus: statusStats.reduce((acc: any, curr: any) => ({ ...acc, [curr._id]: curr.count }), {}),
                teamStats
            }
        });
    } catch (err) {
        next(err);
    }
});

export default router;
