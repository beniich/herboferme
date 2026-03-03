'use client';

import Link from 'next/link';
import { Sprout, BarChart3, ShieldCheck, Cpu, Layout, BookOpen, ArrowRight, Mail, Calendar, Clock, User, Briefcase, MapPin, Globe, Rocket, Award, Zap, Heart } from 'lucide-react';

const jobs = [
    { title: 'Ingénieur Full-Stack Agro-Tech', dept: 'Engineering', location: 'Remote / Maroc', type: 'CDI', badge: '🔥 Urgent' },
    { title: 'Product Manager Système IoT', dept: 'Produit', location: 'Casablanca / Hybride', type: 'CDI', badge: null },
    { title: 'Expert Agronome Data Science', dept: 'R&D', location: 'Agadir / Remote', type: 'CDI', badge: '🆕 Nouveau' },
    { title: 'Développeur React Native / Mobile', dept: 'Engineering', location: 'Remote', type: 'Freelance', badge: null },
    { title: 'Customer Success Manager Agro', dept: 'Support', location: 'Meknès', type: 'CDI', badge: '🆕 Nouveau' },
    { title: 'Stagiaire Infrastructure Cloud', dept: 'Engineering', location: 'Casablanca', type: 'Stage', badge: null },
];

const perks = [
    { icon: <Globe className="w-8 h-8" />, title: 'Culture Distribuée', desc: 'Travaillez d\'où vous voulez, que ce soit à la ferme ou en ville.' },
    { icon: <Zap className="w-8 h-8" />, title: 'Impact Réel', desc: 'Vos lignes de code améliorent directement la vie des agriculteurs.' },
    { icon: <Award className="w-8 h-8" />, title: 'Budget Formation', desc: 'Un budget annuel de 25 000 DH pour vos formations et conférences.' },
    { icon: <Rocket className="w-8 h-8" />, title: 'Équipement Premium', desc: 'Dernier MacBook Pro et setup de bureau complet chez vous.' },
    { icon: <Heart className="w-8 h-8" />, title: 'Santé Élite', desc: 'Couverture santé premium à 100% pour vous et votre famille.' },
    { icon: <MapPin className="w-8 h-8" />, title: 'Séminaires Nature', desc: 'Deux off-sites par an dans des domaines agricoles d\'exception.' },
];

