import Link from 'next/link';

export default function PrivacyPage() {
    const sections = [
        {
            id: 'data-collection',
            title: '1. Data Collection',
            content: `We collect the following mission-critical information:
    Identification: Full name, professional email, secure phone verification.
    Connection Metrics: IP address, browser fingerprint, session timestamps.
    Usage Intelligence: Features accessed, reclaims processed, and platform-wide interaction patterns.
    Financial Data: Payment tokens (processed via PCI-DSS compliant partners).`
        },
        {
            id: 'data-usage',
            title: '2. Strategic Usage',
            content: `Your data fuels the following operations:
    Powering and refining our core reclamation infrastructure.
    Real-time mission alerts and critical account notifications.
    Advanced fraud detection and architectural security.
    Regulatory compliance and legal adherence.
    Generating anonymized strategic benchmarks.`
        },
        {
            id: 'hosting-security',
            title: '3. Hosting & Fortification',
            content: `Data is hosted in Tier-4 French data centers (OVHcloud Roubaix), ISO 27001 certified. We leverage TLS 1.3 for all transits and AES-256 at-rest encryption for sensitive identities. Production access is restricted to audited biometrically-secured channels.`
        },
        {
            id: 'data-sharing',
            title: '4. Zero-Sale Policy',
            content: `ReclamTrack Pro NEVER sells your data. We only broadcast it to:
    Core technical sub-processors (hosting, encrypted storage)     under strict Data Processing Agreements.
    Judicial authorities when mandated by international law.
    Authorized team members within your verified organization.`
        },
        {
            id: 'gdpr-rights',
            title: '5. Your Digital Rights (GDPR)',
            content: `Under EU mandate, you possess elite digital sovereignty:
    Absolute right of access to your data footprint.
    Precision rectification of any data anomalies.
    Permanent erasure ("Right to be Forgotten").
    Fluid data portability to other platforms.
    Right to halt strategic processing.
    Right to lodge a formal complaint with the CNIL.

To exercise sovereignty, contact: dpo@reclamtrack.pro`
        },
        {
            id: 'retention',
            title: '6. Strategic Retention',
            content: `Active data is preserved for the duration of your mission plus 3 years (statutory requirement). Anonymized metrics may be archived in our vault indefinitely for statistical evolution.`
        },
    ];

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
                        <Link href="/help" className="text-sm font-semibold hover:text-primary transition-colors">Help</Link>
                        <Link href="/legal/terms" className="text-sm font-semibold hover:text-primary transition-colors">Terms</Link>
                    </nav>
                </div>
            </header>

            <main className="flex-1 pt-20">
                {/* Hero */}
                <section className="py-20 bg-slate-100 dark:bg-white/5">
                    <div className="max-w-4xl mx-auto px-6">
                        <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-primary mb-6">
                            <span className="material-symbols-outlined text-sm">enhanced_encryption</span>
                            Legal Intelligence
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-4">Privacy Protocol</h1>
                        <div className="flex flex-wrap gap-6 text-sm font-bold text-slate-500">
                            <span className="flex items-center gap-2 italic">
                                <span className="material-symbols-outlined text-sm text-primary">event</span>
                                Effective: Jan 01, 2026
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-primary">history</span>
                                Version 4.0 (Pro Upgrade)
                            </span>
                        </div>
                    </div>
                </section>

                <section className="py-24">
                    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16">
                        {/* Summary + Quick Links */}
                        <aside className="lg:col-span-4 lg:sticky lg:top-32 h-fit space-y-8">
                            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8">
                                <h2 className="text-lg font-black mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">summarize</span>
                                    Mission Summary
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                                    We collect data solely to power your reclamation journey. We never sell, never compromise. Your data is fortified in France and sovereignty is yours at all times.
                                </p>
                            </div>

                            <nav className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-4">Protocol Sections</p>
                                {sections.map((s, i) => (
                                    <a key={i} href={`#${s.id}`} className="flex items-center gap-3 p-4 rounded-xl text-sm font-bold hover:bg-primary/10 hover:text-primary transition-all group">
                                        <span className="w-1 h-1 rounded-full bg-primary/20 group-hover:bg-primary"></span>
                                        {s.title}
                                    </a>
                                ))}
                            </nav>
                        </aside>

                        {/* Content */}
                        <div className="lg:col-span-8 space-y-20">
                            {sections.map((section, i) => (
                                <div key={i} id={section.id} className="scroll-mt-32">
                                    <h2 className="text-2xl font-black mb-6 text-slate-900 dark:text-white border-b border-primary/10 pb-4">{section.title}</h2>
                                    <div className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line font-light">
                                        {section.content}
                                    </div>
                                </div>
                            ))}

                            <div className="mt-20 p-8 bg-slate-900 text-white rounded-3xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full"></div>
                                <h3 className="text-xl font-black mb-4">Contact Protocol Officer</h3>
                                <p className="text-slate-400 mb-6 font-light">Direct line for all data sovereignty inquiries:</p>
                                <a href="mailto:dpo@reclamtrack.pro" className="inline-flex items-center gap-2 bg-primary px-6 py-3 rounded-xl font-black text-sm tracking-widest hover:scale-105 transition-all">
                                    DPO@RECLAMTRACK.PRO
                                    <span className="material-symbols-outlined text-sm">verified</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-slate-100 dark:bg-black/40 py-16 border-t border-primary/10 mt-auto">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">   {new Date().getFullYear()} ReclamTrack Pro. Fortified Protocol.</p>
                    <div className="flex gap-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <Link href="/legal/terms" className="hover:text-primary transition-colors">Usage Terms</Link>
                        <Link href="/help" className="hover:text-primary transition-colors">Help Nexus</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

