import { authenticate as protect, requireOrganization } from '../middleware/security.js';
import { Complaint } from '../models/Complaint.js';
import { Team } from '../models/Team.js';
import Animal from '../models/Animal.js';
import Crop from '../models/Crop.js';
import FarmKPI from '../models/FarmKPI.js';
import ITTicket from '../models/ITTicket.js';
import mongoose from 'mongoose';
import express from 'express';
import { cacheMiddleware, CACHE_TTL } from '../middleware/cache.js';

const router = express.Router();

/* GET /api/dashboard */
router.get('/', [protect, requireOrganization, cacheMiddleware(CACHE_TTL.dashboard)], async (req: any, res, next) => {
    try {
        const organizationId = new mongoose.Types.ObjectId(req.organizationId);

        // OPTIMIZATION: Consolidate multiple queries into parallel executions using Promise.all
        // and use MongoDB $facet to reduce database round-trips for each model's statistics.
        const [agroBase, itStatsArray, maintenanceStatsArray, teamStats] = await Promise.all([
            // 1. Agriculture: KPI + Animal Aggregation
            Promise.all([
                FarmKPI.findOne({ organizationId }).sort({ year: -1, month: -1 }).lean(),
                Animal.aggregate([
                    { $match: { organizationId } },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: '$count' },
                            poultry: {
                                $sum: {
                                    $cond: [{ $regexMatch: { input: '$type', regex: /poul/i } }, '$count', 0]
                                }
                            },
                            bovine: {
                                $sum: {
                                    $cond: [
                                        { $or: [
                                            { $regexMatch: { input: '$type', regex: /vache/i } },
                                            { $regexMatch: { input: '$type', regex: /bovin/i } }
                                        ]},
                                        '$count',
                                        0
                                    ]
                                }
                            }
                        }
                    }
                ]),
                Crop.aggregate([
                    { $match: { organizationId } },
                    { $group: { _id: '$category', count: { $sum: 1 } } }
                ])
            ]),

            // 2. IT Stats: Consolidate counts and groupings into one aggregation
            ITTicket.aggregate([
                { $match: { organizationId } },
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

            // 3. Maintenance Stats: Consolidate count and status grouping
            Complaint.aggregate([
                { $match: { organizationId } },
                {
                    $facet: {
                        total: [{ $count: 'count' }],
                        byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }]
                    }
                }
            ]),

            // 4. Team Stats (Independent aggregation)
            Team.aggregate([
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
                                    cond: { $ne: ['$$a.status', 'terminé'] }
                                }
                            }
                        }
                    }
                }
            ])
        ]);

        // Post-processing Agro
        const [latestKPI, animalAgg, cropAgg] = agroBase;
        const animalStats = animalAgg[0] || { total: 0, poultry: 0, bovine: 0 };

        const agroStats = {
            financials: latestKPI || { totalRevenue: 0, totalExpenses: 0, netProfit: 0, cashFlow: 0 },
            cheptel: {
                total: animalStats.total,
                poultry: animalStats.poultry,
                bovine: animalStats.bovine
            },
            cultures: {
                totalHa: 218,
                categories: cropAgg
            }
        };

        // Post-processing IT
        const itFacet = itStatsArray[0];
        const itStats = {
            total: itFacet.total[0]?.count || 0,
            byStatus: itFacet.byStatus,
            byPriority: itFacet.byPriority,
            slaBreach: itFacet.slaBreach[0]?.count || 0
        };

        // Post-processing Maintenance
        const maintFacet = maintenanceStatsArray[0];
        const maintStats = {
            total: maintFacet.total[0]?.count || 0,
            byStatus: (maintFacet.byStatus || []).reduce((acc: any, curr: any) => ({ ...acc, [curr._id]: curr.count }), {}),
            teamStats
        };

        res.json({
            success: true,
            agro: agroStats,
            it: itStats,
            maintenance: maintStats
        });
    } catch (err) {
        next(err);
    }
});

export default router;
