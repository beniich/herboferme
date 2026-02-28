'use client';
/**
 * app/[locale]/pricing/page.tsx — Page Tarifs
 * 4 plans : Essai, Essentiel, Professionnel, Entreprise
 * Design : terreux / agricole, fond sombre, cartes en relief
 */

import Link from 'next/link';
import { useState } from 'react';

const PLANS = [
  {
    id:          'essai',
    name:        'Essai',
    tagline:     'Découvrez Herbute sans engagement',
    price:       { monthly: 0,    yearly: 0    },
    priceLabel:  'Gratuit',
    duration:    '30 jours',
    color:       '#6b8f5e',
    badge:       null,
    features: [
      '1 ferme, 5 utilisateurs',
      'Modules Fleet & HR (lecture)',
      'Dashboard de base',
      '100 Mo de stockage',
      'Support communauté',
    ],
    limits: [
      'Pas d\'export',
      'Pas d\'intégration GLPI',
      'Pas d\'API',
    ],
    cta: 'Démarrer gratuitement',
    href: '/checkout/essai',
  },
  {
    id:          'essentiel',
    name:        'Essentiel',
    tagline:     'Pour les petites exploitations',
    price:       { monthly: 590,  yearly: 499  },
    priceLabel:  null,
    duration:    '/mois',
    color:       '#c49a2e',
    badge:       null,
    features: [
      '1 ferme, 15 utilisateurs',
      'Fleet, HR, Planning complets',
      'Dashboard KPIs avancé',
      '5 Go de stockage',
      'Export PDF & Excel',
      'Support email 48h',
    ],
    limits: ['1 source Sheets', 'Pas d\'API REST'],
    cta: 'Choisir Essentiel',
    href: '/checkout/essentiel',
  },
  {
    id:          'professionnel',
    name:        'Professionnel',
    tagline:     'Pour les exploitations en croissance',
    price:       { monthly: 1290, yearly: 990  },
    priceLabel:  null,
    duration:    '/mois',
    color:       '#8b6920',
    badge:       'Le plus populaire',
    features: [
      '3 fermes, 50 utilisateurs',
      'Tous les modules actifs',
      'Intégration GLPI 11',
      'Google Sheets illimité',
      '20 Go de stockage',
      'API REST complète',
      'Support prioritaire 24h',
      'Rapports personnalisés',
    ],
    limits: [],
    cta: 'Choisir Pro',
    href: '/checkout/professionnel',
  },
  {
    id:          'entreprise',
    name:        'Entreprise',
    tagline:     'Pour les grands groupes agricoles',
    price:       { monthly: 0, yearly: 0 },
    priceLabel:  'Sur devis',
    duration:    '',
    color:       '#3d6b5e',
    badge:       null,
    features: [
      'Fermes & utilisateurs illimités',
      'Infrastructure dédiée',
      'SSO / Active Directory',
      'Intégrations sur mesure',
      'SLA 99.9% garanti',
      'Account manager dédié',
      'Formation & onboarding',
      'Support 7j/7 téléphone',
    ],
    limits: [],
    cta: 'Contacter les ventes',
    href: '/contact?subject=entreprise',
  },
];

