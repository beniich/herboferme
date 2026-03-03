'use client';

import React, { useEffect, useState } from 'react';
import { fleetApi } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from 'react-hot-toast';
import { Vehicle } from '@reclamtrack/shared';

export default function FleetPage() {
    const { user } = useAuth();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                setIsLoading(true);
                const data = await fleetApi.getVehicles();
                // Le backend consolid   peut renvoyer { data: [...] } ou [...] directement
                setVehicles(Array.isArray(data) ? data : (data as any).data || []);
            } catch (error) {
                console.error('Error fetching fleet:', error);
                toast.error('Impossible de charger la flotte');
            } finally {
                setIsLoading(false);
            }
        };

        fetchVehicles();
    }, []);

    const filteredVehicles = vehicles.filter(v => 
        v.immatriculation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.modele.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const kpis = {
        total: vehicles.length,
        maintenance: vehicles.filter(v => v.statut === 'en_maintenance').length,
        active: vehicles.filter(v => v.statut === 'actif').length,
        alerts: vehicles.filter(v => v.statut === 'hors_service').length,
    };

    return (
        <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
            {/* Side Navigation */}
            <aside className="w-64 flex-shrink-0 flex flex-col bg-white dark:bg-[#111122] border-r border-slate-200 dark:border-slate-800">
                <div className="p-6 flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center text-white">
                        <span className="material-symbols-outlined">local_shipping</span>
                    </div>
                    <div>
                        <h1 className="text-sm font-bold tracking-tight">Fleet Manager</h1>
                        <p className="text-[10px] text-slate-500 dark:text-[#9292c8] uppercase tracking-wider font-semibold">Operations</p>
                    </div>
                </div>
                <nav className="flex-1 px-3 space-y-1">
                    <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#242447] text-white border-l-4 border-primary" href="#">
                        <span className="material-symbols-outlined">dashboard</span>
                        <span className="text-sm font-medium">Fleet Overview</span>
                    </a>
                    {/* Liens conserv  s pour l'UI */}
                    <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#242447] text-slate-600 dark:text-[#9292c8] transition-colors" href="#">
                        <span className="material-symbols-outlined">error</span>
                        <span className="text-sm font-medium">Complaints Log</span>
                    </a>
                    <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#242447] text-slate-600 dark:text-[#9292c8] transition-colors" href="#">
                        <span className="material-symbols-outlined">build</span>
                        <span className="text-sm font-medium">Interventions</span>
                    </a>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-y-auto">
                <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#111121]/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-6">
                        <h2 className="text-lg font-bold">Vehicle Fleet Monitoring</h2>
                        <div className="relative w-64">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                            <input 
                                className="w-full bg-slate-100 dark:bg-[#242447] border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary transition-all" 
                                placeholder="Search plates, models..." 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-xs font-bold">{user?.nom} {user?.prenom}</p>
                                <p className="text-[10px] text-slate-500 capitalize">{user?.role}</p>
                            </div>
                            <img className="h-9 w-9 rounded-full border-2 border-primary/20 object-cover" src={user?.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} alt="Profile" />
                        </div>
                    </div>
                </header>

                <div className="p-8 space-y-8">
                    {/* KPI Section Dynamique */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white dark:bg-[#1c1c30] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-semibold text-slate-500 dark:text-[#9292c8]">TOTAL VEHICLES</span>
                                <span className="material-symbols-outlined text-primary">local_shipping</span>
                            </div>
                            <h3 className="text-3xl font-black">{kpis.total}</h3>
                        </div>
                        <div className="bg-white dark:bg-[#1c1c30] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-semibold text-slate-500 dark:text-[#9292c8]">ACTIVE</span>
                                <span className="material-symbols-outlined text-emerald-500">task_alt</span>
                            </div>
                            <h3 className="text-3xl font-black text-emerald-500">{kpis.active}</h3>
                        </div>
                        <div className="bg-white dark:bg-[#1c1c30] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm ring-1 ring-amber-500/20">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-semibold text-slate-500 dark:text-[#9292c8]">MAINTENANCE</span>
                                <span className="material-symbols-outlined text-amber-500">warning</span>
                            </div>
                            <h3 className="text-3xl font-black text-amber-500">{kpis.maintenance}</h3>
                        </div>
                        <div className="bg-white dark:bg-[#1c1c30] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm ring-1 ring-red-500/20">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-semibold text-slate-500 dark:text-[#9292c8]">HORS SERVICE</span>
                                <span className="material-symbols-outlined text-red-500">dangerous</span>
                            </div>
                            <h3 className="text-3xl font-black text-red-500">{kpis.alerts}</h3>
                        </div>
                    </div>

                    {/* Tableau de Flotte Dynamique */}
                    <div className="bg-white dark:bg-[#1c1c30] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        {isLoading ? (
                            <div className="p-20 flex flex-col items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                                <p className="text-slate-500">Chargement de la flotte...</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-[#242447]/50 text-slate-500 dark:text-[#9292c8] text-[11px] font-bold uppercase tracking-wider">
                                        <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">Vehicle</th>
                                        <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">Model</th>
                                        <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">Km / Ann  e</th>
                                        <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredVehicles.map((vehicle) => (
                                        <tr key={vehicle.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-8 w-8 rounded flex items-center justify-center ${
                                                        vehicle.statut === 'actif' ? 'bg-emerald-500/10 text-emerald-500' : 
                                                        vehicle.statut === 'en_maintenance' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                                                    }`}>
                                                        <span className="material-symbols-outlined text-lg">
                                                            {vehicle.statut === 'actif' ? 'check_circle' : 
                                                             vehicle.statut === 'en_maintenance' ? 'priority_high' : 'dangerous'}
                                                        </span>
                                                    </div>
                                                    <span className="font-bold tracking-wide uppercase">{vehicle.immatriculation}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium">{vehicle.marque} {vehicle.modele}</td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {vehicle.kilometrage.toLocaleString()} km ({vehicle.annee})
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                    vehicle.statut === 'actif' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                    vehicle.statut === 'en_maintenance' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                    {vehicle.statut.replace('_', ' ')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredVehicles.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-10 text-center text-slate-500">Aucun v  hicule trouv  </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
