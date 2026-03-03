'use client'

import { DashboardHeader } from '@/components/dashboard-v2/DashboardHeader'
import { useState } from 'react'
import { Plus, Filter, Search } from 'lucide-react'

export default function MaterialWorkflowPage() {
    const [searchQuery, setSearchQuery] = useState('')

    return (
        <>
            {/* Header Toolbar */}
            <DashboardHeader
                title="Material Workflow Manager"
                description="Kanban-style request tracking system"
                actions={
                    <>
                        <div className="relative w-full max-w-xl hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <input
                                type="text"
                                className="w-full bg-slate-100 dark:bg-[#1a2233] border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                                placeholder="Search requests, materials, or personnel..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-[#1a2233] rounded-lg transition-all">
                            <Filter className="h-5 w-5" />
                        </button>
                        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800"></div>
                        <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all">
                            <Plus className="h-4 w-4" />
                            New Request
                        </button>
                    </>
                }
            />

            {/* Kanban Board Container */}
            <div className="flex-1 overflow-x-auto p-8 bg-[#f6f6f8] dark:bg-[#101622] custom-scrollbar h-[calc(100vh-64px)]">
                <div className="flex gap-6 h-full min-w-[1200px]">
                    {/* Column: Pending Review */}
                    <div className="flex-1 flex flex-col min-w-[300px]">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-700 dark:text-slate-300">Pending Review</h3>
                                <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs px-2 py-0.5 rounded-full">
                                    3
                                </span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {/* Card 1 */}
                            <div className="bg-white dark:bg-[#1a2233] rounded-xl p-4 shadow-sm border-l-4 border-amber-500 hover:shadow-md transition-all cursor-grab active:cursor-grabbing">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                                        REQ-88421
                                    </span>
                                    <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-bold uppercase">
                                        High Priority
                                    </span>
                                </div>
                                <h4 className="font-semibold text-sm mb-1 text-slate-900 dark:text-white">Foundational Reinforcement</h4>
                                <p className="text-xs text-slate-500 mb-4">Requested by: Robert Chen</p>
                                <div className="bg-[#f6f6f8] dark:bg-[#101622]/50 rounded-lg p-3 mb-4">
                                    <div className="flex justify-between text-[11px] mb-2">
                                        <span className="text-slate-400">Stock Impact Summary</span>
                                        <span className="text-red-400 font-bold">-12 Items</span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center text-[10px] text-slate-700 dark:text-slate-300">
                                            <span>Steel Rebar 12mm</span>
                                            <span className="font-medium">10 / 450 Units</span>
                                        </div>
                                        <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className="bg-primary h-full" style={{ width: '2%' }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-2 mt-4">
                                    <button className="flex-1 text-[11px] font-bold py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                        Details
                                    </button>
                                    <button className="flex-1 text-[11px] font-bold py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all flex items-center justify-center gap-1">
                                        Approve <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                    </button>
                                </div>
                            </div>

                            {/* Card 2 */}
                            <div className="bg-white dark:bg-[#1a2233] rounded-xl p-4 shadow-sm border-l-4 border-transparent hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                                        REQ-88430
                                    </span>
                                    <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded font-bold uppercase">
                                        Standard
                                    </span>
                                </div>
                                <h4 className="font-semibold text-sm mb-1 text-slate-900 dark:text-white">Interior Finishing Kit</h4>
                                <p className="text-xs text-slate-500 mb-4">Requested by: Sarah J.</p>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex -space-x-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-[#1a2233] flex items-center justify-center text-[8px] font-bold text-slate-600 dark:text-slate-400">
                                            P
                                        </div>
                                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-[#1a2233] flex items-center justify-center text-[8px] font-bold text-slate-600 dark:text-slate-400">
                                            S
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-slate-500">+4 more items</span>
                                </div>
                                <button className="w-full text-[11px] font-bold py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all">
                                    Review Impact
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Column: Approved / Picking */}
                    <div className="flex-1 flex flex-col min-w-[300px]">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-700 dark:text-slate-300">Approved / Picking</h3>
                                <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full italic">
                                    In Progress
                                </span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-white dark:bg-[#1a2233] rounded-xl p-4 shadow-sm border-l-4 border-primary hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                                        REQ-88395
                                    </span>
                                    <span className="flex items-center gap-1 text-[10px] text-primary font-bold">
                                        <span className="material-symbols-outlined text-[12px]">location_on</span> Bin A-12, B-04
                                    </span>
                                </div>
                                <h4 className="font-semibold text-sm mb-1 text-slate-900 dark:text-white">Electrical Component Batch</h4>
                                <div className="mb-4">
                                    <div className="flex justify-between text-[10px] mb-1">
                                        <span className="text-slate-500">Picking Progress</span>
                                        <span className="text-primary font-bold">65%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="bg-primary h-full rounded-full" style={{ width: '65%' }}></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-600 dark:text-slate-400">
                                            M
                                        </div>
                                        <span className="text-[10px] text-slate-500">Assigned: Mike T.</span>
                                    </div>
                                    <button className="material-symbols-outlined text-slate-400 hover:text-primary transition-colors text-lg">
                                        check_circle_outline
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column: Ready for Pickup */}
                    <div className="flex-1 flex flex-col min-w-[300px]">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-700 dark:text-slate-300">Ready for Pickup</h3>
                                <span className="bg-green-500/20 text-green-500 text-xs px-2 py-0.5 rounded-full">2</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-white dark:bg-[#1a2233] rounded-xl p-4 shadow-sm border-l-4 border-green-500 hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                                        REQ-88310
                                    </span>
                                    <span className="text-[10px] text-green-500 font-bold uppercase">Staging Area 1</span>
                                </div>
                                <h4 className="font-semibold text-sm mb-1 text-slate-900 dark:text-white">HVAC Maintenance Spares</h4>
                                <p className="text-xs text-slate-500 mb-4">Ready since 08:30 AM</p>
                                <div className="flex items-center justify-center p-4 bg-slate-100 dark:bg-[#101622] rounded-lg mb-4 border border-dashed border-slate-300 dark:border-slate-800">
                                    <span className="material-symbols-outlined text-4xl text-slate-400">qr_code_2</span>
                                </div>
                                <button className="w-full text-[11px] font-bold py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-all flex items-center justify-center gap-1">
                                    <span className="material-symbols-outlined text-sm">local_shipping</span> Confirm Dispatch
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Column: Delivered */}
                    <div className="flex-1 flex flex-col min-w-[300px]">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-slate-400">
                                <h3 className="font-bold">Delivered</h3>
                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full">
                                    12
                                </span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-white/50 dark:bg-[#1a2233]/40 rounded-xl p-4 border border-slate-200 dark:border-slate-800 opacity-60">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                                        REQ-88240
                                    </span>
                                    <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                                </div>
                                <h4 className="font-semibold text-sm mb-1 line-through text-slate-400">
                                    Lighting Fixtures Lot
                                </h4>
                                <p className="text-[10px] text-slate-400">Delivered to Site B     2h ago</p>
                            </div>
                            <div className="bg-white/50 dark:bg-[#1a2233]/40 rounded-xl p-4 border border-slate-200 dark:border-slate-800 opacity-60">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                                        REQ-88235
                                    </span>
                                    <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                                </div>
                                <h4 className="font-semibold text-sm mb-1 line-through text-slate-400">PVC Piping Bundle</h4>
                                <p className="text-[10px] text-slate-400">Delivered to Site A     4h ago</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
