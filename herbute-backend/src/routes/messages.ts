import { Router, Request, Response } from 'express';
import { authenticate as auth } from '../middleware/security.js';
import { logger } from '../utils/logger.js';
import { Message } from '../models/Message.js';

const router = Router();

// GET /api/messages - Liste des messages
router.get('/', auth, async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const { type, unreadOnly } = req.query;

        const query: any = {
            $or: [
                { recipientId: userId },
                { senderId: userId },
                { groupId: 'general' }
                // TODO: Ajouter logique pour les groupes d'  quipe (ex: team-1) si stock   dans User
            ]
        };

        if (type) query.type = type;
        if (unreadOnly === 'true') {
            query.read = false;
            query.recipientId = userId; // Uniquement mes messages non lus
        }

        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(100); // Limiter aux 100 derniers

        const unreadCount = await Message.countDocuments({ recipientId: userId, read: false });

        res.json({
            success: true,
            data: messages,
            unreadCount
        });
    } catch (error) {
        logger.error('Erreur r  cup  ration messages:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// POST /api/messages - Envoyer message
router.post('/', auth, async (req: any, res: Response) => {
    try {
        const { recipientId, groupId, content, type } = req.body;
        const senderId = req.user.id;
        const senderName = req.user.name;

        if (!content) {
            return res.status(400).json({ success: false, message: 'Contenu requis' });
        }

        const newMessage = new Message({
            senderId,
            senderName,
            recipientId,
            groupId,
            content,
            type: type || 'text'
        });

        await newMessage.save();

        logger.info(`Nouveau message de ${senderName}`);

        res.status(201).json({ success: true, data: newMessage });
    } catch (error) {
        logger.error('Erreur envoi message:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// PUT /api/messages/:id/read - Marquer comme lu
router.put('/:id/read', auth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const msg = await Message.findByIdAndUpdate(id, { read: true }, { new: true });

        if (!msg) {
            return res.status(404).json({ success: false, message: 'Message introuvable' });
        }

        res.json({ success: true, data: msg });
    } catch (error) {
        logger.error('Erreur lecture message:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

export default router;
