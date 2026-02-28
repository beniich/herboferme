'use client';
/**
 * app/[locale]/(auth)/checkout/[plan]/page.tsx
 * Page de paiement Stripe — Formulaire détaillé + récap plan
 * Redirige vers /dashboard après paiement réussi
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { apiHelpers } from '@/lib/api';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const PLANS_INFO: Record<string, {
  name: string; price: number; interval: string;
  features: string[]; color: string; stripePriceId: string;
}> = {
  essai: {
    name: 'Essai', price: 0, interval: 'Gratuit 30 jours',
    stripePriceId: '',
    color: '#6b8f5e',
    features: ['1 ferme', '5 utilisateurs', 'Fleet & HR basique', '100 Mo stockage'],
  },
  essentiel: {
    name: 'Essentiel', price: 590, interval: '/mois',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ESSENTIEL || 'price_essentiel',
    color: '#c49a2e',
    features: ['1 ferme', '15 utilisateurs', 'Fleet + HR + Planning', 'Export PDF/Excel'],
  },
  professionnel: {
    name: 'Professionnel', price: 1290, interval: '/mois',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || 'price_professionnel',
    color: '#8b6920',
    features: ['3 fermes', '50 utilisateurs', 'GLPI 11 + Sheets illimité', 'API REST + Support 24h'],
  },
  entreprise: {
    name: 'Entreprise', price: 0, interval: 'Sur devis',
    stripePriceId: '',
    color: '#3d6b5e',
    features: ['Fermes illimitées', 'Infrastructure dédiée', 'SLA 99.9%', 'Account manager'],
  },
};

// ─────────────────────────────────────────────
// Page wrapper — charge Stripe Elements
// ─────────────────────────────────────────────
export default function CheckoutPage() {
  const params = useParams();
  const plan = String(params?.plan ?? 'essentiel');
  const planInfo = PLANS_INFO[plan] ?? PLANS_INFO.essentiel;

  // Plan entreprise → rediriger vers contact
  if (plan === 'entreprise') {
    return (
      <div style={{ minHeight: '100vh', background: '#070503', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px', padding: '48px 32px' }}>
          <div style={{ fontSize: '56px', marginBottom: '24px' }}>🤝</div>
          <h1 style={{ color: '#f5e6c8', fontSize: '28px', fontWeight: '800', marginBottom: '16px' }}>Plan Entreprise</h1>
          <p style={{ color: '#7a6545', lineHeight: '1.7', marginBottom: '32px' }}>
            Ce plan est personnalisé selon vos besoins spécifiques. Notre équipe commerciale vous contactera sous 24h.
          </p>
          <Link href="/contact?subject=entreprise" style={{ display: 'inline-block', padding: '14px 28px', background: 'linear-gradient(135deg,#3d6b5e,#5d9b8e)', color: '#fff', borderRadius: '12px', textDecoration: 'none', fontWeight: '700' }}>
            Contacter les ventes →
          </Link>
        </div>
      </div>
    );
  }

  // Plan essai → inscription sans paiement
  if (plan === 'essai') {
    return <FreeTrialForm />;
  }

  return (
    <Elements stripe={stripePromise} options={{ locale: 'fr' }}>
      <CheckoutForm plan={plan} planInfo={planInfo} />
    </Elements>
  );
}

// ─────────────────────────────────────────────
// Formulaire principal Stripe
// ─────────────────────────────────────────────
function CheckoutForm({ plan, planInfo }: { plan: string; planInfo: typeof PLANS_INFO[string] }) {
  const stripe   = useStripe();
  const elements = useElements();
  const router   = useRouter();

  const [step,    setStep]    = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  // Étape 1 : Infos compte
  const [form, setForm] = useState({
    prenom:       '',
    nom:          '',
    email:        '',
    telephone:    '',
    societe:      '',
    adresse:      '',
    ville:        '',
    codePostal:   '',
    pays:         'MA',
    motDePasse:   '',
    confirmMdp:   '',
    acceptCGU:    false,
    newsletter:   false,
  });

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm(p => ({ ...p, [k]: v }));

  const validateStep1 = () => {
    if (!form.prenom || !form.nom)         return 'Prénom et nom obligatoires.';
    if (!form.email.includes('@'))         return 'Email invalide.';
    if (!form.societe)                     return 'Nom de la ferme/société obligatoire.';
    if (form.motDePasse.length < 10)       return 'Mot de passe min. 10 caractères.';
    if (form.motDePasse !== form.confirmMdp) return 'Les mots de passe ne correspondent pas.';
    if (!form.acceptCGU)                   return 'Vous devez accepter les CGU.';
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError(null);
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    try {
      const cardNumber = elements.getElement(CardNumberElement);
      if (!cardNumber) throw new Error('Élément carte introuvable.');

      // 1. Créer le compte + session Stripe côté backend
      const { data } = await apiHelpers.billing.createSubscription({
        plan,
        email:       form.email,
        prenom:      form.prenom,
        nom:         form.nom,
        telephone:   form.telephone,
        societe:     form.societe,
        adresse:     form.adresse,
        ville:       form.ville,
        codePostal:  form.codePostal,
        pays:        form.pays,
        motDePasse:  form.motDePasse,
        newsletter:  form.newsletter,
      });

      // 2. Confirmer le paiement Stripe avec la carte
      const { error: stripeError } = await stripe.confirmCardPayment(
        data.clientSecret,
        { payment_method: { card: cardNumber, billing_details: { name: `${form.prenom} ${form.nom}`, email: form.email } } }
      );

      if (stripeError) throw new Error(stripeError.message);

      // 3. Redirection dashboard avec message de succès
      router.push('/dashboard?welcome=1&plan=' + plan);

    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erreur de paiement.');
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    style: {
      base: {
        fontSize: '14px',
        color: '#f5e6c8',
        fontFamily: 'system-ui, sans-serif',
        '::placeholder': { color: '#4a3d28' },
      },
      invalid: { color: '#e05c5c' },
    },
  };

  return (
    <div style={{ minHeight: '100vh', background: '#070503', fontFamily: 'system-ui, sans-serif', padding: '48px 24px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* En-tête */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
          <Link href="/" style={{ fontSize: '22px', fontWeight: '900', color: '#c49a2e', textDecoration: 'none', fontFamily: "'DM Serif Display', Georgia" }}>
            🌿 Herbute
          </Link>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {[1, 2].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: step >= s ? 'linear-gradient(135deg,#8b6920,#c49a2e)' : 'rgba(255,255,255,0.06)',
                  border: step >= s ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  color: step >= s ? '#050401' : '#6b5a3e', fontSize: '12px', fontWeight: '700',
                }}>
                  {step > s ? '✓' : s}
                </div>
                <span style={{ fontSize: '13px', color: step >= s ? '#d4c09a' : '#4a3d28' }}>
                  {s === 1 ? 'Votre compte' : 'Paiement'}
                </span>
                {s < 2 && <span style={{ color: '#3a2f1e', margin: '0 4px' }}>—</span>}
              </div>
            ))}
          </div>
          <div style={{ color: '#4a3d28', fontSize: '13px' }}>🔒 Paiement sécurisé</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>

          {/* ── Formulaire ──────────────────────── */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '40px' }}>

            {step === 1 ? (
              <>
                <h2 style={{ color: '#f5e6c8', fontSize: '22px', fontWeight: '700', marginBottom: '8px', fontFamily: "'DM Serif Display', Georgia" }}>
                  Créez votre compte
                </h2>
                <p style={{ color: '#6b5a3e', fontSize: '14px', marginBottom: '32px' }}>Ces informations servent à créer votre espace Herbute.</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <InputField label="Prénom *"      value={form.prenom}     onChange={v => set('prenom', v)}     placeholder="Ahmed" />
                  <InputField label="Nom *"         value={form.nom}        onChange={v => set('nom', v)}        placeholder="Benali" />
                  <InputField label="Email *"       value={form.email}      onChange={v => set('email', v)}      placeholder="ahmed@ferme.ma" type="email" span={2} />
                  <InputField label="Téléphone"     value={form.telephone}  onChange={v => set('telephone', v)}  placeholder="+212 6XX XXX XXX" type="tel" />
                  <InputField label="Ferme / Société *" value={form.societe} onChange={v => set('societe', v)}  placeholder="Ferme Al Baraka" />
                  <InputField label="Adresse"       value={form.adresse}    onChange={v => set('adresse', v)}    placeholder="Rue principale, N°12" span={2} />
                  <InputField label="Ville"         value={form.ville}      onChange={v => set('ville', v)}      placeholder="Meknès" />
                  <InputField label="Code postal"   value={form.codePostal} onChange={v => set('codePostal', v)} placeholder="50000" />
                  <InputField label="Mot de passe *"   value={form.motDePasse}  onChange={v => set('motDePasse', v)}  type="password" span={2} placeholder="Min. 10 caract. — maj, min, chiffre, spécial" />
                  <InputField label="Confirmer le mot de passe *" value={form.confirmMdp} onChange={v => set('confirmMdp', v)} type="password" span={2} placeholder="Répétez le mot de passe" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
                  <CheckboxField
                    checked={form.acceptCGU}
                    onChange={v => set('acceptCGU', v)}
                    label={<>J'accepte les <Link href="/legal/cgu" style={{ color: '#c49a2e' }} target="_blank">CGU</Link> et la <Link href="/legal/confidentialite" style={{ color: '#c49a2e' }} target="_blank">Politique de confidentialité</Link> *</>}
                  />
                  <CheckboxField
                    checked={form.newsletter}
                    onChange={v => set('newsletter', v)}
                    label="Recevoir les actualités Herbute et conseils agricoles (optionnel)"
                  />
                </div>
              </>
            ) : (
              <>
                <h2 style={{ color: '#f5e6c8', fontSize: '22px', fontWeight: '700', marginBottom: '8px', fontFamily: "'DM Serif Display', Georgia" }}>
                  Informations de paiement
                </h2>
                <p style={{ color: '#6b5a3e', fontSize: '14px', marginBottom: '32px' }}>Vos données bancaires sont chiffrées par Stripe et ne nous sont jamais transmises.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Numéro carte */}
                  <div>
                    <label style={{ display: 'block', color: '#9a8060', fontSize: '12px', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.5px' }}>NUMÉRO DE CARTE</label>
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px 16px' }}>
                      <CardNumberElement options={cardStyle} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', color: '#9a8060', fontSize: '12px', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.5px' }}>EXPIRATION</label>
                      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px 16px' }}>
                        <CardExpiryElement options={cardStyle} />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#9a8060', fontSize: '12px', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.5px' }}>CVC</label>
                      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px 16px' }}>
                        <CardCvcElement options={cardStyle} />
                      </div>
                    </div>
                  </div>

                  {/* Badges sécurité */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {['🔒 SSL TLS 1.3', '💳 Visa / Mastercard', '🛡️ PCI DSS Stripe'].map(b => (
                      <span key={b} style={{ fontSize: '11px', color: '#4a3d28', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '5px 10px', borderRadius: '6px' }}>{b}</span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Erreur */}
            {error && (
              <div style={{ marginTop: '20px', padding: '12px 16px', background: 'rgba(224,92,92,0.1)', border: '1px solid rgba(224,92,92,0.3)', borderRadius: '10px', color: '#e05c5c', fontSize: '13px' }}>
                ⚠️ {error}
              </div>
            )}

            {/* Boutons nav */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              {step === 2 && (
                <button onClick={() => setStep(1)} style={{ flex: '1', padding: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#9a8060', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                  ← Retour
                </button>
              )}
              <button
                onClick={step === 1 ? handleNext : handleSubmit}
                disabled={loading}
                style={{
                  flex: '2', padding: '14px',
                  background: loading ? 'rgba(139,105,32,0.5)' : 'linear-gradient(135deg,#8b6920,#c49a2e)',
                  color: '#050401', border: 'none', borderRadius: '12px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '15px', fontWeight: '800',
                }}
              >
                {loading ? '⏳ Traitement...' : step === 1 ? 'Continuer vers le paiement →' : `Payer ${planInfo.price} MAD/mois`}
              </button>
            </div>
          </div>

          {/* ── Récap plan ──────────────────────── */}
          <PlanSummary plan={plan} planInfo={planInfo} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Formulaire essai gratuit (sans Stripe)
// ─────────────────────────────────────────────
function FreeTrialForm() {
  const router  = useRouter();
  const [email, setEmail]   = useState('');
  const [nom,   setNom]     = useState('');
  const [done,  setDone]    = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !nom) return;
    setLoading(true);
    try {
      await apiHelpers.billing.startTrial({ email, nom });
      setDone(true);
      setTimeout(() => router.push('/dashboard?welcome=1&plan=essai'), 2500);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#070503', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '48px 24px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <Link href="/" style={{ display: 'block', textAlign: 'center', fontSize: '24px', fontWeight: '900', color: '#c49a2e', textDecoration: 'none', fontFamily: "'DM Serif Display', Georgia", marginBottom: '40px' }}>
          🌿 Herbute
        </Link>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '40px' }}>
          {done ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '52px', marginBottom: '16px' }}>🎉</div>
              <h2 style={{ color: '#f5e6c8', fontSize: '24px', fontWeight: '800', fontFamily: "'DM Serif Display', Georgia", marginBottom: '8px' }}>Bienvenue sur Herbute !</h2>
              <p style={{ color: '#7a6545', fontSize: '14px' }}>Redirection vers votre dashboard...</p>
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <span style={{ display: 'inline-block', padding: '6px 14px', background: 'rgba(107,143,94,0.15)', border: '1px solid rgba(107,143,94,0.3)', borderRadius: '100px', color: '#6b8f5e', fontSize: '12px', fontWeight: '700', marginBottom: '12px' }}>ESSAI GRATUIT 30 JOURS</span>
                <h2 style={{ color: '#f5e6c8', fontSize: '22px', fontWeight: '800', fontFamily: "'DM Serif Display', Georgia" }}>Démarrez sans engagement</h2>
                <p style={{ color: '#6b5a3e', fontSize: '13px', marginTop: '6px' }}>Aucune carte bancaire requise.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <InputField label="Votre nom complet *" value={nom} onChange={setNom} placeholder="Ahmed Benali" />
                <InputField label="Email professionnel *" value={email} onChange={setEmail} placeholder="ahmed@ferme.ma" type="email" />
                <button
                  onClick={handleSubmit}
                  disabled={loading || !email || !nom}
                  style={{ width: '100%', padding: '14px', background: loading ? 'rgba(107,143,94,0.4)' : 'linear-gradient(135deg,#4a7c3f,#6b8f5e)', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '800', marginTop: '8px' }}
                >
                  {loading ? '⏳...' : 'Commencer l\'essai gratuit →'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Récap plan (sidebar)
// ─────────────────────────────────────────────
function PlanSummary({ plan, planInfo }: { plan: string; planInfo: typeof PLANS_INFO[string] }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '32px', position: 'sticky', top: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: planInfo.color, display: 'inline-block' }}/>
        <h3 style={{ color: '#f5e6c8', fontSize: '18px', fontWeight: '700', margin: 0, fontFamily: "'DM Serif Display', Georgia" }}>
          Plan {planInfo.name}
        </h3>
      </div>

      <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ color: '#7a6545', fontSize: '14px' }}>Abonnement mensuel</span>
          <span style={{ color: '#f5e6c8', fontSize: '22px', fontWeight: '800', fontFamily: "'DM Serif Display', Georgia" }}>
            {planInfo.price > 0 ? `${planInfo.price} MAD` : planInfo.interval}
          </span>
        </div>
        {planInfo.price > 0 && (
          <div style={{ textAlign: 'right', marginTop: '4px' }}>
            <span style={{ color: '#4a3d28', fontSize: '12px' }}>TVA 20% : {Math.round(planInfo.price * 0.2)} MAD</span>
          </div>
        )}
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {planInfo.features.map(f => (
          <li key={f} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '13px', color: '#9a8060' }}>
            <span style={{ color: '#6b8f5e', flexShrink: 0 }}>✓</span>{f}
          </li>
        ))}
      </ul>

      {planInfo.price > 0 && (
        <div style={{ background: 'rgba(196,154,46,0.06)', border: '1px solid rgba(196,154,46,0.15)', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
          <p style={{ color: '#9a8060', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>
            💡 Passez à l'annuel et <strong style={{ color: '#c49a2e' }}>économisez 20%</strong> —{' '}
            <Link href="/pricing" style={{ color: '#c49a2e' }}>voir les tarifs</Link>
          </p>
        </div>
      )}

      <p style={{ color: '#4a3d28', fontSize: '11px', textAlign: 'center', lineHeight: 1.5 }}>
        Annulez à tout moment · Données sécurisées · Conformité RGPD
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Composants utilitaires formulaire
// ─────────────────────────────────────────────
function InputField({ label, value, onChange, placeholder, type = 'text', span }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; span?: number;
}) {
  return (
    <div style={{ gridColumn: span ? `span ${span}` : undefined }}>
      <label style={{ display: 'block', color: '#9a8060', fontSize: '11px', fontWeight: '600', marginBottom: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '11px 14px',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px', color: '#f5e6c8', fontSize: '14px',
          outline: 'none', boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif',
        }}
        onFocus={e => (e.currentTarget.style.borderColor = 'rgba(196,154,46,0.4)')}
        onBlur={e  => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
      />
    </div>
  );
}

function CheckboxField({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
      <input
        type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        style={{ marginTop: '2px', accentColor: '#c49a2e', width: '15px', height: '15px', flexShrink: 0 }}
      />
      <span style={{ color: '#6b5a3e', fontSize: '13px', lineHeight: '1.5' }}>{label}</span>
    </label>
  );
}
