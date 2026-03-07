# 📊 FootballHub+ - DASHBOARD ADMIN COMPLET

## 🎯 Vue d'Ensemble

Dashboard admin professionnel avec :
- ✅ Statistiques en temps réel
- ✅ Gestion membres/tickets/produits/événements
- ✅ Charts & Analytics (Recharts)
- ✅ Logs et monitoring
- ✅ Export de données (CSV, Excel, PDF)
- ✅ Notifications système
- ✅ Gestion des utilisateurs

---

## 📁 STRUCTURE DU DASHBOARD

```
src/
├── pages/
│   ├── admin/
│   │   ├── Dashboard.tsx           # Page principale
│   │   ├── Members.tsx             # Gestion membres
│   │   ├── Tickets.tsx             # Gestion tickets
│   │   ├── Events.tsx              # Gestion événements
│   │   ├── Products.tsx            # Gestion produits
│   │   ├── Orders.tsx              # Gestion commandes
│   │   ├── Analytics.tsx           # Analytics avancées
│   │   ├── Logs.tsx                # Logs système
│   │   └── Settings.tsx            # Paramètres
│   │
├── components/
│   ├── admin/
│   │   ├── Sidebar.tsx             # Navigation sidebar
│   │   ├── TopBar.tsx              # Top navigation
│   │   ├── StatsCard.tsx           # Carte statistique
│   │   ├── RevenueChart.tsx        # Graphique revenus
│   │   ├── UserChart.tsx           # Graphique utilisateurs
│   │   ├── DataTable.tsx           # Table de données
│   │   ├── ExportButton.tsx        # Export données
│   │   └── LogViewer.tsx           # Viewer logs
```

---

## 🎨 DASHBOARD PRINCIPAL

```typescript
// src/pages/admin/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Users, Ticket, ShoppingBag, TrendingUp, Calendar,
  DollarSign, AlertCircle, Activity, Download, RefreshCw
} from 'lucide-react';
import { StatsCard } from '@/components/admin/StatsCard';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { UserChart } from '@/components/admin/UserChart';
import { RecentActivity } from '@/components/admin/RecentActivity';
import { TopProducts } from '@/components/admin/TopProducts';
import { apiClient } from '@/config/axios';

interface DashboardStats {
  totalMembers: number;
  totalTickets: number;
  totalRevenue: number;
  totalOrders: number;
  activeEvents: number;
  todayScans: number;
  growthRate: {
    members: number;
    revenue: number;
    tickets: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const response = await apiClient.get('/api/admin/dashboard/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await apiClient.get('/api/admin/dashboard/export', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dashboard-report-${new Date().toISOString()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard Admin
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Vue d'ensemble de FootballHub+
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              <span>Actualiser</span>
            </button>
            
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Download size={18} />
              <span>Exporter</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatsCard
            title="Membres Totaux"
            value={stats?.totalMembers || 0}
            change={stats?.growthRate.members || 0}
            icon={Users}
            color="blue"
          />
          
          <StatsCard
            title="Tickets Vendus"
            value={stats?.totalTickets || 0}
            change={stats?.growthRate.tickets || 0}
            icon={Ticket}
            color="green"
          />
          
          <StatsCard
            title="Revenus"
            value={`${stats?.totalRevenue || 0} DH`}
            change={stats?.growthRate.revenue || 0}
            icon={DollarSign}
            color="yellow"
          />
          
          <StatsCard
            title="Commandes"
            value={stats?.totalOrders || 0}
            change={5.2}
            icon={ShoppingBag}
            color="purple"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Revenus (30 derniers jours)
            </h3>
            <RevenueChart />
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Nouveaux Membres
            </h3>
            <UserChart />
          </div>
        </div>

        {/* Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>
          
          <div>
            <TopProducts />
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 📈 COMPOSANT STATS CARD

```typescript
// src/components/admin/StatsCard.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
}

const colorClasses = {
  blue: 'bg-blue-500/10 text-blue-500',
  green: 'bg-green-500/10 text-green-500',
  yellow: 'bg-yellow-500/10 text-yellow-500',
  purple: 'bg-purple-500/10 text-purple-500',
  red: 'bg-red-500/10 text-red-500',
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color,
}) => {
  const isPositive = change >= 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
        
        <div className={`flex items-center gap-1 text-sm font-medium ${
          isPositive ? 'text-green-500' : 'text-red-500'
        }`}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>{Math.abs(change)}%</span>
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
      </h3>
      
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {title}
      </p>
    </div>
  );
};
```

---

## 📊 GRAPHIQUE REVENUS

```typescript
// src/components/admin/RevenueChart.tsx
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { apiClient } from '@/config/axios';

