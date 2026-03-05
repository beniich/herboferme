import mongoose from 'mongoose';
import { config } from 'dotenv';
import { Organization } from '../models/Organization.js';
import { FarmTransaction, FarmKPI } from '../modules/agro/finance.model.js';

config();

const dump = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        const orgs = await Organization.find();
        console.log('Organizations:', orgs.map(o => ({ id: o._id, name: o.name })));

        for (const org of orgs) {
            console.log(`\n--- Org: ${org.name} (${org._id}) ---`);
            const txs = await FarmTransaction.find({ organizationId: org._id });
            console.log(`Transactions (${txs.length}):`);
            const revenue = txs.filter(t => t.type === 'recette').reduce((acc, t) => acc + t.amount, 0);
            const expenses = txs.filter(t => t.type === 'depense').reduce((acc, t) => acc + t.amount, 0);
            console.log(`  Computed Revenue: ${revenue}`);
            console.log(`  Computed Expenses: ${expenses}`);

            const kpis = await FarmKPI.find({ organizationId: org._id });
            console.log(`KPIs (${kpis.length}):`, kpis);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

dump();
