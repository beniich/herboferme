import { Router, Request, Response } from 'express';
import { authenticate as auth } from '../middleware/security.js';
import { logger } from '../utils/logger.js';
import { KnowledgeBase } from '../models/Knowledge.js';

const router = Router();

// GET /api/knowledge/sops - Liste des proc  dures
router.get('/sops', auth, async (req: Request, res: Response) => {
    try {
        const { category, tag, q } = req.query;
        const query: any = { isActive: true };

        if (q) {
            // Recherche plein texte si index texte cr    , sinon regex simple
            query.$text = { $search: q as string };
        }

        if (category) {
            query.category = category;
        }

        if (tag) {
            query.tags = tag;
        }

        const sops = await KnowledgeBase.find(query).sort({ views: -1 });

        res.json({ success: true, data: sops });
    } catch (error) {
        logger.error('Erreur r  cup  ration SOPs:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// GET /api/knowledge/sops/:id - D  tails proc  dure
router.get('/sops/:id', auth, async (req: Request, res: Response) => {
    try {
        const sop = await KnowledgeBase.findById(req.params.id);
        if (!sop) return res.status(404).json({ success: false, message: 'Proc  dure introuvable' });

        // Incr  menter vues
        sop.views += 1;
        await sop.save();

        res.json({ success: true, data: sop });
    } catch (error) {
        logger.error('Erreur r  cup  ration SOP:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// POST /api/knowledge/sops - Cr  er proc  dure (Admin/Manager)
router.post('/sops', auth, async (req: any, res: Response) => {
    try {
        const { title, category, content, tags } = req.body;

        // TODO: V  rifier permissions admin/manager
        if (!['admin', 'manager'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Non autoris  ' });
        }

        const newSop = new KnowledgeBase({
            title,
            category,
            content,
            tags: tags || [],
            author: req.user.name,
            isActive: true
        });

        await newSop.save();
        logger.info(`Nouvelle SOP cr    e: ${title}`);

        res.status(201).json({ success: true, data: newSop });
    } catch (error) {
        logger.error('Erreur cr  ation SOP:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

export default router;
