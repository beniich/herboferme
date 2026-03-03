'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { planningApi } from '@/lib/api';
import { Calendar as CalendarIcon, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { KanbanBoard } from '@/components/planning/KanbanBoard';
import { InterventionCalendar } from '@/components/planning/InterventionCalendar';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { toast } from 'react-hot-toast';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export default function PlanningPage() {
    const queryClient = useQueryClient();

    // Fetch Interventions via planningApi
    const { data: interventions, isLoading: loadingInterventions, error: errorInterventions } = useQuery({
        queryKey: ['interventions'],
        queryFn: async () => {
            const res = await planningApi.getInterventions();
            const data = Array.isArray(res) ? res : res.data || [];

            return data.map((inv: any) => ({
                ...inv,
                id: inv.id || inv._id,
                start: new Date(inv.start),
                end: new Date(inv.end),
                teamName: inv.teamId?.name || 'Inconnue',
                assignedTechnicians: inv.assignedTechnicians || []
            }));
        }
    });

    // On pourrait ajouter d'autres fetchs ici pour Teams si besoin

    // Mutations via planningApi
    const updateMutation = useMutation({
        mutationFn: async (updated: any) => {
            const { id, ...data } = updated;
            return planningApi.updateIntervention(id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['interventions'] });
            toast.success('Mise    jour r  ussie');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Erreur lors de la mise    jour');
        }
    });

    const createMutation = useMutation({
        mutationFn: async (newInv: any) => {
            return planningApi.createIntervention(newInv);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['interventions'] });
            toast.success('Intervention planifi  e');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Erreur lors de la planification');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return planningApi.deleteIntervention(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['interventions'] });
            toast.success('Intervention supprim  e');
        },
        onError: () => {
            toast.error('Erreur lors de la suppression');
        }
    });

    const [view, setView] = useState<'calendar' | 'kanban'>('kanban');

    if (loadingInterventions) {
        return (
            <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-background-light dark:bg-background-dark">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <section className="h-[calc(100vh-64px)] bg-background-light dark:bg-background-dark flex flex-col overflow-hidden transition-colors">
            <div className="flex flex-col bg-white dark:bg-[#1A2633] border-b border-slate-200 dark:border-slate-800 shrink-0 z-20">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Planning Op  rationnel</h1>
                    </div>
                    <div className="flex items-center gap-2">
                         <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mr-2">
                            <button
                                onClick={() => setView('kanban')}
                                className={cn(
                                    "px-3 py-1 rounded-md text-xs font-bold transition-all",
                                    view === 'kanban' ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                                )}
                            >
                                Kanban
                            </button>
                            <button
                                onClick={() => setView('calendar')}
                                className={cn(
                                    "px-3 py-1 rounded-md text-xs font-bold transition-all",
                                    view === 'calendar' ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                                )}
                            >
                                Calendrier
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                {view === 'calendar' ? (
                    <div className="h-full p-4 lg:p-6 overflow-y-auto">
                        <InterventionCalendar
                            interventions={interventions || []}
                            teams={[]} //    compl  ter si n  cessaire
                            onInterventionUpdate={async (updated: any) => { updateMutation.mutate(updated); }}
                            onInterventionCreate={async (created: any) => { createMutation.mutate(created); }}
                            onInterventionDelete={async (id: string) => { deleteMutation.mutate(id); }}
                            editable={true}
                        />
                    </div>
                ) : (
                    <KanbanBoard
                        interventions={interventions || []}
                        onInterventionClick={(item) => {
                            // Detail logic
                        }}
                    />
                )}
            </div>

            {/* Floating Action Button */}
            <button
                onClick={() => { /* Modal creation */ }}
                className="absolute bottom-24 right-4 h-14 w-14 rounded-full bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center active:scale-95 transition-transform z-30"
            >
                <span className="material-symbols-outlined text-[28px]">add</span>
            </button>
        </section>
    );
}
