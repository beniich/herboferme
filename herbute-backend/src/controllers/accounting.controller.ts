// backend/controllers/accounting.controller.ts
import { Request, Response } from 'express';
import AccountingEntry from '../models/AccountingEntry.js';
import moment from 'moment';
import { reportGenerator } from '../services/reportGenerator.js';
import fs from 'fs';

export const getEntries = async (req: any, res: Response) => {
  try {
    const {
      fiscalYear,
      fiscalPeriod,
      type,
      category,
      status,
      startDate,
      endDate,
    } = req.query;

    const query: any = {
      domain: req.user.domain,
    };

    if (fiscalYear) query.fiscalYear = parseInt(fiscalYear as string);
    if (fiscalPeriod) query.fiscalPeriod = parseInt(fiscalPeriod as string);
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    const entries = await AccountingEntry.find(query)
      .populate('supplier', 'name')
      .populate('customer', 'name')
      .populate('validatedBy', 'firstName lastName')
      .sort({ date: -1 });

    res.json({
      success: true,
      entries,
      count: entries.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createEntry = async (req: any, res: Response) => {
  try {
    const date = req.body.date ? new Date(req.body.date) : new Date();
    const year = date.getFullYear();
    
    // Generate reference
    const count = await AccountingEntry.countDocuments({
      domain: req.user.domain,
      fiscalYear: year,
    });
    const reference = `REF-${year}-${String(count + 1).padStart(4, '0')}`;

    const entry = await AccountingEntry.create({
      ...req.body,
      date,
      reference,
      domain: req.user.domain,
      createdBy: req.user.id,
      fiscalYear: year,
      fiscalPeriod: date.getMonth() + 1,
    });

    res.status(201).json({
      success: true,
      entry,
      message: 'Entry created successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getGeneralLedger = async (req: any, res: Response) => {
  try {
    const { fiscalYear, accountNumber } = req.query;

    const query: any = {
      domain: req.user.domain,
      status: 'validated',
    };

    if (fiscalYear) {
      query.fiscalYear = parseInt(fiscalYear as string);
    }

    if (accountNumber) {
      query['account.number'] = accountNumber;
    }

    const entries = await AccountingEntry.find(query).sort({ date: 1 });

    // Calculate cumulative balance
    let cumulativeBalance = 0;
    const ledger = entries.map((entry) => {
      cumulativeBalance += entry.balance;
      return {
        ...entry.toObject(),
        cumulativeBalance,
      };
    });

    res.json({
      success: true,
      ledger,
      totalDebit: entries.reduce((sum, e) => sum + e.debit, 0),
      totalCredit: entries.reduce((sum, e) => sum + e.credit, 0),
      finalBalance: cumulativeBalance,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const downloadBalanceSheet = async (req: any, res: Response) => {
    try {
        const { fiscalYear } = req.query;
        const year = parseInt(fiscalYear as string) || new Date().getFullYear();

        const entries = await AccountingEntry.find({
            domain: req.user.domain,
            fiscalYear: year,
            status: 'validated',
        });

        // Group by account
        const groupedMap = new Map();
        let totalDebit = 0;
        let totalCredit = 0;

        entries.forEach(entry => {
            const num = entry.account.number;
            if (!groupedMap.has(num)) {
                groupedMap.set(num, {
                    accountNumber: num,
                    accountName: entry.account.name,
                    debit: 0,
                    credit: 0,
                    balance: 0
                });
            }
            const data = groupedMap.get(num);
            data.debit += entry.debit;
            data.credit += entry.credit;
            data.balance += entry.balance;
            totalDebit += entry.debit;
            totalCredit += entry.credit;
        });

        const reportData = {
            fiscalYear: year,
            domainName: req.user.domainName || 'Herbute - AgroMaître',
            entries: Array.from(groupedMap.values()),
            totalDebit,
            totalCredit,
            finalBalance: totalDebit - totalCredit
        };

        const filePath = await reportGenerator.generateBalanceSheetPDF(reportData);
        
        res.download(filePath, `Bilan_${year}.pdf`, (err) => {
            if (err) console.error("Export error:", err);
            // Optional: delete file after download
            // fs.unlinkSync(filePath);
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const getStats = async (req: any, res: Response) => {
  try {
    const domainId = req.user.domain;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [monthStats, yearStats, byCategory, recentEntries] = await Promise.all([
      // Monthly Stats
      AccountingEntry.aggregate([
        { $match: { domain: domainId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { 
          $group: { 
            _id: null, 
            income: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$credit', 0] } },
            expense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$debit', 0] } }
          } 
        }
      ]),
      // Yearly Stats
      AccountingEntry.aggregate([
        { $match: { domain: domainId, date: { $gte: startOfYear } } },
        { 
          $group: { 
            _id: null, 
            income: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$credit', 0] } },
            expense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$debit', 0] } }
          } 
        }
      ]),
      // By Category (Yearly)
      AccountingEntry.aggregate([
        { $match: { domain: domainId, date: { $gte: startOfYear } } },
        { 
          $group: { 
            _id: '$category', 
            revenue: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$credit', 0] } },
            expenses: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$debit', 0] } }
          } 
        }
      ]),
      // Recent Entries
      AccountingEntry.find({ domain: domainId })
        .sort({ date: -1 })
        .limit(5)
    ]);

    const m = monthStats[0] || { income: 0, expense: 0 };
    const y = yearStats[0] || { income: 0, expense: 0 };

    res.json({
      success: true,
      month: { ...m, balance: m.income - m.expense },
      year: { ...y, balance: y.income - y.expense },
      byCategory,
      recentEntries
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
