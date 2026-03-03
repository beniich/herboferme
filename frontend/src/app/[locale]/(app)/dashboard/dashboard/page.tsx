
import {
    BarChart,
    Activity,
    Clock,
    CheckCircle,
    AlertTriangle,
    Download,
    Calendar,
    MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
// import { KPICard } from '@/components/ui/kpi-card'; // To be created
// import { ComplaintsTable } from '@/components/complaints/ComplaintsTable'; // To be created

export default function OperationsDashboard() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Operations Dashboard</h2>
                    <p className="text-slate-500 text-sm">Real-time intervention monitoring for Rabat-Sal   sector.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 flex items-center gap-2 text-sm font-medium">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        Last 24 Hours
                    </div>
                    <Button className="font-bold flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Total Complaints */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                        <BarChart className="text-slate-400 w-6 h-6" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                    </div>
                    <p className="text-3xl font-black">1,428</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium"><span className="text-emerald-500">+12%</span> from last week</p>
                </div>

                {/* New Complaints */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border-l-4 border-l-primary border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                        <Activity className="text-primary w-6 h-6" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">New</span>
                    </div>
                    <p className="text-3xl font-black">156</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Active today</p>
                </div>

                {/* In Progress */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border-l-4 border-l-amber-500 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                        <Clock className="text-amber-500 w-6 h-6" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">In Progress</span>
                    </div>
                    <p className="text-3xl font-black">412</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Being serviced</p>
                </div>

                {/* Resolved */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border-l-4 border-l-emerald-500 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                        <CheckCircle className="text-emerald-500 w-6 h-6" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Resolved</span>
                    </div>
                    <p className="text-3xl font-black">842</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Successfully closed</p>
                </div>

                {/* Urgent */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border-l-4 border-l-red-500 border border-slate-200 dark:border-slate-800 shadow-sm shadow-red-100">
                    <div className="flex items-center justify-between mb-3">
                        <AlertTriangle className="text-red-500 animate-pulse w-6 h-6" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Urgent</span>
                    </div>
                    <p className="text-3xl font-black text-red-500">18</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">High priority</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Recent Complaints List (Placeholder) */}
                <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[500px]">
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                        <h3 className="font-bold text-lg">Recent Complaints</h3>
                        <Button variant="ghost" size="sm" className="text-primary font-bold hover:underline">View All List</Button>
                    </div>
                    <div className="flex-1 flex items-center justify-center text-slate-400">
                        <p>Complaints Table Component Placeholder</p>
                    </div>
                </div>

                {/* Live Feed (Placeholder) */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col h-[500px]">
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-800/20">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                        </span>
                        <h3 className="font-bold text-lg">Live Feed</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* Feed Item Mock */}
                        <div className="flex gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer border-l-2 border-primary">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-semibold leading-snug">New complaint reported</p>
                                <p className="text-xs text-slate-500">Hydrant leak reported in Sal   Marina sector by citizen ID #882.</p>
                                <p className="text-[10px] font-bold text-primary uppercase">Just Now</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
