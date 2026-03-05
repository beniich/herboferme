'use client';

import React, { useMemo } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { StatCard } from '@/components/shared/StatCard';
import { Skeleton } from '@/components/shared/Skeleton';
import { ErrorFallback } from '@/components/shared/ErrorFallback';
import {
  BarChart3, Activity, CheckCircle2, AlertTriangle,
  Ticket, Users, TrendingUp, Server, Wrench, RefreshCw, PieChart
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell
} from 'recharts';

const PALETTE = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];

export default function AnalyticsPage() {
  const { agro, it, maintenance, loading, error, refresh } = useDashboardData();

  // Build chart data from real API data
  const itByStatus = useMemo(() => {
    if (!it?.byStatus) return [];
    return it.byStatus.map((s, i) => ({ name: s._id, value: s.count, color: PALETTE[i % PALETTE.length] }));
  }, [it]);

  const maintenanceByStatus = useMemo(() => {
    if (!maintenance?.byStatus) return [];
    return Object.entries(maintenance.byStatus).map(([key, val], i) => ({
      name: key, value: val, color: PALETTE[i % PALETTE.length]
    }));
  }, [maintenance]);

  const cultureGraph = useMemo(() => {
    if (!agro?.cultures?.categories) return [];
    return agro.cultures.categories.map(c => ({ name: c._id, count: c.count }));
  }, [agro]);

  if (error) return <ErrorFallback onRetry={refresh} message="Impossible de charger les données analytiques" />;

  return (
    <div className="page active p-6 lg:p-10 space-y-10" id="page-analytics">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="text-[10px] font-mono tracking-[3px] text-zinc-500 uppercase mb-1">Intelligence Opérationnelle · Temps Réel</div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <BarChart3 className="text-indigo-500" size={32} /> Analytics & KPIs
          </h1>
          <p className="text-sm text-zinc-400">Vue consolidée des performances — IT, Agriculture & Maintenance.</p>
        </div>
        <button onClick={refresh} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-sm transition-all">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Actualiser
        </button>
      </div>

      {/* KPI GRID — IT */}
      <div>
        <h2 className="text-[10px] text-zinc-500 uppercase font-mono tracking-[3px] mb-4 flex items-center gap-2">
          <Server size={12} /> Module IT & Helpdesk
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} type="card" />) : (
            <>
              <StatCard label="Tickets Total" value={it?.total ?? 0} unit="tickets" icon={<Ticket size={20} />} color="blue" />
              <StatCard label="En Attente" value={it?.byStatus.find(s => s._id === 'open')?.count ?? 0} unit="actifs" icon={<Activity size={20} />} color="amber" />
              <StatCard label="Résolus" value={it?.byStatus.find(s => s._id === 'resolved')?.count ?? 0} unit="tickets" icon={<CheckCircle2 size={20} />} color="green" />
              <StatCard label="SLA Breach" value={it?.slaBreach ?? 0} unit="tickets" icon={<AlertTriangle size={20} />} color="red" />
            </>
          )}
        </div>
      </div>

      {/* KPI GRID — AGRO */}
      <div>
        <h2 className="text-[10px] text-zinc-500 uppercase font-mono tracking-[3px] mb-4 flex items-center gap-2">
          <TrendingUp size={12} /> Module Agricole
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {loading ? Array(3).fill(0).map((_, i) => <Skeleton key={i} type="card" />) : (
            <>
              <StatCard label="Cheptel Total" value={agro?.cheptel.total ?? 0} unit="têtes" icon={<Users size={20} />} color="amber" />
              <StatCard label="Surface Cultivée" value={agro?.cultures.totalHa ?? 0} unit="ha" icon={<TrendingUp size={20} />} color="green" />
              <StatCard label="Revenus Totaux" value={((agro?.financials.totalRevenue ?? 0) / 1000).toFixed(0)} unit="KDH" icon={<BarChart3 size={20} />} color="indigo" />
            </>
          )}
        </div>
      </div>

      {/* KPI GRID — MAINTENANCE */}
      <div>
        <h2 className="text-[10px] text-zinc-500 uppercase font-mono tracking-[3px] mb-4 flex items-center gap-2">
          <Wrench size={12} /> Module Maintenance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {loading ? Array(3).fill(0).map((_, i) => <Skeleton key={i} type="card" />) : (
            <>
              <StatCard label="Réclamations Total" value={maintenance?.total ?? 0} unit="total" icon={<AlertTriangle size={20} />} color="amber" />
              <StatCard label="En Cours" value={maintenance?.byStatus?.['en_cours'] ?? 0} unit="actives" icon={<Activity size={20} />} color="blue" />
              <StatCard label="Résolues" value={maintenance?.byStatus?.['resolue'] ?? 0} unit="total" icon={<CheckCircle2 size={20} />} color="green" />
            </>
          )}
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* CULTURES PAR CATÉGORIE */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-zinc-900 flex items-center gap-3 bg-zinc-950/50">
            <BarChart3 className="text-emerald-500" size={18} />
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Cultures par Catégorie</h3>
          </div>
          <div className="p-6">
            {loading ? <Skeleton type="list" /> : cultureGraph.length === 0 ? (
              <div className="py-16 text-center text-zinc-500 italic">Aucune donnée de culture disponible.</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={cultureGraph} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorCulture" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '10px', fontSize: '12px' }}
                    itemStyle={{ color: '#a1a1aa' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorCulture)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* TICKETS IT PAR STATUT */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-zinc-900 flex items-center gap-3 bg-zinc-950/50">
            <PieChart className="text-indigo-500" size={18} />
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Tickets IT par Statut</h3>
          </div>
          <div className="p-6">
            {loading ? <Skeleton type="list" /> : itByStatus.length === 0 ? (
              <div className="py-16 text-center text-zinc-500 italic">Aucun ticket enregistré.</div>
            ) : (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={200}>
                  <RechartsPieChart>
                    <Pie data={itByStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                      {itByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '10px', fontSize: '12px' }}
                      itemStyle={{ color: '#a1a1aa' }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {itByStatus.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-zinc-400 capitalize">{item.name}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MAINTENANCE PAR STATUT */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-zinc-900 flex items-center gap-3 bg-zinc-950/50">
            <Wrench className="text-amber-500" size={18} />
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Réclamations par Statut</h3>
          </div>
          <div className="p-6 space-y-4">
            {loading ? <Skeleton type="list" /> : maintenanceByStatus.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 italic">Aucune réclamation.</div>
            ) : maintenanceByStatus.map((item, i) => {
              const maxVal = Math.max(...maintenanceByStatus.map(x => x.value));
              const pct = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
              return (
                <div key={i}>
                  <div className="flex justify-between text-[11px] font-medium mb-1.5">
                    <span className="text-zinc-400 capitalize">{item.name}</span>
                    <span className="text-white font-mono">{item.value}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TEAM WORKLOAD */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-zinc-900 flex items-center gap-3 bg-zinc-950/50">
            <Users className="text-blue-500" size={18} />
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Charge des Équipes</h3>
          </div>
          <div className="p-6 space-y-4">
            {loading ? <Skeleton type="list" /> : !maintenance?.teamStats || maintenance.teamStats.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 italic">Aucune équipe disponible.</div>
            ) : maintenance.teamStats.map((team, i) => {
              const maxAssign = Math.max(...maintenance.teamStats.map(t => t.activeAssignments), 1);
              const pct = (team.activeAssignments / maxAssign) * 100;
              return (
                <div key={i}>
                  <div className="flex justify-between text-[11px] font-medium mb-1.5">
                    <span className="text-zinc-400">{team.name}</span>
                    <span className="text-white font-mono">{team.activeAssignments} tâches</span>
                  </div>
                  <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${pct}%`, backgroundColor: team.color || '#6366f1' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
