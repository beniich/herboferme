import Link from 'next/link';

export default function PressPage() {
    const mentions = [
        { publication: 'Global Tech Insights', date: 'Feb 2026', headline: '"ReclamTrack Pro: The future of civic infrastructure is decentralized."' },
        { publication: 'Enterprise SaaS Weekly', date: 'Jan 2026', headline: '"From startup to scale-up: How ReclamTrack Pro captured 50+ major municipalities."' },
        { publication: 'Public Sector News', date: 'Dec 2025', headline: '"ReclamTrack Pro secures $12M Series B to accelerate AI integration."' },
    ];

    const assets = [
        { name: 'Core Identity (SVG)', desc: 'White & dark variations', icon: 'image', size: '12 KB' },
        { name: 'Global Brand Book', desc: 'Typography and palette guide', icon: 'menu_book', size: '4.5 MB' },
        { name: 'UI Visualization Kit', desc: 'Dashboard and mobile mockups', icon: 'screenshot_monitor', size: '12.2 MB' },
        { name: 'Enterprise Media Pack', desc: 'Complete ZIP archive', icon: 'folder_zip', size: '45 MB' },
        { name: 'Executive Biographies', desc: 'Leadership profiles & photos', icon: 'badge', size: '3.1 MB' },
        { name: 'Platform Reel (60s)', desc: '4K ProRes     Global subtitles', icon: 'videocam', size: '280 MB' },
    ];

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen flex flex-col selection:bg-primary/30">
            {/* Sticky Navigation */}
            <header className="fixed top-0 w-full z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="bg-primary p-1.5 rounded-lg text-white">
                            <span className="material-symbols-outlined text-2xl font-variation-fill">track_changes</span>
                        </div>
                        <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">ReclamTrack <span className="text-primary">Pro</span></h1>
                    </Link>
                    <Link href="/contact" className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg shadow-primary/20">
                        Press Inquiry
                    </Link>
                </div>
            </header>

            <main className="flex-1 pt-20">
                {/* Hero Section */}
                <section className="relative py-24 lg:py-32 bg-slate-900 dark:bg-black overflow-hidden text-center">
                    <div className="absolute inset-0 z-0 opacity-40 bg-[radial-gradient(circle_at_50%_0%,#ec5b13_5%,transparent_60%)]"></div>
                    <div className="relative z-10 max-w-4xl mx-auto px-6">
                        <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-primary/20 text-primary text-[10px] font-black tracking-widest uppercase mb-8 border border-primary/30">
                            <span className="material-symbols-outlined text-sm">public</span>
                            Media Global Hub
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight">Mission Control</h1>
                        <p className="text-xl text-slate-400 font-light max-w-2xl mx-auto mb-12">
                            Official resources, verified narratives, and high-fidelity visual assets for our media partners.
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-12">
                            {[
                                { val: '$12M', label: 'Series B Funding' },
                                { val: '50+', label: 'Strategic Cities' },
                                { val: '14+', label: 'Global Nodes' },
                                { val: '2.4M', label: 'Tickets Resolved' },
                            ].map((s, i) => (
                                <div key={i} className="text-center">
                                    <div className="text-2xl md:text-3xl font-black text-white">{s.val}</div>
                                    <div className="text-[10px] text-primary uppercase tracking-[0.2em] mt-1 font-bold">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Media Coverage */}
                <section className="py-24 bg-white dark:bg-[#1a100a]">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="mb-16">
                            <h2 className="text-primary font-black text-xs uppercase tracking-widest mb-2">Verified Narratives</h2>
                            <h3 className="text-4xl font-black text-slate-900 dark:text-white">Recent Coverage</h3>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {mentions.map((m, i) => (
                                <div key={i} className="flex flex-col p-8 bg-background-light dark:bg-background-dark rounded-3xl border border-primary/5 hover:border-primary/20 transition-all group">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined">newspaper</span>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.date}</span>
                                    </div>
                                    <p className="font-black text-xl mb-4 group-hover:text-primary transition-colors leading-tight">{m.publication}</p>
                                    <p className="text-slate-500 dark:text-slate-400 italic font-light text-sm flex-1 leading-relaxed">{m.headline}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Assets Grid */}
                <section className="py-24 relative overflow-hidden">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="mb-16 text-right">
                            <h2 className="text-primary font-black text-xs uppercase tracking-widest mb-2">Visual Core</h2>
                            <h3 className="text-4xl font-black text-slate-900 dark:text-white">Brand Assets</h3>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {assets.map((asset, i) => (
                                <div key={i} className="group bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-6 hover:border-primary transition-all cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-primary/5">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-lg shadow-primary/5">
                                            <span className="material-symbols-outlined text-2xl">{asset.icon}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 dark:text-white text-sm">{asset.name}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{asset.size}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed font-light">{asset.desc}</p>
                                    <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                        Download <span className="material-symbols-outlined text-sm">download</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Press Contact */}
                <section className="py-24 bg-slate-900 dark:bg-black relative text-white">
                    <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(circle_at_0%_100%,#ec5b13_0%,transparent_40%)]"></div>
                    <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                        <h2 className="text-3xl font-black mb-4">Direct Communication</h2>
                        <p className="text-slate-400 mb-12 font-light">For interviews, strategic inquiries, or credential validation:</p>

                        <div className="grid md:grid-cols-2 gap-8 mb-12">
                            <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
                                <h3 className="text-lg font-black mb-2">Media Relations</h3>
                                <p className="text-primary font-black text-xl mb-1">press@reclamtrack.pro</p>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">+1 (888) 555-0123</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
                                <h3 className="text-lg font-black mb-2">Investor Intel</h3>
                                <p className="text-primary font-black text-xl mb-1">ir@reclamtrack.pro</p>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">+1 (888) 555-0124</p>
                            </div>
                        </div>

                        <Link href="/contact" className="inline-flex items-center gap-3 bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl">
                            Mission Transmission Form <span className="material-symbols-outlined">arrow_forward</span>
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="bg-slate-100 dark:bg-black/40 py-16 border-t border-primary/10 mt-auto">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">   {new Date().getFullYear()} ReclamTrack Pro. Information Secured.</p>
                </div>
            </footer>
        </div>
    );
}
