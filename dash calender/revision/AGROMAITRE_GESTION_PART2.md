# 🌾 AgroMaître - Gestion & Ressources (Part 2)

## 2️⃣ MODULE BUDGET & FINANCE - SOLUTION COMPLÈTE

### BACKEND - Modèle Budget

```typescript
// backend/models/Budget.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IBudget extends Document {
  name: string;
  description?: string;
  fiscalYear: number;
  type: 'operational' | 'investment' | 'treasury';
  categories: Array<{
    name: string;
    budgeted: number;
    spent: number;
    remaining: number;
    percentage: number;
  }>;
  totalBudgeted: number;
  totalSpent: number;
  totalRemaining: number;
  status: 'draft' | 'approved' | 'active' | 'closed';
  startDate: Date;
  endDate: Date;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  alerts: Array<{
    category: string;
    threshold: number; // 80% = alert
    triggered: boolean;
    date?: Date;
  }>;
  domain: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

const budgetSchema = new Schema<IBudget>(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    fiscalYear: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['operational', 'investment', 'treasury'],
      required: true,
    },
    categories: [
      {
        name: String,
        budgeted: Number,
        spent: {
          type: Number,
          default: 0,
        },
        remaining: Number,
        percentage: Number,
      },
    ],
    totalBudgeted: {
      type: Number,
      required: true,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    totalRemaining: Number,
    status: {
      type: String,
      enum: ['draft', 'approved', 'active', 'closed'],
      default: 'draft',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
    alerts: [
      {
        category: String,
        threshold: Number,
        triggered: Boolean,
        date: Date,
      },
    ],
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

// Pre-save hook to calculate totals
budgetSchema.pre('save', function (next) {
  this.totalRemaining = this.totalBudgeted - this.totalSpent;
  
  this.categories.forEach((category) => {
    category.remaining = category.budgeted - category.spent;
    category.percentage = (category.spent / category.budgeted) * 100;
  });
  
  next();
});

export default mongoose.model<IBudget>('Budget', budgetSchema);
```

### FRONTEND - Budget Dashboard

```typescript
// frontend/components/budget/BudgetDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export const BudgetDashboard: React.FC = () => {
  const [budget, setBudget] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchBudget();
  }, []);

  const fetchBudget = async () => {
    try {
      const response = await fetch('/api/budgets/active', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setBudget(data.budget);
      setCategories(data.budget.categories);
    } catch (error) {
      console.error('Error fetching budget:', error);
    }
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Budget & Finance
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Suivi budgétaire et analyse des dépenses
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <DollarSign size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Budget Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {budget?.totalBudgeted.toLocaleString()} MAD
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <TrendingUp size={24} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Dépensé</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {budget?.totalSpent.toLocaleString()} MAD
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full"
              style={{
                width: `${((budget?.totalSpent / budget?.totalBudgeted) * 100) || 0}%`,
              }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Restant</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {budget?.totalRemaining.toLocaleString()} MAD
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">
            Répartition par Catégorie
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categories}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage.toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="spent"
              >
                {categories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">
            Évolution Mensuelle
          </h2>
          {/* Add monthly spending trend chart */}
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Détail par Catégorie
          </h2>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {categories.map((category, index) => (
            <div key={index} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {category.name}
                </h3>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    category.percentage > 90
                      ? 'bg-red-100 text-red-700'
                      : category.percentage > 70
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {category.percentage.toFixed(0)}% utilisé
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Budgété</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {category.budgeted.toLocaleString()} MAD
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Dépensé</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {category.spent.toLocaleString()} MAD
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Restant</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {category.remaining.toLocaleString()} MAD
                  </p>
                </div>
              </div>

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    category.percentage > 90
                      ? 'bg-red-500'
                      : category.percentage > 70
                      ? 'bg-orange-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${category.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

---

## 3️⃣ MODULE RAPPORTS & EXPORT

### Backend - Report Generator

```typescript
// backend/services/reportGenerator.ts
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';

