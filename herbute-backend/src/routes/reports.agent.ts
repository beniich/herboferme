import { Router, Request, Response } from 'express';
import AnalysisReport from '../models/AnalysisReport.model.js';
import { analysisQueue } from '../services/agent/queue.service.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// GET /api/reports — Liste paginée des rapports
router.get('/', authenticate as any, async (req: Request, res: Response) => {
  try {
    const orgId = req.headers['x-organization-id'];
    if (!orgId) return res.status(400).json({ message: 'Header x-organization-id requis' });

    const page  = parseInt(req.query.page  as string || '1');
    const limit = parseInt(req.query.limit as string || '10');
    const skip  = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      AnalysisReport.find({ organizationId: orgId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AnalysisReport.countDocuments({ organizationId: orgId }),
    ]);

    res.json({ data: reports, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('[Reports] GET /', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/reports/:id — Un rapport spécifique
router.get('/:id', authenticate as any, async (req: Request, res: Response) => {
  try {
    const orgId = req.headers['x-organization-id'];
    const report = await AnalysisReport.findOne({
      _id: req.params.id,
      organizationId: orgId,
    });
    if (!report) return res.status(404).json({ message: 'Rapport introuvable' });
    res.json({ data: report });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/reports/trigger — Déclencher une analyse manuellement
router.post('/trigger', authenticate as any, async (req: Request, res: Response) => {
  try {
    const orgId = req.headers['x-organization-id'] as string;
    if (!orgId) return res.status(400).json({ message: 'Header x-organization-id requis' });

    if (!analysisQueue) {
      return res.status(503).json({ message: 'Service de file d\'attente (Redis) non disponible' });
    }

    const job = await analysisQueue.add('daily_summary', {
      type: 'daily_summary',
      orgId,
    });
    res.json({ message: 'Analyse lancée', jobId: job.id });
  } catch (err) {
    console.error('[Reports] POST /trigger', err);
    res.status(500).json({ message: 'Erreur lors du déclenchement' });
  }
});

export default router;
