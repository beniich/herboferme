"use client"

import DashboardTemplate from "@/components/devops-dashboards/shared/DashboardTemplate"

export default function InfrastructureDriftPage() {
    const kpis = [
        {
            title: 'In Sync Resources',
            value: '1,240',
            change: '+2%',
            trend: 'up' as const,
            icon: 'check_circle',
            iconColor: 'emerald'
        },
        {
            title: 'Detected Drifts',
            value: '12',
            change: '-5%',
            trend: 'down' as const,
            icon: 'warning',
            iconColor: 'rose',
            subtitle: 'Critical'
        },
        {
            title: 'Pending Changes',
            value: '4',
            icon: 'settings_backup_restore',
            iconColor: 'primary'
        },
        {
            title: 'Last Scan',
            value: '15m ago',
            icon: 'history',
            iconColor: 'slate'
        }
    ]

    return (
        <DashboardTemplate
            title="Infrastructure Drift"
            icon="conversion_path"
            kpis={kpis}
        >
            <div className="space-y-8">
                {/* Resource Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-rose-500/5 border border-rose-500/20 rounded-2xl">
                    <div className="flex items-start gap-4">
                        <div className="size-12 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-rose-500">warning</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">
                                Drift Detected: <span className="font-mono text-primary">aws_s3_bucket.data_storage_prod</span>
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Detected in <span className="font-bold">us-east-1</span> via manual console change.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-white/5 font-bold text-xs uppercase tracking-wider">
                            Ignore Drift
                        </button>
                        <button className="px-6 py-2 rounded-lg bg-primary text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                            Run Terraform Plan
                        </button>
                    </div>
                </div>

                {/* Code Comparison - "RosterFlow" Inspired with clean contrast */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 font-display">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                Desired State (IaC)
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">main.tf:142</span>
                        </div>
                        <div className="dashboard-card overflow-hidden border-emerald-500/20">
                            <div className="bg-slate-900 p-6 font-mono text-sm leading-relaxed text-slate-300">
                                <div className="text-slate-500">resource "aws_s3_bucket" "data_storage" &#123;</div>
                                <div className="pl-4">bucket = "data-storage-prod-xyz"</div>
                                <div className="pl-4">acl    = "private"</div>
                                <div className="pl-4 bg-emerald-500/10 text-emerald-400 -mx-6 px-6 border-l-2 border-emerald-500">
                                    <span className="opacity-50 pr-2">+</span>tags = &#123;
                                </div>
                                <div className="pl-8 bg-emerald-500/10 text-emerald-400 -mx-6 px-6 border-l-2 border-emerald-500">
                                    <span className="opacity-50 pr-2">+</span>Environment = "Production"
                                </div>
                                <div className="pl-4 bg-emerald-500/10 text-emerald-400 -mx-6 px-6 border-l-2 border-emerald-500">
                                    <span className="opacity-50 pr-2">+</span>&#125;
                                </div>
                                <div className="text-slate-500">&#125;</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest border border-rose-500/20">
                                Actual State (Live)
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">Cloud Console Edit</span>
                        </div>
                        <div className="dashboard-card overflow-hidden border-rose-500/20">
                            <div className="bg-slate-900 p-6 font-mono text-sm leading-relaxed text-slate-300">
                                <div className="text-slate-500">aws_s3_bucket.data_storage (ID: data-prod)</div>
                                <div className="pl-4">bucket = "data-storage-prod-xyz"</div>
                                <div className="pl-4">acl    = "private"</div>
                                <div className="pl-4 bg-rose-500/10 text-rose-400 -mx-6 px-6 border-l-2 border-rose-500">
                                    <span className="opacity-50 pr-2">-</span>tags = &#123;
                                </div>
                                <div className="pl-8 bg-rose-500/10 text-rose-400 -mx-6 px-6 border-l-2 border-rose-500">
                                    <span className="opacity-50 pr-2">-</span>Environment = "Dev"
                                </div>
                                <div className="pl-4 bg-rose-500/10 text-rose-400 -mx-6 px-6 border-l-2 border-rose-500">
                                    <span className="opacity-50 pr-2">-</span>&#125;
                                </div>
                                <div className="text-slate-500">&#125;</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Impact Analysis */}
                <div className="dashboard-card p-8 bg-gradient-to-br from-slate-900 to-slate-950 border-white/5 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                       <span className="material-symbols-outlined text-9xl">analytics</span>
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="size-32 rounded-full border-4 border-rose-500/20 flex items-center justify-center p-4">
                            <div className="text-center">
                                <p className="text-3xl font-black text-rose-500">High</p>
                                <p className="text-[10px] uppercase font-bold text-slate-500">Impact</p>
                            </div>
                        </div>
                        <div className="flex-1 space-y-4">
                            <h3 className="text-xl font-bold uppercase tracking-tight">Drift Remediation Plan</h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                    <span className="material-symbols-outlined text-emerald-500">add</span>
                                    <p className="text-xs">Add <span className="font-bold font-mono">tags.ManagedBy</span> (Expected "Terraform")</p>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                    <span className="material-symbols-outlined text-amber-500">swap_horiz</span>
                                    <p className="text-xs">Update <span className="font-bold font-mono">tags.Environment</span> ("Dev"     "Production")</p>
                                </div>
                            </div>
                        </div>
                        <button className="px-8 py-4 bg-primary text-white font-black rounded-2xl shadow-2xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all uppercase tracking-widest text-sm">
                            Apply Remediation
                        </button>
                    </div>
                </div>
            </div>
        </DashboardTemplate>
    )
}
