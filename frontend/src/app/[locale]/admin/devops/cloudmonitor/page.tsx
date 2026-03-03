"use client"

import DashboardTemplate from "@/components/devops-dashboards/shared/DashboardTemplate"
import { Badge } from "@/components/ui/badge"

export default function CloudMonitorPage() {
    const kpis = [
        {
            title: "Global Health",
            value: "98.2%",
            change: "Optimal",
            trend: "up" as const,
            icon: "cloud_done",
            iconColor: "emerald"
        },
        {
            title: "Multi-Cloud Nodes",
            value: "156",
            subtitle: "AWS, Azure, GCP",
            icon: "hub",
            iconColor: "primary"
        },
        {
            title: "Avg Latency",
            value: "24ms",
            change: "-4ms",
            trend: "up" as const,
            icon: "speed",
            iconColor: "primary"
        },
        {
            title: "Cloud Spend",
            value: "$4.2k",
            change: "+12%",
            trend: "down" as const,
            icon: "payments",
            iconColor: "amber"
        }
    ]

    return (
        <DashboardTemplate
            title="Cloud Monitor"
            icon="cloud_sync"
            kpis={kpis}
        >
            <div className="space-y-8 font-display">
                {/* Infrastructure Globe Map Placeholder */}
                <div className="dashboard-card p-12 bg-slate-950 border-white/5 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px] group transition-all duration-700 hover:border-primary/40">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50"></div>

                    {/* Pulsing Central Globe Icon */}
                    <div className="relative size-64 flex items-center justify-center">
                        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20 scale-150"></div>
                        <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse opacity-30 scale-110"></div>
                        <span className="material-symbols-outlined text-[120px] text-white opacity-80 z-10 group-hover:scale-110 transition-transform duration-1000">public</span>

                        {/* Orbiting Points */}
                        {[0, 72, 144, 216, 288].map((degree, i) => (
                            <div
                                key={i}
                                className="absolute transition-all duration-1000 group-hover:scale-125"
                                style={{
                                    transform: `rotate(${degree}deg) translateY(-140px)`,
                                    opacity: 0.6
                                }}
                            >
                                <div className={`size-3 rounded-full ${i % 2 === 0 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]' : 'bg-primary shadow-[0_0_15px_rgba(59,130,246,0.8)]'}`}></div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 text-center relative z-20">
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Global Infrastructure Mesh</h2>
                        <p className="text-slate-500 font-medium tracking-wide">Real-time interconnection between 12 global regions</p>
                    </div>

                    {/* Floating Indicators */}
                    <div className="absolute bottom-8 left-8 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                            <div>
                                <p className="text-[10px] font-black uppercase text-white">US-EAST-1</p>
                                <p className="text-[8px] font-bold text-slate-500">12ms     Operational</p>
                            </div>
                        </div>
                    </div>

                    <div className="absolute top-8 right-8 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-amber-500">warning</span>
                            <div>
                                <p className="text-[10px] font-black uppercase text-white">EU-WEST-3</p>
                                <p className="text-[8px] font-bold text-slate-500">45ms     High Load</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Resources Breakdown */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="dashboard-card overflow-hidden">
                            <div className="p-8 border-b border-slate-200 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 dark:bg-white/5">
                                <div>
                                    <h3 className="font-black text-xl uppercase tracking-tight">Active Cloud Instances</h3>
                                    <p className="text-sm text-slate-500 font-medium">Virtual machine fleet across providers</p>
                                </div>
                                <div className="flex gap-2">
                                    <Badge className="bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 text-[8px] font-black uppercase">AWS: 82</Badge>
                                    <Badge className="bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 text-[8px] font-black uppercase">GCP: 44</Badge>
                                    <Badge className="bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 text-[8px] font-black uppercase">Azure: 30</Badge>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-white/10">
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Provider & ID</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Specifications</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Regional Health</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Cost/mo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                        {[
                                            { id: "i-0a2b3c4d", provider: "AWS", type: "t3.xlarge", region: "us-east-1", health: 99, cost: 240 },
                                            { id: "gcp-prod-main", provider: "GCP", type: "n2-standard-4", region: "europe-west1", health: 97, cost: 310 },
                                            { id: "az-db-01", provider: "Azure", type: "D4s v3", region: "west-us", health: 84, cost: 195 },
                                            { id: "i-9e8f7g6h", provider: "AWS", type: "c5.2xlarge", region: "ap-south-1", health: 100, cost: 450 },
                                        ].map((instance, _i) => (
                                            <tr key={_i} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="size-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10 group-hover:border-primary/50 transition-all">
                                                            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">
                                                                {instance.provider === 'AWS' ? 'cloud' : instance.provider === 'GCP' ? 'filter_drama' : 'auto_awesome_motion'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-[10px] uppercase tracking-widest">{instance.id}</p>
                                                            <p className="text-[10px] text-slate-500 font-bold">{instance.provider}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="text-xs font-black text-slate-600 dark:text-slate-300">{instance.type}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase font-medium">{instance.region}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full ${instance.health > 90 ? 'bg-emerald-500' : 'bg-amber-500'} rounded-full transition-all duration-1000`}
                                                                style={{ width: `${instance.health}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-[10px] font-black text-slate-500">{instance.health}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right font-black text-sm text-primary">
                                                    ${instance.cost}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Cost Optimization & Tools */}
                    <div className="space-y-8">
                        <div className="dashboard-card p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-black text-xl uppercase tracking-tight">FinOps Insights</h3>
                                <span className="material-symbols-outlined text-emerald-500">savings</span>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="material-symbols-outlined text-emerald-500 text-sm">trending_down</span>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Savings Opportunity</p>
                                    </div>
                                    <p className="text-xs font-medium text-slate-400 px-1">Terminate 12 idle instances in <span className="text-white font-bold">us-east-1</span> to save <span className="text-emerald-500 font-black">$450/mo</span>.</p>
                                </div>

                                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="material-symbols-outlined text-amber-500 text-sm">rocket_launch</span>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Reservation Warning</p>
                                    </div>
                                    <p className="text-xs font-medium text-slate-400 px-1">Reserved instance coverage dropped below <span className="text-white font-bold">80%</span>. Review GCP capacity.</p>
                                </div>
                            </div>

                            <div className="pt-4 space-y-3">
                                {[
                                    { name: "Resource Drift", icon: "sync_problem" },
                                    { name: "Tag Enforcement", icon: "label" },
                                    { name: "Budget Alerts", icon: "notifications_active" },
                                    { name: "Multi-Cloud IAM", icon: "account_tree" }
                                ].map((tool, i) => (
                                    <button key={i} className="w-full h-14 flex items-center justify-between px-6 bg-slate-100 dark:bg-white/5 rounded-2xl border border-transparent hover:border-primary/50 hover:bg-white/10 transition-all text-left group">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">{tool.icon}</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest">{tool.name}</span>
                                        </div>
                                        <span className="material-symbols-outlined text-sm text-slate-300 group-hover:translate-x-1 transition-all">arrow_forward</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardTemplate>
    )
}
