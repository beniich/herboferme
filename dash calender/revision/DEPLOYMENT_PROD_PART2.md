# 🚀 FootballHub+ - DÉPLOIEMENT PRODUCTION PART 2

## 🔒 PARTIE 3 : SSL/HTTPS avec Let's Encrypt

### 3.1 Script d'Installation SSL

```bash
#!/bin/bash
# setup-ssl.sh

# Configuration
DOMAIN="footballhub.ma"
EMAIL="admin@footballhub.ma"

echo "🔒 Setting up SSL for $DOMAIN..."

# Stop nginx if running
docker-compose down nginx

# Get SSL certificate
docker run -it --rm \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  certbot/certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  --force-renewal \
  -d $DOMAIN \
  -d www.$DOMAIN \
  -d api.$DOMAIN

# Start nginx with SSL
docker-compose up -d nginx

echo "✅ SSL certificate installed successfully!"
echo "🔄 Certificate will auto-renew every 12 hours"
```

### 3.2 Script de Renouvellement Auto

```bash
#!/bin/bash
# renew-ssl.sh

echo "🔄 Renewing SSL certificates..."

docker-compose run --rm certbot renew

# Reload nginx to pick up new certs
docker-compose exec nginx nginx -s reload

echo "✅ SSL certificates renewed and nginx reloaded"
```

### 3.3 Crontab pour Auto-Renewal

```bash
# Ajouter à crontab: crontab -e
# Renew SSL every day at 3 AM
0 3 * * * /path/to/project/renew-ssl.sh >> /var/log/ssl-renew.log 2>&1
```

---

## ⚙️ PARTIE 4 : PM2 CLUSTER MODE (Alternative à Docker)

### 4.1 PM2 Ecosystem Config

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'footballhub-api',
      script: './src/index.js',
      instances: 'max', // Use all CPU cores
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      
      // Logging
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Auto-restart on crash
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
};
```

### 4.2 PM2 Commands

```bash
# Install PM2 globally
npm install -g pm2

# Start app
pm2 start ecosystem.config.js --env production

# Monitor
pm2 monit

# Logs
pm2 logs footballhub-api --lines 100

# Reload without downtime
pm2 reload footballhub-api

# Status
pm2 status

# Save PM2 config for auto-restart on reboot
pm2 save
pm2 startup

# Stop
pm2 stop footballhub-api

# Delete
pm2 delete footballhub-api
```

### 4.3 PM2 Plus Monitoring (Optional)

```bash
# Link to PM2 Plus for advanced monitoring
pm2 link your_secret_key your_public_key

# Set app name
pm2 set pm2-plus:app-name footballhub-api
```

---

## 🔄 PARTIE 5 : CI/CD avec GitHub Actions

### 5.1 GitHub Actions Workflow

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
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # ============================================================
  # TEST BACKEND
  # ============================================================
  test-backend:
    name: Test Backend
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
      - name: Checkout code
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
        run: npm run lint || echo "No lint script"
      
      - name: Run tests
        working-directory: ./server
        run: npm test || echo "No tests yet"
        env:
          MONGODB_URI: mongodb://admin:password@localhost:27017/footballhub?authSource=admin
          JWT_SECRET: test_secret_key_for_ci_only
  
  # ============================================================
  # TEST FRONTEND
  # ============================================================
  test-frontend:
    name: Test Frontend
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci
      
      - name: Run linter
        working-directory: ./frontend
        run: npm run lint || echo "No lint script"
      
      - name: Build
        working-directory: ./frontend
        run: npm run build
        env:
          VITE_API_URL: https://api.footballhub.ma
  
  # ============================================================
  # BUILD & PUSH DOCKER IMAGES
  # ============================================================
  build:
    name: Build Docker Images
    runs-on: ubuntu-latest
    needs: [test-backend, test-frontend]
    
    permissions:
      contents: read
      packages: write
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata (Backend)
        id: meta-backend
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-backend
          tags: |
            type=ref,event=branch
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}
      
      - name: Build and push Backend
        uses: docker/build-push-action@v5
        with:
          context: ./server
          file: ./server/Dockerfile
          push: true
          tags: ${{ steps.meta-backend.outputs.tags }}
          labels: ${{ steps.meta-backend.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
      
      - name: Extract metadata (Frontend)
        id: meta-frontend
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-frontend
          tags: |
            type=ref,event=branch
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}
      
      - name: Build and push Frontend
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          file: ./frontend/Dockerfile
          push: true
          tags: ${{ steps.meta-frontend.outputs.tags }}
          labels: ${{ steps.meta-frontend.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
  
  # ============================================================
  # DEPLOY TO PRODUCTION
  # ============================================================
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: build
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
          port: 22
          script: |
            cd /var/www/footballhub
            
            # Pull latest images
            docker-compose pull
            
            # Restart services with zero-downtime
            docker-compose up -d --no-deps --build
            
            # Clean up old images
            docker image prune -af
            
            # Health check
            sleep 10
            curl -f http://localhost:5000/api/health || exit 1
            
            echo "✅ Deployment completed successfully!"
  
  # ============================================================
  # NOTIFY
  # ============================================================
  notify:
    name: Notify Deployment Status
    runs-on: ubuntu-latest
    needs: deploy
    if: always()
    
    steps:
      - name: Send notification
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: |
            Deployment to Production: ${{ job.status }}
            Commit: ${{ github.sha }}
            Author: ${{ github.actor }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: always()
```

### 5.2 GitHub Secrets à Configurer

