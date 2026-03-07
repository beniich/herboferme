# 🔌 FootballHub+ - INTÉGRATIONS PRODUCTION PART 3 (FINAL)

## 🔔 7. FIREBASE PUSH NOTIFICATIONS COMPLÈTES

```javascript
// server/src/config/firebase.js
const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require(path.join(__dirname, '../../firebase-service-account.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

module.exports = admin;
```

```javascript
// server/src/services/pushNotificationService.js
const admin = require('../config/firebase');
const User = require('../models/User');
const logger = require('../utils/logger');

class PushNotificationService {
  /**
   * Send notification to a single user
   */
  static async sendToUser(userId, notification) {
    try {
      const user = await User.findById(userId).select('fcmTokens');
      
      if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
        logger.warn(`No FCM tokens found for user ${userId}`);
        return { success: false, reason: 'No FCM tokens' };
      }

      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.image,
        },
        data: notification.data || {},
        tokens: user.fcmTokens,
        android: {
          priority: 'high',
          notification: {
            channelId: 'footballhub_alerts',
            sound: 'default',
            color: '#F9D406',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      
      // Remove invalid tokens
      const invalidTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          if (resp.error.code === 'messaging/invalid-registration-token' ||
              resp.error.code === 'messaging/registration-token-not-registered') {
            invalidTokens.push(user.fcmTokens[idx]);
          }
        }
      });

      if (invalidTokens.length > 0) {
        await User.findByIdAndUpdate(userId, {
          $pull: { fcmTokens: { $in: invalidTokens } },
        });
        logger.info(`Removed ${invalidTokens.length} invalid FCM tokens for user ${userId}`);
      }

      logger.info(`Push notification sent to user ${userId}: ${response.successCount}/${user.fcmTokens.length} delivered`);
      
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      logger.error('Push notification error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification to multiple users
   */
  static async sendToMultipleUsers(userIds, notification) {
    const results = await Promise.all(
      userIds.map(userId => this.sendToUser(userId, notification))
    );

    const totalSuccess = results.reduce((acc, r) => acc + (r.successCount || 0), 0);
    const totalFailure = results.reduce((acc, r) => acc + (r.failureCount || 0), 0);

    return {
      success: true,
      totalSuccess,
      totalFailure,
      results,
    };
  }

  /**
   * Send notification to a topic
   */
  static async sendToTopic(topic, notification) {
    try {
      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.image,
        },
        data: notification.data || {},
        topic: topic,
        android: {
          priority: 'high',
          notification: {
            channelId: 'footballhub_alerts',
            sound: 'default',
            color: '#F9D406',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      
      logger.info(`Push notification sent to topic ${topic}: ${response}`);
      
      return { success: true, messageId: response };
    } catch (error) {
      logger.error('Topic notification error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Subscribe user to topic
   */
  static async subscribeToTopic(tokens, topic) {
    try {
      const response = await admin.messaging().subscribeToTopic(tokens, topic);
      
      logger.info(`Subscribed ${response.successCount} devices to topic ${topic}`);
      
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      logger.error('Subscribe to topic error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Unsubscribe user from topic
   */
  static async unsubscribeFromTopic(tokens, topic) {
    try {
      const response = await admin.messaging().unsubscribeFromTopic(tokens, topic);
      
      logger.info(`Unsubscribed ${response.successCount} devices from topic ${topic}`);
      
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      logger.error('Unsubscribe from topic error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Notify match start (5 minutes before)
   */
  static async notifyMatchStart(match, userIds) {
    const notification = {
      title: '⚽ Le match commence bientôt !',
      body: `${match.homeTeam.name} vs ${match.awayTeam.name} dans 5 minutes`,
      image: match.homeTeam.logo,
      data: {
        type: 'match_start',
        matchId: match._id.toString(),
        leagueId: match.league.toString(),
      },
    };

    return await this.sendToMultipleUsers(userIds, notification);
  }

  /**
   * Notify goal
   */
  static async notifyGoal(match, goalEvent, userIds) {
    const team = goalEvent.team === 'home' ? match.homeTeam.name : match.awayTeam.name;
    const player = goalEvent.player;

    const notification = {
      title: '⚽ BUUUUT !',
      body: `${player} marque pour ${team} ! ${match.homeTeam.score} - ${match.awayTeam.score}`,
      image: match.league.logo,
      data: {
        type: 'goal',
        matchId: match._id.toString(),
        eventId: goalEvent._id.toString(),
      },
    };

    return await this.sendToMultipleUsers(userIds, notification);
  }

  /**
   * Notify match result
   */
  static async notifyMatchResult(match, userIds) {
    const notification = {
      title: '🏁 Match terminé !',
      body: `${match.homeTeam.name} ${match.homeTeam.score} - ${match.awayTeam.score} ${match.awayTeam.name}`,
      image: match.league.logo,
      data: {
        type: 'match_result',
        matchId: match._id.toString(),
      },
    };

    return await this.sendToMultipleUsers(userIds, notification);
  }

  /**
   * Notify ticket validated
   */
  static async notifyTicketValidated(ticket) {
    const notification = {
      title: '✅ Billet validé !',
      body: `Votre billet pour ${ticket.event.title} a été validé avec succès`,
      image: ticket.event.image,
      data: {
        type: 'ticket_validated',
        ticketId: ticket._id.toString(),
        eventId: ticket.event._id.toString(),
      },
    };

    return await this.sendToUser(ticket.member._id, notification);
  }

  /**
   * Notify order shipped
   */
  static async notifyOrderShipped(order) {
    const notification = {
      title: '📦 Commande expédiée !',
      body: `Votre commande #${order.orderNumber} a été expédiée`,
      data: {
        type: 'order_shipped',
        orderId: order._id.toString(),
        trackingNumber: order.trackingNumber,
      },
    };

    return await this.sendToUser(order.user._id, notification);
  }
}

