'use client'

import { Footer } from "@/components/devops-dashboards/layout/Footer"
import { Header } from "@/components/devops-dashboards/layout/Header"
import { useState } from 'react'

export default function KubernetesPage() {
    const [activeTab, setActiveTab] = useState('main')
    const [terminalInput, setTerminalInput] = useState('')

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col overflow-hidden">
            <Header />
            {/* Top Navigation Bar / Subheader */}
            <header className="flex items-center justify-between px-6 py-3 border-b border-border-dark bg-surface-dark/50 backdrop-blur-md z-10">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/20 p-1.5 rounded-lg text-primary">
                            <span className="material-symbols-outlined text-2xl">grid_view</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-bold tracking-tight">backend-api-v2-7484df</h1>
                                <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                                <span className="text-xs font-medium text-green-500 uppercase tracking-wider">
                                    Running
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">
                                Namespace: <span className="text-slate-200">production-east-1</span>     IP: 10.42.1.84
                            </p>
                        </div>
                    </div>
                    <nav className="hidden md:flex items-center gap-1 ml-4">
                        <a
                            href="#"
                            className="px-3 py-1.5 text-sm font-medium rounded-lg bg-primary/10 text-primary border border-primary/20"
                        >
                            Overview
                        </a>
                        <a
                            href="#"
                            className="px-3 py-1.5 text-sm font-medium rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            Logs
                        </a>
                        <a
                            href="#"
                            className="px-3 py-1.5 text-sm font-medium rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            Metrics
                        </a>
                        <a
                            href="#"
                            className="px-3 py-1.5 text-sm font-medium rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            YAML
                        </a>
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-surface-dark border border-border-dark rounded-lg p-1 mr-2">
                        <button
                            onClick={() => setActiveTab('main')}
                            className={`px-3 py-1 text-xs font-medium rounded ${activeTab === 'main' ? 'bg-border-dark text-white' : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            Main Container
                        </button>
                        <button
                            onClick={() => setActiveTab('proxy')}
                            className={`px-3 py-1 text-xs font-medium rounded ${activeTab === 'proxy' ? 'bg-border-dark text-white' : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            Istio Proxy
                        </button>
                    </div>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-dark bg-surface-dark hover:bg-border-dark transition-colors text-sm font-semibold">
                        <span className="material-symbols-outlined text-sm">refresh</span>
                        Restart
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm font-semibold">
                        <span className="material-symbols-outlined text-sm">delete</span>
                        Delete
                    </button>
                </div>
            </header>

            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Upper Grid: Metrics & Status */}
                <div className="p-6 grid grid-cols-12 gap-4 h-1/2 min-h-[400px]">
                    {/* Resource Usage Card */}
                    <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4 h-full">
                            {/* CPU Usage */}
                            <div className="bg-surface-dark rounded-xl border border-border-dark p-5 flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">memory</span>
                                        <h3 className="font-semibold text-sm">CPU Usage</h3>
                                    </div>
                                    <span className="text-xs text-slate-400">Limit: 2.0 Cores</span>
                                </div>
                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-3xl font-black text-white">420m</span>
                                        <span className="text-sm font-medium text-green-500">21% of limit</span>
                                    </div>
                                    {/* Simple SVG Sparkline Chart */}
                                    <div className="w-full h-24 mt-4 bg-background-dark/50 rounded-lg overflow-hidden relative">
                                        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
                                            <path
                                                className="opacity-50"
                                                d="M0 40 L0 30 Q10 25 20 32 T40 20 T60 28 T80 15 T100 25 L100 40 Z"
                                                fill="url(#cpuGradient)"
                                            />
                                            <path
                                                d="M0 30 Q10 25 20 32 T40 20 T60 28 T80 15 T100 25"
                                                fill="none"
                                                stroke="#135bec"
                                                strokeWidth="1"
                                            />
                                            <defs>
                                                <linearGradient id="cpuGradient" x1="0" x2="0" y1="0" y2="1">
                                                    <stop offset="0%" stopColor="#135bec" />
                                                    <stop offset="100%" stopColor="transparent" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Memory Usage */}
                            <div className="bg-surface-dark rounded-xl border border-border-dark p-5 flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">analytics</span>
                                        <h3 className="font-semibold text-sm">Memory Usage</h3>
                                    </div>
                                    <span className="text-xs text-slate-400">Limit: 4Gi</span>
                                </div>
                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-3xl font-black text-white">1.84Gi</span>
                                        <span className="text-sm font-medium text-amber-500">46% of limit</span>
                                    </div>
                                    <div className="w-full h-24 mt-4 bg-background-dark/50 rounded-lg overflow-hidden relative">
                                        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
                                            <path
                                                className="opacity-50"
                                                d="M0 40 L0 20 Q10 22 20 18 T40 15 T60 16 T80 14 T100 15 L100 40 Z"
                                                fill="url(#memGradient)"
                                            />
                                            <path
                                                d="M0 20 Q10 22 20 18 T40 15 T60 16 T80 14 T100 15"
                                                fill="none"
                                                stroke="#135bec"
                                                strokeWidth="1"
                                            />
                                            <defs>
                                                <linearGradient id="memGradient" x1="0" x2="0" y1="0" y2="1">
                                                    <stop offset="0%" stopColor="#135bec" />
                                                    <stop offset="100%" stopColor="transparent" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Events/Logs Preview */}
                    <div className="col-span-12 lg:col-span-4 bg-surface-dark rounded-xl border border-border-dark flex flex-col overflow-hidden">
                        <div className="px-4 py-3 border-b border-border-dark flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-400 text-sm">history</span>
                                <h3 className="font-bold text-sm">Recent Events</h3>
                            </div>
                            <button className="text-xs text-primary font-medium hover:underline">View All</button>
                        </div>
                        <div className="flex-1 overflow-y-auto terminal-scrollbar p-4 space-y-4">
                            <div className="flex gap-3">
                                <div className="text-green-500 pt-1">
                                    <span className="material-symbols-outlined text-lg">check_circle</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white uppercase">Started</p>
                                    <p className="text-xs text-slate-400">Started container main</p>
                                    <p className="text-[10px] text-slate-500 mt-1">14h ago     kubelet, aks-pool-1</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="text-green-500 pt-1">
                                    <span className="material-symbols-outlined text-lg">check_circle</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white uppercase">Pulled</p>
                                    <p className="text-xs text-slate-400">
                                        Successfully pulled image &quot;backend:v2.1.4&quot;
                                    </p>
                                    <p className="text-[10px] text-slate-500 mt-1">14h ago     kubelet, aks-pool-1</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="text-amber-500 pt-1">
                                    <span className="material-symbols-outlined text-lg">warning</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white uppercase">BackOff</p>
                                    <p className="text-xs text-slate-400">Backing off restarting failed container</p>
                                    <p className="text-[10px] text-slate-500 mt-1">15h ago     kubelet, aks-pool-1</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Terminal Shell Section */}
                <div className="flex-1 flex flex-col border-t border-border-dark bg-[#0b0f17] overflow-hidden">
                    <div className="px-4 py-2 border-b border-border-dark flex items-center justify-between bg-surface-dark">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-400 text-sm">terminal</span>
                                <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">
                                    Interactive Shell (bash)
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
                                <span className="text-[10px] text-primary font-bold">CONNECTED</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                className="p-1 hover:bg-white/10 rounded text-slate-400"
                                title="Clear Terminal"
                            >
                                <span className="material-symbols-outlined text-sm">backspace</span>
                            </button>
                            <button
                                className="p-1 hover:bg-white/10 rounded text-slate-400"
                                title="Download Buffer"
                            >
                                <span className="material-symbols-outlined text-sm">download</span>
                            </button>
                            <div className="h-4 w-[1px] bg-border-dark mx-1"></div>
                            <button className="p-1 hover:bg-white/10 rounded text-slate-400">
                                <span className="material-symbols-outlined text-sm">expand_content</span>
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 p-4 font-mono text-sm overflow-y-auto terminal-scrollbar leading-relaxed">
                        <div className="mb-2">
                            <span className="text-green-500">root@backend-api-v2-7484df</span>
                            <span className="text-white">:</span>
                            <span className="text-primary">/app</span>
                            <span className="text-white">$ ls -la</span>
                        </div>
                        <div className="text-slate-400 mb-2">
                            total 64
                            <br />
                            drwxr-xr-x 1 root root 4096 Oct 24 12:44 .
                            <br />
                            drwxr-xr-x 1 root root 4096 Oct 24 12:44 ..
                            <br />
                            -rw-r--r-- 1 root root 220 Oct 24 12:44 .bash_logout
                            <br />
                            -rw-r--r-- 1 root root 3771 Oct 24 12:44 .bashrc
                            <br />
                            -rw-r--r-- 1 root root 807 Oct 24 12:44 .profile
                            <br />
                            drwxr-xr-x 2 root root 4096 Oct 24 12:44 bin
                            <br />
                            drwxr-xr-x 2 root root 4096 Oct 24 12:44 config
                            <br />
                            -rwxr-xr-x 1 root root 12440 Oct 24 12:44 server.js
                        </div>
                        <div className="mb-2">
                            <span className="text-green-500">root@backend-api-v2-7484df</span>
                            <span className="text-white">:</span>
                            <span className="text-primary">/app</span>
                            <span className="text-white">$ tail -f logs/server.log</span>
                        </div>
                        <div className="text-slate-500">
                            [2023-10-25 09:12:01] INFO: Initializing worker process 4...
                            <br />
                            [2023-10-25 09:12:02] INFO: Connected to MongoDB at cluster0.mongodb.net
                            <br />
                            [2023-10-25 09:12:05] WARN: Deprecated API call detected in /v1/user/update
                            <br />
                            [2023-10-25 09:12:10] INFO: Health check passed - status code 200
                            <br />
                            [2023-10-25 09:13:42] ERROR: Socket timeout from downstream service &apos;auth-provider&apos;
                            <br />
                            [2023-10-25 09:13:42] WARN: Retrying connection to &apos;auth-provider&apos; (1/3)...
                            <br />
                            <span className="animate-pulse inline-block w-2 h-4 bg-primary align-middle ml-1"></span>
                        </div>
                    </div>
                    {/* Terminal Input */}
                    <div className="px-4 py-2 border-t border-border-dark flex items-center bg-background-dark">
                        <span className="text-green-500 font-mono text-sm mr-2">   </span>
                        <input
                            type="text"
                            className="flex-1 bg-transparent border-none outline-none focus:ring-0 font-mono text-sm text-white placeholder-slate-700"
                            placeholder="Type a command..."
                            value={terminalInput}
                            onChange={(e) => setTerminalInput(e.target.value)}
                        />
                        <div className="flex items-center gap-4 ml-4">
                            <span className="text-[10px] text-slate-600 font-mono">UTF-8</span>
                            <span className="text-[10px] text-slate-600 font-mono">Row 24, Col 12</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Floating Tooltip for pod health */}
            <div className="fixed bottom-24 right-6 pointer-events-none">
                <div className="bg-primary shadow-xl shadow-primary/20 rounded-full px-4 py-2 flex items-center gap-3 text-white pointer-events-auto">
                    <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                    <span className="text-xs font-bold tracking-tight">AUTO-FOLLOW LOGS ENABLED</span>
                </div>
            </div>
            <Footer />
        </div>
    )
}
