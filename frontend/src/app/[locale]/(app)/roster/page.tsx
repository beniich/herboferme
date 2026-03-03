'use client';

import { useState, useEffect } from 'react';
import { hrApi, planningApi } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { toast } from 'react-hot-toast';

export default function RosterPage() {
    const [staff, setStaff] = useState<any[]>([]);
    const [roster, setRoster] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentWeek, setCurrentWeek] = useState('2024-W43');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Utilisation du nouvel hrApi consolid
                const [staffResponse, rosterResponse] = await Promise.all([
                    hrApi.getStaff(),
                    planningApi.getSchedule(),
                ]);

                // Normalisation des donn  es
                setStaff(Array.isArray(staffResponse) ? staffResponse : (staffResponse as any).data || []);
                setRoster(rosterResponse?.data || rosterResponse || { shifts: [] });
            } catch (error) {
                console.error('Error fetching roster:', error);
                toast.error('Erreur lors du chargement du planning');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [currentWeek]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <LoadingSpinner />
                    <p className="text-sm text-slate-500">Chargement du planning   quipe...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold">Planning   quipe</h1>
                    <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 shadow-sm">
                        <button className="material-symbols-outlined p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300">chevron_left</button>
                        <div className="px-4 text-sm font-bold text-slate-700 dark:text-slate-200">Semaine {currentWeek.split('-W')[1]} - 2024</div>
                        <button className="material-symbols-outlined p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300">chevron_right</button>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 transition-colors">
                        <span className="material-symbols-outlined text-lg">publish</span>
                        Publier le planning
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden mb-8">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <th className="sticky left-0 z-20 bg-slate-50 dark:bg-slate-800 px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-r border-slate-200 dark:border-slate-700 min-w-[280px]">
                                    Membre
                                </th>
                                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, idx) => (
                                    <th key={day} className={`px-4 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 ${idx >= 5 ? 'bg-slate-100/50 dark:bg-slate-800/80' : ''}`}>
                                        <div className="text-slate-900 dark:text-white mb-0.5">{day}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {staff.map((member: any) => (
                                <tr key={member.id || member._id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                    <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 px-6 py-4 border-r border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold font-display">
                                                {member.prenom?.[0]}{member.nom?.[0]}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-900 dark:text-white">{member.prenom} {member.nom}</div>
                                                <div className="text-[11px] text-slate-500 font-medium">{member.poste}</div>
                                            </div>
                                        </div>
                                    </td>
                                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                                        const shift = roster?.shifts?.find((s: any) => (s.staffId === member.id || s.staffId === member._id));
                                        const dayShift = shift?.days?.[day];
                                        const isOff = !dayShift || dayShift.toLowerCase() === 'off';

                                        return (
                                            <td key={day} className="p-2 border-r border-slate-100 dark:border-slate-800">
                                                <div className={`
                                                    border rounded-lg p-2 text-center min-h-[40px] text-xs font-medium flex items-center justify-center
                                                    ${isOff
                                                        ? 'bg-slate-50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800 text-slate-400'
                                                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                                                    }
                                                `}>
                                                    {isOff ? 'OFF' : dayShift}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Resume KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="size-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl">groups</span>
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{staff.length}</div>
                        <div className="text-sm text-slate-500 font-medium">Membres Actifs</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
