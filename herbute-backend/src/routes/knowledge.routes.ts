// backend/routes/knowledge.routes.ts
import express from 'express';
import { getArticles, createArticle, getArticleBySlug, voteHelpful } from '../controllers/knowledge.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getArticles);
router.post('/', authenticate, createArticle);
router.get('/:slug', authenticate, getArticleBySlug);
router.post('/:id/vote', authenticate, voteHelpful);

export default router;
