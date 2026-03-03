'use client';

import { KPICard } from '@/components/shared/KPICard';
import { StatusIndicator } from '@/components/shared/StatusIndicator';
import { Shield, AlertTriangle, Activity, Database } from 'lucide-react';
import { useThreatData } from '@/lib/hooks/useThreatData';

export default function ThreatIntelPage() {
    const { metrics, events, loading } = useThreatData();

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        WAF Threat Intelligence
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Real-time security monitoring and threat detection
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-sm font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        Export Report
                    </button>
                    <button className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Deploy Countermeasures
                    </button>
                </div>
            </div>

            {/* KPI Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics && (
                    <>
                        <KPICard
                            title="Total Blocks (24h)"
                            value={metrics.totalBlocks24h.toLocaleString()}
                            change={metrics.blocksChange}
                            trend="up"
                            changeLabel="vs yesterday"
                            icon={<Shield className="w-5 h-5" />}
                            loading={loading}
                        />

                        <KPICard
                            title="Active DDoS Events"
                            value={metrics.activeDDoS.toString()}
                            changeLabel="Largest: 4.2 Gbps UDP Flood"
                            icon={<AlertTriangle className="w-5 h-5" />}
                            loading={loading}
                            className="border-l-4 border-l-red-500"
                        />

                        <KPICard
                            title="SQLi Attempts"
                            value={metrics.sqlInjectionAttempts.toLocaleString()}
                            change={-5}
                            trend="down"
                            changeLabel="Prevention rate: 100%"
                            icon={<Activity className="w-5 h-5" />}
                            loading={loading}
                        />

                        <KPICard
                            title="Threat Feed Sync"
                            value={metrics.threatFeedSync.toString()}
                            changeLabel="Last update: 2 mins ago"
                            icon={<Database className="w-5 h-5" />}
                            loading={loading}
                            footer={
                                <div className="flex items-center gap-2 text-emerald-500 text-xs font-medium">
                                    <StatusIndicator status="healthy" size="sm" />
                                    <span>100% Synced</span>
                                </div>
                            }
                        />
                    </>
                )}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Global Threat Map - 2/3 width */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Threat Map */}
                    <div className="dashboard-card overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-border-dark bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" />
                                <h3 className="font-bold text-sm">Live Global Threat Visualization</h3>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-bold tracking-widest bg-slate-800 px-2 py-1 rounded">
                                    <span className="size-1.5 rounded-full bg-red-500 animate-pulse"></span> SQLi
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-bold tracking-widest bg-slate-800 px-2 py-1 rounded">
                                    <span className="size-1.5 rounded-full bg-amber-500"></span> XSS
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-bold tracking-widest bg-slate-800 px-2 py-1 rounded">
                                    <span className="size-1.5 rounded-full bg-primary"></span> DDoS
                                </div>
                            </div>
                        </div>

                        <div className="h-[400px] bg-[#0d111a] relative overflow-hidden">
                            <div className="absolute inset-0 opacity-40 grayscale contrast-125"></div>
                            <div className="absolute inset-0 z-10 p-8">
                                <div className="absolute top-1/4 left-1/4 animate-ping size-4 bg-red-500/50 rounded-full"></div>
                                <div className="absolute top-1/4 left-1/4 size-2 bg-red-500 rounded-full"></div>
                                <div className="absolute bottom-1/3 right-1/4 animate-ping size-6 bg-primary/50 rounded-full"></div>
                                <div className="absolute bottom-1/3 right-1/4 size-3 bg-primary rounded-full"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-primary/20 size-64 rounded-full border-dashed animate-[spin_20s_linear_infinite]"></div>
                            </div>
                            <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
                                <button className="size-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 text-white">+</button>
                                <button className="size-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 text-white">-</button>
                            </div>
                        </div>
                    </div>

                    {/* Real-time Log Feed */}
                    <div className="dashboard-card overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-border-dark bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                            <h3 className="font-bold text-sm flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary" />
                                Real-time Blocked Events
                            </h3>
                            <button className="text-xs text-primary font-bold hover:underline">View All Logs</button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="data-table">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase tracking-wider text-slate-500">
                                        <th className="px-4 py-2 font-semibold">Timestamp</th>
                                        <th className="px-4 py-2 font-semibold">Source IP</th>
                                        <th className="px-4 py-2 font-semibold">Attack Vector</th>
                                        <th className="px-4 py-2 font-semibold">Target URI</th>
                                        <th className="px-4 py-2 font-semibold">Geo</th>
                                        <th className="px-4 py-2 font-semibold">Severity</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs text-slate-600 dark:text-slate-300">
                                    {events?.map((event) => (
                                        <tr key={event.id} className={`border-b border-slate-200 dark:border-border-dark transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30 ${event.severityScore > 80 ? 'severity-high' :
                                                event.severityScore > 50 ? 'severity-medium' : 'severity-low'
                                            }`}>
                                            <td className="px-4 py-3 font-mono">{new Date(event.timestamp).toLocaleTimeString()}</td>
                                            <td className="px-4 py-3 font-mono text-slate-900 dark:text-white">{event.sourceIP}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${event.attackVector === 'SQL Injection' ? 'bg-red-500/10 text-red-500' :
                                                        event.attackVector === 'XSS' ? 'bg-amber-500/10 text-amber-500' :
                                                            'bg-emerald-500/10 text-emerald-500'
                                                    }`}>{event.attackVector}</span>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs">{event.targetURI}</td>
                                            <td className="px-4 py-3 flex items-center gap-2">{event.geoLocation}</td>
                                            <td className={`px-4 py-3 font-bold ${event.severityScore > 80 ? 'text-red-500' :
                                                    event.severityScore > 50 ? 'text-amber-500' : 'text-emerald-500'
                                                }`}>{event.severityScore}/100</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar - 1/3 width */}
                <div className="space-y-6">
                    {/* Attack Distribution */}
                    <div className="dashboard-card p-5">
                        <h3 className="font-bold text-sm flex items-center gap-2 mb-4">
                            <Activity className="w-5 h-5 text-primary" />
                            Attack Distribution
                        </h3>
                        <div className="flex items-center justify-center py-6 relative">
                            <div className="size-40 rounded-full border-[12px] border-slate-700 flex items-center justify-center relative">
                                <div className="absolute inset-0 rounded-full border-[12px] border-primary border-t-transparent border-r-transparent border-l-transparent rotate-45"></div>
                                <div className="absolute inset-0 rounded-full border-[12px] border-red-500 border-b-transparent border-r-transparent border-l-transparent -rotate-12"></div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">45%</p>
                                    <p className="text-[10px] text-slate-500 uppercase">DDoS dominant</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3 mt-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="flex items-center gap-2">
                                    <span className="size-2 rounded-full bg-primary"></span> DDoS Traffic
                                </span>
                                <span className="text-slate-900 dark:text-white font-mono">45,102 (45%)</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="flex items-center gap-2">
                                    <span className="size-2 rounded-full bg-red-500"></span> SQL Injection
                                </span>
                                <span className="text-slate-900 dark:text-white font-mono">22,044 (22%)</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="flex items-center gap-2">
                                    <span className="size-2 rounded-full bg-amber-500"></span> XSS Patterns
                                </span>
                                <span className="text-slate-900 dark:text-white font-mono">18,201 (18%)</span>
                            </div>
                        </div>
                    </div>

                    {/* Top Offenders */}
                    <div className="dashboard-card overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-border-dark bg-slate-50/50 dark:bg-slate-800/50">
                            <h3 className="font-bold text-sm flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-primary" />
                                Top Offenders
                            </h3>
                        </div>
                        <div className="p-2 space-y-1">
                            <div className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer">
                                <div className="size-8 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">
                                    <Shield className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-mono text-slate-900 dark:text-white truncate">185.244.25.12</p>
                                    <p className="text-[10px] text-slate-500">ASN 4134 | China Telecom</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-red-500">99</p>
                                    <p className="text-[10px] text-slate-500">REPUTATION</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer">
                                <div className="size-8 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">
                                    <Shield className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-mono text-slate-900 dark:text-white truncate">42.112.28.192</p>
                                    <p className="text-[10px] text-slate-500">ASN 131279 | VNPT-NET</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-red-500">94</p>
                                    <p className="text-[10px] text-slate-500">REPUTATION</p>
                                </div>
                            </div>
                        </div>
                        <button className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            SCAN GLOBAL REPUTATION DATABASE
                        </button>
                    </div>

                    {/* Feed Health */}
                    <div className="dashboard-card p-5">
                        <h3 className="font-bold text-sm mb-4">External Threat Feeds</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <StatusIndicator status="healthy" size="sm" />
                                    <span className="text-xs text-slate-700 dark:text-slate-300">AlienVault OTX</span>
                                </div>
                                <span className="text-[10px] text-slate-500">Synced 12s ago</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <StatusIndicator status="healthy" size="sm" />
                                    <span className="text-xs text-slate-700 dark:text-slate-300">CrowdStrike Falcon</span>
                                </div>
                                <span className="text-[10px] text-slate-500">Synced 1m ago</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <StatusIndicator status="warning" size="sm" showPulse />
                                    <span className="text-xs text-slate-700 dark:text-slate-300">Spamhaus DROP</span>
                                </div>
                                <span className="text-[10px] text-slate-500 italic">Syncing...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Filter Bar */}
            <div className="dashboard-card p-4 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        <button className="px-4 py-1.5 text-xs font-bold bg-primary text-white rounded-md shadow-sm">Real-time</button>
                        <button className="px-4 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">24h History</button>
                        <button className="px-4 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">7d Trend</button>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all border border-slate-200 dark:border-slate-700">
                        <span>    </span> Export Report
                    </button>
                    <button className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-primary/20">
                        <Shield className="w-4 h-4" /> Deploy Countermeasures
                    </button>
                </div>
            </div>
        </div>
    );
}
