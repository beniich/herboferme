// backend/controllers/inventory.controller.ts
import { Request, Response } from 'express';
import InventoryItem from '../models/InventoryItem.js';

export const getInventory = async (req: any, res: Response) => {
  try {
    const { category, condition, location } = req.query;
    const query: any = { domain: req.user.domain };

    if (category) query.category = category;
    if (condition) query.condition = condition;
    if (location) query.location = { $regex: location as string, $options: 'i' };

    const items = await InventoryItem.find(query).sort({ name: 1 });
    res.json({ success: true, items });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createInventoryItem = async (req: any, res: Response) => {
  try {
    const count = await InventoryItem.countDocuments({ domain: req.user.domain });
    const code = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const item = await InventoryItem.create({
      ...req.body,
      code,
      domain: req.user.domain,
      createdBy: req.user.id,
    });
    res.status(201).json({ success: true, item });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMovement = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { type, quantity, reason, reference } = req.body;

    const item = await InventoryItem.findById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    // Update quantity
    if (type === 'entry') {
        item.quantity += quantity;
    } else if (type === 'exit' || type === 'adjustment') {
        item.quantity -= quantity;
    }

    // Add movement
    item.movements.push({
        type,
        quantity,
        reason,
        reference,
        date: new Date(),
        user: req.user.id
    });

    await item.save();
    res.json({ success: true, item, message: 'Movement recorded' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLowStockItems = async (req: any, res: Response) => {
  try {
    const items = await InventoryItem.find({
      domain: req.user.domain,
      $expr: { $lte: ['$quantity', '$minQuantity'] }
    });
    res.json({ success: true, items });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
