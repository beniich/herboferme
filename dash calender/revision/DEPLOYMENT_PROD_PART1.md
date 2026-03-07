# 🚀 FootballHub+ - DÉPLOIEMENT PRODUCTION COMPLET

## 📋 Vue d'Ensemble

Cette documentation couvre le déploiement complet de FootballHub+ en production avec :
- ✅ Docker & Docker Compose
- ✅ Nginx reverse proxy
- ✅ SSL/HTTPS (Let's Encrypt)
- ✅ PM2 cluster mode
- ✅ CI/CD automatique (GitHub Actions)
- ✅ Monitoring (Sentry + PM2)
- ✅ Base de données optimisée
- ✅ Backup automatique

---

## 🏗️ ARCHITECTURE PRODUCTION

```
┌─────────────────────────────────────────────────────────┐
│                    INTERNET                              │
└─────────────────┬───────────────────────────────────────┘
                  │
         ┌────────▼────────┐
         │   Cloudflare    │ (CDN + DDoS Protection)
         └────────┬────────┘
                  │
         ┌────────▼────────┐
         │  Load Balancer  │ (Optional - Multiple Servers)
         └────────┬────────┘
                  │
    ┌─────────────▼─────────────┐
    │     VPS / Cloud Server     │
    │  (DigitalOcean, AWS, etc.) │
    └─────────────┬───────────────┘
                  │
         ┌────────▼────────┐
         │  Nginx (Port 80/443) │ ← SSL Termination
         └────────┬────────┘
                  │
         ┌────────▼────────────────────────┐
         │                                  │
    ┌────▼─────┐              ┌───────▼────┐
    │ Frontend │              │  Backend   │
    │ (React)  │              │ (Node/PM2) │
    │ Port 3000│              │ Port 5000  │
    └──────────┘              └──────┬─────┘
                                     │
                            ┌────────▼─────┐
                            │   MongoDB    │
                            │  Port 27017  │
                            └──────────────┘
```

---

## 🐳 PARTIE 1 : DOCKER & DOCKER COMPOSE

### 1.1 Backend Dockerfile

```dockerfile
# server/Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Development image
FROM base AS development
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]

# Production image
FROM base AS production
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "src/index.js"]
```

### 1.2 Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS base

# Dependencies stage
FROM base AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Builder stage
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the app
ENV VITE_API_URL=https://api.footballhub.ma
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Create non-root user
RUN adduser -D -u 1001 nginxuser && \
    chown -R nginxuser:nginxuser /usr/share/nginx/html && \
    chown -R nginxuser:nginxuser /var/cache/nginx && \
    chown -R nginxuser:nginxuser /var/log/nginx && \
    chown -R nginxuser:nginxuser /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginxuser:nginxuser /var/run/nginx.pid

USER nginxuser

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
```

### 1.3 Docker Compose (Production)

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # MongoDB
  mongodb:
    image: mongo:7
    container_name: footballhub-mongodb
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: footballhub
    volumes:
      - mongodb_data:/data/db
      - mongodb_config:/data/configdb
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    networks:
      - footballhub-network
    ports:
      - "127.0.0.1:27017:27017"
    command: mongod --auth
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/footballhub --quiet
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
      target: production
    container_name: footballhub-backend
    restart: always
    environment:
      NODE_ENV: production
      PORT: 5000
      MONGODB_URI: mongodb://${MONGO_ROOT_USER}:${MONGO_ROOT_PASSWORD}@mongodb:27017/footballhub?authSource=admin
      JWT_SECRET: ${JWT_SECRET}
      RAPIDAPI_KEY: ${RAPIDAPI_KEY}
      CORS_ORIGIN: ${CORS_ORIGIN}
    volumes:
      - ./server/logs:/app/logs
      - ./server/uploads:/app/uploads
    networks:
      - footballhub-network
    depends_on:
      mongodb:
        condition: service_healthy
    ports:
      - "127.0.0.1:5000:5000"
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: production
    container_name: footballhub-frontend
    restart: always
    networks:
      - footballhub-network
    ports:
      - "127.0.0.1:3000:3000"
    depends_on:
      - backend

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: footballhub-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
      - ./frontend/dist:/usr/share/nginx/html:ro
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
  mongodb_config:
    driver: local
```

### 1.4 Environment Variables (.env.production)

```bash
# .env.production

# MongoDB
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=your_secure_password_here_min_32_chars
MONGO_DATABASE=footballhub

# Backend
NODE_ENV=production
PORT=5000
JWT_SECRET=your_jwt_secret_min_64_chars_very_secure_random_string
RAPIDAPI_KEY=your_rapidapi_key

# CORS
CORS_ORIGIN=https://footballhub.ma,https://www.footballhub.ma

# Frontend
VITE_API_URL=https://api.footballhub.ma

# Monitoring (Optional)
SENTRY_DSN=your_sentry_dsn
```

### 1.5 MongoDB Init Script

```javascript
// mongo-init.js
db = db.getSiblingDB('footballhub');

db.createUser({
  user: 'footballhub_user',
  pwd: 'your_app_password_here',
  roles: [
    {
      role: 'readWrite',
      db: 'footballhub',
    },
  ],
});

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.members.createIndex({ membershipNumber: 1 }, { unique: true });
db.tickets.createIndex({ ticketNumber: 1 }, { unique: true });
db.tickets.createIndex({ event: 1, member: 1 });
db.matches.createIndex({ league: 1, matchDate: -1 });
db.matches.createIndex({ status: 1, matchDate: 1 });
db.leagues.createIndex({ country: 1, priority: -1 });

print('Database initialization completed');
```

---

## 🔧 PARTIE 2 : NGINX CONFIGURATION

### 2.1 Nginx Main Config

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

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 20M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml font/truetype font/opentype 
               application/vnd.ms-fontobject image/svg+xml;
    gzip_disable "msie6";

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;
    limit_conn_zone $binary_remote_addr zone=conn_limit:10m;

    include /etc/nginx/conf.d/*.conf;
}
```

### 2.2 Site Config (HTTP → HTTPS Redirect)

```nginx
# nginx/conf.d/footballhub.conf

# HTTP → HTTPS redirect
server {
    listen 80;
    server_name footballhub.ma www.footballhub.ma api.footballhub.ma;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS - Frontend
server {
    listen 443 ssl http2;
    server_name footballhub.ma www.footballhub.ma;

    ssl_certificate /etc/letsencrypt/live/footballhub.ma/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/footballhub.ma/privkey.pem;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    root /usr/share/nginx/html;
    index index.html;

    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Health check
    location /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }
}

# HTTPS - API Backend
server {
    listen 443 ssl http2;
    server_name api.footballhub.ma;

    ssl_certificate /etc/letsencrypt/live/footballhub.ma/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/footballhub.ma/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Rate limiting
    limit_req zone=api_limit burst=20 nodelay;
    limit_conn conn_limit 10;

    location / {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Strict rate limiting for auth endpoints
    location ~ ^/api/auth/(login|register) {
        limit_req zone=auth_limit burst=3 nodelay;
        
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /api/health {
        access_log off;
        proxy_pass http://backend:5000/api/health;
    }
}
```

Suite dans le prochain fichier avec SSL, PM2, CI/CD, et Monitoring ! 🚀
