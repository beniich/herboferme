'use client';

import Link from 'next/link';
import { Sprout, BarChart3, ShieldCheck, Cpu, Layout, BookOpen, ArrowRight, Mail, Calendar, Clock, User } from 'lucide-react';

const posts = [
    {
        category: 'Produit',
        categoryColor: 'bg-[var(--green3)] text-[var(--green)] border-[var(--green)]/20',
        title: 'AgroMaître 4.0 : Le monitoring satellite haute précision est arrivé',
        excerpt: 'Découvrez comment notre nouvelle couche d\'imagerie multispectrale permet de détecter les carences azotées avant qu\'elles ne soient visibles à l\'œil nu.',
        date: '15 février 2026',
        readTime: '5 min',
        author: 'Dr. Ahmed Alami',
        icon: <Sprout className="w-12 h-12 text-white" />
    },
    {
        category: 'Exploitation',
        categoryColor: 'bg-[var(--gold)]/10 text-[var(--gold)] border-[var(--gold)]/20',
        title: 'Comment le Domaine de l\'Atlas a augmenté son rendement de 22%',
        excerpt: 'Étude de cas : Retour d\'expérience sur 24 mois d\'utilisation de nos capteurs IoT de sol et de la gestion automatisée de l\'irrigation.',
        date: '8 février 2026',
        readTime: '8 min',
        author: 'Sarah Mansouri',
        icon: <BarChart3 className="w-12 h-12 text-white" />
    },
    {
        category: 'Guide',
        categoryColor: 'bg-emerald-100/50 text-emerald-700 border-emerald-200',
        title: 'Optimiser l\'apport en engrais : guide de précision 2026',
        excerpt: 'Configuration des cartes de modulation, lecture des indices NDVI et ajustement des doses — tout ce qu\'il faut savoir pour une fertilisation raisonnée.',
        date: '1er février 2026',
        readTime: '10 min',
        author: 'Marc Lefebvre',
        icon: <Layout className="w-12 h-12 text-white" />
    },
    {
        category: 'Sécurité',
        categoryColor: 'bg-amber-100/50 text-amber-700 border-amber-200',
        title: 'Protection des données agricoles : enjeux et souveraineté',
        excerpt: 'Sécurisation des relevés de parcelles et protection de vos rendements stratégiques : les piliers de la confiance chez AgroMaître.',
        date: '25 janvier 2026',
        readTime: '7 min',
        author: 'Yassir Benchekroun',
        icon: <ShieldCheck className="w-12 h-12 text-white" />
    },
    {
        category: 'Technologie',
        categoryColor: 'bg-blue-100/50 text-blue-700 border-blue-200',
        title: 'Intelligence Artificielle : prédire les récoltes avec 98% de précision',
        excerpt: 'Plongée technique dans nos modèles de deep learning qui analysent 40 ans de données météo pour sécuriser vos prévisions.',
        date: '18 janvier 2026',
        readTime: '12 min',
        author: 'Dr. Karim Benjelloun',
        icon: <Cpu className="w-12 h-12 text-white" />
    },
    {
        category: 'Innovation',
        categoryColor: 'bg-purple-100/50 text-purple-700 border-purple-200',
        title: 'Traçabilité Blockchain : valoriser votre production locale',
        excerpt: 'Comment notre protocole de traçabilité permet aux producteurs d\'obtenir des marges premium sur les marchés internationaux.',
        date: '10 janvier 2026',
        readTime: '6 min',
        author: 'Dina Farhat',
        icon: <BookOpen className="w-12 h-12 text-white" />
    },
];

