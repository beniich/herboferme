   import axios from 'axios';
import { performance } from 'perf_hooks';

const API_URL = process.env.API_URL || 'http://localhost:5001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

interface DiagnosticResult {
    service: string;
    metric: string;
    value: number;
    unit: string;
    status: 'good' | 'warning' | 'critical';
}

const results: DiagnosticResult[] = [];

function addResult(service: string, metric: string, value: number, unit: string, thresholds: { good: number; warning: number }) {
    let status: 'good' | 'warning' | 'critical' = 'good';
    if (value > thresholds.warning) status = 'critical';
    else if (value > thresholds.good) status = 'warning';

    results.push({ service, metric, value, unit, status });
}

async function measureApiEndpoint(name: string, url: string) {
    try {
        const start = performance.now();
        const response = await axios.get(url, { timeout: 5000 });
        const end = performance.now();
        const duration = end - start;

        addResult('API', `${name} - Response Time`, duration, 'ms', { good: 100, warning: 300 });

        if (response.headers['content-length']) {
            const size = parseInt(response.headers['content-length']) / 1024;
            addResult('API', `${name} - Payload Size`, size, 'KB', { good: 50, warning: 200 });
        }
    } catch (error: any) {
        console.error(`       Failed to test ${name}:`, error.message);
        results.push({ service: 'API', metric: `${name} - Availability`, value: 0, unit: 'available', status: 'critical' });
    }
}

async function testDatabasePerformance() {
    // Test endpoints that don't require authentication for initial diagnostic
    console.log('Testing API endpoints...');

    // Health check (no auth required)
    try {
        const start = performance.now();
        await axios.get(`${API_URL}/`);
        const end = performance.now();
        addResult('API', 'Health Check', end - start, 'ms', { good: 50, warning: 150 });
    } catch (error) {
        results.push({ service: 'API', metric: 'Health Check', value: 0, unit: 'available', status: 'critical' });
    }
}

async function testFrontendMetrics() {
    try {
        const start = performance.now();
        const response = await axios.get(FRONTEND_URL, { timeout: 10000 });
        const end = performance.now();
        const duration = end - start;

        addResult('Frontend', 'Initial Load Time', duration, 'ms', { good: 500, warning: 1500 });

        if (response.headers['content-length']) {
            const size = parseInt(response.headers['content-length']) / 1024;
            addResult('Frontend', 'HTML Size', size, 'KB', { good: 100, warning: 300 });
        }
    } catch (error: any) {
        console.error('       Frontend test failed:', error.message);
        results.push({ service: 'Frontend', metric: 'Availability', value: 0, unit: 'available', status: 'critical' });
    }
}

function printResults() {
    console.log('\n=====================================');
    console.log('          DIAGNOSTIC DE PERFORMANCE');
    console.log('=====================================\n');

    const serviceGroups = results.reduce((acc, result) => {
        if (!acc[result.service]) acc[result.service] = [];
        acc[result.service].push(result);
        return acc;
    }, {} as Record<string, DiagnosticResult[]>);

    for (const [service, metrics] of Object.entries(serviceGroups)) {
        console.log(`\n          ${service.toUpperCase()}`);
        console.log('        '.repeat(50));

        metrics.forEach(metric => {
            const icon = metric.status === 'good' ? '       ' : metric.status === 'warning' ? '           ' : '      ';
            console.log(`${icon} ${metric.metric}: ${metric.value.toFixed(2)} ${metric.unit}`);
        });
    }

    // Summary
    const good = results.filter(r => r.status === 'good').length;
    const warning = results.filter(r => r.status === 'warning').length;
    const critical = results.filter(r => r.status === 'critical').length;

    console.log('\n=====================================');
    console.log('R     SUM     ');
    console.log('=====================================');
    console.log(`        Bon: ${good}`);
    console.log(`            Attention: ${warning}`);
    console.log(`       Critique: ${critical}`);
    console.log(`Total: ${results.length} m    triques test    es\n`);
}

async function runDiagnostic() {
    console.log('          Lancement du diagnostic de performance...\n');

    await testFrontendMetrics();
    await testDatabasePerformance();

    printResults();
}

runDiagnostic().catch(console.error);
