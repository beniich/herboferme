# 🚀 Configuration Déploiement & WebSocket - FootballHub+

## 📦 1. Configuration Docker

### Dockerfile Backend

```dockerfile
# server/Dockerfile

FROM node:18-alpine AS builder

# Set working directory
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

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "src/index.js"]
```

### Dockerfile Frontend

```dockerfile
# Dockerfile (frontend)

FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

```nginx
# nginx.conf

events {
  worker_connections 1024;
}

http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;

  server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
      expires 1y;
      add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
      try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
      proxy_pass http://backend:5000/api/;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_cache_bypass $http_upgrade;
    }

    # WebSocket proxy
    location /ws/ {
      proxy_pass http://backend:5000/ws/;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "Upgrade";
      proxy_set_header Host $host;
    }
  }
}
```

### docker-compose.yml

```yaml
# docker-compose.yml

version: '3.8'

services:
  # MongoDB
  mongodb:
    image: mongo:7
    container_name: footballhub-mongodb
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
      MONGO_INITDB_DATABASE: footballhub
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    networks:
      - footballhub-network

  # Redis (for caching)
  redis:
    image: redis:7-alpine
    container_name: footballhub-redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - footballhub-network

  # Backend API
  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: footballhub-backend
    restart: always
    depends_on:
      - mongodb
      - redis
    environment:
      NODE_ENV: production
      PORT: 5000
      MONGODB_URI: mongodb://admin:${MONGO_PASSWORD}@mongodb:27017/footballhub?authSource=admin
      REDIS_URL: redis://redis:6379
      RAPIDAPI_KEY: ${RAPIDAPI_KEY}
      JWT_SECRET: ${JWT_SECRET}
      CORS_ORIGIN: ${CORS_ORIGIN}
      INITIAL_SYNC: ${INITIAL_SYNC:-false}
    ports:
      - "5000:5000"
    volumes:
      - ./server/uploads:/app/uploads
    networks:
      - footballhub-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Frontend
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: footballhub-frontend
    restart: always
    depends_on:
      - backend
    ports:
      - "80:80"
    networks:
      - footballhub-network

volumes:
  mongodb_data:
  redis_data:

networks:
  footballhub-network:
    driver: bridge
```

### .env.production

```bash
# .env.production

# MongoDB
MONGO_PASSWORD=your_strong_mongodb_password

# API Football
RAPIDAPI_KEY=your_rapidapi_key

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# CORS
CORS_ORIGIN=https://footballhub.com

# Initial Sync
INITIAL_SYNC=false

# Node
NODE_ENV=production
```

---

## 🔌 2. WebSocket pour Temps Réel

### WebSocket Service

```javascript
// server/src/services/websocketService.js

const WebSocket = require('ws');
const Match = require('../models/Match');

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Map();
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws',
    });

    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      
      console.log(`✅ WebSocket client connected: ${clientId}`);
      
      this.clients.set(clientId, {
        ws,
        subscriptions: new Set(),
      });

      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message);
          await this.handleMessage(clientId, data);
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      ws.on('close', () => {
        console.log(`❌ WebSocket client disconnected: ${clientId}`);
        this.clients.delete(clientId);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      // Send welcome message
      this.sendToClient(clientId, {
        type: 'connected',
        clientId,
        timestamp: new Date().toISOString(),
      });
    });

    // Start broadcasting live scores
    this.startLiveBroadcast();

    console.log('✅ WebSocket server initialized');
  }

  async handleMessage(clientId, data) {
    const { type, payload } = data;

    switch (type) {
      case 'subscribe':
        this.handleSubscribe(clientId, payload);
        break;
      
      case 'unsubscribe':
        this.handleUnsubscribe(clientId, payload);
        break;
      
      case 'ping':
        this.sendToClient(clientId, { type: 'pong' });
        break;
      
      default:
        console.log(`Unknown message type: ${type}`);
    }
  }

  handleSubscribe(clientId, payload) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { channel } = payload;
    client.subscriptions.add(channel);

    console.log(`Client ${clientId} subscribed to ${channel}`);

    this.sendToClient(clientId, {
      type: 'subscribed',
      channel,
    });
  }

  handleUnsubscribe(clientId, payload) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { channel } = payload;
    client.subscriptions.delete(channel);

    console.log(`Client ${clientId} unsubscribed from ${channel}`);

    this.sendToClient(clientId, {
      type: 'unsubscribed',
      channel,
    });
  }

  sendToClient(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) return;

    try {
      client.ws.send(JSON.stringify(data));
    } catch (error) {
      console.error('Error sending to client:', error);
    }
  }

  broadcast(channel, data) {
    let count = 0;

    this.clients.forEach((client, clientId) => {
      if (client.subscriptions.has(channel) || channel === 'all') {
        this.sendToClient(clientId, {
          type: 'broadcast',
          channel,
          data,
          timestamp: new Date().toISOString(),
        });
        count++;
      }
    });

    return count;
  }

  async startLiveBroadcast() {
    // Broadcast live scores every 10 seconds
    setInterval(async () => {
      try {
        const liveMatches = await Match.find({ status: 'LIVE' })
          .populate('league', 'name logo')
          .select('homeTeam awayTeam score elapsed status league');

        if (liveMatches.length > 0) {
          const count = this.broadcast('live-scores', liveMatches);
          console.log(`📡 Broadcasted live scores to ${count} clients`);
        }
      } catch (error) {
        console.error('Live broadcast error:', error);
      }
    }, 10000);

    console.log('🔴 Live broadcast started');
  }

  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  getStats() {
    const subscriptions = {};
    
    this.clients.forEach((client) => {
      client.subscriptions.forEach((channel) => {
        subscriptions[channel] = (subscriptions[channel] || 0) + 1;
      });
    });

    return {
      totalClients: this.clients.size,
      subscriptions,
    };
  }
}

