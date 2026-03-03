'use client';

import { Suspense } from "react";
import StatsCard from "@/components/audit/StatsCard";
import FilterBar from "@/components/audit/FilterBar";
import LogTable from "@/components/audit/LogTable";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function AuditLogsPage() {
    return (
        <div className="flex flex-col flex-1 w-full px-6 py-8">
            <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-primary/10 text-primary uppercase tracking-widest border border-primary/20">
                            Live Monitoring
                        </span>
                        <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    </div>
                    <h1 className="text-slate-900 dark:text-white text-4xl md:text-5xl font-black tracking-tight italic">
                        AUDIT LOGS & ACTIVITY
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl font-medium leading-relaxed">
                        Real-time synchronization of system interventions and secure activity trails.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-3 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-750 transition-all shadow-sm">
                        <span className="material-symbols-outlined text-lg">sync</span>
                        <span>Force Refresh</span>
                    </button>

                    <button className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-black text-white shadow-xl shadow-primary/30 hover:bg-blue-700 transition-all active:scale-95">
                        <span className="material-symbols-outlined text-lg">download</span>
                        <span>Export Archives</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatsCard
                    icon={<span className="material-symbols-outlined">list_alt</span>}
                    title="Total Logs Today"
                    value="1,284"
                    change={{ direction: "up", percent: 12, color: "emerald" }}
                />
                <StatsCard
                    icon={<span className="material-symbols-outlined">priority_high</span>}
                    title="Critical Alerts"
                    value="12"
                    change={{ direction: "up", percent: 5, color: "red" }}
                />
                <StatsCard
                    icon={<span className="material-symbols-outlined">person_check</span>}
                    title="Active Operators"
                    value="45"
                    change={{ direction: "flat", percent: 0, color: "gray" }}
                />
            </div>

            <FilterBar />

            <Suspense fallback={<LoadingSpinner />}>
                <LogTable />
            </Suspense>

            <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 italic uppercase tracking-wider">
                            <span className="material-symbols-outlined text-primary text-2xl">data_exploration</span>
                            Action Metrics (24h)
                        </h3>
                        <span className="text-xs font-bold text-slate-400">SAMPLE DATA</span>
                    </div>
                    <div className="h-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-end justify-between px-8 pb-8 pt-12 shadow-inner-white overflow-hidden relative">
                        <div className="absolute top-4 left-4 text-[10px] font-black text-slate-300">INCIDENT RATIO</div>
                        {[0.25, 0.5, 0.33, 1, 0.75, 0.4, 0.5, 0.8, 0.2].map((h, i) => (
                            <div
                                key={i}
                                className="w-10 rounded-t-lg transition-all hover:scale-x-110 cursor-pointer relative group"
                                style={{
                                    height: `${h * 100}%`,
                                    backgroundColor: i === 3 ? "rgba(36,36,235,0.9)" : `rgba(36,36,235,${h * 0.4 + 0.1})`,
                                }}
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {Math.round(h * 100)}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 italic uppercase tracking-wider">
                        <span className="material-symbols-outlined text-emerald-500 text-2xl">verified_user</span>
                        Security Insights
                    </h3>
                    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 flex flex-col gap-6 shadow-sm border-t-4 border-t-emerald-500">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Average Session Time</span>
                            <span className="font-black text-slate-900 dark:text-white text-lg tracking-tight">42m 15s</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner">
                            <div className="bg-primary h-full w-[65%] transition-all duration-1000"></div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">System Vulnerabilities</span>
                            <span className="font-black text-emerald-500 text-lg tracking-tight italic uppercase">Secure</span>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800 leading-relaxed shadow-sm">
                            <span className="material-symbols-outlined text-xl scale-125">check_circle</span>
                            <p>All core systems operating at 100% capacity. Audit integrity verified against blockchain-ready timestamps.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
