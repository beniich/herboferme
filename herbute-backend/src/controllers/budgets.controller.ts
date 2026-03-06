// backend/controllers/budgets.controller.ts
import { Request, Response } from 'express';
import Budget from '../models/Budget.js';
import AccountingEntry from '../models/AccountingEntry.js';
import { reportGenerator } from '../services/reportGenerator.js';

export const getBudgets = async (req: any, res: Response) => {
  try {
    const { status, type, fiscalYear } = req.query;
    const query: any = { domain: req.user.domain };

    if (status) query.status = status;
    if (type) query.type = type;
    if (fiscalYear) query.fiscalYear = parseInt(fiscalYear as string);

    const budgets = await Budget.find(query).sort({ startDate: -1 });
    res.json({ success: true, budgets });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBudget = async (req: any, res: Response) => {
  try {
    const budget = await Budget.create({
      ...req.body,
      domain: req.user.domain,
      createdBy: req.user.id,
    });
    res.status(201).json({ success: true, budget });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getActiveBudget = async (req: any, res: Response) => {
  try {
    // Find the current active budget
    const budget = await Budget.findOne({
      domain: req.user.domain,
      status: 'active',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });

    if (!budget) {
      return res.status(404).json({ success: false, message: 'No active budget found' });
    }

    res.json({ success: true, budget });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const syncBudgetSpend = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const budget = await Budget.findById(id);

    if (!budget) {
        return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    // For each category, calculate spend from AccountingEntry
    let totalSpent = 0;
    for (const category of budget.categories) {
        const spentEntries = await AccountingEntry.find({
            domain: req.user.domain,
            category: category.name,
            type: 'expense',
            status: 'validated',
            date: { $gte: budget.startDate, $lte: budget.endDate }
        });

        const catSpent = spentEntries.reduce((sum, e) => sum + e.debit, 0);
        category.spent = catSpent;
        totalSpent += catSpent;
    }

    budget.totalSpent = totalSpent;
    await budget.save();

    res.json({ success: true, budget, message: 'Budget spend synchronized' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const downloadBudgetReport = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const budget = await Budget.findById(id);
        if (!budget) return res.status(404).json({ success: false, message: 'Budget not found' });

        const filePath = await reportGenerator.generateBudgetExcel(budget);
        res.download(filePath, `Budget_${budget.fiscalYear}_${budget.name}.xlsx`);
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
