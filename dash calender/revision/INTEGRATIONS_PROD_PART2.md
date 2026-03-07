# 🔌 FootballHub+ - INTÉGRATIONS PRODUCTION PART 2

## ⚽ 3. API FOOTBALL PROFESSIONNELLE (API-Football)

```bash
npm install axios rate-limiter-flexible
```

```javascript
// server/src/services/footballApiPro.js
const axios = require('axios');
const redis = require('../config/redis');
const { RateLimiterMemory } = require('rate-limiter-flexible');

// Rate limiter (API-Football limite à 100 req/jour en free tier)
const rateLimiter = new RateLimiterMemory({
  points: 100, // 100 requests
  duration: 86400, // per day
});

class FootballApiService {
  constructor() {
    this.client = axios.create({
      baseURL: 'https://v3.football.api-sports.io',
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io',
      },
      timeout: 10000,
    });
  }

  // Rate limited API call
  async makeRequest(endpoint, params = {}) {
    try {
      // Check rate limit
      await rateLimiter.consume('api-football', 1);

      // Check cache first
      const cacheKey = `football-api:${endpoint}:${JSON.stringify(params)}`;
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        console.log('✅ Cache hit:', endpoint);
        return JSON.parse(cached);
      }

      // Make API request
      console.log('📡 API request:', endpoint);
      const response = await this.client.get(endpoint, { params });
      
      // Cache response (5 minutes for live data, 1 hour for static)
      const ttl = endpoint.includes('live') ? 300 : 3600;
      await redis.setex(cacheKey, ttl, JSON.stringify(response.data));

      return response.data;
    } catch (error) {
      if (error instanceof Error && error.message.includes('rate limit')) {
        console.error('⚠️ Rate limit exceeded');
        throw new Error('API rate limit exceeded. Please try again later.');
      }
      
      console.error('API-Football error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get live matches
  async getLiveMatches() {
    const data = await this.makeRequest('/fixtures', {
      live: 'all',
    });

    return data.response;
  }

  // Get fixtures by league and date
  async getFixtures(leagueId, season, date) {
    const data = await this.makeRequest('/fixtures', {
      league: leagueId,
      season: season,
      date: date, // YYYY-MM-DD
    });

    return data.response;
  }

  // Get fixture details with lineups and statistics
  async getFixtureDetails(fixtureId) {
    const [fixture, lineups, statistics, events] = await Promise.all([
      this.makeRequest('/fixtures', { id: fixtureId }),
      this.makeRequest('/fixtures/lineups', { fixture: fixtureId }),
      this.makeRequest('/fixtures/statistics', { fixture: fixtureId }),
      this.makeRequest('/fixtures/events', { fixture: fixtureId }),
    ]);

    return {
      fixture: fixture.response[0],
      lineups: lineups.response,
      statistics: statistics.response,
      events: events.response,
    };
  }

  // Get league standings
  async getStandings(leagueId, season) {
    const data = await this.makeRequest('/standings', {
      league: leagueId,
      season: season,
    });

    return data.response[0]?.league?.standings[0] || [];
  }

  // Get team information
  async getTeam(teamId) {
    const data = await this.makeRequest('/teams', {
      id: teamId,
    });

    return data.response[0];
  }

  // Get top scorers
  async getTopScorers(leagueId, season) {
    const data = await this.makeRequest('/players/topscorers', {
      league: leagueId,
      season: season,
    });

    return data.response;
  }

  // Get player statistics
  async getPlayerStats(playerId, season) {
    const data = await this.makeRequest('/players', {
      id: playerId,
      season: season,
    });

    return data.response[0];
  }

  // Get head to head
  async getHeadToHead(team1Id, team2Id) {
    const data = await this.makeRequest('/fixtures/headtohead', {
      h2h: `${team1Id}-${team2Id}`,
      last: 10,
    });

    return data.response;
  }

  // Get predictions
  async getPredictions(fixtureId) {
    const data = await this.makeRequest('/predictions', {
      fixture: fixtureId,
    });

    return data.response[0];
  }
}

module.exports = new FootballApiService();
```

