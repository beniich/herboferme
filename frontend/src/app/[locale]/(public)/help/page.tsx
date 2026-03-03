import Link from 'next/link';

const faqs = [
    {
        category: 'Getting Started',
        icon: 'rocket_launch',
        items: [
            { q: 'How do I create a Pro account?', a: 'Click the "Join the Team" or "Get Started" button, enter your organization details, and verify your email. Our automated setup completes in under 2 minutes.' },
            { q: 'Is there a trial period?', a: 'Yes, we offer a 14-day "Elite Trial" with full access to AI insights and advanced analytics. No credit card required to start.' },
            { q: 'How do I invite my team?', a: 'Navigate to Settings > Organization > Team. You can bulk-invite members via email or sync with your SSO provider.' },
        ]
    },
    {
        category: 'Billing & Plans',
        icon: 'payments',
        items: [
            { q: 'Can I change plans anytime?', a: 'Absolutely. Plan upgrades take effect immediately. Downgrades take effect at the end of the current billing cycle.' },
            { q: 'What payment methods do you support?', a: 'We accept all major credit cards, wire transfers for Enterprise accounts, and digital wallets like Apple Pay and Google Pay.' },
            { q: 'Are there public sector discounts?', a: 'Yes, ReclamTrack Pro offers dedicated pricing for municipal and government entities. Contact our government relations team.' },
        ]
    },
    {
        category: 'Security & Privacy',
        icon: 'shield_lock',
        items: [
            { q: 'Where is my data hosted?', a: 'Data is held in Tier-4 data centers with 256-bit encryption. We offer regional hosting options in the EU, US, and APAC.' },
            { q: 'Can I export my tracking data?', a: 'Yes, full data portability is central to our mission. Export in JSON, CSV, or PDF via the API or Dashboard.' },
            { q: 'How do I report a security vulnerability?', a: 'Please contact our security response team at security@reclamtrack.pro. We operate a private bug bounty program.' },
        ]
    },
];

export default function HelpPage() {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen flex flex-col">
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
                        <Link href="/careers" className="text-sm font-semibold hover:text-primary transition-colors">Careers</Link>
                        <Link href="/press" className="text-sm font-semibold hover:text-primary transition-colors">Press</Link>
                        <Link href="/status" className="text-sm font-semibold hover:text-primary transition-colors">Status</Link>
                    </nav>
                    <Link href="/contact" className="bg-white dark:bg-white/5 border border-primary/20 text-primary dark:text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all hover:bg-primary hover:text-white">
                        Support Center
                    </Link>
                </div>
            </header>

            <main className="flex-1 pt-20">
                {/* Search Hero */}
                <section className="relative py-24 lg:py-32 bg-slate-900 dark:bg-black overflow-hidden">
                    <div className="absolute inset-0 z-0 opacity-30 bg-[radial-gradient(circle_at_0%_100%,#ec5b13_0%,transparent_40%)]"></div>
                    <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">How can we help?</h1>
                        <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">Search our knowledge base for instant answers or explore by category below.</p>

                        <div className="relative max-w-2xl mx-auto group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-orange-400 rounded-2xl blur opacity-20 group-focus-within:opacity-50 transition-opacity"></div>
                            <div className="relative flex items-center bg-white dark:bg-white/5 border border-white/10 rounded-2xl p-2 pl-6">
                                <span className="material-symbols-outlined text-slate-400">search</span>
                                <input
                                    type="text"
                                    placeholder="Search for answers, guides, or API docs..."
                                    className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white py-4 px-4 font-medium"
                                />
                                <button className="bg-primary text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hidden sm:block">Search</button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Quick Shortcuts */}
                <section className="py-12 border-b border-primary/5">
                    <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-6">
                        {[
                            { label: 'Cloud Status', icon: 'cloud_done', href: '/status' },
                            { label: 'API Reference', icon: 'terminal', href: '#' },
                            { label: 'Community Hub', icon: 'forum', href: '#' },
                            { label: 'Video Guides', icon: 'play_circle', href: '#' },
                        ].map((link, i) => (
                            <Link key={i} href={link.href} className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white dark:bg-background-dark border border-slate-200 dark:border-white/5 hover:border-primary transition-all group">
                                <span className="material-symbols-outlined text-primary group-hover:scale-125 transition-transform">{link.icon}</span>
                                <span className="text-sm font-bold">{link.label}</span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Main Content (Tabs/Categories) */}
                <section className="py-24 bg-white dark:bg-[#1a100a]">
                    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16">
                        {/* Sidebar */}
                        <aside className="lg:col-span-3 space-y-2">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Knowledge Base</h2>
                            {faqs.map((f, i) => (
                                <a key={i} href={`#${f.category.toLowerCase().replace(/\s+/g, '-')}`} className="flex items-center gap-3 p-4 rounded-xl font-bold text-sm bg-transparent hover:bg-primary/5 transition-colors group">
                                    <span className="material-symbols-outlined text-slate-400 group-hover:text-primary">{f.icon}</span>
                                    {f.category}
                                </a>
                            ))}
                        </aside>

                        {/* FAQs */}
                        <div className="lg:col-span-9 space-y-20">
                            {faqs.map((section, si) => (
                                <div key={si} id={section.category.toLowerCase().replace(/\s+/g, '-')} className="scroll-mt-32">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined text-2xl">{section.icon}</span>
                                        </div>
                                        <h3 className="text-2xl font-black">{section.category}</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {section.items.map((item, ii) => (
                                            <details key={ii} className="group bg-background-light dark:bg-background-dark border border-primary/5 rounded-2xl overflow-hidden hover:border-primary transition-all">
                                                <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-lg group-open:text-primary transition-colors list-none">
                                                    {item.q}
                                                    <div className="w-8 h-8 rounded-full border border-primary/10 flex items-center justify-center group-open:rotate-180 transition-transform">
                                                        <span className="material-symbols-outlined text-primary">expand_more</span>
                                                    </div>
                                                </summary>
                                                <div className="px-6 pb-6 text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                                                    {item.a}
                                                </div>
                                            </details>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Still Stuck? */}
                <section className="py-24 bg-primary text-white text-center">
                    <div className="max-w-2xl mx-auto px-6">
                        <span className="material-symbols-outlined text-6xl mb-6">support_agent</span>
                        <h2 className="text-4xl font-black mb-6">Still stuck? No worries.</h2>
                        <p className="text-white/80 text-lg mb-10">Our elite support engineers are standing by 24/7 to help you resolve any reclamation obstacle.</p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/contact" className="bg-white text-primary px-10 py-4 rounded-xl font-black hover:scale-105 transition-all">Chat with Support</Link>
                            <a href="mailto:support@reclamtrack.pro" className="bg-black/20 text-white border border-white/20 px-10 py-4 rounded-xl font-black hover:bg-black/40 transition-all">Send Email</a>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-slate-100 dark:bg-black/40 py-16 border-t border-primary/10 mt-auto">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-6">   {new Date().getFullYear()} ReclamTrack Pro. Knowledge is Power.</p>
                    <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <Link href="/legal/privacy" className="hover:text-primary">Privacy Base</Link>
                        <Link href="/legal/terms" className="hover:text-primary">Usage Terms</Link>
                        <Link href="/careers" className="hover:text-primary">Work with us</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

