'use client';

import Link from 'next/link';
import { Sprout, BarChart3, Truck, Users, Leaf, ArrowRight, Plus } from 'lucide-react';

const SERVICES = [
    { 
        id: 'plots', 
        icon: <Leaf className="w-10 h-10" />, 
        title: 'Gestion des Parcelles', 
        desc: 'Suivi cartographique en temps réel et analyse de la santé des sols par satellite.', 
        href: '/services/plots',
        color: 'var(--green)'
    },
    { 
        id: 'livestock', 
        icon: <Users className="w-10 h-10" />, 
        title: 'Suivi du Cheptel', 
        desc: 'Monitoring intelligent du bétail, gestion de la santé et traçabilité complète.', 
        href: '/services/livestock',
        color: 'var(--gold)'
    },
    { 
        id: 'analytics', 
        icon: <BarChart3 className="w-10 h-10" />, 
        title: 'Analytique Avancée', 
        desc: 'Prévisions de rendement basées sur l\'IA et optimisation des intrants.', 
        href: '/services/analytics',
        color: 'var(--green2)'
    },
    { 
        id: 'supply', 
        icon: <Truck className="w-10 h-10" />, 
        title: 'Chaîne Logistique', 
        desc: 'Optimisation de la distribution et gestion des stocks post-récolte.', 
        href: '/services/supply-chain',
        color: 'var(--text)'
    },
    { 
        id: 'finance', 
        icon: <Sprout className="w-10 h-10" />, 
        title: 'Agro-Finance', 
        desc: 'Gestion des coûts, budgets prévisionnels et accès simplifié aux financements.', 
        href: '/services/finance',
        color: 'var(--green)'
    }
];

export default function ServicesPage() {
    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden px-6 lg:px-20 border-b border-[var(--border)] bg-white/50">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[var(--green)]/5 blur-[150px] -z-10"></div>

                <div className="max-w-7xl mx-auto text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--green3)] border border-[var(--green)]/20 text-[var(--green)] text-[10px] font-black uppercase tracking-widest mx-auto shadow-sm">
                        <span className="w-2 h-2 bg-[var(--green)] rounded-full animate-pulse"></span>
                        Expertise AgroMaître
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black leading-none tracking-tighter uppercase italic">
                        Nos <br />
                        <span className="text-[var(--green)] not-italic">Services.</span>
                    </h1>

                    <p className="text-lg text-[var(--text2)] max-w-2xl mx-auto font-normal leading-relaxed opacity-90">
                        Des solutions technologiques de pointe conçues pour transformer chaque aspect de votre exploitation agricole.
                    </p>
                </div>
            </section>

            {/* Grid Section */}
            <section className="py-32 px-6 lg:px-20 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {SERVICES.map((service, i) => (
                            <Link key={i} href={service.href} className="group relative">
                                <div className="absolute -inset-0.5 bg-gradient-to-br from-[var(--green)]/10 to-transparent rounded-[3rem] blur opacity-0 group-hover:opacity-100 transition duration-700"></div>
                                <div className="relative bg-white p-12 rounded-[3rem] h-full flex flex-col border border-[var(--border)] group-hover:border-[var(--green)]/30 transition-all duration-500 hover:-translate-y-4 shadow-xl shadow-black/[0.02]">
                                    <div className={`w-20 h-20 bg-[var(--bg)] rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-inner ${
                                        service.id === 'plots' ? 'text-[var(--green)]' :
                                        service.id === 'livestock' ? 'text-[var(--gold)]' :
                                        service.id === 'analytics' ? 'text-[var(--green2)]' :
                                        service.id === 'supply' ? 'text-[var(--text)]' :
                                        'text-[var(--green)]'
                                    }`}>
                                        {service.icon}
                                    </div>

                                    <h3 className="text-3xl font-black text-[var(--text)] mb-6 uppercase tracking-tight group-hover:text-[var(--green)] transition-colors">
                                        {service.title}
                                    </h3>

                                    <div className="p-8 rounded-3xl bg-[var(--bg3)]/30 border border-[var(--border)] group-hover:border-[var(--green)]/10 hover:bg-[var(--bg3)]/50 transition-all flex-grow mb-10 shadow-inner">
                                        <p className="text-sm text-[var(--text2)] leading-relaxed font-normal opacity-90">
                                            {service.desc}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[var(--green)] group-hover:gap-6 transition-all duration-500">
                                        Explorer la solution
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {/* Custom Inquiry Card */}
                        <div className="bg-[var(--sidebar-bg)] p-12 rounded-[3.5rem] border border-white/10 h-full flex flex-col items-center justify-center text-center space-y-8 min-h-[450px] shadow-2xl">
                            <div className="w-24 h-24 bg-[var(--gold)] text-white rounded-3xl flex items-center justify-center shadow-xl shadow-[var(--gold)]/30 animate-float">
                                <Plus className="w-12 h-12" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-2xl font-black uppercase italic tracking-tight text-white">Besoin de plus ?</h3>
                                <p className="text-sm text-white/70 font-normal leading-relaxed max-w-[250px] mx-auto">
                                    Nos ingénieurs agronomes conçoivent des solutions sur-mesure pour vos exigences spécifiques.
                                </p>
                            </div>
                            <Link href="/contact" className="px-10 py-5 bg-white text-[var(--sidebar-bg)] font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-[var(--gold)] hover:text-white transition-all transform hover:scale-105 shadow-xl">
                                Contacter l'Expert
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-32 px-6 lg:px-20">
                <div className="max-w-5xl mx-auto bg-[var(--sidebar-bg)] rounded-[4rem] p-16 md:p-24 text-center space-y-12 relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--green)]/10 blur-[100px] -z-10 group-hover:bg-[var(--green)]/20 transition-all duration-1000"></div>

                    <h2 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter text-white">
                        Prêt à <span className="text-[var(--gold)] not-italic">Moderniser</span> <br />
                        votre exploitation ?
                    </h2>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                        <Link href="/auth/register" className="w-full sm:w-auto px-12 py-6 bg-[var(--green)] text-white font-black rounded-2xl text-[12px] uppercase tracking-[0.2em] shadow-2xl shadow-[var(--green)]/30 hover:scale-110 transition-all">
                            Démarrer maintenant
                        </Link>
                        <Link href="/contact" className="w-full sm:w-auto px-12 py-6 bg-white/[0.05] backdrop-blur-md rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] text-white hover:bg-white/10 transition-all border border-white/10">
                            Prendre RDV
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
