/**
 * ═══════════════════════════════════════════════════════════════
 * routes/billing.routes.ts — Abonnements Stripe + Emails d'activation
 * ═══════════════════════════════════════════════════════════════
 *
 * Flux complet :
 *   1. POST /api/billing/subscribe     → Créer compte + PaymentIntent Stripe
 *   2. [Stripe confirme le paiement]
 *   3. POST /api/billing/webhook       → Stripe notifie l'activation
 *   4. Backend envoie l'email d'activation à l'abonné (lien → /dashboard)
 *   5. Admin reçoit une notification récapitulative
 */

import { Router, Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import bcrypt   from 'bcrypt';
import crypto   from 'crypto';
import express  from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize }    from '../middleware/authorize';
import { User }         from '../models/user.model';
import { Subscription } from '../models/subscription.model';
import { sendActivationEmail, sendAdminNotification } from '../services/email.service';
import { generateTokenPair } from '../utils/tokens';

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// Correspondance plan → Stripe Price ID
const PRICE_IDS: Record<string, string> = {
  essentiel:     process.env.STRIPE_PRICE_ESSENTIEL     || '',
  professionnel: process.env.STRIPE_PRICE_PROFESSIONNEL || '',
};

const PLAN_AMOUNTS: Record<string, number> = {
  essentiel:     590_00,   // en centimes MAD (590 MAD)
  professionnel: 1290_00,
};

// ═══════════════════════════════════════════════════════
// POST /api/billing/subscribe
// Crée le compte utilisateur + PaymentIntent Stripe
// ═══════════════════════════════════════════════════════
router.post('/subscribe', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { plan, email, prenom, nom, telephone, societe, adresse, ville, codePostal, pays, motDePasse, newsletter } = req.body;

    // Validation
    if (!plan || !email || !prenom || !nom || !motDePasse) {
      return res.status(400).json({ error: 'Champs obligatoires manquants.' });
    }

    if (!['essentiel', 'professionnel'].includes(plan)) {
      return res.status(400).json({ error: 'Plan invalide.' });
    }

    // Vérifier email unique
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'Un compte avec cet email existe déjà.' });
    }

    // Hash mot de passe
    const passwordHash = await bcrypt.hash(motDePasse, 12);

    // Créer ou récupérer un customer Stripe
    const customer = await stripe.customers.create({
      email,
      name:     `${prenom} ${nom}`,
      phone:    telephone,
      address:  {
        line1:       adresse,
        city:        ville,
        postal_code: codePostal,
        country:     pays || 'MA',
      },
      metadata: { plan, societe },
    });

    // Créer un PaymentIntent Stripe (sera confirmé côté client)
    const paymentIntent = await stripe.paymentIntents.create({
      amount:   PLAN_AMOUNTS[plan],
      currency: 'mad',
      customer: customer.id,
      setup_future_usage: 'off_session', // Sauvegarder pour les renouvellements
      metadata: {
        plan,
        email,
        nom:     `${prenom} ${nom}`,
        societe,
      },
    });

    // Créer l'utilisateur en DB avec statut 'pending' (en attente de paiement)
    const activationToken     = crypto.randomBytes(32).toString('hex');
    const activationTokenHash = crypto.createHash('sha256').update(activationToken).digest('hex');

    const user = await User.create({
      email:            email.toLowerCase(),
      passwordHash,
      nom,
      prenom,
      telephone,
      role:             'admin',     // Premier utilisateur = admin de sa ferme
      plan:             'essai',     // Sera mis à jour après paiement confirmé
      isActive:         false,       // Activé par le webhook Stripe
      emailVerified:    false,
      farmName:         societe,
      newsletter:       !!newsletter,
      stripeCustomerId: customer.id,
      activationToken:  activationTokenHash,
      activationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    });

    // Sauvegarder la souscription en attente
    await Subscription.create({
      userId:           user._id,
      plan,
      status:           'pending',
      stripeCustomerId: customer.id,
      stripePaymentIntentId: paymentIntent.id,
    });

    res.json({
      clientSecret:  paymentIntent.client_secret,
      customerId:    customer.id,
      userId:        user._id.toString(),
    });

  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════