export const RevenueChart: React.FC = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      const response = await apiClient.get('/api/admin/analytics/revenue?days=30');
      setData(response.data.data);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    }
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F9D406" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#F9D406" stopOpacity={0} />
          </linearGradient>
        </defs>
        
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
        
        <XAxis
          dataKey="date"
          stroke="#9CA3AF"
          fontSize={12}
          tickLine={false}
        />
        
        <YAxis
          stroke="#9CA3AF"
          fontSize={12}
          tickLine={false}
          tickFormatter={(value) => `${value} DH`}
        />
        
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
          }}
          formatter={(value: any) => [`${value} DH`, 'Revenus']}
        />
        
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#F9D406"
          strokeWidth={2}
          fill="url(#colorRevenue)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
```

---

## 👥 GRAPHIQUE UTILISATEURS

```typescript
// src/components/admin/UserChart.tsx
import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { apiClient } from '@/config/axios';

export const UserChart: React.FC = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await apiClient.get('/api/admin/analytics/users?days=30');
      setData(response.data.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
        
        <XAxis
          dataKey="date"
          stroke="#9CA3AF"
          fontSize={12}
          tickLine={false}
        />
        
        <YAxis
          stroke="#9CA3AF"
          fontSize={12}
          tickLine={false}
        />
        
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
          }}
          formatter={(value: any) => [value, 'Nouveaux membres']}
        />
        
        <Bar dataKey="users" fill="#3B82F6" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
```

---

## 📋 GESTION DES MEMBRES

```typescript
// src/pages/admin/Members.tsx
import React, { useState, useEffect } from 'react';
import {
  Search, Filter, Download, Plus, Edit, Trash2, Mail, Phone
} from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { apiClient } from '@/config/axios';

export default function MembersManagement() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: 'all',
    tier: 'all',
    status: 'all',
  });

  useEffect(() => {
    fetchMembers();
  }, [filters, searchTerm]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/members', {
        params: {
          search: searchTerm,
          ...filters,
        },
      });
      setMembers(response.data.members);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) return;

    try {
      await apiClient.delete(`/api/members/${id}`);
      fetchMembers();
    } catch (error) {
      console.error('Error deleting member:', error);
    }
  };

  const handleExport = async () => {
    try {
      const response = await apiClient.get('/api/admin/members/export', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `members-${new Date().toISOString()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const columns = [
    {
      header: 'Membre',
      accessor: 'member',
      cell: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold">
              {row.firstName[0]}{row.lastName[0]}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {row.firstName} {row.lastName}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {row.membershipNumber}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact',
      accessor: 'contact',
      cell: (row: any) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Mail size={14} />
            <span>{row.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Phone size={14} />
            <span>{row.phone || '-'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Rôle',
      accessor: 'role',
      cell: (row: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.role === 'Player' ? 'bg-blue-100 text-blue-700' :
          row.role === 'Staff' ? 'bg-purple-100 text-purple-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {row.role}
        </span>
      ),
    },
    {
      header: 'Tier',
      accessor: 'tier',
      cell: (row: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.tier === 'VIP' ? 'bg-yellow-100 text-yellow-700' :
          row.tier === 'Elite' ? 'bg-green-100 text-green-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {row.tier}
        </span>
      ),
    },
    {
      header: 'Statut',
      accessor: 'status',
      cell: (row: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.status === 'Active' ? 'bg-green-100 text-green-700' :
          'bg-red-100 text-red-700'
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.location.href = `/admin/members/${row._id}/edit`}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Edit size={16} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 size={16} className="text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Gestion des Membres
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {members.length} membres au total
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
              placeholder="Rechercher par nom, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Filters */}
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tous les rôles</option>
            <option value="Player">Joueur</option>
            <option value="Staff">Staff</option>
            <option value="Fan">Fan</option>
          </select>

          <select
            value={filters.tier}
            onChange={(e) => setFilters({ ...filters, tier: e.target.value })}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tous les tiers</option>
            <option value="VIP">VIP</option>
            <option value="Elite">Elite</option>
            <option value="Standard">Standard</option>
          </select>

          {/* Actions */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Download size={18} />
            <span>Exporter</span>
          </button>

          <button
            onClick={() => window.location.href = '/admin/members/new'}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={18} />
            <span>Nouveau</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={members}
        loading={loading}
      />
    </div>
  );
}
```

Suite dans le prochain fichier avec Export, Logs, Analytics et les routes backend ! 🚀
