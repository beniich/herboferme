import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Complaint } from '../models/Complaint.js';
import Animal from '../models/Animal.js';
import Crop from '../models/Crop.js';
import ITTicket from '../models/ITTicket.js';
import FarmKPI from '../models/FarmKPI.js';
import { Organization } from '../models/Organization.js';
import { User } from '../models/user.model.js';
import { Membership } from '../models/Membership.js';
import { Team } from '../models/Team.js';
import { Assignment } from '../models/Assignment.js';
import dotenv from 'dotenv';

dotenv.config();

async function benchmark() {
    await connectDB();
    console.log('Connected to DB');

    // 1. Setup Data
    let org = await Organization.findOne({ slug: 'benchmark-org' });
    if (!org) {
        const owner = await User.findOne();
        if (!owner) throw new Error('No user found to own org');
        org = await Organization.create({
            name: 'Benchmark Org',
            slug: 'benchmark-org',
            ownerId: owner._id,
            subscription: { plan: 'PRO', status: 'ACTIVE' }
        });
        console.log('Created benchmark organization');
    }

    const organizationId = org._id;

    // Clear existing data for this org
    await Promise.all([
        Animal.deleteMany({ organizationId }),
        Crop.deleteMany({ organizationId }),
        ITTicket.deleteMany({ organizationId }),
        Complaint.deleteMany({ organizationId }),
        FarmKPI.deleteMany({ organizationId }),
        Team.deleteMany({ organizationId }),
        Assignment.deleteMany({ organizationId })
    ]);

    console.log('Creating mock data...');

    // Create Animals
    const animals: any[] = [];
    for (let i = 0; i < 500; i++) {
        animals.push({
            organizationId,
            type: i % 2 === 0 ? 'Vache' : 'Poulet',
            breed: 'Mix',
            count: 10,
            averageAge: 2,
            category: i % 2 === 0 ? 'LIVESTOCK' : 'POULTRY'
        });
    }
    await Animal.insertMany(animals);

    // Create IT Tickets
    const tickets: any[] = [];
    const statuses = ['new', 'assigned', 'in_progress', 'pending', 'resolved', 'closed'];
    const priorities = ['low', 'medium', 'high', 'urgent', 'critical'];
    const user = await User.findOne();
    for (let i = 0; i < 500; i++) {
        tickets.push({
            organizationId,
            ticketNumber: `IT-BENCH-${i}`,
            title: `Ticket ${i}`,
            description: 'Desc',
            category: 'hardware',
            status: statuses[i % statuses.length],
            priority: priorities[i % priorities.length],
            requestedBy: user!._id,
            sla: { breached: i % 10 === 0 }
        });
    }
    await (ITTicket as any).insertMany(tickets);

    // Create Complaints
    const complaints: any[] = [];
    const cStatuses = ['nouvelle', 'en cours', 'rÃ©solue', 'fermÃ©e', 'rejetÃ©e'];
    for (let i = 0; i < 500; i++) {
        complaints.push({
            organizationId,
            number: `COMP-${i}`,
            category: 'Roads',
            subcategory: 'Pothole',
            priority: 'medium',
            title: `Complaint ${i}`,
            description: 'Desc',
            address: 'Addr',
            city: 'City',
            district: 'Dist',
            status: cStatuses[i % cStatuses.length]
        });
    }
    await (Complaint as any).insertMany(complaints);

    // Create Teams and Assignments
    const teams = await Team.insertMany([
        { name: 'Team A', organizationId, color: '#ff0000' } as any,
        { name: 'Team B', organizationId, color: '#00ff00' } as any
    ]);

    const assignments: any[] = [];
    const complaint = await Complaint.findOne({ organizationId });
    for (let i = 0; i < 100; i++) {
        assignments.push({
            complaintId: complaint!._id,
            teamId: teams[i % 2]._id,
            status: i % 3 === 0 ? 'terminé' : 'en cours'
        });
    }
    await (Assignment as any).insertMany(assignments);

    console.log('Data ready. Starting benchmark...');

    // 2. Mock Request Logic (simulating what's in dashboard.ts)
    const runDashboardQueriesOriginal = async () => {
        const start = Date.now();

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
                totalHa: 218,
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

        const end = Date.now();
        return end - start;
    };

    const runDashboardQueriesOptimized = async () => {
        const start = Date.now();
        const orgIdObj = new mongoose.Types.ObjectId(organizationId);

        const [latestKPI, animalStats, cropStats, itStatsResult, complaintStats, teamStats] = await Promise.all([
            FarmKPI.findOne({ organizationId }).sort({ year: -1, month: -1 }).lean(),
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
            Crop.aggregate([
                { $match: { organizationId: orgIdObj } },
                { $group: { _id: '$category', count: { $sum: 1 } } }
            ]),
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
            Complaint.aggregate([
                { $match: { organizationId: orgIdObj } },
                {
                    $facet: {
                        total: [{ $count: 'count' }],
                        byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }]
                    }
                }
            ]),
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

        const end = Date.now();
        return end - start;
    };

    const iterations = 10;

    console.log('\nRunning Original Queries...');
    let totalTimeOriginal = 0;
    for (let i = 0; i < iterations; i++) {
        const time = await runDashboardQueriesOriginal();
        if (i > 0) totalTimeOriginal += time; // Skip warm-up
    }
    console.log(`Average Original: ${totalTimeOriginal / (iterations - 1)}ms`);

    console.log('\nRunning Optimized Queries...');
    let totalTimeOptimized = 0;
    for (let i = 0; i < iterations; i++) {
        const time = await runDashboardQueriesOptimized();
        if (i > 0) totalTimeOptimized += time; // Skip warm-up
    }
    console.log(`Average Optimized: ${totalTimeOptimized / (iterations - 1)}ms`);

    process.exit(0);
}

benchmark().catch(err => {
    console.error(err);
    process.exit(1);
});