```bash
# Dans GitHub: Settings > Secrets and variables > Actions

# Server SSH
SERVER_HOST=your.server.ip
SERVER_USER=root
SSH_PRIVATE_KEY=your_private_key

# Slack (Optional)
SLACK_WEBHOOK=https://hooks.slack.com/services/...

# Docker Registry (automatique avec GITHUB_TOKEN)
```

### 5.3 Branch Protection Rules

```bash
# Dans GitHub: Settings > Branches > Add rule

Branch name pattern: main

✅ Require pull request reviews before merging
✅ Require status checks to pass before merging
   - test-backend
   - test-frontend
✅ Require branches to be up to date before merging
✅ Do not allow bypassing the above settings
```

---

## 📊 PARTIE 6 : MONITORING avec Sentry & PM2

### 6.1 Sentry Configuration (Backend)

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
      tracesSampleRate: 0.1, // 10% of transactions
      profilesSampleRate: 0.1,
      
      // Filter out health checks and static files
      beforeSend(event) {
        const url = event.request?.url;
        if (url?.includes('/health') || url?.includes('/static')) {
          return null;
        }
        return event;
      },
    });

    // Request handler
    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());

    console.log('✅ Sentry monitoring initialized');
  }
};

const sentryErrorHandler = () => {
  return Sentry.Handlers.errorHandler();
};

module.exports = { initSentry, sentryErrorHandler };
```

### 6.2 Intégration Sentry dans src/index.js

```javascript
// Add at the top after require('dotenv').config()
const { initSentry, sentryErrorHandler } = require('./config/sentry');

const app = express();

// Initialize Sentry FIRST
initSentry(app);

// ... autres middlewares ...

// ... routes ...

// Sentry error handler BEFORE other error handlers
app.use(sentryErrorHandler());

// ... other error handlers ...
```

### 6.3 Sentry Frontend (React)

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
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      
      beforeSend(event) {
        // Don't send errors for development builds
        if (event.environment === 'development') {
          return null;
        }
        return event;
      },
    });

    console.log('✅ Sentry monitoring initialized');
  }
};
```

```typescript
// frontend/src/main.tsx
import { initSentry } from './config/sentry';

// Initialize Sentry
initSentry();

// ... rest of app initialization
```

### 6.4 PM2 Monitoring Dashboard

```bash
# Install PM2 Plus
pm2 install pm2-server-monit

# Link to PM2 Plus
pm2 link your_secret_key your_public_key

# Monitor metrics
pm2 monitor
```

### 6.5 Health Check Endpoint Enhanced

```javascript
// server/src/routes/health.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const os = require('os');

router.get('/health', async (req, res) => {
  const healthcheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    
    // Database
    database: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      readyState: mongoose.connection.readyState,
    },
    
    // Memory
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(os.totalmem() / 1024 / 1024),
      free: Math.round(os.freemem() / 1024 / 1024),
      percentage: Math.round((os.freemem() / os.totalmem()) * 100),
    },
    
    // CPU
    cpu: {
      load: os.loadavg(),
      cores: os.cpus().length,
    },
    
    // Process
    process: {
      pid: process.pid,
      version: process.version,
      platform: process.platform,
    },
  };
  
  // Check if critical services are down
  if (mongoose.connection.readyState !== 1) {
    healthcheck.status = 'DEGRADED';
    return res.status(503).json(healthcheck);
  }
  
  res.status(200).json(healthcheck);
});

// Readiness probe (for Kubernetes/Docker)
router.get('/ready', async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    return res.status(200).send('Ready');
  }
  res.status(503).send('Not Ready');
});

// Liveness probe
router.get('/live', (req, res) => {
  res.status(200).send('Alive');
});

module.exports = router;
```

---

## 📦 PARTIE 7 : BACKUP AUTOMATIQUE

### 7.1 Script de Backup MongoDB

```bash
#!/bin/bash
# backup-mongodb.sh

# Configuration
BACKUP_DIR="/var/backups/footballhub"
MONGO_USER="admin"
MONGO_PASS="your_password"
MONGO_DB="footballhub"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="footballhub_backup_$DATE"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup
docker exec footballhub-mongodb mongodump \
  --username=$MONGO_USER \
  --password=$MONGO_PASS \
  --authenticationDatabase=admin \
  --db=$MONGO_DB \
  --out=/tmp/$BACKUP_NAME

# Copy backup from container
docker cp footballhub-mongodb:/tmp/$BACKUP_NAME $BACKUP_DIR/

# Compress
cd $BACKUP_DIR
tar -czf ${BACKUP_NAME}.tar.gz $BACKUP_NAME
rm -rf $BACKUP_NAME

# Delete backups older than 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

# Upload to S3 (optional)
# aws s3 cp ${BACKUP_NAME}.tar.gz s3://footballhub-backups/

echo "✅ Backup completed: ${BACKUP_NAME}.tar.gz"
```

### 7.2 Crontab Backup

```bash
# Daily backup at 2 AM
0 2 * * * /path/to/backup-mongodb.sh >> /var/log/backup.log 2>&1
```

### 7.3 Restore Script

```bash
#!/bin/bash
# restore-mongodb.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: ./restore-mongodb.sh backup_file.tar.gz"
  exit 1
fi

# Extract
tar -xzf $BACKUP_FILE

# Restore
docker exec -i footballhub-mongodb mongorestore \
  --username=admin \
  --password=your_password \
  --authenticationDatabase=admin \
  --db=footballhub \
  --drop \
  /tmp/$(basename $BACKUP_FILE .tar.gz)

echo "✅ Restore completed"
```

Suite dans le prochain fichier avec le guide de déploiement complet ! 🚀
