"use client"

import { Footer } from "@/components/devops-dashboards/layout/Footer"
import { Header } from "@/components/devops-dashboards/layout/Header"
import { useState } from "react"

interface ComplianceRule {
    id: string
    name: string
    status: 'passed' | 'failed' | 'warning'
    lastChecked: string
}

export default function CompliancePage() {
    const [rules] = useState<ComplianceRule[]>([
        { id: 'GDPR-01', name: 'Encryption at Rest', status: 'passed', lastChecked: '10 mins ago' },
        { id: 'GDPR-02', name: 'Right to Erasure (RTBF) Hook', status: 'warning', lastChecked: '1 hour ago' },
        { id: 'HIPAA-04', name: 'PHI Access Logging', status: 'passed', lastChecked: '30 mins ago' },
        { id: 'SOC2-09', name: 'Multi-factor Authentication', status: 'passed', lastChecked: 'Yesterday' },
        { id: 'PCI-DSS', name: 'Cardholder Data Isolation', status: 'failed', lastChecked: '5 mins ago' },
    ])

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="size-14 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
                            <span className="material-symbols-outlined text-amber-500 text-3xl">gavel</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                                DataMapper<span className="text-primary">Pro</span>
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                Compliance Governance & PII Discovery Engine
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-bold rounded-full border border-emerald-500/20 flex items-center gap-1">
                            <span className="size-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            SCANNER ACTIVE
                        </div>
                        <button className="px-4 py-2 rounded-lg bg-primary text-white font-bold hover:shadow-lg transition-all active:scale-95">
                            Start Full Audit
                        </button>
                    </div>
                </div>

                {/* Score Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="dashboard-card p-6 bg-emerald-500/5 border-emerald-500/20">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Global Health Score</p>
                        <div className="text-4xl font-black text-emerald-500">94/100</div>
                        <div className="mt-4 h-2 bg-emerald-500/20 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[94%]" />
                        </div>
                    </div>
                    <div className="dashboard-card p-6 bg-amber-500/5 border-amber-500/20">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Risk Exposure</p>
                        <div className="text-4xl font-black text-amber-500">Low</div>
                        <p className="text-xs text-slate-400 mt-4">2 minor warnings detected</p>
                    </div>
                    <div className="dashboard-card p-6 bg-red-500/5 border-red-500/20">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Critical Issues</p>
                        <div className="text-4xl font-black text-red-500">1</div>
                        <p className="text-xs text-slate-400 mt-4">Requires immediate attention</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Compliance Rules Table */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">verified_user</span>
                            Regulatory Frameworks
                        </h3>
                        <div className="dashboard-card overflow-hidden">
                            <table className="data-table">
                                <thead className="bg-slate-50 dark:bg-white/5">
                                    <tr>
                                        <th className="px-6 py-4">Control ID / Name</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Last Audit</th>
                                        <th className="px-6 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {rules.map((rule) => (
                                        <tr key={rule.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5">
                                            <td className="px-6 py-4 text-slate-300">
                                                <div className="font-bold text-slate-900 dark:text-white">{rule.name}</div>
                                                <div className="text-xs text-slate-500 font-mono tracking-wider">{rule.id}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`status-badge ${
                                                    rule.status === 'passed' ? 'status-success' :
                                                    rule.status === 'warning' ? 'status-warning' : 'status-error'
                                                }`}>
                                                    {rule.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 uppercase font-bold">
                                                {rule.lastChecked}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="text-primary hover:text-primary-dark font-bold text-xs uppercase underline">Details</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Quick Inventory / PII Table Mapping */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-purple-500">database</span>
                            Data Mapping
                        </h3>
                        <div className="dashboard-card p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">public.users</h4>
                                    <p className="text-[10px] text-slate-500 mb-4">PostgreSQL Table     Primary Identity Store</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between p-2 bg-white dark:bg-background-dark/30 rounded border border-slate-100 dark:border-white/5">
                                            <span className="text-xs text-slate-400">email_address</span>
                                            <span className="text-[9px] px-1.5 py-0.5 bg-red-500/10 text-red-500 rounded font-bold">PII LEVEL 3</span>
                                        </div>
                                        <div className="flex items-center justify-between p-2 bg-white dark:bg-background-dark/30 rounded border border-slate-100 dark:border-white/5">
                                            <span className="text-xs text-slate-400">last_login_ip</span>
                                            <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/10 text-amber-500 rounded font-bold">PII LEVEL 1</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">public.billing</h4>
                                    <p className="text-[10px] text-slate-500 mb-4">PostgreSQL Table     Financial Data</p>
                                    <div className="flex items-center justify-between p-2 bg-white dark:bg-background-dark/30 rounded border border-slate-100 dark:border-white/5">
                                        <span className="text-xs text-slate-400">card_token</span>
                                        <span className="text-[9px] px-1.5 py-0.5 bg-red-500/10 text-red-500 rounded font-bold">PCI SENSITIVE</span>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-sm">visibility</span>
                                View Data Graph
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
