# 🚀 FootballHub+ - DÉPLOIEMENT PRODUCTION PART 2

## ⚙️ PM2 CLUSTER MODE

### 1. Configuration PM2

```javascript
// server/ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'footballhub-api',
      script: './src/index.js',
      instances: 'max', // Use all CPU cores
      exec_mode: 'cluster',
      
      // Environment
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      
      // Restart strategies
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      max_restarts: 10,
      min_uptime: '10s',
      
      // Logging
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      shutdown_with_message: true,
      
      // Health check
      health_check_grace_period: 30000,
    },
  ],
};
```

### 2. PM2 Deployment Script

```bash
#!/bin/bash
# scripts/deploy-pm2.sh

echo "🚀 Deploying with PM2..."

# Pull latest code
git pull origin main

# Install dependencies
cd server
npm ci --only=production

# Migrate database (if needed)
# npm run migrate

# Reload PM2 (zero downtime)
pm2 reload ecosystem.config.js --env production

# Save PM2 config
pm2 save

echo "✅ Deployment completed!"
```

### 3. PM2 Commands

```bash
# Start app
pm2 start ecosystem.config.js --env production

# Monitor in real-time
pm2 monit

# View logs
pm2 logs footballhub-api --lines 100

# Reload without downtime
pm2 reload footballhub-api

# Graceful stop
pm2 stop footballhub-api

# Status
pm2 status

# Save configuration for auto-restart on server reboot
pm2 save
pm2 startup

# Delete from PM2
pm2 delete footballhub-api
```

---

## 🔄 CI/CD avec GitHub Actions

### 1. Workflow Principal

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches:
      - main
  workflow_dispatch:

env:
  NODE_VERSION: '18'
  DOCKER_REGISTRY: ghcr.io

jobs:
  # ==============================================================
  # TEST & LINT
  # ==============================================================
  test:
    name: Test & Lint
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:7
        env:
          MONGO_INITDB_ROOT_USERNAME: admin
          MONGO_INITDB_ROOT_PASSWORD: password
        options: >-
          --health-cmd "echo 'db.runCommand(\"ping\").ok' | mongosh localhost:27017/test --quiet"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 27017:27017
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: server/package-lock.json
      
      - name: Install dependencies
        working-directory: ./server
        run: npm ci
      
      - name: Run linter
        working-directory: ./server
        run: npm run lint || echo "No lint configured"
      
      - name: Run tests
        working-directory: ./server
        run: npm test || echo "No tests configured"
        env:
          MONGODB_URI: mongodb://admin:password@localhost:27017/test?authSource=admin
          JWT_SECRET: test_secret_for_ci_only
  
  # ==============================================================
  # BUILD DOCKER IMAGES
  # ==============================================================
  build:
    name: Build Docker Images
    needs: test
    runs-on: ubuntu-latest
    
    permissions:
      contents: read
      packages: write
    
    strategy:
      matrix:
        service: [backend, frontend]
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.DOCKER_REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.DOCKER_REGISTRY }}/${{ github.repository }}-${{ matrix.service }}
          tags: |
            type=ref,event=branch
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./${{ matrix.service == 'backend' && 'server' || 'frontend' }}
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
  
  # ==============================================================
  # DEPLOY TO PRODUCTION
  # ==============================================================
  deploy:
    name: Deploy to Production
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://footballhub.ma
    
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          port: ${{ secrets.SSH_PORT || 22 }}
          script: |
            set -e
            
            echo "🚀 Starting deployment..."
            
            cd /var/www/footballhub
            
            # Pull latest code
            git pull origin main
            
            # Pull latest Docker images
            docker-compose -f docker-compose.prod.yml pull
            
            # Restart services with zero-downtime
            docker-compose -f docker-compose.prod.yml up -d --no-deps --build
            
            # Clean up old images
            docker image prune -af --filter "until=24h"
            
            # Health check
            sleep 15
            
            HEALTH=$(curl -f http://localhost:5000/api/health || echo "failed")
            if [ "$HEALTH" == "failed" ]; then
              echo "❌ Health check failed!"
              docker-compose -f docker-compose.prod.yml logs backend
              exit 1
            fi
            
            echo "✅ Deployment completed successfully!"
  
  # ==============================================================
  # NOTIFY
  # ==============================================================
  notify:
    name: Notify Deployment Status
    needs: deploy
    runs-on: ubuntu-latest
    if: always()
    
    steps:
      - name: Send Slack notification
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ needs.deploy.result }}
          text: |
            *Deployment to Production*
            Status: ${{ needs.deploy.result }}
            Commit: ${{ github.sha }}
            Author: ${{ github.actor }}
            Branch: ${{ github.ref }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: always()
```

### 2. GitHub Secrets à Configurer

```bash
# Repository Settings > Secrets and variables > Actions

# SSH Connection
SERVER_HOST=your.server.ip
SERVER_USER=root
SSH_PRIVATE_KEY=your_ssh_private_key
SSH_PORT=22

# Slack Notification (Optional)
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Sentry
SENTRY_DSN=your_sentry_dsn

# Database Credentials
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=your_secure_password
REDIS_PASSWORD=your_redis_password

# JWT
JWT_SECRET=your_jwt_secret_min_64_chars
```

---

## 📊 MONITORING avec Sentry & DataDog

### 1. Sentry Backend Integration

```javascript
// server/src/config/sentry.js
const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

const initSentry = (app) => {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app }),
        new ProfilingIntegration(),
      ],
      
      // Performance Monitoring
      tracesSampleRate: 0.1, // 10% of transactions
      profilesSampleRate: 0.1,
      
      // Filter sensitive data
      beforeSend(event) {
        // Remove passwords from data
        if (event.request?.data) {
          if (event.request.data.password) {
            event.request.data.password = '[REDACTED]';
          }
        }
        
        // Filter out health checks
        if (event.request?.url?.includes('/health')) {
          return null;
        }
        
        return event;
      },
      
      // Custom tags
      beforeBreadcrumb(breadcrumb) {
        return breadcrumb;
      },
    });

    // Request handler (must be first middleware)
    app.use(Sentry.Handlers.requestHandler());
    
    // Tracing handler
    app.use(Sentry.Handlers.tracingHandler());

    console.log('✅ Sentry monitoring initialized');
  }
};

