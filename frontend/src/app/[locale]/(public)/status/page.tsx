'use client';

import Link from 'next/link';
import { ShieldCheck, AlertTriangle, CheckCircle2, Globe, Clock, Zap, Activity } from 'lucide-react';

const services = [
    { name: 'Flux Satellite Temps Réel', status: 'operational', uptime: '99.99%', ping: '120ms' },
    { name: 'Moteur de Prédiction IA', status: 'operational', uptime: '99.95%', ping: '45ms' },
    { name: 'Réseau Capteurs IoT', status: 'operational', uptime: '99.9%', ping: '210ms' },
    { name: 'Base de Données Agronomique', status: 'operational', uptime: '99.8%', ping: '15ms' },
    { name: 'API de Cartographie', status: 'degraded', uptime: '97.2%', ping: '850ms' },
    { name: 'Système d\'Alertes Météo', status: 'operational', uptime: '100%', ping: '32ms' },
    { name: 'Interface Dashboard', status: 'maintenance', uptime: '–', ping: '–' },
];

const statusConfig: Record<string, { label: string; color: string; dot: string; icon: any }> = {
    operational: { label: 'Opérationnel', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-500 shadow-[0_0_10px_#10b981]', icon: CheckCircle2 },
    degraded: { label: 'Dégradé', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-500 shadow-[0_0_10px_#f59e0b]', icon: AlertTriangle },
    maintenance: { label: 'Maintenance', color: 'text-[var(--gold)] bg-[var(--gold)]/10 border-[var(--gold)]/20', dot: 'bg-[var(--gold)] shadow-[0_0_10px_#d4af37]', icon: Clock },
    outage: { label: 'Panne Critique', color: 'text-red-500 bg-red-500/10 border-red-500/20', dot: 'bg-red-500 shadow-[0_0_10px_#ef4444]', icon: AlertTriangle },
};

const incidents = [
    { date: '28 Fév 2026', title: 'Maintenance programmée du cluster IoT', status: 'En cours', duration: 'Prévu 2h', severity: 'minor' },
    { date: '15 Fév 2026', title: 'Latence accrue sur l\'imagerie hyperspectrale', status: 'Résolu', duration: '45 min', severity: 'major' },
    { date: '02 Fév 2026', title: 'Délai de synchronisation des données météo', status: 'Résolu', duration: '15 min', severity: 'minor' },
];

export default function StatusPage() {
    const allOperational = services.every(s => s.status === 'operational');

    return (
        <div className="bg-[var(--bg)] text-[var(--text)] font-sans min-h-screen">
            <main className="max-w-5xl mx-auto px-6 pt-32 pb-24 w-full">
                {/* Status Hero Card */}
                <section className="relative mb-16 rounded-[3rem] overflow-hidden bg-[var(--sidebar-bg)] p-12 text-center border border-white/10 shadow-2xl">
                    <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(circle_at_50%_0%,var(--gold)_0%,transparent_50%)]"></div>
                    <div className="relative z-10">
                        <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8 shadow-inner backdrop-blur-md">
                            {allOperational ? (
                                <ShieldCheck className="w-10 h-10 text-emerald-400" />
                            ) : (
                                <AlertTriangle className="w-10 h-10 text-[var(--gold)]" />
                            )}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight italic uppercase">
                            {allOperational ? 'Systèmes AgroMaître Opérationnels' : 'Certains Services sont Dégradés'}
                        </h1>
                        <p className="text-white/70 font-normal max-w-xl mx-auto mb-10 text-lg opacity-90">
                            Surveillance en temps réel de l'écosystème AgroMaître. Monitoring global via nos serveurs sécurisés.
                        </p>
                        <div className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-white text-[var(--sidebar-bg)] font-black text-[10px] uppercase tracking-widest shadow-xl">
                            <Activity className="w-3 h-3 animate-pulse text-[var(--green)]" />
                            Vérifié à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} GMT
                        </div>
                    </div>
                </section>

                {/* Service Grid */}
                <section className="mb-20">
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <h2 className="text-[var(--green)] font-black text-xs uppercase tracking-widest mb-2">Santé du Réseau</h2>
                            <h3 className="text-3xl font-black text-[var(--text)] uppercase tracking-tight">Composants Actifs</h3>
                        </div>
                        <p className="text-xs font-bold text-[var(--text3)] hidden sm:block uppercase tracking-widest">Load Balancers: <span className="text-emerald-500 font-black tracking-normal">En ligne</span></p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-4">
                        {services.map((svc, i) => {
                            const cfg = statusConfig[svc.status];
                            const Icon = cfg.icon;
                            return (
                                <div key={i} className="group bg-white border border-[var(--border)] rounded-3xl p-6 hover:border-[var(--green)]/30 transition-all shadow-xl shadow-black/[0.01] flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cfg.color}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black group-hover:text-[var(--green)] transition-colors leading-tight uppercase tracking-tight">{svc.name}</h4>
                                            <div className="flex items-center gap-4 mt-1 text-[10px] font-bold text-[var(--text3)] uppercase tracking-widest">
                                                <span>Uptime: <span className="text-[var(--text)] font-black">{svc.uptime}</span></span>
                                                <span className="opacity-20">|</span>
                                                <span>Latence: <span className="text-[var(--text)] font-black">{svc.ping}</span></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${cfg.color} flex items-center gap-2 shadow-sm`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${svc.status === 'operational' ? 'animate-pulse' : ''}`}></div>
                                        {cfg.label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Historical Pulse */}
                <section className="mb-20">
                    <div className="mb-10 text-center">
                        <h2 className="text-[var(--green)] font-black text-xs uppercase tracking-widest mb-2">Historique de Stabilité</h2>
                        <h3 className="text-3xl font-black text-[var(--text)] uppercase tracking-tight">Disponibilité (90 Jours)</h3>
                    </div>

                    <div className="bg-white border border-[var(--border)] rounded-[2.5rem] p-10 shadow-xl shadow-black/[0.01] relative overflow-hidden group">
                        <div className="flex gap-1 mb-8 h-12 items-end">
                            {Array.from({ length: 90 }).map((_, i) => {
                                const hasIssue = [18, 45, 71].includes(i);
                                return (
                                    <div
                                        key={i}
                                        className={`flex-1 rounded-sm transition-all cursor-pointer ${hasIssue ? 'bg-amber-500 h-6 hover:h-12' : 'bg-emerald-500 h-10 hover:h-12 opacity-80 shadow-sm'}`}
                                        title={hasIssue ? `Incident il y a ${90-i} jours` : 'Opérationnel'}
                                    />
                                );
                            })}
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[var(--text3)]">
                            <span className="flex items-center gap-2"><Clock className="w-3 h-3" /> Il y a 90 jours</span>
                            <div className="flex items-center gap-6">
                                <span className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div> Stable</span>
                                <span className="flex items-center gap-2"><div className="w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div> Alerte minor</span>
                            </div>
                            <span className="flex items-center gap-2">Aujourd'hui <Clock className="w-3 h-3" /></span>
                        </div>
                    </div>
                </section>

                {/* Incident Records */}
                <section>
                    <div className="mb-10">
                        <h2 className="text-[var(--green)] font-black text-xs uppercase tracking-widest mb-2">Journaux de Mission</h2>
                        <h3 className="text-3xl font-black text-[var(--text)] uppercase tracking-tight">Historique des Incidents</h3>
                    </div>

                    <div className="space-y-4">
                        {incidents.map((inc, i) => (
                            <div key={i} className="group flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white border border-[var(--border)] rounded-[2rem] p-8 hover:border-[var(--green)]/30 transition-all shadow-xl shadow-black/[0.01]">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${inc.severity === 'major' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                            Priorité {inc.severity}
                                        </span>
                                        <span className="text-[9px] font-black text-[var(--text3)] uppercase tracking-widest border-l border-[var(--border)] pl-3">{inc.date}</span>
                                    </div>
                                    <h4 className="text-lg font-extrabold text-[var(--text)] group-hover:text-[var(--green)] transition-all">{inc.title}</h4>
                                    <div className="flex items-center gap-4 text-xs font-medium text-[var(--text3)]">
                                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Résolution: {inc.duration}</span>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${inc.status === 'Résolu' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white' : 'bg-[var(--gold)]/10 border-[var(--gold)]/20 text-[var(--gold)] group-hover:bg-[var(--gold)] group-hover:text-white'}`}>
                                    {inc.status === 'Résolu' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                    {inc.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
