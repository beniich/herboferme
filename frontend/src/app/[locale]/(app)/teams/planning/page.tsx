'use client';

import { useState } from 'react';

export default function PlanningPage() {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased h-[calc(100vh-2rem)] flex flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
            {/* Top Navigation Bar */}
            <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 shrink-0">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary text-white p-1.5 rounded-lg">
                            <span className="material-symbols-outlined block">event_busy</span>
                        </div>
                        <h2 className="text-lg font-bold tracking-tight">Intervention Manager</h2>
                    </div>
                    <nav className="hidden lg:flex items-center gap-6">
                        <a className="text-slate-500 hover:text-primary dark:text-slate-400 font-medium text-sm transition-colors" href="#">Dashboard</a>
                        <a className="text-primary font-semibold text-sm" href="#">Calendar</a>
                        <a className="text-slate-500 hover:text-primary dark:text-slate-400 font-medium text-sm transition-colors" href="#">Teams</a>
                        <a className="text-slate-500 hover:text-primary dark:text-slate-400 font-medium text-sm transition-colors" href="#">Reports</a>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                        <input className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400" placeholder="Search interventions..." type="text" />
                    </div>
                    <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all">
                        <span className="material-symbols-outlined text-lg">add</span>
                        New Intervention
                    </button>
                    <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden border border-slate-200 dark:border-slate-700">
                        <img
                            alt="Profile"
                            className="w-full h-full object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2_JnH8CagcnsfxVN_Sr911H_RgpyO2X5Nhi1o5gtk7cwTOuIAo2-t9U5NDvEHb4SU8l1xIxtZkqsKZ3Xwo2yOPvLVQ1DA8XqBlm7TrfnlrLINxdgucWC3lbLLBYw6z6lVRKqWkmvNCi0W-CdFVl-cB0dMvxBxx1pgiCe4kZeBQe-ZGn9zWi-B0MJXRYpLFDMN3epqlAfeHgx_l64x-l-poS-nSPRvsxYAT5vekg_REnOxLd4PWTbZqgEuDIscZpHUCBfPy9Mxxp_3"
                        />
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Filters */}
                <aside className="w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto flex flex-col shrink-0">
                    <div className="p-5 flex flex-col gap-8">
                        {/* Mini Calendar */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold">October 2023</h3>
                                <div className="flex gap-1">
                                    <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500"><span className="material-symbols-outlined text-base">chevron_left</span></button>
                                    <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500"><span className="material-symbols-outlined text-base">chevron_right</span></button>
                                </div>
                            </div>
                            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 mb-2">
                                <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                            </div>
                            <div className="grid grid-cols-7 text-center text-xs gap-y-1">
                                {/* Simplified mini grid */}
                                <span className="py-1 text-slate-300">27</span><span className="py-1 text-slate-300">28</span><span className="py-1 text-slate-300">29</span><span className="py-1 text-slate-300">30</span>
                                <span className="py-1 font-medium">1</span><span className="py-1 font-medium">2</span><span className="py-1 font-medium">3</span>
                                <span className="py-1 font-medium">4</span><span className="py-1 bg-primary text-white rounded-full font-bold">5</span><span className="py-1 font-medium">6</span>
                                <span className="py-1 font-medium">7</span><span className="py-1 font-medium">8</span><span className="py-1 font-medium">9</span><span className="py-1 font-medium">10</span>
                                <span className="py-1 font-medium">11</span><span className="py-1 font-medium">12</span><span className="py-1 font-medium">13</span><span className="py-1 font-medium">14</span>
                            </div>
                        </div>

                        {/* Team Filters */}
                        <div className="flex flex-col gap-3">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Team Types</h3>
                            <div className="space-y-2">
                                <label className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors group">
                                    <input defaultChecked className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4" type="checkbox" />
                                    <span className="material-symbols-outlined text-water text-lg">water_drop</span>
                                    <span className="text-sm font-medium">Water Teams</span>
                                </label>
                                <label className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors group">
                                    <input defaultChecked className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4" type="checkbox" />
                                    <span className="material-symbols-outlined text-electricity text-lg">bolt</span>
                                    <span className="text-sm font-medium">Electricity Teams</span>
                                </label>
                                <label className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors group">
                                    <input defaultChecked className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4" type="checkbox" />
                                    <span className="material-symbols-outlined text-gas text-lg">local_fire_department</span>
                                    <span className="text-sm font-medium">Gas Teams</span>
                                </label>
                            </div>
                        </div>

                        {/* Unscheduled Interventions */}
                        <div className="flex flex-col gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Unscheduled</h3>
                                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold">4 PENDING</span>
                            </div>
                            <div className="space-y-3">
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg cursor-move hover:border-primary transition-all group">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] font-bold text-slate-400">#INT-8291</span>
                                        <span className="bg-gas/20 text-gas text-[9px] px-1.5 py-0.5 rounded font-bold">GAS</span>
                                    </div>
                                    <p className="text-xs font-semibold leading-tight mb-2">Main Valve Leak - Downtown</p>
                                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                        <span className="material-symbols-outlined text-xs">priority_high</span> High Priority
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg cursor-move hover:border-primary transition-all group">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] font-bold text-slate-400">#INT-8295</span>
                                        <span className="bg-water/20 text-water text-[9px] px-1.5 py-0.5 rounded font-bold">WATER</span>
                                    </div>
                                    <p className="text-xs font-semibold leading-tight mb-2">Residential Pump Failure</p>
                                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                        <span className="material-symbols-outlined text-xs">access_time</span> 2h Est.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto p-5 border-t border-slate-100 dark:border-slate-800">
                        <button className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-sm font-bold rounded-lg hover:bg-slate-200 transition-colors">
                            Optimize Schedule
                        </button>
                    </div>
                </aside>

                {/* Main Calendar View */}
                <main className="flex-1 flex flex-col bg-background-light dark:bg-background-dark overflow-hidden">
                    {/* Calendar Header/Toolbar */}
                    <div className="bg-white dark:bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-4">
                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                <button className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded shadow-sm transition-all"><span className="material-symbols-outlined text-lg">chevron_left</span></button>
                                <button className="px-4 py-1.5 text-sm font-bold bg-white dark:bg-slate-700 rounded shadow-sm">Today</button>
                                <button className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded shadow-sm transition-all"><span className="material-symbols-outlined text-lg">chevron_right</span></button>
                            </div>
                            <h1 className="text-xl font-bold">October 2     8, 2023</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                <button className="px-4 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-all">Month</button>
                                <button className="px-4 py-1.5 text-sm font-bold bg-white dark:bg-slate-700 rounded shadow-sm text-primary">Week</button>
                                <button className="px-4 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-all">Day</button>
                                <button className="px-4 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-all">List</button>
                            </div>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="flex-1 overflow-auto">
                        <div className="grid grid-cols-7 bg-slate-200 dark:bg-slate-800 gap-[1px]">
                            {/* Weekday Headers */}
                            <div className="bg-slate-50 dark:bg-slate-900 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Monday 2</div>
                            <div className="bg-slate-50 dark:bg-slate-900 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Tuesday 3</div>
                            <div className="bg-slate-50 dark:bg-slate-900 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Wednesday 4</div>
                            <div className="bg-primary/5 dark:bg-primary/10 py-3 text-center text-xs font-bold text-primary uppercase tracking-widest border-b-2 border-primary">Thursday 5</div>
                            <div className="bg-slate-50 dark:bg-slate-900 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Friday 6</div>
                            <div className="bg-slate-50 dark:bg-slate-900 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Saturday 7</div>
                            <div className="bg-slate-50 dark:bg-slate-900 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Sunday 8</div>

                            {/* Row 1: Time blocks / Events */}
                            {/* Mon */}
                            <div className="min-h-[120px] bg-white dark:bg-slate-900 p-2 space-y-2">
                                <div className="hover:-translate-y-px hover:shadow-md bg-water/10 border-l-4 border-water p-2 rounded-r-lg cursor-pointer transition-all">
                                    <p className="text-[10px] font-bold text-water uppercase">09:00 - 11:30</p>
                                    <p className="text-xs font-bold truncate">Pipe Repair: Lincoln St.</p>
                                    <p className="text-[10px] text-slate-500">Team Alpha</p>
                                </div>
                            </div>
                            {/* Tue */}
                            <div className="min-h-[120px] bg-white dark:bg-slate-900 p-2 space-y-2">
                                <div className="hover:-translate-y-px hover:shadow-md bg-electricity/10 border-l-4 border-electricity p-2 rounded-r-lg cursor-pointer transition-all">
                                    <p className="text-[10px] font-bold text-electricity uppercase">08:00 - 10:00</p>
                                    <p className="text-xs font-bold truncate">Grid Maintenance</p>
                                    <p className="text-[10px] text-slate-500">Team Volt</p>
                                </div>
                                <div className="hover:-translate-y-px hover:shadow-md bg-water/10 border-l-4 border-water p-2 rounded-r-lg cursor-pointer transition-all">
                                    <p className="text-[10px] font-bold text-water uppercase">14:00 - 16:30</p>
                                    <p className="text-xs font-bold truncate">Meter Swap: Central Park</p>
                                    <p className="text-[10px] text-slate-500">Team Beta</p>
                                </div>
                            </div>
                            {/* Wed */}
                            <div className="min-h-[120px] bg-white dark:bg-slate-900 p-2 space-y-2">
                                <div className="hover:-translate-y-px hover:shadow-md bg-gas/10 border-l-4 border-gas p-2 rounded-r-lg cursor-pointer transition-all">
                                    <p className="text-[10px] font-bold text-gas uppercase">10:30 - 12:00</p>
                                    <p className="text-xs font-bold truncate">Safety Inspection</p>
                                    <p className="text-[10px] text-slate-500">Team Flame</p>
                                </div>
                            </div>
                            {/* Thu (TODAY) */}
                            <div className="min-h-[120px] bg-primary/5 dark:bg-primary/5 p-2 space-y-2">
                                <div className="hover:-translate-y-px hover:shadow-md bg-electricity/10 border-l-4 border-electricity p-2 rounded-r-lg cursor-pointer transition-all">
                                    <p className="text-[10px] font-bold text-electricity uppercase">09:00 - 12:00</p>
                                    <p className="text-xs font-bold truncate">Substation Service</p>
                                    <p className="text-[10px] text-slate-500">Team Volt</p>
                                </div>
                                <div className="bg-primary text-white p-2 rounded-lg cursor-pointer shadow-lg shadow-primary/20 scale-105 relative z-10 hover:-translate-y-px transition-all">
                                    <div className="flex justify-between items-start">
                                        <p className="text-[10px] font-bold opacity-80 uppercase">13:30 - 15:00</p>
                                        <span className="material-symbols-outlined text-sm">priority_high</span>
                                    </div>
                                    <p className="text-xs font-bold truncate">Emergency: Water Main</p>
                                    <p className="text-[10px] opacity-80">Team Alpha     West End</p>
                                </div>
                                <div className="hover:-translate-y-px hover:shadow-md bg-water/10 border-l-4 border-water p-2 rounded-r-lg cursor-pointer transition-all opacity-60">
                                    <p className="text-[10px] font-bold text-water uppercase">15:30 - 17:00</p>
                                    <p className="text-xs font-bold truncate">Routine Check-up</p>
                                </div>
                            </div>
                            {/* Fri */}
                            <div className="min-h-[120px] bg-white dark:bg-slate-900 p-2 space-y-2">
                                <div className="hover:-translate-y-px hover:shadow-md bg-gas/10 border-l-4 border-gas p-2 rounded-r-lg cursor-pointer transition-all">
                                    <p className="text-[10px] font-bold text-gas uppercase">11:00 - 14:00</p>
                                    <p className="text-xs font-bold truncate">Line Extension: South</p>
                                    <p className="text-[10px] text-slate-500">Team Flame</p>
                                </div>
                            </div>
                            {/* Sat */}
                            <div className="min-h-[120px] bg-slate-50 dark:bg-slate-900/50 p-2 space-y-2"></div>
                            {/* Sun */}
                            <div className="min-h-[120px] bg-slate-50 dark:bg-slate-900/50 p-2 space-y-2"></div>
                        </div>

                        {/* Next Row for Visual Structure */}
                        <div className="grid grid-cols-7 bg-slate-200 dark:bg-slate-800 gap-[1px] border-t border-slate-200 dark:border-slate-800">
                            <div className="min-h-[120px] bg-white dark:bg-slate-900 p-2"></div>
                            <div className="min-h-[120px] bg-white dark:bg-slate-900 p-2"></div>
                            <div className="min-h-[120px] bg-white dark:bg-slate-900 p-2"></div>
                            <div className="min-h-[120px] bg-primary/5 dark:bg-primary/5 p-2"></div>
                            <div className="min-h-[120px] bg-white dark:bg-slate-900 p-2"></div>
                            <div className="min-h-[120px] bg-slate-50 dark:bg-slate-900/50 p-2"></div>
                            <div className="min-h-[120px] bg-slate-50 dark:bg-slate-900/50 p-2"></div>
                        </div>
                    </div>

                    {/* Summary Bar */}
                    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between shrink-0">
                        <div className="flex gap-6 items-center">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-water"></span>
                                <span className="text-xs font-medium text-slate-500 uppercase">Water: 14h total</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-electricity"></span>
                                <span className="text-xs font-medium text-slate-500 uppercase">Electricity: 8h total</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-gas"></span>
                                <span className="text-xs font-medium text-slate-500 uppercase">Gas: 6h total</span>
                            </div>
                        </div>
                        <div className="text-sm font-medium text-slate-400">
                            Showing <span className="text-slate-900 dark:text-slate-100 font-bold">12</span> active interventions this week
                        </div>
                    </footer>
                </main>
            </div>

            {/* Quick View Overlay (Mocked as visible for presentation) */}
            <div className="fixed bottom-6 right-6 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-5 transform translate-y-0 transition-transform z-50">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded mb-1 inline-block">SELECTED INTERVENTION</span>
                        <h4 className="text-sm font-bold">#INT-8291 Details</h4>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined text-lg">close</span></button>
                </div>
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-slate-400">location_on</span>
                        <div>
                            <p className="text-xs font-bold">124 Downtown Ave, Metro City</p>
                            <p className="text-[10px] text-slate-500">Customer: John Harrison</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-slate-400">engineering</span>
                        <div>
                            <p className="text-xs font-bold">Team Alpha Assigned</p>
                            <p className="text-[10px] text-slate-500">Lead: Sarah Miller</p>
                        </div>
                    </div>
                    <div className="pt-4 flex gap-2">
                        <button className="flex-1 py-2 bg-primary text-white text-xs font-bold rounded-lg">Edit Details</button>
                        <button className="flex-1 py-2 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-lg">Reschedule</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
