// backend/controllers/knowledge.controller.ts
import { Request, Response } from 'express';
import KnowledgeArticle from '../models/KnowledgeArticle.js';
import slugify from 'slugify';

export const getArticles = async (req: any, res: Response) => {
  try {
    const { category, search, status } = req.query;
    const query: any = { domain: req.user.domain };

    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
        query.$text = { $search: search as string };
    }

    const articles = await KnowledgeArticle.find(query)
      .populate('author', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({ success: true, articles });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createArticle = async (req: any, res: Response) => {
  try {
    const { title } = req.body;
    const slug = (slugify as any).default(title, { lower: true, strict: true }) + '-' + Date.now();

    const article = await KnowledgeArticle.create({
      ...req.body,
      slug,
      domain: req.user.domain,
      author: req.user.id,
    });
    res.status(201).json({ success: true, article });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getArticleBySlug = async (req: any, res: Response) => {
  try {
    const { slug } = req.params;
    const article = await KnowledgeArticle.findOne({ slug, domain: req.user.domain })
      .populate('author', 'firstName lastName')
      .populate('relatedArticles', 'title slug');

    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });

    // Increment views
    article.views += 1;
    await article.save();

    res.json({ success: true, article });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const voteHelpful = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { vote } = req.body; // 'yes' or 'no'

    const article = await KnowledgeArticle.findById(id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });

    if (vote === 'yes') article.helpful.yes += 1;
    else article.helpful.no += 1;

    await article.save();
    res.json({ success: true, message: 'Vote recorded' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
