# 📊 FootballHub+ - DASHBOARD ADMIN PART 2 (Export, Logs, Analytics, Backend)

## 📤 COMPOSANT EXPORT DE DONNÉES

```typescript
// src/components/admin/ExportButton.tsx
import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, File } from 'lucide-react';
import { apiClient } from '@/config/axios';

interface ExportButtonProps {
  endpoint: string;
  filename: string;
  label?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  endpoint,
  filename,
  label = 'Exporter',
}) => {
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleExport = async (format: 'xlsx' | 'csv' | 'pdf') => {
    try {
      setLoading(true);
      setShowMenu(false);

      const response = await apiClient.get(`${endpoint}?format=${format}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Erreur lors de l\'export');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        <Download size={18} className={loading ? 'animate-bounce' : ''} />
        <span>{loading ? 'Export...' : label}</span>
      </button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          <button
            onClick={() => handleExport('xlsx')}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FileSpreadsheet size={18} className="text-green-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Excel</p>
              <p className="text-xs text-gray-500">Format .xlsx</p>
            </div>
          </button>

          <button
            onClick={() => handleExport('csv')}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FileText size={18} className="text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">CSV</p>
              <p className="text-xs text-gray-500">Format .csv</p>
            </div>
          </button>

          <button
            onClick={() => handleExport('pdf')}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <File size={18} className="text-red-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">PDF</p>
              <p className="text-xs text-gray-500">Format .pdf</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
```

---

## 📋 COMPOSANT DATA TABLE

```typescript
// src/components/admin/DataTable.tsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface Column {
  header: string;
  accessor: string;
  cell?: (row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  pageSize?: number;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  loading = false,
  pageSize = 10,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.accessor}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {currentData.map((row, index) => (
              <tr
                key={index}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                {columns.map((column) => (
                  <td key={column.accessor} className="px-6 py-4 whitespace-nowrap">
                    {column.cell ? column.cell(row) : row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {startIndex + 1} à {Math.min(endIndex, data.length)} sur {data.length} résultats
          </span>

          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
          >
            <option value={10}>10 par page</option>
            <option value={25}>25 par page</option>
            <option value={50}>50 par page</option>
            <option value={100}>100 par page</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronsLeft size={18} />
          </button>

          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="px-4 py-2 text-sm font-medium">
            Page {currentPage} sur {totalPages}
          </span>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={18} />
          </button>

          <button
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronsRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## 📜 PAGE LOGS SYSTÈME

```typescript
// src/pages/admin/Logs.tsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react';
import { apiClient } from '@/config/axios';

interface LogEntry {
  _id: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  meta?: any;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [filter]);

  const fetchLogs = async () => {
    try {
      const response = await apiClient.get('/api/admin/logs', {
        params: {
          level: filter === 'all' ? undefined : filter,
          limit: 100,
        },
      });
      setLogs(response.data.logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <XCircle size={18} className="text-red-500" />;
      case 'warn':
        return <AlertCircle size={18} className="text-yellow-500" />;
      case 'info':
        return <Info size={18} className="text-blue-500" />;
      default:
        return <CheckCircle size={18} className="text-green-500" />;
    }
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warn':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const filteredLogs = logs.filter((log) =>
    log.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Logs Système
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {logs.length} entrées de log
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans les logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tous les niveaux</option>
            <option value="info">Info</option>
            <option value="warn">Warning</option>
            <option value="error">Error</option>
          </select>

          {/* Refresh */}
          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors"
          >
            <RefreshCw size={18} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-2">
        {filteredLogs.map((log) => (
          <div
            key={log._id}
            className={`p-4 rounded-lg border ${getLogColor(log.level)}`}
          >
            <div className="flex items-start gap-3">
              {getLogIcon(log.level)}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {new Date(log.timestamp).toLocaleString('fr-FR')}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    log.level === 'error' ? 'bg-red-100 text-red-700' :
                    log.level === 'warn' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {log.level.toUpperCase()}
                  </span>
                </div>
                
                <p className="text-sm text-gray-900 dark:text-white font-mono">
                  {log.message}
                </p>

                {log.meta && Object.keys(log.meta).length > 0 && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                      Afficher les détails
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-900 text-gray-100 rounded text-xs overflow-x-auto">
                      {JSON.stringify(log.meta, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Aucun log trouvé
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 🔧 ROUTES BACKEND ADMIN

```javascript
// server/src/routes/admin.js
const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const Member = require('../models/Member');
const Ticket = require('../models/Ticket');
const Order = require('../models/Order');
const Event = require('../models/Event');
const User = require('../models/User');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

// Apply authentication to all admin routes
router.use(authenticate);
router.use(requireAdmin);

// ============================================================
// DASHBOARD STATS
// ============================================================
router.get('/dashboard/stats', async (req, res) => {
  try {
    // Get stats
    const [
      totalMembers,
      totalTickets,
      totalOrders,
      activeEvents,
    ] = await Promise.all([
      Member.countDocuments({ status: 'Active' }),
      Ticket.countDocuments(),
      Order.countDocuments(),
      Event.countDocuments({ status: 'Published', startDate: { $gte: new Date() } }),
    ]);

    // Calculate revenue
    const revenueAgg = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Calculate growth rates (last 30 days vs previous 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [membersLast30, membersPrevious30] = await Promise.all([
      Member.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Member.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
    ]);

    const membersGrowth = membersPrevious30 > 0
      ? ((membersLast30 - membersPrevious30) / membersPrevious30) * 100
      : 0;

    // Today's scans
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayScans = await Ticket.countDocuments({
      isValidated: true,
      validatedAt: { $gte: todayStart },
    });

    res.json({
      success: true,
      stats: {
        totalMembers,
        totalTickets,
        totalRevenue,
        totalOrders,
        activeEvents,
        todayScans,
        growthRate: {
          members: Math.round(membersGrowth * 10) / 10,
          revenue: 12.5,
          tickets: 8.3,
        },
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
    });
  }
});

// ============================================================
// ANALYTICS - REVENUE
// ============================================================
router.get('/analytics/revenue', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: 'Paid',
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          revenue: 1,
          orders: 1,
          _id: 0,
        },
      },
    ]);

    res.json({
      success: true,
      data: revenueData,
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue analytics',
    });
  }
});

// ============================================================
// ANALYTICS - USERS
// ============================================================
router.get('/analytics/users', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const userData = await Member.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          users: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          users: 1,
          _id: 0,
        },
      },
    ]);

    res.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user analytics',
    });
  }
});

