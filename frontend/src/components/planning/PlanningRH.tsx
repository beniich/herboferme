'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { KanbanBoard } from './KanbanBoard';
import { Calendar, LayoutGrid, Loader2 } from 'lucide-react';

const InterventionCalendar = dynamic(
    () => import('./InterventionCalendar').then((mod) => mod.InterventionCalendar),
    { ssr: false }
);

export const PlanningRH: React.FC = () => {
    const [view, setView] = useState<'calendar' | 'kanban'>('calendar');
    const [interventions, setInterventions] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch events and teams in parallel
            const [eventsRes, teamsRes] = await Promise.all([
                fetch('/api/calendar/events', { headers }),
                fetch('/api/agro-teams', { headers })
            ]);

            const eventsData = await eventsRes.json();
            const teamsData = await teamsRes.json();

            // Format teams for the calendar
            const formattedTeams = (teamsData.teams || []).map((t: any) => ({
                id: t._id,
                name: t.name,
                color: t.type === 'cultures' ? '#10b981' : t.type === 'irrigation' ? '#3b82f6' : '#f59e0b'
            }));

            // Map AgriEvents to Intervention interface
            const formattedInterventions = (eventsData.events || []).map((e: any) => ({
                id: e._id,
                complaintId: '',
                title: e.title || 'Événement',
                description: e.culture?.variety || '',
                start: new Date(e.startDate || e.date),
                end: new Date(e.endDate || e.date),
                teamId: '', // Default or assigned team
                teamName: e.type,
                priority: 'medium', // Default priority
                status: e.status === 'planned' ? 'scheduled' : 
                        e.status === 'in_progress' ? 'in-progress' :
                        e.status === 'completed' ? 'completed' : 'cancelled',
                location: e.culture?.parcel || 'Non défini',
                assignedTechnicians: []
            }));

            setInterventions(formattedInterventions);
            setTeams(formattedTeams);
        } catch (error) {
            console.error('Erreur lors du chargement du planning:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex bg-slate-200/50 dark:bg-slate-900/50 p-1 rounded-lg">
                    <button
                        onClick={() => setView('calendar')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            view === 'calendar' 
                            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                        }`}
                    >
                        <Calendar className="w-4 h-4" />
                        Calendrier
                    </button>
                    <button
                        onClick={() => setView('kanban')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            view === 'kanban' 
                            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                        }`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        Kanban
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">
                {view === 'calendar' ? (
                    <div className="absolute inset-0 p-4 overflow-y-auto">
                        <InterventionCalendar 
                            interventions={interventions} 
                            teams={teams} 
                            editable={false}
                        />
                    </div>
                ) : (
                    <div className="absolute inset-0">
                        <KanbanBoard interventions={interventions} />
                    </div>
                )}
            </div>
        </div>
    );
};
