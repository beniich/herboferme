'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    TrendingUp, ArrowUpRight, ArrowDownRight, Activity,
    BarChart3, PieChart as PieIcon, Download, Calendar,
    Inbox, Clock, Zap, AlertCircle
} from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Colors for charts
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const PRIORITY_COLORS: Record<string, string> = {
    urgent: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e'
};

interface ChartItem {
    name: string;
    value: number;
}

interface TrendItem {
    _id: string;
    count: number;
}

interface PriorityItem {
    _id: string;
    count: number;
}

export default function AnalyticsPage() {
    const { data: stats, isLoading, error } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const res = await api.get('/dashboard');
            return res;
        }
    });

    if (isLoading) {
        return (
            <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50 dark:bg-[#0a0a14]">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-slate-50 dark:bg-[#0a0a14] gap-4">
                <p className="text-red-500 font-bold italic uppercase tracking-widest text-xs">Erreur de chargement analytique</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20"
                >
                    R  essayer
                </button>
            </div>
        );
    }

    // Process data for charts
    const trendData: TrendItem[] = stats?.trends || [];
    const categoryData: ChartItem[] = stats?.byCategory?.map((c: { _id: string; count: number }) => ({ name: c._id, value: c.count })) || [];
    const activeCount = (stats?.byStatus?.['soumise'] || 0) + (stats?.byStatus?.['en_cours'] || 0);

    return (
        <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0a0a14] font-display overflow-x-hidden">
            <main className="max-w-[1600px] mx-auto p-4 lg:p-10 space-y-10 animate-in fade-in duration-700">

                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">
                            <Activity className="w-3 h-3" />
                            Exploration Analytique
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">
                            Operational <span className="text-primary underline decoration-primary/20 underline-offset-[10px]">Intelligence</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-4 font-medium max-w-xl">
                            Analyse en temps r  el de la performance des services municipaux et de la r  activit   des   quipes d'intervention.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <button className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-primary text-white shadow-lg shadow-primary/20">30 Jours</button>
                            <button className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-slate-300">90 Jours</button>
                        </div>
                        <button className="h-12 px-6 bg-slate-900 dark:bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3">
                            <Download className="w-4 h-4" />
                            Export Data
                        </button>
                    </div>
                </div>

                {/* Primary Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total R  clamations"
                        value={stats?.total || 0}
                        trend="+12.4%"
                        isUp={true}
                        icon={<Inbox className="w-5 h-5" />}
                        color="blue"
                    />
                    <StatCard
                        title="Temps de R  ponse"
                        value="42m"
                        trend="-5.2%"
                        isUp={false}
                        icon={<Clock className="w-5 h-5" />}
                        color="orange"
                    />
                    <StatCard
                        title="Tickets Actifs"
                        value={activeCount}
                        trend="+8.1%"
                        isUp={true}
                        icon={<Zap className="w-5 h-5" />}
                        color="emerald"
                    />
                    <StatCard
                        title="Score Satisfaction"
                        value="4.8/5"
                        trend="+2.1%"
                        isUp={true}
                        icon={<TrendingUp className="w-5 h-5" />}
                        color="purple"
                    />
                </div>

                {/* Main Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Trend Line Chart */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none min-h-[450px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-[200px] -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700"></div>

                        <div className="flex items-center justify-between mb-10 relative z-10">
                            <div>
                                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-primary" />
                                    Tendance de Flux (Volum  trie)
                                </h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Analyse chronologique des soumissions de tickets</p>
                            </div>
                        </div>

                        <div className="h-[300px] w-full relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="_id"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }}
                                        dy={10}
                                        tickFormatter={(val) => val.split('-').slice(1).join('/')}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#0f172a',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontSize: '11px',
                                            color: '#fff',
                                            padding: '12px'
                                        }}
                                        itemStyle={{ color: '#fff', fontWeight: 900 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#3b82f6"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorCount)"
                                        animationDuration={2000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Donut Chart Distribution */}
                    <div className="bg-slate-900 rounded-[32px] border border-slate-800 p-8 shadow-xl text-white relative flex flex-col justify-between overflow-hidden">
                        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-primary/10 blur-[80px]"></div>

                        <div className="relative z-10">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/50 flex items-center gap-2">
                                <PieIcon className="w-4 h-4 text-primary" />
                                Top Cat  gories d'incidents
                            </h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">R  partition des charges par domaine</p>
                        </div>

                        <div className="h-[250px] w-full relative z-10 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={8}
                                        dataKey="value"
                                        animationDuration={1500}
                                    >
                                        {categoryData.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-black">{stats?.total || 0}</span>
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Total</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            {categoryData.slice(0, 4).map((item, i) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <div className="size-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase tracking-tighter text-white/40">{item.name}</span>
                                        <span className="text-xs font-bold">{item.value} <span className="text-[9px] text-slate-500 italic opacity-50">pts</span></span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Row - Team Performance & Secondary Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">

                    {/* Status Breakdown */}
                    <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-8 shadow-lg shadow-slate-200/50 dark:shadow-none">
                        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-8">Status Pulse</h3>
                        <div className="space-y-6">
                            {Object.entries(stats?.byStatus || { /* Intentionally empty */ }).map(([key, value]) => (
                                <div key={key} className="space-y-2 group">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-primary transition-colors">{key.replace('_', ' ')}</span>
                                        <span className="text-sm font-black italic">{Number(value)}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${(Number(value) / stats.total) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Priority Mix */}
                    <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-8 shadow-lg shadow-slate-200/50 dark:shadow-none">
                        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-8">Matrice de Priorit  </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {stats?.byPriority?.map((p: PriorityItem) => (
                                <div key={p._id} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 group hover:border-primary/20 transition-all">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="size-2 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[p._id] || '#ccc' }}></div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{p._id}</span>
                                    </div>
                                    <div className="text-2xl font-black italic group-hover:scale-110 transition-transform origin-left">{p.count}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Live Efficiency Badge */}
                    <div className="bg-gradient-to-br from-primary to-blue-700 rounded-[32px] p-8 text-white shadow-2xl shadow-primary/30 flex flex-col justify-between group overflow-hidden relative">
                        <div className="absolute -top-10 -right-10 size-40 bg-white/10 rounded-full blur-[40px] group-hover:scale-150 transition-transform duration-1000"></div>

                        <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Efficacit   Live</span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-green-400 text-[8px] font-black text-slate-900 uppercase">Excellent</span>
                        </div>

                        <div className="relative z-10 py-6">
                            <div className="text-6xl font-black tracking-tighter italic leading-none">94.8<span className="text-2xl opacity-50 ml-1">%</span></div>
                            <p className="text-[10px] font-bold uppercase tracking-widest mt-2 ml-1 opacity-70">Taux de r  solution imm  diate</p>
                        </div>

                        <div className="relative z-10 flex items-center gap-3">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="size-6 rounded-full border-2 border-primary bg-slate-200 overflow-hidden">
                                        <img src={`https://ui-avatars.com/api/?name=Team+${i}&background=random`} alt="Team" />
                                    </div>
                                ))}
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-80">+14   quipes actives</span>
                        </div>
                    </div>
                </div>

            </main>

            <style jsx global>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-in {
                    animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: string | number;
    trend: string;
    isUp: boolean;
    icon: React.ReactNode;
    color: 'blue' | 'orange' | 'emerald' | 'purple';
}

function StatCard({ title, value, trend, isUp, icon, color }: StatCardProps) {
    const colors = {
        blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/50',
        orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200/50 dark:border-orange-900/50',
        emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/50',
        purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200/50 dark:border-purple-900/50'
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-lg shadow-slate-200/50 dark:shadow-none group hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl ${colors[color]} border transition-transform group-hover:scale-110`}>
                    {icon}
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${isUp ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                    {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {trend}
                </div>
            </div>
            <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
                <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-none">{value}</h4>
            </div>
        </div>
    );
}
