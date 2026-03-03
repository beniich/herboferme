import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 selection:bg-primary/30 font-display">
            {/* Sticky Navigation */}
            <header className="fixed top-0 w-full z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary p-1.5 rounded-lg text-white">
                            <span className="material-symbols-outlined text-2xl font-variation-fill">track_changes</span>
                        </div>
                        <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">ReclamTrack <span className="text-primary">Pro</span></h1>
                    </div>
                    <nav className="hidden md:flex items-center gap-10">
                        <a className="text-sm font-semibold hover:text-primary transition-colors cursor-pointer" href="#story">Our Story</a>
                        <a className="text-sm font-semibold hover:text-primary transition-colors cursor-pointer" href="#mission">Mission</a>
                        <a className="text-sm font-semibold hover:text-primary transition-colors cursor-pointer" href="#values">Values</a>
                        <a className="text-sm font-semibold hover:text-primary transition-colors cursor-pointer" href="#team">Team</a>
                    </nav>
                    <Link href="/login" className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg shadow-primary/20">
                        Get Started
                    </Link>
                </div>
            </header>

            <main className="pt-20">
                {/* Hero Section */}
                <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
                    {/* Hero Mesh Background */}
                    <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px]"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/40 rounded-full blur-[120px]"></div>
                    </div>

                    <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                        <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-6 border border-primary/20">
                            The Future of Reclamation
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-8 leading-[1.1] tracking-tight">
                            Revolutionizing claims management through <span className="text-primary italic">relentless efficiency.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
                            Building a world where transparency isn't a feature, it's the foundation. Experience the gold standard of tracking.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-bold rounded-lg shadow-2xl shadow-primary/30 hover:scale-105 transition-transform">
                                Explore Our Journey
                            </button>
                            <button className="w-full sm:w-auto px-8 py-4 bg-slate-200 dark:bg-white/5 text-slate-900 dark:text-white font-bold rounded-lg border border-slate-300 dark:border-white/10 hover:bg-slate-300 dark:hover:bg-white/10 transition-all">
                                View Success Stories
                            </button>
                        </div>
                    </div>
                </section>

                {/* Story & Journey Section */}
                <section className="py-24 bg-white dark:bg-[#1a100a]" id="story">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-primary font-bold text-sm tracking-[0.2em] uppercase mb-4">Our Origin</h2>
                                <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6">Born from Chaos.</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-8">
                                    ReclamTrack was founded in 2018 when our founders realized the catastrophic gap in manual claims processing. Every year, billions were lost to inefficiencies and lack of oversight.
                                </p>
                                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-8">
                                    We didn't just want to build a tool; we wanted to create a paradigm shift. By merging advanced data analytics with a user-centric philosophy, we've transformed the reclamation landscape into a high-impact experience built on trust.
                                </p>
                                {/* Mini Stats */}
                                <div className="grid grid-cols-2 gap-6 pt-6">
                                    <div className="p-6 rounded-lg bg-background-light dark:bg-background-dark border border-primary/10">
                                        <div className="text-3xl font-black text-primary mb-1">$4.2B</div>
                                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Tracked Assets</div>
                                    </div>
                                    <div className="p-6 rounded-lg bg-background-light dark:bg-background-dark border border-primary/10">
                                        <div className="text-3xl font-black text-primary mb-1">99.9%</div>
                                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Data Accuracy</div>
                                    </div>
                                </div>
                            </div>
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-transparent rounded-xl blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative bg-[#221610] rounded-xl overflow-hidden aspect-square flex items-center justify-center border border-white/5">
                                    <div className="flex flex-col items-center gap-4 text-primary opacity-20 group-hover:opacity-40 transition-opacity">
                                        <span className="material-symbols-outlined text-[120px]">analytics</span>
                                        <p className="text-xl font-black uppercase tracking-widest">ReclamCore Engine</p>
                                    </div>
                                    {/* Simple Decorative UI */}
                                    <div className="absolute inset-0 p-8 flex flex-col justify-between">
                                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full w-2/3 bg-primary"></div>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2 items-end">
                                            <div className="h-12 bg-primary/40 rounded-sm"></div>
                                            <div className="h-24 bg-primary/60 rounded-sm"></div>
                                            <div className="h-32 bg-primary rounded-sm"></div>
                                            <div className="h-20 bg-primary/50 rounded-sm"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Mission & Values Section */}
                <section className="py-24 bg-gradient-to-br from-[#221610] via-[#3d1f0e] to-[#221610] relative" id="mission">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-20">
                            <h2 className="text-primary font-bold text-sm tracking-[0.2em] uppercase mb-4">Integrity & Impact</h2>
                            <h3 className="text-4xl md:text-5xl font-black text-white mb-6">Our North Star</h3>
                            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8" id="values">
                            {/* Value Card 1 */}
                            <div className="bg-white/5 backdrop-blur-md border border-primary/10 p-10 rounded-lg group hover:bg-white/10 transition-all">
                                <div className="w-14 h-14 bg-primary/20 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-primary text-3xl">precision_manufacturing</span>
                                </div>
                                <h4 className="text-xl font-bold text-white mb-4">Absolute Precision</h4>
                                <p className="text-slate-400 leading-relaxed">
                                    In the world of reclamation, every decimal point counts. We leverage military-grade precision to ensure not a single cent is misplaced.
                                </p>
                            </div>
                            {/* Value Card 2 */}
                            <div className="bg-white/5 backdrop-blur-md border border-primary/10 p-10 rounded-lg group hover:bg-white/10 transition-all">
                                <div className="w-14 h-14 bg-primary/20 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-primary text-3xl">verified_user</span>
                                </div>
                                <h4 className="text-xl font-bold text-white mb-4">Radical Integrity</h4>
                                <p className="text-slate-400 leading-relaxed">
                                    Transparency isn't optional. Our ledger-first approach provides immutable proof of every transaction, building trust that lasts.
                                </p>
                            </div>
                            {/* Value Card 3 */}
                            <div className="bg-white/5 backdrop-blur-md border border-primary/10 p-10 rounded-lg group hover:bg-white/10 transition-all">
                                <div className="w-14 h-14 bg-primary/20 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-primary text-3xl">rocket_launch</span>
                                </div>
                                <h4 className="text-xl font-bold text-white mb-4">Continuous Innovation</h4>
                                <p className="text-slate-400 leading-relaxed">
                                    The status quo is our enemy. We are constantly iterating on our core algorithms to stay ahead of market complexities.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className="py-24 bg-background-light dark:bg-background-dark" id="team">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
                            <div className="max-w-2xl">
                                <h2 className="text-primary font-bold text-sm tracking-[0.2em] uppercase mb-4">The Architects</h2>
                                <h3 className="text-4xl font-black text-slate-900 dark:text-white">Meet the Visionaries</h3>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                                A diverse collective of engineers, designers, and financial strategists dedicated to redefining tracking.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                                { name: 'Alex Mercer', role: 'Founder & CEO', initials: 'AM', color: 'from-primary to-orange-800' },
                                { name: 'Sarah Kang', role: 'Chief Technology Officer', initials: 'SK', color: 'from-slate-700 to-slate-900' },
                                { name: 'David Webb', role: 'Lead Product Designer', initials: 'DW', color: 'from-primary/60 to-primary' },
                                { name: 'Jasmine Tan', role: 'Head of Operations', initials: 'JT', color: 'from-orange-400 to-primary' },
                            ].map((m, i) => (
                                <div key={i} className="text-center group">
                                    <div className="relative mb-6 inline-block">
                                        <div className={`w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br ${m.color} rounded-lg flex items-center justify-center text-4xl md:text-5xl font-black text-white shadow-xl group-hover:-translate-y-2 transition-transform duration-300`}>
                                            {m.initials}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-background-light dark:bg-background-dark p-2 rounded-lg border border-primary/20">
                                            <span className="material-symbols-outlined text-primary text-sm">workspace_premium</span>
                                        </div>
                                    </div>
                                    <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">{m.name}</h4>
                                    <p className="text-sm font-semibold text-primary uppercase tracking-tighter">{m.role}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 px-6">
                    <div className="max-w-5xl mx-auto rounded-xl bg-primary p-12 md:p-20 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.2),_transparent)] opacity-50"></div>
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-8">Ready to track with precision?</h2>
                            <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
                                Join over 500+ enterprises leveraging ReclamTrack Pro for their claims management.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link href="/login" className="bg-white text-primary px-10 py-4 rounded-lg font-black text-lg hover:bg-slate-50 transition-colors">
                                    Request Demo
                                </Link>
                                <Link href="/contact" className="bg-transparent text-white border-2 border-white/30 hover:border-white px-10 py-4 rounded-lg font-black text-lg transition-all">
                                    Contact Sales
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-slate-100 dark:bg-black/40 py-16 border-t border-primary/10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary p-1.5 rounded-lg text-white">
                                <span className="material-symbols-outlined text-2xl font-variation-fill">track_changes</span>
                            </div>
                            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">ReclamTrack</h1>
                        </div>
                        <div className="flex gap-8 text-sm font-bold text-slate-500 uppercase tracking-widest">
                            <a className="hover:text-primary cursor-pointer">Twitter</a>
                            <a className="hover:text-primary cursor-pointer">LinkedIn</a>
                            <a className="hover:text-primary cursor-pointer">Github</a>
                        </div>
                    </div>
                    <div className="border-t border-slate-200 dark:border-white/5 pt-8 flex flex-col md:flex-row justify-between gap-4 text-xs text-slate-400 uppercase font-bold tracking-widest">
                        <p>   {new Date().getFullYear()} ReclamTrack Pro. All Rights Reserved.</p>
                        <div className="flex gap-6">
                            <Link href="/legal/privacy" className="hover:text-primary">Privacy Policy</Link>
                            <Link href="/legal/terms" className="hover:text-primary">Terms of Service</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

