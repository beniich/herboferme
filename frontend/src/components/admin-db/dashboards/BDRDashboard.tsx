import React, { useEffect, useState } from 'react';
import { dbAdminApi } from "@/services/dbAdminService";

interface Backup {
    id: string;
    timestamp: string;
    sizeGB: number;
    durationSec: number;
    status: string;
    error?: string;
}

interface Metrics {
    replicationLagMs: number;
    lastBackup: string;
    // ... autres champs
}

export default function BDRDashboard() {
    const [backups, setBackups] = useState<Backup[]>([]);
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [backupsRes, metricsRes] = await Promise.all([
                    dbAdminApi.getBackups(),
                    dbAdminApi.getMetrics()
                ]);
                setBackups(backupsRes.data);
                setMetrics(metricsRes.data);
            } catch (error) {
                console.error("Failed to load BDR data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Helper to format duration
    const formatDuration = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}m ${s}s`;
    };

    // Helper to format time ago
    const timeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        return `${diffHrs}h ago`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 overflow-y-auto">
            <main className="flex flex-col flex-1 px-4 md:px-10 py-8 max-w-[1400px] mx-auto w-full">
                {/* Page Hero */}
                <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">Backup & Disaster Recovery</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base max-w-xl">Configure S3 cloud targets, local snapshot retention, and automated recovery schedules with real-time RPO/RTO tracking.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center justify-center rounded-lg h-11 px-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
                            Export Config
                        </button>
                        <button className="flex items-center justify-center rounded-lg h-11 px-6 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                            Run Manual Backup Now
                        </button>
                    </div>
                </div>

                {/* KPI Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start">
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Current RPO</p>
                            <span className="material-symbols-outlined text-primary text-lg">timer</span>
                        </div>
                        <p className="text-slate-900 dark:text-white text-3xl font-bold leading-tight">{metrics?.lastBackup.includes('min') ? '14 mins' : 'Unknown'}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="material-symbols-outlined text-red-500 text-sm">trending_down</span>
                            <p className="text-red-500 text-xs font-bold">-2% from target</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start">
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Targeted RTO</p>
                            <span className="material-symbols-outlined text-primary text-lg">speed</span>
                        </div>
                        <p className="text-slate-900 dark:text-white text-3xl font-bold leading-tight">2 hours</p>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                            <p className="text-green-500 text-xs font-bold">Within threshold</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start">
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Last Drill</p>
                            <span className="material-symbols-outlined text-primary text-lg">history_edu</span>
                        </div>
                        <p className="text-slate-900 dark:text-white text-3xl font-bold leading-tight">Success</p>
                        <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">Today, 04:30 AM (UTC)</p>
                    </div>
                    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start">
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Infrastructure Health</p>
                            <span className="material-symbols-outlined text-green-500 text-lg">cloud_done</span>
                        </div>
                        <p className="text-slate-900 dark:text-white text-3xl font-bold leading-tight">Optimal</p>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2">
                            <div className="bg-primary h-1.5 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                </div>

                {/* Main Configuration Area */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Left: Settings Tabs */}
                    <div className="xl:col-span-2 flex flex-col gap-6">
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                            <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                                <button className="flex-1 py-4 px-6 text-sm font-bold text-primary border-b-2 border-primary bg-primary/5">
                                    S3 Cloud Storage
                                </button>
                                <button className="flex-1 py-4 px-6 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors border-b-2 border-transparent">
                                    Local Snapshots
                                </button>
                                <button className="flex-1 py-4 px-6 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors border-b-2 border-transparent">
                                    Retention Policies
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Bucket Name</label>
                                        <input className="w-full bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-primary focus:border-primary px-4 py-2.5 outline-none transition-all" type="text" defaultValue="prod-backup-us-east-1" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">AWS Region</label>
                                        <select className="w-full bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-primary focus:border-primary px-4 py-2.5 outline-none transition-all">
                                            <option>us-east-1 (N. Virginia)</option>
                                            <option>us-west-2 (Oregon)</option>
                                            <option>eu-central-1 (Frankfurt)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Access Key ID</label>
                                        <input className="w-full bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-primary focus:border-primary px-4 py-2.5 outline-none transition-all" type="password" defaultValue="AKIA****************" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Secret Access Key</label>
                                        <input className="w-full bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-primary focus:border-primary px-4 py-2.5 outline-none transition-all" type="password" defaultValue="                                                                        " />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 pt-2">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-lg text-sm font-medium transition-all">
                                        <span className="material-symbols-outlined text-sm">open_run</span>
                                        Test Connection
                                    </button>
                                    <span className="text-green-500 text-xs flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">verified</span>
                                        Validated on 2023-10-25 14:20
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Schedule Builder */}
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
                            <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">schedule</span>
                                Automated Backup Schedule
                            </h3>
                            <div className="space-y-6">
                                <div className="flex flex-wrap gap-3">
                                    <button className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-primary text-sm font-medium transition-all">Every Hour</button>
                                    <button className="px-4 py-2 rounded-full border border-primary bg-primary/10 text-primary text-sm font-bold transition-all">Every 6 Hours</button>
                                    <button className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-primary text-sm font-medium transition-all">Daily at Midnight</button>
                                    <button className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-primary text-sm font-medium transition-all">Custom Cron</button>
                                </div>
                                <div className="bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cron Expression</label>
                                        <span className="text-xs text-primary font-mono">0 */6 * * *</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-slate-500">info</span>
                                        <p className="text-sm text-slate-600 dark:text-slate-300">The backup engine will trigger a snapshot and S3 upload <span className="text-slate-900 dark:text-white font-bold">every 6 hours</span>, 7 days a week.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="size-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Next scheduled run: <span className="text-slate-900 dark:text-white">Today, 18:00:00 (UTC)</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: History & Logs */}
                    <div className="xl:col-span-1 flex flex-col gap-6">
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col h-full shadow-sm">
                            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                <h3 className="text-slate-900 dark:text-white text-lg font-bold">Recovery History</h3>
                                <button className="text-primary text-xs font-bold hover:underline">View All</button>
                            </div>
                            <div className="flex-1 overflow-y-auto max-h-[600px]">
                                {backups.map((backup) => (
                                    <div key={backup.id} className="p-4 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${backup.status === 'success'
                                                    ? 'bg-green-500/10 text-green-500'
                                                    : 'bg-red-500/10 text-red-500'
                                                }`}>
                                                {backup.status === 'success' ? 'Automated' : 'Failed'}
                                            </span>
                                            <span className="text-slate-500 text-[11px]">{timeAgo(backup.timestamp)}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`material-symbols-outlined ${backup.status === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                                                {backup.status === 'success' ? 'check_circle' : 'error'}
                                            </span>
                                            <div>
                                                <p className="text-sm text-slate-900 dark:text-white font-medium">Backup Job #{backup.id.substring(0, 8)}</p>
                                                {backup.status === 'success' ? (
                                                    <p className="text-xs text-slate-500">Duration: {formatDuration(backup.durationSec)} | Size: {backup.sizeGB} GB</p>
                                                ) : (
                                                    <p className="text-xs text-red-400">{backup.error || "Unknown Error"}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Static Drill Item (Mock) */}
                                <div className="p-4 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">Manual</span>
                                        <span className="text-slate-500 text-[11px]">8h ago</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-slate-400">check_circle</span>
                                        <div>
                                            <p className="text-sm text-slate-900 dark:text-white font-medium">Drill: Restore Test</p>
                                            <p className="text-xs text-slate-500">Duration: 12m 45s | RTO: 2.1h</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/80">
                                <button className="w-full py-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                                    Download System Audit Log
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Global Action Footer */}
                <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-6">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input defaultChecked type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            <span className="ml-3 text-sm font-medium text-slate-600 dark:text-slate-300">Critical Failure Alerts (Email)</span>
                        </label>
                        <div className="h-6 w-px bg-slate-200 dark:border-slate-700 hidden md:block"></div>
                        <p className="text-xs text-slate-500">Last settings update: Oct 24, 2023 11:15 AM</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="px-6 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-bold transition-all">Discard Changes</button>
                        <button className="px-8 py-2.5 bg-primary text-white text-sm font-bold rounded-lg shadow-lg hover:shadow-primary/30 transition-all">
                            Save Configuration
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
