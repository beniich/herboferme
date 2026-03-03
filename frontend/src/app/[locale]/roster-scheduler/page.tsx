'use client';

import React, { useState, useEffect } from "react";
import SidebarLeft from "@/components/roster-scheduler/ui/SidebarLeft";
import GanttChart from "@/components/roster-scheduler/ui/GanttChart";
import AssignmentModal from "@/components/roster-scheduler/ui/AssignmentModal";
import { useDbSocket } from '@/hooks/useDbSocket';

export default function RosterPage() {
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const socket = useDbSocket('/scheduler');

    useEffect(() => {
        if (!socket) return;

        socket.on('schedule-update', (data) => {
            console.log('     Schedule Refresh:', data);
            // Ici, on pourrait mettre    jour l'  tat global ou refetcher les donn  es
        });

        return () => {
            socket.off('schedule-update');
        };
    }, [socket]);

    return (
        <div className="flex h-full flex-col">
            {/* Header sp  cifique Roster */}
            <header className="bg-slate-900 border-b border-slate-800 h-16 flex items-center justify-between px-6 shrink-0 z-30">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-600 p-1.5 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <span className="material-symbols-outlined text-white">grid_view</span>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-white">
                        RosterFlow <span className="text-blue-500 font-medium text-sm align-top ml-1">Admin</span>
                    </h1>
                </div>

                <div className="flex-1 max-w-xl mx-8">
                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">search</span>
                        <input
                            className="w-full pl-10 pr-4 py-2 bg-slate-800 border-slate-700 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:bg-slate-700 rounded-lg transition-all text-sm outline-none border"
                            placeholder="Search shifts, personnel, or interventions..."
                            type="text"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end mr-2">
                        <span className="text-xs font-semibold text-blue-500">Live Sync</span>
                        <span className="text-[10px] text-slate-500 uppercase">Last update: Now</span>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">cloud_upload</span>
                        Publish Roster
                    </button>
                    <div className="h-8 w-px bg-slate-800 mx-2"></div>
                    <img
                        alt="Admin Profile"
                        className="h-9 w-9 rounded-full object-cover border-2 border-slate-700 shadow-sm"
                        src="https://i.pravatar.cc/150?u=admin"
                    />
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex overflow-hidden">
                <SidebarLeft onOpenAssignment={() => setShowAssignmentModal(true)} />

                <section className="flex-1 flex flex-col min-w-0 bg-slate-950">
                    {/* Toolbar */}
                    <div className="h-14 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 bg-slate-900 z-20">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center bg-slate-800 p-1 rounded-lg">
                                <button className="px-4 py-1.5 text-xs font-semibold rounded-md bg-slate-700 shadow-sm text-blue-400">Day</button>
                                <button className="px-4 py-1.5 text-xs font-semibold rounded-md text-slate-400 hover:text-slate-200 transition-colors">Week</button>
                                <button className="px-4 py-1.5 text-xs font-semibold rounded-md text-slate-400 hover:text-slate-200 transition-colors">Month</button>
                            </div>

                            <div className="flex items-center gap-2">
                                <button className="p-1 hover:bg-slate-800 rounded-full transition-colors">
                                    <span className="material-symbols-outlined text-xl text-slate-500">chevron_left</span>
                                </button>
                                <span className="text-sm font-bold text-slate-200">Today</span>
                                <button className="p-1 hover:bg-slate-800 rounded-full transition-colors">
                                    <span className="material-symbols-outlined text-xl text-slate-500">chevron_right</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-amber-900/20 border border-amber-800/50 px-3 py-1.5 rounded-lg">
                                <span className="material-symbols-outlined text-amber-500 text-sm">warning</span>
                                <span className="text-xs font-bold text-amber-400">Team 01 overbooked</span>
                            </div>
                            <div className="h-8 w-px bg-slate-800 mx-1"></div>
                            <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                                <span className="material-symbols-outlined text-xl">filter_list</span>
                            </button>
                            <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                                <span className="material-symbols-outlined text-xl">settings</span>
                            </button>
                        </div>
                    </div>

                    <GanttChart />

                    {/* Footer */}
                    <footer className="h-12 border-t border-slate-800 bg-slate-900 flex items-center justify-between px-6 shrink-0 z-30">
                        <div className="flex items-center gap-6">
                            {[
                                { color: 'bg-blue-500', label: 'Maintenance' },
                                { color: 'bg-emerald-500', label: 'Routine' },
                                { color: 'bg-red-500', label: 'Emergency' }
                            ].map((item) => (
                                <div key={item.label} className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-sm ${item.color}`}></div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{item.label}</span>
                                </div>
                            ))}
                        </div>
                        <div className="text-[10px] font-medium text-slate-500">
                            Showing <span className="text-slate-300">4 Teams</span>     <span className="text-blue-500 font-bold">Live Data</span>
                        </div>
                    </footer>
                </section>
            </main>

            {/* Scheduling Conflicts Alert - Fixed Position */}
            <div className="fixed bottom-16 right-6 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden transform transition-all ring-1 ring-white/5 animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-amber-600 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-white text-lg">error_outline</span>
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Scheduling Conflicts (2)</span>
                    </div>
                    <button className="text-white hover:bg-white/20 p-1 rounded-full">
                        <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                </div>
                <div className="p-4 space-y-3">
                    <div className="flex gap-3">
                        <div className="bg-amber-900/40 p-2 rounded-lg h-fit border border-amber-500/20">
                            <span className="material-symbols-outlined text-amber-500 text-sm">event_busy</span>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-slate-200">Personnel Double-Booking</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Alex Henderson is assigned to two concurrent shifts.</p>
                        </div>
                    </div>

                    <a
                        href="/roster-scheduler/conflicts"
                        className="block w-full text-center mt-2 py-2 text-[11px] font-bold text-blue-500 hover:bg-blue-500/10 rounded transition-colors uppercase tracking-wider border border-blue-500/30"
                    >
                        Auto-Resolve All
                    </a>
                </div>
            </div>
        </div>
    );
}