// POST /api/billing/trial
// Inscription essai gratuit (sans Stripe)
// ═══════════════════════════════════════════════════════
router.post('/trial', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, nom } = req.body;

    if (!email || !nom) return res.status(400).json({ error: 'Email et nom requis.' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'Un compte avec cet email existe déjà.' });
    }

    // Mot de passe temporaire (sera changé par l'utilisateur)
    const tempPassword = crypto.randomBytes(12).toString('base64');
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const user = await User.create({
      email:         email.toLowerCase(),
      passwordHash,
      nom,
      prenom:        nom.split(' ')[0] || nom,
      role:          'admin',
      plan:          'essai',
      isActive:      true,
      emailVerified: true,
      trialEndsAt:   new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
    });

    // Email avec lien de connexion et mot de passe temp
    await sendActivationEmail({
      to:          email,
      prenom:      nom,
      plan:        'essai',
      loginUrl:    `${process.env.FRONTEND_URL}/login`,
      tempPassword,
      isTrial:     true,
    });

    // Générer les tokens pour redirection immédiate
    const { accessToken, refreshToken } = generateTokenPair({
      id: user._id.toString(), email: user.email,
      role: user.role, plan: user.plan,
    });

    res.cookie('access_token',  accessToken,  { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 15*60*1000 });
    res.cookie('refresh_token', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7*24*60*60*1000, path: '/api/auth/refresh' });

    res.json({ message: 'Essai démarré. Email de confirmation envoyé.', userId: user._id });

  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════
// POST /api/billing/webhook
// ⚠️  Utilise le body RAW (pas JSON parsé)
// Doit être monté AVANT express.json() dans server.ts
// ═══════════════════════════════════════════════════════
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    const sig     = req.headers['stripe-signature']!;
    const secret  = process.env.STRIPE_WEBHOOK_SECRET!;

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, secret);
    } catch (err: any) {
      console.error('[Stripe Webhook] Signature invalide:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        // ── Paiement réussi ────────────────────
        case 'payment_intent.succeeded': {
          const pi = event.data.object as Stripe.PaymentIntent;
          const { plan, email } = pi.metadata;

          if (!plan || !email) break;

          // Activer l'utilisateur + mettre à jour le plan
          const user = await User.findOneAndUpdate(
            { email: email.toLowerCase() },
            {
              plan:          plan,
              isActive:      true,
              emailVerified: true,
            },
            { new: true }
          );

          if (!user) { console.error('[Webhook] User not found for:', email); break; }

          // Mettre à jour la souscription
          await Subscription.findOneAndUpdate(
            { stripePaymentIntentId: pi.id },
            {
              status:         'active',
              activatedAt:    new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            }
          );

          // Générer un token d'accès direct (lien email → dashboard)
          const directToken     = crypto.randomBytes(32).toString('hex');
          const directTokenHash = crypto.createHash('sha256').update(directToken).digest('hex');

          await User.findByIdAndUpdate(user._id, {
            directLoginToken:   directTokenHash,
            directLoginExpires: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h
          });

          // URL directe vers le dashboard (incluse dans l'email)
          const dashboardUrl = `${process.env.FRONTEND_URL}/activate/${directToken}`;

          // Email à l'abonné
          await sendActivationEmail({
            to:          email,
            prenom:      user.prenom,
            plan,
            dashboardUrl,
            isTrial:     false,
          });

          // Notification admin
          await sendAdminNotification({
            type:   'new_subscriber',
            data: {
              nom:    `${user.prenom} ${user.nom}`,
              email,
              plan,
              societe: user.farmName ?? '—',
            },
          });

          console.log(`✅ [Billing] Abonnement activé: ${email} → Plan ${plan}`);
          break;
        }

        // ── Paiement échoué ─────────────────────
        case 'payment_intent.payment_failed': {
          const pi = event.data.object as Stripe.PaymentIntent;
          console.warn('[Billing] Paiement échoué:', pi.id, pi.last_payment_error?.message);
          break;
        }

        // ── Renouvellement réussi ───────────────
        case 'invoice.paid': {
          const invoice = event.data.object as Stripe.Invoice;
          if (invoice.customer && invoice.subscription) {
            await Subscription.findOneAndUpdate(
              { stripeCustomerId: invoice.customer },
              { currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
            );
          }
          break;
        }

        // ── Annulation ──────────────────────────
        case 'customer.subscription.deleted': {
          const sub = event.data.object as Stripe.Subscription;
          await Subscription.findOneAndUpdate(
            { stripeCustomerId: sub.customer },
            { status: 'cancelled', cancelledAt: new Date() }
          );
          await User.findOneAndUpdate(
            { stripeCustomerId: sub.customer },
            { plan: 'essai' }
          );
          break;
        }
      }
    } catch (err) {
      console.error('[Stripe Webhook] Erreur traitement:', err);
    }

    res.json({ received: true });
  }
);

