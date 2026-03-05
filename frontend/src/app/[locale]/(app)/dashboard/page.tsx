'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useOrgStore } from '@/store/orgStore';
import { useDashboardData } from '@/hooks/useDashboardData';
import { StatCard } from '@/components/shared/StatCard';
import { Skeleton } from '@/components/shared/Skeleton';
import { ErrorFallback } from '@/components/shared/ErrorFallback';
import { 
  TrendingUp, TrendingDown, Tractor, AlertTriangle,
  Users, LineChart, Server, RefreshCw
} from 'lucide-react';

// ─── TYPES ────────────────────────────────────────────────────────────────
interface AlertItem {
  level: 'critical' | 'warning' | 'info'; 
  icon: React.ReactNode;
  text: string; 
  time: string; 
  section: string; 
  href: string;
}

const STATIC_ALERTS: AlertItem[] = [
  { level: 'warning', icon: <AlertTriangle size={14} />, text: 'Vaccination bovins — Échéance Proche', time: 'Demain', section: 'Élevage', href: '/fr/elevage' },
  { level: 'info', icon: <Tractor size={14} />, text: 'Tracteur JD-8R — Maintenance programmée', time: 'Dans 5 jours', section: 'Équipements', href: '/fr/fleet' },
];

export default function DashboardPage() {
  const { activeOrganization } = useOrgStore();
  const [now, setNow] = useState('');
  const {
    agro, it, maintenance,
    loading, refresh, error
  } = useDashboardData();

  useEffect(() => {
    const d = new Date();
    setNow(d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase()));
  }, []);

  if (error) {
    return (
      <div className="p-8">
        <ErrorFallback onRetry={refresh} message="Impossible de charger le tableau de bord" />
      </div>
    );
  }

  return (
    <div className="page active p-6 lg:p-10 space-y-10" id="page-dashboard">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="text-[10px] font-mono tracking-[3px] text-zinc-500 uppercase mb-1">Résumé Consolide · {now}</div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            {activeOrganization?.name || 'Tableau de Bord'}
          </h1>
          <p className="text-sm text-zinc-400">Analyse consolidée de votre exploitation en temps réel.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={refresh} 
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all text-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Actualiser
          </button>
          <Link href="/analytics" className="flex items-center justify-center px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-500/20">
            Rapports Avancés
          </Link>
        </div>
      </div>

      {/* KPI GRID - FINANCE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} type="card" />)
        ) : (
          <>
            <StatCard 
              label="Chiffre d'Affaires" 
              value={((agro?.financials.totalRevenue ?? 0) / 1_000).toFixed(0)} 
              unit="KDH"
              icon={<TrendingUp size={20} />}
              color="green"
            />
            <StatCard 
              label="Charges Totales" 
              value={((agro?.financials.totalExpenses ?? 0) / 1_000).toFixed(0)} 
              unit="KDH"
              icon={<TrendingDown size={20} />}
              color="red"
            />
            <StatCard 
              label="Bénéfice Net" 
              value={((agro?.financials.netProfit ?? 0) / 1_000).toFixed(0)} 
              unit="KDH"
              icon={<TrendingUp size={20} />}
              color="amber"
            />
            <StatCard 
              label="Trésorerie (Est.)" 
              value={((agro?.financials.cashFlow ?? 0) / 1_000).toFixed(1)} 
              unit="KDH"
              icon={<LineChart size={20} />}
              color="blue"
            />
          </>
        )}
      </div>

      {/* KPI GRID - OPERATIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {loading ? (
          Array(5).fill(0).map((_, i) => <Skeleton key={i} type="card" />)
        ) : (
          <>
            <StatCard 
              label="Cheptel Total" 
              value={agro?.cheptel.total ?? 0} 
              unit="têtes"
              icon={<Tractor size={18} />}
              color="amber"
              variant="compact"
            />
            <StatCard 
              label="Cultures" 
              value={agro?.cultures.totalHa ?? 0} 
              unit="hectares"
              icon={<Trees size={18} />}
              color="green"
              variant="compact"
            />
            <StatCard 
              label="Tickets IT" 
              value={it?.total ?? 0} 
              unit="actifs"
              icon={<Server size={18} />}
              color="blue"
              variant="compact"
            />
             <StatCard 
              label="Maintenance" 
              value={maintenance?.total ?? 0} 
              unit="récl."
              icon={<Users size={18} />}
              color="indigo"
              variant="compact"
            />
            <StatCard 
              label="SLA Breach" 
              value={it?.slaBreach ?? 0} 
              unit="tickets"
              icon={<AlertTriangle size={18} />}
              color="red"
              variant="compact"
            />
          </>
        )}
      </div>

      {/* CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* TEAM PERFORMANCE */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/50">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span> Charge des Équipes
            </h3>
            <Link href="/teams" className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest">
              Gérer les équipes →
            </Link>
          </div>
          <div className="p-8">
            {loading ? (
              <Skeleton type="list" />
            ) : !maintenance?.teamStats || maintenance.teamStats.length === 0 ? (
              <div className="py-20 text-center text-zinc-500 font-medium italic">Aucune donnée d'équipe disponible.</div>
            ) : (
              <div className="space-y-6">
                {maintenance.teamStats.map((team, idx) => (
                  <div key={idx} className="group">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider group-hover:text-zinc-200 transition-colors">{team.name}</span>
                      <span className="text-sm font-mono font-bold text-white">
                        {team.activeAssignments} tâches actives
                      </span>
                    </div>
                    <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(99,102,241,0.3)]"
                        style={{ 
                          width: `${Math.min(100, (team.activeAssignments / 10) * 100)}%`, 
                          backgroundColor: team.color || 'var(--indigo)' 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ALERTS SECTION */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-zinc-900 bg-zinc-950/50">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"></span> Système d'Alerte
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {STATIC_ALERTS.map((a, i) => (
              <Link key={i} href={a.href} className="group block p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700/50 transition-all hover:bg-zinc-900">
                <div className="flex gap-4">
                  <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${a.level === 'warning' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`} />
                  <div>
                    <div className="text-xs font-bold text-zinc-100 mb-1 group-hover:text-blue-400 transition-colors flex items-center gap-2">
                      {a.icon} {a.text}
                    </div>
                    <div className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">
                      {a.time} · <span className="text-zinc-400">{a.section}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {it?.slaBreach && it.slaBreach > 0 && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <div className="flex items-center gap-3 text-rose-500 font-bold text-xs uppercase tracking-widest">
                  <AlertTriangle size={16} /> SLA Breached ({it.slaBreach})
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
