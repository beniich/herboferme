'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { Search, Rocket, CreditCard, ShieldCheck, Mail, MessageSquare, ChevronDown, PlayCircle, Globe, Terminal, Users, ArrowRight, Zap, Headphones } from 'lucide-react';

const faqs = [
    {
        category: 'Premiers Pas',
        icon: <Rocket className="w-8 h-8" />,
        items: [
            { q: 'Comment créer un compte exploitation ?', a: 'Cliquer sur le bouton "Essai Gratuit" en haut de la page, remplissez les informations de votre domaine agricole et validez votre email. L\'activation est instantanée.' },
            { q: 'Y a-t-il une période d\'essai ?', a: 'Oui, nous proposons un essai gratuit de 14 jours incluant tous les outils d\'analyse satellite et le suivi du sol. Pas de carte bancaire requise.' },
            { q: 'Comment inviter mes ingénieurs ?', a: 'Accédez à Paramètres > Équipe. Vous pouvez inviter vos collaborateurs par email et définir leurs rôles (agronome, gestionnaire, chauffeur).' },
        ]
    },
    {
        category: 'Facturation & Plans',
        icon: <CreditCard className="w-8 h-8" />,
        items: [
            { q: 'Puis-je changer de plan à tout moment ?', a: 'Absolument. Les mises à niveau prennent effet immédiatement. Les passages à un plan inférieur s\'appliquent à la fin de la période de facturation en cours.' },
            { q: 'Quels sont les modes de paiement au Maroc ?', a: 'Nous acceptons les cartes bancaires marocaines (CMI), les virements, et les solutions de paiement mobile locales pour les coopératives.' },
        ]
    },
    {
        category: 'Technologie & IA',
        icon: <Zap className="w-8 h-8" />,
        items: [
            { q: 'Précision de l\'imagerie satellite ?', a: 'Nos modèles utilisent des données multispectrales avec une résolution de 50cm/pixel, calibrées spécifiquement pour les cultures du Souss et du Gharb.' },
            { q: 'Sécurité de mes données de parcelles ?', a: 'Vos données sont protégées par un cryptage AES-256 et stockées conformément aux lois marocaines sur la protection des données personnelles (CNDP).' },
        ]
    },
];

