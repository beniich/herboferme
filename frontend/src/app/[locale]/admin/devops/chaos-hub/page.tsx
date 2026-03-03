"use client"

import DashboardTemplate from "@/components/devops-dashboards/shared/DashboardTemplate"
import { useState } from "react"

export default function ChaosHubPage() {
    const [experiments] = useState([
        { id: 'EXP-411', name: 'Core API Blackout', type: 'Termination', status: 'Passed', impact: '2.4% Fail', date: '21 Feb 2026' },
        { id: 'EXP-412', name: 'Redis CPU Stress', type: 'Resources', status: 'Failed', impact: '8.1% Fail', date: '20 Feb 2026' },
        { id: 'EXP-413', name: 'DB Latency Injection', type: 'Network', status: 'Passed', impact: '1.2% Fail', date: '19 Feb 2026' },
    ])

    const kpis = [
        {
            title: 'System Resilience',
            value: '94.8%',
            change: '+1.2%',
            trend: 'up' as const,
            icon: 'health_and_safety',
            iconColor: 'emerald'
        },
        {
            title: 'Mean Time to Recovery',
            value: '4m 12s',
            change: '-18s',
            trend: 'up' as const,
            icon: 'restore',
            iconColor: 'primary'
        },
        {
            title: 'Avg Latency Impact',
            value: '112 ms',
            icon: 'bolt',
            iconColor: 'rose',
            subtitle: '+15ms simulation'
        },
        {
            title: 'Active Experiments',
            value: '1',
            icon: 'science',
            iconColor: 'amber'
        }
    ]

    return (
        <DashboardTemplate
            title="Chaos Hub"
            icon="psychology_alt"
            kpis={kpis}
        >
            <div className="space-y-8 font-display">
                {/* Active Experiment Banner */}
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <span className="material-symbols-outlined text-9xl text-rose-500">warning</span>
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="size-14 rounded-2xl bg-rose-500/20 flex items-center justify-center animate-pulse border border-rose-500/30">
                                <span className="material-symbols-outlined text-rose-500 text-3xl">dangerous</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-rose-500 uppercase tracking-tighter">Latency Injection Active</h2>
                                <p className="text-sm text-slate-500 font-bold">Target: <span className="text-slate-900 dark:text-white">DB-Cluster-PROD-04</span></p>
                            </div>
                        </div>
                        <div className="flex items-center gap-8">
                            <div className="text-right">
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Time Remaining</p>
                                <p className="text-2xl font-mono font-black text-primary">00:12:45</p>
                            </div>
                            <button className="px-8 py-3 bg-rose-600 text-white font-black rounded-xl shadow-xl shadow-rose-600/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs">
                                Abort Experiment
                            </button>
                        </div>
                    </div>
                    <div className="mt-6">
                        <div className="h-1 w-full bg-rose-500/10 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500 w-[65%] shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Impact Heatmap */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">grid_view</span>
                                Service Impact Heatmap
                            </h3>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-slate-500">
                                    <div className="size-1.5 rounded-full bg-emerald-500" /> Normal
                                </div>
                                <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-slate-500">
                                    <div className="size-1.5 rounded-full bg-amber-500" /> Stressed
                                </div>
                                <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-slate-500">
                                    <div className="size-1.5 rounded-full bg-rose-500" /> Critical
                                </div>
                            </div>
                        </div>
                        <div className="dashboard-card p-8 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 bg-slate-950/50">
                            {['SVC-A', 'SVC-B', 'KV-01', 'AUTH', 'DB-P', 'DB-S', 'API', 'WEB', 'EDGE', 'CDN', 'SQL', 'REDIS'].map((node, i) => (
                                <div key={node} className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 transition-all hover:scale-110 cursor-help ${
                                    node === 'DB-P' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                                    node === 'DB-S' ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 animate-pulse' :
                                    'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                                }`}>
                                    <span className="text-[10px] font-black uppercase">{node}</span>
                                    <div className={`size-1 rounded-full ${
                                        node === 'DB-P' ? 'bg-amber-500' : node === 'DB-S' ? 'bg-rose-500' : 'bg-emerald-500'
                                    }`} />
                                </div>
                            ))}
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="aspect-square rounded-xl border border-white/5 bg-white/5 opacity-20" />
                            ))}
                        </div>
                    </div>

                    {/* Chaos Log */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">terminal</span>
                            Infection Log
                        </h3>
                        <div className="dashboard-card h-[320px] bg-slate-950 p-6 font-mono text-[10px] leading-relaxed text-slate-400 overflow-y-auto border-white/5 relative">
                            <div className="absolute top-2 right-4 flex gap-1">
                                <div className="size-2 rounded-full bg-rose-500/50" />
                                <div className="size-2 rounded-full bg-amber-500/50" />
                                <div className="size-2 rounded-full bg-emerald-500/50" />
                            </div>
                            <p className="text-slate-600">-- BOOTING SIMULATION v2.4.1 --</p>
                            <p className="mt-2 text-emerald-500/70">[14:20:01] Target: node-cluster-primary</p>
                            <p className="text-emerald-500/70">[14:20:05] Resolution: Latency Injection (250ms)</p>
                            <p className="mt-2 text-primary font-bold">[14:20:10] Egress traffic poisoned successfully</p>
                            <p className="text-slate-500">[14:21:45] Monitoring health endpoints...</p>
                            <p className="mt-2 text-amber-500">[14:22:30] WARNING: p95 latency spike (542ms)</p>
                            <p className="text-amber-500">[14:22:45] WARNING: Replica node DB-S desyncing</p>
                            <p className="mt-2 text-rose-500 font-bold underline animate-pulse">[14:23:10] CRITICAL: DB-S failure simulated</p>
                            <p className="text-slate-500">[14:23:45] Auto-recovery policy initiated...</p>
                            <div className="mt-4 inline-block w-2 h-4 bg-primary animate-bounce" />
                        </div>
                    </div>
                </div>

                {/* History */}
                <div className="space-y-4">
                    <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">history</span>
                        Experiment History
                    </h3>
                    <div className="dashboard-card overflow-hidden">
                        <table className="data-table">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-white/5 text-[10px] uppercase font-black tracking-widest text-slate-500 border-b border-slate-100 dark:border-white/5">
                                    <th className="px-6 py-4 text-left">Experiment Name</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Impact</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Report</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {experiments.map((exp) => (
                                    <tr key={exp.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">{exp.name}</div>
                                            <div className="text-[10px] text-slate-500 font-mono italic">{exp.type}     {exp.id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`status-badge ${exp.status === 'Passed' ? 'status-success' : 'status-error'}`}>
                                                {exp.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                                            {exp.impact}
                                        </td>
                                        <td className="px-6 py-4 text-[10px] uppercase font-black text-slate-500">
                                            {exp.date}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="material-symbols-outlined text-primary hover:text-primary-dark transition-colors">description</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardTemplate>
    )
}
