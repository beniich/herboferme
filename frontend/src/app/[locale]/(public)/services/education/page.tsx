import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function EducationLanding() {
    const t = useTranslations('Education');
    const tCommon = useTranslations('Common');

    return (
        <div className="min-h-screen bg-brand-midnight text-white selection:bg-brand-orange selection:text-white">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden px-6 lg:px-20">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-brand-orange/5 blur-3xl -z-10"></div>

                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1 space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-black uppercase tracking-widest">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-orange"></span>
                            </span>
                            Nouveau : Analyses Comportementales IA
                        </div>

                        <h1 className="text-5xl lg:text-8xl font-display font-black leading-tight tracking-tighter uppercase italic">
                            {t('heroTitle').split(',')[0]} <br />
                            <span className="text-brand-orange not-italic">{t('heroTitle').split(',')[1]}</span>
                        </h1>

                        <p className="text-lg text-slate-400 max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed">
                            {t('heroSubtitle')}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-4">
                            <Link href="/services/education/dashboard" className="w-full sm:w-auto bg-brand-orange text-white font-black px-10 py-5 rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-brand-orange/25 hover:bg-orange-600 transition-all orange-glow transform hover:scale-105">
                                {t('ctaStart')}
                            </Link>
                            <Link href="/services/education/dashboard" className="w-full sm:w-auto glass-card px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                                <span className="material-symbols-outlined text-sm">play_circle</span> {t('ctaDemo')}
                            </Link>
                        </div>
                    </div>

                    {/* Preview Image / Mockup */}
                    <div className="flex-1 w-full max-w-2xl relative">
                        <div className="glass-card rounded-[3rem] p-4 shadow-2xl relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                                <div className="text-[10px] font-black opacity-30 uppercase tracking-widest">EduCRM v4.2</div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 group-hover:border-brand-orange/30 transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] uppercase font-black opacity-40">Assiduit  </span>
                                        <span className="text-green-400 text-[10px] font-black">+2.4%</span>
                                    </div>
                                    <div className="text-3xl font-black">98.2%</div>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 group-hover:border-brand-orange/30 transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] uppercase font-black opacity-40">Moyenne</span>
                                        <span className="text-brand-orange text-[10px] font-black">A-</span>
                                    </div>
                                    <div className="text-3xl font-black">16.4</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-black uppercase tracking-widest">Activit  s R  centes</h3>
                                    <span className="text-[10px] text-brand-orange font-black uppercase tracking-widest hover:underline cursor-pointer">Voir Tout</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                                        <div className="w-10 h-10 rounded-full bg-brand-orange/20 flex items-center justify-center text-brand-orange">
                                            <span className="material-symbols-outlined text-sm">person</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs font-black uppercase">L  o Martinez</div>
                                            <div className="text-[10px] opacity-40">A soumis le devoir de Math #4</div>
                                        </div>
                                        <div className="text-[10px] opacity-20">2m</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Background Accent */}
                        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-brand-orange/20 rounded-full blur-[80px] -z-10"></div>
                    </div>
                </div>
            </section>

            {/* Stats Row */}
            <section className="px-6 lg:px-20 py-16 border-y border-white/5 bg-white/[0.01]">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="glass-card rounded-3xl p-10 border-l-4 border-l-brand-orange">
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">  l  ves Actifs</p>
                        <div className="text-4xl font-black mb-3 italic">1.2M+</div>
                        <div className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase tracking-widest">
                            <span className="material-symbols-outlined text-sm">trending_up</span> +12% ce trimestre
                        </div>
                    </div>
                    <div className="glass-card rounded-3xl p-10 border-l-4 border-l-brand-orange">
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Am  lioration Notes</p>
                        <div className="text-4xl font-black mb-3 italic">24.5%</div>
                        <div className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase tracking-widest">
                            <span className="material-symbols-outlined text-sm">verified</span> performance v  rifi  e
                        </div>
                    </div>
                    <div className="glass-card rounded-3xl p-10 border-l-4 border-l-brand-orange">
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Satisfaction Parents</p>
                        <div className="text-4xl font-black mb-3 italic">99.1%</div>
                        <div className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase tracking-widest">
                            <span className="material-symbols-outlined text-sm">sentiment_very_satisfied</span> Top rated CRM
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="px-6 lg:px-20 py-32">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-24">
                        <h2 className="text-4xl lg:text-6xl font-display font-black uppercase italic tracking-tighter mb-6">Tout ce dont votre <span className="text-brand-orange not-italic">  cole a besoin</span></h2>
                        <div className="h-1.5 w-32 bg-brand-orange rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Feature 1 */}
                        <div className="group glass-card rounded-[3rem] p-12 hover:-translate-y-4 transition-all duration-700">
                            <div className="w-16 h-16 bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange mb-10 group-hover:scale-110 group-hover:rotate-12 transition-all">
                                <span className="material-symbols-outlined text-3xl">analytics</span>
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tight mb-6">{t('feature1Title')}</h3>
                            <p className="text-slate-400 font-light leading-relaxed mb-10">{t('feature1Desc')}</p>
                            <ul className="space-y-4">
                                {['Pr  sences Intelligentes', 'Cartes de chaleur comportementale', 'Dossiers de sant  '].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        <span className="material-symbols-outlined text-brand-orange text-sm">check_circle</span> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Feature 2 - Highlighted */}
                        <div className="group glass-card rounded-[3rem] p-12 bg-brand-orange/10 border-brand-orange/30 scale-105 shadow-2xl shadow-brand-orange/5 hover:-translate-y-4 transition-all duration-700">
                            <div className="w-16 h-16 bg-brand-orange rounded-2xl flex items-center justify-center text-white mb-10 shadow-xl shadow-brand-orange/20 transition-all">
                                <span className="material-symbols-outlined text-3xl">auto_stories</span>
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tight mb-6">{t('feature2Title')}</h3>
                            <p className="text-slate-400 font-light leading-relaxed mb-10">{t('feature2Desc')}</p>
                            <ul className="space-y-4">
                                {['  chelles de notation dynamiques', 'Exportation de rapports en masse', 'Calcul automatique du GPA'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-200">
                                        <span className="material-symbols-outlined text-brand-orange text-sm">check_circle</span> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Feature 3 */}
                        <div className="group glass-card rounded-[3rem] p-12 hover:-translate-y-4 transition-all duration-700">
                            <div className="w-16 h-16 bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange mb-10 group-hover:scale-110 group-hover:rotate-12 transition-all">
                                <span className="material-symbols-outlined text-3xl">forum</span>
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tight mb-6">{t('feature3Title')}</h3>
                            <p className="text-slate-400 font-light leading-relaxed mb-10">{t('feature3Desc')}</p>
                            <ul className="space-y-4">
                                {['Acc  s application mobile', 'Portail de paiement des frais', 'Sync calendrier   v  nements'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        <span className="material-symbols-outlined text-brand-orange text-sm">check_circle</span> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