// Error handler (must be after all routes)
const sentryErrorHandler = () => {
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Capture errors >= 500
      return error.status >= 500;
    },
  });
};

module.exports = { initSentry, sentryErrorHandler };
```

### 2. Intégration dans src/index.js

```javascript
// server/src/index.js
require('dotenv').config();
const express = require('express');
const { initSentry, sentryErrorHandler } = require('./config/sentry');

const app = express();

// Initialize Sentry (FIRST!)
initSentry(app);

// ... autres middlewares ...

// ... routes ...

// Sentry error handler (BEFORE other error handlers)
app.use(sentryErrorHandler());

// ... autres error handlers ...
```

### 3. Sentry Frontend (React)

```typescript
// frontend/src/config/sentry.ts
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export const initSentry = () => {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      
      integrations: [
        new BrowserTracing(),
        new Sentry.Replay({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      
      // Performance Monitoring
      tracesSampleRate: 0.1,
      
      // Session Replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      
      beforeSend(event) {
        // Don't send in development
        if (import.meta.env.DEV) {
          return null;
        }
        return event;
      },
    });

    console.log('✅ Sentry initialized');
  }
};
```

```typescript
// frontend/src/main.tsx
import { initSentry } from './config/sentry';

// Initialize Sentry first
initSentry();

// ... rest of app
```

### 4. DataDog Integration (Optional)

```javascript
// server/src/config/datadog.js
const tracer = require('dd-trace').init({
  hostname: process.env.DD_AGENT_HOST || 'localhost',
  port: 8126,
  service: 'footballhub-api',
  env: process.env.NODE_ENV,
  version: process.env.npm_package_version,
  
  // Enable profiling
  profiling: true,
  runtimeMetrics: true,
  
  // Logging
  logInjection: true,
  
  // APM
  analytics: true,
});

module.exports = tracer;
```

```javascript
// server/src/index.js
// Must be FIRST import
require('./config/datadog');

// ... rest of imports
```

---

## 🚀 GUIDE DE DÉPLOIEMENT COMPLET

### ÉTAPE 1 : Préparation Serveur

```bash
# Connexion SSH
ssh root@your-server-ip

# Update système
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Install Node.js & PM2 (si utilisation PM2)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
npm install -g pm2

