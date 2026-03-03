'use client';

import Link from 'next/link';
import { Search, Rocket, CreditCard, ShieldCheck, Mail, MessageSquare, ChevronDown, PlayCircle, Globe, Terminal, Users } from 'lucide-react';

const faqs = [
    {
        category: 'Premiers Pas',
        icon: <Rocket className="w-6 h-6" />,
        items: [
            { q: 'Comment créer un compte exploitation ?', a: 'Cliquer sur le bouton "Démarrer" en haut de la page, remplissez les informations de votre domaine agricole et validez votre email. L\'installation est instantanée.' },
            { q: 'Y a-t-il une période d\'essai ?', a: 'Oui, nous proposons un essai gratuit de 14 jours incluant tous les outils d\'analyse de sol et le suivi satellite. Pas de carte bancaire requise.' },
            { q: 'Comment inviter mes employés ?', a: 'Accédez à Paramètres > Équipe. Vous pouvez inviter vos collaborateurs par email et définir leurs rôles (agronome, gestionnaire, chauffeur).' },
        ]
    },
    {
        category: 'Facturation & Plans',
        icon: <CreditCard className="w-6 h-6" />,
        items: [
            { q: 'Puis-je changer de plan à tout moment ?', a: 'Absolument. Les mises à niveau prennent effet immédiatement. Les passages à un plan inférieur s\'appliquent à la fin de la période de facturation en cours.' },
            { q: 'Quels sont les modes de paiement acceptés ?', a: 'Nous acceptons les cartes bancaires, les virements bancaires (pour les plans Pro et Entreprise) et les solutions de paiement mobile locales.' },
            { q: 'Offrez-vous des tarifs pour les coopératives ?', a: 'Oui, AgroMaître propose des tarifs dégressifs et des outils de gestion groupée pour les coopératives agricoles.' },
        ]
    },
    {
        category: 'Sécurité & Données',
        icon: <ShieldCheck className="w-6 h-6" />,
        items: [
            { q: 'Où sont stockées mes données d\'exploitation ?', a: 'Vos données sont sécurisées dans des centres de données certifiés Tier-4 avec un cryptage de bout en bout. Nous garantissons la souveraineté de vos données.' },
            { q: 'Puis-je exporter mes rapports de récolte ?', a: 'Oui, vous pouvez exporter toutes vos données en format Excel, PDF ou JSON à tout moment depuis votre tableau de bord.' },
            { q: 'Qui a accès à mes données satellite ?', a: 'Seulement vous et les membres de votre équipe autorisés. Nous ne partageons aucune donnée spécifique à votre parcelle avec des tiers.' },
        ]
    },
];

