/**
 * 📄 HERBOFERME FRONTEND - PAGES (PRODUCTION READY)
 * 
 * Patterns:
 * ├─ Type-safe components
 * ├─ Memoization (React.memo, useMemo)
 * ├─ Error boundaries
 * ├─ Skeleton loading
 * └─ Accessibility
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 1. SHARED COMPONENTS - Reusable building blocks
// ═══════════════════════════════════════════════════════════════════════════════

// frontend/components/shared/StatCard.tsx
import React, { memo } from 'react';

export interface StatCardProps {
  label: string;
  value: number | string;
  unit?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'red';
  trend?: string;
  onClick?: () => void;
}

const colorClasses = {
  blue: 'bg-blue-50 border-l-blue-500',
  green: 'bg-green-50 border-l-green-500',
  orange: 'bg-orange-50 border-l-orange-500',
  red: 'bg-red-50 border-l-red-500',
};

const textColorClasses = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  orange: 'text-orange-600',
  red: 'text-red-600',
};

export const StatCard = memo(function StatCard({
  label,
  value,
  unit,
  icon,
  color = 'blue',
  trend,
  onClick,
}: StatCardProps) {
  return (
    <div
      className={`p-6 rounded-lg border-l-4 ${colorClasses[color]} cursor-pointer hover:shadow-lg transition-shadow`}
      onClick={onClick}
      role="article"
      aria-label={`${label}: ${value}${unit ? ` ${unit}` : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <div className="mt-2 flex items-baseline gap-1">
            <p className={`text-3xl font-bold ${textColorClasses[color]}`}>
              {value}
            </p>
            {unit && <p className="text-sm text-gray-500">{unit}</p>}
          </div>
          {trend && <p className="mt-2 text-xs text-gray-500">{trend}</p>}
        </div>
        {icon && <div className="text-2xl">{icon}</div>}
      </div>
    </div>
  );
});


// frontend/components/shared/Skeleton.tsx
import React from 'react';

export interface SkeletonProps {
  count?: number;
  height?: string;
}

export function CardSkeleton({ count = 4 }: SkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse"
        />
      ))}
    </div>
  );
}

export function TableSkeleton({ count = 5 }: SkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse"
        />
      ))}
    </div>
  );
}


// frontend/components/shared/ErrorFallback.tsx
import React from 'react';

export interface ErrorFallbackProps {
  error: Error | null;
  onRetry: () => void;
}

export function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  return (
    <div className="rounded-lg bg-red-50 border border-red-200 p-6">
      <h3 className="text-lg font-semibold text-red-900">Something went wrong</h3>
      {error && <p className="mt-2 text-sm text-red-700">{error.message}</p>}
      <button
        onClick={onRetry}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// 2. PAGE - Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

// frontend/app/dashboard/page.tsx
'use client';

import React, { useMemo, useCallback } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useAuth } from '@/hooks/useAuth';
import { StatCard } from '@/components/shared/StatCard';
import { CardSkeleton, TableSkeleton } from '@/components/shared/Skeleton';
import { ErrorFallback } from '@/components/shared/ErrorFallback';

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data, isLoading, error, refresh } = useDashboardData();

  // Guard: Check authentication
  if (authLoading) return <div className="p-8">Loading...</div>;
  if (!user) return <div className="p-8">Please log in</div>;

  // Memoize stats cards to prevent unnecessary recalculations
  const financeCards = useMemo(() => {
    if (!data?.finance) return [];

    return [
      {
        label: 'Revenue',
        value: (data.finance.year.revenue / 1_000_000).toFixed(2),
        unit: 'MDH',
        icon: '📈',
        color: 'green' as const,
        trend: 'Year total',
      },
      {
        label: 'Expenses',
        value: (data.finance.year.expenses / 1000).toFixed(0),
        unit: 'KDH',
        icon: '📉',
        color: 'red' as const,
        trend: 'Year total',
      },
      {
        label: 'Profit',
        value: (data.finance.year.profit / 1000).toFixed(0),
        unit: 'KDH',
        icon: '💰',
        color: data.finance.year.profit >= 0 ? 'green' : 'red',
        trend: 'Year total',
      },
    ];
  }, [data?.finance]);

  const operationalCards = useMemo(() => {
    if (!data) return [];

    return [
      {
        label: 'Total Animals',
        value: data.animals.totalAnimals,
        unit: 'heads',
        icon: '🐄',
        color: 'blue' as const,
      },
      {
        label: 'Active Crops',
        value: data.crops.byStatus?.find(s => s._id === 'GROWING')?.count || 0,
        unit: 'lots',
        icon: '🌾',
        color: 'green' as const,
      },
      {
        label: 'Water Volume',
        value: (data.irrigation.totalVolume || 0).toFixed(0),
        unit: 'm³',
        icon: '💧',
        color: 'blue' as const,
      },
    ];
  }, [data]);

  const handleRefresh = useCallback(async () => {
    await refresh();
  }, [refresh]);

  // Error state
  if (error) {
    return (
      <div className="p-8">
        <ErrorFallback error={error} onRetry={handleRefresh} />
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <CardSkeleton count={3} />
        <CardSkeleton count={3} />
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-600">Welcome back, {user?.email}</p>
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          aria-label="Refresh data"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Finance Stats */}
      <section aria-label="Finance statistics">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Finance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {financeCards.map(card => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>
      </section>

      {/* Operational Stats */}
      <section aria-label="Operational statistics">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Operations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {operationalCards.map(card => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>
      </section>

      {/* Recent Transactions */}
      {data?.transactions && (
        <section aria-label="Recent transactions">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Transactions</h2>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Sector</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Type</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.transactions.slice(0, 8).map(tx => (
                  <tr key={tx._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(tx.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{tx.description}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{tx.sector}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        tx.type === 'recette'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm font-semibold text-right ${
                      tx.type === 'recette' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {tx.type === 'recette' ? '+' : '-'}{tx.amount.toLocaleString('fr-FR')} DH
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// 3. PAGE - Animals
// ═══════════════════════════════════════════════════════════════════════════════

// frontend/app/animals/page.tsx
'use client';

import React, { useMemo, useCallback, useState } from 'react';
import { useAnimalsData } from '@/hooks/useDomainData';
import { useMutation } from '@/hooks/useMutation';
import { useAuth } from '@/hooks/useAuth';
import { StatCard } from '@/components/shared/StatCard';
import { CardSkeleton, TableSkeleton } from '@/components/shared/Skeleton';
import { ErrorFallback } from '@/components/shared/ErrorFallback';

export default function AnimalsPage() {
  const { user } = useAuth();
  const { stats, items, isLoading, error, refresh } = useAnimalsData();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { execute: deleteAnimal, isLoading: isDeleting } = useMutation(
    'delete',
    `/api/animals/${selectedId}`,
    {
      onSuccess: () => {
        refresh();
        setSelectedId(null);
      },
    }
  );

  // Memoize stats cards
  const statCards = useMemo(() => {
    if (!stats) return [];

    return [
      {
        label: 'Total Animals',
        value: stats.total || 0,
        unit: 'heads',
        icon: '🐄',
        color: 'blue' as const,
      },
      {
        label: 'Active',
        value: stats.active || 0,
        unit: 'heads',
        icon: '✓',
        color: 'green' as const,
        trend: stats.total ? `${((stats.active / stats.total) * 100).toFixed(0)}%` : undefined,
      },
    ];
  }, [stats]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Are you sure?')) return;

      setSelectedId(id);
      try {
        await deleteAnimal({});
      } catch (err) {
        console.error('Delete failed:', err);
      }
    },
    [deleteAnimal]
  );

  const handleRefresh = useCallback(() => refresh(), [refresh]);

  if (error) {
    return (
      <div className="p-8">
        <ErrorFallback error={error} onRetry={handleRefresh} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <CardSkeleton count={2} />
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Animals</h1>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={isLoading}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {statCards.map(card => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Table */}
      {items && items.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map(item => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {user?.roles.includes('admin') && (
                      <button
                        onClick={() => handleDelete(item._id)}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-900 text-xs font-medium"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No animals found</p>
        </div>
      )}
    </div>
  );
}
