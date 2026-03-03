'use client';

import Link from 'next/link';
import { Gavel, ListChecks, ShieldCheck, Map, CheckCircle } from 'lucide-react';

export default function TermsPage() {
    const sections = [
        { id: 'acceptation', title: '1. Acceptation du Protocole', content: `En accédant à AgroMaître et en utilisant notre infrastructure décentralisée, vous acceptez d'être lié par ces Conditions d'Utilisation critiques. Si vous n'acceptez pas ces paramètres, vous devez immédiatement cesser toute transmission. Ces conditions s'appliquent à toutes les entités vérifiées sur la plateforme.` },
        { id: 'architecture', title: '2. Architecture du Service', content: `AgroMaître fournit une plateforme SaaS d'élite pour la gestion agricole et l'intelligence rurale. Le service comprend : des tableaux de bord analytiques avancés, l'orchestration des tâches, des hubs de notification en temps réel, des API RESTful et des intégrations multi-plateformes.` },
        { id: 'responsabilite', title: '3. Responsabilité de l\'Identité', content: `Vous êtes seul responsable de la fortification de vos identifiants d'accès. Informez immédiatement la sécurité interne de toute violation non autorisée. AgroMaître n'est pas responsable des fuites de données résultant d'une gestion non sécurisée des identités côté client.` },
        { id: 'utilisation', title: '4. Paramètres Opérationnels', content: `Il est interdit aux utilisateurs de : (a) utiliser la plateforme pour des opérations non vérifiées ; (b) tenter une escalade de privilèges non autorisée ; (c) redistribuer le code propriétaire ; (d) injecter des charges malveillantes ; (e) extraire ou récolter des métadonnées d'autres organisations.` },
        { id: 'propriete', title: '5. Souveraineté de la Propriété Intellectuelle', content: `AgroMaître, son identité visuelle, son architecture et son code source sont la propriété exclusive d'AgroMaître Global, protégés par les traités internationaux sur la propriété intellectuelle. Aucune licence d'utilisation n'est accordée au-delà du niveau d'abonnement actif.` },
        { id: 'donnees', title: '6. Souveraineté des Données', content: `L'utilisation est régie par notre Protocole de Confidentialité. Vous maintenez une souveraineté absolue sur vos données brutes. Vous nous accordez une licence fonctionnelle limitée pour traiter les données exclusivement afin d'exécuter les services demandés.` },
        { id: 'disponibilite', title: '7. Engagement de Disponibilité', content: `Nous nous engageons à une disponibilité de 99,9% (hors fenêtres de maintenance planifiée). Les interruptions prolongées font l'objet de crédits de service selon votre SLA actif. L'état de santé en temps réel est diffusé via notre Nexus de Statut.` },
        { id: 'limitation', title: '8. Limites de Responsabilité', content: `Dans la mesure maximale permise par la loi, AgroMaître n'est pas responsable des échecs de mission indirects ou consécutifs. La responsabilité totale est plafonnée au montant payé pour le service au cours du cycle de 12 mois précédent.` },
        { id: 'resiliation', title: '9. Fin de Mission', content: `Les abonnements peuvent être résiliés via le Tableau de Bord de Mission. La résiliation prend effet à la fin du cycle de facturation en cours. Nous nous réservons le droit de suspendre l'accès en cas de violation critique de ces protocoles.` },
        { id: 'juridiction', title: '10. Juridiction Légale', content: `Ces protocoles sont régis par les lois de notre centre opérationnel principal. Les litiges seront réglés par arbitrage exécutoire dans la juridiction convenue.` },
    ];

    return (
        <div className="bg-[var(--bg)] text-[var(--text)] font-sans min-h-screen">
            <main>
                {/* Hero Section */}
                <section className="py-24 bg-[var(--sidebar-bg)] relative overflow-hidden">
                    <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(circle_at_0%_100%,var(--gold)_0%,transparent_40%)]"></div>
                    <div className="max-w-4xl mx-auto px-6 relative z-10">
                        <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-[var(--gold)] mb-6">
                            <Gavel className="w-4 h-4" />
                            Cadre Juridique
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 italic uppercase tracking-tighter">Conditions <br /><span className="text-[var(--gold)] not-italic">d'utilisation</span></h1>
                        <p className="text-white/70 font-normal text-lg max-w-2xl opacity-90">Les protocoles opérationnels régissant votre utilisation d'AgroMaître Pro.</p>
                    </div>
                </section>

                <section className="py-24">
                    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16">
                        {/* Interactive Sidebar */}
                        <aside className="lg:col-span-4 lg:sticky lg:top-32 h-fit space-y-8">
                            <div className="bg-[var(--sidebar-bg)] text-white rounded-[2rem] p-8 relative overflow-hidden group shadow-2xl">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--green)] opacity-10 blur-3xl transition-opacity"></div>
                                <h2 className="text-lg font-black mb-6 flex items-center gap-2 uppercase tracking-tight italic">
                                    <ListChecks className="w-5 h-5 text-[var(--gold)]" />
                                    Carte du Protocole
                                </h2>
                                <nav className="space-y-1">
                                    {sections.map((s, i) => (
                                        <a key={i} href={`#${s.id}`} className="flex items-center gap-3 p-3 rounded-xl text-xs font-bold text-white/50 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest">
                                            <span className="text-[var(--gold)]">0{i+1}</span>
                                            {s.title.split('. ')[1]}
                                        </a>
                                    ))}
                                </nav>
                            </div>

                            <div className="p-8 border border-[var(--border)] rounded-[2rem] bg-white shadow-xl shadow-black/[0.02]">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--green)] mb-6">Exigence</p>
                                <p className="text-sm text-[var(--text2)] font-medium leading-relaxed opacity-90">
                                    L'utilisation d'AgroMaître Pro implique une conformité totale avec ces termes. Les protocoles sont mis à jour trimestriellement.
                                </p>
                            </div>
                        </aside>

                        {/* Document Content */}
                        <div className="lg:col-span-8 space-y-24">
                            {sections.map((section, i) => (
                                <div key={i} id={section.id} className="scroll-mt-32">
                                    <h2 className="text-2xl font-black mb-8 text-[var(--text)] border-b border-[var(--border)] pb-4 uppercase tracking-tight italic flex items-center gap-4">
                                        <span className="text-[var(--green)] italic font-serif text-3xl">§</span>
                                        {section.title}
                                    </h2>
                                    <div className="text-[var(--text2)] leading-relaxed font-normal text-lg opacity-90">
                                        {section.content}
                                    </div>
                                </div>
                            ))}

                            <div className="mt-20 pt-12 border-t border-[var(--border)] text-center">
                                <p className="text-[var(--text3)] text-sm italic font-light">Dernière mise à jour : 1er Janvier 2026. Version 2.1.0-PRO.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