export default function CareersPage() {
    return (
        <div className="bg-[var(--bg)] text-[var(--text)] font-sans min-h-screen">
            <main>
                {/* Hero Section */}
                <section className="relative py-24 lg:py-40 bg-[var(--sidebar-bg)] overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(circle_at_50%_100%,var(--green)_0%,transparent_60%)]"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    
                    <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[var(--green)]/20 border border-[var(--green)]/30 text-[var(--green)] text-[10px] font-black uppercase tracking-[0.3em] mb-12 backdrop-blur-md">
                            <Rocket className="w-4 h-4 text-[var(--gold)]" />
                            Nous recrutons des talents
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black text-white mb-10 leading-tight italic uppercase tracking-tighter">
                            Cultivez le futur <br />
                            <span className="text-[var(--gold)] not-italic underline underline-offset-[16px]">de l'agriculture.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto mb-16 font-normal leading-relaxed opacity-90">
                            Rejoignez AgroMaître pour bâtir les outils de précision qui transforment le secteur agricole. Nous recherchons des passionnés, pas seulement des experts.
                        </p>
                        <div className="flex flex-wrap justify-center gap-12 text-white/40 text-[10px] font-black uppercase tracking-[0.2em] border-t border-white/5 pt-12">
                            <span className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-[var(--gold)] rounded-full"></div> 100% Distribué</span>
                            <span className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-[var(--gold)] rounded-full"></div> Mission Sociale</span>
                            <span className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-[var(--gold)] rounded-full"></div> Tech de Pointe</span>
                        </div>
                    </div>
                </section>

                {/* Cultural Perks */}
                <section className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="mb-20">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--green)] mb-4 italic">Culture d'Excellence</h2>
                            <h3 className="text-4xl md:text-5xl font-black text-[var(--text)] italic uppercase tracking-tighter">Pourquoi <span className="text-[var(--green)] not-italic underline underline-offset-8">nous rejoindre ?</span></h3>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {perks.map((p, i) => (
                                <div key={i} className="p-10 rounded-[3rem] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--green)]/30 hover:shadow-2xl transition-all duration-500 group">
                                    <div className="w-16 h-16 bg-[var(--green)]/10 rounded-2xl flex items-center justify-center text-[var(--green)] mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                        {p.icon}
                                    </div>
                                    <h4 className="text-2xl font-black mb-4 italic uppercase tracking-tight">{p.title}</h4>
                                    <p className="text-[var(--text2)] text-sm leading-relaxed opacity-90 font-normal">{p.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Open Positions */}
                <section className="py-24 bg-[var(--bg)]/50" id="listings">
                    <div className="max-w-5xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                            <div>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text3)] mb-4 italic">Opportunités</h2>
                                <h3 className="text-4xl md:text-5xl font-black text-[var(--text)] italic uppercase tracking-tighter">Missions <span className="text-[var(--gold)] not-italic decoration-[var(--gold)] underline underline-offset-8">Actives.</span></h3>
                            </div>
                            <div className="text-right flex items-center gap-6">
                                <div className="text-5xl font-black text-[var(--green)] italic">{jobs.length}</div>
                                <p className="text-[10px] font-black text-[var(--text3)] uppercase tracking-widest leading-tight">Canaux <br />ouverts</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {jobs.map((job, i) => (
                                <div key={i} className="group relative bg-white border border-[var(--border)] rounded-[2.5rem] p-8 md:p-12 hover:border-[var(--green)]/50 transition-all duration-500 cursor-pointer shadow-xl shadow-black/[0.01] hover:shadow-2xl hover:shadow-[var(--green)]/5">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                                        <div className="flex-1 space-y-6">
                                            <div className="flex items-center gap-4">
                                                <h4 className="text-2xl md:text-3xl font-black group-hover:text-[var(--green)] transition-all italic uppercase tracking-tight">{job.title}</h4>
                                                {job.badge && (
                                                    <span className="px-3 py-1 rounded-full bg-[var(--green)]/10 text-[var(--green)] text-[10px] font-black uppercase tracking-widest border border-[var(--green)]/20 shadow-sm">
                                                        {job.badge}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-8 text-[10px] font-black text-[var(--text3)] uppercase tracking-[0.15em] border-t border-[var(--border)] pt-6">
                                                <span className="flex items-center gap-2 group-hover:text-[var(--green)] transition-colors"><Briefcase className="w-4 h-4 text-[var(--gold)]" /> {job.dept}</span>
                                                <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[var(--gold)]" /> {job.location}</span>
                                                <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-[var(--gold)]" /> {job.type}</span>
                                            </div>
                                        </div>
                                        <button 
                                            aria-label="Voir le poste"
                                            className="bg-[var(--bg)] group-hover:bg-[var(--green)] text-[var(--text3)] group-hover:text-white h-16 w-16 md:h-20 md:w-20 rounded-3xl flex items-center justify-center transition-all duration-500 border border-[var(--border)] group-hover:border-[var(--green)] shadow-inner"
                                        >
                                            <ArrowRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Spontaneous Applications */}
                <section className="py-32 px-6 bg-[var(--sidebar-bg)] relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1522071823991-b9671e3015b3?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--green)] opacity-5 blur-[120px] rounded-full"></div>
                    
                    <div className="relative z-10 max-w-4xl mx-auto text-center space-y-12">
                        <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-tight">Aucun poste ne vous <br /><span className="text-[var(--gold)] not-italic underline underline-offset-8">correspond ?</span></h2>
                        <p className="text-white/60 text-xl font-normal max-w-2xl mx-auto leading-relaxed opacity-90">
                            Nous sommes toujours à la recherche d'esprits brillants capables de bousculer le statu quo agricoles. Envoyez-nous votre vision.
                        </p>
                        <Link href="/contact" className="inline-flex items-center gap-4 bg-[var(--gold)] text-white px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl shadow-black/40">
                            Candidature Spontanée <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </section>

                <section className="py-20 border-t border-[var(--border)] bg-white text-center">
                    <div className="max-w-7xl mx-auto px-6 h-full flex flex-col items-center justify-center space-y-12">
                        <div className="flex flex-wrap justify-center gap-12 text-[10px] font-black text-[var(--text3)] uppercase tracking-[0.4em]">
                            <Link href="/legal/privacy" className="hover:text-[var(--green)] transition-colors">Politique de Confidentialité</Link>
                            <Link href="/legal/terms" className="hover:text-[var(--green)] transition-colors">Conditions Générales</Link>
                            <Link href="/help" className="hover:text-[var(--green)] transition-colors">Centre d'Aide</Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

