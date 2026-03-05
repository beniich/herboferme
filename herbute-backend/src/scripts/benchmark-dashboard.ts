
import axios from 'axios';
import { performance } from 'perf_hooks';

const API_URL = process.env.API_URL || 'http://localhost:2065/api';
const LOGIN_EMAIL = 'superadmin@herbute.ma';
const LOGIN_PASSWORD = 'SuperAdmin2026!';

async function benchmark() {
    try {
        console.log('--- DASHBOARD BENCHMARK ---');
        console.log(`Connecting to ${API_URL}...`);

        // 1. Login to get token
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: LOGIN_EMAIL,
            password: LOGIN_PASSWORD
        });

        const token = loginRes.data.token;
        const orgId = loginRes.data.user.organizationId || loginRes.data.organizationId;

        if (!token) throw new Error('Login failed: no token');

        const headers = {
            'Authorization': `Bearer ${token}`,
            'x-organization-id': orgId
        };

        // 2. Warm up
        console.log('Warming up...');
        for(let i=0; i<3; i++) {
            await axios.get(`${API_URL}/dashboard`, { headers });
        }

        // 3. Actual Benchmark
        console.log('Benchmarking /api/dashboard...');
        const iterations = 10;
        const durations: number[] = [];

        for(let i=0; i<iterations; i++) {
            const start = performance.now();
            await axios.get(`${API_URL}/dashboard`, { headers });
            const end = performance.now();
            durations.push(end - start);
        }

        const avg = durations.reduce((a, b) => a + b, 0) / iterations;
        const min = Math.min(...durations);
        const max = Math.max(...durations);

        console.log(`\nResults (${iterations} iterations):`);
        console.log(`Average: ${avg.toFixed(2)}ms`);
        console.log(`Min: ${min.toFixed(2)}ms`);
        console.log(`Max: ${max.toFixed(2)}ms`);

    } catch (error: unknown) {
        const err = error as any;
        if (err.code === 'ECONNREFUSED') {
            console.error('Error: Backend is not running. Please start the backend first.');
        } else {
            console.error('Benchmark failed:', err.response?.data || err.message);
        }
    }
}

benchmark();
