"use client"

import DashboardTemplate from "@/components/devops-dashboards/shared/DashboardTemplate"
import { Badge } from "@/components/ui/badge"

export default function DatabasePage() {
    const kpis = [
        {
            title: "Health Score",
            value: "98.2%",
            change: "+1.4%",
            trend: "up" as const,
            icon: "verified",
            iconColor: "emerald"
        },
        {
            title: "Active Conns",
            value: "1,248",
            subtitle: "Max limit: 5,000",
            icon: "verified_user",
            iconColor: "emerald"
        },
        {
            title: "Active Threats",
            value: "0",
            change: "Last 24h",
            trend: "down" as const,
            icon: "gpp_maybe",
            iconColor: "emerald"
        },
        {
            title: "CPU Avg",
            value: "42%",
            change: "+5%",
            trend: "down" as const,
            icon: "speed",
            iconColor: "amber"
        },
        {
            title: "Database Size",
            value: "4.2 TB",
            change: "-12GB",
            trend: "up" as const,
            icon: "data_usage",
            iconColor: "primary"
        }
    ]

    return (
        <DashboardTemplate
            title="Database Hub"
            icon="database"
            kpis={kpis}
        >
            <div className="space-y-8 font-display">
                {/* Cluster Selection & Quick Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-white/5">
                    <div className="flex items-center gap-6">
                        <div className="size-16 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-xl shadow-primary/5">
                            <span className="material-symbols-outlined text-primary text-4xl font-black">dns</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">PostgreSQL Prod Cluster</h2>
                            <p className="text-slate-500 font-medium">cluster-pg-v2-41-stable     <span className="text-emerald-500">Normal Operation</span></p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-6 py-3 bg-slate-100 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                            Maintenance Mode
                        </button>
                        <button className="px-6 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                            New Instance
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Performance Metrics */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Replication Monitor */}
                        <div className="dashboard-card overflow-hidden transition-all duration-500 hover:border-primary/30">
                            <div className="p-8 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                                <div>
                                    <h3 className="font-black text-xl uppercase tracking-tight">Replication Sync</h3>
                                    <p className="text-sm text-slate-500 font-medium tracking-tight">Latency monitoring across multi-region nodes</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="size-2 rounded-full bg-emerald-500 animate-ping"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Live Feedback</span>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-white/5">
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Node Asset</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Current Status</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Deployment Role</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Latency (ms)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                        {[
                                            { name: "pg-prod-01", status: "HEALTHY", role: "Primary", lag: 0, color: "emerald" },
                                            { name: "pg-prod-02", status: "HEALTHY", role: "Replica", lag: 12, color: "emerald" },
                                            { name: "pg-prod-03", status: "WARNING", role: "Replica", lag: 450, color: "amber" },
                                            { name: "pg-prod-04", status: "CRITICAL", role: "Replica", lag: 5200, color: "rose" },
                                        ].map((node, _i) => (
                                            <tr key={node.name} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`size-10 rounded-xl bg-${node.color}-500/10 flex items-center justify-center border border-${node.color}-500/20`}>
                                                            <span className="material-symbols-outlined text-xl font-black">
                                                                {node.role === "Primary" ? "star" : "dns"}
                                                            </span>
                                                        </div>
                                                        <span className="font-black text-md tracking-tight uppercase">{node.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <Badge className={`${node.color === 'emerald' ? 'bg-emerald-500' : node.color === 'amber' ? 'bg-amber-500' : 'bg-rose-500'} text-[8px] font-black uppercase tracking-widest px-2 py-0.5`}>
                                                        {node.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-8 py-6 text-xs font-bold text-slate-500">
                                                    {node.role}
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="inline-flex items-center gap-3">
                                                        <span className={`text-xs font-black ${node.lag > 100 ? 'text-rose-500' : 'text-emerald-500'}`}>{node.lag}ms</span>
                                                        <div className="w-16 h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full ${node.color === 'rose' ? 'bg-rose-500' : 'bg-primary'} rounded-full`}
                                                                style={{ width: `${Math.min(node.lag / 20, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Query Performance Visualizer Placeholder */}
                        <div className="dashboard-card p-8 bg-slate-900 border-white/5 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
                               <span className="material-symbols-outlined text-9xl text-white">insights</span>
                           </div>
                           <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                               <div className="space-y-2">
                                   <div className="flex items-center gap-2 text-emerald-500 mb-2">
                                       <span className="material-symbols-outlined text-sm font-black">bolt</span>
                                       <span className="text-[10px] font-black uppercase tracking-widest">AI Optimizer Active</span>
                                   </div>
                                   <h3 className="text-2xl font-black text-white uppercase tracking-tight">Slow Query Analysis</h3>
                                   <p className="text-slate-400 font-medium max-w-md">3 queries are consuming 82% of I/O resources. Visualizing execution paths...</p>
                               </div>
                               <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl border border-white/10 transition-all backdrop-blur-md">
                                   Launch QueryViz
                               </button>
                           </div>
                        </div>
                    </div>

                    {/* Sidebar: Storage & Discovery */}
                    <div className="space-y-8">
                        <div className="dashboard-card p-8 space-y-8">
                            <div>
                                <h3 className="font-black text-xl uppercase tracking-tight">Storage Analysis</h3>
                                <p className="text-sm text-slate-500 font-medium">Automatic scale-up thresholds</p>
                            </div>

                            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-[32px] border border-slate-100 dark:border-white/5">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Utilization</span>
                                    <span className="text-xs font-black text-primary">84%</span>
                                </div>
                                <div className="h-4 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden p-1">
                                    <div className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-1000 flex items-center justify-end px-2" style={{ width: '84%' }}>
                                        <div className="size-1 bg-white rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                                <p className="mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                                    <span className="text-rose-500">Critical:</span> pg-prod-01 will reach capacity in 48h.
                                </p>
                            </div>

                            <div className="space-y-3 pt-4">
                                {[
                                    { name: "Schema Discovery", icon: "search_insights" },
                                    { name: "Index Optimization", icon: "speed" },
                                    { name: "Backup Verification", icon: "verified" },
                                    { name: "User Access Audit", icon: "admin_panel_settings" }
                                ].map((tool, i) => (
                                    <button key={i} className="w-full flex items-center justify-between p-4 bg-slate-100 dark:bg-white/5 rounded-2xl border border-transparent hover:border-primary/30 hover:bg-white/10 transition-all text-left group">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">{tool.icon}</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest">{tool.name}</span>
                                        </div>
                                        <span className="material-symbols-outlined text-sm text-slate-300 group-hover:text-primary transition-colors">chevron_right</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Recent Alerts Feed */}
                        <div className="dashboard-card p-6 bg-slate-950 border-white/5 font-mono text-[10px] leading-relaxed text-white/40 h-[240px] overflow-y-auto custom-scrollbar">
                           <div className="flex items-center gap-2 mb-4 text-primary">
                               <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                               <span className="font-bold uppercase tracking-widest">Log Stream</span>
                           </div>
                           <div className="space-y-2">
                               <div>[14:42:01] VACUUM ANALYZE completed on db_prod</div>
                               <div className="text-amber-500">[14:42:05] WARNING: Replica pg-prod-03 lag &gt; 400ms</div>
                               <div>[14:42:12] Auto-snapshot success: snap_20240222</div>
                               <div className="text-rose-500">[14:42:25] ALERT: Connection spike detected (245/s)</div>
                               <div>[14:43:01] Scale-up evaluation heartbeat sent.</div>
                           </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardTemplate>
    )
}
