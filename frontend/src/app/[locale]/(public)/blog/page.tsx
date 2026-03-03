import Link from 'next/link';

const posts = [
    {
        category: 'Produit',
        categoryColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        title: 'ReclamTrack 3.0 : Le tableau de bord repens   pour les managers terrain',
        excerpt: 'D  couvrez toutes les nouveaut  s de notre mise    jour majeure : nouvelle carte interactive, alertes intelligentes et rapports automatis  s.',
        date: '15 f  vrier 2026',
        readTime: '5 min',
        author: 'Karim Benaouicha',
    },
    {
        category: 'Collectivit  s',
        categoryColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        title: 'Comment la Mairie de Lyon a r  duit son d  lai moyen de traitement de 72h    18h',
        excerpt: '  tude de cas : retour d\'exp  rience de l\'  quipe DSI de Lyon sur 18 mois d\'utilisation de ReclamTrack.',
        date: '8 f  vrier 2026',
        readTime: '8 min',
        author: 'Samira Ouali',
    },
    {
        category: 'Guide',
        categoryColor: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
        title: 'Automatiser les notifications citoyens : guide complet 2026',
        excerpt: 'Configuration des triggers, r  gles d\'escalade et personnalisation des templates     tout ce qu\'il faut savoir pour une communication proactive.',
        date: '1er f  vrier 2026',
        readTime: '10 min',
        author: 'Yassine Hamdi',
    },
    {
        category: 'S  curit  ',
        categoryColor: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        title: 'RGPD & gestion des donn  es citoyens : les bonnes pratiques',
        excerpt: 'Anonymisation, dur  e de conservation, droit    l\'oubli... Comment   tre en conformit   tout en maintenant la qualit   du service.',
        date: '25 janvier 2026',
        readTime: '7 min',
        author: 'Rania Mezghani',
    },
    {
        category: 'Ing  nierie',
        categoryColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        title: 'Architecture microservices : comment ReclamTrack scale    200,000 tickets',
        excerpt: 'Deep dive technique sur notre infrastructure : Kafka, Redis, PostgreSQL et les choix d\'architecture qui nous permettent de tenir la charge.',
        date: '18 janvier 2026',
        readTime: '12 min',
        author: 'Omar Ch  rif',
    },
    {
        category: 'Design',
        categoryColor: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
        title: 'UX en terrain communal : concevoir pour des utilisateurs non-tech',
        excerpt: 'Nos apprentissages de 50+ tests utilisateurs avec des agents municipaux pour cr  er une interface simple et efficace pour tous.',
        date: '10 janvier 2026',
        readTime: '6 min',
        author: 'Dina Farhat',
    },
];

export default function BlogPage() {
    const [featured, ...rest] = posts;

    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-slate-100 font-sans">
            <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-[#0a0a0f]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="flex items-center justify-center size-9 bg-primary rounded-lg text-white">
                            <span className="material-symbols-outlined text-xl notranslate">account_balance</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Cloud <span className="text-primary">Industrie</span></h2>
                    </Link>
                    <Link href="/login" className="bg-primary text-white text-sm font-bold px-5 py-2 rounded-lg hover:bg-blue-700 transition-all">
                        Se connecter
                    </Link>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero */}
                <section className="py-20 bg-gradient-to-br from-violet-50 to-blue-50 dark:from-slate-900 dark:to-violet-950">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                                 Blog
                        </span>
                        <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-4">Insights, guides & actualit  s</h1>
                        <p className="text-slate-600 dark:text-slate-400 text-lg">Par l&apos;  quipe ReclamTrack     pour les professionnels des services publics</p>
                    </div>
                </section>

                <section className="py-16 max-w-7xl mx-auto px-6">
                    {/* Featured */}
                    <div className="mb-16">
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Article    la une</h2>
                        <div className="group relative bg-gradient-to-br from-primary/5 to-blue-50 dark:from-primary/10 dark:to-slate-800 rounded-3xl border border-primary/20 p-8 lg:p-12 hover:shadow-2xl transition-all cursor-pointer">
                            <div className="flex flex-col lg:flex-row gap-8 items-start">
                                <div className="flex-1">
                                    <span className={`inline-block text-xs font-black px-3 py-1 rounded-full mb-4 ${featured.categoryColor}`}>{featured.category}</span>
                                    <h2 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white mb-4 group-hover:text-primary transition-colors leading-tight">{featured.title}</h2>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">{featured.excerpt}</p>
                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <div className="size-7 bg-primary rounded-full flex items-center justify-center text-white text-xs font-black">{featured.author[0]}</div>
                                            <span className="font-medium">{featured.author}</span>
                                        </div>
                                        <span>  </span>
                                        <span>{featured.date}</span>
                                        <span>  </span>
                                        <span>     {featured.readTime} de lecture</span>
                                    </div>
                                </div>
                                <div className="w-full lg:w-64 h-48 bg-gradient-to-br from-primary to-blue-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-white text-6xl notranslate">dashboard</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grid */}
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Articles r  cents</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rest.map((post, i) => (
                            <article key={i} className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
                                <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-slate-400 dark:text-slate-600 text-5xl notranslate">article</span>
                                </div>
                                <div className="p-6">
                                    <span className={`inline-block text-xs font-black px-2.5 py-0.5 rounded-full mb-3 ${post.categoryColor}`}>{post.category}</span>
                                    <h3 className="font-black text-slate-900 dark:text-white mb-3 leading-snug group-hover:text-primary transition-colors">{post.title}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>
                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                        <span>{post.author}</span>
                                        <span>     {post.readTime}</span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* Newsletter */}
                    <div className="mt-20 bg-gradient-to-br from-primary to-blue-700 rounded-3xl p-10 text-center text-white">
                        <h2 className="text-2xl font-black mb-3">Restez inform  </h2>
                        <p className="text-blue-100 mb-8">Recevez les meilleurs articles directs dans votre bo  te mail, une fois par semaine.</p>
                        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <input className="flex-1 h-12 rounded-xl px-4 text-slate-900 outline-none" placeholder="votre@email.fr" type="email" />
                            <button className="bg-white text-primary px-6 h-12 rounded-xl font-black hover:scale-105 transition-all flex-shrink-0">
                                S&apos;abonner
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-slate-100 dark:border-slate-800 py-8 text-center text-sm text-slate-400">
                <p>   {new Date().getFullYear()} Cloud Industrie     <Link href="/" className="hover:text-primary">Accueil</Link></p>
            </footer>
        </div>
    );
}
