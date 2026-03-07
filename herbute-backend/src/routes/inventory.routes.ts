// backend/routes/inventory.routes.ts
import express from 'express';
import { getInventory, createInventoryItem, updateMovement, getLowStockItems } from '../controllers/inventory.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.get('/', authenticate, getInventory);
router.post('/', authenticate, createInventoryItem);
router.patch('/:id/movement', authenticate, updateMovement);
router.get('/low-stock', authenticate, getLowStockItems);

export default router;