// ═══════════════════════════════════════════════════════
// GET /api/billing/activate/:token
// Lien direct email → dashboard (48h)
// ═══════════════════════════════════════════════════════
router.get('/activate/:token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      directLoginToken:   tokenHash,
      directLoginExpires: { $gt: new Date() },
      isActive:           true,
    });

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=link_expired`);
    }

    // Invalider le token (usage unique)
    await User.findByIdAndUpdate(user._id, {
      directLoginToken:   undefined,
      directLoginExpires: undefined,
    });

    // Générer les cookies de session
    const { accessToken, refreshToken } = generateTokenPair({
      id:    user._id.toString(),
      email: user.email,
      role:  user.role,
      plan:  user.plan,
    });

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('access_token',  accessToken,  { httpOnly: true, secure: isProduction, sameSite: 'strict', maxAge: 15*60*1000 });
    res.cookie('refresh_token', refreshToken, { httpOnly: true, secure: isProduction, sameSite: 'strict', maxAge: 7*24*60*60*1000, path: '/api/auth/refresh' });

    // Rediriger vers le dashboard avec message de bienvenue
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?welcome=1&plan=${user.plan}`);

  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════
// GET /api/billing/subscription
// Infos de l'abonnement courant (protégé)
// ═══════════════════════════════════════════════════════
router.get('/subscription', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sub = await Subscription.findOne({
      userId: req.user!.sub,
      status: { $in: ['active', 'trial'] },
    }).lean();

    res.json({
      plan:            req.user!.plan,
      status:          sub?.status ?? 'trial',
      currentPeriodEnd:sub?.currentPeriodEnd,
      cancelledAt:     sub?.cancelledAt,
    });
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════
// POST /api/billing/cancel
// Annuler l'abonnement (à la fin de la période)
// ═══════════════════════════════════════════════════════
router.post('/cancel', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sub = await Subscription.findOne({ userId: req.user!.sub, status: 'active' });
    if (!sub?.stripeSubscriptionId) {
      return res.status(404).json({ error: 'Aucun abonnement actif trouvé.' });
    }

    // Annulation Stripe (à la fin de la période)
    await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    res.json({ message: 'Abonnement annulé à la fin de la période. Accès conservé jusqu\'au ' + sub.currentPeriodEnd?.toLocaleDateString('fr-FR') });
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════
// GET /api/billing/invoices — Historique de facturation (admin)
// ═══════════════════════════════════════════════════════
router.get('/invoices', authenticate, authorize('admin', 'super_admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user!.sub).select('stripeCustomerId');
    if (!user?.stripeCustomerId) return res.json({ data: [] });

    const invoices = await stripe.invoices.list({
      customer: user.stripeCustomerId,
      limit:    24,
    });

    res.json({
      data: invoices.data.map(inv => ({
        id:       inv.id,
        number:   inv.number,
        amount:   inv.amount_paid / 100,
        currency: inv.currency.toUpperCase(),
        status:   inv.status,
        date:     new Date(inv.created * 1000).toISOString(),
        pdf:      inv.invoice_pdf,
      })),
    });
  } catch (err) { next(err); }
});

export default router;
