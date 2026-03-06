# 🌾 AgroMaître - Modules Gestion & Ressources (Part 1)

## 📋 VUE D'ENSEMBLE DES 5 MODULES

```
┌─────────────────────────────────────────────────────────┐
│         GESTION & RESSOURCES                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1️⃣ COMPTABILITÉ                                       │
│     → Écritures comptables + Grand Livre + Bilan       │
│                                                         │
│  2️⃣ BUDGET & FINANCE                                   │
│     → Budgets prévisionnels + Suivi dépenses           │
│                                                         │
│  3️⃣ RAPPORTS & EXPORT                                  │
│     → Générateur rapports + Export PDF/Excel           │
│                                                         │
│  4️⃣ INVENTAIRE                                         │
│     → Stock matériel + Équipements + Consommables      │
│                                                         │
│  5️⃣ BASE DE CONNAISSANCE                               │
│     → Documentation + Guides + Procédures              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

# 1️⃣ MODULE COMPTABILITÉ - SOLUTION COMPLÈTE

## BACKEND - Modèle Accounting Entry

```typescript
// backend/models/AccountingEntry.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IAccountingEntry extends Document {
  date: Date;
  reference: string; // REF-2026-001
  type: 'income' | 'expense' | 'transfer';
  category: string;
  account: {
    number: string; // 601, 411, etc. (Plan comptable)
    name: string;
  };
  description: string;
  debit: number;
  credit: number;
  balance: number;
  taxRate?: number; // TVA 20%
  taxAmount?: number;
  paymentMethod?: 'cash' | 'bank_transfer' | 'check' | 'card';
  linkedDocument?: {
    type: 'invoice' | 'receipt' | 'order';
    id: mongoose.Types.ObjectId;
    number: string;
  };
  supplier?: mongoose.Types.ObjectId;
  customer?: mongoose.Types.ObjectId;
  tags: string[];
  fiscalYear: number; // 2026
  fiscalPeriod: number; // 1-12 (mois)
  status: 'draft' | 'validated' | 'reconciled';
  validatedBy?: mongoose.Types.ObjectId;
  validatedAt?: Date;
  attachments?: string[];
  notes?: string;
  domain: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