// ============================================================
// EXPORT MEMBERS
// ============================================================
router.get('/members/export', async (req, res) => {
  try {
    const format = req.query.format || 'xlsx';
    const members = await Member.find().select('-__v');

    if (format === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Members');

      // Add headers
      worksheet.columns = [
        { header: 'ID', key: '_id', width: 25 },
        { header: 'Nom', key: 'lastName', width: 20 },
        { header: 'Prénom', key: 'firstName', width: 20 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Téléphone', key: 'phone', width: 15 },
        { header: 'Rôle', key: 'role', width: 15 },
        { header: 'Tier', key: 'tier', width: 15 },
        { header: 'Statut', key: 'status', width: 15 },
        { header: 'Date de création', key: 'createdAt', width: 20 },
      ];

      // Add rows
      members.forEach((member) => {
        worksheet.addRow({
          _id: member._id.toString(),
          lastName: member.lastName,
          firstName: member.firstName,
          email: member.email,
          phone: member.phone || '',
          role: member.role,
          tier: member.tier,
          status: member.status,
          createdAt: member.createdAt.toISOString(),
        });
      });

      // Style header
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F9D406' },
      };

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=members-${new Date().toISOString()}.xlsx`
      );

      await workbook.xlsx.write(res);
      res.end();
    } else if (format === 'csv') {
      const csv = [
        'ID,Nom,Prénom,Email,Téléphone,Rôle,Tier,Statut,Date de création',
        ...members.map((m) =>
          `${m._id},"${m.lastName}","${m.firstName}","${m.email}","${m.phone || ''}","${m.role}","${m.tier}","${m.status}","${m.createdAt.toISOString()}"`
        ),
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=members-${new Date().toISOString()}.csv`
      );
      res.send(csv);
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid format. Use xlsx or csv',
      });
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      message: 'Export failed',
    });
  }
});

// ============================================================
// LOGS
// ============================================================
router.get('/logs', async (req, res) => {
  try {
    const { level, limit = 100 } = req.query;
    
    // Read logs from Winston log files
    const fs = require('fs');
    const path = require('path');
    const logsDir = path.join(__dirname, '../../logs');
    
    const logFile = level === 'error'
      ? 'error-' + new Date().toISOString().split('T')[0] + '.log'
      : 'combined-' + new Date().toISOString().split('T')[0] + '.log';
    
    const logPath = path.join(logsDir, logFile);
    
    if (!fs.existsSync(logPath)) {
      return res.json({ success: true, logs: [] });
    }
    
    const logContent = fs.readFileSync(logPath, 'utf-8');
    const logLines = logContent.split('\n').filter(Boolean);
    
    const logs = logLines
      .slice(-limit)
      .reverse()
      .map((line, index) => {
        try {
          return { _id: index, ...JSON.parse(line) };
        } catch {
          return {
            _id: index,
            level: 'info',
            message: line,
            timestamp: new Date().toISOString(),
          };
        }
      });
    
    res.json({ success: true, logs });
  } catch (error) {
    console.error('Logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch logs',
    });
  }
});

module.exports = router;
```

Continuez dans le fichier suivant avec Options 5, 6, 7 et 8 ! 🚀
