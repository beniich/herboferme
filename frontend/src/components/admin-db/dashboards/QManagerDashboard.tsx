import React, { useEffect, useState } from 'react';
import { dbAdminApi } from "@/services/dbAdminService";

interface Queue {
    id: string;
    name: string;
    active: number;
    delayed: number;
    failed: number;
    status: string;
    processingRate: number;
}

interface QManagerData {
    queues: Queue[];
    cacheHitRate: string;
    redisMemory: string;
}

export default function QManagerDashboard() {
    const [data, setData] = useState<QManagerData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await dbAdminApi.getQManagerData();
                setData(res.data);
            } catch (error) {
                console.error("Failed to load QManager data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
        const interval = setInterval(loadData, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const { queues, cacheHitRate, redisMemory } = data || { queues: [], cacheHitRate: "0", redisMemory: "0/0" };

    const totalThroughput = queues.reduce((sum, q) => sum + (q.processingRate || 0), 0);
    const totalFailed = queues.reduce((sum, q) => sum + q.failed, 0);

    return (
        <div className="flex flex-col h-full w-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-sans overflow-hidden">
            <style jsx>{`
                .sidebar-item-active {
                    background-color: rgba(19, 91, 236, 0.15);
                    border-left: 3px solid #135bec;
                }
            `}</style>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Navigation */}
                <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-20 shadow-md">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                            <span className="material-symbols-outlined text-[20px]">layers</span>
                        </div>
                        <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Q-Manager</h1>
                    </div>
                    <nav className="flex-1 overflow-y-auto py-4">
                        <div className="px-4 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Operational Views</div>
                        <ul className="space-y-1">
                            <li>
                                <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors sidebar-item-active">
                                    <span className="material-symbols-outlined text-primary text-[20px]">dashboard</span>
                                    Overview
                                </a>
                            </li>
                            <li>
                                <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-l-[3px] border-transparent">
                                    <span className="material-symbols-outlined text-slate-400 text-[20px]">memory</span>
                                    Redis Clusters
                                </a>
                            </li>
                            <li>
                                <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-l-[3px] border-transparent">
                                    <span className="material-symbols-outlined text-slate-400 text-[20px]">queue</span>
                                    Active Queues
                                    <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{queues.filter(q => q.active > 1000).length}</span>
                                </a>
                            </li>
                        </ul>
                    </nav>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">System Healthy</span>
                        </div>
                        <p className="text-[10px] text-slate-500">Uptime: 14d 2h 12m</p>
                        <p className="text-[10px] text-slate-500">Version: v4.2.0-ent</p>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-[#0b0c10]">
                    {/* Header Toolbar */}
                    <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h2>
                            <div className="h-6 w-px bg-slate-200 dark:border-slate-700"></div>
                            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                                <button className="px-3 py-1 text-xs font-bold text-primary bg-white dark:bg-slate-700 shadow-sm rounded-md transition-all">Real-time</button>
                                <button className="px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">1h</button>
                                <button className="px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">24h</button>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                                <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
                                Purge All Caches
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                New Queue
                            </button>
                        </div>
                    </header>

                    <div className="p-8 max-w-7xl mx-auto space-y-8">
                        {/* KPI Scorecards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden group">
                                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <span className="material-symbols-outlined text-[64px] text-primary">memory</span>
                                </div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Cache Hit Rate</p>
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white">{cacheHitRate}%</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs font-bold text-green-500 flex items-center">
                                        <span className="material-symbols-outlined text-[14px]">arrow_upward</span> 0.2%
                                    </span>
                                    <span className="text-xs text-slate-400">vs last hour</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-700 h-1 mt-4 rounded-full overflow-hidden">
                                    <div className="bg-primary h-full rounded-full" style={{ width: `${cacheHitRate}%` }}></div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden group">
                                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <span className="material-symbols-outlined text-[64px] text-purple-500">speed</span>
                                </div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Processing Rate</p>
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white">{totalThroughput}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs text-slate-400">jobs per second</span>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden group">
                                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <span className="material-symbols-outlined text-[64px] text-blue-400">waves</span>
                                </div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Redis Memory</p>
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white">{redisMemory}</h3>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden group border-l-4 border-l-red-500">
                                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <span className="material-symbols-outlined text-[64px] text-red-500">warning</span>
                                </div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Failed Jobs</p>
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white">{totalFailed}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs font-bold text-red-500 flex items-center">
                                        <span className="material-symbols-outlined text-[14px]">arrow_upward</span> {totalFailed > 0 ? '+1' : '0'}
                                    </span>
                                    <span className="text-xs text-slate-400">Needs attention</span>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Charts Area */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Throughput vs Latency</h3>
                                    <button className="text-primary text-sm font-bold hover:underline">View Detailed Analysis</button>
                                </div>
                                <div className="h-64 w-full bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-end justify-between px-4 pb-0 pt-8 gap-2 overflow-hidden relative">
                                    {/* Mock Chart Bars */}
                                    <div className="w-full h-full absolute inset-0 flex items-center justify-center text-slate-300 dark:text-slate-600 font-bold text-2xl uppercase tracking-widest z-0">
                                        Chart Visualization
                                    </div>
                                    <div className="flex-1 bg-primary/20 hover:bg-primary/40 transition-all rounded-t h-[40%] relative group z-10">
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">2.4k req/s</div>
                                    </div>
                                    <div className="flex-1 bg-primary/30 hover:bg-primary/50 transition-all rounded-t h-[55%] relative group z-10"></div>
                                    <div className="flex-1 bg-primary/60 hover:bg-primary/80 transition-all rounded-t h-[70%] relative group z-10"></div>
                                    <div className="flex-1 bg-primary hover:bg-primary-dark transition-all rounded-t h-[85%] relative group z-10"></div>
                                    <div className="flex-1 bg-primary/70 hover:bg-primary/90 transition-all rounded-t h-[60%] relative group z-10"></div>
                                    <div className="flex-1 bg-primary/40 hover:bg-primary/60 transition-all rounded-t h-[45%] relative group z-10"></div>
                                    <div className="flex-1 bg-primary/20 hover:bg-primary/40 transition-all rounded-t h-[30%] relative group z-10"></div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6">Queue Backlog</h3>
                                <div className="flex-1 flex flex-col justify-center space-y-6">
                                    {queues.map(q => (
                                        <div key={q.id} className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <div className="flex items-center gap-1">
                                                    <span className="font-medium text-slate-600 dark:text-slate-300">{q.name}</span>
                                                    {q.status === 'critical' && <span className="material-symbols-outlined text-[14px] text-red-500">warning</span>}
                                                </div>
                                                <span className={`font-bold ${q.status === 'critical' ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>{q.active}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${q.status === 'critical' ? 'bg-red-500 animate-pulse' : 'bg-primary'}`}
                                                    style={{ width: `${Math.min(100, (q.active / 2000) * 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Job Activity Table (Remains Static Mock for now as generator doesn't provide job history list yet) */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Recent Job Activity</h3>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                                    <input type="text" placeholder="Search Job ID..." className="pl-9 pr-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none" />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700">
                                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Job ID</th>
                                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Queue Name</th>
                                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Attempts</th>
                                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</th>
                                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Age</th>
                                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400">
                                                    Completed
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-300">#job_9921</td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">video_processing</td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">1/3</td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">4s</td>
                                            <td className="px-6 py-4 text-sm text-slate-500">2m ago</td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined">more_horiz</span></button>
                                            </td>
                                        </tr>
                                        {/* Reduced mock items for brevity */}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Debug Console Footer */}
                    <div className="bg-[#1e1e1e] text-slate-300 p-2 border-t border-[#333] font-mono text-xs flex justify-between items-center">
                        <div className="flex gap-4">
                            <span className="text-green-500">    Redis Connected (127.0.0.1:6379)</span>
                            <span>Memory: {redisMemory}</span>
                            <span>Clients: 42</span>
                        </div>
                        <div className="flex gap-2 text-[#666]">
                            <span>Build: 39a4f21</span>
                            <span>Env: Production</span>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