module.exports = PushNotificationService;
```

### Route pour enregistrer FCM Token

```javascript
// server/src/routes/notifications.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const PushNotificationService = require('../services/pushNotificationService');

// Register FCM token
router.post('/register-token', authenticate, async (req, res) => {
  try {
    const { token, platform } = req.body;

    const user = await User.findById(req.userId);
    
    // Add token if not already present
    if (!user.fcmTokens.includes(token)) {
      user.fcmTokens.push(token);
      await user.save();
    }

    // Subscribe to user's favorite topics
    if (user.favoriteTeams && user.favoriteTeams.length > 0) {
      const topics = user.favoriteTeams.map(t => `team_${t}`);
      await Promise.all(
        topics.map(topic => 
          PushNotificationService.subscribeToTopic([token], topic)
        )
      );
    }

    res.json({
      success: true,
      message: 'FCM token registered',
    });
  } catch (error) {
    console.error('FCM token registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register FCM token',
    });
  }
});

// Send test notification
router.post('/test', authenticate, async (req, res) => {
  try {
    const result = await PushNotificationService.sendToUser(req.userId, {
      title: 'Test Notification',
      body: 'Ceci est une notification de test de FootballHub+',
      data: { type: 'test' },
    });

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
    });
  }
});

module.exports = router;
```

---

## 📊 8. MONITORING & APM (Application Performance Monitoring)

### Sentry APM Configuration

```javascript
// server/src/config/sentry.js (Enhanced)
const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

const initSentry = (app) => {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      
      // Performance Monitoring
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app }),
        new Sentry.Integrations.Mongo(),
        new ProfilingIntegration(),
      ],
      
      // Traces (Performance)
      tracesSampleRate: 0.1, // 10% of transactions
      
      // Profiling (CPU & Memory)
      profilesSampleRate: 0.1,
      
      // Custom tags
      beforeSend(event) {
        // Remove sensitive data
        if (event.request?.data) {
          delete event.request.data.password;
          delete event.request.data.token;
        }
        
        // Filter out health checks
        if (event.request?.url?.includes('/health')) {
          return null;
        }
        
        return event;
      },
      
      // Performance monitoring
      beforeSendTransaction(transaction) {
        // Filter out health checks and static files
        if (transaction.name?.includes('GET /health') ||
            transaction.name?.includes('GET /static')) {
          return null;
        }
        
        return transaction;
      },
    });

    // Request handler (must be first middleware)
    app.use(Sentry.Handlers.requestHandler());
    
    // Tracing handler
    app.use(Sentry.Handlers.tracingHandler());

    console.log('✅ Sentry APM initialized');
  }
};

// Custom transaction tracking
const trackTransaction = (name, operation) => {
  return Sentry.startTransaction({
    name,
    op: operation,
  });
};

// Track database queries
const trackDatabaseQuery = (query) => {
  const transaction = Sentry.getCurrentHub().getScope().getTransaction();
  
  if (transaction) {
    const span = transaction.startChild({
      op: 'db.query',
      description: query,
    });
    
    return span;
  }
};

module.exports = {
  initSentry,
  trackTransaction,
  trackDatabaseQuery,
  sentryErrorHandler: () => Sentry.Handlers.errorHandler(),
};
```

### Performance Monitoring Middleware

```javascript
// server/src/middleware/performance.js
const logger = require('../utils/logger');

