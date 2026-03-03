'use client';

import {
    BarChart3,
    Bell,
    BookOpen,
    Calendar,
    CheckCircle2,
    Clock,
    LayoutDashboard,
    MoreVertical,
    Search,
    Settings,
    TrendingDown,
    TrendingUp,
    UserCircle,
    Users
} from 'lucide-react';
import { useState } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

const PERFORMANCE_DATA = [
    { name: 'Sep', score: 72 },
    { name: 'Oct', score: 75 },
    { name: 'Nov', score: 68 },
    { name: 'Dec', score: 82 },
    { name: 'Jan', score: 79 },
    { name: 'Feb', score: 84 },
];

const ATTENDANCE_DATA = [
    { name: 'Lun', value: 95 },
    { name: 'Mar', value: 92 },
    { name: 'Mer', value: 88 },
    { name: 'Jeu', value: 94 },
    { name: 'Ven', value: 90 },
];

export default function EducationDashboard() {
    const [activeTab, setActiveTab] = useState('dashboard');

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-200 font-sans">
            {/* Sidebar */}
            <aside className="w-72 border-r border-white/5 bg-brand-midnight/50 backdrop-blur-xl flex flex-col p-6 space-y-8">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 bg-brand-orange rounded-xl flex items-center justify-center shadow-lg shadow-brand-orange/20">
                        <BookOpen className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="font-display font-black text-xs uppercase tracking-widest text-white leading-none">EduCRM Pro</h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Management Suite</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1">
                    {[
                        { id: 'dashboard', icon: LayoutDashboard, label: 'Tableau de Bord' },
                        { id: 'students', icon: Users, label: '  l  ves' },
                        { id: 'teachers', icon: UserCircle, label: 'Professeurs' },
                        { id: 'schedule', icon: Calendar, label: 'Emploi du Temps' },
                        { id: 'grades', icon: BarChart3, label: 'Carnet de Notes' },
                        { id: 'settings', icon: Settings, label: 'Param  tres' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                activeTab === item.id
                                ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                            }`}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="glass-card rounded-2xl p-5 border-brand-orange/20">
                    <div className="text-[10px] font-black uppercase tracking-widest text-brand-orange mb-2">Support Premium</div>
                    <p className="text-[10px] text-slate-400 font-light leading-relaxed mb-4">Besoin d'aide pour la configuration de l'IA ?</p>
                    <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">Contacter Sam</button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-20 border-b border-white/5 px-10 flex items-center justify-between bg-brand-midnight/30 backdrop-blur-md">
                    <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/5 w-96">
                        <Search className="w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="RECHERCHER UN   L  VE, UN COURS..."
                            className="bg-transparent border-none outline-none text-[10px] font-black tracking-widest w-full placeholder:text-slate-600"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <Bell className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition-all" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-orange rounded-full"></span>
                        </div>
                        <div className="h-8 w-[1px] bg-white/5"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <div className="text-[10px] font-black uppercase text-white">Directeur Adjoint</div>
                                <div className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">Admin Principal</div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-brand-orange p-0.5">
                                <div className="w-full h-full rounded-full bg-slate-700 flex items-center justify-center text-xs font-black">AD</div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Grid */}
                <div className="p-10 space-y-10 overflow-y-auto">
                    <div className="flex items-end justify-between">
                        <div>
                            <h2 className="text-3xl font-display font-black uppercase italic tracking-tighter text-white">Synth  se Acad  mique</h2>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Secteur : Rabat-Centre     Lyc  e Excellence</p>
                        </div>
                        <div className="flex gap-4">
                            <button className="px-6 py-3 glass-card rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/5 transition-all">
                                <span className="material-symbols-outlined text-sm">download</span> Rapport PDF
                            </button>
                            <button className="px-6 py-3 bg-brand-orange rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-orange/20 hover:scale-105 transition-all outline-none">
                                Nouvel Examen
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { label: 'Performance Moyenne', value: '16.8/20', trend: '+2.5%', color: 'text-green-500', icon: TrendingUp },
                            { label: 'Taux de Pr  sence', value: '94.2%', trend: '-0.8%', color: 'text-red-500', icon: TrendingDown },
                            { label: 'Effectif Total', value: '1,248', trend: 'STABLE', color: 'text-slate-500', icon: Users },
                            { label: 'Alertes Critiques', value: '03', trend: 'ACTION REQUIS', color: 'text-brand-orange', icon: Bell },
                        ].map((stat, i) => (
                            <div key={i} className="glass-card rounded-[2rem] p-8 border border-white/5 hover:border-brand-orange/20 transition-all group">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</span>
                                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                </div>
                                <div className="text-3xl font-black italic mb-2 tracking-tighter">{stat.value}</div>
                                <div className={`text-[9px] font-black uppercase tracking-widest ${stat.color}`}>{stat.trend}</div>
                            </div>
                        ))}
                    </div>

                    {/* Charts & Tables */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Performance Chart */}
                        <div className="lg:col-span-2 glass-card rounded-[3rem] p-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black uppercase italic tracking-tighter">  volution des R  sultats</h3>
                                <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-[10px] font-black uppercase outline-none cursor-pointer">
                                    <option>S1 - 2024</option>
                                    <option>S2 - 2024</option>
                                </select>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={PERFORMANCE_DATA}>
                                        <defs>
                                            <linearGradient id="colorSatisfaction" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ee9b00" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#ee9b00" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
                                        />
                                        <YAxis hide />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            itemStyle={{ color: '#ee9b00' }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="satisfaction" 
                                            stroke="#ee9b00"
                                            strokeWidth={4}
                                            fillOpacity={1}
                                            fill="url(#colorScore)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="glass-card rounded-[3rem] p-10 space-y-8">
                            <h3 className="text-lg font-black uppercase italic tracking-tighter">  v  nements Proches</h3>
                            <div className="space-y-6">
                                {[
                                    { title: 'Examen de Math', time: 'Demain, 08:30', type: 'exam', icon: Clock },
                                    { title: 'R  union Parents', time: 'Jeu, 16:45', type: 'meeting', icon: Users },
                                    { title: 'Conseil Classe', time: '22 F  v, 14:00', type: 'admin', icon: CheckCircle2 },
                                ].map((event, i) => (
                                    <div key={i} className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-all">
                                            <event.icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-[10px] font-black uppercase text-white">{event.title}</div>
                                            <div className="text-[9px] font-black uppercase text-slate-600 mt-1 tracking-tighter">{event.time}</div>
                                        </div>
                                        <MoreVertical className="w-4 h-4 text-slate-700 cursor-pointer" />
                                    </div>
                                ))}
                                <button className="w-full py-4 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 transition-all">
                                    Voir Calendrier Complet
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Student List Table */}
                    <div className="glass-card rounded-[3rem] p-10">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black uppercase italic tracking-tighter">  l  ves sous Surveillance IA</h3>
                            <div className="text-[10px] text-brand-orange font-black uppercase tracking-widest cursor-pointer hover:underline">Algorithme Pr  dictif Actif</div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="pb-6 text-[9px] font-black uppercase tracking-widest text-slate-500">  l  ve</th>
                                        <th className="pb-6 text-[9px] font-black uppercase tracking-widest text-slate-500">Classe</th>
                                        <th className="pb-6 text-[9px] font-black uppercase tracking-widest text-slate-500">Moyenne</th>
                                        <th className="pb-6 text-[9px] font-black uppercase tracking-widest text-slate-500">Probabilit   D  crochage</th>
                                        <th className="pb-6 text-[9px] font-black uppercase tracking-widest text-slate-500">Derni  re Action</th>
                                        <th className="pb-6 text-[9px] font-black uppercase tracking-widest text-slate-500"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { name: 'Sarah Benckley', grade: '2nde B', score: '17.4', risk: '2%', status: 'Progressif', color: 'text-green-500' },
                                        { name: 'Marc Dupont', grade: '1  re C', score: '08.2', risk: '64%', status: 'Critique', color: 'text-brand-orange' },
                                        { name: 'Yassine Alami', grade: 'Termiale G', score: '12.5', risk: '15%', status: 'Stable', color: 'text-blue-500' },
                                        { name: 'Emma Wilson', grade: '3  me A', score: '14.8', risk: '5%', status: 'Stable', color: 'text-blue-500' },
                                    ].map((student, i) => (
                                        <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-all">
                                            <td className="py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black">{student.name.split(' ').map(n => n[0]).join('')}</div>
                                                    <span className="text-[10px] font-black uppercase">{student.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-6 text-[9px] font-black uppercase text-slate-500">{student.grade}</td>
                                            <td className="py-6 text-[10px] font-black uppercase italic">{student.score}</td>
                                            <td className="py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                        <div className={`h-full bg-current ${student.color}`} style={{ width: student.risk }}></div>
                                                    </div>
                                                    <span className={`text-[9px] font-black uppercase ${student.color}`}>{student.risk}</span>
                                                </div>
                                            </td>
                                            <td className="py-6">
                                                <span className={`px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-wider ${student.color}`}>
                                                    {student.status}
                                                </span>
                                            </td>
                                            <td className="py-6 text-right">
                                                <button className="p-2 hover:bg-white/5 rounded-lg transition-all">
                                                    <MoreVertical className="w-4 h-4 text-slate-600" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
