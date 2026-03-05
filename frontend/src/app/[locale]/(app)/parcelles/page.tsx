'use client';

import React, { useMemo } from 'react';
import { useCropsData } from '@/hooks/useDomainData';
import { StatCard } from '@/components/shared/StatCard';
import { Skeleton } from '@/components/shared/Skeleton';
import { ErrorFallback } from '@/components/shared/ErrorFallback';
import { 
  Map, 
  Sprout, 
  Maximize, 
  Zap, 
  RefreshCw, 
  Activity, 
  Satellite,
  Compass,
  ArrowUpRight,
  Layers,
  LayoutGrid
} from 'lucide-react';

interface Crop {
  _id: string;
  name: string;
  category: string;
  plotId: string;
  status: string;
  plantedDate: string;
  surface?: number;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PLANTED:   { label: 'Planté',          color: 'bg-blue-500/10 text-blue-500' },
  GROWING:   { label: 'En croissance',   color: 'bg-emerald-500/10 text-emerald-500' },
  READY:     { label: 'Prêt à récolter', color: 'bg-amber-500/10 text-amber-500' },
  HARVESTED: { label: 'Récolté',         color: 'bg-zinc-500/10 text-zinc-400' },
};

export default function ParcellesPage() {
  const { items: rawCrops, isLoading, error, refresh } = useCropsData();

  const crops = (rawCrops as unknown as Crop[]) || [];

  const kpis = useMemo(() => {
    const uniquePlots = new Set(crops.map(c => c.plotId)).size;
    const totalSurface = crops.reduce((sum, c) => sum + (c.surface || 0), 0);
    const activeCrops = crops.filter(c => c.status === 'GROWING' || c.status === 'PLANTED').length;
    const readyCrops = crops.filter(c => c.status === 'READY').length;

    return { uniquePlots, totalSurface, activeCrops, readyCrops };
  }, [crops]);

  if (error) return <ErrorFallback onRetry={refresh} message="Impossible de charger les parcelles" />;

  return (
    <div className="page active p-6 lg:p-10 space-y-10" id="page-parcelles">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="text-[10px] font-mono tracking-[3px] text-zinc-500 uppercase mb-1">Module Terres · Cartographie</div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <Compass className="text-emerald-500" size={32} /> Parcelles & Cultures
          </h1>
          <p className="text-sm text-zinc-400">Registre parcellaire, suivi des cycles de culture et imagerie satellite.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={refresh}
            className="p-2 text-zinc-500 hover:text-white transition-colors"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} type="card" />)
        ) : (
          <>
            <StatCard 
              label="Nb Parcelles" 
              value={kpis.uniquePlots} 
              unit="unités"
              icon={<Map size={20} />}
              color="emerald"
            />
            <StatCard 
              label="Surface Cultivée" 
              value={kpis.totalSurface.toFixed(1)} 
              unit="ha"
              icon={<Maximize size={20} />}
              color="emerald"
            />
            <StatCard 
              label="Cultures Actives" 
              value={kpis.activeCrops} 
              unit="parc."
              icon={<Sprout size={20} />}
              color="teal"
            />
            <StatCard 
              label="Prêt à Récolter" 
              value={kpis.readyCrops} 
              unit="parc."
              icon={<Zap size={20} />}
              color="amber"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* TABLE PANEL */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-zinc-900 bg-zinc-950/50 flex items-center gap-3">
            <Layers className="text-emerald-500" size={18} />
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Registre des Parcelles</h3>
          </div>
          <div className="overflow-x-auto text-sm">
            {isLoading ? <div className="p-8"><Skeleton type="table" /></div> : crops.length === 0 ? (
              <div className="p-20 text-center text-zinc-500 italic">Aucune parcelle enregistrée.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-900/30">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-900">Parcelle</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-900">Culture</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-900">Surface (ha)</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-900">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/50">
                  {crops.map(c => (
                    <tr key={c._id} className="hover:bg-zinc-900/30 transition-colors group">
                      <td className="px-6 py-4 font-bold text-white uppercase tracking-wider">{c.plotId || '—'}</td>
                      <td className="px-6 py-4 text-zinc-300 font-medium">{c.name}</td>
                      <td className="px-6 py-4 font-mono text-zinc-400">{c.surface || '0'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_MAP[c.status]?.color || 'bg-zinc-800 text-zinc-500'}`}>
                          {STATUS_MAP[c.status]?.label || c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* SECONDARY PANELS */}
        <div className="flex flex-col gap-6">
          
          {/* REPARTITION PANELS */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-xl">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <LayoutGrid size={14} className="text-emerald-500" /> Répartition
            </h4>
            <div className="space-y-5">
              {[
                { label: 'Céréales', val: 45, color: 'bg-amber-500' },
                { label: 'P.A.M', val: 25, color: 'bg-emerald-500' },
                { label: 'Arboriculture', val: 20, color: 'bg-teal-500' },
                { label: 'Maraîchage', val: 10, color: 'bg-sky-500' },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-medium">
                    <span className="text-zinc-400">{item.label}</span>
                    <span className="text-white font-mono">{item.val}%</span>
                  </div>
                  <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${item.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NDVI PANEL */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Satellite size={80} />
            </div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Activity size={14} className="text-emerald-500" /> Santé Végétale
            </h4>
            <div className="text-center py-4 relative z-10">
              <div className="text-5xl font-black text-white tracking-tighter mb-1 font-display">0.78</div>
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-[2px]">Indice NDVI Moyen</div>
              <div className="mt-4 flex items-center justify-center gap-2 text-emerald-400 bg-emerald-500/10 w-fit mx-auto px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <ArrowUpRight size={12} /> +4% vs moyenne saison
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-zinc-900">
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                Analyse satellite multispectrale. La vigueur est optimale sur les parcelles P1 et P4. Vigilance modérée sur Zone Sud (P7).
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