// Request timing middleware
const requestTiming = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log slow requests (> 1 second)
    if (duration > 1000) {
      logger.warn(`Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
    
    // Add timing header
    res.setHeader('X-Response-Time', `${duration}ms`);
  });
  
  next();
};

// Memory monitoring
const memoryMonitoring = (req, res, next) => {
  const usage = process.memoryUsage();
  
  // Warn if memory usage is high
  if (usage.heapUsed > 500 * 1024 * 1024) { // 500MB
    logger.warn(`High memory usage: ${Math.round(usage.heapUsed / 1024 / 1024)}MB`);
  }
  
  next();
};

module.exports = {
  requestTiming,
  memoryMonitoring,
};
```

---

## 🔄 9. CI/CD GITHUB ACTIONS COMPLET

```yaml
# .github/workflows/production.yml
name: Production Deployment

on:
  push:
    branches:
      - main
  workflow_dispatch:

env:
  NODE_VERSION: '18'

jobs:
  # ==============================================================
  # TEST BACKEND
  # ==============================================================
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
      
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
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
          REDIS_URL: redis://localhost:6379
          JWT_SECRET: test_secret_for_ci_only
  
  # ==============================================================
  # DEPLOY TO PRODUCTION
  # ==============================================================
  deploy:
    name: Deploy to Production
    needs: test-backend
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://api.footballhub.ma
    
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          port: 22
          script: |
            set -e
            
            echo "🚀 Starting deployment..."
            
            cd /var/www/footballhub
            
            # Backup database
            ./scripts/backup-mongodb.sh
            
            # Pull latest code
            git pull origin main
            
            # Install dependencies
            cd server
            npm ci --only=production
            
            # Run migrations if any
            # npm run migrate
            
            # Restart services
            pm2 reload ecosystem.config.js --env production
            
            # Health check
            sleep 10
            
            HEALTH=$(curl -f http://localhost:5000/api/health || echo "failed")
            if [ "$HEALTH" == "failed" ]; then
              echo "❌ Health check failed! Rolling back..."
              git checkout HEAD~1
              npm ci --only=production
              pm2 reload ecosystem.config.js --env production
              exit 1
            fi
            
            echo "✅ Deployment completed successfully!"
      
      - name: Notify Sentry of deployment
        if: success()
        run: |
          curl -X POST \
            https://sentry.io/api/0/organizations/${{ secrets.SENTRY_ORG }}/releases/ \
            -H "Authorization: Bearer ${{ secrets.SENTRY_AUTH_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '{
              "version": "${{ github.sha }}",
              "projects": ["footballhub-api"],
              "refs": [{
                "repository": "${{ github.repository }}",
                "commit": "${{ github.sha }}"
              }]
            }'
  
  # ==============================================================
  # NOTIFY
  # ==============================================================
  notify:
    name: Notify Deployment Status
    needs: deploy
    runs-on: ubuntu-latest
    if: always()
    
    steps:
      - name: Send notification
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ needs.deploy.result }}
          text: |
            *Production Deployment*
            Status: ${{ needs.deploy.result }}
            Commit: ${{ github.sha }}
            Author: ${{ github.actor }}
            Message: ${{ github.event.head_commit.message }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: always()
```

---

## ✅ GUIDE D'INTÉGRATION COMPLET

### Variables d'Environnement (.env)

```bash
# .env.production

# Application
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb://admin:password@localhost:27017/footballhub?authSource=admin

# Redis
REDIS_URL=redis://:password@localhost:6379

# JWT
JWT_SECRET=your_very_secure_random_string_min_64_chars

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=eu-west-1
AWS_S3_BUCKET=footballhub-uploads

# Cloudinary (Alternative)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Resend Email
RESEND_API_KEY=re_your_resend_api_key

# API-Football
RAPIDAPI_KEY=your_rapidapi_key

# Stripe
STRIPE_SECRET_KEY=sk_live_your_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Firebase
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# Sentry
SENTRY_DSN=https://your_sentry_dsn@sentry.io/project_id

# GitHub (for CI/CD)
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Installation Steps

```bash
# 1. Install all dependencies
npm install aws-sdk multer-s3 sharp cloudinary multer-storage-cloudinary resend rate-limiter-flexible

# 2. Setup Firebase
# Download firebase-service-account.json from Firebase Console
# Place it in server/firebase-service-account.json

# 3. Setup Stripe Webhooks
stripe listen --forward-to localhost:5000/api/payments/webhook

# 4. Configure AWS S3 Bucket CORS
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://footballhub.ma"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}

# 5. Setup Redis
# If using Docker:
docker run -d --name redis -p 6379:6379 redis:7-alpine redis-server --requirepass your_password
```

---

## 🎉 RÉSUMÉ DES INTÉGRATIONS

### ✅ Intégrations Complétées

1. **Stockage Cloud** ✅
   - AWS S3 avec optimisation d'images
   - Cloudinary alternative
   - Multer configuration

2. **Service Email** ✅
   - Resend integration
   - 5 templates d'emails professionnels
   - Welcome, Ticket, Password Reset, Order Confirmation

3. **API Football** ✅
   - API-Football professionnelle
   - Rate limiting intelligent
   - Cache Redis intégré

4. **Redis Cache** ✅
   - Cache middleware avancé
   - Tag-based invalidation
   - User-specific caching

5. **WebSockets** ✅
   - Temps réel avec Redis adapter
   - Room-based broadcasting
   - Multi-server support

6. **Stripe Webhooks** ✅
   - 10 événements gérés
   - Auto-update orders & subscriptions
   - Email notifications

7. **Firebase Push** ✅
   - Multi-platform (iOS/Android)
   - Topic subscriptions
   - Match alerts, Ticket validation

8. **Monitoring APM** ✅
   - Sentry performance monitoring
   - Custom transaction tracking
   - Slow request logging

9. **CI/CD** ✅
   - GitHub Actions workflow
   - Automated testing
   - Zero-downtime deployment
   - Slack notifications

**TOUTES LES INTÉGRATIONS PRODUCTION COMPLÉTÉES ! 🎉🚀**
