'use client';

import Link from 'next/link';

const VERTICALS = [
    { id: 'gov', color: 'blue', title: 'Gouvernance Digitale', desc: 'Solutions d\'e-gouvernance et transparence administrative.', symbol: 'account_balance', href: '/services/governance' },
    { id: 'health', color: 'cyan', title: 'Sant   Connect', desc: 'Gestion hospitali  re et coordination des soins en temps r  el.', symbol: 'medical_services', href: '/services/healthcare' },
    { id: 'infra', color: 'blue', title: 'H  bergement Pro', desc: 'Infrastructure souveraine IA et serveurs haute performance.', symbol: 'lan', href: '/services/infrastructure' },
    { id: 'hotel', color: 'emerald', title: 'Hospitality Hub', desc: 'Optimisation de l\'exp  rience client et gestion PMS.', symbol: 'hotel', href: '/services/hospitality' },
    { id: 'edu', color: 'amber', title: 'EduCRM Pro', desc: 'Suivi de la performance scolaire et gestion des   tablissements.', symbol: 'school', href: '/services/education' }
];

export default function ServicesPage() {
    return (
        <div className="min-h-screen bg-brand-midnight text-white selection:bg-brand-orange selection:text-white">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden px-6 lg:px-20 border-b border-white/5 bg-white/[0.01]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-brand-orange/5 blur-[150px] -z-10"></div>

                <div className="max-w-7xl mx-auto text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-[10px] font-black uppercase tracking-widest mx-auto">
                        <span className="w-2 h-2 bg-brand-orange rounded-full animate-pulse"></span>
                          cosyst  me ReclamTrack Pro
                    </div>

                    <h1 className="text-6xl md:text-9xl font-display font-black leading-none tracking-tighter uppercase italic">
                        Notre <br />
                        <span className="text-brand-orange not-italic">Expertise.</span>
                    </h1>

                    <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
                        Des solutions technologiques verticales con  ues pour r  pondre aux d  fis sp  cifiques de votre secteur d'activit  .
                    </p>
                </div>
            </section>

            {/* Grid Section */}
            <section className="py-32 px-6 lg:px-20 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {VERTICALS.map((service, i) => (
                            <Link key={i} href={service.href} className="group relative">
                                <div className="absolute -inset-0.5 bg-gradient-to-br from-white/10 to-transparent rounded-[3rem] blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                                <div className="relative glass-card p-12 rounded-[3.5rem] h-full flex flex-col border border-white/5 hover:border-brand-orange/30 transition-all duration-700 hover:-translate-y-4">
                                    <div className={`w-16 h-16 bg-${service.color}-500/20 text-${service.color}-400 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-12 transition-all`}>
                                        <span className="material-symbols-outlined text-4xl">{service.symbol}</span>
                                    </div>

                                    <h3 className="text-3xl font-black text-white mb-6 uppercase tracking-tight group-hover:text-brand-orange transition-colors">
                                        {service.title}
                                    </h3>

                                    <div className="p-8 rounded-3xl bg-white/5 border border-white/5 group-hover:border-brand-orange/20 hover:bg-white/[0.08] transition-all flex-grow mb-10">
                                        <p className="text-sm text-slate-400 leading-relaxed font-light">
                                            {service.desc}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-brand-orange group-hover:gap-6 transition-all duration-500">
                                        Explorer la solution
                                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {/* Custom Inquiry Card */}
                        <div className="glass-card p-12 rounded-[3.5rem] bg-brand-orange/10 border-brand-orange/20 h-full flex flex-col items-center justify-center text-center space-y-8 min-h-[450px]">
                            <div className="w-20 h-20 bg-brand-orange text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-brand-orange/30">
                                <span className="material-symbols-outlined text-4xl">add</span>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-2xl font-black uppercase italic tracking-tight">Besoin de plus ?</h3>
                                <p className="text-sm text-slate-400 font-light leading-relaxed max-w-[250px]">
                                    Nos ing  nieurs con  oivent des solutions sur-mesure pour vos besoins sp  cifiques.
                                </p>
                            </div>
                            <Link href="/contact" className="px-10 py-5 bg-white text-brand-midnight font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-brand-orange hover:text-white transition-all transform hover:scale-105 shadow-xl">
                                Contacter l'Expert
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-32 px-6 lg:px-20">
                <div className="max-w-5xl mx-auto glass-card rounded-[4rem] p-16 md:p-24 text-center space-y-12 relative overflow-hidden bg-gradient-to-br from-brand-orange/20 to-transparent border-brand-orange/20 group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/20 blur-[100px] -z-10 group-hover:bg-brand-orange/40 transition-all duration-1000"></div>

                    <h2 className="text-4xl md:text-7xl font-display font-black uppercase italic tracking-tighter">
                        Pr  t    <span className="text-brand-orange not-italic">Transformer</span> <br />
                        votre organisation ?
                    </h2>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                        <Link href="/auth/register" className="w-full sm:w-auto px-12 py-6 bg-brand-orange text-white font-black rounded-2xl text-[12px] uppercase tracking-[0.2em] shadow-2xl shadow-brand-orange/30 hover:scale-110 transition-all orange-glow">
                            D  marrer maintenant
                        </Link>
                        <Link href="/contact" className="w-full sm:w-auto px-12 py-6 glass-card rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all border border-brand-orange/30">
                            Prendre RDV
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
