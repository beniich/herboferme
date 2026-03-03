import Link from 'next/link';

const jobs = [
    { title: 'Senior Full-Stack Engineer', dept: 'Engineering', location: 'Remote / Global', type: 'Full-time', badge: '     Hot' },
    { title: 'SaaS Product Manager', dept: 'Product', location: 'London / NYC', type: 'Full-time', badge: null },
    { title: 'Growth Business Lead', dept: 'Sales', location: 'Singapore / Remote', type: 'Full-time', badge: '     New' },
    { title: 'React Native Expert', dept: 'Engineering', location: 'Remote', type: 'Contract', badge: null },
    { title: 'Success Manager Pro', dept: 'Customer Success', location: 'Paris', type: 'Full-time', badge: '     New' },
    { title: 'Cloud Infrastructure Intern', dept: 'Engineering', location: 'Berlin', type: 'Internship', badge: null },
];

const perks = [
    { icon: 'distance', title: 'Global Remote', desc: 'Work from anywhere with our fully distributed culture.' },
    { icon: 'show_chart', title: 'Equity Package', desc: 'Own a piece of the revolution with competitive stock options.' },
    { icon: 'school', title: 'Learning Stacks', desc: 'Annual $2,500 budget for courses, books, and conferences.' },
    { icon: 'public', title: 'Citizen Impact', desc: 'Your code directly improves infrastructure for millions.' },
    { icon: 'health_and_safety', title: 'Elite Health', desc: '100% covered premium insurance for you and your kin.' },
    { icon: 'celebration', title: 'Global Summits', desc: 'Twice-a-year off-sites in world-class destinations.' },
];

