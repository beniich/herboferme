import Link from 'next/link';

const plans = [
    {
        name: 'Starter',
        price: '299',
        period: '/mois',
        desc: 'Pour les petites mairies (< 10 000 habitants)',
        color: 'border-slate-200 dark:border-slate-700',
        badge: null,
        features: [
            'Jusqu\'   500 r  clamations/mois',
            '3 agents maximum',
            'Tableau de bord basique',
            'Notifications email',
            'Support par email (48h)',
        ],
        cta: 'Commencer',
        ctaStyle: 'border border-primary text-primary hover:bg-primary hover:text-white',
    },
    {
        name: 'Pro',
        price: '599',
        period: '/mois',
        desc: 'Pour les municipalit  s de taille moyenne',
        color: 'border-primary shadow-2xl shadow-primary/20',
        badge: '    Le plus choisi',
        features: [
            'R  clamations illimit  es',
            '20 agents',
            'Tableau de bord avanc   + carte',
            'Notifications multi-canal (email, SMS, push)',
            'Rapports automatis  s (PDF)',
            'API compl  te',
            'Support prioritaire (4h)',
        ],
        cta: 'Choisir Pro',
        ctaStyle: 'bg-primary text-white hover:bg-blue-700 shadow-xl shadow-primary/30',
    },
    {
        name: 'Enterprise',
        price: 'Sur devis',
        period: '',
        desc: 'Pour les grandes collectivit  s & m  tropoles',
        color: 'border-slate-200 dark:border-slate-700',
        badge: null,
        features: [
            'Agents illimit  s',
            'Multi-entit  s',
            'SLA garanti 99.9%',
            'Int  gration SSO / Active Directory',
            'Tableau de bord personnalisable',
            'Manager de compte d  di  ',
            'Support 24h/7',
        ],
        cta: 'Nous contacter',
        ctaStyle: 'border border-primary text-primary hover:bg-primary hover:text-white',
    },
];

const features = [
    { icon: 'receipt_long', title: 'Gestion multi-canaux', desc: 'Web, mobile, email, SMS     chaque r  clamation centralis  e automatiquement.' },
    { icon: 'timeline', title: 'Suivi en temps r  el', desc: 'Statuts automatiquement mis    jour et visibles par les citoyens et les agents.' },
    { icon: 'notifications_active', title: 'Alertes intelligentes', desc: 'Escalade automatique, rappels SLA, notifications aux r  clamants.' },
    { icon: 'bar_chart', title: 'Rapports & Analytics', desc: 'Tableaux de bord KPI, exports PDF, tendances et pr  dictions.' },
    { icon: 'location_on', title: 'G  olocalisation', desc: 'Carte interactive des incidents, zones    forte densit   de r  clamations.' },
    { icon: 'api', title: 'API ouverte', desc: 'Int  gration avec vos syst  mes existants (SIRH, ERP, portail citoyen).' },
];

