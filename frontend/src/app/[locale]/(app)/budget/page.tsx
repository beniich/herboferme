'use client';

import React, { useMemo } from 'react';
import { useBudgetsData, useFinanceData } from '@/hooks/useDomainData';
import { StatCard } from '@/components/shared/StatCard';
import { Skeleton } from '@/components/shared/Skeleton';
import { ErrorFallback } from '@/components/shared/ErrorFallback';
import { 
  TrendingUp, TrendingDown, DollarSign, PieChart, 
  RefreshCw, AlertTriangle, ChevronRight
} from 'lucide-react';
import { useCurrencyStore } from '@/store/currencyStore';

export default function BudgetPage() {
  const { data: budgets, isLoading: budgetsLoading, error: budgetsError, refresh: refreshBudgets } = useBudgetsData();
  const { data: financeStats, isLoading: financeLoading, error: financeError, refresh: refreshFinance } = useFinanceData();
  const { format } = useCurrencyStore();

  const isLoading = budgetsLoading || financeLoading;
  const error = budgetsError || financeError;
  const refresh = () => { refreshBudgets(); refreshFinance(); };

  // Global Finance Stats (from useFinanceData)
  const fin = financeStats as any;
  
  // Active Budget (from useBudgetsData)
  const activeBudget = useMemo(() => {
    const list = budgets as any;
    if (Array.isArray(list)) {
      return list.find((b: any) => b.status === 'active') || list[0];
    }
    return null;
  }, [budgets]);

  const budgetStats = useMemo(() => {
    if (!activeBudget) return null;
    return {
      totalBudgeted: activeBudget.totalBudgeted || 0,
      totalSpent: activeBudget.totalSpent || 0,
      remaining: (activeBudget.totalBudgeted || 0) - (activeBudget.totalSpent || 0),
      percentage: activeBudget.totalBudgeted > 0 
        ? (activeBudget.totalSpent / activeBudget.totalBudgeted) * 100 
        : 0,
      categories: activeBudget.categories || []
    };
  }, [activeBudget]);

  if (error) return <ErrorFallback onRetry={refresh} message="Impossible de charger les données financières" />;

  return (
    <div className="page active">
      <div className="p-6 lg:p-10 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <div className="text-[10px] font-mono tracking-[3px] text-zinc-500 uppercase mb-1">Module Finance · Budgets</div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
              <PieChart className="text-amber-500" size={32} /> Budget & Performance
            </h1>
            <p className="text-sm text-zinc-400">Synthèse annuelle · Calculé automatiquement depuis les transactions.</p>
          </div>
          <button onClick={refresh} title="Actualiser" className="p-2 text-zinc-500 hover:text-white transition-colors">
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* KPIs Annuels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {isLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} type="card" />) : (
            <>
              <StatCard label="Chiffre d'Affaires (An)" value={format(fin?.year?.income || 0, true)} icon={<TrendingUp size={20} />} color="green" />
              <StatCard label="Charges Totales (An)" value={format(fin?.year?.expense || 0, true)} icon={<TrendingDown size={20} />} color="red" />
              <StatCard label="Bénéfice Net (An)" value={format(fin?.year?.balance || 0, true)} icon={<DollarSign size={20} />} color={(fin?.year?.balance || 0) >= 0 ? "green" : "red"} />
              <StatCard 
                label="Marge Nette" 
                value={fin?.year?.income > 0 ? ((fin.year.balance / fin.year.income) * 100).toFixed(1) : '0'} 
                unit="%" 
                icon={<PieChart size={20} />} 
                color="amber" 
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Suivi du Budget Actif */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider mb-6 flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={18} /> Suivi du Budget: {activeBudget?.name || 'Aucun budget actif'}
            </h3>
            
            {isLoading ? <Skeleton type="list" /> : !activeBudget ? (
              <div className="py-10 text-center text-zinc-500 italic">Aucun budget défini.</div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2 text-sm italic">
                    <span className="text-zinc-400">Progression Globale</span>
                    <span className="text-zinc-300 font-mono">{format(activeBudget.totalSpent)} / {format(activeBudget.totalBudgeted)}</span>
                  </div>
                  <div className="h-3 bg-zinc-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${budgetStats!.percentage > 90 ? 'bg-rose-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(budgetStats!.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1 text-right">{budgetStats!.percentage.toFixed(1)}% Consommé</div>
                </div>

                <div className="space-y-4 pt-4 border-t border-zinc-900">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Par Catégorie</h4>
                  {budgetStats?.categories.map((c: any) => {
                    const pct = c.budgeted > 0 ? (c.spent / c.budgeted) * 100 : 0;
                    return (
                      <div key={c.name} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-300">{c.name}</span>
                          <span className="text-zinc-500 font-mono">{format(c.spent)}</span>
                        </div>
                        <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                          <div className="h-full bg-zinc-700" style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Performance par Secteur */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider mb-6 flex items-center gap-2">
              <TrendingUp className="text-amber-500" size={18} /> Performance par Secteur
            </h3>
            <div className="space-y-5">
              {isLoading ? <Skeleton type="list" /> : !fin || (fin.byCategory || []).length === 0 ? (
                <div className="py-10 text-center text-zinc-500 italic">Aucune donnée sectorielle.</div>
              ) : (
                fin.byCategory.map((s: any) => {
                  const profit = (s.revenue || 0) - (s.expenses || 0);
                  const maxVal = Math.max(...fin.byCategory.map((x: any) => Math.abs(x.revenue)));
                  const pct = maxVal > 0 ? (s.revenue / maxVal) * 100 : 0;
                  return (
                    <div key={s._id} className="space-y-2">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-zinc-400">{s._id}</span>
                        <span className={`font-mono font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {profit >= 0 ? '+' : ''}{format(profit, true)}
                        </span>
                      </div>
                      <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${profit >= 0 ? 'bg-emerald-500/50' : 'bg-rose-500/50'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* CTA vers comptabilité */}
        <div className="p-8 bg-zinc-950 border border-dashed border-zinc-800 rounded-2xl text-center space-y-4">
          <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500">
            <DollarSign size={24} />
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-white">Prêt à enregistrer ?</h4>
            <p className="text-sm text-zinc-500">Saisissez vos recettes et dépenses dans le module Comptabilité pour mettre à jour ces indicateurs.</p>
          </div>
          <button 
            onClick={() => window.location.href = '/comptabilite'}
            className="px-6 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm font-bold text-zinc-200 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all"
          >
            Aller à la Comptabilité →
          </button>
        </div>
      </div>
    </div>
  );
}
