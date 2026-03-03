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
    Wallet
} from 'lucide-react';

export default function CheckoutPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCheckout = async () => {
        try {
            setLoading(true);
            await authApi.mockUpgradePlan();
            toast.success('Paiement valid  . Vous   tes maintenant en formule Enterprise !');
            router.push('/checkout/success');
        } catch (error) {
            console.error('Erreur lors du paiement:', error);
            toast.error('Une erreur est survenue lors du paiement.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Page Title */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
                        <span>Pricing</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-primary">Checkout</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Complete Your Purchase</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Left Column: Payment & Billing */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Payment Information Section */}
                        <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-2 mb-6">
                                <CreditCard className="text-primary w-5 h-5" />
                                <h3 className="text-lg font-bold">Payment Information</h3>
                            </div>

                            {/* Payment Selector Tabs */}
                            <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
                                <button className="flex items-center gap-2 px-6 py-3 border-b-2 border-primary text-primary font-semibold text-sm">
                                    <CreditCard className="w-4 h-4" />
                                    Credit / Debit Card
                                </button>
                                <button className="flex items-center gap-2 px-6 py-3 border-b-2 border-transparent text-slate-500 dark:text-slate-400 font-medium text-sm hover:text-slate-700 transition-colors">
                                    <Wallet className="w-4 h-4" />
                                    PayPal
                                </button>
                            </div>

                            {/* Card Form */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Cardholder Name</label>
                                    <input
                                        className="w-full h-12 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                        placeholder="e.g. Johnathan Doe"
                                        type="text"
                                    />
                                </div>
                                <div className="md:col-span-2 relative">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Card Number</label>
                                    <div className="relative">
                                        <input
                                            className="w-full h-12 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-4 pr-12 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                            placeholder="0000 0000 0000 0000"
                                            type="text"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                                            <CreditCard className="text-slate-400 w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Expiry Date</label>
                                    <input
                                        className="w-full h-12 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                        placeholder="MM / YY"
                                        type="text"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">CVV</label>
                                    <div className="relative">
                                        <input
                                            className="w-full h-12 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                            placeholder="123"
                                            type="text"
                                        />
                                        <Info className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 cursor-help" />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Billing Address Section */}
                        <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-2 mb-6">
                                <MapPin className="text-primary w-5 h-5" />
                                <h3 className="text-lg font-bold">Billing Address</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Street Address</label>
                                    <input className="w-full h-12 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="123 Business Lane" type="text" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">City</label>
                                    <input className="w-full h-12 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="San Francisco" type="text" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Zip Code</label>
                                    <input className="w-full h-12 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="94103" type="text" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Country</label>
                                    <select aria-label="Country" className="w-full h-12 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all appearance-none">
                                        <option>United States</option>
                                        <option>United Kingdom</option>
                                        <option>Canada</option>
                                        <option>Germany</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap items-center justify-center gap-8 py-4 opacity-70">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="text-green-600 w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-wider">SSL Secured</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="text-blue-600 w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-wider">PCI Compliant</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="text-amber-600 w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-wider">30-Day Guarantee</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary (Sticky) */}
                    <div className="lg:sticky lg:top-24">
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <h3 className="text-lg font-bold">Order Summary</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                {/* Plan Details */}
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">Enterprise CMS Plan</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Annual Subscription</p>
                                    </div>
                                    <span className="font-bold">$1,200.00</span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-400">
                                    <span>Platform Fee</span>
                                    <span>$0.00</span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-400">
                                    <span>Tax (8%)</span>
                                    <span>$96.00</span>
                                </div>
                                <hr className="border-slate-200 dark:border-slate-800 my-4" />
                                {/* Total */}
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-lg font-semibold">Total Amount</span>
                                    <span className="text-2xl font-black text-primary">$1,296.00</span>
                                </div>
                                {/* Promo Code */}
                                <div className="relative mb-6">
                                    <input className="w-full h-11 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-4 pr-16 focus:ring-1 focus:ring-primary focus:border-primary outline-none text-sm" placeholder="Promo Code" type="text" />
                                    <button className="absolute right-2 top-1/2 -translate-y-1/2 text-primary font-bold text-xs uppercase hover:underline">Apply</button>
                                </div>
                                {/* Primary CTA */}
                                <button
                                    onClick={handleCheckout}
                                    disabled={loading}
                                    className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-lg font-bold text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : 'Complete Purchase'}
                                    <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </button>
                                <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-4 leading-relaxed">
                                    By clicking &quot;Complete Purchase&quot;, you agree to our <a className="underline" href="#">Terms of Service</a> and <a className="underline" href="#">Privacy Policy</a>. Recurring billing applies.
                                </p>
                            </div>
                            {/* Visual Accent Card Pattern */}
                            <div className="h-2 bg-gradient-to-r from-primary via-indigo-500 to-cyan-400"></div>
                        </div>

                        {/* Assistance Card */}
                        <div className="mt-6 p-6 bg-primary/5 border border-primary/10 rounded-xl">
                            <div className="flex gap-4">
                                <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                    <HelpCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">Need help?</h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Our sales experts are available 24/7 to assist with your checkout.</p>
                                    <a className="inline-block mt-2 text-xs font-bold text-primary hover:underline" href="#">Chat with us</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="mt-20 pt-10 border-t border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-500 text-sm">
                    <p>   2024 Complaint Management System Inc. All rights reserved.</p>
                    <div className="flex justify-center gap-4 mt-4">
                        <a className="hover:text-primary transition-colors" href="#">Security Overview</a>
                        <span>   </span>
                        <a className="hover:text-primary transition-colors" href="#">Cookie Policy</a>
                        <span>   </span>
                        <a className="hover:text-primary transition-colors" href="#">Refund Policy</a>
                    </div>
                </footer>
            </main>
        </div>
    );
}
