
import mongoose from 'mongoose';
import { Complaint } from '../models/Complaint.js';
import { Team } from '../models/Team.js';
import Animal from '../models/Animal.js';
import Crop from '../models/Crop.js';
import FarmKPI from '../models/FarmKPI.js';
import ITTicket from '../models/ITTicket.js';
import { performance } from 'perf_hooks';

async function mockBenchmark() {
    console.log('--- MOCK DASHBOARD BENCHMARK (In-Memory / Demo Mode) ---');

    const organizationId = new mongoose.Types.ObjectId().toString();

    // 1. Warm up
    console.log('Warming up queries...');
    for(let i=0; i<3; i++) {
        await runQueries(organizationId);
    }

    // 2. Benchmark
    console.log('Benchmarking parallelized dashboard queries...');
    const iterations = 10;
    const durations: number[] = [];

    for(let i=0; i<iterations; i++) {
        const start = performance.now();
        await runQueries(organizationId);
        const end = performance.now();
        durations.push(end - start);
    }

    const avg = durations.reduce((a, b) => a + b, 0) / iterations;
    console.log(`\nResults (${iterations} iterations):`);
    console.log(`Average Query Execution Time: ${avg.toFixed(2)}ms`);
    console.log(`Min: ${Math.min(...durations).toFixed(2)}ms`);
    console.log(`Max: ${Math.max(...durations).toFixed(2)}ms`);
}

async function runQueries(organizationId: string) {
    return Promise.all([
        FarmKPI.findOne({ organizationId }).sort({ year: -1, month: -1 }).lean(),
        Animal.aggregate([
            { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$count' },
                    poultry: { $sum: { $cond: [{ $regexMatch: { input: '$type', regex: /poul/i } }, '$count', 0] } },
                    bovine: { $sum: { $cond: [{ $or: [{ $regexMatch: { input: '$type', regex: /vache/i } }, { $regexMatch: { input: '$type', regex: /bovin/i } }] }, '$count', 0] } }
                }
            }
        ]),
        Crop.aggregate([
            { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]),
        ITTicket.aggregate([
            { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
            {
                $facet: {
                    total: [{ $count: 'count' }],
                    byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
                    byPriority: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
                    slaBreach: [{ $match: { 'sla.breached': true } }, { $count: 'count' }]
                }
            }
        ]),
        Complaint.aggregate([
            { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
            {
                $facet: {
                    total: [{ $count: 'count' }],
                    byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }]
                }
            }
        ]),
        Team.aggregate([
            { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
            { $lookup: { from: 'assignments', localField: '_id', foreignField: 'teamId', as: 'assignments' } },
            { $project: { name: 1, color: 1, activeAssignments: { $size: { $filter: { input: '$assignments', as: 'a', cond: { $ne: ['$$a.status', 'terminé'] } } } } } }
        ])
    ]);
}

mockBenchmark().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
