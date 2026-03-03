import { useTranslations } from 'next-intl';

export default function HospitalityLanding() {
    const t = useTranslations('Hospitality');

    return (
        <div className="min-h-screen bg-brand-midnight text-white selection:bg-emerald-500 selection:text-white">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden px-6 lg:px-20">
                <div className="absolute top-0 right-0 w-full h-full bg-emerald-500/5 blur-[150px] -z-10"></div>

                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1 space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            Partenaire   lite de l'Industrie H  teli  re
                        </div>

                        <h1 className="text-5xl lg:text-8xl font-display font-black leading-tight tracking-tighter uppercase italic">
                            {t('heroTitle').split(' ').slice(0, 2).join(' ')} <br />
                            <span className="text-emerald-500 not-italic">{t('heroTitle').split(' ').slice(2).join(' ')}</span>
                        </h1>

                        <p className="text-lg text-slate-400 max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed">
                            {t('heroSubtitle')}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-4">
                            <button className="w-full sm:w-auto bg-brand-orange text-white font-black px-10 py-5 rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-brand-orange/25 hover:bg-orange-600 transition-all orange-glow transform hover:scale-105">
                                {t('ctaStart')}
                            </button>
                            <button className="w-full sm:w-auto glass-card px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                                <span className="material-symbols-outlined text-sm">hotel</span> {t('ctaDemo')}
                            </button>
                        </div>
                    </div>

                    {/* PMS Visualization */}
                    <div className="flex-1 w-full max-w-2xl">
                        <div className="relative glass-card rounded-[3rem] p-10 border border-white/5 overflow-hidden group">
                            <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-[80px] -z-10"></div>

                            <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/5">
                                <div>
                                    <div className="text-[10px] font-black uppercase text-emerald-400 mb-1">Hospitality Hub PMS</div>
                                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">H  tel Royal Garden     5   toiles</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-[10px] font-black uppercase">Occupation</div>
                                        <div className="text-lg font-black italic text-white">94%</div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                        <span className="material-symbols-outlined">analytics</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest">Arriv  es Aujourd'hui</h4>
                                    <span className="text-[8px] font-black uppercase px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">24 Check-ins</span>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { name: 'M. Jean-Luc R.', room: '104', status: 'Confirm  ', time: '14:30' },
                                        { name: 'Mme Sofia A.', room: '312', status: 'VIP', time: '16:00' },
                                        { name: 'M. David W.', room: 'Penth.', status: 'Priority', time: '15:15' },
                                    ].map((guest, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[9px] font-black">{guest.name.split(' ')[1][0]}</div>
                                                <div>
                                                    <div className="text-[9px] font-black uppercase">{guest.name}</div>
                                                    <div className="text-[8px] text-slate-500 font-bold">Chambre {guest.room}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[8px] font-black uppercase text-emerald-400">{guest.status}</div>
                                                <div className="text-[8px] text-slate-500">{guest.time}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Hospitality Features */}
            <section className="px-6 lg:px-20 py-32 bg-white/[0.01] border-y border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            {
                                icon: 'person_search',
                                title: t('feature1Title'),
                                desc: t('feature1Desc'),
                                color: 'text-emerald-400'
                            },
                            {
                                icon: 'cleaning_services',
                                title: t('feature2Title'),
                                desc: t('feature2Desc'),
                                color: 'text-amber-400'
                            },
                            {
                                icon: 'sync_alt',
                                title: t('feature3Title'),
                                desc: t('feature3Desc'),
                                color: 'text-blue-400'
                            },
                        ].map((f, i) => (
                            <div key={i} className="group glass-card rounded-[3rem] p-12 hover:-translate-y-4 transition-all duration-700">
                                <div className={`w-16 h-16 bg-white/5 rounded-[1.5rem] flex items-center justify-center ${f.color} mb-10 group-hover:scale-110 transition-all`}>
                                    <span className="material-symbols-outlined text-3xl">{f.icon}</span>
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tight mb-6">{f.title}</h3>
                                <p className="text-slate-400 font-light leading-relaxed mb-10">{f.desc}</p>
                                <ul className="space-y-4">
                                    {['Int  gration API Hub', 'Support 24/7 Premium', 'Rapports Financiers'].map((item, j) => (
                                        <li key={j} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                            <span className={`material-symbols-outlined ${f.color} text-sm`}>stars</span> {item}
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
