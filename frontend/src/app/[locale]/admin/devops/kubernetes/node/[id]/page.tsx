'use client';

import React from 'react';
import {
    Network,
    Search,
    Bell,
    ChevronRight,
    RefreshCcw,
    Slash,
    MoreVertical,
    Cpu,
    Database,
    HardDrive,
    Router,
    BarChart2,
    LineChart
} from 'lucide-react';

export default function KubernetesNodeDashboard() {
    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-white">
            <div className="layout-container flex h-full grow flex-col">
                {/* Top Navigation Bar */}
                <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 px-6 py-3 bg-white dark:bg-slate-950 sticky top-0 z-50">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3 text-blue-600">
                            <div className="size-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                                <Network className="size-5" />
                            </div>
                            <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">K8s Manager</h2>
                        </div>
                        <nav className="hidden md:flex items-center gap-6">
                            <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-500 text-sm font-medium transition-colors">Nodes</a>
                            <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-500 text-sm font-medium transition-colors">Clusters</a>
                            <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-500 text-sm font-medium transition-colors">Workloads</a>
                            <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-500 text-sm font-medium transition-colors">Settings</a>
                        </nav>
                    </div>
                    <div className="flex flex-1 justify-end gap-4">
                        <label className="hidden sm:flex flex-col min-w-40 h-10 max-w-64">
                            <div className="flex w-full flex-1 items-stretch rounded-lg h-full overflow-hidden">
                                <div className="text-slate-400 dark:text-slate-500 flex border-none bg-slate-100 dark:bg-slate-900 items-center justify-center pl-4">
                                    <Search className="size-5" />
                                </div>
                                <input className="form-input flex w-full min-w-0 flex-1 border-none bg-slate-100 dark:bg-slate-900 focus:ring-0 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="Search resources..." />
                            </div>
                        </label>
                        <div className="flex gap-2">
                            <button className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                <Bell className="size-5" />
                            </button>
                            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-blue-600/20 bg-slate-200">
                                {/* Fallback avatar */}
                                <span className="flex items-center justify-center h-full w-full text-xs font-bold text-slate-500">AV</span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex flex-1 flex-col px-4 md:px-10 lg:px-20 py-6 max-w-[1440px] mx-auto w-full">
                    {/* Breadcrumbs */}
                    <nav className="flex flex-wrap gap-2 items-center mb-6">
                        <a href="#" className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-blue-600">Cluster</a>
                        <ChevronRight className="text-slate-400 dark:text-slate-500 size-3" />
                        <a href="#" className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-blue-600">Nodes</a>
                        <ChevronRight className="text-slate-400 dark:text-slate-500 size-3" />
                        <span className="text-slate-900 dark:text-white text-sm font-semibold">Node-01 (Master)</span>
                    </nav>

                    {/* Page Header */}
                    <div className="flex flex-wrap justify-between items-end gap-6 mb-8">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <h1 className="text-slate-900 dark:text-white text-4xl font-black tracking-tight">Node-01</h1>
                                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-bold rounded uppercase tracking-wider border border-emerald-500/20">Ready</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-4">
                                <span className="flex items-center gap-1"><Slash className="size-3.5 rotate-90" /> 192.168.1.10</span>
                                <span className="flex items-center gap-1"><RefreshCcw className="size-3.5" /> Uptime: 14d 6h 22m</span>
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white text-sm font-bold rounded-lg transition-colors border border-slate-200 dark:border-transparent">
                                <RefreshCcw className="size-4" /> Refresh
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-colors">
                                <Slash className="size-4" /> Drain Node
                            </button>
                        </div>
                    </div>

                    {/* KPI Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex justify-between items-start">
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">CPU Usage</p>
                                <Cpu className="text-blue-600 size-5" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-slate-900 dark:text-white text-3xl font-bold">64%</p>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '64%' }}></div>
                                </div>
                            </div>
                            <p className="text-emerald-500 text-xs font-bold flex items-center gap-1">
                                <BarChart2 className="size-3" /> +5% from last hour
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex justify-between items-start">
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">Memory Usage</p>
                                <Database className="text-blue-600 size-5" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-slate-900 dark:text-white text-3xl font-bold">78%</p>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div className="bg-orange-500 h-full rounded-full" style={{ width: '78%' }}></div>
                                </div>
                            </div>
                            <p className="text-red-500 text-xs font-bold flex items-center gap-1">
                                <BarChart2 className="size-3" /> +12% from last hour
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex justify-between items-start">
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">Disk I/O</p>
                                <HardDrive className="text-blue-600 size-5" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-slate-900 dark:text-white text-3xl font-bold">165 MB/s</p>
                                <p className="text-slate-500 dark:text-slate-400 text-xs">Read: 120 / Write: 45</p>
                            </div>
                            <p className="text-emerald-500 text-xs font-bold flex items-center gap-1">
                                <BarChart2 className="size-3" /> -2% from last hour
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex justify-between items-start">
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">Network In/Out</p>
                                <Router className="text-blue-600 size-5" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-slate-900 dark:text-white text-3xl font-bold">1.2 Gbps</p>
                                <p className="text-slate-500 dark:text-slate-400 text-xs">Inbound traffic steady</p>
                            </div>
                            <p className="text-slate-400 text-xs font-bold flex items-center gap-1">
                                <Slash className="size-3" /> No change
                            </p>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <div className="rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-6 flex items-center gap-2">
                                <BarChart2 className="text-blue-600 size-5" /> Disk I/O Trends (1h)
                            </h3>
                            <div className="h-64 flex items-end gap-2 relative border-b border-l border-slate-200 dark:border-slate-700 pb-2 pl-2">
                                {/* SVG Visualization */}
                                <div className="flex-1 bg-blue-600/20 hover:bg-blue-600/40 h-[40%] rounded-t transition-all group relative">
                                    <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded">40MB/s</div>
                                </div>
                                <div className="flex-1 bg-blue-600/20 hover:bg-blue-600/40 h-[65%] rounded-t transition-all group relative"></div>
                                <div className="flex-1 bg-blue-600/20 hover:bg-blue-600/40 h-[55%] rounded-t transition-all group relative"></div>
                                <div className="flex-1 bg-blue-600/20 hover:bg-blue-600/40 h-[90%] rounded-t transition-all group relative"></div>
                                <div className="flex-1 bg-blue-600 h-[85%] rounded-t transition-all group relative"></div>
                                <div className="flex-1 bg-blue-600/20 hover:bg-blue-600/40 h-[70%] rounded-t transition-all group relative"></div>
                                <div className="flex-1 bg-blue-600/20 hover:bg-blue-600/40 h-[60%] rounded-t transition-all group relative"></div>
                                <div className="flex-1 bg-blue-600/20 hover:bg-blue-600/40 h-[45%] rounded-t transition-all group relative"></div>
                            </div>
                            <div className="flex justify-between mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                <span>14:00</span>
                                <span>14:15</span>
                                <span>14:30</span>
                                <span>14:45</span>
                                <span>Now</span>
                            </div>
                        </div>

                        <div className="rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-6 flex items-center gap-2">
                                <LineChart className="text-blue-600 size-5" /> Network Throughput
                            </h3>
                            <div className="h-64 flex items-end gap-1 relative border-b border-l border-slate-200 dark:border-slate-700">
                                {/* SVG wave simulation */}
                                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 200">
                                    <path d="M0 150 Q 50 120 100 160 T 200 130 T 300 170 T 400 120 V 200 H 0 Z" fill="rgba(37, 99, 235, 0.1)"></path>
                                    <path d="M0 150 Q 50 120 100 160 T 200 130 T 300 170 T 400 120" fill="none" stroke="#2563eb" strokeWidth="3"></path>
                                </svg>
                            </div>
                            <div className="flex justify-center gap-6 mt-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                                    <span className="text-xs font-medium text-slate-500">Inbound</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                    <span className="text-xs font-medium text-slate-500">Outbound</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pods Table Section */}
                    <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap justify-between items-center gap-4">
                            <h3 className="text-slate-900 dark:text-white text-lg font-bold">Pods on this Node</h3>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">Total: 12 Pods</span>
                                <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                    <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold">All</button>
                                    <button className="px-3 py-1.5 bg-transparent text-slate-500 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800">Errors</button>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pod Name & Namespace</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">CPU Usage</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Memory</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Restarts</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Age</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {/* Table Row 1 */}
                                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">api-gateway-v1-7685</span>
                                                <span className="text-xs text-slate-500 font-medium">production-namespace</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-500 text-[10px] font-bold uppercase">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Running
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div className="bg-blue-600 h-full" style={{ width: '45%' }}></div>
                                                </div>
                                                <span className="text-xs font-bold">450m</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div className="bg-blue-600 h-full" style={{ width: '32%' }}></div>
                                                </div>
                                                <span className="text-xs font-bold">1.2 GiB</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-500">0</td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-500">4d 12h</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-1 hover:text-blue-600 transition-colors">
                                                <MoreVertical className="size-4" />
                                            </button>
                                        </td>
                                    </tr>
                                    {/* Table Row 2 */}
                                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">redis-cache-main-0</span>
                                                <span className="text-xs text-slate-500 font-medium">data-namespace</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-500 text-[10px] font-bold uppercase">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Running
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div className="bg-blue-600 h-full" style={{ width: '12%' }}></div>
                                                </div>
                                                <span className="text-xs font-bold">120m</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div className="bg-orange-500 h-full" style={{ width: '85%' }}></div>
                                                </div>
                                                <span className="text-xs font-bold">4.8 GiB</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-500">2</td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-500">12d 5h</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-1 hover:text-blue-600 transition-colors">
                                                <MoreVertical className="size-4" />
                                            </button>
                                        </td>
                                    </tr>
                                    {/* Table Row 3 (Error) */}
                                    <tr className="bg-red-50/50 dark:bg-red-500/5 hover:bg-red-100/50 dark:hover:bg-red-500/10 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">worker-job-66a12</span>
                                                <span className="text-xs text-slate-500 font-medium">batch-processing</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-500 text-[10px] font-bold uppercase">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> CrashLoopBackOff
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div className="bg-slate-400 h-full" style={{ width: '2%' }}></div>
                                                </div>
                                                <span className="text-xs font-bold">10m</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div className="bg-slate-400 h-full" style={{ width: '5%' }}></div>
                                                </div>
                                                <span className="text-xs font-bold">64 MiB</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-red-500">14</td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-500">22m</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-1 hover:text-blue-600 transition-colors">
                                                <MoreVertical className="size-4" />
                                            </button>
                                        </td>
                                    </tr>
                                    {/* Table Row 4 */}
                                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">log-aggregator-88</span>
                                                <span className="text-xs text-slate-500 font-medium">kube-system</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-500 text-[10px] font-bold uppercase">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pending
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div className="bg-blue-600 h-full" style={{ width: '0%' }}></div>
                                                </div>
                                                <span className="text-xs font-bold">0m</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div className="bg-blue-600 h-full" style={{ width: '0%' }}></div>
                                                </div>
                                                <span className="text-xs font-bold">0 MiB</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-500">0</td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-500">1m</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-1 hover:text-blue-600 transition-colors">
                                                <MoreVertical className="size-4" />
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <p className="text-xs text-slate-500 font-medium tracking-wide">Showing 1-4 of 12 pods</p>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded text-xs font-bold opacity-50 cursor-not-allowed">Prev</button>
                                <button className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700">Next</button>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer Meta Info */}
                <footer className="px-6 md:px-20 py-8 border-t border-slate-200 dark:border-slate-800 mt-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-slate-500 dark:text-slate-400">   2024 Kubernetes Cluster Manager v2.4.0-stable</p>
                        <div className="flex gap-6">
                            <a href="#" className="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600">Docs</a>
                            <a href="#" className="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600">API Reference</a>
                            <a href="#" className="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600">Support</a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
