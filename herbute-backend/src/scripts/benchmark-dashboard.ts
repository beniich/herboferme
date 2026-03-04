import axios from 'axios';
import { performance } from 'perf_hooks';

const API_URL = process.env.API_URL || 'http://localhost:2065/api';
const EMAIL = process.env.BENCHMARK_EMAIL || 'admin@reclamtrack.com';
const PASSWORD = process.env.BENCHMARK_PASSWORD || 'Admin123!';

async function benchmark() {
    try {
        console.log('--- DASHBOARD BENCHMARK ---');

        // 1. Login
        console.log(`Logging in as ${EMAIL}...`);
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: EMAIL,
            password: PASSWORD
        });

        const token = loginRes.data.token;
        const organizationId = loginRes.data.user.organizationId || loginRes.data.user.orgId;

        if (!token) throw new Error('Failed to get token');

        const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'x-organization-id': organizationId
            }
        };

        console.log(`Using Organization ID: ${organizationId}`);
        console.log('Running 10 requests to /api/dashboard...');

        const durations: number[] = [];
        for (let i = 0; i < 10; i++) {
            const start = performance.now();
            await axios.get(`${API_URL}/dashboard`, config);
            const end = performance.now();
            durations.push(end - start);
            process.stdout.write('.');
        }
        console.log('\n');

        const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
        const min = Math.min(...durations);
        const max = Math.max(...durations);

        console.log(`Results for /api/dashboard:`);
        console.log(`  Average: ${avg.toFixed(2)}ms`);
        console.log(`  Min:     ${min.toFixed(2)}ms`);
        console.log(`  Max:     ${max.toFixed(2)}ms`);

    } catch (error: any) {
        console.error('Benchmark failed:', error.response?.data || error.message);
    }
}

benchmark();