export default function CareersPage() {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 selection:bg-primary/30 font-display min-h-screen flex flex-col">
            {/* Sticky Navigation */}
            <header className="fixed top-0 w-full z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="bg-primary p-1.5 rounded-lg text-white">
                            <span className="material-symbols-outlined text-2xl font-variation-fill">track_changes</span>
                        </div>
                        <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">ReclamTrack <span className="text-primary">Pro</span></h1>
                    </Link>
                    <nav className="hidden md:flex items-center gap-10">
                        <Link href="/about" className="text-sm font-semibold hover:text-primary transition-colors">About</Link>
                        <Link href="/blog" className="text-sm font-semibold hover:text-primary transition-colors">Blog</Link>
                        <Link href="/help" className="text-sm font-semibold hover:text-primary transition-colors">Help</Link>
                        <Link href="/status" className="text-sm font-semibold hover:text-primary transition-colors">Status</Link>
                    </nav>
                    <Link href="/login" className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg shadow-primary/20">
                        Join the Team
                    </Link>
                </div>
            </header>

            <main className="flex-1 pt-20">
                {/* Hero Section */}
                <section className="relative py-24 lg:py-32 overflow-hidden bg-slate-900 dark:bg-black">
                    <div className="absolute inset-0 z-0 opacity-40 bg-[radial-gradient(circle_at_50%_0%,#ec5b13_0%,transparent_50%)]"></div>
                    <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                        <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-primary/20 text-primary text-xs font-bold tracking-[0.2em] uppercase mb-8 border border-primary/30">
                            <span className="material-symbols-outlined text-sm">stars</span>
                            We are Hiring
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tight">
                            Build tools that <br />
                            <span className="text-primary">Defy the Ordinary.</span>
                        </h1>
                        <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
                            Join ReclamTrack Pro and help us architect the most transparent claims ecosystem on the planet. We're looking for outliers.
                        </p>
                        <div className="flex flex-wrap justify-center gap-8 text-slate-400 text-sm font-bold uppercase tracking-widest">
                            <span className="flex items-center gap-2"><span className="text-primary">   </span> 100% Distributed</span>
                            <span className="flex items-center gap-2"><span className="text-primary">   </span> Series B Funded</span>
                            <span className="flex items-center gap-2"><span className="text-primary">   </span> Impact Driven</span>
                        </div>
                    </div>
                </section>

                {/* Cultural Perks */}
                <section className="py-24 bg-white dark:bg-[#1a100a]">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-primary font-bold text-sm tracking-[0.2em] uppercase mb-4">Elite Culture</h2>
                            <h3 className="text-4xl font-black text-slate-900 dark:text-white">The Perks of Pro</h3>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {perks.map((p, i) => (
                                <div key={i} className="p-8 rounded-2xl bg-background-light dark:bg-background-dark border border-primary/5 hover:border-primary/20 transition-all group">
                                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-3xl">{p.icon}</span>
                                    </div>
                                    <h4 className="text-xl font-bold mb-2">{p.title}</h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{p.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Open Positions */}
                <section className="py-24" id="listings">
                    <div className="max-w-5xl mx-auto px-6">
                        <div className="flex items-end justify-between mb-12">
                            <div>
                                <h2 className="text-primary font-bold text-sm tracking-[0.2em] uppercase mb-4">Opportunities</h2>
                                <h3 className="text-4xl font-black text-slate-900 dark:text-white">Active Missions</h3>
                            </div>
                            <div className="hidden md:block text-right">
                                <span className="text-4xl font-black text-primary">{jobs.length}</span>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Open Channels</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {jobs.map((job, i) => (
                                <div key={i} className="group relative bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-8 hover:border-primary/50 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:shadow-primary/5">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="text-xl font-black group-hover:text-primary transition-colors">{job.title}</h4>
                                                {job.badge && (
                                                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                                                        {job.badge}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">hub</span> {job.dept}</span>
                                                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">location_on</span> {job.location}</span>
                                                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">schedule</span> {job.type}</span>
                                            </div>
                                        </div>
                                        <button className="bg-primary/5 group-hover:bg-primary text-primary group-hover:text-white h-12 w-12 md:h-14 md:w-14 rounded-xl flex items-center justify-center transition-all duration-300">
                                            <span className="material-symbols-outlined">arrow_forward</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Spontaneous Applications */}
                <section className="py-24 px-6 bg-slate-900 dark:bg-black relative overflow-hidden">
                    <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1522071823991-b9671e3015b3?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center"></div>
                    <div className="relative z-10 max-w-4xl mx-auto text-center py-12">
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Didn't find your match?</h2>
                        <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
                            We're always scouting for designers, strategists, and engineers who challenge the status quo. Send us your mission brief.
                        </p>
                        <Link href="/contact" className="inline-flex items-center gap-3 bg-white text-primary px-10 py-4 rounded-xl font-black text-lg hover:scale-105 transition-all">
                            Shoot your shot <span className="material-symbols-outlined">send</span>
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="bg-slate-100 dark:bg-black/40 py-16 border-t border-primary/10 mt-auto">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-6">   {new Date().getFullYear()} ReclamTrack Pro. Join the Revolution.</p>
                    <div className="flex justify-center gap-8 mb-8">
                        <a className="size-10 rounded-full border border-primary/10 flex items-center justify-center hover:bg-primary/10 text-primary transition-colors cursor-pointer"><span className="material-symbols-outlined text-lg italic">public</span></a>
                        <a className="size-10 rounded-full border border-primary/10 flex items-center justify-center hover:bg-primary/10 text-primary transition-colors cursor-pointer"><span className="material-symbols-outlined text-lg">code</span></a>
                        <a className="size-10 rounded-full border border-primary/10 flex items-center justify-center hover:bg-primary/10 text-primary transition-colors cursor-pointer"><span className="material-symbols-outlined text-lg">group</span></a>
                    </div>
                    <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <Link href="/legal/privacy" className="hover:text-primary">Privacy Protocol</Link>
                        <Link href="/legal/terms" className="hover:text-primary">Service Terms</Link>
                        <Link href="/help" className="hover:text-primary">Support Base</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

