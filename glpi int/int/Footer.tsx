'use client';

/**
 * components/layout/Footer.tsx — Pied de page complet Herbute
 * Tous les liens pointent vers de vraies pages configurées.
 * Design : terreux / agricole moderne, sombre, typographie forte.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const FOOTER_LINKS = {
  produit: {
    label: 'Produit',
    links: [
      { label: 'Fonctionnalités',    href: '/features'           },
      { label: 'Tarifs',             href: '/pricing'            },
      { label: 'Feuille de route',   href: '/features#roadmap'   },
      { label: 'Mises à jour',       href: '/features#changelog' },
      { label: 'Intégration GLPI',   href: '/features#glpi'      },
    ],
  },
  solutions: {
    label: 'Solutions',
    links: [
      { label: 'Gestion de flotte',   href: '/features#fleet'    },
      { label: 'Ressources humaines', href: '/features#hr'        },
      { label: 'Planning agricole',   href: '/features#planning'  },
      { label: 'Comptabilité',        href: '/features#finance'   },
      { label: 'Dashboard & KPIs',    href: '/features#dashboard' },
    ],
  },
  entreprise: {
    label: 'Entreprise',
    links: [
      { label: 'À propos',           href: '/about'              },
      { label: 'Contact',            href: '/contact'            },
      { label: 'Partenaires',        href: '/about#partners'     },
      { label: 'Carrières',          href: '/about#careers'      },
      { label: 'Blog',               href: '/about#blog'         },
    ],
  },
  legal: {
    label: 'Légal',
    links: [
      { label: 'CGU',                          href: '/legal/cgu'              },
      { label: 'Politique de confidentialité', href: '/legal/confidentialite'  },
      { label: 'Politique de cookies',         href: '/legal/cookies'          },
      { label: 'Mentions légales',             href: '/legal/mentions'         },
      { label: 'Conformité RGPD',              href: '/legal/rgpd'             },
    ],
  },
};

const SOCIAL_LINKS = [
  { label: 'LinkedIn',  href: 'https://linkedin.com/company/herbute', icon: LinkedInIcon  },
  { label: 'Twitter/X', href: 'https://twitter.com/herbute',          icon: XIcon         },
  { label: 'GitHub',    href: 'https://github.com/herbute',           icon: GitHubIcon    },
  { label: 'YouTube',   href: 'https://youtube.com/@herbute',         icon: YouTubeIcon   },
];

export default function Footer() {
  const pathname = usePathname();
  // Masquer le footer sur le dashboard
  if (pathname?.includes('/dashboard') || pathname?.includes('/(app)')) return null;

  return (
    <footer
      style={{
        background: 'linear-gradient(180deg, #0a0702 0%, #050401 100%)',
        borderTop: '1px solid rgba(139,103,45,0.2)',
        fontFamily: "'DM Serif Display', Georgia, serif",
      }}
    >
      {/* ── Bande supérieure CTA ─────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1005 0%, #2d1f08 50%, #1a1005 100%)',
          borderBottom: '1px solid rgba(139,103,45,0.15)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#f5e6c8', margin: 0, letterSpacing: '-0.3px' }}>
              Prêt à moderniser votre ferme ?
            </h3>
            <p style={{ color: '#9a8060', marginTop: '6px', fontSize: '15px', margin: '6px 0 0' }}>
              Rejoignez plus de 500 exploitations agricoles marocaines.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              href="/pricing"
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #8b6920, #c49a2e)',
                color: '#050401',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '14px',
                textDecoration: 'none',
                letterSpacing: '0.3px',
              }}
            >
              Voir les tarifs
            </Link>
            <Link
              href="/contact"
              style={{
                padding: '12px 24px',
                background: 'transparent',
                color: '#c49a2e',
                border: '1px solid rgba(196,154,46,0.4)',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '14px',
                textDecoration: 'none',
              }}
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </div>

      {/* ── Corps du footer ───────────────────────── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 32px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '48px', alignItems: 'start' }}>

          {/* ── Colonne marque ────────────────────── */}
          <div>
            <Link href="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>
              <span style={{ fontSize: '28px', fontWeight: '900', color: '#c49a2e', letterSpacing: '-1px', fontFamily: "'DM Serif Display', Georgia, serif" }}>
                🌿 Herbute
              </span>
            </Link>
            <p style={{ color: '#6b5a3e', fontSize: '14px', lineHeight: '1.7', marginBottom: '24px', maxWidth: '260px' }}>
              La plateforme de gestion agricole intelligente pour les exploitations marocaines modernes.
            </p>

            {/* Réseaux sociaux */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={{
                    width: '36px', height: '36px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(196,154,46,0.08)',
                    border: '1px solid rgba(196,154,46,0.15)',
                    borderRadius: '8px',
                    color: '#9a8060',
                    transition: 'all 0.2s',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(196,154,46,0.18)';
                    (e.currentTarget as HTMLElement).style.color = '#c49a2e';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,154,46,0.4)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(196,154,46,0.08)';
                    (e.currentTarget as HTMLElement).style.color = '#9a8060';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,154,46,0.15)';
                  }}
                >
                  <Icon />
                </a>
              ))}
            </div>

            {/* Badge certif */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '8px 12px',
              background: 'rgba(139,103,45,0.08)',
              border: '1px solid rgba(139,103,45,0.15)',
              borderRadius: '8px',
            }}>
              <span style={{ fontSize: '16px' }}>🇲🇦</span>
              <span style={{ color: '#7a6545', fontSize: '12px', fontFamily: 'system-ui, sans-serif' }}>
                Made in Morocco
              </span>
            </div>
          </div>

          {/* ── Colonnes de liens ─────────────────── */}
          {Object.entries(FOOTER_LINKS).map(([key, section]) => (
            <div key={key}>
              <h4 style={{
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color: '#c49a2e',
                marginBottom: '20px',
                fontFamily: 'system-ui, sans-serif',
              }}>
                {section.label}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {section.links.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      style={{
                        color: '#6b5a3e',
                        fontSize: '14px',
                        textDecoration: 'none',
                        fontFamily: 'system-ui, sans-serif',
                        transition: 'color 0.15s',
                        display: 'inline-block',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#c49a2e')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#6b5a3e')}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bas du footer ─────────────────────── */}
        <div style={{
          marginTop: '48px',
          paddingTop: '24px',
          borderTop: '1px solid rgba(139,103,45,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <p style={{ color: '#4a3d28', fontSize: '13px', fontFamily: 'system-ui, sans-serif', margin: 0 }}>
            © {new Date().getFullYear()} Herbute SARL — Tous droits réservés.
          </p>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {[
              { label: 'CGU',             href: '/legal/cgu'             },
              { label: 'Confidentialité', href: '/legal/confidentialite' },
              { label: 'Cookies',         href: '/legal/cookies'         },
            ].map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                style={{ color: '#4a3d28', fontSize: '12px', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#9a8060')}
                onMouseLeave={e => (e.currentTarget.style.color = '#4a3d28')}
              >
                {label}
              </Link>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3d9970', display: 'inline-block' }}/>
            <span style={{ color: '#4a3d28', fontSize: '12px', fontFamily: 'system-ui, sans-serif' }}>
              Tous systèmes opérationnels
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────
// Icônes SVG inline (pas de dépendance externe)
// ─────────────────────────────────────────────
function LinkedInIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>;
}
function XIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
}
function GitHubIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>;
}
function YouTubeIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.54C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#050401"/></svg>;
}
