import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function HealthcareLanding() {
    const t = useTranslations('Healthcare');

    return (
        <div className="min-h-screen bg-brand-midnight text-white selection:bg-cyan-500 selection:text-white">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden px-6 lg:px-20">
                <div className="absolute top-0 right-0 w-full h-full bg-cyan-500/5 blur-[120px] -z-10"></div>

                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1 space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest">
                            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
                            Certification HDS & ISO 27001
                        </div>

                        <h1 className="text-5xl lg:text-8xl font-display font-black leading-tight tracking-tighter uppercase italic">
                            {t('heroTitle').split(' ').slice(0, 2).join(' ')} <br />
                            <span className="text-cyan-400 not-italic">{t('heroTitle').split(' ').slice(2).join(' ')}</span>
                        </h1>

                        <p className="text-lg text-slate-400 max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed">
                            {t('heroSubtitle')}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-4">
                            <Link href="/services/healthcare/dashboard" className="w-full sm:w-auto bg-brand-orange text-white font-black px-10 py-5 rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-brand-orange/25 hover:bg-orange-600 transition-all orange-glow transform hover:scale-105">
                                {t('ctaStart')}
                            </Link>
                            <Link href="/services/healthcare/dashboard" className="w-full sm:w-auto glass-card px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                                <span className="material-symbols-outlined text-sm">monitor_heart</span> {t('ctaDemo')}
                            </Link>
                        </div>
                    </div>

                    {/* Medical Visualization */}
                    <div className="flex-1 w-full max-w-2xl">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                            <div className="relative glass-card rounded-[3rem] p-4 overflow-hidden">
                                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                                            <span className="material-symbols-outlined">health_metrics</span>
                                        </div>
                                        <div>
                                            <div className="text-xs font-black uppercase tracking-widest">Sant   Connect v2</div>
                                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">H  pital Universitaire de Rabat</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"></div>
                                        <div className="w-2 h-2 rounded-full bg-cyan-500/20"></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    {[
                                        { label: 'Flux Urgences', val: '92%', trend: 'Optimum', color: 'text-cyan-400' },
                                        { label: 'Lits Libres', val: '14', trend: 'Tension', color: 'text-brand-orange' },
                                        { label: 'Staff Actif', val: '86', trend: 'Stable', color: 'text-green-400' },
                                    ].map((s, i) => (
                                        <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                            <div className="text-[9px] font-black uppercase text-slate-500 mb-1">{s.label}</div>
                                            <div className="text-xl font-black italic mb-1">{s.val}</div>
                                            <div className={`text-[8px] font-black uppercase tracking-tighter ${s.color}`}>{s.trend}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-cyan-400">Alertes Temps R  el</span>
                                        <span className="material-symbols-outlined text-xs text-slate-500">more_horiz</span>
                                    </div>
                                    <div className="bg-brand-orange/5 border-l-4 border-brand-orange p-4 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-brand-orange/20 flex items-center justify-center text-brand-orange">
                                                <span className="material-symbols-outlined text-sm">emergency_home</span>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black uppercase">Admission Critique</div>
                                                <div className="text-[8px] text-slate-500 font-bold uppercase tracking-tight">Ambulance #402 en approche</div>
                                            </div>
                                        </div>
                                        <div className="text-[10px] font-black">2m</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Healthcare */}
            <section className="px-6 lg:px-20 py-32 bg-white/[0.01] border-y border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24 space-y-4">
                        <h2 className="text-4xl lg:text-6xl font-display font-black uppercase italic tracking-tighter">Coordination <span className="text-cyan-400 not-italic">Intelligente</span></h2>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] font-display">S  curis       Souverain     Interop  rable</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            {
                                icon: 'hub',
                                title: t('feature1Title'),
                                desc: t('feature1Desc'),
                                items: ['Tri automatis   IA', 'Transferts inter-services', 'Bornes d\'admission']
                            },
                            {
                                icon: 'bed',
                                title: t('feature2Title'),
                                desc: t('feature2Desc'),
                                items: ['Capteurs IoT temps r  el', 'Planning bloc op  ratoire', 'Stock pharmacie critique']
                            },
                            {
                                icon: 'query_stats',
                                title: t('feature3Title'),
                                desc: t('feature3Desc'),
                                items: ['Mod  les de pics   pid  miques', 'Analyse temps d\'attente', 'Rapports conformit   HAS']
                            },
                        ].map((f, i) => (
                            <div key={i} className="group glass-card rounded-[3rem] p-12 hover:-translate-y-4 transition-all duration-700 hover:border-cyan-500/20">
                                <div className="w-16 h-16 bg-cyan-500/10 rounded-[1.5rem] flex items-center justify-center text-cyan-400 mb-10 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-white transition-all shadow-xl shadow-cyan-500/5">
                                    <span className="material-symbols-outlined text-3xl">{f.icon}</span>
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tight mb-6">{f.title}</h3>
                                <p className="text-slate-400 font-light leading-relaxed mb-10">{f.desc}</p>
                                <ul className="space-y-4">
                                    {f.items.map((item, j) => (
                                        <li key={j} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                            <span className="material-symbols-outlined text-cyan-400 text-sm">verified_user</span> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
