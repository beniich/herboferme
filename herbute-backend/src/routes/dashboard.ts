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

    // Parallel execution of all dashboard queries to improve response time
    const [
      latestKPI,
      animalStats,
      cropCategories,
      itFacet,
      complaintFacet,
      teamStats,
    ] = await Promise.all([
      // 1. Agriculture Stats
      FarmKPI.findOne({ organizationId }).sort({ year: -1, month: -1 }).lean(),
      Animal.aggregate([
        { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
        {
          $group: {
            _id: null,
            total: { $sum: '$count' },
            poultry: {
              $sum: {
                $cond: [{ $regexMatch: { input: '$type', regex: /poul/i } }, '$count', 0],
              },
            },
            bovine: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $regexMatch: { input: '$type', regex: /vache/i } },
                      { $regexMatch: { input: '$type', regex: /bovin/i } },
                    ],
                  },
                  '$count',
                  0,
                ],
              },
            },
          },
        },
      ]),
      Crop.aggregate([
        { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),

      // 2. IT (GLPI) Stats - Consolidating multiple queries into one via $facet
      ITTicket.aggregate([
        { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
        {
          $facet: {
            total: [{ $count: 'count' }],
            byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
            byPriority: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
            slaBreach: [{ $match: { 'sla.breached': true } }, { $count: 'count' }],
          },
        },
      ]),

      // 3. Maintenance/Operations (Complaints) Stats - Consolidating multiple queries into one via $facet
      Complaint.aggregate([
        { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
        {
          $facet: {
            total: [{ $count: 'count' }],
            byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
          },
        },
      ]),

      // 4. Team Stats
      Team.aggregate([
        { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
        {
          $lookup: {
            from: 'assignments',
            localField: '_id',
            foreignField: 'teamId',
            as: 'assignments',
          },
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
                  cond: { $ne: ['$$a.status', 'terminé'] },
                },
              },
            },
          },
        },
      ]),
    ]);

    const agroStats = {
      financials: latestKPI || {
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        cashFlow: 0,
      },
      cheptel: {
        total: animalStats[0]?.total || 0,
        poultry: animalStats[0]?.poultry || 0,
        bovine: animalStats[0]?.bovine || 0,
      },
      cultures: {
        totalHa: 218,
        categories: cropCategories,
      },
    };

    const itStats = {
      total: itFacet[0]?.total[0]?.count || 0,
      byStatus: itFacet[0]?.byStatus || [],
      byPriority: itFacet[0]?.byPriority || [],
      slaBreach: itFacet[0]?.slaBreach[0]?.count || 0,
    };

    res.json({
      success: true,
      agro: agroStats,
      it: itStats,
      maintenance: {
        total: complaintFacet[0]?.total[0]?.count || 0,
        byStatus: (complaintFacet[0]?.byStatus || []).reduce(
          (acc: any, curr: any) => ({ ...acc, [curr._id]: curr.count }),
          {}
        ),
        teamStats,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
