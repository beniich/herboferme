import Link from 'next/link';

export default function TermsPage() {
    const sections = [
        { id: 'acceptance', title: '1. Acceptance of Protocol', content: `By accessing ReclamTrack Pro and utilizing our decentralized infrastructure, you agree to be bound by these mission-critical Terms of Service. If you do not accept these parameters,        must immediately cease all transmissions. These terms apply to all verified entities on the platform.` },
        { id: 'description', title: '2. Service Architecture', content: `ReclamTrack Pro provides an elite SaaS platform for reclamation management and civic intelligence. The service includes: advanced analytics dashboards, ticket orchestration, real-time notification hubs, RESTful APIs, and cross-platform integrations.` },
        { id: 'accountability', title: '3. Identity Accountability', content: `You are solely responsible for the fortification of your access credentials. Notify internal security immediately of any unauthorized breach. ReclamTrack Pro is not liable for data leakage resulting from insecure identity management on the client side.` },
        { id: 'usage', title: '4. Operational Parameters', content: `Users are prohibited from: (a) utilizing the platform for non-verified operations; (b) attempting unauthorized privilege escalation; (c) redistributing proprietary code; (d) injecting malicious payloads; (e) scraping or harvesting metadata from other organizations.` },
        { id: 'intellectual', title: '5. IP Sovereignty', content: `ReclamTrack Pro, its visual identity, architecture, and source code are the exclusive property of ReclamTrack Pro Global, protected by international intellectual property treaties. No usage license is granted beyond the active subscription tier.` },
        { id: 'sovereignty', title: '6. Data Sovereignty', content: `Usage is governed by our Privacy Protocol, incorporated by reference. You maintain absolute sovereignty over your raw data. You grant us a limited, functional license to process data solely to execute requested services.` },
        { id: 'availability', title: '7. Uptime Commitment', content: `We commit to 99.9% availability (excluding plannd maintenance windows). Prolonged outages are subject to service credits according to your active SLA. Real-time health is broadcast via our Status Nexus.` },
        { id: 'liability', title: '8. Liability Constraints', content: `To the maximum extent permitted by law, ReclamTrack Pro is not liable for indirect, incidental, or consequential mission failures. Total liability is capped at the amount paid for the service within the preceding 12-month cycle.` },
        { id: 'termination', title: '9. Mission Termination', content: `Subscriptions may be terminated via the Mission Dashboard. Termination is effective at the end of the current billing cycle. We reserve the right to suspend access in cases of critical violations of these protocols.` },
        { id: 'jurisdiction', title: '10. Legal Jurisdiction', content: `These protocols are governed by the laws of our primary operational hub. Disputes will be settled via binding arbitration in the agreed-upon jurisdiction.` },
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
                        <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">ReclamTrack <span className="text-primary text-primary">Pro</span></h1>
                    </Link>
                    <nav className="hidden md:flex items-center gap-10">
                        <Link href="/about" className="text-sm font-semibold hover:text-primary transition-colors">About</Link>
                        <Link href="/help" className="text-sm font-semibold hover:text-primary transition-colors">Help</Link>
                        <Link href="/legal/privacy" className="text-sm font-semibold hover:text-primary transition-colors">Privacy</Link>
                    </nav>
                </div>
            </header>

            <main className="flex-1 pt-20">
                {/* Hero Section */}
                <section className="py-20 bg-slate-100 dark:bg-white/5 border-b border-primary/10">
                    <div className="max-w-4xl mx-auto px-6">
                        <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-primary mb-6">
                            <span className="material-symbols-outlined text-sm">gavel</span>
                            Legal Framework
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">Terms of Service</h1>
                        <p className="text-slate-500 font-light text-lg">The operating protocols governing your use of ReclamTrack Pro.</p>
                    </div>
                </section>

                <section className="py-24">
                    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16">
                        {/* Interactive Sidebar */}
                        <aside className="lg:col-span-4 lg:sticky lg:top-32 h-fit space-y-8">
                            <div className="bg-slate-900 text-white rounded-3xl p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <h2 className="text-lg font-black mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">list_alt</span>
                                    Protocol Map
                                </h2>
                                <nav className="space-y-1">
                                    {sections.map((s, i) => (
                                        <a key={i} href={`#${s.id}`} className="flex items-center gap-3 p-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                                            <span className="text-primary">0{i+1}</span>
                                            {s.title.split('. ')[1]}
                                        </a>
                                    ))}
                                </nav>
                            </div>

                            <div className="p-8 border border-primary/10 rounded-3xl bg-primary/5">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Requirement</p>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                    Usage of ReclamTrack Pro implies full compliance with these terms. Protocols are updated quarterly.
                                </p>
                            </div>
                        </aside>

                        {/* Document Content */}
                        <div className="lg:col-span-8 space-y-20">
                            {sections.map((section, i) => (
                                <div key={i} id={section.id} className="scroll-mt-32">
                                    <h2 className="text-2xl font-black mb-6 text-slate-900 dark:text-white flex items-center gap-4">
                                        <span className="text-primary italic font-serif">  </span>
                                        {section.title}
                                    </h2>
                                    <div className="text-slate-600 dark:text-slate-400 leading-relaxed font-light text-lg">
                                        {section.content}
                                    </div>
                                </div>
                            ))}

                            <div className="mt-20 pt-12 border-t border-primary/10 text-center">
                                <p className="text-slate-400 text-sm italic font-light">Last Protocol Update: January 1, 2026. Version 2.1.0-PRO.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-slate-100 dark:bg-black/40 py-16 border-t border-primary/10 mt-auto">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-4">   {new Date().getFullYear()} ReclamTrack Pro Global HQ. Licensed for Enterprise Use.</p>
                </div>
            </footer>
        </div>
    );
}
