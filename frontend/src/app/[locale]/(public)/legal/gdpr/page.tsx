'use client';

import Link from 'next/link';
import { ShieldCheck, Lock, Eye, Trash2, Move, Ban, PauseCircle, Globe, ChevronRight, CheckCircle, Fingerprint } from 'lucide-react';

export default function GDPRPage() {
    const complianceBadges = [
        { icon: <Globe className="w-8 h-8" />, label: 'Souveraineté Marocaine', desc: 'Hébergement Sécurisé' },
        { icon: <Lock className="w-8 h-8" />, label: 'Cryptage', desc: 'AES-256 + TLS 1.3' },
        { icon: <Fingerprint className="w-8 h-8" />, label: 'Transparence', desc: 'Logique Auditable' },
        { icon: <Trash2 className="w-8 h-8" />, label: 'Droit à l\'Oubli', desc: 'Suppression Instantanée' },
    ];

    const legalBases = [
        { base: 'Nécessité Contractuelle', use: 'Exécution des protocoles AgroMaître Pro' },
        { base: 'Obligation Légale', use: 'Maintenance des journaux d\'audit immuables' },
        { base: 'Intérêt Légitime', use: 'Sécurité, prévention de la fraude et durcissement du système' },
        { base: 'Consentement Spécifique', use: 'Optimisation optionnelle et télémétrie' },
    ];

    const userRights = [
        { icon: <Eye className="w-6 h-6" />, title: 'Droit d\'Accès', desc: 'Demandez une carte complète de votre structure de données.' },
        { icon: <Fingerprint className="w-6 h-6" />, title: 'Droit de Rectification', desc: 'Recalibrez les identifiants inexacts ou obsolètes.' },
        { icon: <Trash2 className="w-6 h-6" />, title: 'Droit à l\'Effacement', desc: 'Déclenchez la purge immédiate de vos silos de données.' },
        { icon: <Move className="w-6 h-6" />, title: 'Droit à la Portabilité', desc: 'Exportez vos données dans une structure JSON haute fidélité.' },
        { icon: <Ban className="w-6 h-6" />, title: 'Droit d\'Opposition', desc: 'Retirez votre consentement pour des couches de traitement spécifiques.' },
        { icon: <PauseCircle className="w-6 h-6" />, title: 'Droit à la Limitation', desc: 'Suspendez temporairement l\'exécution des protocoles sur vos données.' },
    ];

    return (
        <div className="bg-[var(--bg)] text-[var(--text)] font-sans min-h-screen">
            <main>
                {/* Hero Section */}
                <section className="relative py-32 bg-[var(--sidebar-bg)] border-b border-white/5 overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,var(--green),transparent_70%)]"></div>

                    <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                        <div className="inline-flex items-center justify-center p-6 bg-[var(--green)]/20 rounded-[2rem] border border-[var(--green)]/30 mb-10 backdrop-blur-md shadow-2xl shadow-[var(--green)]/10">
                            <ShieldCheck className="w-12 h-12 text-[var(--gold)]" />
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white mb-8 italic uppercase tracking-tighter">
                            Conformité <br /><span className="text-[var(--gold)] not-italic underline underline-offset-8">RGPD / CNDP.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto font-normal leading-relaxed opacity-90">
                            La vie privée dès la conception. La sécurité par défaut. AgroMaître est conçu pour surpasser les normes mondiales de protection des données.
                        </p>
                    </div>
                </section>

                <section className="py-24">
                    <div className="max-w-6xl mx-auto px-6">
                        {/* Compliance Badges */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
                            {complianceBadges.map((b, i) => (
                                <div key={i} className="bg-white border border-[var(--border)] rounded-3xl p-8 text-center hover:border-[var(--green)]/40 transition-all group shadow-xl shadow-black/[0.01]">
                                    <div className="bg-[var(--green)]/10 rounded-2xl p-4 inline-block mb-6 group-hover:scale-110 transition-transform text-[var(--green)]">
                                        {b.icon}
                                    </div>
                                    <h3 className="font-black text-[var(--text)] text-sm uppercase tracking-widest mb-3 italic">{b.label}</h3>
                                    <p className="text-xs text-[var(--text2)] font-medium tracking-tight opacity-80">{b.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid lg:grid-cols-3 gap-12">
                            {/* Legal Bases */}
                            <div className="lg:col-span-1">
                                <div className="bg-[var(--sidebar-bg)] rounded-[2.5rem] border border-white/10 p-10 h-full shadow-2xl">
                                    <h2 className="text-2xl font-black text-white mb-10 tracking-tighter italic uppercase flex items-center gap-3">
                                        <div className="w-2 h-8 bg-[var(--gold)] rounded-full"></div>
                                        Bases Légales
                                    </h2>
                                    <div className="space-y-6">
                                        {legalBases.map((lb, i) => (
                                            <div key={i} className="p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-[var(--gold)]/30 transition-all group">
                                                <span className="text-[10px] font-black bg-[var(--gold)] text-white px-3 py-1 rounded-full uppercase tracking-[0.2em] inline-block mb-3">
                                                    {lb.base}
                                                </span>
                                                <p className="text-xs text-white/60 leading-relaxed font-normal opacity-90">
                                                    {lb.use}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* User Rights */}
                            <div className="lg:col-span-2">
                                <div className="bg-white border border-[var(--border)] rounded-[2.5rem] p-10 shadow-xl shadow-black/[0.01]">
                                    <h2 className="text-2xl font-black text-[var(--text)] mb-10 tracking-tighter italic uppercase flex items-center gap-3">
                                        <div className="w-2 h-8 bg-[var(--green)] rounded-full"></div>
                                        Droits Individuels
                                    </h2>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        {userRights.map((r, i) => (
                                            <div key={i} className="flex gap-6 p-8 bg-[var(--bg)]/50 rounded-3xl border border-[var(--border)] hover:border-[var(--green)]/30 hover:shadow-2xl hover:shadow-[var(--green)]/5 transition-all group">
                                                <div className="bg-[var(--green)]/10 rounded-2xl p-4 h-fit text-[var(--green)] group-hover:scale-110 transition-transform">
                                                    {r.icon}
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-[var(--text)] text-sm mb-2 uppercase tracking-tight italic">{r.title}</h3>
                                                    <p className="text-xs text-[var(--text2)] leading-relaxed mb-4 opacity-90">{r.desc}</p>
                                                    <Link href="/" className="text-[10px] font-black text-[var(--green)] flex items-center gap-2 group/link uppercase tracking-[0.2em]">
                                                        Accéder au Coffre <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* DPO Contact */}
                        <div className="mt-12 bg-white border border-[var(--border)] rounded-[3rem] p-12 relative overflow-hidden shadow-xl shadow-black/[0.01]">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--green)] opacity-[0.03] blur-[120px] rounded-full"></div>
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
                                <div className="max-w-xl">
                                    <h2 className="text-3xl font-black text-[var(--text)] mb-6 italic uppercase tracking-tighter">Délégué à la Protection.</h2>
                                    <p className="text-[var(--text2)] text-lg leading-relaxed mb-10 font-normal opacity-90">
                                        Toute demande technique concernant la sécurité de vos données ou l'exercice de vos droits doit être adressée à notre bureau de conformité des infrastructures.
                                    </p>
                                    <div className="flex flex-wrap gap-12">
                                        <div>
                                            <p className="text-[10px] font-black text-[var(--text3)] uppercase tracking-[0.2em] mb-3">Email Direct</p>
                                            <p className="text-xl font-black text-[var(--green)] underline underline-offset-8">dpo@agromaitre.ma</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-[var(--text3)] uppercase tracking-[0.2em] mb-3">SLA Réponse</p>
                                            <p className="text-xl font-black text-[var(--text)] italic uppercase tracking-tight">48 Heures</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:w-auto p-10 bg-[var(--bg)] rounded-[2.5rem] border border-[var(--border)] text-center shadow-lg">
                                    <p className="text-[10px] font-black text-[var(--text3)] uppercase tracking-[0.2em] mb-4">Autorité de Régulation</p>
                                    <p className="text-2xl font-black text-[var(--text)] mb-8 tracking-tighter italic">CNDP / RGPD</p>
                                    <a href="https://www.cndp.ma" target="_blank" rel="noopener noreferrer" className="bg-[var(--sidebar-bg)] text-white text-[10px] font-black uppercase tracking-[0.3em] px-10 py-5 rounded-2xl shadow-2xl hover:scale-105 transition-transform inline-block">
                                        Vérifier le Cadre
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="mt-20 flex justify-center gap-12 flex-wrap text-[10px] font-black uppercase tracking-[0.2em] border-t border-[var(--border)] pt-12">
                            <Link href="/legal/privacy" className="text-[var(--text3)] hover:text-[var(--green)] transition-colors">Cadre v12</Link>
                            <Link href="/legal/terms" className="text-[var(--text3)] hover:text-[var(--green)] transition-colors">Protocole de Service</Link>
                            <Link href="/legal/cookies" className="text-[var(--text3)] hover:text-[var(--green)] transition-colors">Registre Cookies</Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