export default function HelpPage() {
    return (
        <div className="bg-[var(--bg)] text-[var(--text)] font-sans selection:bg-[var(--green)] selection:text-white min-h-screen">
            <main>
                {/* Search Hero */}
                <section className="relative pt-32 pb-48 bg-[var(--sidebar-bg)] overflow-hidden text-center">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,var(--green)_0%,transparent_50%)] opacity-30"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    </div>

                    <div className="relative z-10 max-w-4xl mx-auto px-6">
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.4em] mb-12 shadow-sm italic animate-fade-in text-center mx-auto">
                            <Headphones className="w-4 h-4 text-[var(--gold)]" />
                            Centre d'Assistance Élite
                        </div>
                        <h1 className="text-5xl md:text-[7rem] font-black text-white mb-12 leading-[0.85] tracking-tighter uppercase italic">
                            Comment <br />
                            <span className="text-[var(--gold)] not-italic underline underline-offset-[16px] decoration-8 decoration-[var(--green)]">Vous Aider ?</span>
                        </h1>
                        
                        <div className="relative max-w-2xl mx-auto group mt-16 scale-100 focus-within:scale-105 transition-transform duration-500">
                            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-white/30 w-6 h-6" />
                            <input 
                                type="text"
                                placeholder="Rechercher une solution technique..."
                                className="w-full h-24 bg-white/5 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] pl-20 pr-12 text-white font-medium outline-none focus:border-[var(--gold)] focus:bg-white/10 transition-all placeholder:text-white/20 shadow-2xl"
                            />
                        </div>
                    </div>
                </section>

                {/* Quick Access Grid */}
                <section className="py-24 max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-8 -mt-24 relative z-20">
                    {[
                        { label: 'État Système', icon: <Globe />, href: '/status' },
                        { label: 'Documentation', icon: <Terminal />, href: '#' },
                        { label: 'Communauté', icon: <Users />, href: '#' },
                        { label: 'Vision App', icon: <PlayCircle />, href: '#' }
                    ].map((item, i) => (
                        <Link key={i} href={item.href} className="group p-10 bg-white rounded-[2.5rem] border border-[var(--border)] hover:border-[#FE7F2D] hover:shadow-electric hover:-translate-y-4 transition-all duration-500 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-2xl bg-[var(--bg)] flex items-center justify-center text-[var(--green)] group-hover:bg-[var(--green)] group-hover:text-white transition-all mb-6">
                                {React.cloneElement(item.icon as React.ReactElement<any>, { size: 28 })}
                            </div>
                            <span className="text-xs font-black text-[var(--text)] uppercase tracking-[0.2em] italic">{item.label}</span>
                        </Link>
                    ))}
                </section>

                {/* FAQ sections */}
                <section className="py-32 max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-20">
                    <div className="lg:col-span-4 space-y-12">
                        <div className="space-y-4">
                            <h2 className="text-[10px] font-black text-[var(--green)] uppercase tracking-[0.5em] italic">Catégories</h2>
                            <div className="h-1 bg-[var(--border)] w-20"></div>
                        </div>
                        <div className="space-y-4">
                            {faqs.map((f, i) => (
                                <a key={i} href={`#${i}`} className="flex items-center gap-4 p-6 rounded-2xl border border-transparent hover:border-[var(--border)] hover:bg-white transition-all group no-underline text-left">
                                    <div className="text-[var(--text3)] group-hover:text-[var(--green)] transition-colors">{React.cloneElement(f.icon as React.ReactElement<any>, { size: 20 })}</div>
                                    <span className="text-sm font-black text-[var(--text)] uppercase tracking-tight italic opacity-60 group-hover:opacity-100 transition-opacity">{f.category}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-8 space-y-24">
                        {faqs.map((section, si) => (
                            <div key={si} id={si.toString()} className="space-y-12 scroll-mt-32">
                                <div className="flex items-center gap-6">
                                    <div className="text-[var(--green)]">{section.icon}</div>
                                    <h3 className="text-3xl font-black text-[var(--text)] italic uppercase tracking-tighter">{section.category}</h3>
                                </div>
                                <div className="space-y-6">
                                    {section.items.map((item, ii) => (
                                        <details key={ii} className="group bg-white border border-[var(--border)] rounded-[3rem] overflow-hidden hover:border-[var(--green)]/30 transition-all shadow-xl shadow-black/[0.01]">
                                            <summary className="flex items-center justify-between p-10 cursor-pointer font-black text-xl italic uppercase tracking-tighter group-open:text-[var(--green)] transition-all list-none">
                                                {item.q}
                                                <div className="w-12 h-12 rounded-full bg-[var(--bg)] flex items-center justify-center group-open:rotate-180 transition-transform">
                                                    <ChevronDown className="text-[var(--green)]" />
                                                </div>
                                            </summary>
                                            <div className="px-10 pb-10 text-lg text-[var(--text2)] leading-relaxed font-normal opacity-70 border-t border-[var(--border)] pt-8 italic">
                                                {item.a}
                                            </div>
                                        </details>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Support Card */}
                <section className="py-32 px-6">
                    <div className="max-w-6xl mx-auto rounded-[5rem] bg-[var(--sidebar-bg)] p-16 lg:p-32 text-center text-white relative overflow-hidden shadow-2xl pulse-electric">
                        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,var(--green)_0%,transparent_50%)] opacity-30"></div>
                        <div className="relative z-10 space-y-12">
                             <div className="w-24 h-24 rounded-3xl bg-white/10 flex items-center justify-center mx-auto mb-12 shadow-2xl border border-white/20">
                                <MessageSquare className="w-10 h-10 text-[var(--gold)]" />
                            </div>
                            <h2 className="text-4xl lg:text-7xl font-black italic uppercase tracking-tighter leading-[0.9]">
                                Toujours une <br />
                                <span className="text-[var(--gold)] not-italic underline underline-offset-[16px] decoration-white/20">Solution.</span>
                            </h2>
                            <p className="text-xl text-white/50 max-w-2xl mx-auto font-normal italic">
                                Nos experts basés à Casablanca et Souss vous répondent en moins de 15 minutes, 24h/24. 🇲🇦
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
                                <Link href="/contact" className="w-full sm:w-auto px-12 py-6 bg-white text-[var(--sidebar-bg)] rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:scale-105 transition-all italic">
                                    Ouvrir un ticket
                                </Link>
                                <a href="mailto:support@agromaitre.ma" className="w-full sm:w-auto px-12 py-6 bg-white/10 border border-white/20 rounded-2xl font-black text-xs uppercase tracking-[0.3em] text-white hover:bg-white/20 transition-all flex items-center justify-center gap-3 italic">
                                    <Mail size={16} /> support@agromaitre.ma
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

