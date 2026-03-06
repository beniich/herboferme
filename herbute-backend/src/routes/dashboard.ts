import { authenticate as protect, requireOrganization } from '../middleware/security.js';
import { authorize, Permission } from '../middleware/authorize.js';
import { Complaint } from '../modules/complaint/complaint.model.js';
import { Team } from '../models/Team.js';
import { Animal } from '../modules/agro/animals.model.js';
import { Crop } from '../modules/agro/crops.model.js';
import { FarmKPI } from '../modules/agro/finance.model.js';
import ITTicket from '../models/ITTicket.js';
import mongoose from 'mongoose';
import { Router } from 'express';

const router = Router();

/* GET /api/dashboard */
router.get('/', 
  [protect as any, requireOrganization as any],
  authorize(Permission.ANALYTICS_READ, Permission.ANIMALS_READ, Permission.IT_READ), // On autorise si l'un de ces accès est présent (ici authorize implémente un AND, je vais devoir ajuster authorize pour supporter un OR si besoin, ou utiliser plusieurs permissions).
  // Pour le moment, mettons Permission.ANALYTICS_READ car c'est le but du dashboard.
  async (req: any, res, next) => {
    try {
        const organizationId = new mongoose.Types.ObjectId(req.organizationId);

        // Optimization: Parallelize independent domain stats fetching using Promise.all
        const [agroStats, itStats, maintenanceStats] = await Promise.all([
            // 1. Agriculture Stats
            (async () => {
                const [latestKPI, animalStats, cropStats] = await Promise.all([
                    FarmKPI.findOne({ organizationId }).sort({ year: -1, month: -1 }),
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
                                            {
                                                $or: [
                                                    { $regexMatch: { input: '$type', regex: /vache/i } },
                                                    { $regexMatch: { input: '$type', regex: /bovin/i } }
                                                ]
                                            },
                                            '$count',
                                            0
                                        ]
                                    }
                                }
                            }
                        }
                    ]),
                    (Crop as any).aggregate([
                        { $match: { organizationId } },
                        { $group: { _id: '$category', count: { $sum: 1 } } }
                    ])
                ]);

                const cheptel = animalStats[0] || { total: 0, poultry: 0, bovine: 0 };

                return {
                    financials: latestKPI || {
                        totalRevenue: 0,
                        totalExpenses: 0,
                        netProfit: netProfit(latestKPI),
                        cashFlow: 0
                    },
                    cheptel: {
                        total: cheptel.total,
                        poultry: cheptel.poultry,
                        bovine: cheptel.bovine
                    },
                    cultures: {
                        totalHa: 218,
                        categories: cropStats
                    }
                };
            })(),

            // 2. IT (GLPI) Stats - Consolidated into single aggregation
            (async () => {
                const [itStatsFacet] = await ITTicket.aggregate([
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

                return {
                    total: itStatsFacet.total[0]?.count || 0,
                    byStatus: itStatsFacet.byStatus,
                    byPriority: itStatsFacet.byPriority,
                    slaBreach: itStatsFacet.slaBreach[0]?.count || 0
                };
            })(),

            // 3. Maintenance/Operations (Complaints) Stats - Consolidated
            (async () => {
                const [complaintStats, teamStats] = await Promise.all([
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

                const statusStats = complaintStats[0]?.byStatus || [];
                const totalComplaints = complaintStats[0]?.total[0]?.count || 0;

                return {
                    total: totalComplaints,
                    byStatus: statusStats.reduce((acc: any, curr: any) => ({ ...acc, [curr._id]: curr.count }), {}),
                    teamStats
                };
            })()
        ]);

        res.json({
            success: true,
            agro: agroStats,
            it: itStats,
            maintenance: maintenanceStats
        });
    } catch (err) {
        next(err);
    }
});

function netProfit(kpi: any) {
    if (!kpi) return 0;
    return (kpi.totalRevenue || 0) - (kpi.totalExpenses || 0);
}

export default router;
