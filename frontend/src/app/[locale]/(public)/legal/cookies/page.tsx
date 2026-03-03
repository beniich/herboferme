import Link from 'next/link';

export default function CookiesPage() {
    const cookieCategories = [
        {
            id: 'essential',
            icon: 'lock_person',
            title: 'Essential Protocol Cookies',
            status: 'Required',
            description: 'These cookies are mathematically necessary for the core functionality of ReclamTrack Pro. They handle session verification, security tokens, and infrastructure preferences.',
            cookies: ['auth_session', 'csrf_protection', 'protocol_locale', 'system_theme'],
            accent: 'bg-primary/10 text-primary border-primary/20'
        },
        {
            id: 'analytics',
            icon: 'monitoring',
            title: 'Analytics & Optimization',
            status: 'Optional',
            description: 'We use privacy-preserving, self-hosted analytics to monitor system performance and identify bottlenecks. All data is anonymized and never leaves our infrastructure.',
            cookies: ['performance_metrics', 'latency_stats', 'load_balancing_id'],
            accent: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
        },
        {
            id: 'privacy',
            icon: 'security',
            title: 'Third-Party Tracking',
            status: 'None',
            description: 'ReclamTrack Pro maintains a zero-tolerance policy for third-party trackers. We do not use Google Ads, Facebook Pixels, or any behavior-tracking surveillance technology.',
            cookies: [],
            accent: 'bg-green-500/10 text-green-500 border-green-500/20'
        }
    ];

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 selection:bg-primary/30 font-display">
            {/* Minimal Header */}
            <header className="fixed top-0 w-full z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="bg-primary p-1.5 rounded-lg text-white group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-2xl font-variation-fill">track_changes</span>
                        </div>
                        <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase transition-colors">
                            ReclamTrack <span className="text-primary">Pro</span>
                        </h1>
                    </Link>
                    <Link href="/login" className="text-sm font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest">
                        Back to Portal
                    </Link>
                </div>
            </header>

            <main className="pt-20">
                {/* Hero Section */}
                <section className="relative py-24 overflow-hidden border-b border-primary/5">
                    <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3"></div>
                    </div>

                    <div className="relative z-10 max-w-4xl mx-auto px-6">
                        <div className="flex items-center gap-2 text-primary font-bold text-xs tracking-widest uppercase mb-4">
                            <span className="w-8 h-[1px] bg-primary"></span>
                            Governance & Transparency
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                            Cookie <span className="text-primary italic">Policy.</span>
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl font-light leading-relaxed">
                            Efficiency meets privacy. Our cookie management protocol is designed to maximize system performance while respecting your absolute right to digital anonymity.
                        </p>
                        <div className="mt-8 flex items-center gap-4 text-xs font-mono text-slate-400 uppercase tracking-widest">
                            <span>Revision 2.0.4</span>
                            <span className="w-1 h-1 bg-primary rounded-full"></span>
                            <span>Effective: Feb 2026</span>
                        </div>
                    </div>
                </section>

                <section className="py-24 bg-white dark:bg-[#1a100a]">
                    <div className="max-w-4xl mx-auto px-6">
                        <div className="space-y-8">
                            {cookieCategories.map((cat) => (
                                <div key={cat.id} className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                                    <div className="relative bg-background-light dark:bg-background-dark border border-primary/10 rounded-2xl p-8 hover:border-primary/30 transition-all">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className={`p-3 rounded-xl ${cat.accent}`}>
                                                        <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{cat.title}</h3>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${cat.accent}`}>
                                                                {cat.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{cat.description}</p>
                                                    </div>
                                                </div>

                                                {cat.cookies.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-6">
                                                        {cat.cookies.map((cookie) => (
                                                            <code key={cookie} className="text-xs font-mono bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/5">
                                                                {cookie}
                                                            </code>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Management Box */}
                        <div className="mt-16 bg-[#221610] rounded-2xl border border-primary/20 p-10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-5 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                            <div className="relative z-10">
                                <h2 className="text-2xl font-black text-white mb-4">Autonomous Control</h2>
                                <p className="text-slate-400 leading-relaxed mb-8 max-w-2xl">
                                    You have the power to define your tracking perimeter. While ReclamTrack Pro operates at peak efficiency with standard settings, you can recalibrate your browser to reject protocols at any time.
                                </p>
                                <div className="flex flex-wrap gap-6">
                                    <Link href="/legal/privacy" className="flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all uppercase tracking-widest text-xs">
                                        Privacy Framework <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </Link>
                                    <Link href="/contact" className="flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all uppercase tracking-widest text-xs">
                                        Protocol Support <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-slate-100 dark:bg-black/40 py-16 border-t border-primary/10">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <div className="bg-primary p-1.5 rounded-lg text-white">
                            <span className="material-symbols-outlined text-2xl font-variation-fill">track_changes</span>
                        </div>
                        <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase italic">ReclamTrack Pro</h1>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-500 uppercase tracking-[0.3em] font-bold">
                           {new Date().getFullYear()} Precision Management Ecosystem. All Rights Reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
