import { authenticate as protect, requireOrganization } from '../middleware/security.js';
import { Complaint } from '../models/Complaint.js';
import { Team } from '../models/Team.js';
import Animal from '../models/Animal.js';
import Crop from '../models/Crop.js';
import FarmKPI from '../models/FarmKPI.js';
import ITTicket from '../models/ITTicket.js';
import mongoose from 'mongoose';
import { Router } from 'express';

const router = Router();

/* GET /api/dashboard */
router.get('/', [protect, requireOrganization], async (req: any, res, next) => {
    try {
        const organizationId = req.organizationId;

        // 1. Agriculture Stats
        const latestKPI = await FarmKPI.findOne({ organizationId }).sort({ year: -1, month: -1 });
        const animals = await Animal.find({ organizationId });
        const crops = await Crop.find({ organizationId });

        const agroStats = {
            financials: latestKPI || {
                totalRevenue: 0,
                totalExpenses: 0,
                netProfit: 0,
                cashFlow: 0
            },
            cheptel: {
                total: animals.reduce((sum, a) => sum + a.count, 0),
                poultry: animals.filter(a => a.type.toLowerCase().includes('poul')).reduce((sum, a) => sum + a.count, 0),
                bovine: animals.filter(a => a.type.toLowerCase().includes('vache') || a.type.toLowerCase().includes('bovin')).reduce((sum, a) => sum + a.count, 0)
            },
            cultures: {
                totalHa: 218, // Could be aggregated from parcel models
                categories: await Crop.aggregate([
                    { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
                    { $group: { _id: '$category', count: { $sum: 1 } } }
                ])
            }
        };

        // 2. IT (GLPI) Stats
        const itStats = {
            total: await ITTicket.countDocuments({ organizationId }),
            byStatus: await ITTicket.aggregate([
                { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            byPriority: await ITTicket.aggregate([
                { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
                { $group: { _id: '$priority', count: { $sum: 1 } } }
            ]),
            slaBreach: await ITTicket.countDocuments({ 
                organizationId, 
                'sla.breached': true 
            })
        };

        // 3. Maintenance/Operations (Complaints) Stats
        const totalComplaints = await Complaint.countDocuments({ organizationId });
        const statusStats = await Complaint.aggregate([
            { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const teamStats = await Team.aggregate([
            { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
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
