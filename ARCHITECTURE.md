# Architecture — Herbute (Backend Unique)

> Dernière mise à jour : Février 2026
> Statut : Architecture active et stable

---

## Vue d'Ensemble Post-Migration

Suite à la suppression du backend ReclamTrack, l'architecture est maintenant :

```text
┌─────────────────────────────────────────────┐
│          Frontend Next.js (:3000)           │
│  - 1 seul client Axios (cookies HttpOnly)   │
│  - AuthProvider + AuthEventBus              │
│  - Routes via @reclamtrack/shared           │
└────────────────────┬────────────────────────┘
                     │ HTTP + Cookies HttpOnly
                     │ (plus de localStorage)
                     │
┌────────────────────▼────────────────────────┐
│       Herbute Backend (:2065)               │
│  ┌─────────┐ ┌──────┐ ┌──────┐ ┌────────┐  │
│  │   IAM   │ │Fleet │ │  HR  │ │Planning│  │
│  │  /auth  │ │/fleet│ │ /hr  │ │/planning│  │
│  └─────────┘ └──────┘ └──────┘ └────────┘  │
│              JWT RS256                      │
│              MongoDB + TTL indexes          │
└─────────────────────────────────────────────┘
```

---

## Décisions Architecturales (ADR)

### ADR-001 : Suppression du backend ReclamTrack
**Décision :** Tous les modules IAM (auth, users) migrent dans Herbute.
**Raison :** Simplification — un seul backend, une seule base MongoDB, une seule config JWT.
**Conséquence :** Les modules tickets IT et réclamations sont abandonnés.

### ADR-002 : JWT RS256 au lieu de HS256
**Décision :** Le backend signe avec une clé privée RSA 4096 bits.
**Raison :** Si un service tiers doit vérifier les tokens, il reçoit uniquement la clé publique
             et ne peut pas émettre de tokens — blast radius limité en cas de compromission.
**Commande :** `cd herbute-backend && bash generate-keys.sh`

### ADR-003 : Cookies HttpOnly au lieu de localStorage
**Décision :** Les tokens JWT sont stockés dans des cookies HttpOnly/Secure/SameSite=Strict.
**Raison :** Le localStorage est accessible en JavaScript → vulnérable XSS.
             Les cookies HttpOnly sont invisibles au JS de la page.
**Impact frontend :** axios `withCredentials: true` requis. Plus d'injection manuelle du header.

### ADR-004 : Refresh token opaque (pas un JWT)
**Décision :** Le refresh token est un UUID aléatoire hashé SHA-256, stocké en MongoDB.
**Raison :** Révocable individuellement sans blacklist Redis.
             MongoDB TTL index nettoie automatiquement les tokens expirés.

### ADR-005 : Suppression du dossier microservices/
**Décision :** Le dossier microservices/ est archivé dans la branche `archive/microservices-experiment`.
**Raison :** Conflit conceptuel avec l'architecture monolithe modulaire actuelle.
             Source de confusion pour les nouveaux développeurs.

### ADR-006 : AuthEventBus pour la déconnexion synchronisée
**Décision :** Un EventTarget singleton gère la propagation des événements 401.
**Raison :** Avec un seul client Axios, un 401 doit toujours aboutir à un logout propre
             et une redirection vers /login, quelle que soit la source de l'erreur.

### ADR-007 : Routes centralisées dans @reclamtrack/shared
**Décision :** Toutes les URIs sont définies dans `HERBUTE_ROUTES` dans le package partagé.
**Raison :** Une modification d'URL backend est détectée immédiatement par TypeScript
             dans le frontend (plus de strings bruts silencieusement cassés).

---

## Structure des Fichiers Générés

```text
herbute-backend/
├── generate-keys.sh              # Génère la paire RSA 4096 bits
├── .env.example                  # Template des variables d'env
├── src/
│   ├── server.ts                 # Point d'entrée Express
│   ├── config/
│   │   └── jwt.ts                # Chargement clés RS256
│   ├── middleware/
│   │   ├── authenticate.ts       # Vérifie le JWT (clé publique uniquement)
│   │   └── authorize.ts          # RBAC (rôles) + Plans
│   ├── models/
│   │   ├── user.model.ts         # Schéma Mongoose User
│   │   └── refresh-token.model.ts# Refresh tokens avec TTL
│   ├── routes/
│   │   ├── auth.routes.ts        # IAM complet (migré ReclamTrack)
│   │   ├── fleet.routes.ts       # Flotte & maintenance
│   │   ├── hr.routes.ts          # Staff, roster, congés
│   │   └── planning.routes.ts    # Planning & interventions
│   └── utils/
│       └── tokens.ts             # generateTokenPair, verifyAccessToken

shared/
└── src/
    └── index.ts                  # HERBUTE_ROUTES + tous les types TypeScript

frontend/src/lib/
├── api.ts                        # Client Axios unique (cookies HttpOnly)
├── auth-event-bus.ts             # EventTarget pour déconnexion synchronisée
└── auth-provider.tsx             # React context + useAuth() hook
```

---

## Checklist de Démarrage

```bash
# 1. Générer les clés RSA
cd herbute-backend && bash generate-keys.sh

# 2. Copier et remplir le .env
cp .env.example .env
# → Coller JWT_PRIVATE_KEY et JWT_PUBLIC_KEY depuis les fichiers générés
# → Renseigner MONGODB_URI et ALLOWED_ORIGINS

# 3. Builder le package partagé en premier
npm run build -w shared

# 4. Démarrer
npm run dev
```

---

## Tests de Validation

```bash
# Type-check complet (les 3 packages)
npm run type-check

# Test manuel : vérifier que l'auth fonctionne
curl -X POST http://localhost:2065/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@farm.ma","password":"Test@1234!"}' \
  -c cookies.txt   # ← sauvegarde les cookies HttpOnly

# Vérifier /me avec le cookie
curl http://localhost:2065/api/auth/me \
  -b cookies.txt   # ← envoie les cookies

# Health check
curl http://localhost:2065/health
```
