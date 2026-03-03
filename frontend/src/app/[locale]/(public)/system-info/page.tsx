'use client';

import Link from 'next/link';
import { Sprout, BarChart3, ShieldCheck, Cpu, Layout, BookOpen, ArrowRight, Mail, Calendar, Clock, User, Briefcase, MapPin, Globe, Rocket, Zap, Heart, Search, Bell, MemoryStick as Memory, Shield, RefreshCw, Smartphone, HelpCircle } from 'lucide-react';

export default function SystemInfoPage() {
    return (
        <div className="bg-[var(--bg)] text-[var(--text)] font-sans min-h-screen">
            <main>
                {/* Hero Section */}
                <section className="relative py-24 lg:py-40 bg-[var(--sidebar-bg)] overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(circle_at_50%_100%,var(--green)_0%,transparent_60%)]"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    
                    <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[var(--green)]/20 border border-[var(--green)]/30 text-[var(--green)] text-[10px] font-black uppercase tracking-[0.3em] mb-12 backdrop-blur-md">
                            <ShieldCheck className="w-4 h-4 text-[var(--gold)]" />
                            Guide des Opérations de Précision
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black text-white mb-10 leading-tight italic uppercase tracking-tighter">
                            Flux <br />
                            <span className="text-[var(--gold)] not-italic underline underline-offset-[16px]">Technologique.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto mb-16 font-normal leading-relaxed opacity-90">
                            Notre mission est de propulser votre croissance agricole à travers une infrastructure robuste, IA-native et sécurisée par des protocoles de nouvelle génération.
                        </p>
                        <div className="flex flex-wrap justify-center gap-8">
                            <button className="bg-[var(--green)] text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 hover:scale-105 transition-all shadow-2xl shadow-[var(--green)]/20">
                                <Rocket className="w-5 h-5" />
                                Démo du Système
                            </button>
                            <button className="bg-white/10 text-white border border-white/20 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white/20 transition-all backdrop-blur-md">
                                Documentation Technique
                            </button>
                        </div>
                    </div>
                </section>

                {/* Step-by-Step Infographic */}
                <section className="py-24 bg-white relative">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-20">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--green)] mb-4 italic">Cycle de Vie</h2>
                            <h3 className="text-4xl md:text-5xl font-black text-[var(--text)] italic uppercase tracking-tighter">Processus de <span className="text-[var(--green)] not-italic underline underline-offset-8">Précision.</span></h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 relative">
                            {/* Connecting Line (Desktop) */}
                            <div className="hidden md:block absolute top-[60px] left-0 w-full h-[2px] bg-[var(--border)] -z-0"></div>

                            {[
                                { step: "01", title: "Capture", desc: "Collecte des données via capteurs IoT et imagerie satellite.", icon: <Cpu className="w-8 h-8" /> },
                                { step: "02", title: "Audit IA", desc: "Analyse algorithmique pour identifier les zones de stress.", icon: <Zap className="w-8 h-8" /> },
                                { step: "03", title: "Application", desc: "Déploiement ciblé des ressources et intrants agricoles.", icon: <RefreshCw className="w-8 h-8" /> },
                                { step: "04", title: "Monitoring", desc: "Suivi en temps réel de l'évolution des parcelles.", icon: <BarChart3 className="w-8 h-8" /> },
                                { step: "05", title: "Optimisation", desc: "Ajustement continu pour maximiser le rendement final.", icon: <Rocket className="w-8 h-8" /> },
                            ].map((s, i) => (
                                <div key={i} className="flex flex-col items-center text-center group z-10">
                                    <div className="size-28 rounded-[2.5rem] bg-white border-2 border-[var(--border)] group-hover:border-[var(--green)] flex items-center justify-center text-[var(--text3)] group-hover:text-[var(--green)] shadow-xl shadow-black/[0.02] mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                        {s.icon}
                                    </div>
                                    <span className="text-[10px] font-black text-[var(--green)] uppercase tracking-[0.3em] mb-3 italic">Étape {s.step}</span>
                                    <h3 className="text-[var(--text)] font-black text-xl mb-3 italic uppercase tracking-tight">{s.title}</h3>
                                    <p className="text-[var(--text2)] text-xs leading-relaxed opacity-80 font-normal">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Team Capabilities Grid */}
                <section className="py-24 bg-[var(--bg)]/50">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="mb-20">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text3)] mb-4 italic">Expertise</h2>
                            <h3 className="text-4xl md:text-5xl font-black text-[var(--text)] italic uppercase tracking-tighter">Domaines d'Intervention <span className="text-[var(--gold)] not-italic underline underline-offset-8">Agro-Tech.</span></h3>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { title: "IA & Agronomie", desc: "Modèles prédictifs de maladies et optimisation des sols.", icon: <Zap className="w-6 h-6" />, color: "bg-blue-500" },
                                { title: "IoT & Capteurs", desc: "Réseau de capteurs sol et stations météo connectées.", icon: <Smartphone className="w-6 h-6" />, color: "bg-orange-500" },
                                { title: "Cloud Souverain", desc: "Hébergement sécurisé des données agricoles au Maroc.", icon: <Globe className="w-6 h-6" />, color: "bg-[var(--green)]" },
                                { title: "Support Expert", desc: "Assistance agronomique et technique 24h/24 et 7j/7.", icon: <HelpCircle className="w-6 h-6" />, color: "bg-[var(--gold)]" },
                            ].map((cap, i) => (
                                <div key={i} className="bg-white p-10 rounded-[3rem] border border-[var(--border)] hover:border-[var(--green)]/50 hover:shadow-2xl transition-all duration-500 group cursor-default">
                                    <div className={`size-14 rounded-2xl ${cap.color} text-white flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                                        {cap.icon}
                                    </div>
                                    <h3 className="text-[var(--text)] font-black text-xl mb-4 italic uppercase tracking-tight">{cap.title}</h3>
                                    <p className="text-[var(--text2)] text-sm leading-relaxed opacity-90 font-normal">{cap.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Dashboard Statistics Brief */}
                <section className="py-24 px-6 bg-[var(--sidebar-bg)] relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--green)] opacity-5 blur-[120px] rounded-full"></div>
                    
                    <div className="relative z-10 max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-16">
                        <div className="flex-1 space-y-6 text-center md:text-left">
                            <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-tight">Performance <br /><span className="text-[var(--gold)] not-italic underline underline-offset-8">en Temps Réel.</span></h2>
                            <p className="text-white/60 text-xl font-normal max-w-2xl leading-relaxed opacity-90">Nos systèmes gèrent actuellement des milliers d'hectares avec une précision chirurgicale et une disponibilité totale.</p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-12 items-center">
                            <div className="text-center px-8 border-r border-white/10 group">
                                <div className="text-5xl md:text-6xl font-black text-white italic group-hover:text-[var(--gold)] transition-colors">12m</div>
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mt-3">Réponse Moy.</div>
                            </div>
                            <div className="text-center px-8 group">
                                <div className="text-5xl md:text-6xl font-black text-white italic group-hover:text-[var(--green)] transition-colors">89</div>
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mt-3">Experts Actifs</div>
                            </div>
                            <Link href="/dashboard" className="bg-white text-[var(--sidebar-bg)] px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl">
                                Voir Dashboard
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="py-20 border-t border-[var(--border)] bg-white text-center">
                    <div className="max-w-7xl mx-auto px-6 h-full flex flex-col items-center justify-center space-y-12">
                        <div className="flex flex-wrap justify-center gap-12 text-[10px] font-black text-[var(--text3)] uppercase tracking-[0.4em]">
                            <Link href="/help" className="hover:text-[var(--green)] transition-colors">Support Tech</Link>
                            <Link href="/services" className="hover:text-[var(--green)] transition-colors">Nos Solutions</Link>
                            <Link href="/contact" className="hover:text-[var(--green)] transition-colors">Contact Expert</Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
