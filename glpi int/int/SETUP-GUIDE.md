# ═══════════════════════════════════════════════════════════════
# .env — Nouvelles variables à ajouter
# ═══════════════════════════════════════════════════════════════

# ── Stripe ───────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_live_...              # Clé secrète Stripe (jamais exposée)
STRIPE_WEBHOOK_SECRET=whsec_...           # Secret du webhook (Stripe Dashboard > Webhooks)

# IDs des produits/prix dans Stripe Dashboard
STRIPE_PRICE_ESSENTIEL=price_xxxxxxxxxxxxx
STRIPE_PRICE_PROFESSIONNEL=price_yyyyyyyyy

# ── Frontend Stripe (NEXT_PUBLIC = exposée au browser) ───────
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_STRIPE_PRICE_ESSENTIEL=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_yyyyyyyyy

# ── Email (SMTP) ─────────────────────────────────────────────
SMTP_HOST=smtp.gmail.com                  # ou smtp.mailtrap.io en dev
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=mot-de-passe-application
EMAIL_FROM=noreply@herbute.ma
ADMIN_EMAIL=admin@herbute.ma             # Reçoit les notifs nouveaux abonnés

# ── GLPI 11 ──────────────────────────────────────────────────
GLPI_URL=http://votre-serveur/glpi/apirest.php
GLPI_APP_TOKEN=votre-app-token-glpi      # GLPI > Config > API > Jetons d'app
GLPI_USER_TOKEN=votre-user-token-glpi    # GLPI > Votre profil > Jeton API
NEXT_PUBLIC_GLPI_URL=http://votre-serveur/glpi  # URL publique GLPI (pour liens directs)

# ── Frontend ─────────────────────────────────────────────────
FRONTEND_URL=https://app.herbute.ma      # URL du frontend (pour les liens dans emails)


# ═══════════════════════════════════════════════════════════════
# server.ts — Lignes à ajouter
# ═══════════════════════════════════════════════════════════════

# 1. Le webhook Stripe doit recevoir le body RAW → monter AVANT express.json()
# Ajouter dans server.ts AVANT les middlewares :

app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));

# 2. Ajouter les routes :

import billingRoutes from './routes/billing.routes';
import glpiRoutes    from './routes/glpi.routes';

app.use('/api/billing', billingRoutes);
app.use('/api/glpi',    glpiRoutes);

# 3. Ajouter dans apiHelpers (lib/api.ts frontend) :

billing: {
  createSubscription: (data) => api.post('/api/billing/subscribe', data),
  startTrial:         (data) => api.post('/api/billing/trial',     data),
  getSubscription:    ()     => api.get('/api/billing/subscription'),
  getInvoices:        ()     => api.get('/api/billing/invoices'),
  cancel:             ()     => api.post('/api/billing/cancel'),
},

glpi: {
  getTickets:   (params) => api.get('/api/glpi/tickets', { params }),
  updateTicket: (id, data) => api.put(`/api/glpi/tickets/${id}`, data),
  sync:         ()       => api.post('/api/glpi/sync'),
  status:       ()       => api.get('/api/glpi/status'),
},


# ═══════════════════════════════════════════════════════════════
# Installation des nouvelles dépendances
# ═══════════════════════════════════════════════════════════════

# Backend
npm install stripe nodemailer @types/nodemailer

# Frontend
npm install @stripe/stripe-js @stripe/react-stripe-js


# ═══════════════════════════════════════════════════════════════
# Stripe — Configuration Webhook (pour la prod)
# ═══════════════════════════════════════════════════════════════

# 1. Aller sur https://dashboard.stripe.com/webhooks
# 2. Ajouter endpoint : https://api.herbute.ma/api/billing/webhook
# 3. Événements à écouter :
#      - payment_intent.succeeded
#      - payment_intent.payment_failed
#      - invoice.paid
#      - customer.subscription.deleted
# 4. Copier le "Signing secret" → STRIPE_WEBHOOK_SECRET dans .env

# En développement, utiliser Stripe CLI :
#   stripe listen --forward-to localhost:2065/api/billing/webhook


# ═══════════════════════════════════════════════════════════════
# GLPI 11 — Activer l'API REST
# ═══════════════════════════════════════════════════════════════

# 1. GLPI > Configuration > Générale > API
#    → Activer l'API REST : Oui
#    → URL d'accès : http://votre-serveur/glpi/apirest.php

# 2. Créer un jeton d'application :
#    GLPI > Configuration > Générale > API > Ajouter un client API
#    → Nom : Herbute Dashboard
#    → Adresse IPv4 : IP de votre backend (ou * en dev)
#    → Copier l'App Token → GLPI_APP_TOKEN dans .env

# 3. Créer un jeton utilisateur :
#    GLPI > Mon compte (en haut à droite) > Jeton API
#    → Régénérer → copier → GLPI_USER_TOKEN dans .env


# ═══════════════════════════════════════════════════════════════
# Flux Email → Dashboard (résumé)
# ═══════════════════════════════════════════════════════════════

# 1. Utilisateur paie sur /checkout/professionnel
# 2. Stripe confirme → webhook payment_intent.succeeded
# 3. Backend :
#    a. Active le compte (isActive = true, plan = 'professionnel')
#    b. Génère un directLoginToken (sha256, 48h)
#    c. Envoie email à l'abonné avec le lien :
#       https://app.herbute.ma/activate/TOKEN
# 4. L'abonné clique → GET /api/billing/activate/:token
# 5. Backend vérifie le token → génère cookies JWT → redirige :
#    https://app.herbute.ma/dashboard?welcome=1&plan=professionnel
# 6. Dashboard affiche un banner "Bienvenue ! Votre plan Pro est actif."
