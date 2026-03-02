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

        // Parallelize fetching Agro, IT, and Maintenance stats
        const [agroStats, itStats, maintenance] = await Promise.all([
            // 1. Agriculture Stats
            (async () => {
                const [latestKPI, animalStats, cropStats] = await Promise.all([
                    FarmKPI.findOne({ organizationId }).sort({ year: -1, month: -1 }).lean(),
                    Animal.aggregate([
                        { $match: { organizationId } },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: '$count' },
                                poultry: {
                                    $sum: {
                                        $cond: [
                                            { $regexMatch: { input: '$type', regex: /poul/i } },
                                            '$count',
                                            0
                                        ]
                                    }
                                },
                                bovine: {
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
                    Crop.aggregate([
                        { $match: { organizationId } },
                        { $group: { _id: '$category', count: { $sum: 1 } } }
                    ])
                ]);

                const animals = animalStats[0] || { total: 0, poultry: 0, bovine: 0 };

                return {
                    financials: latestKPI || {
                        totalRevenue: 0,
                        totalExpenses: 0,
                        netProfit: 0,
                        cashFlow: 0
                    },
                    cheptel: {
                        total: animals.total,
                        poultry: animals.poultry,
                        bovine: animals.bovine
                    },
                    cultures: {
                        totalHa: 218, // Could be aggregated from parcel models
                        categories: cropStats
                    }
                };
            })(),

            // 2. IT (GLPI) Stats
            (async () => {
                const itData = await ITTicket.aggregate([
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
                ]);

                const facet = itData[0];
                return {
                    total: facet.total[0]?.count || 0,
                    byStatus: facet.byStatus,
                    byPriority: facet.byPriority,
                    slaBreach: facet.slaBreach[0]?.count || 0
                };
            })(),

            // 3. Maintenance/Operations (Complaints) Stats
            (async () => {
                const [complaintData, teamStats] = await Promise.all([
                    Complaint.aggregate([
                        { $match: { organizationId } },
                        {
                            $facet: {
                                total: [{ $count: 'count' }],
                                byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }]
                            }
                        }
                    ]),
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

                const facet = complaintData[0];
                return {
                    total: facet.total[0]?.count || 0,
                    byStatus: (facet.byStatus || []).reduce((acc: any, curr: any) => ({ ...acc, [curr._id]: curr.count }), {}),
                    teamStats
                };
            })()
        ]);

        res.json({
            success: true,
            agro: agroStats,
            it: itStats,
            maintenance
        });
    } catch (err) {
        next(err);
    }
});

export default router;