---

## 🚀 4. REDIS CACHING AVANCÉ

```javascript
// server/src/middleware/cache.js
const redis = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Cache middleware with advanced features
 * @param {number} duration - Cache duration in seconds
 * @param {function} keyGenerator - Custom cache key generator
 */
const cache = (duration = 300, keyGenerator = null) => {
  return async (req, res, next) => {
    // Generate cache key
    const key = keyGenerator 
      ? keyGenerator(req)
      : `cache:${req.method}:${req.originalUrl}`;

    try {
      // Try to get cached response
      const cached = await redis.get(key);
      
      if (cached) {
        logger.info(`Cache hit: ${key}`);
        
        // Add cache header
        res.setHeader('X-Cache', 'HIT');
        
        return res.json(JSON.parse(cached));
      }

      logger.info(`Cache miss: ${key}`);
      res.setHeader('X-Cache', 'MISS');

      // Store original send function
      const originalSend = res.json.bind(res);

      // Override send to cache response
      res.json = function(body) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redis.setex(key, duration, JSON.stringify(body))
            .catch(err => logger.error('Cache set error:', err));
        }
        
        return originalSend(body);
      };

      next();
    } catch (error) {
      logger.error('Cache error:', error);
      next();
    }
  };
};

/**
 * Invalidate cache by pattern
 */
const invalidateCache = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    
    if (keys.length > 0) {
      await redis.del(...keys);
      logger.info(`Cache invalidated: ${keys.length} keys deleted for pattern ${pattern}`);
    }
  } catch (error) {
    logger.error('Cache invalidation error:', error);
  }
};

/**
 * Cache user-specific data
 */
const cacheUser = (duration = 300) => {
  return cache(duration, (req) => {
    return `cache:user:${req.userId}:${req.method}:${req.path}`;
  });
};

/**
 * Cache with tags for easy invalidation
 */
class CacheManager {
  static async set(key, value, ttl = 300, tags = []) {
    try {
      // Set main cache
      await redis.setex(key, ttl, JSON.stringify(value));
      
      // Add to tag sets
      for (const tag of tags) {
        await redis.sadd(`tag:${tag}`, key);
        await redis.expire(`tag:${tag}`, ttl + 60); // Slightly longer TTL
      }
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }

  static async get(key) {
    try {
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  static async invalidateByTag(tag) {
    try {
      const keys = await redis.smembers(`tag:${tag}`);
      
      if (keys.length > 0) {
        await redis.del(...keys);
        await redis.del(`tag:${tag}`);
        logger.info(`Cache invalidated by tag: ${tag} (${keys.length} keys)`);
      }
    } catch (error) {
      logger.error('Cache invalidation error:', error);
    }
  }
}

module.exports = {
  cache,
  cacheUser,
  invalidateCache,
  CacheManager,
};
```

### Utilisation dans les Routes

```javascript
// server/src/routes/matches.js
const express = require('express');
const router = express.Router();
const { cache, invalidateCache } = require('../middleware/cache');
const footballApi = require('../services/footballApiPro');

// Get live matches (cache 30 seconds)
router.get('/live', cache(30), async (req, res) => {
  try {
    const matches = await footballApi.getLiveMatches();
    
    res.json({
      success: true,
      matches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get standings (cache 1 hour)
router.get('/standings/:leagueId/:season', cache(3600), async (req, res) => {
  try {
    const { leagueId, season } = req.params;
    const standings = await footballApi.getStandings(leagueId, season);
    
    res.json({
      success: true,
      standings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Invalidate cache when match ends (webhook)
router.post('/webhook/match-ended', async (req, res) => {
  const { leagueId, season } = req.body;
  
  // Invalidate standings cache
  await invalidateCache(`cache:GET:/api/matches/standings/${leagueId}/${season}`);
  
  res.json({ success: true });
});

module.exports = router;
```

