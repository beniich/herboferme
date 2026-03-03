'use client';

import { StatusIndicator } from '@/components/shared/StatusIndicator';
import { Lock, RotateCw, Shield, Clock } from 'lucide-react';

export default function SecretsManagementPage() {
    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-black">db_prod_primary</h1>
                        <StatusIndicator status="healthy" label="ACTIVE" showPulse />
                    </div>
                    <p className="text-sm text-slate-500">
                        ARN: arn:aws:secretsmanager:us-east-1:123456789:secret:db_prod_primary
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold flex items-center gap-2">
                        <RotateCw className="w-4 h-4" /> Rotate Now
                    </button>
                    <button className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold">
                        Retrieve Secret
                    </button>
                </div>
            </div>

            {/* Rotation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="dashboard-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-bold flex items-center gap-2">
                            <RotateCw className="w-5 h-5 text-primary" />
                            Rotation Configuration
                        </h3>
                        <button className="text-primary text-xs font-bold hover:underline">Edit Policy</button>
                    </div>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-semibold">Frequency</p>
                                <p className="text-sm font-bold">Every 30 Days</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500 uppercase font-semibold">Next Rotation</p>
                                <p className="text-sm font-bold">Oct 24, 2023 (in 5 days)</p>
                            </div>
                        </div>
                        <div className="relative w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="absolute left-0 top-0 h-full bg-primary rounded-full" style={{ width: '82%' }}></div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-card p-6">
                    <h3 className="text-base font-bold mb-6 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        Health Overview
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <p className="text-xs text-slate-500 uppercase mb-1">Success Rate</p>
                            <p className="text-2xl font-black text-emerald-500">100%</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <p className="text-xs text-slate-500 uppercase mb-1">Avg Duration</p>
                            <p className="text-2xl font-black">1.4s</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Access Logs */}
            <div className="dashboard-card overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-border-dark flex items-center justify-between">
                    <h3 className="text-base font-bold">Recent Access Logs</h3>
                    <button className="text-primary text-xs font-bold">View All</button>
                </div>
                <table className="data-table">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-500 uppercase">
                            <th className="px-6 py-4">Timestamp</th>
                            <th className="px-6 py-4">Principal</th>
                            <th className="px-6 py-4">Action</th>
                            <th className="px-6 py-4">IP Address</th>
                            <th className="px-6 py-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                            <td className="px-6 py-4 font-medium text-slate-500">2023-10-19 14:22:05</td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    <span className="font-bold">order-processing-svc</span>
                                    <span className="text-xs text-slate-400">arn:aws:iam::123:role/order-svc</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="status-badge bg-primary/10 text-primary">GetSecret</span>
                            </td>
                            <td className="px-6 py-4 font-mono text-xs">192.168.1.104</td>
                            <td className="px-6 py-4 text-right">
                                <span className="text-emerald-500">   </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Compliance Score */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="dashboard-card p-6 text-center">
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Compliance Status</h3>
                    <div className="flex items-end gap-3 mb-6 justify-center">
                        <span className="text-5xl font-black">98%</span>
                        <span className="text-emerald-500 text-xs font-bold mb-2">+2%</span>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="text-emerald-500">   </span>
                            <p className="text-sm">AES-256 Encryption</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-emerald-500">   </span>
                            <p className="text-sm">Auto-rotation Enabled</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 dashboard-card p-6">
                    <h3 className="font-bold mb-4">Upcoming Schedule</h3>
                    <div className="space-y-6">
                        <div className="relative pl-6 before:absolute before:left-0 before:top-1.5 before:bottom-[-20px] before:w-[2px] before:bg-primary/20">
                            <div className="absolute left-[-4px] top-1.5 size-2 rounded-full bg-primary ring-4 ring-primary/20"></div>
                            <p className="text-xs font-bold">Next Auto-Rotation</p>
                            <p className="text-[10px] text-slate-500">Oct 24, 02:00 UTC</p>
                        </div>
                        <div className="relative pl-6">
                            <div className="absolute left-[-4px] top-1.5 size-2 rounded-full bg-slate-300"></div>
                            <p className="text-xs font-bold text-slate-500">Compliance Audit</p>
                            <p className="text-[10px] text-slate-400">Nov 01, 00:00 UTC</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
