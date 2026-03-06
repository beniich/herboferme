import mongoose from 'mongoose';
import { Animal } from '../modules/agro/animals.model.js';
import { Crop } from '../modules/agro/crops.model.js';
import { FarmKPI } from '../modules/agro/finance.model.js';
import ITTicket from '../models/ITTicket.js';
import { Complaint } from '../modules/complaint/complaint.model.js';
import { Team } from '../models/Team.js';
import { Organization } from '../models/Organization.js';
import { performance } from 'perf_hooks';

// Helper for netProfit
function netProfit(kpi: any) {
    if (!kpi) return 0;
    return (kpi.totalRevenue || 0) - (kpi.totalExpenses || 0);
}

// SIMULATED LATENCY
const DB_LATENCY = 50;
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function originalLogic(organizationId: string) {
    const orgId = new mongoose.Types.ObjectId(organizationId);

    // 1. Agriculture Stats (Simulated Serial)
    await sleep(DB_LATENCY); // latestKPI
    await sleep(DB_LATENCY); // animals
    await sleep(DB_LATENCY); // crops
    await sleep(DB_LATENCY); // crops aggregate

    // 2. IT (GLPI) Stats (Simulated Serial)
    await sleep(DB_LATENCY); // total
    await sleep(DB_LATENCY); // byStatus
    await sleep(DB_LATENCY); // byPriority
    await sleep(DB_LATENCY); // slaBreach

    // 3. Maintenance/Operations (Complaints) Stats (Simulated Serial)
    await sleep(DB_LATENCY); // totalComplaints
    await sleep(DB_LATENCY); // statusStats
    await sleep(DB_LATENCY); // teamStats

    return { success: true };
}

async function optimizedLogic(organizationId: string) {
    const orgId = new mongoose.Types.ObjectId(organizationId);

    // [agroStats, itStats, maintenanceStats] in parallel
    await Promise.all([
        // Agro block
        (async () => {
            await Promise.all([
                sleep(DB_LATENCY), // latestKPI
                sleep(DB_LATENCY), // animals (now aggregate)
                sleep(DB_LATENCY)  // crops aggregate
            ]);
        })(),
        // IT block
        (async () => {
            await sleep(DB_LATENCY); // Consolidated facet
        })(),
        // Maintenance block
        (async () => {
            await Promise.all([
                sleep(DB_LATENCY), // Consolidated facet
                sleep(DB_LATENCY)  // Team stats
            ]);
        })()
    ]);

    return { success: true };
}

async function runBenchmark() {
    console.log('🚀 Starting Benchmark comparison (SIMULATED 50ms LATENCY)...');

    const mockOrgId = new mongoose.Types.ObjectId().toString();
    const iterations = 10;

    console.log('\n--- Original Logic (Serial) ---');
    const timingsOriginal: number[] = [];
    for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await originalLogic(mockOrgId);
        const end = performance.now();
        timingsOriginal.push(end - start);
    }
    const avgOriginal = timingsOriginal.reduce((a, b) => a + b, 0) / iterations;
    console.log(`Average: ${avgOriginal.toFixed(2)}ms`);

    console.log('\n--- Optimized Logic (Parallel + Consolidated) ---');
    const timingsOptimized: number[] = [];
    for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await optimizedLogic(mockOrgId);
        const end = performance.now();
        timingsOptimized.push(end - start);
    }
    const avgOptimized = timingsOptimized.reduce((a, b) => a + b, 0) / iterations;
    console.log(`Average: ${avgOptimized.toFixed(2)}ms`);

    const improvement = ((avgOriginal - avgOptimized) / avgOriginal) * 100;
    console.log(`\n⚡ Improvement: ${improvement.toFixed(2)}% faster`);
    console.log(`📉 Latency reduction: ${(avgOriginal - avgOptimized).toFixed(2)}ms`);
}

runBenchmark().catch(console.error);
