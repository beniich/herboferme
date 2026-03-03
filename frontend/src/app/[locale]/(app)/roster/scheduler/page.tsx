'use client';

import React, { useState, useEffect } from "react";
import SidebarLeft from "@/components/roster-scheduler/ui/SidebarLeft";
import GanttChart from "@/components/roster-scheduler/ui/GanttChart";
import { useDbSocket } from '@/hooks/useDbSocket';
import { LayoutDashboard, Users, Calendar, Filter, Send } from 'lucide-react';

export default function RosterSchedulerPage() {
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const socket = useDbSocket('/scheduler');

    useEffect(() => {
        if (!socket) return;

        socket.on('schedule-update', (data) => {
            console.log('     Schedule Refresh:', data);
        });

        return () => {
            socket.off('schedule-update');
        };
    }, [socket]);

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-950 overflow-hidden">
            {/* Context Header */}
            <div className="flex-none p-4 lg:p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10 transition-colors">
                <div>
                    <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">RosterFlow Scheduler</h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Gestion des rotations & shifts en temps r  el</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-amber-900/20 border border-amber-800/50 px-3 py-1.5 rounded-lg">
                        <span className="material-symbols-outlined text-amber-500 text-sm">warning</span>
                        <span className="text-xs font-bold text-amber-400">2 Conflits d  tect  s</span>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                        <Send className="w-3 h-3" />
                        Publier le Roster
                    </button>
                </div>
            </div>

            {/* Main Scheduler Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar for Personnel/Teams */}
                <div className="w-64 flex-none border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:block overflow-y-auto">
                    <SidebarLeft onOpenAssignment={() => setShowAssignmentModal(true)} />
                </div>

                {/* Gantt / Grid Section */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* View Controls */}
                    <div className="h-12 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 bg-slate-50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-4">
                            <div className="flex bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg">
                                <button className="px-3 py-1 text-[10px] font-bold rounded-md bg-white dark:bg-slate-700 shadow-sm text-primary">Jour</button>
                                <button className="px-3 py-1 text-[10px] font-bold rounded-md text-slate-500 hover:text-slate-700 dark:text-slate-400">Semaine</button>
                                <button className="px-3 py-1 text-[10px] font-bold rounded-md text-slate-500 hover:text-slate-700 dark:text-slate-400">Mois</button>
                            </div>
                            
                            <div className="flex items-center gap-1">
                                <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                                    <span className="material-symbols-outlined text-lg text-slate-500">chevron_left</span>
                                </button>
                                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Aujourd'hui</span>
                                <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                                    <span className="material-symbols-outlined text-lg text-slate-500">chevron_right</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                                <Filter className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Gantt Body */}
                    <div className="flex-1 relative overflow-auto bg-white dark:bg-slate-950">
                        <GanttChart />
                    </div>

                    {/* Scheduler Footer / Legend */}
                    <div className="h-10 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 shrink-0 z-30">
                        <div className="flex items-center gap-6">
                            {[
                                { color: 'bg-blue-500', label: 'Maintenance' },
                                { color: 'bg-emerald-500', label: 'Routine' },
                                { color: 'bg-red-500', label: 'Urgence' }
                            ].map((item) => (
                                <div key={item.label} className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                                </div>
                            ))}
                        </div>
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            <span className="text-primary">4   quipes</span> actives     <span className="text-emerald-500">Live Sync</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
