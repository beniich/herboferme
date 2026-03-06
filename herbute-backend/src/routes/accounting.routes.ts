// backend/routes/accounting.routes.ts
import express from 'express';
import { getEntries, createEntry, getGeneralLedger, downloadBalanceSheet, getStats } from '../controllers/accounting.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', authenticate, getStats);
router.get('/entries', authenticate, getEntries);
router.post('/entries', authenticate, createEntry);
router.get('/ledger', authenticate, getGeneralLedger);
router.get('/download-balance', authenticate, downloadBalanceSheet);

export default router;
