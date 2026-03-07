'use client';

import React, { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { 
    Sprout, 
    ArrowRight, 
    CheckCircle2, 
    BarChart3, 
    Map as MapIcon, 
    Layers, 
    ShieldCheck,
    Zap,
    Users,
    ChevronRight,
    PlayCircle,
    Globe,
    Leaf,
    Cpu,
    Target
} from 'lucide-react';

export default function LandingPage() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <div className="flex flex-col bg-[var(--bg)]">
            {/* HERO SECTION - THE WOW FACTOR */}
            <section className="relative pt-32 pb-48 lg:pt-48 lg:pb-72 overflow-hidden">
                {/* Dynamic Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,var(--green)_0%,transparent_50%)] opacity-10"></div>
                    <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-[var(--gold)] opacity-5 blur-[150px] rounded-full animate-pulse"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 text-center">
                    <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/50 backdrop-blur-md border border-[var(--green)]/20 text-[var(--green)] text-[10px] font-black uppercase tracking-[0.4em] mb-12 shadow-sm animate-fade-in">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--green)] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--green)]"></span>
                        </span>
                        L'Intelligence du Souss au Sahara
                    </div>
                    
                    <h1 className="text-6xl lg:text-[10rem] font-black text-[var(--text)] tracking-tighter mb-12 leading-[0.85] italic uppercase">
                        La Terre <br />
                        <span className="text-[var(--green)] not-italic underline underline-offset-[20px] decoration-8">Connectée.</span>
                    </h1>
                    
                    <p className="max-w-3xl mx-auto text-xl lg:text-3xl text-[var(--text2)] mb-16 font-normal leading-relaxed opacity-80 decoration-none">
                        AgroMaître transforme chaque hectare en un écosystème de données précises. 
                        Augmentez vos rendements de <span className="text-[var(--green)] font-black italic">+30%</span> grâce à l'IA agricole.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                        <Link href="/register" className="group w-full sm:w-auto px-12 py-6 bg-[var(--green)] text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-[var(--green2)] transition-all shadow-2xl shadow-[var(--green)]/30 flex items-center justify-center gap-4">
                            Démarrer l'Épopée
                            {isMounted && <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />}
                        </Link>
                        <Link href="/about" className="w-full sm:w-auto px-12 py-6 bg-white/50 backdrop-blur-md border-2 border-[var(--border)] text-[var(--text)] rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-white transition-all flex items-center justify-center gap-4 group">
                            {isMounted && <PlayCircle size={18} className="text-[var(--green)]" />}
                            Découvrir la Vision
                        </Link>
                    </div>
                </div>

                {/* ABSTRACT DECORATION */}
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[var(--bg)] to-transparent"></div>
            </section>

            {/* STATISTICS SECTION - SOCIAL PROOF */}
            <section className="relative -mt-24 z-20 px-6">
                <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-1 p-1 bg-gradient-to-r from-[var(--gold)] to-[var(--green)] rounded-[3rem] overflow-hidden shadow-electric">
                    {[
                        { label: "Domaines Actifs", value: "1,200+", sub: "Partout au Maroc" },
                        { label: "Rendement Moyen", value: "+28%", sub: "Sous 6 mois" },
                        { label: "Économie d'Eau", value: "45%", sub: "Irrigation Intelligente" },
                        { label: "Précision IA", value: "99.9%", sub: "Analyse Satellite" },
                    ].map((stat, i) => (
                        <div key={i} className="bg-[var(--bg)] p-10 text-center hover:bg-white transition-colors group">
                            <div className="text-3xl lg:text-5xl font-black text-[var(--text)] mb-2 group-hover:text-[var(--green)] transition-colors">{stat.value}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text3)] mb-1">{stat.label}</div>
                            <div className="text-[9px] text-[var(--green)] font-bold italic opacity-60 uppercase tracking-tighter">{stat.sub}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CORE TECHNOLOGY - THE "WHY" */}
            <section className="py-48 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-end justify-between mb-32 gap-12">
                        <div className="lg:w-1/2">
                            <div className="text-[10px] font-black text-[var(--green)] uppercase tracking-[0.5em] mb-6 italic">Technologie de Pointe</div>
                            <h2 className="text-5xl lg:text-7xl font-black text-[var(--text)] italic uppercase tracking-tighter leading-none">
                                Un Pilotage <br />
                                <span className="text-[var(--gold)] not-italic">Hyper-Précis.</span>
                            </h2>
                        </div>
                        <p className="lg:w-1/3 text-lg text-[var(--text2)] leading-relaxed opacity-70 border-l-4 border-[var(--green)] pl-8">
                            Notre plateforme combine imagerie satellite, capteurs IoT et algorithmes prédictifs pour anticiper chaque besoin de vos cultures avant même qu'ils ne surviennent.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { 
                                icon: <Target className="w-12 h-12" />, 
                                title: "Ciblage Chirurgical", 
                                desc: "Identifiez les zones de stress hydrique avec une précision de 10cm².",
                                color: "var(--green)"
                            },
                            { 
                                icon: <Cpu className="w-12 h-12" />, 
                                title: "IA Fertile", 
                                desc: "Des recommandations automatiques basées sur 10 ans de données agronomiques.",
                                color: "var(--gold)"
                            },
                            { 
                                icon: <Globe className="w-12 h-12" />, 
                                title: "Réseau National", 
                                desc: "Connectez vos domaines du Souss au Gharb sur une interface unifiée.",
                                color: "var(--green)"
                            },
                        ].map((tech, i) => (
                            <div key={i} className="group p-12 bg-[var(--bg2)] rounded-[3.5rem] border border-[var(--border)] hover:border-[var(--gold)] transition-all hover:shadow-electric hover:-translate-y-4 duration-500 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--green)]/5 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                                <div className="mb-10 text-[var(--green)] group-hover:scale-110 transition-transform duration-500" style={{ color: tech.color }}>
                                    {isMounted && tech.icon}
                                </div>
                                <h3 className="text-2xl font-black text-[var(--text)] mb-6 uppercase italic tracking-tighter">{tech.title}</h3>
                                <p className="text-[var(--text2)] leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">{tech.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CALL TO ACTION - THE CLOSER */}
            <section className="pb-32 px-6">
                <div className="max-w-7xl mx-auto rounded-[5rem] bg-[var(--sidebar-bg)] p-16 lg:p-32 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_100%_100%,var(--green)_0%,transparent_60%)] opacity-20"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    
                    <div className="relative z-10 text-center space-y-12">
                        <div className="text-[10px] font-black text-[var(--gold)] uppercase tracking-[0.6em] mb-8 italic">Prêt pour la Révolution ?</div>
                        <h2 className="text-5xl lg:text-8xl font-black text-[var(--text)] italic uppercase tracking-tighter leading-[0.9]">
                            Cultivons le <br />
                            <span className="text-[var(--green)] underline underline-offset-[12px] not-italic">Futur de la Terre.</span>
                        </h2>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8">
                            <Link href="/register" className="w-full sm:w-auto px-16 py-8 bg-[var(--gold)] text-[var(--bg)] rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] hover:bg-[var(--gold2)] transition-all shadow-electric hover:scale-105">
                                Créer mon Compte
                            </Link>
                            <Link href="/contact" className="w-full sm:w-auto px-16 py-8 bg-transparent border-2 border-white/20 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] hover:bg-white/10 transition-all">
                                Parler à un Expert
                            </Link>
                        </div>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] italic pt-4">Aucune installation complexe requise • Déploiement en 48h</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