export default function BlogPage() {
    const [featured, ...rest] = posts;

    return (
        <div className="bg-[var(--bg)] text-[var(--text)] font-sans min-h-screen">
            <main>
                {/* Hero */}
                <section className="relative py-24 bg-[var(--sidebar-bg)] overflow-hidden">
                    <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(circle_at_0%_100%,var(--gold)_0%,transparent_40%)]"></div>
                    <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--gold)]/20 border border-[var(--gold)]/30 text-[var(--gold)] text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                            📝 Agro Intelligence
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 italic uppercase tracking-tighter">Insights & <br /><span className="text-[var(--gold)] not-italic underline underline-offset-8">Actualités.</span></h1>
                        <p className="text-white/70 text-xl max-w-2xl mx-auto font-normal opacity-90">Par l'équipe AgroMaître — pour les leaders de l'agriculture moderne.</p>
                    </div>
                </section>

                <section className="py-24 max-w-7xl mx-auto px-6">
                    {/* Featured */}
                    <div className="mb-24">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text3)] mb-8 flex items-center gap-4">
                            Article à la une
                            <div className="h-px bg-[var(--border)] flex-grow"></div>
                        </h2>
                        <div className="group relative bg-white rounded-[3rem] border border-[var(--border)] p-10 lg:p-16 hover:border-[var(--green)]/30 transition-all duration-500 shadow-2xl shadow-black/[0.02]">
                            <div className="flex flex-col lg:flex-row gap-12 items-center text-left">
                                <div className="flex-1 space-y-8">
                                    <span className={`inline-block text-[10px] font-black px-4 py-1.5 rounded-full border shadow-sm uppercase tracking-widest ${featured.categoryColor}`}>{featured.category}</span>
                                    <h2 className="text-3xl lg:text-5xl font-black text-[var(--text)] group-hover:text-[var(--green)] transition-all leading-tight italic uppercase tracking-tighter">{featured.title}</h2>
                                    <p className="text-[var(--text2)] text-xl leading-relaxed opacity-90 font-normal">{featured.excerpt}</p>
                                    <div className="flex flex-wrap items-center gap-8 text-sm text-[var(--text3)] font-medium border-t border-[var(--border)] pt-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[var(--green)] rounded-2xl flex items-center justify-center text-white font-black shadow-lg">{featured.author[0]}</div>
                                            <span className="text-[var(--text)] font-black uppercase tracking-tight italic">{featured.author}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-[var(--gold)]" />
                                            {featured.date}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-[var(--gold)]" />
                                            {featured.readTime}
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full lg:w-96 h-96 bg-[var(--sidebar-bg)] rounded-[3rem] flex items-center justify-center flex-shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform duration-700 shadow-2xl">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--green)]/20 to-transparent"></div>
                                    {featured.icon}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grid */}
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text3)] mb-12 flex items-center gap-4">
                        Flux de Connaissances
                        <div className="h-px bg-[var(--border)] flex-grow"></div>
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {rest.map((post, i) => (
                            <Link key={i} href="/" className="group bg-white rounded-[2.5rem] border border-[var(--border)] overflow-hidden hover:border-[var(--green)]/30 hover:-translate-y-4 transition-all duration-500 shadow-xl shadow-black/[0.01]">
                                <div className="h-64 bg-[var(--sidebar-bg)] flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--green)]/10 to-transparent group-hover:scale-110 transition-transform duration-700"></div>
                                    <div className="relative group-hover:scale-110 transition-transform duration-500 group-hover:rotate-6">
                                        {post.icon}
                                    </div>
                                </div>
                                <div className="p-10 space-y-6">
                                    <span className={`inline-block text-[9px] font-black px-3 py-1 rounded-full border shadow-sm uppercase tracking-widest ${post.categoryColor}`}>{post.category}</span>
                                    <h3 className="text-2xl font-black text-[var(--text)] leading-tight group-hover:text-[var(--green)] transition-all italic uppercase tracking-tighter">{post.title}</h3>
                                    <p className="text-sm text-[var(--text2)] leading-relaxed line-clamp-2 opacity-90 font-normal">{post.excerpt}</p>
                                    <div className="flex items-center justify-between text-[10px] text-[var(--text3)] font-black uppercase tracking-[0.15em] border-t border-[var(--border)] pt-6">
                                        <div className="flex items-center gap-2">
                                            <User className="w-3 h-3 text-[var(--gold)]" />
                                            {post.author}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3 text-[var(--gold)]" />
                                            {post.readTime}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Newsletter */}
                    <div className="mt-32 relative rounded-[4rem] p-12 lg:p-20 text-center text-white overflow-hidden shadow-2xl bg-[var(--sidebar-bg)]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,var(--green)_0%,transparent_50%)] opacity-20"></div>
                        <div className="relative z-10 space-y-10">
                            <h2 className="text-4xl lg:text-6xl font-black italic uppercase tracking-tighter">Cultivez votre <br /><span className="text-[var(--gold)] not-italic underline underline-offset-[12px]">Intelligence.</span></h2>
                            <p className="text-white/60 text-xl max-w-2xl mx-auto font-normal opacity-90">Recevez nos meilleures analyses et insights agricoles directement dans votre boîte mail.</p>
                            <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto bg-white/5 p-3 rounded-[2rem] border border-white/10 backdrop-blur-md">
                                <input className="flex-1 bg-transparent h-16 rounded-2xl px-6 text-white outline-none placeholder:text-white/30 font-medium" placeholder="votre@exploitation.ma" type="email" />
                                <button className="bg-[var(--gold)] text-white px-10 h-16 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl shadow-black/20 flex items-center justify-center gap-3">
                                    S'abonner
                                    <Mail className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
