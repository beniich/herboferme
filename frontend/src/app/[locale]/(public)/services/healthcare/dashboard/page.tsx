'use client';

import {
    Activity,
    AlertTriangle,
    Bed,
    ChevronDown,
    ClipboardList,
    Clock,
    MoreVertical,
    Pill,
    ShieldAlert,
    Stethoscope,
    TrendingUp
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

const FLOW_DATA = [
    { time: '08:00', admissions: 12, capacity: 45 },
    { time: '10:00', admissions: 28, capacity: 45 },
    { time: '12:00', admissions: 35, capacity: 45 },
    { time: '14:00', admissions: 42, capacity: 45 },
    { time: '16:00', admissions: 38, capacity: 45 },
    { time: '18:00', admissions: 30, capacity: 45 },
    { time: '20:00', admissions: 18, capacity: 45 },
];

const DEPT_STATUS = [
    { name: 'Urgences', load: 92, color: '#ee9b00' },
    { name: 'Cardiologie', load: 75, color: '#06b6d4' },
    { name: 'P  diatrie', load: 88, color: '#06b6d4' },
    { name: 'Radiologie', load: 45, color: '#06b6d4' },
    { name: 'Chirurgie', load: 68, color: '#06b6d4' },
];

export default function HealthcareDashboard() {
    const [activeTab, setActiveTab] = useState('flow');

    return (
        <div className="flex min-h-screen bg-[#050b14] text-slate-200 font-sans">
            {/* Sidebar */}
            <aside className="w-72 border-r border-cyan-500/10 bg-[#08111d] flex flex-col p-6 space-y-8">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <Activity className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="font-display font-black text-xs uppercase tracking-widest text-white leading-none">Sant   Connect</h1>
                        <p className="text-[10px] text-cyan-500/50 font-bold uppercase tracking-widest mt-1">Medical OS</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1">
                    {[
                        { id: 'flow', icon: Activity, label: 'Flux de Patients' },
                        { id: 'beds', icon: Bed, label: 'Gestion des Lits' },
                        { id: 'staff', icon: Stethoscope, label: 'Personnel' },
                        { id: 'pharmacy', icon: Pill, label: 'Pharmacie' },
                        { id: 'analytics', icon: TrendingUp, label: 'Analytiques' },
                        { id: 'records', icon: ClipboardList, label: 'Dossiers' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                activeTab === item.id
                                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                                : 'text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/5'
                            }`}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="glass-card rounded-2xl p-5 border-cyan-500/20 bg-cyan-500/5">
                    <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-2">Statut Serveur HDS</div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Op  rationnel</span>
                    </div>
                    <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">Audit S  curit  </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-20 border-b border-white/5 px-10 flex items-center justify-between bg-[#08111d]/50 backdrop-blur-md">
                    <div className="flex items-center gap-4 text-slate-400">
                        <span className="text-[10px] font-black uppercase tracking-widest">H  pital :</span>
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 cursor-pointer hover:bg-white/10 transition-all text-white">
                            <span className="text-[10px] font-black uppercase">CHU Mohammed VI</span>
                            <ChevronDown className="w-3 h-3" />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 bg-brand-orange/10 px-4 py-2 rounded-xl border border-brand-orange/20 text-brand-orange">
                            <ShieldAlert className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Plan Blanc Actif</span>
                        </div>
                        <div className="h-8 w-[1px] bg-white/5"></div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-black">DR</div>
                            <div className="text-right hidden md:block">
                                <div className="text-[10px] font-black uppercase text-white">Dr. Sarah Mansouri</div>
                                <div className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">Chef de Service</div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-10 space-y-10 overflow-y-auto">
                    {/* Welcome & Quick Actions */}
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <h2 className="text-4xl font-display font-black uppercase italic tracking-tighter text-white">Moniteur des Urgences</h2>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[.3em]">Mise    jour : Temps R  el (0.8s lag)</p>
                        </div>
                        <div className="flex gap-4">
                            <button className="px-6 py-4 bg-cyan-500 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all outline-none">
                                Nouvelle Admission
                            </button>
                            <button className="px-6 py-4 glass-card rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                                Rapports L  gaux
                            </button>
                        </div>
                    </div>

                    {/* Stats Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Occupation Lits', value: '92%', detail: '414/450', color: 'text-brand-orange' },
                            { label: 'Attente Moyenne', value: '24m', detail: 'Urgences A', color: 'text-cyan-400' },
                            { label: 'Staff en Service', value: '118', detail: '85% Capacit  ', color: 'text-green-500' },
                            { label: 'Cas Critiques', value: '08', detail: 'R  animation', color: 'text-red-500' },
                        ].map((stat, i) => (
                            <div key={i} className="glass-card rounded-3xl p-8 border border-white/5 hover:border-cyan-500/20 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-all">
                                    <Activity className="w-16 h-16" />
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">{stat.label}</div>
                                <div className={`text-4xl font-black italic mb-2 tracking-tighter ${stat.color}`}>{stat.value}</div>
                                <div className="text-[9px] font-black uppercase tracking-widest text-slate-600">{stat.detail}</div>
                            </div>
                        ))}
                    </div>

                    {/* Chart & Dept Status */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Flow Chart */}
                        <div className="lg:col-span-2 glass-card rounded-[3rem] p-10 space-y-10">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black uppercase italic tracking-tighter">Flux d'Admission Journalier</h3>
                                    <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Comparaison vs Capacit   Maximale</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                                        <span className="text-[9px] font-black uppercase text-slate-400">Admissions</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-slate-800"></div>
                                        <span className="text-[9px] font-black uppercase text-slate-400">Seuil Alerte</span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={FLOW_DATA}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                                        <XAxis
                                            dataKey="time"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
                                        />
                                        <YAxis hide />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#08111d', border: '1px solid rgba(6,182,212,0.1)', borderRadius: '16px', fontSize: 10, fontWeight: 900 }}
                                            itemStyle={{ color: '#06b6d4' }}
                                        />
                                        <Area
                                            type="step"
                                            dataKey="admissions"
                                            stroke="#06b6d4"
                                            strokeWidth={3}
                                            fill="#06b6d4"
                                            fillOpacity={0.1}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="capacity"
                                            stroke="#ffffff10"
                                            strokeDasharray="5 5"
                                            fill="transparent"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Dept Load */}
                        <div className="glass-card rounded-[3rem] p-10 space-y-10">
                            <h3 className="text-xl font-black uppercase italic tracking-tighter">Charge par Service</h3>
                            <div className="space-y-8">
                                {DEPT_STATUS.map((dept, i) => (
                                    <div key={i} className="space-y-3">
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                            <span>{dept.name}</span>
                                            <span style={{ color: dept.color }}>{dept.load}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-1000"
                                                style={{ width: `${dept.load}%`, backgroundColor: dept.color }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full py-5 border border-cyan-500/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all">
                                Gestion des R  affectations
                            </button>
                        </div>
                    </div>

                    {/* Critical Alerts Table */}
                    <div className="glass-card rounded-[3rem] p-10 bg-brand-orange/[0.02] border-brand-orange/10">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="text-brand-orange w-6 h-6" />
                                <h3 className="text-xl font-black uppercase italic tracking-tighter">Coordination des Urgences</h3>
                            </div>
                            <div className="text-[9px] font-black uppercase tracking-[.2em] px-4 py-1.5 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange animate-pulse">
                                Alerte de Flux :   lev
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="pb-6 text-[9px] font-black uppercase tracking-widest text-slate-500">Source / ID</th>
                                        <th className="pb-6 text-[9px] font-black uppercase tracking-widest text-slate-500">Statut</th>
                                        <th className="pb-6 text-[9px] font-black uppercase tracking-widest text-slate-500">  quipe Assign  e</th>
                                        <th className="pb-6 text-[9px] font-black uppercase tracking-widest text-slate-500">Attente</th>
                                        <th className="pb-6 text-[9px] font-black uppercase tracking-widest text-slate-500">Niveau de Risque</th>
                                        <th className="pb-6"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { id: 'AMB-802', type: 'Traumatologie', staff: '  quipe A2', wait: '3m', risk: 'Extr  me', color: 'bg-red-500' },
                                        { id: 'SMUR-12', type: 'Cardiaque', staff: 'Dr. Karimi', wait: '1m', risk: 'Extr  me', color: 'bg-red-500' },
                                        { id: 'ADM-414', type: 'Standard', staff: 'Inf. Leila', wait: '12m', risk: 'Moyen', color: 'bg-yellow-500' },
                                        { id: 'ADM-415', type: 'Standard', staff: 'Inf. Hakim', wait: '15m', risk: 'Moyen', color: 'bg-yellow-500' },
                                    ].map((alert, i) => (
                                        <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-all">
                                            <td className="py-8">
                                                <div className="text-[10px] font-black uppercase">{alert.id}</div>
                                                <div className="text-[9px] font-black text-slate-500 uppercase tracking-tighter mt-1">{alert.type}</div>
                                            </td>
                                            <td className="py-8">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${alert.color}`}></div>
                                                    <span className="text-[9px] font-black uppercase">En Route</span>
                                                </div>
                                            </td>
                                            <td className="py-8 text-[10px] font-black uppercase">{alert.staff}</td>
                                            <td className="py-8">
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <Clock className="w-3 h-3" />
                                                    <span className="text-[10px] font-black">{alert.wait}</span>
                                                </div>
                                            </td>
                                            <td className="py-8">
                                                <div className={`px-4 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-wider inline-block ${
                                                    alert.risk === 'Extr  me' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                                                }`}>
                                                    {alert.risk}
                                                </div>
                                            </td>
                                            <td className="py-8 text-right">
                                                <button className="p-3 hover:bg-white/5 rounded-xl transition-all">
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
