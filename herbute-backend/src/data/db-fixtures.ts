// db-fixtures.ts          donn    es factices pour l'administration de base de donn    es

// --- Clusters & Replicas ---
export const clusters = [
    {
        id: "master",
        name: "PostgreSQL Master",
        role: "master",
        status: "healthy",
        version: "13.4-1",
        uptime: "12d 23h",
        cpu: 38,
        ram: { used: 16, total: 32 },
        iops: 1200,
        connections: 112,
    },
    {
        id: "replica-1",
        name: "Replica #1",
        role: "replica",
        status: "sync",
        lag: 0.04,
        version: "13.4-1",
        cpu: 22,
        ram: { used: 12, total: 32 },
        iops: 950,
        connections: 78,
    },
    {
        id: "replica-2",
        name: "Replica #2",
        role: "replica",
        status: "lagging",
        lag: 0.07,
        version: "13.4-1",
        cpu: 30,
        ram: { used: 15, total: 32 },
        iops: 1050,
        connections: 102,
    },
];

// --- Backups ---
export const backups = [
    {
        id: "2024-02-11-01",
        timestamp: "2024-02-11T09:00:00Z",
        sizeGB: 120,
        durationSec: 120,
        status: "success",
    },
    {
        id: "2024-02-10-01",
        timestamp: "2024-02-10T09:00:00Z",
        sizeGB: 118,
        durationSec: 115,
        status: "failed",
        error: "network timeout",
    },
    {
        id: "2024-02-09-01",
        timestamp: "2024-02-09T09:00:00Z",
        sizeGB: 115,
        durationSec: 108,
        status: "success",
    },
];

// --- Network Visualization (NetViz) ---
export const networkNodes = [
    { id: '1', type: 'lb', label: 'Load Balancer', status: 'healthy', x: 100, y: 300 },
    { id: '2', type: 'app', label: 'App Server 1', status: 'healthy', x: 400, y: 150 },
    { id: '3', type: 'app', label: 'App Server 2', status: 'warning', x: 400, y: 450 },
    { id: '4', type: 'db', label: 'Primary DB', status: 'healthy', x: 700, y: 300 },
    { id: '5', type: 'cache', label: 'Redis Cache', status: 'healthy', x: 700, y: 100 },
];

export const networkConnections = [
    { from: '1', to: '2', status: 'active', latency: 12 },
    { from: '1', to: '3', status: 'active', latency: 45 },
    { from: '2', to: '4', status: 'active', latency: 5 },
    { from: '3', to: '4', status: 'active', latency: 8 },
    { from: '2', to: '5', status: 'active', latency: 2 },
    { from: '3', to: '5', status: 'active', latency: 3 },
];

// --- Queue Management (Q-Manager) ---
export const queues = [
    { id: 'q_email', name: 'Email Notifications', active: 450, delayed: 12, failed: 2, status: 'healthy' },
    { id: 'q_image', name: 'Image Processing', active: 1204, delayed: 0, failed: 0, status: 'busy' },
    { id: 'q_data', name: 'Data Sync', active: 82, delayed: 0, failed: 0, status: 'idle' },
    { id: 'q_dlo', name: 'Dead Letter', active: 128, delayed: 0, failed: 128, status: 'critical' },
];

// --- Cloud Monitor ---
export const cloudCosts = {
    total: 12450,
    changePct: -4.2,
    breakdown: [
        { service: 'EC2 Instances', cost: 6420, pct: 52, color: 'primary' },
        { service: 'RDS Databases', cost: 3150, pct: 25, color: 'indigo-500' },
        { service: 'S3 Storage', cost: 1840, pct: 15, color: 'sky-400' },
        { service: 'Other', cost: 1040, pct: 8, color: 'slate-400' },
    ],
    resources: {
        instances: 481,
        storageTB: 142,
        savings: 3200
    }
};
