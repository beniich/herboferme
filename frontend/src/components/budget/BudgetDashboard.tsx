'use client';

import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export const BudgetDashboard: React.FC = () => {
  const [budget, setBudget] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
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
      setCategories(data.budget?.categories || []);
    } catch (error) {
      console.error('Error fetching budget:', error);
    }
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="min-h-[calc(100vh-100px)] bg-slate-50 dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Budget & Finance
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Suivi budgétaire et analyse des dépenses
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <DollarSign size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Budget Total</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {(budget?.totalBudgeted || 0).toLocaleString()} MAD
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <TrendingUp size={24} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Dépensé</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {(budget?.totalSpent || 0).toLocaleString()} MAD
              </p>
            </div>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full"
              style={{
                width: `${((budget?.totalSpent / budget?.totalBudgeted) * 100) || 0}%`,
              }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Restant</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {(budget?.totalRemaining || 0).toLocaleString()} MAD
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Pie Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-semibold mb-6 text-slate-900 dark:text-white">
            Répartition par Catégorie
          </h2>
          {categories.length > 0 && isMounted ? (
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage?.toFixed(0) || 0}%`}
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
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">
                Aucune donnée budgétaire disponible
            </div>
          )}
        </div>

        {/* Categories List */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Détail par Catégorie
            </h2>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-700 overflow-y-auto max-h-[300px]">
            {categories.map((category, index) => (
                <div key={index} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                    {category.name}
                    </h3>
                    <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        category.percentage > 90
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                        : category.percentage > 70
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                    }`}
                    >
                    {(category.percentage || 0).toFixed(0)}% utilisé
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                    <div>
                    <p className="text-slate-500 dark:text-slate-400">Budgété</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                        {category.budgeted.toLocaleString()} MAD
                    </p>
                    </div>
                    <div>
                    <p className="text-slate-500 dark:text-slate-400">Dépensé</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                        {category.spent.toLocaleString()} MAD
                    </p>
                    </div>
                    <div>
                    <p className="text-slate-500 dark:text-slate-400">Restant</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                        {category.remaining.toLocaleString()} MAD
                    </p>
                    </div>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                    className={`h-2 rounded-full ${
                        category.percentage > 90
                        ? 'bg-red-500'
                        : category.percentage > 70
                        ? 'bg-orange-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(category.percentage || 0, 100)}%` }}
                    />
                </div>
                </div>
            ))}
            </div>
        </div>
      </div>
    </div>
  );
};