class ReportGenerator {
  /**
   * Generate Balance Sheet PDF
   */
  async generateBalanceSheetPDF(data: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const filename = `balance_sheet_${Date.now()}.pdf`;
      const filepath = path.join(__dirname, '../../exports', filename);

      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // Header
      doc
        .fontSize(20)
        .text('Bilan Comptable', { align: 'center' })
        .moveDown();

      doc
        .fontSize(12)
        .text(`Exercice: ${data.fiscalYear}`, { align: 'center' })
        .text(`Domaine: ${data.domainName}`, { align: 'center' })
        .moveDown(2);

      // Table Header
      doc
        .fontSize(10)
        .text('Compte', 50, 200, { width: 100 })
        .text('Libellé', 150, 200, { width: 150 })
        .text('Débit', 300, 200, { width: 100, align: 'right' })
        .text('Crédit', 400, 200, { width: 100, align: 'right' })
        .text('Solde', 500, 200, { width: 100, align: 'right' });

      // Line
      doc.moveTo(50, 215).lineTo(550, 215).stroke();

      // Data rows
      let y = 225;
      data.entries.forEach((entry: any) => {
        doc
          .fontSize(9)
          .text(entry.accountNumber, 50, y, { width: 100 })
          .text(entry.accountName, 150, y, { width: 150 })
          .text(entry.debit.toFixed(2), 300, y, { width: 100, align: 'right' })
          .text(entry.credit.toFixed(2), 400, y, { width: 100, align: 'right' })
          .text(entry.balance.toFixed(2), 500, y, { width: 100, align: 'right' });

        y += 20;

        if (y > 750) {
          doc.addPage();
          y = 50;
        }
      });

      // Totals
      doc.moveTo(50, y).lineTo(550, y).stroke();
      y += 10;

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('TOTAL', 50, y)
        .text(data.totalDebit.toFixed(2), 300, y, { width: 100, align: 'right' })
        .text(data.totalCredit.toFixed(2), 400, y, { width: 100, align: 'right' })
        .text(data.finalBalance.toFixed(2), 500, y, { width: 100, align: 'right' });

      // Footer
      doc
        .fontSize(8)
        .text(
          `Généré le ${new Date().toLocaleDateString('fr-FR')}`,
          50,
          750,
          { align: 'center' }
        );

      doc.end();

      stream.on('finish', () => resolve(filepath));
      stream.on('error', reject);
    });
  }

  /**
   * Generate Budget Report Excel
   */
  async generateBudgetExcel(budget: any): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Budget');

    // Header
    worksheet.addRow(['Rapport Budgétaire']);
    worksheet.addRow([`Exercice: ${budget.fiscalYear}`]);
    worksheet.addRow([`Période: ${budget.startDate} - ${budget.endDate}`]);
    worksheet.addRow([]);

    // Column headers
    worksheet.addRow(['Catégorie', 'Budgété', 'Dépensé', 'Restant', '% Utilisé']);

    // Data rows
    budget.categories.forEach((category: any) => {
      worksheet.addRow([
        category.name,
        category.budgeted,
        category.spent,
        category.remaining,
        `${category.percentage.toFixed(2)}%`,
      ]);
    });

    // Totals
    worksheet.addRow([]);
    worksheet.addRow([
      'TOTAL',
      budget.totalBudgeted,
      budget.totalSpent,
      budget.totalRemaining,
      `${((budget.totalSpent / budget.totalBudgeted) * 100).toFixed(2)}%`,
    ]);

    // Styling
    worksheet.getRow(1).font = { bold: true, size: 14 };
    worksheet.getRow(5).font = { bold: true };
    worksheet.columns.forEach((column) => {
      column.width = 20;
    });

    const filename = `budget_${Date.now()}.xlsx`;
    const filepath = path.join(__dirname, '../../exports', filename);

    await workbook.xlsx.writeFile(filepath);

    return filepath;
  }

  /**
   * Generate Attendance Report CSV
   */
  async generateAttendanceCSV(attendance: any[]): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Présences');

    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Ouvrier', key: 'worker', width: 20 },
      { header: 'Statut', key: 'status', width: 15 },
      { header: 'Check-in', key: 'checkIn', width: 15 },
      { header: 'Check-out', key: 'checkOut', width: 15 },
      { header: 'Heures', key: 'workHours', width: 10 },
      { header: 'Heures Supp.', key: 'overtime', width: 10 },
    ];

    attendance.forEach((record) => {
      worksheet.addRow({
        date: new Date(record.date).toLocaleDateString('fr-FR'),
        worker: `${record.worker.firstName} ${record.worker.lastName}`,
        status: record.status,
        checkIn: record.checkIn
          ? new Date(record.checkIn).toLocaleTimeString('fr-FR')
          : '-',
        checkOut: record.checkOut
          ? new Date(record.checkOut).toLocaleTimeString('fr-FR')
          : '-',
        workHours: record.workHours.toFixed(2),
        overtime: record.overtime.toFixed(2),
      });
    });

    const filename = `attendance_${Date.now()}.xlsx`;
    const filepath = path.join(__dirname, '../../exports', filename);

    await workbook.xlsx.writeFile(filepath);

    return filepath;
  }
}

export const reportGenerator = new ReportGenerator();
```

Suite avec Inventaire et Base de Connaissance ! 🚀
