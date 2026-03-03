import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function InfrastructureLanding() {
    const t = useTranslations('Infrastructure');

    return (
        <div className="min-h-screen bg-brand-midnight text-white selection:bg-blue-500 selection:text-white">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden px-6 lg:px-20">
                <div className="absolute top-0 left-0 w-full h-full bg-blue-600/5 blur-[150px] -z-10"></div>

                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1 space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            Infrastructure Tier-IV Certifi  e
                        </div>

                        <h1 className="text-5xl lg:text-8xl font-display font-black leading-tight tracking-tighter uppercase italic">
                            {t('heroTitle').split(' ').slice(0, 2).join(' ')} <br />
                            <span className="text-blue-500 not-italic">{t('heroTitle').split(' ').slice(2).join(' ')}</span>
                        </h1>

                        <p className="text-lg text-slate-400 max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed">
                            {t('heroSubtitle')}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-4">
                            <Link href="/services/infrastructure/dashboard" className="w-full sm:w-auto bg-brand-orange text-white font-black px-10 py-5 rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-brand-orange/25 hover:bg-orange-600 transition-all orange-glow transform hover:scale-105">
                                {t('ctaStart')}
                            </Link>
                            <Link href="/services/infrastructure/dashboard" className="w-full sm:w-auto glass-card px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                                <span className="material-symbols-outlined text-sm">terminal</span> {t('ctaDemo')}
                            </Link>
                        </div>
                    </div>

                    {/* Server Rack Visualization */}
                    <div className="flex-1 w-full max-w-2xl">
                        <div className="relative glass-card rounded-[3rem] p-8 border border-white/5 overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] -z-10 group-hover:bg-blue-500/20 transition-all"></div>

                            <div className="flex items-center justify-between mb-10">
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-blue-400">Node : RT-PRIME-01</div>
                                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">Status : Op  rationnel</div>
                                </div>
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="w-1 h-4 bg-blue-500/20 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6 mb-10">
                                {[
                                    { label: 'CPU Usage', val: '24%', bar: 'w-1/4', color: 'bg-blue-500' },
                                    { label: 'RAM Ops', val: '12.4 GB', bar: 'w-1/2', color: 'bg-indigo-500' },
                                    { label: 'GPU Load (A100)', val: '88%', bar: 'w-[88%]', color: 'bg-brand-orange' },
                                ].map((stat, i) => (
                                    <div key={i} className="space-y-3">
                                        <div className="flex justify-between text-[10px] font-black uppercase">
                                            <span className="text-slate-400">{stat.label}</span>
                                            <span>{stat.val}</span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div className={`h-full ${stat.color} rounded-full ${stat.bar}`}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:border-blue-500/30 transition-all">
                                    <div className="text-[9px] font-black uppercase text-slate-500 mb-2">Network In</div>
                                    <div className="text-xl font-black italic">1.2 GB/s</div>
                                </div>
                                <div className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:border-blue-500/30 transition-all">
                                    <div className="text-[9px] font-black uppercase text-slate-500 mb-2">Network Out</div>
                                    <div className="text-xl font-black italic">840 MB/s</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Global Infra Stats */}
            <section className="px-6 lg:px-20 py-24 border-y border-white/5 bg-white/[0.01]">
                <div className="max-w-7xl mx-auto flex flex-wrap justify-between gap-10">
                    {[
                        { val: '24', label: 'Data Centers' },
                        { val: '99.99%', label: 'Uptime SLA' },
                        { val: '12ms', label: 'Avg Latency' },
                        { val: '500TB', label: 'Backups' },
                    ].map((s, i) => (
                        <div key={i} className="text-center group">
                            <div className="text-5xl font-black italic mb-2 group-hover:text-blue-500 transition-all">{s.val}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Cloud Features */}
            <section className="px-6 lg:px-20 py-32">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            {
                                icon: 'cloud_done',
                                title: t('feature1Title'),
                                desc: t('feature1Desc'),
                                accent: 'border-blue-500/20'
                            },
                            {
                                icon: 'memory',
                                title: t('feature2Title'),
                                desc: t('feature2Desc'),
                                accent: 'border-brand-orange/20'
                            },
                            {
                                icon: 'dynamic_form',
                                title: t('feature3Title'),
                                desc: t('feature3Desc'),
                                accent: 'border-indigo-500/20'
                            },
                        ].map((f, i) => (
                            <div key={i} className={`glass-card rounded-[3rem] p-12 hover:-translate-y-4 transition-all duration-700 border ${f.accent}`}>
                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-blue-400 mb-10 group-hover:scale-110 transition-all">
                                    <span className="material-symbols-outlined text-3xl">{f.icon}</span>
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tight mb-6">{f.title}</h3>
                                <p className="text-slate-400 font-light leading-relaxed mb-10">{f.desc}</p>
                                <button className="text-[10px] font-black uppercase tracking-widest text-blue-500 flex items-center gap-2 hover:gap-4 transition-all group">
                                    En savoir plus <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
