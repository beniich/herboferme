'use client';

import React, { useState, useEffect } from 'react';
import { useSecurityMetrics } from '@/hooks/useSecurityMetrics';
import { adminApi } from '@/lib/api';
import {
    ShieldCheck,
    LayoutDashboard,
    BarChart,
    Terminal,
    BellRing,
    Server,
    Settings,
    ChevronsUpDown,
    RefreshCcw,
    Share2,
    Users,
    CheckCircle,
    Clock,
    AlertCircle,
    TrendingUp,
    TrendingDown,
    Search,
    Slash,
    Minus
} from 'lucide-react';

export default function SecurityDashboard() {
    const { metrics, loading } = useSecurityMetrics();
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [logsLoading, setLogsLoading] = useState(true);
    const [securityChecks, setSecurityChecks] = useState<any[]>([]);
    const [auditLoading, setAuditLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const logs = await adminApi.getAuditLogs();
                setAuditLogs(logs.data || logs);
            } catch (err) {
                console.error('Failed to fetch audit logs:', err);
            } finally {
                setLogsLoading(false);
            }
        };

        const fetchAudit = async () => {
            try {
                const audit = await adminApi.getSecurityAudit();
                setSecurityChecks(audit.data || audit);
            } catch (err) {
                console.error('Failed to fetch security audit:', err);
            } finally {
                setAuditLoading(false);
            }
        };

        fetchLogs();
        fetchAudit();
    }, []);

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                <div className="p-6 flex items-center gap-3">
                    <div className="size-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                        <ShieldCheck className="size-5" />
                    </div>
                    <h1 className="font-bold text-xl tracking-tight">Sentinel</h1>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                    <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Monitoring</p>
                    <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-600/10 text-blue-600 font-medium">
                        <LayoutDashboard className="size-5" />
                        Dashboard
                    </a>
                    <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <BarChart className="size-5" />
                        Metrics
                    </a>
                    <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <Terminal className="size-5" />
                        Logs
                    </a>
                    <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <BellRing className="size-5" />
                        Alerts
                    </a>

                    <div className="pt-6">
                        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Infrastructure</p>
                        <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <Server className="size-5" />
                            Clusters
                        </a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <Settings className="size-5" />
                            Settings
                        </a>
                    </div>
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-xl flex items-center gap-3">
                        <div className="size-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-600 font-bold text-xs">JD</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">John Doe</p>
                            <p className="text-xs text-slate-500 truncate">SRE Lead</p>
                        </div>
                        <ChevronsUpDown className="text-slate-400 size-4" />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Navbar */}
                <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <h2 className="font-semibold text-lg">Auth Service</h2>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            LIVE
                        </span>
                        <span className="text-slate-400 text-sm">v2.4.1-stable</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                            <button className="px-3 py-1 text-xs font-semibold rounded-md transition-colors bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-sm">Prod</button>
                            <button className="px-3 py-1 text-xs font-semibold rounded-md transition-colors text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Staging</button>
                        </div>
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>
                        <div className="flex items-center gap-2">
                            <button className="size-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900">
                                <RefreshCcw className="size-4" />
                            </button>
                            <button className="size-9 flex items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                                <Share2 className="size-4" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Dashboard Body */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    {/* KPI Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="size-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
                                    <Users className="size-5" />
                                </div>
                                <span className="text-emerald-500 text-sm font-medium flex items-center gap-1">
                                    +5.2% <TrendingUp className="size-3.5" />
                                </span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Security Score</p>
                            <p className="text-3xl font-bold mt-1">{loading ? '...' : metrics?.securityScore}%</p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                    <CheckCircle className="size-5" />
                                </div>
                                <span className="text-emerald-500 text-sm font-medium flex items-center gap-1">
                                    STABLE <TrendingUp className="size-3.5" />
                                </span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Status</p>
                            <p className="text-3xl font-bold mt-1 uppercase text-emerald-500">{loading ? '...' : metrics?.status}</p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="size-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                    <Share2 className="size-5" />
                                </div>
                                <span className="text-amber-500 text-sm font-medium flex items-center gap-1">
                                    LIVE
                                </span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Blocked IPs</p>
                            <p className="text-3xl font-bold mt-1">{loading ? '...' : metrics?.blockedIPs}</p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="size-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                                    <ShieldCheck className="size-5" />
                                </div>
                                <span className="text-emerald-500 text-sm font-medium flex items-center gap-1">
                                    ACTIVE
                                </span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">WAF Triggers</p>
                            <p className="text-3xl font-bold mt-1">{loading ? '...' : metrics?.wafTriggers}</p>
                        </div>
                    </div>

                    {/* Main Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="font-semibold text-base">Login Success Rate</h3>
                                    <p className="text-xs text-slate-500">Real-time authentication performance</p>
                                </div>
                                <div className="flex items-center gap-4 text-xs">
                                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Success</div>
                                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Failures</div>
                                </div>
                            </div>
                            <div className="h-64 flex items-end gap-1 relative group bg-slate-50 dark:bg-slate-950/50 rounded-lg overflow-hidden">
                                {/* Simulated Chart */}
                                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 100">
                                    <defs>
                                        <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                                            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M0,80 Q25,75 50,82 T100,70 T150,75 T200,60 T250,65 T300,50 T350,55 T400,45" fill="none" stroke="#2563eb" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                                    <path d="M0,80 Q25,75 50,82 T100,70 T150,75 T200,60 T250,65 T300,50 T350,55 T400,45 L400,100 L0,100 Z" fill="url(#grad1)" stroke="none" />
                                </svg>
                                <div className="absolute bottom-0 left-0 w-full flex justify-between text-[10px] text-slate-400 pt-2 px-2">
                                    <span>12:00</span><span>12:15</span><span>12:30</span><span>12:45</span><span>13:00</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="font-semibold text-base">Token Latency Distribution</h3>
                                    <p className="text-xs text-slate-500">p95 & p99 response times</p>
                                </div>
                                <select className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md py-1 px-2">
                                    <option>Last 60 mins</option>
                                    <option>Last 24 hours</option>
                                </select>
                            </div>
                            <div className="h-64 flex items-end gap-2 px-2">
                                <div className="flex-1 bg-blue-600/20 hover:bg-blue-600 transition-all rounded-t-sm" style={{ height: '40%' }}></div>
                                <div className="flex-1 bg-blue-600/20 hover:bg-blue-600 transition-all rounded-t-sm" style={{ height: '60%' }}></div>
                                <div className="flex-1 bg-blue-600/20 hover:bg-blue-600 transition-all rounded-t-sm" style={{ height: '35%' }}></div>
                                <div className="flex-1 bg-blue-600/20 hover:bg-blue-600 transition-all rounded-t-sm" style={{ height: '80%' }}></div>
                                <div className="flex-1 bg-blue-600/20 hover:bg-blue-600 transition-all rounded-t-sm" style={{ height: '55%' }}></div>
                                <div className="flex-1 bg-rose-500/40 hover:bg-rose-500 transition-all rounded-t-sm" style={{ height: '95%' }}></div>
                                <div className="flex-1 bg-blue-600/20 hover:bg-blue-600 transition-all rounded-t-sm" style={{ height: '65%' }}></div>
                                <div className="flex-1 bg-blue-600/20 hover:bg-blue-600 transition-all rounded-t-sm" style={{ height: '45%' }}></div>
                                <div className="flex-1 bg-blue-600/20 hover:bg-blue-600 transition-all rounded-t-sm" style={{ height: '30%' }}></div>
                                <div className="flex-1 bg-blue-600/20 hover:bg-blue-600 transition-all rounded-t-sm" style={{ height: '70%' }}></div>
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400 mt-2 px-2">
                                <span>10ms</span><span>50ms</span><span>100ms</span><span>150ms</span><span>200ms+</span>
                            </div>
                        </div>
                    </div>

                    {/* Security Audit Row */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-semibold text-base">Sentinel Security Audit</h3>
                                <p className="text-xs text-slate-500">Continuous vulnerability and configuration scanning</p>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-blue-600/10 text-blue-600 text-xs font-bold border border-blue-600/20">
                                {auditLoading ? 'Running...' : `${securityChecks.filter(c => c.status === 'pass').length}/${securityChecks.length} Passed`}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {auditLoading ? (
                                Array(6).fill(0).map((_, i) => (
                                    <div key={i} className="h-24 bg-slate-50 dark:bg-slate-950/50 animate-pulse rounded-xl"></div>
                                ))
                            ) : (
                                securityChecks.map((check) => (
                                    <div key={check.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex gap-4">
                                        <div className={`size-10 shrink-0 rounded-full flex items-center justify-center ${
                                            check.status === 'pass' ? 'bg-emerald-500/10 text-emerald-500' :
                                            check.status === 'warn' ? 'bg-amber-500/10 text-amber-500' :
                                            'bg-rose-500/10 text-rose-500'
                                        }`}>
                                            {check.status === 'pass' ? <CheckCircle className="size-5" /> :
                                             check.status === 'warn' ? <AlertCircle className="size-5" /> :
                                             <ShieldCheck className="size-5" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-sm truncate">{check.name}</p>
                                            <p className="text-xs text-slate-500 line-clamp-2">{check.description}</p>
                                            {check.recommendation && (
                                                <p className="text-[10px] text-blue-600 font-medium mt-1 truncate">     {check.recommendation}</p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Status Codes & Table Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="font-semibold text-base mb-6">Status Codes</h3>
                            <div className="flex justify-center relative py-4">
                                {/* Fake Donut Chart */}
                                <div className="size-40 rounded-full border-[12px] border-slate-100 dark:border-slate-800 flex items-center justify-center relative">
                                    <div className="absolute inset-[-12px] rounded-full border-[12px] border-blue-600 border-r-transparent border-b-transparent rotate-12"></div>
                                    <div className="absolute inset-[-12px] rounded-full border-[12px] border-amber-400 border-l-transparent border-t-transparent border-r-transparent rotate-45"></div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-2xl font-bold">10.4k</span>
                                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Total req</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-blue-600"></span> <span className="text-xs">2xx OK</span></div>
                                    <span className="text-xs font-bold">94.2%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-amber-400"></span> <span className="text-xs">4xx Auth Error</span></div>
                                    <span className="text-xs font-bold">5.1%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-rose-500"></span> <span className="text-xs">5xx Server Error</span></div>
                                    <span className="text-xs font-bold">0.7%</span>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                <h3 className="font-semibold text-base">Top Failed Endpoints</h3>
                                <button className="text-xs text-blue-600 font-medium">View all</button>
                            </div>
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="text-slate-500 border-b border-slate-100 dark:border-slate-800">
                                        <th className="px-6 py-4 font-medium">Endpoint</th>
                                        <th className="px-6 py-4 font-medium">Method</th>
                                        <th className="px-6 py-4 font-medium">Failures</th>
                                        <th className="px-6 py-4 font-medium">Trend</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    <tr>
                                        <td className="px-6 py-4 font-mono text-xs">/v1/auth/token/refresh</td>
                                        <td className="px-6 py-4"><span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">POST</span></td>
                                        <td className="px-6 py-4 font-semibold">1,242</td>
                                        <td className="px-6 py-4 text-rose-500 flex items-center gap-1"><TrendingUp className="size-4" /></td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-mono text-xs">/v1/user/mfa/verify</td>
                                        <td className="px-6 py-4"><span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">POST</span></td>
                                        <td className="px-6 py-4 font-semibold">412</td>
                                        <td className="px-6 py-4 text-emerald-500 flex items-center gap-1"><TrendingDown className="size-4" /></td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-mono text-xs">/v1/oauth/callback</td>
                                        <td className="px-6 py-4"><span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">GET</span></td>
                                        <td className="px-6 py-4 font-semibold">89</td>
                                        <td className="px-6 py-4 text-slate-400 flex items-center gap-1"><Minus className="size-4" /></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Live Log Stream */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-96">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                            <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-base flex items-center gap-2">
                                    <Terminal className="text-blue-600 size-5" />
                                    Live Log Stream
                                </h3>
                                <div className="flex gap-2">
                                    <span className="px-2 py-0.5 rounded bg-blue-600/10 text-blue-600 text-[10px] font-bold cursor-pointer">INFO</span>
                                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold cursor-pointer">WARN</span>
                                    <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 text-[10px] font-bold cursor-pointer">ERROR</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-2 top-1.5 text-slate-400 text-sm size-4" />
                                    <input type="text" className="pl-8 py-1 rounded-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs w-48 " placeholder="Filter logs..." />
                                </div>
                                <button className="size-8 flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-500">
                                    <Slash className="size-4" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 bg-[#0b101a] p-4 font-mono text-xs overflow-y-auto custom-scrollbar space-y-1">
                            {logsLoading ? (
                                <p className="text-slate-500 italic">Loading live audit logs...</p>
                            ) : auditLogs.length > 0 ? (
                                auditLogs.map((log: any, idx: number) => (
                                    <div key={idx} className={`p-1 border-l-2 ${log.action === 'ERROR' ? 'border-rose-500 bg-rose-500/5' : log.action === 'WARN' ? 'border-amber-500' : 'border-emerald-500'} flex gap-4 hover:bg-blue-600/10 transition-colors`}>
                                        <span className="text-slate-500 min-w-[140px]">{new Date(log.timestamp || log.time).toLocaleString()}</span>
                                        <span className={`${log.action === 'ERROR' ? 'text-rose-500' : log.action === 'WARN' ? 'text-amber-500' : 'text-emerald-400'} font-bold`}>[{log.action}]</span>
                                        <span className="text-slate-300">User <span className="text-blue-500">{log.userId || log.user}</span> executed <span className="text-blue-400">{log.action}</span> on {log.targetType || 'system'}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-500 italic">No recent audit logs available.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
