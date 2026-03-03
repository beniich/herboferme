'use client';

import { FleetRouteMap } from '@/components/maps/FleetRouteMap';
import { Layers, RefreshCw, Truck } from 'lucide-react';
import { useState } from 'react';

export default function FleetMapPage() {
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const handleRefresh = () => {
    setLastUpdate(new Date());
    // The FleetRouteMap component handles its own refresh,
    // but this could trigger a global re-fetch if needed.
    window.location.reload();
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-50 dark:bg-[#0a0a14]">
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-blue-500/10 rounded-xl">
            <Truck className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Suivi de la Flotte
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[10px] uppercase tracking-widest rounded-full font-black">
                Live
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Localisation temps r  el et itin  raires des   quipes d'intervention
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Derni  re mise    jour</span>
            <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
              {lastUpdate.toLocaleTimeString()}
            </span>
          </div>

          <button
            onClick={handleRefresh}
            className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm group"
          >
            <RefreshCw className="w-5 h-5 text-slate-600 dark:text-slate-400 group-active:rotate-180 transition-transform duration-500" />
          </button>

          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95">
            <Layers className="w-4 h-4" />
            Vue Satellite
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0">
          <FleetRouteMap />
        </div>

        {/* Floating Stats Overlay */}
        <div className="absolute top-6 left-6 flex flex-col gap-3 pointer-events-none">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 dark:border-slate-800 w-52 pointer-events-auto">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">  quipes Actives</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">12</span>
              <span className="mb-1 text-xs font-bold text-green-500">+2 vs hier</span>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 dark:border-slate-800 w-52 pointer-events-auto">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Interventions</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">28</span>
              <span className="mb-1 text-xs font-bold text-blue-500">8 en transit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
