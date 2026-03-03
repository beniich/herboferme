'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MetricCard } from '@/components/ui/MetricCard'

export default function PIIDiscoveryPage() {
    const [activeTab, setActiveTab] = useState('Overview')

    return (
        <div className="bg-[#fcfcfd] dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
            {/* Search/Header Bar */}
            <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark/80 backdrop-blur-md px-8 py-5 sticky top-0 z-50">
                <div className="flex items-center gap-5">
                    <div className="bg-orange-500 p-2.5 rounded-xl shadow-lg shadow-orange-500/20 text-white">
                        <span className="material-symbols-outlined text-2xl">shield_lock</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight dark:text-white">PII Discovery</h2>
                        <div className="flex items-center gap-2">
                            <span className="flex size-2 rounded-full bg-green-500"></span>
                            <p className="text-xs text-slate-500 font-medium">Compliance scan active: HIPAA     GDPR</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1.5 border border-slate-200 dark:border-slate-700">
                        {['Overview', 'Database Scan', 'File System', 'Alerts'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === tab
                                    ? 'bg-white dark:bg-slate-900 text-primary shadow-lg ring-1 ring-slate-200 dark:ring-slate-700'
                                    : 'text-slate-500 hover:text-slate-200'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <Button variant="primary">
                        <span className="material-symbols-outlined">search</span>
                        New Scan
                    </Button>
                </div>
            </header>

            <main className="p-8 max-w-[1500px] mx-auto space-y-8">
                {/* Main Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        title="Total PII Matches"
                        value="42,102"
                        icon="visibility"
                        trend={{ value: '+14% last 7d', direction: 'up' }}
                    />
                    <MetricCard
                        title="Critical Data Leak"
                        value="0"
                        icon="warning"
                        className="ring-2 ring-emerald-500/20"
                    />
                    <MetricCard
                        title="Total Entities Scanned"
                        value="148"
                        icon="database"
                        subtitle="Databases, Buckets, Files"
                    />
                    <MetricCard
                        title="Compliance Score"
                        value="98%"
                        icon="assignment_turned_in"
                        trend={{ value: 'Stable', direction: 'neutral' }}
                    />
                </div>

                {/* Heatmap Section */}
                <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2 space-y-6">
                        <Card header={
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-orange-500">location_on</span>
                                    <h3 className="font-bold text-sm dark:text-white">Data Distribution Heatmap</h3>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <span className="size-2 rounded-full bg-slate-200 dark:bg-slate-800"></span>
                                        <span className="text-[10px] text-slate-400 font-bold">Clear</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="size-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]"></span>
                                        <span className="text-[10px] text-slate-400 font-bold text-orange-500">Sensitive</span>
                                    </div>
                                </div>
                            </div>
                        }>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Database Instances</h4>
                                        {[
                                            { name: 'Production_Main', type: 'PostgreSQL', sensitive: 85, color: 'bg-orange-500' },
                                            { name: 'User_Archive_2022', type: 'MongoDB', sensitive: 12, color: 'bg-orange-200' },
                                            { name: 'Analytics_Warehouse', type: 'BigQuery', sensitive: 42, color: 'bg-orange-400' },
                                            { name: 'Session_Store', type: 'Redis', sensitive: 0, color: 'bg-slate-200' }
                                        ].map((db) => (
                                            <div key={db.name} className="flex items-center gap-4 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/20 p-2 rounded-lg transition-all">
                                                <div className={`size-10 rounded-xl ${db.color} flex items-center justify-center text-white shadow-lg`}>
                                                    <span className="material-symbols-outlined text-sm">database</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold dark:text-white">{db.name}</p>
                                                    <p className="text-[10px] text-slate-500">{db.type}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-xs font-bold ${db.sensitive > 50 ? 'text-orange-500' : 'text-slate-400'}`}>
                                                        {db.sensitive}% Exposure
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-4 relative">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">S3 Bucket Assets</h4>
                                        <div className="heatmap-grid">
                                            {[...Array(96)].map((_, i) => {
                                                const intensity = [0, 0, 0, 1, 2, 3, 4, 0, 0, 1, 0, 3][i % 12]
                                                const colors = [
                                                    'bg-slate-100 dark:bg-slate-800',
                                                    'bg-orange-200/50',
                                                    'bg-orange-300',
                                                    'bg-orange-500',
                                                    'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                                                ]
                                                return (
                                                    <div
                                                        key={i}
                                                        className={`heatmap-cell ${colors[intensity]} cursor-pointer hover:ring-2 hover:ring-primary transition-all`}
                                                        title={`Entity ID: ${i}     Sensitive Data: ${intensity * 25}%`}
                                                    ></div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card header={<h3 className="font-bold text-sm dark:text-white">Recent Discovery Logs</h3>}>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {[
                                            { time: '2m ago', type: 'Email Address', location: 'Table: users_meta (col: contact)', status: 'MASKED' },
                                            { time: '14m ago', type: 'Credit Card', location: 'JSON Payload (source: external_api)', status: 'QUARANTINED' },
                                            { time: '1h ago', type: 'Social Security Num', location: 'PDF Attachment: tax_form_1040.pdf', status: 'ALERTED' },
                                        ].map((log, i) => (
                                            <tr key={i} className="text-xs hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="py-4 text-slate-400 font-medium">{log.time}</td>
                                                <td className="py-4 font-bold text-orange-500">{log.type}</td>
                                                <td className="py-4 text-slate-500 italic">{log.location}</td>
                                                <td className="py-4 text-right">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-black tracking-tighter ${log.status === 'MASKED' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600' :
                                                        log.status === 'QUARANTINED' ? 'bg-orange-100 dark:bg-orange-500/10 text-orange-600' :
                                                            'bg-red-100 dark:bg-red-500/10 text-red-600'
                                                        }`}>
                                                        {log.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>

                    <aside className="space-y-8">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-sm mb-5 dark:text-white">Detected Data Classes</h3>
                            <div className="space-y-5">
                                {[
                                    { label: 'Identifiers (Names, DoB)', count: '12.4k', color: 'bg-primary' },
                                    { label: 'Financial Info (Cards, IBAN)', count: '1.2k', color: 'bg-orange-500' },
                                    { label: 'Health Data (ICD-10)', count: '482', color: 'bg-red-500' },
                                    { label: 'Strict Credentials (API, SSH)', count: '94', color: 'bg-slate-900 dark:bg-white' },
                                ].map((item) => (
                                    <div key={item.label} className="space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500 font-medium">{item.label}</span>
                                            <span className="font-bold dark:text-white">{item.count}</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                            <div className={`${item.color} h-full rounded-full`} style={{ width: Math.random() * 60 + 20 + '%' }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button variant="ghost" className="w-full mt-8">View Compliance Map</Button>
                        </div>

                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm border-t-4 border-t-orange-500">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="material-symbols-outlined text-orange-500">security_update_good</span>
                                <h3 className="font-bold text-sm dark:text-white">Active Protection Rules</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                    <span className="material-symbols-outlined text-emerald-500 text-sm">check</span>
                                    <p className="text-[11px] text-slate-500 leading-relaxed italic">Auto-masking enabled for all Postgres databases in East region.</p>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                    <span className="material-symbols-outlined text-emerald-500 text-sm">check</span>
                                    <p className="text-[11px] text-slate-500 leading-relaxed italic">Daily scan configured for S3 public access monitoring.</p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </section>
            </main>
        </div>
    )
}
