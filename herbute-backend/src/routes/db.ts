// routes/db.ts â€“ Routes pour l'administration de base de donnÃ©es (Enterprise DB Management)
import express, { Request, Response } from 'express';
import { generateMetrics, generateNetVizMetrics, generateQueueMetrics, generateDBAMetrics } from '../data/db-generator.js';
import { clusters, backups, networkNodes, networkConnections, cloudCosts } from '../data/db-fixtures.js';

const router = express.Router();

/**
 * GET /api/db/metrics
 * Retourne les indicateurs agrÃ©gÃ©s de performance de la base de donnÃ©es
 */
router.get('/metrics', (req: Request, res: Response) => {
    const metrics = generateMetrics();
    res.json(metrics);
});

/**
 * GET /api/db/replicas
 * Retourne la liste des rÃ©plicas de base de donnÃ©es
 */
router.get('/replicas', (req: Request, res: Response) => {
    const replicas = clusters.filter((c) => c.role === "replica");
    res.json(replicas);
});

/**
 * GET /api/db/backups
 * Retourne l'historique des sauvegardes
 */
router.get('/backups', (req: Request, res: Response) => {
    res.json(backups);
});

/**
 * GET /api/db/clusters
 * Retourne la liste de tous les clusters (master + replicas)
 */
router.get('/clusters', (req: Request, res: Response) => {
    res.json(clusters);
});

/**
 * GET /api/db/net-viz
 * Retourne la topologie rÃ©seau et les mÃ©triques de trafic
 */
router.get('/net-viz', (req: Request, res: Response) => {
    const dynamicMetrics = generateNetVizMetrics();
    res.json({
        nodes: networkNodes,
        connections: networkConnections,
        metrics: dynamicMetrics
    });
});

/**
 * GET /api/db/q-manager
 * Retourne l'Ã©tat des files d'attente et du cache Redis
 */
router.get('/q-manager', (req: Request, res: Response) => {
    const queueStats = generateQueueMetrics();
    res.json({
        queues: queueStats,
        cacheHitRate: (Math.random() * (99.9 - 95.0) + 95.0).toFixed(1),
        redisMemory: "1.2GB / 4GB"
    });
});

/**
 * GET /api/db/cloud-monitor
 * Retourne l'analyse des coÃ»ts et l'utilisation des ressources cloud
 */
router.get('/cloud-monitor', (req: Request, res: Response) => {
    res.json(cloudCosts);
});

/**
 * GET /api/db/dba-sentinel
 * Retourne les requÃªtes actives et les performances
 */
router.get('/dba-sentinel', (req: Request, res: Response) => {
    const dbaMetrics = generateDBAMetrics();
    res.json(dbaMetrics);
});

export default router;
