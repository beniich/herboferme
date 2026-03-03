import Link from 'next/link';

export default function GDPRPage() {
    const complianceBadges = [
        { icon: 'public', label: 'EU Sovereignty', desc: 'Secure EU Hosting' },
        { icon: 'enhanced_encryption', label: 'Encryption', desc: 'AES-256 + TLS 1.3' },
        {icon: 'visibility', label: 'Transparency', desc: 'Auditable Logic' },
        { icon: 'delete_forever', label: 'Right to Forget', desc: 'Instant Deletion' },
    ];

    const legalBases = [
        { base: 'Contractual Necessity', use: 'Execution of ReclamTrack Pro protocols' },
        { base: 'Legal Obligation', use: 'Maintenance of immutable audit logs' },
        { base: 'Legitimate Interest', use: 'Security, fraud prevention & system hardening' },
        { base: 'Consensual Access', use: 'Opt-in optimization & telemetry' },
    ];

    const userRights = [
        { icon: 'eye_tracking', title: 'Right of Access', desc: 'Request a full neural map of your data structure.' },
        { icon: 'edit_square', title: 'Right of Rectification', desc: 'Recalibrate inaccurate or obsolete identifiers.' },
        { icon: 'auto_delete', title: 'Right of Erasure', desc: 'Trigger the immediate purging of your data silos.' },
        { icon: 'move_item', title: 'Right of Portability', desc: 'Export your data in high-fidelity JSON structure.' },
        { icon: 'block', title: 'Right to Object', desc: 'Withdraw consent for specific processing layers.' },
        { icon: 'pause_circle', title: 'Right to Restriction', desc: 'Temporarily suspend protocol execution on your data.' },
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
                        <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">
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
                <section className="relative py-24 bg-gradient-to-br from-[#221610] via-[#3d1f0e] to-[#221610] border-b border-primary/10 overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(236,91,19,0.15),_transparent_70%)]"></div>
                    </div>

                    <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                        <div className="inline-flex items-center justify-center p-4 bg-primary/20 rounded-2xl border border-primary/30 mb-8 backdrop-blur-sm animate-pulse">
                            <span className="material-symbols-outlined text-primary text-5xl">verified_user</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tight">
                            GDPR <span className="text-primary font-light">Compliance.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
                            Privacy by design. Security by default. ReclamTrack Pro is engineered to meet and exceed global data protection standards.
                        </p>
                    </div>
                </section>

                <section className="py-24">
                    <div className="max-w-5xl mx-auto px-6">
                        {/* Compliance Badges */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
                            {complianceBadges.map((b, i) => (
                                <div key={i} className="bg-white dark:bg-[#1a100a] border border-primary/10 rounded-2xl p-6 text-center hover:border-primary/40 transition-all group">
                                    <div className="bg-primary/10 rounded-xl p-3 inline-block mb-4 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-primary text-3xl">{b.icon}</span>
                                    </div>
                                    <h3 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase tracking-wider mb-2">{b.label}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-tight">{b.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Legal Bases */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-[#221610] rounded-2xl border border-primary/20 p-8 h-full">
                                    <h2 className="text-xl font-black text-white mb-8 tracking-widest uppercase flex items-center gap-3">
                                        <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                                        Legal Bases
                                    </h2>
                                    <div className="space-y-4">
                                        {legalBases.map((lb, i) => (
                                            <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-primary/30 transition-all">
                                                <span className="text-[10px] font-black bg-primary/20 text-primary px-3 py-1 rounded-full uppercase tracking-tighter inline-block mb-2">
                                                    {lb.base}
                                                </span>
                                                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                                    {lb.use}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* User Rights */}
                            <div className="lg:col-span-2">
                                <div className="bg-white dark:bg-background-dark border border-primary/10 rounded-2xl p-8">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-8 tracking-widest uppercase flex items-center gap-3">
                                        <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                                        Individual Rights
                                    </h2>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {userRights.map((r, i) => (
                                            <div key={i} className="flex gap-4 p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 hover:shadow-xl hover:shadow-primary/5 transition-all">
                                                <div className="bg-primary/10 rounded-xl p-3 h-fit">
                                                    <span className="material-symbols-outlined text-primary text-2xl">{r.icon}</span>
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-slate-900 dark:text-white text-sm mb-1 uppercase tracking-tight">{r.title}</h3>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{r.desc}</p>
                                                    <Link href="/dashboard" className="text-[10px] font-bold text-primary mt-2 flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-widest">
                                                        Access Vault <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* DPO Contact */}
                        <div className="mt-8 bg-white dark:bg-background-dark border border-primary/10 rounded-2xl p-10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-primary opacity-[0.03] blur-[120px] rounded-full"></div>
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                                <div className="max-w-xl">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 italic">Data Protection Officer.</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 font-medium">
                                        Technical inquiries regarding your data security or specific requests concerning your individual rights should be directed to our infrastructure compliance desk.
                                    </p>
                                    <div className="flex flex-wrap gap-10">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Direct Email</p>
                                            <p className="text-lg font-black text-primary underline underline-offset-4">dpo@reclamtrack.pro</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">SLA Response</p>
                                            <p className="text-lg font-black text-slate-900 dark:text-white">48 Hours</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:w-auto p-8 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 text-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Regulatory Authority</p>
                                    <p className="text-xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter italic">CNIL / GDPR</p>
                                    <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="bg-primary text-white text-xs font-black uppercase tracking-widest px-8 py-3 rounded-lg shadow-lg shadow-primary/20 hover:scale-105 transition-transform inline-block">
                                        Verify Framework
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="mt-16 flex justify-center gap-10 flex-wrap text-[10px] font-black uppercase tracking-[0.2em]">
                            <Link href="/legal/privacy" className="text-slate-400 hover:text-primary transition-colors">Framework v12</Link>
                            <Link href="/legal/terms" className="text-slate-400 hover:text-primary transition-colors">Service Protocol</Link>
                            <Link href="/legal/cookies" className="text-slate-400 hover:text-primary transition-colors">Cookie Ledger</Link>
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