export default function PressingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-slate-100 font-sans">
            {/* Nav */}
            <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-[#0a0a0f]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="flex items-center justify-center size-9 bg-primary rounded-lg text-white">
                            <span className="material-symbols-outlined text-xl notranslate">account_balance</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Cloud <span className="text-primary">Industrie</span></h2>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
                            Se connecter
                        </Link>
                        <Link href="/services/pressing/checkout" className="bg-primary text-white text-sm font-black px-5 py-2 rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-primary/30">
                            Commander
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero */}
                <section className="relative py-24 lg:py-36 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
                    {/* Background decoration */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(37,99,235,0.3),transparent_60%)]"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.2),transparent_60%)]"></div>

                    {/* Animated ticket illustration */}
                    <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:flex items-center justify-center pr-10 opacity-40">
                        <div className="relative w-80">
                            {/* Floating ticket cards - static positions (no inline styles) */}
                            <div className="absolute top-[5%] left-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl">
                                <div className="size-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-sm notranslate">check_circle</span>
                                </div>
                                <span className="text-white font-bold text-sm">R  solu</span>
                            </div>
                            <div className="absolute top-[30%] left-[10%] bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl">
                                <div className="size-8 bg-amber-500 rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-sm notranslate">pending</span>
                                </div>
                                <span className="text-white font-bold text-sm">En cours</span>
                            </div>
                            <div className="absolute top-[55%] left-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl">
                                <div className="size-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-sm notranslate">inbox</span>
                                </div>
                                <span className="text-white font-bold text-sm">Re  u</span>
                            </div>
                            <div className="absolute top-[80%] left-[15%] bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl">
                                <div className="size-8 bg-violet-500 rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-sm notranslate">task_alt</span>
                                </div>
                                <span className="text-white font-bold text-sm">Cl  tur  </span>
                            </div>
                        </div>
                    </div>

                    <div className="relative max-w-7xl mx-auto px-6">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/40 text-primary px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-8">
                                <span className="material-symbols-outlined text-xs notranslate">bolt</span>
                                Service Pressing     Gestion express
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-black text-white leading-[0.95] mb-8">
                                R  clamations<br />trait  es en<br /><span className="text-primary">mode express</span>
                            </h1>
                            <p className="text-blue-200 text-xl leading-relaxed mb-10 max-w-xl">
                                Le service <strong className="text-white">Pressing</strong> est votre solution tout-en-un pour digitaliser et automatiser la gestion des r  clamations citoyennes en 48h chrono.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/services/pressing/checkout" className="bg-primary text-white h-14 px-10 rounded-2xl font-black text-lg shadow-2xl shadow-primary/40 hover:bg-blue-600 transition-all flex items-center justify-center gap-2 group">
                                    D  marrer maintenant
                                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform notranslate">arrow_forward</span>
                                </Link>
                                <a href="#plans" className="bg-white/10 border border-white/20 text-white h-14 px-10 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center">
                                    Voir les plans
                                </a>
                            </div>

                            {/* Trust indicators */}
                            <div className="mt-12 flex items-center gap-8 text-blue-300 text-sm">
                                {['    Sans engagement', '     Mise en service en 48h', '     Donn  es h  berg  es en France'].map((t, i) => (
                                    <span key={i} className="font-medium">{t}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Workflow steps */}
                <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Comment   a marche ?</h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-3">4   tapes pour une r  clamation trait  e de A    Z</p>
                        </div>
                        <div className="relative">
                            {/* Connector line */}
                            <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary/30 via-primary to-primary/30"></div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {[
                                    { step: '01', icon: 'inbox', title: 'R  ception', desc: 'La r  clamation arrive via web, mobile ou email et est enregistr  e automatiquement.', color: 'bg-blue-500' },
                                    { step: '02', icon: 'assignment_ind', title: 'Attribution', desc: 'Assignation automatique    l\'agent comp  tent selon les r  gles configur  es.', color: 'bg-indigo-500' },
                                    { step: '03', icon: 'engineering', title: 'Traitement', desc: 'L\'agent traite, met    jour le statut. Le citoyen re  oit des notifications en temps r  el.', color: 'bg-violet-500' },
                                    { step: '04', icon: 'task_alt', title: 'Cl  ture', desc: 'Rapport de r  solution envoy  , satisfaction mesur  e, donn  es archiv  es.', color: 'bg-emerald-500' },
                                ].map((step, i) => (
                                    <div key={i} className="relative flex flex-col items-center text-center group">
                                        <div className={`relative size-20 ${step.color} rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                                            <span className="material-symbols-outlined text-white text-3xl notranslate">{step.icon}</span>
                                            <span className="absolute -top-2 -right-2 size-6 bg-white dark:bg-slate-900 border-2 border-current rounded-full text-xs font-black flex items-center justify-center text-slate-700 dark:text-slate-300">{step.step}</span>
                                        </div>
                                        <h3 className="font-black text-slate-900 dark:text-white text-lg mb-2">{step.title}</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="py-24">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Tout ce dont vous avez besoin</h2>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map((f, i) => (
                                <div key={i} className="group p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-primary hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="size-14 bg-primary/5 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                        <span className="material-symbols-outlined text-2xl notranslate">{f.icon}</span>
                                    </div>
                                    <h3 className="font-black text-slate-900 dark:text-white text-lg mb-3">{f.title}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Social proof */}
                <section className="py-16 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">Ils ont adopt   le service Pressing</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { name: 'Direction des Services Municipaux', city: 'Toulouse', quote: '   Nous avons divis   par 4 notre d  lai moyen de traitement en 3 mois.   ', rating: 5 },
                                { name: 'DSI M  tropole', city: 'Bordeaux', quote: '   L\'int  gration avec notre portail citoyen existant a   t   faite en une journ  e.   ', rating: 5 },
                                { name: 'Service Technique', city: 'Nantes', quote: '   Le tableau de bord cartographique a transform   notre fa  on de prioriser.   ', rating: 5 },
                            ].map((t, i) => (
                                <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                                    <div className="flex gap-1 mb-4">
                                        {Array.from({ length: t.rating }).map((_, j) => (
                                            <span key={j} className="text-amber-400">   </span>
                                        ))}
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 italic mb-4 text-sm leading-relaxed">{t.quote}</p>
                                    <div>
                                        <p className="font-black text-slate-900 dark:text-white text-sm">{t.name}</p>
                                        <p className="text-slate-500 text-xs">Mairie de {t.city}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing */}
                <section id="plans" className="py-24">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Choisissez votre plan</h2>
                            <p className="text-slate-500 dark:text-slate-400">Tous les plans incluent un d  ploiement rapide en 48h et 14 jours d&apos;essai gratuit.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6 items-start">
                            {plans.map((plan, i) => (
                                <div key={i} className={`relative bg-white dark:bg-slate-900 rounded-3xl border-2 ${plan.color} p-8 transition-all hover:shadow-2xl hover:-translate-y-1 duration-300`}>
                                    {plan.badge && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                            <span className="bg-primary text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg">{plan.badge}</span>
                                        </div>
                                    )}
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{plan.desc}</p>
                                    <div className="flex items-end gap-1 mb-8">
                                        <span className="text-4xl font-black text-slate-900 dark:text-white">{plan.price === 'Sur devis' ? plan.price : `${plan.price}   `}</span>
                                        {plan.period && <span className="text-slate-400 mb-1">{plan.period}</span>}
                                    </div>
                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map((feat, j) => (
                                            <li key={j} className="flex items-start gap-3 text-sm">
                                                <span className="material-symbols-outlined text-primary text-sm mt-0.5 notranslate">check_circle</span>
                                                <span className="text-slate-600 dark:text-slate-400">{feat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Link
                                        href={plan.name === 'Enterprise' ? '/contact' : `/services/pressing/checkout?plan=${plan.name.toLowerCase()}`}
                                        className={`w-full py-3.5 rounded-xl font-black text-center block transition-all ${plan.ctaStyle}`}
                                    >
                                        {plan.cta}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-24 bg-gradient-to-br from-primary to-blue-700">
                    <div className="max-w-3xl mx-auto px-6 text-center text-white">
                        <h2 className="text-4xl font-black mb-4">Pr  t    d  marrer ?</h2>
                        <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
                            Configuration en 30 minutes. D  ploiement en 48h. Premier ticket trait   avant la fin de la semaine.
                        </p>
                        <Link href="/services/pressing/checkout" className="bg-white text-primary px-12 py-5 rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl inline-block">
                            Commencer l&apos;essai gratuit
                        </Link>
                        <p className="text-blue-200 text-sm mt-6">14 jours gratuits     Aucune carte requise     Annulation imm  diate</p>
                    </div>
                </section>
            </main>

            <footer className="bg-white dark:bg-[#0a0a0f] border-t border-slate-200 dark:border-slate-800 py-8 text-center text-sm text-slate-400">
                <p>   {new Date().getFullYear()} Cloud Industrie     <Link href="/" className="hover:text-primary">Accueil</Link>    <Link href="/legal/privacy" className="hover:text-primary">Confidentialit  </Link>    <Link href="/legal/terms" className="hover:text-primary">CGU</Link></p>
            </footer>
        </div>
    );
}
