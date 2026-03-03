'use client';

import Link from 'next/link';
import { Newspaper, ShieldCheck, Download, FolderArchive, FileText, Video, Mail, Phone, ArrowRight, Globe, BarChart3, Sprout, Cpu } from 'lucide-react';

export default function PressPage() {
    const mentions = [
        { publication: 'AgriTech Insights', date: 'Fév 2026', headline: '"AgroMaître Pro : Le futur de l\'agriculture de précision est souverain."' },
        { publication: 'SaaS Mag Afrique', date: 'Jan 2026', headline: '"De la startup au leader : comment AgroMaître a conquis 500+ exploitations majeures."' },
        { publication: 'Le Matin Éco', date: 'Déc 2025', headline: '"AgroMaître sécurise 120M DH en Série B pour accélérer l\'intégration de l\'IA."' },
    ];

    const assets = [
        { name: 'Identité Visuelle (SVG)', desc: 'Variations claire et sombre', icon: <Cpu className="w-6 h-6" />, size: '12 KB' },
        { name: 'Guide de Marque Global', desc: 'Typographie et palette de couleurs', icon: <FileText className="w-6 h-6" />, size: '4.5 Mo' },
        { name: 'Kit Visualisation UI', desc: 'Mockups dashboard et mobile', icon: <BarChart3 className="w-6 h-6" />, size: '12.2 Mo' },
        { name: 'Pack Média Entreprise', desc: 'Archive ZIP complète', icon: <FolderArchive className="w-6 h-6" />, size: '45 Mo' },
        { name: 'Biographies Exécutives', desc: 'Profils et photos de la direction', icon: <ShieldCheck className="w-6 h-6" />, size: '3.1 Mo' },
        { name: 'Reel Plateforme (60s)', desc: '4K ProRes — Sous-titres multilingues', icon: <Video className="w-6 h-6" />, size: '280 Mo' },
    ];

    return (
        <div className="bg-[var(--bg)] text-[var(--text)] font-sans min-h-screen">
            <main>
                {/* Hero Section */}
                <section className="relative py-24 lg:py-40 bg-[var(--sidebar-bg)] overflow-hidden text-center shadow-2xl">
                    <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(circle_at_50%_0%,var(--green)_0%,transparent_60%)]"></div>
                    <div className="relative z-10 max-w-5xl mx-auto px-6">
                        <div className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-[var(--green)]/20 text-[var(--green)] text-[10px] font-black tracking-[0.3em] uppercase mb-12 border border-[var(--green)]/30 backdrop-blur-md">
                            <Globe className="w-4 h-4 text-[var(--gold)]" />
                            Hub Média Global
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black text-white mb-10 italic uppercase tracking-tighter">Espace <br /><span className="text-[var(--gold)] not-italic underline underline-offset-[16px]">Presse.</span></h1>
                        <p className="text-xl md:text-2xl text-white/70 font-normal max-w-3xl mx-auto mb-16 opacity-90 leading-relaxed">
                            Ressources officielles, récits vérifiés et actifs visuels haute fidélité pour nos partenaires médias.
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-white/5 pt-16">
                            {[
                                { val: '120M', label: 'Levée Série B (DH)' },
                                { val: '500+', label: 'Domaines Agricoles' },
                                { val: '14+', label: 'Nœuds Régionaux' },
                                { val: '2.4M', label: 'Hectares Monitorés' },
                            ].map((s, i) => (
                                <div key={i} className="text-center group">
                                    <div className="text-3xl md:text-5xl font-black text-white italic group-hover:text-[var(--gold)] transition-colors duration-500">{s.val}</div>
                                    <div className="text-[10px] text-[var(--green)] uppercase tracking-[0.2em] mt-3 font-black opacity-80">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Media Coverage */}
                <section className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="mb-20">
                            <h2 className="text-[var(--green)] font-black text-[10px] uppercase tracking-[0.3em] mb-4 italic">Récits Vérifiés</h2>
                            <h3 className="text-4xl md:text-5xl font-black text-[var(--text)] italic uppercase tracking-tighter">Couverture <span className="text-[var(--green)] not-italic underline underline-offset-8">Récente.</span></h3>
                        </div>

                        <div className="grid md:grid-cols-3 gap-10">
                            {mentions.map((m, i) => (
                                <div key={i} className="flex flex-col p-10 bg-[var(--bg)] rounded-[3rem] border border-[var(--border)] hover:border-[var(--green)]/40 hover:shadow-2xl transition-all duration-500 group">
                                    <div className="flex items-center justify-between mb-10">
                                        <div className="w-14 h-14 bg-[var(--green)]/10 rounded-2xl flex items-center justify-center text-[var(--green)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                            <Newspaper className="w-8 h-8" />
                                        </div>
                                        <span className="text-[10px] font-black text-[var(--text3)] uppercase tracking-[0.2em]">{m.date}</span>
                                    </div>
                                    <p className="font-black text-2xl mb-6 group-hover:text-[var(--green)] transition-all italic uppercase tracking-tight">{m.publication}</p>
                                    <p className="text-[var(--text2)] italic font-normal text-sm flex-1 leading-relaxed opacity-90">"{m.headline}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Assets Grid */}
                <section className="py-24 bg-[var(--bg)]/50 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="mb-20 text-right">
                            <h2 className="text-[var(--green)] font-black text-[10px] uppercase tracking-[0.3em] mb-4 italic">Cœur Visuel</h2>
                            <h3 className="text-4xl md:text-5xl font-black text-[var(--text)] italic uppercase tracking-tighter">Actifs <span className="text-[var(--gold)] not-italic underline underline-offset-8">de Marque.</span></h3>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {assets.map((asset, i) => (
                                <div key={i} className="group bg-white border border-[var(--border)] rounded-[3rem] p-8 hover:border-[var(--green)]/50 transition-all duration-500 cursor-pointer shadow-xl shadow-black/[0.01] hover:shadow-2xl hover:shadow-[var(--green)]/5">
                                    <div className="flex items-center gap-6 mb-8">
                                        <div className="w-16 h-16 bg-[var(--green)]/10 rounded-[1.5rem] flex items-center justify-center text-[var(--green)] group-hover:bg-[var(--green)] group-hover:text-white transition-all duration-500 shadow-inner">
                                            {asset.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-[var(--text)] text-sm uppercase tracking-tight italic">{asset.name}</h4>
                                            <p className="text-[10px] font-black text-[var(--text3)] uppercase tracking-widest mt-1">{asset.size}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-[var(--text2)] mb-8 leading-relaxed font-normal opacity-90">{asset.desc}</p>
                                    <div className="flex items-center gap-3 text-[var(--green)] text-[10px] font-black uppercase tracking-[0.2em] group-hover:translate-x-3 transition-transform duration-500">
                                        Télécharger <Download className="w-4 h-4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Press Contact */}
                <section className="py-32 bg-[var(--sidebar-bg)] relative text-white shadow-2xl">
                    <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(circle_at_0%_100%,var(--green)_0%,transparent_40%)]"></div>
                    <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-16">
                        <div className="space-y-6">
                            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">Communication <br /><span className="text-[var(--gold)] not-italic underline underline-offset-8">Directe.</span></h2>
                            <p className="text-white/60 text-xl font-normal max-w-2xl mx-auto opacity-90 leading-relaxed">Pour toute interview, demande stratégique ou validation d'accréditation :</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="bg-white/5 border border-white/10 rounded-[3rem] p-12 backdrop-blur-md hover:border-[var(--green)]/30 transition-all duration-500 shadow-2xl">
                                <h3 className="text-xl font-black mb-4 uppercase tracking-tight italic">Relations Presse</h3>
                                <p className="text-[var(--gold)] font-black text-2xl mb-2 tracking-tighter underline underline-offset-8">press@agromaitre.ma</p>
                                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mt-4">+212 522 555 012</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-[3rem] p-12 backdrop-blur-md hover:border-[var(--green)]/30 transition-all duration-500 shadow-2xl">
                                <h3 className="text-xl font-black mb-4 uppercase tracking-tight italic">Investisseurs</h3>
                                <p className="text-[var(--gold)] font-black text-2xl mb-2 tracking-tighter underline underline-offset-8">ir@agromaitre.ma</p>
                                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mt-4">+212 522 555 013</p>
                            </div>
                        </div>

                        <Link href="/contact" className="inline-flex items-center gap-4 bg-white text-[var(--sidebar-bg)] px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl">
                            Formulaire de Contact Média <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </section>

                <section className="py-20 border-t border-[var(--border)] bg-white text-center">
                    <div className="max-w-7xl mx-auto px-6 h-full flex flex-col items-center justify-center space-y-12">
                        <div className="flex flex-wrap justify-center gap-12 text-[10px] font-black text-[var(--text3)] uppercase tracking-[0.4em]">
                            <Link href="/about" className="hover:text-[var(--green)] transition-colors">Notre Vision</Link>
                            <Link href="/blog" className="hover:text-[var(--green)] transition-colors">Actualités</Link>
                            <Link href="/careers" className="hover:text-[var(--green)] transition-colors">Carrières</Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