export default function HelpPage() {
    return (
        <div className="bg-[var(--bg)] text-[var(--text)] font-sans min-h-screen">
            <main>
                {/* Search Hero */}
                <section className="relative py-24 lg:py-32 bg-[var(--sidebar-bg)] overflow-hidden">
                    <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(circle_at_0%_100%,var(--gold)_0%,transparent_40%)]"></div>
                    <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                        <h1 className="text-4xl md:text-7xl font-black text-white mb-6 tracking-tight italic uppercase">Comment <br /> vous <span className="text-[var(--gold)] not-italic underline underline-offset-8">aider ?</span></h1>
                        <p className="text-white/70 text-lg mb-12 max-w-2xl mx-auto font-normal opacity-90">Consultez notre base de connaissances ou explorez les catégories pour trouver des réponses immédiates.</p>

                        <div className="relative max-w-2xl mx-auto group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--green)] to-[var(--gold)] rounded-2xl blur opacity-20 group-focus-within:opacity-50 transition-opacity"></div>
                            <div className="relative flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 pl-6 shadow-2xl">
                                <Search className="text-white/50 w-6 h-6" />
                                <input
                                    type="text"
                                    placeholder="Rechercher un guide, une fonctionnalité..."
                                    className="w-full bg-transparent border-none focus:ring-0 text-white py-4 px-4 font-medium placeholder:text-white/30"
                                />
                                <button className="bg-[var(--gold)] text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hidden sm:block shadow-lg hover:bg-[var(--gold2)] transition-all">Rechercher</button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Quick Shortcuts */}
                <section className="py-12 border-b border-[var(--border)] bg-white/50 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-6">
                        {[
                            { label: 'État du Cloud', icon: <Globe className="w-5 h-5" />, href: '/status' },
                            { label: 'Documentation API', icon: <Terminal className="w-5 h-5" />, href: '#' },
                            { label: 'Communauté', icon: <Users className="w-5 h-5" />, href: '#' },
                            { label: 'Guides Vidéo', icon: <PlayCircle className="w-5 h-5" />, href: '#' },
                        ].map((link, i) => (
                            <Link key={i} href={link.href} className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white border border-[var(--border)] hover:border-[var(--green)] transition-all group shadow-sm">
                                <div className="text-[var(--green)] group-hover:scale-125 transition-transform">{link.icon}</div>
                                <span className="text-sm font-bold text-[var(--text)]">{link.label}</span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Main Content (FAQs) */}
                <section className="py-24 px-6">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16">
                        {/* Sidebar */}
                        <aside className="lg:col-span-3 space-y-4">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text3)] mb-6">Base de Connaissances</h2>
                            {faqs.map((f, i) => (
                                <a key={i} href={`#${f.category.toLowerCase().replace(/\s+/g, '-')}`} className="flex items-center gap-3 p-4 rounded-xl font-bold text-sm bg-white border border-transparent hover:border-[var(--border)] hover:bg-[var(--bg)] transition-all group text-[var(--text)] shadow-sm">
                                    <div className="text-[var(--green)] opacity-70 group-hover:opacity-100">{f.icon}</div>
                                    {f.category}
                                </a>
                            ))}
                        </aside>

                        {/* FAQs */}
                        <div className="lg:col-span-9 space-y-20">
                            {faqs.map((section, si) => (
                                <div key={si} id={section.category.toLowerCase().replace(/\s+/g, '-')} className="scroll-mt-32">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 rounded-2xl bg-[var(--green3)] flex items-center justify-center text-[var(--green)] shadow-inner">
                                            {section.icon}
                                        </div>
                                        <h3 className="text-2xl font-black text-[var(--text)] uppercase tracking-tight">{section.category}</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {section.items.map((item, ii) => (
                                            <details key={ii} className="group bg-white border border-[var(--border)] rounded-[2rem] overflow-hidden hover:border-[var(--green)]/30 transition-all shadow-xl shadow-black/[0.01]">
                                                <summary className="flex items-center justify-between p-8 cursor-pointer font-bold text-lg group-open:text-[var(--green)] transition-colors list-none">
                                                    {item.q}
                                                    <div className="w-10 h-10 rounded-full bg-[var(--bg)] flex items-center justify-center group-open:rotate-180 transition-transform">
                                                        <ChevronDown className="w-5 h-5 text-[var(--green)]" />
                                                    </div>
                                                </summary>
                                                <div className="px-8 pb-8 text-[var(--text2)] leading-relaxed font-normal opacity-90">
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

                {/* Contact CTA */}
                <section className="py-24 bg-[var(--sidebar-bg)] text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,var(--green)_0%,transparent_70%)] opacity-10"></div>
                    <div className="max-w-3xl mx-auto px-6 relative z-10">
                        <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl backdrop-blur-md border border-white/20">
                            <MessageSquare className="w-10 h-10 text-[var(--gold)]" />
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black mb-6 italic uppercase tracking-tighter">Besoin d'un <span className="text-[var(--gold)] not-italic">Expert ?</span></h2>
                        <p className="text-white/70 text-lg mb-12 font-normal leading-relaxed">Nos ingénieurs agronomes sont à votre disposition 24/7 pour vous aider à surmonter tous vos défis agricoles.</p>
                        <div className="flex flex-wrap justify-center gap-6">
                            <Link href="/contact" className="bg-white text-[var(--sidebar-bg)] px-10 py-5 rounded-2xl font-black shadow-xl hover:scale-105 transition-all text-sm uppercase tracking-widest">Contacter le Support</Link>
                            <a href="mailto:support@agromaitre.ma" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-5 rounded-2xl font-black hover:bg-white/20 transition-all text-sm uppercase tracking-widest flex items-center gap-3">
                                <Mail className="w-4 h-4" />
                                Envoyer un Email
                            </a>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

