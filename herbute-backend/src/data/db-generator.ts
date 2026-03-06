// db-generator.ts â€“ gÃ©nÃ¨re des mÃ©triques dynamiques pour l'administration de base de donnÃ©es
import { clusters, queues } from './db-fixtures.js';

function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Retourne un objet contenant les mÃ©triques agrÃ©gÃ©es.
 * Les valeurs changent lÃ©gÃ¨rement Ã  chaque appel, ce qui simule du rÃ©el.
 */
export function generateMetrics() {
    // Lag moyen (ms) = sum(lag) * 1000 + jitter
    const avgLagMs = clusters
        .filter((c) => c.role === "replica")
        .reduce((sum, c) => sum + (c.lag || 0) * 1000, 0);

    const jitter = randInt(-20, 30); // Â± ms pour le "live"

    return {
        replicationLagMs: Math.max(0, Math.round(avgLagMs + jitter)),
        diskUsagePct: randInt(55, 85),
        ioThroughputIOPS: randInt(900, 1500),
        lastBackup: (() => {
            const success = Math.random() > 0.2;
            return success
                ? `${randInt(1, 30)} min ago`
                : "failed â€“ see logs";
        })(),
        activeNodes: randInt(10, 15),
    };
}

/**
 * GÃ©nÃ¨re des donnÃ©es dynamiques pour le dashboard NetViz
 */
export function generateNetVizMetrics() {
    return {
        activeConnections: randInt(800, 1200),
        requestsPerSecond: randInt(2000, 3500),
        latencyAvg: randInt(15, 60),
        errorRate: (Math.random() * 0.5).toFixed(2)
    };
}

/**
 * GÃ©nÃ¨re des donnÃ©es dynamiques pour le dashboard Q-Manager
 */
export function generateQueueMetrics() {
    return queues.map(q => ({
        ...q,
        active: q.status === 'idle' ? randInt(0, 50) : randInt(q.active - 50, q.active + 50),
        processingRate: randInt(50, 200) // jobs/sec
    }));
}

/**
 * GÃ©nÃ¨re des donnÃ©es dynamiques pour DBA Sentinel
 */
export function generateDBAMetrics() {
    return {
        activeQueries: [
            { id: 101, query: "SELECT * FROM users WHERE active = true", duration: randInt(10, 500) + "ms", state: "active" },
            { id: 102, query: "UPDATE sessions SET last_seen = NOW()", duration: randInt(5, 50) + "ms", state: "idle" },
            { id: 105, query: "VACUUM ANALYZE large_table", duration: randInt(1000, 5000) + "ms", state: "active" }
        ],
        queryPerformance: Array.from({ length: 20 }, (_, i) => ({
            time: i,
            select: randInt(800, 1200),
            insert: randInt(100, 300),
            update: randInt(50, 150),
            delete: randInt(0, 20)
        }))
    };
}
