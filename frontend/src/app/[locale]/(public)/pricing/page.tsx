'use client';

import { useStripeStore } from '@/store/stripeStore';
import { CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function PricingPage() {
    const [isYearly, setIsYearly] = useState(false);
    const router = useRouter();
    const { createCheckoutSession, isLoading, error } = useStripeStore();

    const handlePlanSelect = async (planId: string) => {
        if (planId === 'enterprise') {
            window.location.href = 'mailto:sales@agromaitre.ma';
            return;
        }

        const url = await createCheckoutSession(planId, isYearly ? 'year' : 'month');
        if (url) {
            window.location.href = url;
        }
    };

    const plans = [
        {
            id: "starter",
            name: "Essentiel",
            price: "290",
            description: "Idéal pour les petites exploitations familiales.",
            features: [
                { text: "Gestion de 3 Parcelles", included: true },
                { text: "Suivi des Cultures", included: true },
                { text: "Journal de Bord Basique", included: true },
                { text: "Alertes Météo", included: true },
                { text: "Support par Email", included: true },
            ],
            buttonText: "Démarrer",
            popular: false
        },
        {
            id: "professional",
            name: "Professionnel",
            price: isYearly ? "790" : "990",
            description: "Pour une gestion optimisée de moyennes et grandes exploitations.",
            features: [
                { text: "Parcelles Illimitées", included: true, bold: true },
                { text: "Analytics Avancés", included: true, bold: true },
                { text: "Gestion d'Équipe", included: true, bold: true },
                { text: "Suivi de Flotte", included: true, bold: true },
                { text: "Support Prioritaire 24/7", included: true, bold: true },
            ],
            buttonText: "Choisir Pro",
            popular: true,
            subtext: isYearly ? "Facturé annuellement" : null
        },
        {
            id: "enterprise",
            name: "Sur Mesure",
            price: "Devis",
            description: "Solutions personnalisées pour les coopératives et grands domaines.",
            features: [
                { text: "Infrastructure Dédiée", included: true },
                { text: "Intégration IoT Totale", included: true },
                { text: "Formation sur Site", included: true },
                { text: "Expert Agronome Dédié", included: true },
                { text: "SLA Garanti", included: true },
            ],
            buttonText: "Contacter Ventes",
            popular: false
        }
    ];

    return (
        <div className="bg-[var(--bg)] text-[var(--text)] font-sans min-h-screen">
            <main>
                {/* Hero Section */}
                <section className="relative py-24 flex flex-col items-center overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(circle_at_center,_rgba(33,94,97,0.05),_transparent_70%)] pointer-events-none"></div>

                    <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                        <span className="inline-block py-1 px-4 rounded-full bg-[var(--green3)] text-[var(--green)] text-xs font-bold tracking-widest uppercase mb-6 border border-[var(--green)]/20 shadow-sm">
                            Tarification Transparente
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black text-[var(--text)] mb-8 leading-[1.1] tracking-tight">
                            Investissez dans <span className="text-[var(--green)] italic">votre croissance.</span>
                        </h1>
                        <p className="text-xl text-[var(--text2)] max-w-2xl mx-auto mb-12 font-normal leading-relaxed opacity-90">
                            Choisissez le plan qui correspond à l'échelle de votre exploitation. Simple, clair et sans frais cachés.
                        </p>

                        {/* Billing Toggle */}
                        <div className="flex items-center justify-center gap-4 bg-white p-1.5 rounded-2xl border border-[var(--border)] w-fit mx-auto shadow-sm">
                            <button
                                onClick={() => setIsYearly(false)}
                                className={`px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${!isYearly ? 'bg-[var(--green)] text-white shadow-lg shadow-[var(--green)]/20' : 'text-[var(--text3)] hover:text-[var(--text)]'}`}
                            >
                                Mensuel
                            </button>
                            <button
                                onClick={() => setIsYearly(true)}
                                className={`px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all relative ${isYearly ? 'bg-[var(--green)] text-white shadow-lg shadow-[var(--green)]/20' : 'text-[var(--text3)] hover:text-[var(--text)]'}`}
                            >
                                Annuel
                                <span className="absolute -top-3 -right-3 bg-[var(--gold)] text-white text-[9px] px-2 py-1 rounded-full animate-bounce font-bold">
                                    -20%
                                </span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Pricing Grid */}
                <section className="py-24 px-6 max-w-7xl mx-auto relative">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {plans.map((plan, idx) => (
                            <div
                                key={idx}
                                className={`relative group flex flex-col rounded-[2rem] border p-10 transition-all duration-500 hover:-translate-y-2 ${plan.popular
                                    ? 'bg-[var(--sidebar-bg)] text-white border-[var(--green)] shadow-2xl shadow-[var(--green)]/20 scale-105 z-10'
                                    : 'bg-white border-[var(--border)] text-[var(--text)] shadow-xl h-fit self-center'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--gold)] text-white text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-lg">
                                        Le Plus Populaire
                                    </div>
                                )}

                                <div className="mb-10">
                                    <h3 className={`text-sm font-black uppercase tracking-[0.2em] mb-4 ${plan.popular ? 'text-[var(--gold)]' : 'text-[var(--green)]'}`}>
                                        {plan.name}
                                    </h3>
                                    <div className="flex flex-col">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-black tracking-tighter">
                                                {plan.price !== "Devis" ? `${plan.price} DH` : plan.price}
                                            </span>
                                            {plan.price !== "Devis" && (
                                                <span className={`text-sm font-bold opacity-60`}>/mois</span>
                                            )}
                                        </div>
                                        {plan.subtext && (
                                            <span className="text-xs font-bold text-[var(--gold)] mt-2 uppercase tracking-wider">{plan.subtext}</span>
                                        )}
                                    </div>
                                    <p className={`mt-6 text-sm font-medium leading-relaxed ${plan.popular ? 'text-white/70' : 'text-[var(--text3)]'}`}>
                                        {plan.description}
                                    </p>
                                </div>

                                <div className="space-y-4 mb-10">
                                    {plan.features.map((feature, fIdx) => (
                                        <div key={fIdx} className={`flex items-start gap-3 text-sm ${!feature.included ? 'opacity-30' : ''}`}>
                                            <CheckCircle2 className={`w-5 h-5 shrink-0 ${plan.popular ? 'text-[var(--gold)]' : 'text-[var(--green)]'}`} />
                                            <span className={`font-medium ${('bold' in feature && feature.bold) ? 'font-black' : ''}`}>{feature.text}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handlePlanSelect(plan.id)}
                                    disabled={isLoading}
                                    className={`w-full py-4 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${plan.popular
                                        ? 'bg-[var(--gold)] text-white hover:bg-[var(--gold2)] shadow-lg shadow-[var(--gold)]/20'
                                        : 'bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--bg3)]'
                                        } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isLoading ? (
                                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></span>
                                    ) : (
                                        plan.buttonText
                                    )}
                                </button>
                                {error && <p className="text-red-500 text-[10px] mt-4 text-center font-bold uppercase tracking-widest">{error}</p>}
                            </div>
                        ))}
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-1/2 -left-20 w-64 h-64 bg-[var(--green)] opacity-5 blur-[120px] rounded-full -z-10"></div>
                    <div className="absolute bottom-0 -right-20 w-80 h-80 bg-[var(--gold)] opacity-5 blur-[150px] rounded-full -z-10"></div>
                </section>
            </main>
        </div>
    );
}
