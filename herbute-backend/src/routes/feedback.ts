import { Router, Request, Response } from 'express';
import { authenticate as auth } from '../middleware/security.js';
import { logger } from '../utils/logger.js';
import { Feedback } from '../models/Feedback.js';

const router = Router();

// GET /api/feedback - Liste
router.get('/', auth, async (req: Request, res: Response) => {
    try {
        const { status, rating } = req.query;
        const query: any = { /* Intentionally empty */ };

        if (status) query.status = status;
        if (rating) query.rating = { $gte: Number(rating) };

        const feedbacks = await Feedback.find(query).sort({ createdAt: -1 });

        res.json({ success: true, data: feedbacks });
    } catch (error) {
        logger.error('Erreur r  cup  ration feedback:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// POST /api/feedback - Soumettre
router.post('/', async (req: Request, res: Response) => {
    try {
        const { category, rating, comment, source, userId } = req.body;

        if (!rating || !comment) {
            return res.status(400).json({ success: false, message: 'Note et commentaire requis' });
        }

        const newFeedback = new Feedback({
            source: source || 'web',
            category: category || 'General',
            rating: Number(rating),
            comment,
            userId: userId || undefined,
            status: 'new'
        });

        await newFeedback.save();
        logger.info(`Nouveau feedback re  u: ${rating}/5`);

        res.status(201).json({ success: true, message: 'Merci pour votre retour !' });
    } catch (error) {
        logger.error('Erreur soumission feedback:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

export default router;
