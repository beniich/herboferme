// backend/routes/budgets.routes.ts
import express from 'express';
import { getBudgets, createBudget, getActiveBudget, syncBudgetSpend, downloadBudgetReport } from '../controllers/budgets.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getBudgets);
router.post('/', authenticate, createBudget);
router.get('/active', authenticate, getActiveBudget);
router.patch('/:id/sync', authenticate, syncBudgetSpend);
router.get('/:id/download', authenticate, downloadBudgetReport);

export default router;
