'use client';

import { StatusIndicator } from '@/components/shared/StatusIndicator';
import { Activity, Zap, Share } from 'lucide-react';

export default function APMTracesPage() {
    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            {/* Trace Hero Summary */}
            <div className="dashboard-card p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <StatusIndicator status="healthy" label="Success" />
                            <h1 className="text-white text-2xl font-mono font-bold">tr-8821-x9</h1>
                            <button className="text-slate-500 hover:text-slate-300">    </button>
                        </div>
                        <p className="text-slate-400 text-sm">
                            Request to <code className="text-primary bg-primary/10 px-1 rounded">/api/v1/orders/checkout</code> initiated by user-882
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="dashboard-card p-4 min-w-[140px]">
                            <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">Duration</p>
                            <p className="text-white text-xl font-bold">452ms</p>
                        </div>
                        <div className="dashboard-card p-4 min-w-[140px]">
                            <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">Spans</p>
                            <p className="text-white text-xl font-bold">12</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button className="bg-primary hover:bg-primary/90 text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2">
                                <Share className="w-4 h-4" /> Export Trace
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="dashboard-card overflow-hidden">
                <div className="sticky top-0 z-20 bg-slate-800 border-b border-slate-700 flex h-10 items-center">
                    <div className="w-[300px] px-4 border-r border-slate-700 text-[10px] font-bold text-slate-500 uppercase flex items-center">
                        Service & Operation
                    </div>
                    <div className="flex-1 relative h-full flex items-center px-4">
                        <div className="w-full flex justify-between text-[10px] font-mono text-slate-500">
                            <span>0ms</span>
                            <span>100ms</span>
                            <span>200ms</span>
                            <span>300ms</span>
                            <span>400ms</span>
                            <span>500ms</span>
                        </div>
                    </div>
                </div>

                {/* Spans List */}
                <div className="flex flex-col">
                    {/* Gateway Span */}
                    <div className="flex group cursor-pointer border-b border-slate-800/50 hover:bg-slate-800/30">
                        <div className="w-[300px] px-4 py-3 border-r border-slate-700 flex items-center gap-2">
                            <span className="text-slate-600 text-sm">   </span>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-indigo-400">Gateway</span>
                                <span className="text-[10px] font-mono text-slate-400">HTTP POST /checkout</span>
                            </div>
                        </div>
                        <div className="flex-1 p-4 relative flex items-center">
                            <div className="h-5 bg-indigo-500/30 border border-indigo-500/50 rounded-sm relative z-10 w-full flex items-center px-2">
                                <span className="text-[9px] font-bold text-indigo-200">452ms</span>
                            </div>
                        </div>
                    </div>

                    {/* Auth Service Span */}
                    <div className="flex group cursor-pointer border-b border-slate-800/50 hover:bg-slate-800/30">
                        <div className="w-[300px] px-4 py-3 border-r border-slate-700 flex items-center gap-2 pl-8">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-purple-400">Auth-Service</span>
                                <span className="text-[10px] font-mono text-slate-400">validate-token</span>
                            </div>
                        </div>
                        <div className="flex-1 p-4 relative flex items-center">
                            <div className="h-5 bg-purple-500/30 border border-purple-500/50 rounded-sm relative z-10 w-[10%] ml-[2%] flex items-center px-2">
                                <span className="text-[9px] font-bold text-purple-200">45ms</span>
                            </div>
                        </div>
                    </div>

                    {/* Order Service Span - Critical Path */}
                    <div className="flex group cursor-pointer border-b border-slate-800/50 bg-primary/5 hover:bg-primary/10">
                        <div className="w-[300px] px-4 py-3 border-r border-slate-700 flex items-center gap-2 pl-8">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary glow-primary mr-1"></div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-emerald-400">Order-Service</span>
                                <span className="text-[10px] font-mono text-slate-200">ProcessOrder</span>
                            </div>
                        </div>
                        <div className="flex-1 p-4 relative flex items-center">
                            <div className="h-5 bg-primary/40 border-2 border-primary rounded-sm relative z-10 w-[70%] ml-[12%] flex items-center justify-between px-2">
                                <span className="text-[9px] font-bold text-white">320ms (Critical Path)</span>
                                <Zap className="w-3 h-3 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Database Span */}
                    <div className="flex group cursor-pointer border-b border-slate-800/50 hover:bg-slate-800/30">
                        <div className="w-[300px] px-4 py-3 border-r border-slate-700 flex items-center gap-2 pl-12">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-orange-400">Postgres-DB</span>
                                <span className="text-[10px] font-mono text-slate-400">SELECT orders...</span>
                            </div>
                        </div>
                        <div className="flex-1 p-4 relative flex items-center">
                            <div className="h-5 bg-orange-500/30 border border-orange-500/50 rounded-sm relative z-10 w-[18%] ml-[30%] flex items-center px-2">
                                <span className="text-[9px] font-bold text-orange-200">80ms</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Span Details Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="dashboard-card p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        Span Details
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Operation</p>
                            <h4 className="text-lg font-bold">Order-Service: ProcessOrder</h4>
                            <p className="text-xs font-mono text-slate-400 mt-1">Span ID: sp-f291-a1</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-800 p-3 rounded-lg">
                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Start Time</p>
                                <p className="text-sm font-mono">14:02:11.512</p>
                            </div>
                            <div className="bg-slate-800 p-3 rounded-lg">
                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Duration</p>
                                <p className="text-sm font-mono">320.45 ms</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-card p-6">
                    <h3 className="font-bold mb-4">Tags & Metadata</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs bg-slate-800 p-2 rounded">
                            <span className="text-slate-400 font-mono">http.method</span>
                            <span className="text-emerald-400 font-mono">&quot;POST&quot;</span>
                        </div>
                        <div className="flex justify-between items-center text-xs bg-slate-800 p-2 rounded">
                            <span className="text-slate-400 font-mono">http.status_code</span>
                            <span className="text-white font-mono">200</span>
                        </div>
                        <div className="flex justify-between items-center text-xs bg-slate-800 p-2 rounded">
                            <span className="text-slate-400 font-mono">instance.id</span>
                            <span className="text-white font-mono">&quot;pod-order-v2-xf&quot;</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Legend */}
            <div className="dashboard-card p-4 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Gateway
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span> Auth
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Order
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span> Postgres
                    </span>
                </div>
                <span>v1.24.0-pro</span>
            </div>
        </div>
    );
}