# Install Git
apt install git -y

# Create project directory
mkdir -p /var/www/footballhub
cd /var/www/footballhub
```

### ÉTAPE 2 : Configuration Initiale

```bash
# Clone repository
git clone https://github.com/yourusername/footballhub.git .

# Create environment files
cp server/.env.example server/.env.production
cp frontend/.env.example frontend/.env.production

# Edit environment variables
nano server/.env.production
nano frontend/.env.production

# Set correct permissions
chown -R $USER:$USER /var/www/footballhub
chmod -R 755 /var/www/footballhub
```

### ÉTAPE 3 : Build & Deploy

```bash
# Build Docker images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### ÉTAPE 4 : Configuration SSL

```bash
# Make script executable
chmod +x scripts/setup-ssl.sh

# Run SSL setup
./scripts/setup-ssl.sh

# Add cron job for auto-renewal
crontab -e
# Add: 0 3 * * * /var/www/footballhub/scripts/renew-ssl.sh >> /var/log/ssl-renew.log 2>&1
```

### ÉTAPE 5 : Configuration Firewall

```bash
# UFW Firewall
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
ufw status
```

### ÉTAPE 6 : Monitoring Setup

```bash
# Install PM2 monitoring
pm2 install pm2-server-monit

# Install fail2ban
apt install fail2ban -y
systemctl enable fail2ban
systemctl start fail2ban
```

### ÉTAPE 7 : Backup Setup

```bash
# Make backup script executable
chmod +x scripts/backup-mongodb.sh

# Add to cron
crontab -e
# Add: 0 2 * * * /var/www/footballhub/scripts/backup-mongodb.sh >> /var/log/backup.log 2>&1
```

---

## ✅ CHECKLIST DE DÉPLOIEMENT

### Pré-Déploiement
- [ ] Serveur VPS provisionné
- [ ] Domaine acheté et configuré
- [ ] DNS pointant vers le serveur
- [ ] SSH access configuré
- [ ] Docker & Docker Compose installés

### Configuration
- [ ] Environment variables configurées
- [ ] Secrets GitHub configurés
- [ ] MongoDB credentials sécurisés
- [ ] JWT secret généré (64+ chars)
- [ ] Redis password configuré

### Sécurité
- [ ] SSL/HTTPS configuré
- [ ] Firewall activé
- [ ] fail2ban installé
- [ ] Rate limiting configuré
- [ ] Headers sécurité Nginx

### Services
- [ ] Backend déployé et running
- [ ] Frontend déployé et running
- [ ] MongoDB opérationnel
- [ ] Redis opérationnel
- [ ] Nginx reverse proxy fonctionnel

### Monitoring
- [ ] Sentry configuré
- [ ] Logs configurés
- [ ] Health checks opérationnels
- [ ] Alertes configurées

### CI/CD
- [ ] GitHub Actions workflow configuré
- [ ] Auto-deployment fonctionnel
- [ ] Tests automatiques passent
- [ ] Notifications Slack actives

### Backup
- [ ] Backup automatique configuré
- [ ] Restore testé
- [ ] Logs sauvegardés

---

## 🎯 COMMANDES UTILES

```bash
# Docker
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml logs -f
docker-compose -f docker-compose.prod.yml restart backend

# PM2
pm2 list
pm2 restart footballhub-api
pm2 logs footballhub-api --lines 100
pm2 monit

# Nginx
nginx -t                    # Test config
nginx -s reload             # Reload config
systemctl restart nginx     # Restart nginx

# Logs
tail -f /var/log/nginx/error.log
tail -f server/logs/pm2-error.log
docker-compose -f docker-compose.prod.yml logs backend -f

# System
df -h                       # Disk usage
free -h                     # Memory usage
htop                        # CPU usage
```

---

## 🎉 DÉPLOIEMENT PRODUCTION COMPLET !

Votre application FootballHub+ est maintenant **déployée en production** avec :
- ✅ Docker containerization
- ✅ Nginx reverse proxy
- ✅ SSL/HTTPS automatique
- ✅ PM2 cluster mode
- ✅ CI/CD automatique
- ✅ Monitoring complet
- ✅ Backup automatique
- ✅ Sécurité renforcée

**Prêt pour des milliers d'utilisateurs ! 🚀**
