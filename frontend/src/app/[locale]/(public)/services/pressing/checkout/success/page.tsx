import Link from 'next/link';

export default function PressingCheckoutSuccessPage() {
    const orderNumber = `PRE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const nextSteps = [
        { icon: 'mail', step: '1', title: 'V  rifiez votre email', desc: 'Un email de confirmation avec votre num  ro de commande et les acc  s vous attend.' },
        { icon: 'calendar_month', step: '2', title: 'Planifiez votre onboarding', desc: 'Notre   quipe vous contacte dans les 2h pour planifier votre session de configuration.' },
        { icon: 'rocket_launch', step: '3', title: 'D  ploiement en 48h', desc: 'Votre instance ReclamTrack est d  ploy  e et configur  e selon vos besoins.' },
        { icon: 'groups', step: '4', title: 'Formation de l\'  quipe', desc: 'Session de formation pour vos agents     1h30 pour   tre op  rationnels.' },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0f] font-sans">
            <header className="border-b border-slate-100 dark:border-slate-800">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="flex items-center justify-center size-9 bg-primary rounded-lg text-white">
                            <span className="material-symbols-outlined text-xl notranslate">account_balance</span>
                        </div>
                        <span className="text-lg font-black text-slate-900 dark:text-white">Cloud <span className="text-primary">Industrie</span></span>
                    </Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-20 text-center">
                {/* Success animation */}
                <div className="relative inline-flex mb-10">
                    <div className="size-28 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-emerald-500 text-6xl notranslate">check_circle</span>
                    </div>
                    <div className="absolute -top-2 -right-2 size-10 bg-primary rounded-full flex items-center justify-center animate-bounce">
                        <span className="material-symbols-outlined text-white text-lg notranslate">star</span>
                    </div>
                </div>

                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">
                    Bienvenue dans ReclamTrack !
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg mb-4 max-w-lg mx-auto">
                    Votre abonnement au service <strong className="text-slate-900 dark:text-white">Pressing</strong> a   t   confirm   avec succ  s.
                </p>

                {/* Order number */}
                <div className="inline-flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-3 mb-16">
                    <span className="material-symbols-outlined text-primary notranslate">receipt</span>
                    <span className="text-slate-500 dark:text-slate-400 text-sm">N   de commande :</span>
                    <span className="font-black text-slate-900 dark:text-white">{orderNumber}</span>
                </div>

                {/* Next steps */}
                <div className="text-left mb-16">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-8 text-center">Les prochaines   tapes</h2>
                    <div className="space-y-4">
                        {nextSteps.map((s, i) => (
                            <div key={i} className="flex gap-5 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
                                <div className="flex-shrink-0">
                                    <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center backdrop-blur">
                                        <span className="material-symbols-outlined text-primary text-xl notranslate">{s.icon}</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full">  tape {s.step}</span>
                                        <h3 className="font-black text-slate-900 dark:text-white">{s.title}</h3>
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Support box */}
                <div className="bg-gradient-to-br from-primary/5 to-blue-50 dark:from-primary/10 dark:to-slate-800 border border-primary/20 rounded-3xl p-8 mb-12">
                    <h3 className="font-black text-slate-900 dark:text-white mb-3">Une question ?</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">Notre   quipe support est disponible imm  diatement pour vous accompagner.</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a href="mailto:support@cloudindustrie.fr" className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-5 py-3 rounded-xl font-bold text-sm hover:border-primary transition-all">
                            <span className="material-symbols-outlined text-sm notranslate">mail</span>
                            support@cloudindustrie.fr
                        </a>
                        <a href="tel:+33123456789" className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-5 py-3 rounded-xl font-bold text-sm hover:border-primary transition-all">
                            <span className="material-symbols-outlined text-sm notranslate">call</span>
                            +33 1 23 45 67 89
                        </a>
                    </div>
                </div>

                {/* CTA buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/login" className="bg-primary text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-primary/30">
                        Acc  der    mon tableau de bord
                    </Link>
                    <Link href="/" className="border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-10 py-4 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                        Retour    l&apos;accueil
                    </Link>
                </div>
            </main>

            <footer className="border-t border-slate-100 dark:border-slate-800 py-8 text-center text-sm text-slate-400">
                <p>   {new Date().getFullYear()} Cloud Industrie     Merci de votre confiance       </p>
            </footer>
        </div>
    );
}
