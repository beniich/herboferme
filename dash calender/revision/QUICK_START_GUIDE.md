# 🚀 Guide de Démarrage Rapide - FootballHub+

## 📋 Table des Matières
1. [Prérequis](#prérequis)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Lancement du Projet](#lancement-du-projet)
5. [Structure des Dossiers](#structure-des-dossiers)
6. [Commandes Essentielles](#commandes-essentielles)
7. [Tests](#tests)
8. [Déploiement](#déploiement)

---

## ✅ Prérequis

Avant de commencer, assurez-vous d'avoir installé :

```bash
# Node.js 20+
node --version  # v20.x.x

# npm ou yarn
npm --version   # 10.x.x

# Docker & Docker Compose
docker --version  # 24.x.x
docker-compose --version

# Git
git --version

# PostgreSQL CLI (optionnel)
psql --version

# Kubernetes kubectl (pour production)
kubectl version --client
```

---

## 📥 Installation

### 1. Cloner le Repository

```bash
# Créer le dossier du projet
mkdir footballhub-platform
cd footballhub-platform

# Initialiser Git
git init

# Créer la structure de base
mkdir -p {backend,frontend,mobile}
```

### 2. Backend Setup

```bash
cd backend

# Installer NestJS CLI
npm i -g @nestjs/cli

# Créer le projet NestJS
nest new . --package-manager npm

# Installer les dépendances essentielles
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install @nestjs/microservices @nestjs/websockets @nestjs/config
npm install @prisma/client prisma
npm install class-validator class-transformer
npm install stripe qrcode
npm install ioredis @nestjs/bull bull

# Dépendances de développement
npm install -D @types/bcrypt @types/passport-jwt
npm install -D @types/node typescript ts-node

# Initialiser Prisma
npx prisma init

# Créer la structure des microservices
nest generate app api-gateway
nest generate app auth-service
nest generate app ticket-service
nest generate app event-service
nest generate app shop-service
nest generate app payment-service

# Créer la librairie commune
nest generate library common
nest generate library database
```

### 3. Frontend Setup

```bash
cd ../frontend

# Créer l'application Next.js avec TypeScript
npx create-next-app@latest . --typescript --tailwind --app --src-dir

# Installer les dépendances
npm install zustand @tanstack/react-query axios
npm install lucide-react
npm install recharts
npm install react-hook-form zod @hookform/resolvers
npm install socket.io-client
npm install date-fns

# Installer shadcn/ui
npx shadcn-ui@latest init

# Ajouter des composants shadcn
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add table
npx shadcn-ui@latest add toast
```

### 4. Mobile Setup (React Native - optionnel)

```bash
cd ../mobile

# Initialiser React Native avec Expo
npx create-expo-app . --template

# Installer les dépendances
npm install @react-navigation/native @react-navigation/stack
npm install axios zustand
npm install react-native-qrcode-scanner
npm install react-native-svg
```

---

## ⚙️ Configuration

### 1. Variables d'Environnement Backend

```bash
cd backend

# Créer le fichier .env
cat > .env << EOF
# Database
DATABASE_URL="postgresql://footballhub:footballhub_secret@localhost:5432/footballhub"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRATION="15m"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_REFRESH_EXPIRATION="7d"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""

# RabbitMQ
RABBITMQ_HOST="localhost"
RABBITMQ_PORT=5672
RABBITMQ_USER="footballhub"
RABBITMQ_PASSWORD="footballhub_secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_your_test_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
STRIPE_PUBLIC_KEY="pk_test_your_public_key"

# AWS S3
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="footballhub-media"

# SendGrid
SENDGRID_API_KEY="SG.your_sendgrid_api_key"
SENDGRID_FROM_EMAIL="noreply@footballhub.com"

# Twilio
TWILIO_ACCOUNT_SID="AC_your_account_sid"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"

# Application
APP_URL="http://localhost:3000"
API_URL="http://localhost:4000"
PORT=4000
NODE_ENV="development"
EOF
```

### 2. Variables d'Environnement Frontend

```bash
cd ../frontend

# Créer le fichier .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_your_public_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
```

### 3. Configuration Prisma

```bash
cd backend

# Éditer prisma/schema.prisma
# (Copier le schéma depuis ARCHITECTURE_FOOTBALLHUB.md)

# Générer le client Prisma
npx prisma generate

# Créer la migration initiale
npx prisma migrate dev --name init

# Seed la base de données (optionnel)
npx prisma db seed
```

### 4. Docker Compose (Recommandé)

```bash
# Retour à la racine du projet
cd ..

# Créer docker-compose.yml
# (Copier le contenu depuis DOCKER_KUBERNETES_CONFIG.md)

# Démarrer les services
docker-compose up -d postgres redis rabbitmq

# Vérifier que les services sont up
docker-compose ps
```

---

## 🚀 Lancement du Projet

### Option 1 : Avec Docker Compose (Recommandé)

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Accéder aux services:
# - Frontend: http://localhost:3000
# - API Gateway: http://localhost:4000
# - Grafana: http://localhost:3001
# - RabbitMQ Management: http://localhost:15672
```

### Option 2 : Développement Local

#### Terminal 1 - Base de données

```bash
# Démarrer PostgreSQL et Redis avec Docker
docker-compose up -d postgres redis rabbitmq
```

#### Terminal 2 - Backend

```bash
cd backend

# Exécuter les migrations
npx prisma migrate dev

# Démarrer l'API Gateway
npm run start:dev api-gateway

# OU démarrer tous les services (dans des terminaux séparés)
npm run start:dev auth-service
npm run start:dev ticket-service
npm run start:dev event-service
# etc...
```

#### Terminal 3 - Frontend

```bash
cd frontend

# Démarrer le serveur de développement
npm run dev
```

### Vérification

```bash
# Tester l'API
curl http://localhost:4000/health

# Tester le frontend
open http://localhost:3000

# Vérifier les logs
docker-compose logs -f api-gateway
```

---

## 📁 Structure des Dossiers Finale

```
footballhub-platform/
├── backend/
│   ├── apps/
│   │   ├── api-gateway/
│   │   ├── auth-service/
│   │   ├── ticket-service/
│   │   ├── event-service/
│   │   ├── shop-service/
│   │   ├── payment-service/
│   │   ├── club-service/
│   │   ├── badge-service/
│   │   ├── analytics-service/
│   │   ├── notification-service/
│   │   └── ai-service/
│   ├── libs/
│   │   ├── common/
│   │   ├── database/
│   │   └── config/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── docker/
│   ├── k8s/
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── store/
│   │   └── types/
│   ├── public/
│   ├── .env.local
│   └── package.json
│
├── mobile/ (optionnel)
│   ├── src/
│   ├── app/
│   └── package.json
│
├── docs/
│   ├── ARCHITECTURE_FOOTBALLHUB.md
│   ├── IMPLEMENTATION_GUIDE.md
│   └── DOCKER_KUBERNETES_CONFIG.md
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 🔧 Commandes Essentielles

### Backend

```bash
# Développement
npm run start:dev <service-name>

# Production
npm run build
npm run start:prod

# Prisma
npx prisma studio                    # Interface graphique DB
npx prisma migrate dev               # Créer migration
npx prisma migrate deploy            # Appliquer migrations
npx prisma generate                  # Générer client
npx prisma db seed                   # Seed la DB

# Créer un nouveau service
nest generate app <service-name>

# Créer un controller
nest generate controller <name> --project=<service-name>

# Créer un service
nest generate service <name> --project=<service-name>
```

### Frontend

```bash
# Développement
npm run dev

# Build
npm run build

# Production
npm run start

# Lint
npm run lint

# Ajouter un composant shadcn
npx shadcn-ui@latest add <component-name>
```

### Docker

```bash
# Build et start
docker-compose up -d --build

# Arrêter
docker-compose down

# Logs
docker-compose logs -f <service-name>

# Exec dans un container
docker-compose exec <service-name> sh

# Rebuild un service
docker-compose up -d --build <service-name>
```

---

## 🧪 Tests

### Backend

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Frontend

```bash
# Tests unitaires
npm run test

# Tests e2e avec Playwright
npm run test:e2e
```

---

## 📊 Outils de Développement

### 1. Prisma Studio

```bash
cd backend
npx prisma studio
# Ouvre http://localhost:5555
```

### 2. API Documentation (Swagger)

```bash
# Ajouter Swagger au backend
npm install @nestjs/swagger

# Accéder à la documentation
# http://localhost:4000/api/docs
```

### 3. Database Management

```bash
# TablePlus, DBeaver, ou pgAdmin
# Connexion: postgresql://footballhub:footballhub_secret@localhost:5432/footballhub
```

---

## 🔒 Sécurité - Checklist

Avant de déployer en production :

- [ ] Changer tous les secrets dans `.env`
- [ ] Utiliser des secrets Kubernetes pour les variables sensibles
- [ ] Activer HTTPS/TLS
- [ ] Configurer CORS correctement
- [ ] Activer le rate limiting
- [ ] Configurer les firewall rules
- [ ] Mettre en place le monitoring
- [ ] Configurer les backups automatiques
- [ ] Tester la récupération après sinistre
- [ ] Auditer les dépendances (npm audit)

---

## 🚀 Déploiement

### Production Checklist

```bash
# 1. Build les images Docker
docker build -t footballhub/api-gateway:v1.0.0 .

# 2. Push vers le registry
docker push footballhub/api-gateway:v1.0.0

# 3. Appliquer les configurations Kubernetes
kubectl apply -f k8s/

# 4. Vérifier le déploiement
kubectl get pods -n footballhub
kubectl get services -n footballhub

# 5. Monitoring
kubectl logs -f deployment/api-gateway -n footballhub
```

### Rollback

```bash
# Rollback un deployment
kubectl rollout undo deployment/api-gateway -n footballhub

# Voir l'historique
kubectl rollout history deployment/api-gateway -n footballhub
```

---

## 📈 Monitoring & Debugging

### Logs

```bash
# Backend logs
docker-compose logs -f api-gateway

# Kubernetes logs
kubectl logs -f <pod-name> -n footballhub

# Suivre plusieurs pods
kubectl logs -f -l app=api-gateway -n footballhub
```

### Metrics

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)

### Debugging

```bash
# Exec dans un container
docker-compose exec api-gateway sh

# Port forward pour debugging
kubectl port-forward svc/api-gateway 4000:80 -n footballhub

# Vérifier la santé
curl http://localhost:4000/health
```

---

## 🆘 Problèmes Courants

### 1. Erreur de connexion à PostgreSQL

```bash
# Vérifier que PostgreSQL est démarré
docker-compose ps postgres

# Vérifier les logs
docker-compose logs postgres

# Redémarrer
docker-compose restart postgres
```

### 2. Erreur Prisma

```bash
# Régénérer le client
npx prisma generate

# Réinitialiser la DB (⚠️ supprime les données)
npx prisma migrate reset
```

### 3. Port déjà utilisé

```bash
# Trouver le process
lsof -i :4000

# Tuer le process
kill -9 <PID>
```

---

## 📚 Ressources

### Documentation

- [NestJS Docs](https://docs.nestjs.com)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Kubernetes Docs](https://kubernetes.io/docs)

### Tutoriels

- Backend Architecture: ARCHITECTURE_FOOTBALLHUB.md
- Implementation Guide: IMPLEMENTATION_GUIDE.md
- Docker & K8s: DOCKER_KUBERNETES_CONFIG.md

---

## 🎯 Prochaines Étapes

Maintenant que votre environnement est configuré :

1. ✅ **Phase 1** : Implémenter le service Auth
2. ✅ **Phase 2** : Implémenter le service Ticketing
3. ✅ **Phase 3** : Implémenter le service Events
4. ✅ **Phase 4** : Implémenter le service Shop
5. ✅ **Phase 5** : Implémenter le service Payments
6. ✅ **Phase 6** : Créer les composants Frontend
7. ✅ **Phase 7** : Tests et déploiement

---

## 💡 Tips

- Utilisez **Postman** ou **Insomnia** pour tester les APIs
- Commitez souvent avec des messages clairs
- Utilisez les **branches Git** pour chaque feature
- Documentez votre code
- Écrivez des tests dès le début
- Utilisez **ESLint** et **Prettier** pour la cohérence du code

---

## 🤝 Support

Pour toute question ou problème :

1. Consultez la documentation dans `/docs`
2. Vérifiez les logs avec `docker-compose logs`
3. Utilisez `kubectl describe` pour les problèmes K8s
4. Consultez les issues GitHub du projet

---

**Bon développement ! 🚀**
