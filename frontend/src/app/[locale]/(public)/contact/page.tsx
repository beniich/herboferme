'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ContactPage() {
    const [sent, setSent] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSent(true);
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen flex flex-col">
            {/* Sticky Navigation */}
            <header className="fixed top-0 w-full z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="bg-primary p-1.5 rounded-lg text-white">
                            <span className="material-symbols-outlined text-2xl font-variation-fill">track_changes</span>
                        </div>
                        <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase uppercase">ReclamTrack <span className="text-primary truncate">Pro</span></h1>
                    </Link>
                    <nav className="hidden md:flex items-center gap-10">
                        <Link href="/about" className="text-sm font-semibold hover:text-primary transition-colors text-slate-900 dark:text-slate-100">About</Link>
                        <Link href="/help" className="text-sm font-semibold hover:text-primary transition-colors text-slate-900 dark:text-slate-100">Help</Link>
                        <Link href="/status" className="text-sm font-semibold hover:text-primary transition-colors text-slate-900 dark:text-slate-100">Status</Link>
                    </nav>
                </div>
            </header>

            <main className="flex-1 pt-20">
                {/* Hero Section */}
                <section className="relative py-24 bg-slate-900 dark:bg-black overflow-hidden">
                    <div className="absolute inset-0 z-0 opacity-40 bg-[radial-gradient(circle_at_100%_0%,#ec5b13_0%,transparent_50% preview)]"></div>
                    <div className="absolute inset-0 z-0 opacity-40 bg-[radial-gradient(circle_at_100%_0%,#ec5b13_0%,transparent_50%)]"></div>
                    <div className="relative z-10 max-w-4xl mx-auto px-6">
                        <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-primary/20 text-primary text-[10px] font-black tracking-widest uppercase mb-8 border border-primary/30">
                            <span className="material-symbols-outlined text-sm">hub</span>
                            Global Network
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight">Open Channels</h1>
                        <p className="text-xl text-slate-400 font-light max-w-2xl leading-relaxed">
                            Need technical support or looking for a strategic enterprise partnership? Our response team is standing by to assist with your reclamation mission.
                        </p>
                    </div>
                </section>

                <section className="py-24 -mt-16 relative z-20">
                    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12">
                        {/* Contact Intel */}
                        <div className="lg:col-span-4 space-y-12">
                            <div>
                                <h2 className="text-primary font-black text-xs uppercase tracking-widest mb-8">Base Intelligence</h2>
                                <div className="space-y-10">
                                    {[
                                        { icon: 'alternate_email', label: 'Electronic Mail', val: 'connect@reclamtrack.pro', sub: 'Instant routing to the right team' },
                                        { icon: 'call', label: 'Direct Line', val: '+44 20 7946 0123', sub: 'HQ / London Operations' },
                                        { icon: 'pin_drop', label: 'Operational Hub', val: 'Level 24, The Shard\nLondon, United Kingdom', sub: 'Global HQ' },
                                    ].map((info, i) => (
                                        <div key={i} className="flex gap-6 group">
                                            <div className="w-12 h-12 bg-white dark:bg-white/5 border border-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-lg shadow-primary/5">
                                                <span className="material-symbols-outlined">{info.icon}</span>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{info.label}</p>
                                                <p className="text-lg font-black text-slate-900 dark:text-white mb-1">{info.val}</p>
                                                <p className="text-xs text-slate-500 font-medium">{info.sub}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-8 rounded-3xl bg-slate-100 dark:bg-white/5 border border-primary/10">
                                <h3 className="text-lg font-black mb-4">Elite Support</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-light mb-6">
                                    Already a Pro user? For mission-critical incidents, please use the encrypted chat within your mission dashboard for prioritized response times.
                                </p>
                                <Link href="/login" className="text-primary font-black text-xs uppercase tracking-[0.2em] hover:tracking-[0.3em] transition-all flex items-center gap-2">
                                    Dashboard Access <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </Link>
                            </div>
                        </div>

                        {/* Transmission Form */}
                        <div className="lg:col-span-8">
                            {sent ? (
                                <div className="h-full min-h-[500px] bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 rounded-[40px] p-12 text-center flex flex-col items-center justify-center">
                                    <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-8">
                                        <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-5xl">verified</span>
                                    </div>
                                    <h3 className="text-3xl font-black mb-4">Transmission Successful</h3>
                                    <p className="text-slate-600 dark:text-slate-400 max-w-sm mx-auto mb-10 leading-relaxed">
                                        Your signal has been received. Our operations team will initiate contact within the next 120 minutes.
                                    </p>
                                    <button onClick={() => setSent(false)} className="text-primary font-black text-xs uppercase tracking-widest hover:scale-110 transition-transform">Send New Signal</button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="bg-white dark:bg-background-dark border border-primary/10 rounded-[40px] p-8 md:p-12 shadow-2xl shadow-primary/5 space-y-10 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -mr-32 -mt-32 transition-colors group-focus-within:bg-primary/10"></div>

                                    <div className="relative">
                                        <h2 className="text-2xl font-black mb-2">Initiate Contact</h2>
                                        <p className="text-slate-400 text-sm font-medium">Fields marked with an asterisk are required for authorization.</p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Full Name *</label>
                                            <input
                                                required
                                                value={form.name}
                                                onChange={e => setForm({ ...form, name: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium"
                                                placeholder="e.g. Maverick Mitchell"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Corporate Email *</label>
                                            <input
                                                required
                                                type="email"
                                                value={form.email}
                                                onChange={e => setForm({ ...form, email: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium"
                                                placeholder="name@company.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Mission Category *</label>
                                        <select
                                            required
                                            value={form.subject}
                                            onChange={e => setForm({ ...form, subject: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium appearance-none"
                                        >
                                            <option value="">Select a subject...</option>
                                            <option>Platform Demo</option>
                                            <option>Technical Support</option>
                                            <option>Enterprise Pricing</option>
                                            <option>Press Inquiry</option>
                                            <option>Security/Bug Bounty</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Message Transmission *</label>
                                        <textarea
                                            required
                                            value={form.message}
                                            onChange={e => setForm({ ...form, message: e.target.value })}
                                            rows={6}
                                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium resize-none"
                                            placeholder="Detail your requirements or inquiry here..."
                                        />
                                    </div>

                                    <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white py-5 rounded-2xl font-black text-sm tracking-[0.2em] uppercase transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]">
                                        Send Signal
                                    </button>

                                    <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest">
                                        By transmitting, you agree to our <Link href="/legal/privacy" className="text-primary hover:underline underline-offset-4">Privacy Protocol</Link>
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-slate-100 dark:bg-black/40 py-16 border-t border-primary/10 mt-auto">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-4">   {new Date().getFullYear()} ReclamTrack Pro. Communication secured with end-to-end encryption.</p>
                </div>
            </footer>
        </div>
    );
}
