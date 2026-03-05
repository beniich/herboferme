'use client';

import React, { useMemo, useCallback } from 'react';
import { Link } from '@/i18n/navigation';
import { Truck, AlertCircle, Wrench, AlertTriangle, RefreshCw, Plus, Calendar } from 'lucide-react';
import { useFleetData } from '@/hooks/useFleetData';
import { FleetTable } from '@/components/fleet/FleetTable';
import { ErrorFallback } from '@/components/shared/ErrorFallback';
import { Skeleton } from '@/components/shared/Skeleton';
import { StatCard } from '@/components/shared/StatCard';
import toast from 'react-hot-toast';

export default function FleetPage() {
  const { data, isLoading, error, mutate } = useFleetData();

  const stats = useMemo(() => data?.stats || {
    totalVehicles: 0, activeVehicles: 0, maintenanceCount: 0, horsServiceCount: 0,
  }, [data?.stats]);

  const handleRefresh = useCallback(async () => {
    try { await mutate(); toast.success('Données actualisées'); }
    catch { toast.error("Erreur lors de l'actualisation"); }
  }, [mutate]);

  const handleDelete = useCallback(async (vehicleId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2065'}/api/fleet/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: { 'x-organization-id': localStorage.getItem('orgId') || '' },
      });
      if (!res.ok) throw new Error('Suppression échouée');
      toast.success('Véhicule supprimé');
      await mutate();
    } catch { toast.error('Erreur lors de la suppression'); }
  }, [mutate]);

  if (error) return (
    <div className="p-8">
      <ErrorFallback onRetry={handleRefresh} message="Impossible de charger la flotte" />
    </div>
  );

  return (
    <div className="page active p-6 lg:p-10 space-y-10" id="page-fleet">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="text-[10px] font-mono tracking-[3px] text-zinc-500 uppercase mb-1">Module Logistique · Parc Auto</div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <Truck className="text-amber-500" size={32} /> Fleet Overview
          </h1>
          <p className="text-sm text-zinc-400">Gestion de votre parc automobile, équipements et calendrier de maintenance.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-sm transition-all"
            title="Actualiser"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Actualiser
          </button>
          <Link
            href="/fleet/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold transition-all shadow-lg shadow-amber-500/20"
          >
            <Plus size={16} /> Ajouter Véhicule
          </Link>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {isLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} type="card" />) : (
          <>
            <StatCard
              label="Total Véhicules"
              value={stats.totalVehicles}
              unit="unités"
              icon={<Truck size={20} />}
              color="amber"
            />
            <StatCard
              label="Actifs"
              value={stats.activeVehicles}
              unit="véhicules"
              trend={stats.totalVehicles > 0 ? Math.round((stats.activeVehicles / stats.totalVehicles) * 100) : 0}
              icon={<Truck size={20} />}
              color="green"
            />
            <StatCard
              label="En Maintenance"
              value={stats.maintenanceCount}
              unit="véhicules"
              icon={<Wrench size={20} />}
              color="amber"
            />
            <StatCard
              label="Hors Service"
              value={stats.horsServiceCount}
              unit="véhicules"
              icon={<AlertTriangle size={20} />}
              color="red"
            />
          </>
        )}
      </div>

      {/* VEHICLES TABLE */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-zinc-900 bg-zinc-950/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Inventaire des Véhicules</h3>
          </div>
          <span className="text-xs text-zinc-500 font-mono">{data?.vehicles?.length ?? 0} entrées</span>
        </div>
        {isLoading ? (
          <div className="p-8"><Skeleton type="table" /></div>
        ) : (
          <FleetTable
            vehicles={data?.vehicles || []}
            isLoading={isLoading}
            onEdit={(vehicle) => console.log('Edit', vehicle._id)}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* MAINTENANCE SCHEDULE */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-zinc-900 bg-zinc-950/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="text-amber-500" size={18} />
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Calendrier de Maintenance</h3>
          </div>
          <Link href="/fleet/maintenance" className="text-[10px] font-bold text-amber-400 hover:text-amber-300 uppercase tracking-widest">
            Voir tout →
          </Link>
        </div>
        <div className="p-10 text-center text-zinc-600 italic">
          Aucune maintenance programmée à venir.
        </div>
      </div>
    </div>
  );
}