const accountingEntrySchema = new Schema<IAccountingEntry>(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense', 'transfer'],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    account: {
      number: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
    description: {
      type: String,
      required: true,
    },
    debit: {
      type: Number,
      default: 0,
    },
    credit: {
      type: Number,
      default: 0,
    },
    balance: {
      type: Number,
      default: 0,
    },
    taxRate: Number,
    taxAmount: Number,
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank_transfer', 'check', 'card'],
    },
    linkedDocument: {
      type: {
        type: String,
        enum: ['invoice', 'receipt', 'order'],
      },
      id: Schema.Types.ObjectId,
      number: String,
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
    },
    tags: [String],
    fiscalYear: {
      type: Number,
      required: true,
    },
    fiscalPeriod: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    status: {
      type: String,
      enum: ['draft', 'validated', 'reconciled'],
      default: 'draft',
    },
    validatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    validatedAt: Date,
    attachments: [String],
    notes: String,
    domain: {
      type: Schema.Types.ObjectId,
      ref: 'Domain',
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
accountingEntrySchema.index({ domain: 1, fiscalYear: 1, fiscalPeriod: 1 });
accountingEntrySchema.index({ reference: 1 });
accountingEntrySchema.index({ date: 1 });

// Pre-save hook to calculate balance
accountingEntrySchema.pre('save', function (next) {
  this.balance = this.debit - this.credit;
  next();
});

export default mongoose.model<IAccountingEntry>('AccountingEntry', accountingEntrySchema);
```

```typescript
// backend/controllers/accounting.controller.ts
import { Request, Response } from 'express';
import AccountingEntry from '../models/AccountingEntry';
import moment from 'moment';

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
    // Generate reference
    const year = new Date().getFullYear();
    const count = await AccountingEntry.countDocuments({
      domain: req.user.domain,
      fiscalYear: year,
    });
    const reference = `REF-${year}-${String(count + 1).padStart(4, '0')}`;

    const entry = await AccountingEntry.create({
      ...req.body,
      reference,
      domain: req.user.domain,
      createdBy: req.user.id,
      fiscalYear: moment(req.body.date).year(),
      fiscalPeriod: moment(req.body.date).month() + 1,
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

export const getBalanceSheet = async (req: any, res: Response) => {
  try {
    const { fiscalYear } = req.query;

    const entries = await AccountingEntry.find({
      domain: req.user.domain,
      fiscalYear: parseInt(fiscalYear as string) || new Date().getFullYear(),
      status: 'validated',
    });

    // Group by account
    const grouped = entries.reduce((acc: any, entry) => {
      const accountNumber = entry.account.number;
      if (!acc[accountNumber]) {
        acc[accountNumber] = {
          accountNumber,
          accountName: entry.account.name,
          totalDebit: 0,
          totalCredit: 0,
          balance: 0,
        };
      }
      acc[accountNumber].totalDebit += entry.debit;
      acc[accountNumber].totalCredit += entry.credit;
      acc[accountNumber].balance += entry.balance;
      return acc;
    }, {});

    const balanceSheet = Object.values(grouped);

    res.json({
      success: true,
      balanceSheet,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
```

## FRONTEND - Comptabilité Component

```typescript
// frontend/components/accounting/AccountingDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Plus,
  Filter,
  Download,
  CheckCircle,
} from 'lucide-react';

export const AccountingDashboard: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    pendingValidation: 0,
  });

  useEffect(() => {
    fetchEntries();
    fetchStats();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/accounting/entries', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setEntries(data.entries);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  const fetchStats = async () => {
    // Calculate stats from entries
    const income = entries
      .filter((e) => e.type === 'income')
      .reduce((sum, e) => sum + e.credit, 0);
    const expenses = entries
      .filter((e) => e.type === 'expense')
      .reduce((sum, e) => sum + e.debit, 0);

    setStats({
      totalIncome: income,
      totalExpenses: expenses,
      netProfit: income - expenses,
      pendingValidation: entries.filter((e) => e.status === 'draft').length,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Comptabilité
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestion des écritures comptables et suivi financier
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <TrendingUp size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <span className="text-green-600 text-sm font-medium">+12%</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Revenus</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalIncome.toLocaleString()} MAD
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <TrendingDown size={24} className="text-red-600 dark:text-red-400" />
            </div>
            <span className="text-red-600 text-sm font-medium">+8%</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Dépenses</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalExpenses.toLocaleString()} MAD
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <DollarSign size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-green-600 text-sm font-medium">+4%</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Bénéfice Net</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.netProfit.toLocaleString()} MAD
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <FileText size={24} className="text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            En attente validation
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.pendingValidation}
          </p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <select className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
              <option value="2026">Exercice 2026</option>
              <option value="2025">Exercice 2025</option>
            </select>

            <select className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
              <option value="">Tous les types</option>
              <option value="income">Revenus</option>
              <option value="expense">Dépenses</option>
              <option value="transfer">Virements</option>
            </select>

            <select className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
              <option value="">Tous les statuts</option>
              <option value="draft">Brouillon</option>
              <option value="validated">Validées</option>
              <option value="reconciled">Rapprochées</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center gap-2 transition-colors">
              <Download size={18} />
              Export
            </button>

            <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors">
              <Plus size={20} />
              Nouvelle Écriture
            </button>
          </div>
        </div>
      </div>

      {/* Journal Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">Journal Comptable</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Référence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Compte
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Débit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Crédit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {entries.map((entry) => (
                <tr
                  key={entry._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(entry.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {entry.reference}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {entry.account.number} - {entry.account.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {entry.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-white">
                    {entry.debit > 0 ? `${entry.debit.toLocaleString()} MAD` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-white">
                    {entry.credit > 0 ? `${entry.credit.toLocaleString()} MAD` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        entry.status === 'validated'
                          ? 'bg-green-100 text-green-700'
                          : entry.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
```

Suite avec Budget & Finance, Rapports & Export dans le prochain fichier ! 🚀