module.exports = new WebSocketService();
```

### Intégration WebSocket dans server/src/index.js

```javascript
// server/src/index.js (ajoutez ces lignes)

const http = require('http');
const websocketService = require('./services/websocketService');

// ... existing code ...

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket
websocketService.initialize(server);

// Start server avec WebSocket
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🔌 WebSocket available at ws://localhost:${PORT}/ws`);
  console.log(`⏰ CRON jobs active`);
});
```

### Client WebSocket React Hook

```typescript
// src/hooks/useWebSocket.ts

import { useEffect, useRef, useState } from 'react';
import { isNative } from '@/utils/platform';

export function useWebSocket(url: string) {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    // Connect to WebSocket
    const protocol = isNative() ? 'wss' : 'ws';
    const wsUrl = url.replace('http://', `${protocol}://`).replace('https://', 'wss://');
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    ws.current.onclose = () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Cleanup
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url]);

  const send = (data: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    }
  };

  const subscribe = (channel: string) => {
    send({ type: 'subscribe', payload: { channel } });
  };

  const unsubscribe = (channel: string) => {
    send({ type: 'unsubscribe', payload: { channel } });
  };

  return {
    isConnected,
    lastMessage,
    send,
    subscribe,
    unsubscribe,
  };
}
```

### Utilisation dans React

```typescript
// src/pages/Matches.tsx (ajoutez ceci)

import { useWebSocket } from '@/hooks/useWebSocket';

export default function MatchesPage() {
  const { isConnected, lastMessage, subscribe, unsubscribe } = useWebSocket(
    'ws://localhost:5000/ws'
  );

  useEffect(() => {
    // Subscribe to live scores channel
    subscribe('live-scores');

    return () => {
      unsubscribe('live-scores');
    };
  }, []);

  useEffect(() => {
    if (lastMessage?.type === 'broadcast' && lastMessage?.channel === 'live-scores') {
      // Update live matches
      const liveMatches = lastMessage.data;
      console.log('Received live scores:', liveMatches);
      // Update state...
    }
  }, [lastMessage]);

  // ... rest of the component
}
```

---

## 🌐 3. Déploiement Production

### Configuration PM2

```javascript
// ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'footballhub-api',
      script: './server/src/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      max_memory_restart: '1G',
      autorestart: true,
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
    },
  ],
};
```

### Scripts de Déploiement

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Starting deployment..."

# Pull latest code
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
cd server && npm ci --only=production
cd ..

# Build frontend
echo "🏗️  Building frontend..."
npm run build

# Run database migrations (if any)
# npm run migrate

# Restart services
echo "♻️  Restarting services..."
pm2 restart ecosystem.config.js

# Check health
echo "🏥 Checking health..."
sleep 5
curl http://localhost:5000/api/health

echo "✅ Deployment complete!"
```

### Monitoring avec PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# View logs
pm2 logs

# Restart
pm2 restart all

# Stop
pm2 stop all

# Startup script (run on boot)
pm2 startup
pm2 save
```

---

## 📊 4. Monitoring & Analytics

### Health Check Endpoint

```javascript
// server/src/routes/health.js

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const syncService = require('../services/syncService');
const websocketService = require('../services/websocketService');

router.get('/', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    
    services: {
      api: 'UP',
      database: mongoose.connection.readyState === 1 ? 'UP' : 'DOWN',
      websocket: 'UP',
    },
    
    sync: syncService.getSyncStatus(),
    
    websocket: websocketService.getStats(),
    
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB',
    },
  };

  const statusCode = health.services.database === 'UP' ? 200 : 503;
  res.status(statusCode).json(health);
});

module.exports = router;
```

---

## ✅ Checklist Déploiement

### Avant le Déploiement
- [ ] Tests unitaires passent
- [ ] Tests d'intégration passent
- [ ] Variables d'environnement configurées
- [ ] Base de données backupée
- [ ] SSL/TLS configuré
- [ ] Firewall configuré
- [ ] Logs configurés

### Déploiement
- [ ] Code déployé
- [ ] Dépendances installées
- [ ] Base de données migrée
- [ ] Services redémarrés
- [ ] Health check OK
- [ ] Monitoring actif

### Après le Déploiement
- [ ] Tests de fumée réussis
- [ ] Métriques surveillées
- [ ] Logs vérifiés
- [ ] Performance acceptable
- [ ] Rollback plan prêt

---

**Votre FootballHub+ est maintenant prêt pour la production ! 🚀⚽**
