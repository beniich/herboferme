'use client';

import Link from 'next/link';
import { ShieldCheck, Lock, FileText, Mail, Calendar, History, CheckCircle } from 'lucide-react';

export default function PrivacyPage() {
    const sections = [
        {
            id: 'collecte-donnees',
            title: '1. Collecte des Données',
            content: `Nous collectons les informations suivantes pour le bon fonctionnement de l'exploitation :
• Identification : Nom complet, email professionnel, vérification du numéro de téléphone.
• Métriques de Connexion : Adresse IP, empreinte du navigateur, horodatage de session.
• Intelligence d'Exploitation : Fonctionnalités accédées, parcelles gérées, et modèles d'interaction avec la plateforme.
• Données Financières : Jetons de paiement (traités via des partenaires certifiés PCI-DSS).`
        },
        {
            id: 'utilisation-strategique',
            title: '2. Utilisation Stratégique',
            content: `Vos données alimentent les opérations suivantes :
• Fonctionnement et optimisation de notre infrastructure agricole.
• Alertes de mission en temps réel et notifications critiques de compte.
• Détection avancée des anomalies et sécurité architecturale.
• Conformité réglementaire et respect des lois en vigueur.
• Génération de rapports anonymisés pour l'analyse sectorielle.`
        },
        {
            id: 'securite-hebergement',
            title: '3. Hébergement & Sécurité',
            content: `Les données sont hébergées dans des centres de données sécurisés au Maroc et en Europe, certifiés ISO 27001. Nous utilisons TLS 1.3 pour tous les transits et un cryptage AES-256 au repos pour les identités sensibles. L'accès à la production est restreint à des canaux audités et sécurisés.`
        },
        {
            id: 'partage-donnees',
            title: '4. Politique de Non-Vente',
            content: `AgroMaître ne vend JAMAIS vos données. Nous ne les partageons qu'avec :
• Les sous-traitants techniques essentiels (hébergement, stockage crypté).
• Les autorités judiciaires lorsque la loi l'exige.
• Les membres autorisés de votre organisation vérifiée.`
        },
        {
            id: 'droits-numeriques',
            title: '5. Vos Droits Numériques',
            content: `Vous possédez une souveraineté numérique totale :
• Droit d'accès absolu à votre empreinte de données.
• Rectification de précision de toute anomalie de données.
• Effacement permanent ("Droit à l'oubli").
• Portabilité fluide des données vers d'autres plateformes.
• Droit de suspendre le traitement stratégique.
• Droit de déposer une plainte formelle auprès de la CNDP.

Pour exercer votre souveraineté, contactez : dpo@agromaitre.ma`
        },
        {
            id: 'conservation',
            title: '6. Conservation Stratégique',
            content: `Les données actives sont conservées pendant la durée de votre abonnement plus 3 ans (exigence légale). Les métriques anonymisées peuvent être archivées indéfiniment pour l'évolution statistique.`
        },
    ];

    return (
        <div className="bg-[var(--bg)] text-[var(--text)] font-sans min-h-screen">
            <main>
                {/* Hero */}
                <section className="py-24 bg-[var(--sidebar-bg)] relative overflow-hidden">
                    <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(circle_at_0%_100%,var(--gold)_0%,transparent_40%)]"></div>
                    <div className="max-w-4xl mx-auto px-6 relative z-10">
                        <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-[var(--gold)] mb-6">
                            <ShieldCheck className="w-4 h-4" />
                            Intelligence Légale
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 italic uppercase tracking-tighter">Protocole de <br /><span className="text-[var(--gold)] not-italic">Confidentialité</span></h1>
                        <div className="flex flex-wrap gap-8 text-sm font-bold text-white/50 uppercase tracking-widest">
                            <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-[var(--gold)]" />
                                Effectif : 01 Jan 2026
                            </span>
                            <span className="flex items-center gap-2">
                                <History className="w-4 h-4 text-[var(--gold)]" />
                                Version 4.0 (AgroMaître Pro)
                            </span>
                        </div>
                    </div>
                </section>

                <section className="py-24">
                    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16">
                        {/* Sidebar Summary */}
                        <aside className="lg:col-span-4 lg:sticky lg:top-32 h-fit space-y-8">
                            <div className="bg-white border border-[var(--border)] rounded-3xl p-8 shadow-xl shadow-black/[0.02]">
                                <h2 className="text-lg font-black mb-4 flex items-center gap-2 text-[var(--text)] uppercase tracking-tight">
                                    <FileText className="w-5 h-5 text-[var(--green)]" />
                                    Résumé de Mission
                                </h2>
                                <p className="text-sm text-[var(--text2)] leading-relaxed font-normal opacity-90">
                                    Nous collectons des données uniquement pour alimenter votre exploitation agricole. Nous ne vendons rien, ne compromettons rien. Vos données sont fortifiées et la souveraineté vous appartient à tout moment.
                                </p>
                            </div>

                            <nav className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text3)] mb-6 px-4">Sections du Protocole</p>
                                {sections.map((s, i) => (
                                    <a key={i} href={`#${s.id}`} className="flex items-center gap-3 p-4 rounded-xl text-sm font-bold text-[var(--text3)] hover:bg-[var(--green)]/5 hover:text-[var(--green)] transition-all group border border-transparent hover:border-[var(--green)]/10">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--border)] group-hover:bg-[var(--green)]"></div>
                                        {s.title}
                                    </a>
                                ))}
                            </nav>
                        </aside>

                        {/* Content */}
                        <div className="lg:col-span-8 space-y-24">
                            {sections.map((section, i) => (
                                <div key={i} id={section.id} className="scroll-mt-32">
                                    <h2 className="text-2xl font-black mb-8 text-[var(--text)] border-b border-[var(--border)] pb-4 uppercase tracking-tight italic">{section.title}</h2>
                                    <div className="text-[var(--text2)] leading-relaxed whitespace-pre-line font-normal text-lg opacity-90">
                                        {section.content}
                                    </div>
                                </div>
                            ))}

                            <div className="mt-20 p-10 bg-[var(--sidebar-bg)] text-white rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--green)] opacity-20 blur-[80px] rounded-full"></div>
                                <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter italic">Officier de Protection des Données</h3>
                                <p className="text-white/60 mb-10 font-normal text-lg">Ligne directe pour toutes les demandes relatives à la souveraineté des données :</p>
                                <a href="mailto:dpo@agromaitre.ma" className="inline-flex items-center gap-3 bg-[var(--gold)] text-white px-8 py-5 rounded-2xl font-black text-xs tracking-[0.2em] hover:scale-105 transition-all shadow-xl uppercase">
                                    <CheckCircle className="w-4 h-4" />
                                    DPO@AGROMAITRE.MA
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

