'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import {
    CreditCard,
    MapPin,
    ShieldCheck,
    Lock,
    ChevronRight,
    HelpCircle,
    Info,
    Wallet,
    Globe,
    Zap,
    Rocket,
    CheckCircle2
} from 'lucide-react';

export default function CheckoutPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCheckout = async () => {
        try {
            setLoading(true);
            await authApi.mockUpgradePlan();
            toast.success('Paiement validé. Votre domaine est maintenant en formule Pro Écosystème !');
            router.push('/checkout/success');
        } catch (error) {
            console.error('Erreur lors du paiement:', error);
            toast.error('Une erreur est survenue lors du paiement.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[var(--bg)] text-[var(--text)] font-sans min-h-screen">
            <main className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
                {/* Page Title */}
                <div className="mb-16">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text3)] mb-4 italic">
                        <span>Tarification</span>
                        <ChevronRight className="w-3 h-3 text-[var(--gold)]" />
                        <span className="text-[var(--green)]">Paiement Sécurisé</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">Finaliser votre <span className="text-[var(--green)] not-italic underline underline-offset-8">Abonnement.</span></h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                    {/* Left Column: Payment & Billing */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Payment Information Section */}
                        <section className="bg-white p-10 rounded-[3rem] border border-[var(--border)] shadow-xl shadow-black/[0.02]">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 bg-[var(--green)]/10 rounded-2xl flex items-center justify-center text-[var(--green)]">
                                    <CreditCard className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tight">Informations de Paiement</h3>
                            </div>

                            {/* Payment Selector Tabs */}
                            <div className="flex border-b border-[var(--border)] mb-10">
                                <button className="flex items-center gap-3 px-8 py-4 border-b-4 border-[var(--green)] text-[var(--green)] font-black text-xs uppercase tracking-[0.2em] italic">
                                    <CreditCard className="w-4 h-4" />
                                    Carte Bancaire
                                </button>
                                <button className="flex items-center gap-3 px-8 py-4 border-b-4 border-transparent text-[var(--text3)] font-black text-xs uppercase tracking-[0.2em] italic hover:text-[var(--text)] transition-all">
                                    <Wallet className="w-4 h-4" />
                                    Virement / Autre
                                </button>
                            </div>

                            {/* Card Form */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text3)] mb-3 italic">Nom du Titulaire</label>
                                    <input
                                        className="w-full h-16 rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-6 focus:ring-2 focus:ring-[var(--green)] focus:border-[var(--green)] outline-none transition-all font-bold"
                                        placeholder="e.g. MOHAMED BENALI"
                                        type="text"
                                    />
                                </div>
                                <div className="md:col-span-2 relative">
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text3)] mb-3 italic">Numéro de Carte</label>
                                    <div className="relative">
                                        <input
                                            className="w-full h-16 rounded-2xl border border-[var(--border)] bg-[var(--bg)] pl-6 pr-14 focus:ring-2 focus:ring-[var(--green)] focus:border-[var(--green)] outline-none transition-all font-mono font-bold text-lg tracking-widest"
                                            placeholder="0000 0000 0000 0000"
                                            type="text"
                                        />
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 flex gap-1">
                                            <CreditCard className="text-[var(--text3)] w-6 h-6" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text3)] mb-3 italic">Date d'Expiration</label>
                                    <input
                                        className="w-full h-16 rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-6 focus:ring-2 focus:ring-[var(--green)] focus:border-[var(--green)] outline-none transition-all font-bold"
                                        placeholder="MM / YY"
                                        type="text"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text3)] mb-3 italic">CVV / CVC</label>
                                    <div className="relative">
                                        <input
                                            className="w-full h-16 rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-6 focus:ring-2 focus:ring-[var(--green)] focus:border-[var(--green)] outline-none transition-all font-bold"
                                            placeholder="123"
                                            type="text"
                                        />
                                        <Info className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--text3)] w-5 h-5 cursor-help" />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Billing Address Section */}
                        <section className="bg-white p-10 rounded-[3rem] border border-[var(--border)] shadow-xl shadow-black/[0.02]">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 bg-[var(--green)]/10 rounded-2xl flex items-center justify-center text-[var(--green)]">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tight">Adresse de Facturation</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text3)] mb-3 italic">Adresse de Rue</label>
                                    <input className="w-full h-16 rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-6 focus:ring-2 focus:ring-[var(--green)] focus:border-[var(--green)] outline-none transition-all font-bold" placeholder="123 Boulevard Mohammed V" type="text" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text3)] mb-3 italic">Ville</label>
                                    <input className="w-full h-16 rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-6 focus:ring-2 focus:ring-[var(--green)] focus:border-[var(--green)] outline-none transition-all font-bold" placeholder="Casablanca" type="text" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text3)] mb-3 italic">Code Postal</label>
                                    <input className="w-full h-16 rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-6 focus:ring-2 focus:ring-[var(--green)] focus:border-[var(--green)] outline-none transition-all font-bold" placeholder="20000" type="text" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text3)] mb-3 italic">Pays</label>
                                    <select aria-label="Pays" className="w-full h-16 rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-6 focus:ring-2 focus:ring-[var(--green)] focus:border-[var(--green)] outline-none transition-all appearance-none font-bold">
                                        <option>Maroc</option>
                                        <option>France</option>
                                        <option>Sénégal</option>
                                        <option>Côte d'Ivoire</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap items-center justify-center gap-12 py-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="text-[var(--green)] w-6 h-6" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sécurisé SSL</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="text-[var(--green)] w-6 h-6" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Conforme PCI-DSS</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="text-[var(--green)] w-6 h-6" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Garantie de 30 jours</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary (Sticky) */}
                    <div className="lg:sticky lg:top-32 space-y-8">
                        <div className="bg-white rounded-[3rem] border border-[var(--border)] shadow-2xl overflow-hidden">
                            <div className="p-10 bg-[var(--bg)] border-b border-[var(--border)]">
                                <h3 className="text-2xl font-black italic uppercase tracking-tight">Récapitulatif</h3>
                            </div>
                            <div className="p-10 space-y-6">
                                {/* Plan Details */}
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-black text-[var(--text)] uppercase italic">Formule Pro Écosystème</p>
                                        <p className="text-xs text-[var(--text3)] font-bold uppercase tracking-widest mt-1">Abonnement Annuel</p>
                                    </div>
                                    <span className="font-black text-lg italic">12 000 DH</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-black text-[var(--text3)] uppercase tracking-[0.1em]">
                                    <span>Frais de Plateforme</span>
                                    <span className="text-[var(--green)]">GRATUIT</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-black text-[var(--text3)] uppercase tracking-[0.1em]">
                                    <span>TVA (20%)</span>
                                    <span>2 400 DH</span>
                                </div>
                                <div className="h-[2px] bg-[var(--border)] my-6" />
                                {/* Total */}
                                <div className="flex justify-between items-center mb-10">
                                    <span className="text-xl font-black italic uppercase">Total à Payer</span>
                                    <span className="text-3xl font-black text-[var(--green)] italic">14 400 DH</span>
                                </div>
                                {/* Promo Code */}
                                <div className="relative mb-8">
                                    <input className="w-full h-14 rounded-2xl border border-[var(--border)] bg-transparent px-6 pr-24 focus:ring-2 focus:ring-[var(--green)] focus:border-[var(--green)] outline-none text-sm font-bold uppercase" placeholder="Code Promo" type="text" />
                                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--green)] font-black text-[10px] uppercase tracking-widest hover:underline italic">Appliquer</button>
                                </div>
                                {/* Primary CTA */}
                                <button
                                    onClick={handleCheckout}
                                    disabled={loading}
                                    className="w-full bg-[var(--green)] hover:bg-[var(--green)]/90 text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-[var(--green)]/20 transition-all flex items-center justify-center gap-4 group disabled:opacity-50"
                                >
                                    {loading ? 'Traitement...' : 'Confirmer le Paiement'}
                                    <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </button>
                                <p className="text-[10px] text-center text-[var(--text3)] mt-6 leading-relaxed font-bold uppercase tracking-widest opacity-60">
                                    En cliquant sur confirmation, vous acceptez nos <a className="underline hover:text-[var(--green)]" href="/legal/terms">Conditions</a> et <a className="underline hover:text-[var(--green)]" href="/legal/privacy">Confidentialité</a>.
                                </p>
                            </div>
                            {/* Visual Accent Card Pattern */}
                            <div className="h-3 bg-gradient-to-r from-[var(--green)] via-[var(--gold)] to-[var(--green)]"></div>
                        </div>

                        {/* Assistance Card */}
                        <div className="p-8 bg-white border border-[var(--border)] rounded-[2.5rem] shadow-xl shadow-black/[0.01]">
                            <div className="flex gap-6">
                                <div className="size-14 rounded-2xl bg-[var(--green)]/10 flex items-center justify-center text-[var(--green)] shadow-inner">
                                    <HelpCircle className="w-8 h-8" />
                                </div>
                                <div>
                                    <h4 className="font-black italic uppercase tracking-tight">Besoin d'aide ?</h4>
                                    <p className="text-xs text-[var(--text2)] mt-2 font-normal leading-relaxed">Nos experts sont disponibles 24/7 pour vous assister dans votre paiement.</p>
                                    <a className="inline-block mt-4 text-[10px] font-black text-[var(--green)] hover:underline uppercase tracking-widest italic" href="/contact">Parler à un expert</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