---

## 🌐 5. WEBSOCKETS TEMPS RÉEL AVEC REDIS

```javascript
// server/src/services/websocketService.js
const WebSocket = require('ws');
const redis = require('../config/redis');
const { createAdapter } = require('@socket.io/redis-adapter');
const footballApi = require('./footballApiPro');

class WebSocketService {
  constructor(server) {
    // Create WebSocket server with Redis adapter for multi-server support
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws',
    });

    this.clients = new Map();
    this.rooms = new Map();
    
    this.initializeServer();
    this.startLiveBroadcast();
  }

  initializeServer() {
    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      
      console.log(`✅ Client connected: ${clientId}`);
      
      ws.clientId = clientId;
      this.clients.set(clientId, ws);

      // Handle messages
      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message);
          await this.handleMessage(ws, data);
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      // Handle disconnect
      ws.on('close', () => {
        console.log(`❌ Client disconnected: ${clientId}`);
        this.clients.delete(clientId);
        
        // Remove from all rooms
        this.rooms.forEach((clients, room) => {
          clients.delete(clientId);
        });
      });

      // Send welcome message
      this.send(ws, {
        type: 'connected',
        clientId,
        timestamp: new Date().toISOString(),
      });
    });
  }

  async handleMessage(ws, data) {
    switch (data.type) {
      case 'subscribe':
        this.subscribeToRoom(ws, data.room);
        break;
      
      case 'unsubscribe':
        this.unsubscribeFromRoom(ws, data.room);
        break;
      
      case 'ping':
        this.send(ws, { type: 'pong' });
        break;
      
      default:
        console.warn('Unknown message type:', data.type);
    }
  }

  subscribeToRoom(ws, room) {
    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }
    
    this.rooms.get(room).add(ws.clientId);
    
    this.send(ws, {
      type: 'subscribed',
      room,
    });

    console.log(`📢 Client ${ws.clientId} subscribed to ${room}`);
  }

  unsubscribeFromRoom(ws, room) {
    if (this.rooms.has(room)) {
      this.rooms.get(room).delete(ws.clientId);
    }
    
    this.send(ws, {
      type: 'unsubscribed',
      room,
    });
  }

  broadcast(room, message) {
    if (!this.rooms.has(room)) return;

    const roomClients = this.rooms.get(room);
    
    roomClients.forEach((clientId) => {
      const client = this.clients.get(clientId);
      if (client && client.readyState === WebSocket.OPEN) {
        this.send(client, message);
      }
    });
  }

  send(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  async startLiveBroadcast() {
    // Broadcast live scores every 10 seconds
    setInterval(async () => {
      try {
        const liveMatches = await footballApi.getLiveMatches();
        
        // Broadcast to subscribers
        this.broadcast('live-matches', {
          type: 'live-matches',
          data: liveMatches,
          timestamp: new Date().toISOString(),
        });

        // Also publish to Redis for other servers
        await redis.publish('live-matches', JSON.stringify({
          type: 'live-matches',
          data: liveMatches,
        }));
      } catch (error) {
        console.error('Live broadcast error:', error);
      }
    }, 10000);

    // Subscribe to Redis for updates from other servers
    const subscriber = redis.duplicate();
    subscriber.subscribe('live-matches', 'match-events');
    
    subscriber.on('message', (channel, message) => {
      const data = JSON.parse(message);
      this.broadcast(channel, data);
    });
  }

  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getStats() {
    return {
      totalClients: this.clients.size,
      rooms: Array.from(this.rooms.entries()).map(([room, clients]) => ({
        room,
        clients: clients.size,
      })),
    };
  }
}

module.exports = WebSocketService;
```

---

## 💳 6. STRIPE WEBHOOKS COMPLETS