const FAQ = [
  { q: 'Puis-je changer de plan à tout moment ?',          a: 'Oui. Vous pouvez upgrader ou downgrader à tout moment depuis votre dashboard. La facturation est ajustée au prorata.' },
  { q: 'Comment fonctionne la période d\'essai ?',         a: 'L\'essai de 30 jours est totalement gratuit, sans carte bancaire requise. À la fin, votre compte passe en lecture seule jusqu\'à la souscription d\'un plan payant.' },
  { q: 'Puis-je annuler à tout moment ?',                  a: 'Oui, sans frais ni pénalité. Vous conservez l\'accès jusqu\'à la fin de la période facturée.' },
  { q: 'Les données sont-elles sécurisées ?',              a: 'Toutes les données sont chiffrées (AES-256 au repos, TLS 1.3 en transit) et hébergées dans des datacenters certifiés ISO 27001.' },
  { q: 'Proposez-vous des remises pour les coopératives ?', a: 'Oui. Contactez notre équipe commerciale pour un tarif groupé adapté à votre coopérative ou groupement agricole.' },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div style={{ background: '#070503', minHeight: '100vh', fontFamily: "'DM Serif Display', Georgia, serif" }}>

      {/* ── Hero ───────────────────────────────────── */}
      <section style={{ textAlign: 'center', padding: '96px 32px 64px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 800px 400px at 50% 0%, rgba(196,154,46,0.06) 0%, transparent 70%)', pointerEvents: 'none' }}/>
        <p style={{ color: '#c49a2e', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px', fontFamily: 'system-ui, sans-serif' }}>
          TARIFICATION TRANSPARENTE
        </p>
        <h1 style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: '900', color: '#f5e6c8', margin: '0 0 16px', letterSpacing: '-2px', lineHeight: 1.1 }}>
          Choisissez votre plan
        </h1>
        <p style={{ color: '#7a6545', fontSize: '18px', maxWidth: '520px', margin: '0 auto 40px', fontFamily: 'system-ui, sans-serif', lineHeight: 1.6 }}>
          Du premier tracteur jusqu'au grand groupe agricole. Un tarif adapté à chaque étape de votre croissance.
        </p>

        {/* Toggle mensuel/annuel */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '100px', padding: '4px' }}>
          {(['monthly', 'yearly'] as const).map(b => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              style={{
                padding: '8px 20px',
                borderRadius: '100px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s',
                background: billing === b ? 'linear-gradient(135deg,#8b6920,#c49a2e)' : 'transparent',
                color: billing === b ? '#050401' : '#7a6545',
              }}
            >
              {b === 'monthly' ? 'Mensuel' : 'Annuel'}{b === 'yearly' && <span style={{ marginLeft: '6px', fontSize: '11px', color: billing === 'yearly' ? '#050401' : '#6b8f5e' }}>−20%</span>}
            </button>
          ))}
        </div>
      </section>

      {/* ── Grille des plans ───────────────────────── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', alignItems: 'start' }}>
          {PLANS.map(plan => {
            const isPro = plan.id === 'professionnel';
            return (
              <div
                key={plan.id}
                style={{
                  position: 'relative',
                  background: isPro
                    ? 'linear-gradient(145deg, #1a1005 0%, #201508 100%)'
                    : 'rgba(255,255,255,0.03)',
                  border: isPro
                    ? '1px solid rgba(196,154,46,0.5)'
                    : '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '20px',
                  padding: '32px 28px',
                  boxShadow: isPro ? '0 0 60px rgba(196,154,46,0.08)' : 'none',
                  transform: isPro ? 'translateY(-8px)' : 'none',
                }}
              >
                {/* Badge */}
                {plan.badge && (
                  <div style={{
                    position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg,#8b6920,#c49a2e)',
                    color: '#050401', fontSize: '11px', fontWeight: '800',
                    padding: '5px 14px', borderRadius: '100px',
                    letterSpacing: '0.5px', fontFamily: 'system-ui, sans-serif',
                    whiteSpace: 'nowrap',
                  }}>
                    {plan.badge}
                  </div>
                )}

                {/* En-tête plan */}
                <div style={{ marginBottom: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: plan.color, display: 'inline-block' }}/>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#f5e6c8', margin: 0 }}>{plan.name}</h2>
                  </div>
                  <p style={{ color: '#6b5a3e', fontSize: '13px', fontFamily: 'system-ui, sans-serif', margin: '0 0 20px' }}>{plan.tagline}</p>

                  {/* Prix */}
                  {plan.priceLabel ? (
                    <div style={{ fontSize: '32px', fontWeight: '900', color: '#f5e6c8' }}>{plan.priceLabel}</div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                      <span style={{ fontSize: '38px', fontWeight: '900', color: '#f5e6c8', letterSpacing: '-2px' }}>
                        {billing === 'yearly' ? plan.price.yearly : plan.price.monthly}
                      </span>
                      <span style={{ color: '#6b5a3e', fontSize: '14px', fontFamily: 'system-ui, sans-serif' }}>
                        MAD{plan.duration}
                      </span>
                    </div>
                  )}
                  {billing === 'yearly' && plan.price.yearly > 0 && (
                    <p style={{ color: '#6b8f5e', fontSize: '12px', fontFamily: 'system-ui, sans-serif', margin: '4px 0 0' }}>
                      Facturé {plan.price.yearly * 12} MAD/an
                    </p>
                  )}
                  {plan.id === 'essai' && (
                    <p style={{ color: '#9a8060', fontSize: '12px', fontFamily: 'system-ui, sans-serif', margin: '4px 0 0' }}>{plan.duration}</p>
                  )}
                </div>

                {/* CTA */}
                <Link
                  href={plan.href}
                  style={{
                    display: 'block', textAlign: 'center',
                    padding: '13px 20px',
                    background: isPro ? 'linear-gradient(135deg,#8b6920,#c49a2e)' : 'rgba(255,255,255,0.06)',
                    color: isPro ? '#050401' : '#c49a2e',
                    border: isPro ? 'none' : '1px solid rgba(196,154,46,0.2)',
                    borderRadius: '10px',
                    fontWeight: '700', fontSize: '14px',
                    textDecoration: 'none',
                    fontFamily: 'system-ui, sans-serif',
                    marginBottom: '28px',
                    letterSpacing: '0.2px',
                  }}
                >
                  {plan.cta}
                </Link>

                {/* Features */}
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: '#9a8060' }}>
                      <span style={{ color: '#6b8f5e', marginTop: '1px', flexShrink: 0 }}>✓</span>
                      {f}
                    </li>
                  ))}
                  {plan.limits.map(l => (
                    <li key={l} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontFamily: 'system-ui, sans-serif', fontSize: '12px', color: '#4a3d28' }}>
                      <span style={{ color: '#4a3d28', marginTop: '1px', flexShrink: 0 }}>✕</span>
                      {l}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────── */}
      <section style={{ maxWidth: '760px', margin: '0 auto', padding: '0 32px 96px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#f5e6c8', textAlign: 'center', marginBottom: '48px', letterSpacing: '-1px' }}>
          Questions fréquentes
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {FAQ.map(({ q, a }) => (
            <FaqItem key={q} question={q} answer={a} />
          ))}
        </div>
      </section>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid rgba(139,103,45,0.12)', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', textAlign: 'left', padding: '20px 0',
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px',
        }}
      >
        <span style={{ color: '#d4c09a', fontWeight: '600', fontSize: '15px', fontFamily: 'system-ui, sans-serif' }}>{question}</span>
        <span style={{ color: '#c49a2e', fontSize: '20px', transition: 'transform 0.2s', transform: open ? 'rotate(45deg)' : 'none', flexShrink: 0 }}>+</span>
      </button>
      {open && (
        <p style={{ color: '#7a6545', fontSize: '14px', lineHeight: '1.7', paddingBottom: '20px', margin: 0, fontFamily: 'system-ui, sans-serif' }}>
          {answer}
        </p>
      )}
    </div>
  );
}
