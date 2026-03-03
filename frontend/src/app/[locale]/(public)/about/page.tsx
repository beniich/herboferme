'use client';

import React from 'react';
import Link from 'next/link';
import { Sprout, Target, Shield, Zap, Users, Globe, Award, Heart, Rocket, LandPlot, Handshake, ChevronRight } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="bg-[var(--bg)] text-[var(--text)] font-sans selection:bg-[var(--green)] selection:text-white overflow-hidden">
            <main>
                {/* Hero Section - The Essence */}
                <section className="relative pt-32 pb-48 lg:pt-48 lg:pb-72 flex items-center justify-center overflow-hidden">
                    {/* Background layers */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,var(--green)_0%,transparent_50%)] opacity-10"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
                        <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-[var(--gold)] opacity-5 blur-[150px] rounded-full"></div>
                        <div className="absolute -bottom-24 -left-24 w-[600px] h-[600px] bg-[var(--green)] opacity-5 blur-[150px] rounded-full"></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/50 backdrop-blur-md border border-[var(--green)]/20 text-[var(--green)] text-[10px] font-black uppercase tracking-[0.4em] mb-12 shadow-sm italic animate-fade-in">
                            <Sprout className="w-4 h-4" />
                            Depuis Casablanca, pour le Monde
                        </div>
                        <h1 className="text-6xl md:text-[8rem] font-black text-[var(--text)] mb-12 leading-[0.85] tracking-tighter uppercase italic">
                            Redéfinir le <br />
                            <span className="text-[var(--green)] not-italic underline underline-offset-[16px] decoration-8">Sillon Numérique.</span>
                        </h1>
                        <p className="text-xl md:text-3xl text-[var(--text2)] max-w-4xl mx-auto mb-16 font-normal leading-relaxed opacity-80 italic">
                            Chez <span className="text-[var(--green)] font-black">AgroMaître</span>, nous ne créons pas seulement des logiciels ; nous forgeons l'avenir de la souveraineté alimentaire à travers la donnée.
                        </p>
                    </div>

                    {/* Decorative Slicing */}
                    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[var(--bg)] to-transparent"></div>
                </section>

                {/* The Genesis - Story Section */}
                <section className="py-48 bg-white relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="grid lg:grid-cols-2 gap-32 items-center text-left">
                            <div className="space-y-12">
                                <div>
                                    <div className="text-[10px] font-black text-[var(--gold)] uppercase tracking-[0.5em] mb-6 italic">Notre Genèse</div>
                                    <h2 className="text-5xl lg:text-7xl font-black text-[var(--text)] italic uppercase tracking-tighter leading-none mb-10">
                                        De la Terre <br />
                                        <span className="text-[var(--green)] not-italic">À l'Algorithme.</span>
                                    </h2>
                                    <p className="text-xl text-[var(--text2)] leading-relaxed font-normal opacity-70 border-l-4 border-[var(--green)] pl-8 mb-10">
                                        Tout a commencé dans les vergers d'agrumes du Souss. Nous avons vu le courage des agriculteurs face au stress hydrique et aux marchés incertains. Notre mission est devenue limpide : armer ces gardiens de la terre avec l'intelligence du 21ème siècle.
                                    </p>
                                    <p className="text-lg text-[var(--text2)] leading-relaxed opacity-60">
                                        Aujourd'hui, AgroMaître fusionne l'expertise agronomique millénaire du Maroc avec les technologies de pointe : IA prédictive, IoT bas-débit et imagerie spectrale.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="p-10 rounded-[3rem] bg-[var(--bg)] border border-[var(--border)] group hover:border-[var(--green)] transition-all">
                                        <div className="text-5xl font-black text-[var(--green)] mb-3 italic">2.4M</div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text3)]">Hectares Analysés</div>
                                    </div>
                                    <div className="p-10 rounded-[3rem] bg-[var(--bg)] border border-[var(--border)] group hover:border-[var(--green)] transition-all">
                                        <div className="text-5xl font-black text-[var(--green)] mb-3 italic">15k</div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text3)]">Domaines Connectés</div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative group perspective-1000">
                                <div className="absolute -inset-10 bg-[var(--green)]/10 rounded-full blur-[100px] opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative bg-[var(--sidebar-bg)] rounded-[4rem] p-16 shadow-2xl border border-white/10 rotate-3 group-hover:rotate-0 transition-all duration-700 overflow-hidden text-center aspect-square flex flex-col items-center justify-center">
                                    <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                                    <div className="relative z-10">
                                        <div className="size-32 bg-[var(--green)] rounded-[2rem] flex items-center justify-center text-white mb-10 mx-auto shadow-2xl animate-pulse">
                                            <Globe size={64} />
                                        </div>
                                        <h4 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Hub Technologique</h4>
                                        <p className="text-white/40 text-xs font-black uppercase tracking-[0.3em]">IA Agropulse Engine v4.0</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Principles Section */}
                <section className="py-48 px-6 bg-[var(--bg)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--green)]/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                    
                    <div className="max-w-7xl mx-auto relative z-10 text-center">
                        <div className="mb-32">
                            <div className="text-[10px] font-black text-[var(--green)] uppercase tracking-[0.5em] mb-6 italic">Nos Fondations</div>
                            <h2 className="text-5xl lg:text-7xl font-black text-[var(--text)] italic uppercase tracking-tighter leading-none mb-10">
                                L'Éthique de la <span className="text-[var(--gold)] not-italic underline underline-offset-8">Précision.</span>
                            </h2>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-12">
                            {[
                                { 
                                    icon: <Target className="w-12 h-12" />, 
                                    title: "Obsession de l'Impact", 
                                    desc: "Nous ne mesurons pas notre succès en lignes de code, mais en tonnes récoltées et en litres d'eau économisés." 
                                },
                                { 
                                    icon: <Shield className="w-12 h-12" />, 
                                    title: "Souveraineté des Données", 
                                    desc: "Vos données sont le patrimoine de votre terre. Nous les protégeons avec des protocoles ultra-sécurisés." 
                                },
                                { 
                                    icon: <Zap className="w-12 h-12" />, 
                                    title: "Innovation Fertile", 
                                    desc: "Chaque semaine, nous injectons de nouveaux modèles d'apprentissage profond pour prédire l'imprévisible." 
                                },
                            ].map((val, i) => (
                                <div key={i} className="bg-white p-16 rounded-[4rem] border border-[var(--border)] group hover:border-[var(--green)] transition-all shadow-xl hover:-translate-y-4 duration-500 text-left relative overflow-hidden">
                                     <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--bg)] rounded-bl-[4rem] -z-0 group-hover:bg-[var(--green)]/10 transition-colors"></div>
                                    <div className="mb-10 text-[var(--green)] relative z-10 group-hover:scale-110 transition-transform">
                                        {val.icon}
                                    </div>
                                    <h4 className="text-2xl font-black text-[var(--text)] mb-6 uppercase italic tracking-tighter">{val.title}</h4>
                                    <p className="text-[var(--text2)] leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity font-normal">{val.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Call to Collaboration */}
                <section className="py-32 px-6">
                    <div className="max-w-5xl mx-auto rounded-[4rem] bg-[var(--green)] p-16 lg:p-24 text-center text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <h2 className="text-4xl lg:text-6xl font-black italic uppercase tracking-tighter leading-none mb-12">
                            Écrivons le Prochain Chapitre <br />
                            <span className="text-[var(--gold)] not-italic underline underline-offset-8">Ensemble.</span>
                        </h2>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                            <Link href="/contact" className="w-full sm:w-auto px-12 py-6 bg-white text-[var(--green)] rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl">
                                Devenir Partenaire
                            </Link>
                            <Link href="/careers" className="w-full sm:w-auto px-12 py-6 bg-transparent border-2 border-white/30 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-white/10 transition-all flex items-center justify-center gap-4 group">
                                Rejoindre l'Équipe <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

