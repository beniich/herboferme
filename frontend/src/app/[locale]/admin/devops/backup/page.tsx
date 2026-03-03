"use client"

import DashboardTemplate from "@/components/devops-dashboards/shared/DashboardTemplate"
import { useState } from "react"

export default function BackupHubPage() {
    const [backups] = useState([
        { id: 'BK-9921', name: 'db-production-main', size: '2.4 TB', type: 'Database', status: 'Success', date: '21 Feb 2026 04:00' },
        { id: 'BK-9922', name: 'user-files-bucket', size: '850 GB', type: 'S3 Sync', status: 'Success', date: '21 Feb 2026 02:30' },
        { id: 'BK-9923', name: 'api-logs-archive', size: '12.4 TB', type: 'Logs', status: 'Warning', date: '21 Feb 2026 01:15' },
        { id: 'BK-9924', name: 'config-repo-git', size: '150 MB', type: 'Git', status: 'Success', date: '20 Feb 2026 23:50' },
    ])

    const kpis = [
        {
            title: 'Total Storage',
            value: '842.6 TB',
            change: '+4.2%',
            trend: 'up' as const,
            icon: 'hard_drive',
            iconColor: 'primary'
        },
        {
            title: 'Monthly Cost',
            value: '$12,450',
            change: '-1.5%',
            trend: 'down' as const,
            icon: 'payments',
            iconColor: 'emerald'
        },
        {
            title: 'Projected Savings',
            value: '$2,100',
            icon: 'trending_down',
            iconColor: 'amber',
            subtitle: 'Tier optimization'
        },
        {
            title: 'Success Rate',
            value: '99.8%',
            icon: 'verified',
            iconColor: 'emerald'
        }
    ]

    return (
        <DashboardTemplate
            title="Backup Hub"
            icon="backup"
            kpis={kpis}
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Backup List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">history</span>
                            Recent Backups
                        </h3>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
                                Day
                            </button>
                            <button className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-lg text-[10px] font-black uppercase tracking-widest text-primary">
                                Week
                            </button>
                        </div>
                    </div>

                    <div className="dashboard-card overflow-hidden">
                        <table className="data-table">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-white/5 text-[10px] uppercase font-black tracking-widest text-slate-500 border-b border-slate-100 dark:border-white/5">
                                    <th className="px-6 py-4">Job Info</th>
                                    <th className="px-6 py-4">Size / Type</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {backups.map((bk) => (
                                    <tr key={bk.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 group transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900 dark:text-white">{bk.name}</div>
                                            <div className="text-[10px] text-slate-500 font-mono tracking-wider">{bk.id}     {bk.date}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{bk.size}</div>
                                            <div className="text-[10px] text-slate-500 uppercase font-bold">{bk.type}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`status-badge ${bk.status === 'Success' ? 'status-success' : 'status-warning'}`}>
                                                {bk.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10 rounded-lg text-primary">
                                                <span className="material-symbols-outlined text-sm">settings_backup_restore</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* AI Insights & Storage Tiering */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500">psychology</span>
                        AI Insights
                    </h3>

                    <div className="dashboard-card p-6 border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-amber-500">trending_down</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">Tier Optimization</h4>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Cost Reduction</p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Detected <span className="text-amber-500 font-bold">5.2 TB</span> of older logs in <span className="text-slate-900 dark:text-white font-bold">Hot Storage</span> that haven't been accessed in 30 days.
                        </p>
                        <div className="mt-4 p-4 bg-white dark:bg-slate-900/50 rounded-xl border border-amber-500/10">
                            <div className="flex justify-between items-center text-xs mb-2">
                                <span className="font-bold text-slate-500 uppercase">Potential Savings</span>
                                <span className="text-emerald-500 font-black">$185 / mo</span>
                            </div>
                            <button className="w-full py-2 bg-amber-500 text-white text-xs font-black uppercase tracking-widest rounded-lg shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all">
                                Migrate to Glacier
                            </button>
                        </div>
                    </div>

                    <div className="dashboard-card p-6">
                        <h4 className="font-bold text-sm mb-4">Multi-Cloud Target Health</h4>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                                    <span>AWS S3 (Standard)</span>
                                    <span className="text-emerald-500">Healthy</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[92%]" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                                    <span>Google Cloud Storage</span>
                                    <span className="text-emerald-500">Healthy</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[78%]" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                                    <span>Azure Blob</span>
                                    <span className="text-amber-500">Latency Warning</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500 w-[45%]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardTemplate>
    )
}
