'use client';

import Link from 'next/link';
import { ShieldCheck, Cookie, Lock, Activity, ArrowRight, CheckCircle } from 'lucide-react';

export default function CookiesPage() {
    const cookieCategories = [
        {
            id: 'essential',
            icon: <Lock className="w-6 h-6" />,
            title: 'Cookies de Protocole Essentiels',
            status: 'Requis',
            description: 'Ces cookies sont mathématiquement nécessaires pour les fonctionnalités de base d\'AgroMaître Pro. Ils gèrent la vérification des sessions, les jetons de sécurité et les préférences d\'infrastructure.',
            cookies: ['auth_session', 'csrf_protection', 'protocol_locale', 'system_theme'],
            accent: 'bg-[var(--green3)] text-[var(--green)] border-[var(--green)]/20 shadow-inner'
        },
        {
            id: 'analytics',
            icon: <Activity className="w-6 h-6" />,
            title: 'Analytique & Optimisation',
            status: 'Optionnel',
            description: 'Nous utilisons des analyses respectueuses de la vie privée et auto-hébergées pour surveiller les performances du système et identifier les goulots d\'étranglement. Toutes les données sont anonymisées.',
            cookies: ['performance_metrics', 'latency_stats', 'load_balancing_id'],
            accent: 'bg-[var(--gold)]/10 text-[var(--gold)] border-[var(--gold)]/20'
        },
        {
            id: 'privacy',
            icon: <ShieldCheck className="w-6 h-6" />,
            title: 'Traçage Tiers',
            status: 'Aucun',
            description: 'AgroMaître maintient une politique de tolérance zéro pour les trackers tiers. Nous n\'utilisons pas de cookies publicitaires ou de technologies de surveillance comportementale.',
            cookies: [],
            accent: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
        }
    ];

    return (
        <div className="bg-[var(--bg)] text-[var(--text)] font-sans min-h-screen">
            <main>
                {/* Hero Section */}
                <section className="relative py-32 overflow-hidden bg-[var(--sidebar-bg)] border-b border-white/5 shadow-2xl">
                    <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_0%_100%,var(--gold)_0%,transparent_40%)]"></div>

                    <div className="relative z-10 max-w-4xl mx-auto px-6">
                        <div className="flex items-center gap-3 text-[var(--gold)] font-bold text-xs tracking-[0.3em] uppercase mb-6">
                            <ShieldCheck className="w-4 h-4" />
                            Gouvernance & Transparence
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter italic uppercase">
                            Politique des <br /><span className="text-[var(--gold)] not-italic underline underline-offset-8">Cookies.</span>
                        </h1>
                        <p className="text-xl text-white/70 max-w-2xl font-normal leading-relaxed opacity-90">
                            Performance et respect de la vie privée. Notre protocole de gestion des cookies est conçu pour maximiser l'efficacité du système tout en respectant votre droit absolu à l'anonymat numérique.
                        </p>
                        <div className="mt-12 flex items-center gap-6 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] border-t border-white/10 pt-8 w-fit">
                            <span>Révision 2.0.4</span>
                            <div className="w-1 h-1 bg-[var(--gold)] rounded-full"></div>
                            <span>Effectif : Février 2026</span>
                        </div>
                    </div>
                </section>

                <section className="py-24">
                    <div className="max-w-4xl mx-auto px-6">
                        <div className="space-y-6">
                            {cookieCategories.map((cat) => (
                                <div key={cat.id} className="relative group">
                                    <div className="relative bg-white border border-[var(--border)] rounded-[2.5rem] p-10 hover:border-[var(--green)]/30 transition-all shadow-xl shadow-black/[0.01]">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                                            <div className="flex-1">
                                                <div className="flex items-start gap-6">
                                                    <div className={`p-4 rounded-2xl flex items-center justify-center shrink-0 ${cat.accent}`}>
                                                        {cat.icon}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="text-2xl font-black text-[var(--text)] uppercase tracking-tight italic">{cat.title}</h3>
                                                            <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-current opacity-80`}>
                                                                {cat.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-lg font-normal text-[var(--text2)] opacity-90 leading-relaxed mb-6">{cat.description}</p>
                                                        
                                                        {cat.cookies.length > 0 && (
                                                            <div className="flex flex-wrap gap-2">
                                                                {cat.cookies.map((cookie) => (
                                                                    <code key={cookie} className="text-[10px] font-black bg-[var(--bg)] text-[var(--text3)] px-3 py-1.5 rounded-lg border border-[var(--border)] shadow-sm uppercase tracking-wider">
                                                                        {cookie}
                                                                    </code>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Management Box */}
                        <div className="mt-16 bg-[var(--sidebar-bg)] rounded-[3rem] border border-white/10 p-12 relative overflow-hidden group shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--green)] opacity-5 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                            <div className="relative z-10">
                                <h2 className="text-3xl font-black text-white mb-6 italic uppercase tracking-tighter">Contrôle Autonome</h2>
                                <p className="text-white/60 leading-relaxed text-lg mb-12 max-w-2xl font-normal opacity-90">
                                    Vous avez le pouvoir de définir votre périmètre de traçage. Bien qu'AgroMaître fonctionne de manière optimale avec les paramètres standards, vous pouvez recalibrer votre navigateur à tout moment.
                                </p>
                                <div className="flex flex-wrap gap-8">
                                    <Link href="/legal/privacy" className="flex items-center gap-3 text-[var(--gold)] font-black hover:gap-6 transition-all uppercase tracking-widest text-[10px] group/link">
                                        Cadre de Confidentialité <ArrowRight className="w-4 h-4" />
                                    </Link>
                                    <Link href="/contact" className="flex items-center gap-3 text-[var(--gold)] font-black hover:gap-6 transition-all uppercase tracking-widest text-[10px] group/link">
                                        Support Protocole <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
