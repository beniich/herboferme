'use client';

import {
    Activity,
    Bell,
    Cpu,
    CreditCard,
    Globe,
    HardDrive,
    Lock,
    Network,
    Search,
    Server,
    Settings,
    ShieldCheck,
    Terminal
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

const RESOURCE_DATA = [
    { time: '12:00', cpu: 24, ram: 42, net: 18 },
    { time: '13:00', cpu: 35, ram: 45, net: 22 },
    { time: '14:00', cpu: 65, ram: 58, net: 45 },
    { time: '15:00', cpu: 48, ram: 52, net: 38 },
    { time: '16:00', cpu: 82, ram: 75, net: 62 },
    { time: '17:00', cpu: 55, ram: 60, net: 48 },
    { time: '18:00', cpu: 42, ram: 55, net: 35 },
];

const NODES = [
    { name: 'PARIS-EDGE-01', region: 'eu-west-1', status: 'Healthy', load: 12, uptime: '142d' },
    { name: 'MAR-SLA-GPU-02', region: 'ma-north-1', status: 'Healthy', load: 88, uptime: '12d' },
    { name: 'CAS-CORE-04', region: 'ma-west-1', status: 'Maintenance', load: 0, uptime: '0d' },
];

export default function InfrastructureDashboard() {
    const [activeTab, setActiveTab] = useState('nodes');

    return (
        <div className="flex min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30">
            {/* Sidebar */}
            <aside className="w-72 border-r border-blue-500/10 bg-[#020617] flex flex-col p-6 space-y-8">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Terminal className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="font-display font-black text-xs uppercase tracking-widest text-white leading-none">H  bergement Pro</h1>
                        <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-1">Cloud Control</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1">
                    {[
                        { id: 'nodes', icon: Server, label: 'Noeuds Actifs' },
                        { id: 'instances', icon: Activity, label: 'Instances VM' },
                        { id: 'storage', icon: HardDrive, label: 'Stockage S3' },
                        { id: 'network', icon: Network, label: 'VPC & DNS' },
                        { id: 'security', icon: ShieldCheck, label: 'Pare-feu' },
                        { id: 'billing', icon: CreditCard, label: 'Facturation' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                activeTab === item.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                : 'text-slate-500 hover:text-blue-400 hover:bg-blue-500/5'
                            }`}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="glass-card rounded-2xl p-5 border-blue-500/20 bg-blue-500/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 rotate-12 group-hover:rotate-0 transition-all">
                        <Globe className="w-12 h-12" />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white mb-2 italic">Global Network</div>
                    <p className="text-[9px] text-slate-400 font-light leading-relaxed mb-4">Votre infrastructure s'  tend sur 4 r  gions souveraines.</p>
                    <button className="w-full py-2 bg-blue-600/20 hover:bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">Voir Carte</button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-20 border-b border-white/5 px-10 flex items-center justify-between bg-[#020617]/50 backdrop-blur-md">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-slate-500 group cursor-pointer hover:text-white transition-all">
                            <span className="material-symbols-outlined text-sm">public</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">R  gion : MA-North-1 (Global)</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5 hover:border-blue-500/20 transition-all cursor-pointer">
                            <Search className="w-4 h-4 text-slate-600" />
                            <input
                                type="text"
                                placeholder="SSH ID, IP, NOEUD..."
                                className="bg-transparent border-none outline-none text-[10px] font-black tracking-widest w-48 placeholder:text-slate-700"
                            />
                        </div>
                        <div className="relative">
                            <Bell className="w-5 h-5 text-slate-500 hover:text-white cursor-pointer transition-all" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-orange rounded-full"></span>
                        </div>
                        <div className="flex items-center gap-3 pl-4 border-l border-white/5">
                            <div className="text-right">
                                <div className="text-[10px] font-black uppercase text-white">Cloud Master</div>
                                <div className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">Root Access</div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-blue-600 p-0.5 flex items-center justify-center font-black">CM</div>
                        </div>
                    </div>
                </header>

                <div className="p-10 space-y-10 overflow-y-auto">
                    {/* Hero Stats */}
                    <div className="flex items-end justify-between">
                        <div>
                            <h2 className="text-4xl font-display font-black uppercase italic tracking-tighter text-white">Centre de Commande</h2>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[.4em] mt-1 space-x-2">
                                <span className="text-green-500">Flux Stable</span>
                                <span>   </span>
                                <span>24 Instances</span>
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                                Snapshot Global
                            </button>
                            <button className="px-8 py-4 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-105 transition-all">
                                D  ployer Instance
                            </button>
                        </div>
                    </div>

                    {/* Utilization Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: 'Utilisation CPU', val: '68%', icon: Cpu, trend: 'En hausse', color: 'text-blue-500' },
                            { label: 'Utilisation RAM', val: '124 GB', icon: Activity, trend: 'Optimal', color: 'text-indigo-500' },
                            { label: 'Bande Passante', val: '12.4 GB/s', icon: Network, trend: 'Capacit   80%', color: 'text-brand-orange' },
                        ].map((stat, i) => (
                            <div key={i} className="glass-card rounded-[2.5rem] p-10 border border-white/5 hover:border-blue-500/20 transition-all group">
                                <div className="flex items-center justify-between mb-6">
                                    <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${stat.color} group-hover:bg-blue-600 group-hover:text-white transition-all`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    <div className="text-[9px] font-black uppercase tracking-[.2em] text-slate-500">{stat.trend}</div>
                                </div>
                                <div className="text-4xl font-black italic italic mb-2 tracking-tighter">{stat.val}</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Full Width Line Chart */}
                    <div className="glass-card rounded-[3rem] p-12 space-y-12">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Analyses de Charge (24h)</h3>
                                <div className="flex gap-8">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">CPU Compute</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Memory Ops</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-brand-orange"></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Throughput</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl">
                                <button className="px-5 py-2 bg-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/10 transition-all">Temps R  el</button>
                                <button className="px-5 py-2 hover:bg-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500 transition-all">Historique</button>
                            </div>
                        </div>

                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={RESOURCE_DATA}>
                                    <defs>
                                        <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#ffffff03" />
                                    <XAxis
                                        dataKey="time"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#334155', fontSize: 10, fontWeight: 900 }}
                                    />
                                    <YAxis hide domain={[0, 100]} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(59,130,246,0.1)', borderRadius: '16px' }}
                                    />
                                    <Area type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={4} fill="url(#colorCpu)" />
                                    <Area type="monotone" dataKey="ram" stroke="#6366f1" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                                    <Area type="monotone" dataKey="net" stroke="#ee9b00" strokeWidth={2} fill="transparent" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Nodes Table */}
                    <div className="glass-card rounded-[3rem] p-10">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black uppercase italic tracking-tighter">Status des Clusters</h3>
                            <button className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:underline">Rafra  chir Noeuds</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="pb-6 text-[9px] font-black uppercase tracking-widest text-slate-500">Nom du Noeud</th>
                                        <th className="pb-6 text-[9px] font-black uppercase tracking-widest text-slate-500">R  gion</th>
                                        <th className="pb-6 text-[9px] font-black uppercase tracking-widest text-slate-500">Statut</th>
                                        <th className="pb-6 text-[9px] font-black uppercase tracking-widest text-slate-500">Charge</th>
                                        <th className="pb-6 text-[9px] font-black uppercase tracking-widest text-slate-500">Uptime</th>
                                        <th className="pb-6"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {NODES.map((node, i) => (
                                        <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-all">
                                            <td className="py-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                                    <span className="text-[10px] font-black uppercase text-white">{node.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-8">
                                                <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                    {node.region}
                                                </span>
                                            </td>
                                            <td className="py-8">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[9px] font-black uppercase tracking-widest ${node.status === 'Healthy' ? 'text-green-500' : 'text-brand-orange'}`}>
                                                        {node.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${node.load}%` }}></div>
                                                    </div>
                                                    <span className="text-[9px] font-black uppercase">{node.load}%</span>
                                                </div>
                                            </td>
                                            <td className="py-8 text-[10px] font-black uppercase text-slate-500 italic">{node.uptime}</td>
                                            <td className="py-8 text-right">
                                                <button className="p-3 hover:bg-white/5 rounded-xl transition-all">
                                                    <Settings className="w-4 h-4 text-slate-600 hover:text-white" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-10 p-6 bg-blue-600/5 border border-blue-600/10 rounded-[2rem] flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Lock className="w-5 h-5 text-blue-500" />
                                <div className="text-[10px] font-black uppercase text-slate-400">Acc  s SSH via Quantum-Secure Tunnel actif sur tous les noeuds.</div>
                            </div>
                            <button className="px-6 py-2 bg-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest">G  rer Clefs</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