```javascript
// server/src/routes/stripe-webhooks.js
const express = require('express');
const router = express.Router();
const stripe = require('../config/stripe');
const Order = require('../models/Order');
const User = require('../models/User');
const EmailService = require('../services/emailService');
const logger = require('../utils/logger');

// Webhook endpoint (must be before body parser)
router.post('/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      logger.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle event
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentIntentSucceeded(event.data.object);
          break;

        case 'payment_intent.payment_failed':
          await handlePaymentIntentFailed(event.data.object);
          break;

        case 'charge.succeeded':
          await handleChargeSucceeded(event.data.object);
          break;

        case 'charge.refunded':
          await handleChargeRefunded(event.data.object);
          break;

        case 'customer.subscription.created':
          await handleSubscriptionCreated(event.data.object);
          break;

        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object);
          break;

        case 'invoice.paid':
          await handleInvoicePaid(event.data.object);
          break;

        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(event.data.object);
          break;

        default:
          logger.warn(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      logger.error('Webhook handler error:', error);
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  }
);

// Payment Intent Succeeded
async function handlePaymentIntentSucceeded(paymentIntent) {
  logger.info(`PaymentIntent succeeded: ${paymentIntent.id}`);

  const orderId = paymentIntent.metadata.orderId;
  
  if (orderId) {
    const order = await Order.findById(orderId).populate('user items.product');
    
    if (order) {
      order.paymentStatus = 'Paid';
      order.stripePaymentId = paymentIntent.id;
      order.paidAt = new Date();
      await order.save();

      // Send confirmation email
      await EmailService.sendOrderConfirmationEmail(order);

      logger.info(`Order ${orderId} marked as paid`);
    }
  }
}

// Payment Intent Failed
async function handlePaymentIntentFailed(paymentIntent) {
  logger.warn(`PaymentIntent failed: ${paymentIntent.id}`);

  const orderId = paymentIntent.metadata.orderId;
  
  if (orderId) {
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'Failed',
      paymentError: paymentIntent.last_payment_error?.message,
    });

    logger.info(`Order ${orderId} marked as failed`);
  }
}

// Subscription Created
async function handleSubscriptionCreated(subscription) {
  logger.info(`Subscription created: ${subscription.id}`);

  await User.findOneAndUpdate(
    { stripeCustomerId: subscription.customer },
    {
      'subscription.id': subscription.id,
      'subscription.status': subscription.status,
      'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
      'subscription.plan': subscription.items.data[0].price.id,
    }
  );
}

// Subscription Updated
async function handleSubscriptionUpdated(subscription) {
  logger.info(`Subscription updated: ${subscription.id}`);

  await User.findOneAndUpdate(
    { stripeCustomerId: subscription.customer },
    {
      'subscription.status': subscription.status,
      'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
    }
  );
}

// Subscription Deleted
async function handleSubscriptionDeleted(subscription) {
  logger.info(`Subscription deleted: ${subscription.id}`);

  await User.findOneAndUpdate(
    { stripeCustomerId: subscription.customer },
    {
      'subscription.status': 'canceled',
      'subscription.canceledAt': new Date(),
    }
  );
}

// Invoice Paid
async function handleInvoicePaid(invoice) {
  logger.info(`Invoice paid: ${invoice.id}`);
  
  // Update subscription billing
  await User.findOneAndUpdate(
    { stripeCustomerId: invoice.customer },
    {
      'subscription.lastInvoiceId': invoice.id,
      'subscription.lastInvoiceDate': new Date(invoice.created * 1000),
    }
  );
}

// Invoice Payment Failed
async function handleInvoicePaymentFailed(invoice) {
  logger.warn(`Invoice payment failed: ${invoice.id}`);

  const user = await User.findOne({ stripeCustomerId: invoice.customer });
  
  if (user) {
    // Send payment failed email
    logger.warn(`Payment failed for user ${user.email}`);
    // TODO: Send email notification
  }
}

module.exports = router;
```

Suite dans le prochain fichier avec Firebase Push Notifications, Monitoring et CI/CD ! 🚀
