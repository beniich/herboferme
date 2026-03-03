'use client';

import React from 'react';
import {
    ShieldAlert,
    Search,
    Eye,
    EyeOff,
    FileText,
    Lock,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Fingerprint,
    Database,
    Globe,
    MoreVertical,
    Filter
} from 'lucide-react';

export default function PiiGovernanceDashboard() {
    return (
        <div className="flex h-full min-h-screen flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">

            {/* Header */}
            <header className="px-6 py-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="size-10 bg-indigo-600/10 text-indigo-600 rounded-xl flex items-center justify-center">
                        <Fingerprint className="size-6" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold">PII Governance</h1>
                        <p className="text-xs text-slate-500">Data Discovery & Protection</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-lg text-sm font-medium border border-rose-100 dark:border-rose-900/30">
                        <AlertTriangle className="size-4" />
                        <span>3 Critical Risks Found</span>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm shadow-indigo-200 dark:shadow-none">
                        <RefreshCw className="size-4" /> Start Scan
                    </button>
                </div>
            </header>

            <main className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <p className="text-slate-500 text-sm font-medium mb-1">Total PII Fields Discovered</p>
                            <h2 className="text-4xl font-black text-slate-900 dark:text-white">1,248</h2>
                            <div className="flex items-center gap-2 mt-4 text-xs font-medium text-slate-500">
                                <span className="flex items-center gap-1 text-emerald-500"><CheckCircle2 className="size-3" /> 98% Masked</span>
                                <span>   </span>
                                <span>Last scan: 2h ago</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 dark:bg-rose-900/20 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <p className="text-slate-500 text-sm font-medium mb-1">Unencrypted Exposure</p>
                            <h2 className="text-4xl font-black text-rose-600 dark:text-rose-500">24</h2>
                            <div className="flex items-center gap-2 mt-4 text-xs font-medium text-slate-500">
                                <span className="flex items-center gap-1 text-rose-500"><AlertTriangle className="size-3" /> Action Required</span>
                                <span>   </span>
                                <span>logs_archive_v1</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <p className="text-slate-500 text-sm font-medium mb-1">Compliance Score</p>
                            <h2 className="text-4xl font-black text-slate-900 dark:text-white">92<span className="text-lg text-slate-400 font-normal">/100</span></h2>
                            <div className="flex items-center gap-2 mt-4 text-xs font-medium text-slate-500">
                                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded">GDPR Ready</span>
                                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded">SOC2 Type II</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Discovery Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h3 className="font-bold text-lg">Sensitive Data Inventory</h3>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="relative flex-1 sm:flex-initial">
                                <Search className="absolute left-2.5 top-2.5 size-4 text-slate-400" />
                                <input type="text" placeholder="Search tables or columns..." className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm w-full sm:w-64 focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400" />
                            </div>
                            <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500">
                                <Filter className="size-4" />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Data Source</th>
                                    <th className="px-6 py-4">Field / Column</th>
                                    <th className="px-6 py-4">Sensitivity Type</th>
                                    <th className="px-6 py-4">Protection Status</th>
                                    <th className="px-6 py-4">Locations</th>
                                    <th className="px-6 py-4 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">

                                {/* Row 1 */}
                                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                                                <Database className="size-4" />
                                            </div>
                                            <span className="font-bold text-slate-700 dark:text-slate-200">users_db</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">social_security_num</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-200 dark:border-rose-900/50">
                                            SPI / High
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                                            <Lock className="size-3.5" />
                                            <span>Encrypted at rest</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">us-east-1</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-slate-400 hover:text-indigo-600"><MoreVertical className="size-4" /></button>
                                    </td>
                                </tr>

                                {/* Row 2 */}
                                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center">
                                                <FileText className="size-4" />
                                            </div>
                                            <span className="font-bold text-slate-700 dark:text-slate-200">app_logs_s3</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">payload.email</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-900/50">
                                            PII / Medium
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium italic">
                                            <Eye className="size-3.5" />
                                            <span>Plain text (Warning)</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">global</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-slate-400 hover:text-indigo-600"><MoreVertical className="size-4" /></button>
                                    </td>
                                </tr>

                                {/* Row 3 */}
                                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                                                <Database className="size-4" />
                                            </div>
                                            <span className="font-bold text-slate-700 dark:text-slate-200">payments_db</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">credit_card_hash</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-200 dark:border-rose-900/50">
                                            PCI / Critical
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                                            <EyeOff className="size-3.5" />
                                            <span>Tokenized</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">eu-central-1</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-slate-400 hover:text-indigo-600"><MoreVertical className="size-4" /></button>
                                    </td>
                                </tr>

                            </tbody>
                        </table>
                    </div>

                    <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-center">
                        <button className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">View All Discovered items</button>
                    </div>
                </div>

            </main>
        </div>
    );
}
