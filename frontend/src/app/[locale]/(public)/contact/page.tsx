'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle2, Send, Globe, ArrowRight } from 'lucide-react';

export default function ContactPage() {
    const [sent, setSent] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSent(true);
    };

    return (
        <div className="bg-[var(--bg)] text-[var(--text)] font-sans min-h-screen">
            <main>
                {/* Hero Section */}
                <section className="relative py-24 bg-[var(--sidebar-bg)] overflow-hidden">
                    <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(circle_at_100%_0%,var(--gold)_0%,transparent_50%)]"></div>
                    <div className="relative z-10 max-w-4xl mx-auto px-6">
                        <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-widest mb-8 border border-white/20 backdrop-blur-md">
                            <Globe className="w-3 h-3" />
                            Réseau AgroMaître
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tight italic uppercase">
                            Canaux <br />
                            <span className="text-[var(--gold)] not-italic">Ouverts.</span>
                        </h1>
                        <p className="text-xl text-white/70 font-normal max-w-2xl leading-relaxed opacity-90">
                            Besoin d'un support technique ou d'un partenariat stratégique ? Nos experts agronomes sont à votre écoute pour optimiser votre exploitation.
                        </p>
                    </div>
                </section>

                <section className="py-24 -mt-16 relative z-20">
                    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12">
                        {/* Contact Intel */}
                        <div className="lg:col-span-4 space-y-12">
                            <div>
                                <h2 className="text-[var(--green)] font-black text-xs uppercase tracking-widest mb-8">Informations de Contact</h2>
                                <div className="space-y-10">
                                    {[
                                        { icon: <Mail className="w-6 h-6" />, label: 'Courrier Électronique', val: 'contact@agromaitre.ma', sub: 'Réponse sous 2 heures' },
                                        { icon: <Phone className="w-6 h-6" />, label: 'Ligne Directe', val: '+212 522 00 00 00', sub: 'Support Client' },
                                        { icon: <MapPin className="w-6 h-6" />, label: 'Siège Social', val: 'Technopark, Casablanca\nMaroc', sub: 'Hub Innovation' },
                                    ].map((info, i) => (
                                        <div key={i} className="flex gap-6 group">
                                            <div className="w-12 h-12 bg-white border border-[var(--border)] rounded-2xl flex items-center justify-center text-[var(--green)] group-hover:bg-[var(--green)] group-hover:text-white transition-all shadow-lg shadow-black/[0.02]">
                                                {info.icon}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-[var(--text3)] uppercase tracking-widest mb-1">{info.label}</p>
                                                <p className="text-lg font-black text-[var(--text)] mb-1 whitespace-pre-line">{info.val}</p>
                                                <p className="text-xs text-[var(--text3)] font-medium">{info.sub}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-8 rounded-[2rem] bg-white border border-[var(--border)] shadow-xl shadow-black/[0.02]">
                                <h3 className="text-lg font-black mb-4 text-[var(--text)]">Support Élite</h3>
                                <p className="text-sm text-[var(--text2)] leading-relaxed font-normal mb-6 opacity-80">
                                    Déjà utilisateur AgroMaître ? Pour une assistance prioritaire, veuillez utiliser le chat de support directement depuis votre tableau de bord.
                                </p>
                                <Link href="/login" className="text-[var(--green)] font-black text-xs uppercase tracking-[0.2em] hover:tracking-[0.3em] transition-all flex items-center gap-2">
                                    Accéder au Dashboard <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>

                        {/* Transmission Form */}
                        <div className="lg:col-span-8">
                            {sent ? (
                                <div className="h-full min-h-[500px] bg-white border border-[var(--green)]/20 rounded-[3rem] p-12 text-center flex flex-col items-center justify-center shadow-2xl">
                                    <div className="w-24 h-24 bg-[var(--green3)] rounded-3xl flex items-center justify-center mb-8 shadow-inner">
                                        <CheckCircle2 className="w-12 h-12 text-[var(--green)]" />
                                    </div>
                                    <h3 className="text-3xl font-black mb-4 text-[var(--text)]">Message Envoyé</h3>
                                    <p className="text-[var(--text2)] max-w-sm mx-auto mb-10 leading-relaxed font-normal opacity-90">
                                        Merci ! Votre message a été bien reçu. Notre équipe de conseillers reviendra vers vous dans les plus brefs délais.
                                    </p>
                                    <button onClick={() => setSent(false)} className="text-[var(--green)] font-black text-xs uppercase tracking-widest hover:scale-110 transition-transform">Envoyer un nouveau message</button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="bg-white border border-[var(--border)] rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-black/[0.02] space-y-10 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--green)]/5 blur-3xl rounded-full -mr-32 -mt-32 transition-colors group-focus-within:bg-[var(--green)]/10"></div>

                                    <div className="relative">
                                        <h2 className="text-2xl font-black mb-2 text-[var(--text)]">Laissez un Message</h2>
                                        <p className="text-[var(--text3)] text-sm font-medium">Nous vous répondrons avec toute l'expertise nécessaire.</p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text3)] ml-4">Nom Complet *</label>
                                            <input
                                                required
                                                value={form.name}
                                                onChange={e => setForm({ ...form, name: e.target.value })}
                                                className="w-full bg-[var(--bg3)]/30 border border-[var(--border)] rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[var(--green)] focus:border-transparent outline-none transition-all font-medium text-[var(--text)]"
                                                placeholder="e.g. Ahmed Alami"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text3)] ml-4">Email Professionnel *</label>
                                            <input
                                                required
                                                type="email"
                                                value={form.email}
                                                onChange={e => setForm({ ...form, email: e.target.value })}
                                                className="w-full bg-[var(--bg3)]/30 border border-[var(--border)] rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[var(--green)] focus:border-transparent outline-none transition-all font-medium text-[var(--text)]"
                                                placeholder="nom@entreprise.ma"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text3)] ml-4">Sujet *</label>
                                        <select
                                            required
                                            id="subject"
                                            aria-label="Sujet du message"
                                            value={form.subject}
                                            onChange={e => setForm({ ...form, subject: e.target.value })}
                                            className="w-full bg-[var(--bg3)]/30 border border-[var(--border)] rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[var(--green)] focus:border-transparent outline-none transition-all font-medium appearance-none text-[var(--text)]"
                                        >
                                            <option value="">Sélectionnez un sujet...</option>
                                            <option>Démo de la Plateforme</option>
                                            <option>Support Technique</option>
                                            <option>Tarification Entreprise</option>
                                            <option>Partenariat</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text3)] ml-4">Message *</label>
                                        <textarea
                                            required
                                            value={form.message}
                                            onChange={e => setForm({ ...form, message: e.target.value })}
                                            rows={6}
                                            className="w-full bg-[var(--bg3)]/30 border border-[var(--border)] rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[var(--green)] focus:border-transparent outline-none transition-all font-medium resize-none text-[var(--text)]"
                                            placeholder="Détaillez votre demande ici..."
                                        />
                                    </div>

                                    <button type="submit" className="w-full bg-[var(--green)] hover:bg-[var(--green2)] text-white py-5 rounded-2xl font-black text-sm tracking-[0.2em] uppercase transition-all shadow-xl shadow-[var(--green)]/20 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3">
                                        <Send className="w-4 h-4" />
                                        Envoyer le Message
                                    </button>

                                    <p className="text-[10px] text-[var(--text3)] text-center uppercase tracking-widest">
                                        En envoyant, vous acceptez notre <Link href="/legal/privacy" className="text-[var(--green)] hover:underline underline-offset-4">Politique de Confidentialité</Link>
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
