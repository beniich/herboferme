'use client';

import Link from 'next/link';

export default function SystemInfoPage() {
    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased transition-colors duration-300">
            <div className="layout-container flex h-full grow flex-col">
                {/* Top Navigation Bar */}
                <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 px-6 md:px-20 lg:px-40 py-4 bg-white dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-3 text-primary">
                            <div className="size-8 flex items-center justify-center rounded-lg bg-primary/10">
                                <span className="material-symbols-outlined text-primary">cloud</span>
                            </div>
                            <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">CloudIndustrie</h2>
                        </Link>
                        <nav className="hidden md:flex items-center gap-9">
                            <Link className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" href="/dashboard">Dashboard</Link>
                            <Link className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" href="/complaints/list">Work Orders</Link>
                            <Link className="text-slate-900 dark:text-white text-sm font-bold leading-normal border-b-2 border-primary" href="/system-info">System Info</Link>
                        </nav>
                    </div>
                    <div className="flex flex-1 justify-end gap-4 items-center">
                        <label className="hidden lg:flex flex-col min-w-40 h-10 max-w-64">
                            <div className="flex w-full flex-1 items-stretch rounded-xl h-full bg-slate-100 dark:bg-slate-800">
                                <div className="text-slate-500 flex items-center justify-center pl-4">
                                    <span className="material-symbols-outlined text-[20px]">search</span>
                                </div>
                                <input className="form-input flex w-full min-w-0 flex-1 border-none bg-transparent focus:ring-0 h-full placeholder:text-slate-500 text-sm pl-2" placeholder="Search system docs..." value="" />
                            </div>
                        </label>
                        <button className="flex size-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <span className="material-symbols-outlined text-[20px]">notifications</span>
                        </button>
                        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-slate-200 dark:border-slate-700" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBu9xYS9IJJYPjFYsIYjZt8GZwMFYMGBoyR-A3EdQnMfgvKwKgHVhEZfGPwc9owpwvORhtOizux2VxzTBIOcx-B8krDUg4gcUmCEgeMQq2xQyfR9_8BXea1DaTsgwJaW6dSSLBxJVcE4dpi0NaGCxgt7qvIuSSPiqacLiJZOA-JhkueSjSiSDxmuR-6u8OILDmI4Mk0Y4VGiv2fHU5xqHQ0pzwmek_jCZ2UL1MPAadLcXCLdDdrpvdIisJeeiOxC5UGWcJahDzGfjCB")' }}></div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex flex-1 flex-col px-6 md:px-20 lg:px-40 py-10 max-w-[1440px] mx-auto w-full">
                    {/* Hero Section */}
                    <section className="mb-16">
                        <div className="flex flex-col md:flex-row items-center gap-10 bg-white dark:bg-slate-900 p-8 lg:p-12 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
                            <div className="flex-1 z-10">
                                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase rounded-full mb-4">Operations Guide</span>
                                <h1 className="text-slate-900 dark:text-white text-4xl lg:text-5xl font-black leading-tight tracking-[-0.033em] mb-4">
                                    Flux Technologique
                                </h1>
                                <p className="text-slate-600 dark:text-slate-400 text-lg max-w-xl leading-relaxed">
                                    Notre mission est de propulser votre croissance    travers une infrastructure robuste,
                                    IA-native et s  curis  e par des protocoles de nouvelle g  n  ration.
                                </p>
                                <div className="flex flex-wrap gap-4 mt-8">
                                    <button className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all">
                                        <span className="material-symbols-outlined text-[18px]">play_circle</span>
                                        System Demo
                                    </button>
                                    <button className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                        Download Documentation
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 w-full max-w-md relative hidden md:block">
                                <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full"></div>
                                <img
                                    className="rounded-xl relative z-10 shadow-2xl border border-slate-200 dark:border-slate-700"
                                    alt="Data visualization dashboard representing workflow statistics"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAahQQho0cRcV1gpY7dzsyYA913Jkkc4PtkQQSH58UgHtbqT_dR05eIwLrC2tKMkUgRMfN0LE_vFOrUTDUr7ZWblXG2VGT9tFTagUvZmCtHjCt6NWIw7bCeFtg0zITqGcaRd9HwFY45MDCL_U1E4hTcTbmJKlgh8W1RGkRBJwmMJeI1Jn4NmvVjeFuweRq7Mov6dHkPSsqbwHVtytsOjPx_w_GE2aazDldpEAI3ErJKEjH3LhigowEyjr6PbEOrTl0oxnXNyciIRrcW"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Step-by-Step Infographic */}
                    <section className="mb-20">
                        <div className="text-center mb-12">
                            <h2 className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight mb-2">Cycle de Vie des Services</h2>
                            <p className="text-slate-500">De l'expression du besoin    l'optimisation continue de vos performances.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
                            {/* Connecting Line (Desktop) */}
                            <div className="hidden md:block absolute top-[44px] left-0 w-full h-1 bg-slate-200 dark:bg-slate-800 -z-0"></div>

                            {/* Step 1 */}
                            <div className="flex flex-col items-center text-center group z-10">
                                <div className="size-20 rounded-full bg-white dark:bg-slate-900 border-4 border-primary flex items-center justify-center text-primary shadow-lg mb-6 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-3xl">hub</span>
                                </div>
                                <span className="text-xs font-bold text-primary uppercase tracking-widest mb-1">  tape 01</span>
                                <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">Capture</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Identification de vos besoins en ressources (GPU, CPU, Stockage).</p>
                            </div>

                            {/* Step 2 */}
                            <div className="flex flex-col items-center text-center group z-10">
                                <div className="size-20 rounded-full bg-white dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover:border-primary group-hover:text-primary shadow-sm mb-6 group-hover:scale-110 transition-all">
                                    <span className="material-symbols-outlined text-3xl">psychology</span>
                                </div>
                                <span className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1 group-hover:text-primary">  tape 02</span>
                                <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">Audit IA</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Analyse algorithmique pour optimiser la configuration de votre instance.</p>
                            </div>

                            {/* Step 3 */}
                            <div className="flex flex-col items-center text-center group z-10">
                                <div className="size-20 rounded-full bg-white dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover:border-primary group-hover:text-primary shadow-sm mb-6 group-hover:scale-110 transition-all">
                                    <span className="material-symbols-outlined text-3xl">rocket_launch</span>
                                </div>
                                <span className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1 group-hover:text-primary">  tape 03</span>
                                <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">D  ploiement</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Provisioning instantan   de votre environnement Cloud s  curis  .</p>
                            </div>

                            {/* Step 4 */}
                            <div className="flex flex-col items-center text-center group z-10">
                                <div className="size-20 rounded-full bg-white dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover:border-primary group-hover:text-primary shadow-sm mb-6 group-hover:scale-110 transition-all">
                                    <span className="material-symbols-outlined text-3xl">radar</span>
                                </div>
                                <span className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1 group-hover:text-primary">  tape 04</span>
                                <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">Monitoring</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Surveillance 24/7 de la performance et d  tection proactive des menaces.</p>
                            </div>

                            {/* Step 5 */}
                            <div className="flex flex-col items-center text-center group z-10">
                                <div className="size-20 rounded-full bg-white dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover:border-primary group-hover:text-primary shadow-sm mb-6 group-hover:scale-110 transition-all">
                                    <span className="material-symbols-outlined text-3xl">trending_up</span>
                                </div>
                                <span className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1 group-hover:text-primary">  tape 05</span>
                                <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">Optimisation</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Ajustement continu pour garantir un ROI maximal de votre infrastructure.</p>
                            </div>
                        </div>
                    </section>

                    {/* Team Capabilities Grid */}
                    <section className="mb-20">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">Expertise Technique</h2>
                                <p className="text-slate-500">Domaines d'intervention sp  cialis  s de CloudIndustrie.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* IA & Computing */}
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:shadow-lg transition-all cursor-default group">
                                <div className="size-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <span className="material-symbols-outlined">memory</span>
                                </div>
                                <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">IA & Computing</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Optimisation de clusters GPU NVIDIA A100 et d  ploiement de mod  les LLM.</p>
                            </div>
                            {/* Cybersecurity */}
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:shadow-lg transition-all cursor-default group">
                                <div className="size-12 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <span className="material-symbols-outlined">security</span>
                                </div>
                                <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">Cyber-blindage</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Protection ESET Enterprise, isolation CloudLinux et audits de vuln  rabilit  .</p>
                            </div>
                            {/* Cloud Architecture */}
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:shadow-lg transition-all cursor-default group">
                                <div className="size-12 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <span className="material-symbols-outlined">cloud_sync</span>
                                </div>
                                <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">Cloud Architecture</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Design de r  seaux hybrides, CDN LiteSpeed et orchestration de conteneurs.</p>
                            </div>
                            {/* Managed Services */}
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:shadow-lg transition-all cursor-default group">
                                <div className="size-12 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <span className="material-symbols-outlined">support_agent</span>
                                </div>
                                <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">Support Manag  </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Infog  rance 24/7 proactive par nos ing  nieurs experts en infrastructure.</p>
                            </div>
                        </div>
                    </section>

                    {/* Dashboard Statistics Brief */}
                    <section className="mb-10 p-8 rounded-xl bg-primary text-white flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold mb-2">Performance en Temps R  el</h2>
                            <p className="text-white/80 leading-relaxed">Nos syst  mes g  rent actuellement des milliers d'instances avec un taux de disponibilit   de 99.99%.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-center px-6 border-r border-white/20">
                                <div className="text-3xl font-black">12m</div>
                                <div className="text-xs font-bold uppercase tracking-widest text-white/70">Avg response</div>
                            </div>
                            <div className="text-center px-6">
                                <div className="text-3xl font-black">89</div>
                                <div className="text-xs font-bold uppercase tracking-widest text-white/70">Active Teams</div>
                            </div>
                        </div>
                        <Link href="/dashboard" className="bg-white text-primary px-8 py-4 rounded-xl font-bold hover:bg-slate-100 transition-colors whitespace-nowrap text-center">
                            View Active Dashboard
                        </Link>
                    </section>
                </main>

                {/* Footer */}
                <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 md:px-20 lg:px-40 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-3 text-primary mb-6">
                                <span className="material-symbols-outlined text-3xl">cloud</span>
                                <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">CloudIndustrie Portal</h2>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                                B  tir un monde plus rapide et plus s  curis   gr  ce aux technologies d'infrastructure de pointe.
                            </p>
                            <div className="flex gap-4">
                                <a className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-primary transition-colors" href="#">
                                    <span className="material-symbols-outlined text-[20px]">language</span>
                                </a>
                                <a className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-primary transition-colors" href="#">
                                    <span className="material-symbols-outlined text-[20px]">mail</span>
                                </a>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-slate-900 dark:text-white font-bold mb-4">Portal Links</h4>
                            <ul className="space-y-3">
                                <li><Link className="text-slate-500 dark:text-slate-400 hover:text-primary text-sm transition-colors" href="/system-info">Operational Flow</Link></li>
                                <li><Link className="text-slate-500 dark:text-slate-400 hover:text-primary text-sm transition-colors" href="/knowledge">Field Guidelines</Link></li>
                                <li><Link className="text-slate-500 dark:text-slate-400 hover:text-primary text-sm transition-colors" href="/reports">Compliance Reports</Link></li>
                                <li><Link className="text-slate-500 dark:text-slate-400 hover:text-primary text-sm transition-colors" href="/knowledge">Safety Protocols</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-slate-900 dark:text-white font-bold mb-4">Support</h4>
                            <ul className="space-y-3">
                                <li><Link className="text-slate-500 dark:text-slate-400 hover:text-primary text-sm transition-colors" href="/messages">Technical Helpdesk</Link></li>
                                <li><Link className="text-slate-500 dark:text-slate-400 hover:text-primary text-sm transition-colors" href="#">API Documentation</Link></li>
                                <li><Link className="text-slate-500 dark:text-slate-400 hover:text-primary text-sm transition-colors" href="#">System Status</Link></li>
                                <li><Link className="text-slate-500 dark:text-slate-400 hover:text-primary text-sm transition-colors" href="/admin">Contact Admin</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-slate-400 text-xs">   {new Date().getFullYear()} Cloudindustrie Ltd. Toutes les donn  es op  rationnelles sont s  curis  es.</p>
                        <div className="flex gap-6">
                            <Link className="text-slate-400 text-xs hover:text-primary transition-colors" href="#">Privacy Policy</Link>
                            <Link className="text-slate-400 text-xs hover:text-primary transition-colors" href="#">Terms of Service</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
