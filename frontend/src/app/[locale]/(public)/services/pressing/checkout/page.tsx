'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Plan = 'starter' | 'pro' | 'enterprise';

const planDetails: Record<Plan, { label: string; price: number | null; period: string }> = {
    starter: { label: 'Starter', price: 299, period: '/mois' },
    pro: { label: 'Pro    ', price: 599, period: '/mois' },
    enterprise: { label: 'Enterprise', price: null, period: '' },
};

const addons = [
    { id: 'sms', label: 'Notifications SMS', desc: 'Alertes SMS pour agents et citoyens', price: 49 },
    { id: 'map', label: 'Carte interactive Premium', desc: 'Cartographie avanc  e + clusters', price: 79 },
    { id: 'api', label: 'Acc  s API complet', desc: 'Endpoints REST + webhooks', price: 99 },
    { id: 'onboarding', label: 'Onboarding accompagn  ', desc: 'Formation en visio de 2h', price: 149 },
];

const steps = [
    { num: 1, label: 'Plan & options' },
    { num: 2, label: 'Votre organisation' },
    { num: 3, label: 'Paiement' },
];

export default function PressingCheckoutPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [selectedPlan, setSelectedPlan] = useState<Plan>('pro');
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
    const [org, setOrg] = useState({ name: '', type: '', size: '', firstname: '', lastname: '', email: '', phone: '', address: '', city: '', zip: '' });
    const [payment, setPayment] = useState({ cardName: '', cardNumber: '', expiry: '', cvc: '' });
    const [agree, setAgree] = useState(false);
    const [processing, setProcessing] = useState(false);

    const toggleAddon = (id: string) => {
        setSelectedAddons(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
    };

    const planPrice = planDetails[selectedPlan].price ?? 0;
    const addonsPrice = selectedAddons.reduce((sum, id) => sum + (addons.find(a => a.id === id)?.price ?? 0), 0);
    const totalPrice = planPrice + addonsPrice;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        await new Promise(r => setTimeout(r, 2000));
        router.push(`/services/pressing/checkout/success?plan=${selectedPlan}&total=${totalPrice}`);
    };

    const progressWidth = step === 1 ? '33%' : step === 2 ? '66%' : '100%';

    const OrderSummary = () => (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 sticky top-24">
            <h3 className="font-black text-slate-900 dark:text-white mb-5">R  capitulatif</h3>
            <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Plan {planDetails[selectedPlan].label}</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                        {planDetails[selectedPlan].price !== null ? `${planDetails[selectedPlan].price}   /mois` : 'Sur devis'}
                    </span>
                </div>
                {selectedAddons.map(id => {
                    const a = addons.find(a => a.id === id);
                    return a ? (
                        <div key={id} className="flex justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">{a.label}</span>
                            <span className="font-bold text-slate-900 dark:text-white">+{a.price}   /mois</span>
                        </div>
                    ) : null;
                })}
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 flex justify-between">
                <span className="font-black text-slate-900 dark:text-white">Total</span>
                <span className="font-black text-primary text-xl">{totalPrice}   <span className="text-sm font-bold text-slate-400">/mois</span></span>
            </div>
            <div className="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex gap-2"><span className="text-emerald-500">   </span>14 jours d&apos;essai gratuit</div>
                <div className="flex gap-2"><span className="text-emerald-500">   </span>Annulation    tout moment</div>
                <div className="flex gap-2"><span className="text-emerald-500">   </span>D  ploiement en 48h</div>
                <div className="flex gap-2"><span className="text-emerald-500">   </span>Support inclus</div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0f] font-sans">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0a0a0f]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/services/pressing" className="flex items-center gap-3">
                        <div className="flex items-center justify-center size-9 bg-primary rounded-lg text-white">
                            <span className="material-symbols-outlined text-xl notranslate">account_balance</span>
                        </div>
                        <span className="text-lg font-black text-slate-900 dark:text-white">Cloud <span className="text-primary">Industrie</span></span>
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="material-symbols-outlined text-emerald-500 text-sm notranslate">lock</span>
                        Paiement 100% s  curis
                    </div>
                </div>
            </header>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1">
                <div className={`h-1 bg-primary transition-all duration-500 ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`}></div>
            </div>

            <main className="max-w-6xl mx-auto px-6 py-12">
                {/* Steps indicator */}
                <div className="flex items-center justify-center gap-2 mb-12">
                    {steps.map((s, i) => (
                        <div key={s.num} className="flex items-center gap-2">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black transition-all ${step === s.num ? 'bg-primary text-white shadow-lg shadow-primary/30' : step > s.num ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                {step > s.num
                                    ? <span className="material-symbols-outlined text-sm notranslate">check</span>
                                    : <span>{s.num}</span>
                                }
                                <span className="hidden sm:inline">{s.label}</span>
                            </div>
                            {i < steps.length - 1 && <div className={`w-8 h-0.5 ${step > s.num ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'} transition-all`}></div>}
                        </div>
                    ))}
                </div>

                <div className="grid md:grid-cols-3 gap-10">
                    <div className="md:col-span-2">
                        {/* STEP 1 */}
                        {step === 1 && (
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8">Choisissez votre plan</h2>

                                {/* Plan selection */}
                                <div className="grid gap-4 mb-10">
                                    {(Object.keys(planDetails) as Plan[]).map(plan => (
                                        <button
                                            key={plan}
                                            onClick={() => setSelectedPlan(plan)}
                                            className={`flex items-center justify-between p-5 rounded-2xl border-2 text-left transition-all ${selectedPlan === plan ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`size-5 rounded-full border-2 flex items-center justify-center ${selectedPlan === plan ? 'border-primary' : 'border-slate-300 dark:border-slate-600'}`}>
                                                    {selectedPlan === plan && <div className="size-2.5 bg-primary rounded-full"></div>}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 dark:text-white">{planDetails[plan].label}</p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">{['Pour petites communes', 'Le plus populaire', 'Grandes collectivit  s'][Object.keys(planDetails).indexOf(plan)]}</p>
                                                </div>
                                            </div>
                                            <span className="font-black text-primary text-lg">
                                                {planDetails[plan].price !== null ? `${planDetails[plan].price}   /mois` : 'Sur devis'}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                {/* Add-ons */}
                                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-5">Options compl  mentaires</h3>
                                <div className="grid md:grid-cols-2 gap-3 mb-8">
                                    {addons.map(addon => (
                                        <button
                                            key={addon.id}
                                            onClick={() => toggleAddon(addon.id)}
                                            className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${selectedAddons.includes(addon.id) ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'}`}
                                        >
                                            <div className={`size-5 mt-0.5 rounded border-2 flex items-center justify-center flex-shrink-0 ${selectedAddons.includes(addon.id) ? 'border-primary bg-primary' : 'border-slate-300 dark:border-slate-600'}`}>
                                                {selectedAddons.includes(addon.id) && <span className="material-symbols-outlined text-white text-xs notranslate">check</span>}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-900 dark:text-white text-sm">{addon.label}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{addon.desc}</p>
                                                <p className="text-primary font-black text-sm mt-1">+{addon.price}   /mois</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <button onClick={() => setStep(2)} className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-primary/20">
                                    Continuer     Infos organisation
                                </button>
                            </div>
                        )}

                        {/* STEP 2 */}
                        {step === 2 && (
                            <form onSubmit={e => { e.preventDefault(); setStep(3); }}>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8">Votre organisation</h2>
                                <div className="space-y-5">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Pr  nom *</label>
                                            <input required value={org.firstname} onChange={e => setOrg({ ...org, firstname: e.target.value })} className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="Pr  nom" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nom *</label>
                                            <input required value={org.lastname} onChange={e => setOrg({ ...org, lastname: e.target.value })} className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="Nom" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nom de la collectivit   *</label>
                                        <input required value={org.name} onChange={e => setOrg({ ...org, name: e.target.value })} className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="ex: Mairie de Paris" />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Type d&apos;organisation *</label>
                                            <select required title="Type d'organisation" value={org.type} onChange={e => setOrg({ ...org, type: e.target.value })} className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 focus:ring-2 focus:ring-primary outline-none transition-all">
                                                <option value="">S  lectionner...</option>
                                                <option>Mairie / Commune</option>
                                                <option>Communaut   de communes</option>
                                                <option>D  partement</option>
                                                <option>R  gion</option>
                                                <option>  tablissement public</option>
                                                <option>Autre</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Taille (habitants) *</label>
                                            <select required title="Taille de la commune" value={org.size} onChange={e => setOrg({ ...org, size: e.target.value })} className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 focus:ring-2 focus:ring-primary outline-none transition-all">
                                                <option value="">S  lectionner...</option>
                                                <option>Moins de 2 000</option>
                                                <option>2 000     10 000</option>
                                                <option>10 000     50 000</option>
                                                <option>50 000     200 000</option>
                                                <option>Plus de 200 000</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email professionnel *</label>
                                            <input required type="email" value={org.email} onChange={e => setOrg({ ...org, email: e.target.value })} className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="vous@mairie.fr" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">T  l  phone</label>
                                            <input value={org.phone} onChange={e => setOrg({ ...org, phone: e.target.value })} className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="+33 1 XX XX XX XX" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Adresse *</label>
                                        <input required value={org.address} onChange={e => setOrg({ ...org, address: e.target.value })} className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="Num  ro et nom de rue" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Code postal *</label>
                                            <input required value={org.zip} onChange={e => setOrg({ ...org, zip: e.target.value })} className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="75001" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Ville *</label>
                                            <input required value={org.city} onChange={e => setOrg({ ...org, city: e.target.value })} className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="Paris" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-8">
                                    <button type="button" onClick={() => setStep(1)} className="px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                            Retour
                                    </button>
                                    <button type="submit" className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-primary/20">
                                        Continuer     Paiement
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* STEP 3 */}
                        {step === 3 && (
                            <form onSubmit={handleSubmit}>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8">Informations de paiement</h2>

                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-8 flex items-start gap-3">
                                    <span className="material-symbols-outlined text-amber-500 notranslate">info</span>
                                    <p className="text-sm text-amber-800 dark:text-amber-400">
                                        <strong>Mode d  monstration.</strong> Aucune vraie transaction ne sera effectu  e. Utilisez un num  ro factice pour tester.
                                    </p>
                                </div>

                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nom sur la carte *</label>
                                        <input required value={payment.cardName} onChange={e => setPayment({ ...payment, cardName: e.target.value })} className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="Pr  nom NOM" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Num  ro de carte *</label>
                                        <div className="relative">
                                            <input required value={payment.cardNumber} onChange={e => setPayment({ ...payment, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim() })} maxLength={19} className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 pr-14 focus:ring-2 focus:ring-primary outline-none transition-all tracking-widest" placeholder="0000 0000 0000 0000" />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                                                <div className="size-5 bg-red-500 rounded-full opacity-60"></div>
                                                <div className="size-5 bg-amber-400 rounded-full opacity-60 -ml-2"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Date d&apos;expiration *</label>
                                            <input required value={payment.expiry} onChange={e => {
                                                let v = e.target.value.replace(/\D/g, '');
                                                if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
                                                setPayment({ ...payment, expiry: v });
                                            }} maxLength={5} className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="MM/AA" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">CVV *</label>
                                            <input required value={payment.cvc} onChange={e => setPayment({ ...payment, cvc: e.target.value.replace(/\D/g, '').slice(0, 3) })} maxLength={3} className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="123" />
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 mt-2">
                                        <input type="checkbox" id="agree" required checked={agree} onChange={e => setAgree(e.target.checked)} className="mt-1 size-4 accent-primary" />
                                        <label htmlFor="agree" className="text-sm text-slate-600 dark:text-slate-400">
                                            J&apos;accepte les <Link href="/legal/terms" className="text-primary underline">CGU</Link> et la <Link href="/legal/privacy" className="text-primary underline">Politique de confidentialit  </Link>. Je comprends que mon abonnement sera factur   mensuellement.
                                        </label>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-8">
                                    <button type="button" onClick={() => setStep(2)} className="px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                            Retour
                                    </button>
                                    <button type="submit" disabled={processing} className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3">
                                        {processing ? (
                                            <>
                                                <svg className="animate-spin size-5" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                </svg>
                                                Traitement en cours...
                                            </>
                                        ) : (
                                            `Confirmer et payer ${totalPrice}   /mois    `
                                        )}
                                    </button>
                                </div>

                                {/* Trust badges */}
                                <div className="mt-8 flex flex-wrap gap-4 justify-center text-xs text-slate-400">
                                    {['     Paiement crypt   SSL', '     Certifi   PCI-DSS', '         H  berg   en France', '    Satisfait ou rembours  '].map((b, i) => (
                                        <span key={i} className="flex items-center gap-1">{b}</span>
                                    ))}
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Order summary sidebar */}
                    <div>
                        <OrderSummary />
                    </div>
                </div>
            </main>
        </div>
    );
}
