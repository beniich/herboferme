# 🌐 FootballHub+ - DÉPLOIEMENT PRODUCTION COMPLET

## 📋 Table des Matières

1. [Architecture de Déploiement](#architecture)
2. [Docker & Docker Compose](#docker)
3. [Nginx Configuration](#nginx)
4. [SSL/HTTPS avec Let's Encrypt](#ssl)
5. [PM2 Cluster Mode](#pm2)
6. [CI/CD avec GitHub Actions](#cicd)
7. [Monitoring (Sentry, DataDog)](#monitoring)

---

## 🏗️ ARCHITECTURE DE DÉPLOIEMENT

```
┌─────────────────────────────────────────────────────────┐
│                    Internet (HTTPS)                      │
└─────────────────────┬───────────────────────────────────┘
                      │
                ┌─────▼─────┐
                │   Nginx   │ (Reverse Proxy + SSL)
                │ Port 80/443│
                └─────┬─────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
   ┌────▼────┐  ┌────▼────┐  ┌────▼────┐
   │ PM2 API │  │ PM2 API │  │ PM2 API │ (Cluster Mode)
   │ :5001   │  │ :5002   │  │ :5003   │
   └────┬────┘  └────┬────┘  └────┬────┘
        │             │             │
        └─────────────┼─────────────┘
                      │
                ┌─────▼─────┐
                │  MongoDB  │
                │  :27017   │
                └─────┬─────┘
                      │
                ┌─────▼─────┐
                │   Redis   │ (Cache & Session)
                │  :6379    │
                └───────────┘
```

---

## 🐳 DOCKER & DOCKER COMPOSE

### 1. Backend Dockerfile

```dockerfile
# server/Dockerfile
FROM node:18-alpine AS builder

# Install dependencies for building native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node healthcheck.js

CMD ["node", "src/index.js"]
```

### 2. Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build for production
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 3. Docker Compose (Production)

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # MongoDB
  mongodb:
    image: mongo:7
    container_name: footballhub-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: footballhub
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    networks:
      - footballhub-network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/footballhub --quiet
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis
  redis:
    image: redis:7-alpine
    container_name: footballhub-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - footballhub-network
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: footballhub-backend
    restart: unless-stopped
    env_file:
      - ./server/.env.production
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://${MONGO_ROOT_USER}:${MONGO_ROOT_PASSWORD}@mongodb:27017/footballhub?authSource=admin
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
    depends_on:
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - footballhub-network
    volumes:
      - ./server/logs:/app/logs
      - ./server/uploads:/app/uploads
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: footballhub-frontend
    restart: unless-stopped
    networks:
      - footballhub-network
    depends_on:
      - backend

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: footballhub-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
      - nginx_logs:/var/log/nginx
    networks:
      - footballhub-network
    depends_on:
      - frontend
      - backend
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Certbot for SSL
  certbot:
    image: certbot/certbot
    container_name: footballhub-certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"

networks:
  footballhub-network:
    driver: bridge

volumes:
  mongodb_data:
    driver: local
  redis_data:
    driver: local
  nginx_logs:
    driver: local
```

### 4. Fichiers d'Initialisation

```javascript
// mongo-init.js
db.createUser({
  user: 'footballhub',
  pwd: process.env.MONGO_APP_PASSWORD,
  roles: [
    {
      role: 'readWrite',
      db: 'footballhub',
    },
  ],
});

db.createCollection('users');
db.createCollection('members');
db.createCollection('tickets');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.members.createIndex({ email: 1 }, { unique: true });
db.tickets.createIndex({ ticketNumber: 1 }, { unique: true });
db.tickets.createIndex({ event: 1, member: 1 });
```

---

## 🌐 NGINX CONFIGURATION

### 1. Configuration Principale

```nginx
# nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 2048;
    use epoll;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 20M;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml font/truetype font/opentype 
               application/vnd.ms-fontobject image/svg+xml;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;

    # Upstream servers
    upstream backend {
        least_conn;
        server backend:5000 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    upstream frontend {
        server frontend:80;
    }

    # Include server configs
    include /etc/nginx/conf.d/*.conf;
}
```

### 2. Configuration Serveur

```nginx
# nginx/conf.d/footballhub.conf
# HTTP - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name footballhub.ma www.footballhub.ma;

    # Certbot challenges
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect all HTTP to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS - Main Configuration
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name footballhub.ma www.footballhub.ma;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/footballhub.ma/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/footballhub.ma/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/footballhub.ma/chain.pem;

    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;" always;

    # Root directory
    root /usr/share/nginx/html;
    index index.html;

    # API Proxy
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;

        proxy_pass http://backend;
        proxy_http_version 1.1;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Buffering
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }

    # Auth endpoints with stricter rate limit
    location ~ ^/api/auth/(login|register) {
        limit_req zone=login_limit burst=3 nodelay;

        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Static files with caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Frontend SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

---

## 🔒 SSL/HTTPS avec Let's Encrypt

### Script d'Installation SSL

```bash
#!/bin/bash
# scripts/setup-ssl.sh

DOMAIN="footballhub.ma"
EMAIL="admin@footballhub.ma"

# Create directories
mkdir -p certbot/conf
mkdir -p certbot/www

# Get SSL certificate
docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  -d $DOMAIN \
  -d www.$DOMAIN

# Reload Nginx
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload

echo "✅ SSL certificate installed successfully!"
```

### Script de Renouvellement Auto

```bash
#!/bin/bash
# scripts/renew-ssl.sh

# Renew certificate
docker-compose -f docker-compose.prod.yml run --rm certbot renew

# Reload Nginx
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload

echo "✅ SSL certificate renewed!"
```

### Cron Job pour Renouvellement

```bash
# Ajouter au crontab
0 3 * * * /path/to/footballhub/scripts/renew-ssl.sh >> /var/log/ssl-renew.log 2>&1
```

Suite dans le prochain fichier avec PM2, CI/CD et Monitoring ! 🚀
