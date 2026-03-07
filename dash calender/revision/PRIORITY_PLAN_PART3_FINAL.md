# 🎯 FootballHub+ - PRIORITÉS 3 & 4 (FINAL)

## 🟢 PRIORITÉ 3 - 2-3 MOIS (90 JOURS)

### Objectif : Mobile Native + IA + Performance

---

### 📅 MOIS 1 : APPLICATION MOBILE (Android + iOS)

#### ✅ Configuration Capacitor Complète

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios

# Initialize Capacitor
npx cap init FootballHub ma.footballhub.app

# Install plugins
npm install @capacitor/camera
npm install @capacitor/push-notifications
npm install @capacitor/haptics
npm install @capacitor/share
npm install @capacitor/geolocation
npm install @capacitor/app
```

```typescript
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ma.footballhub.app',
  appName: 'FootballHub+',
  webDir: 'out', // Next.js static export
  server: {
    androidScheme: 'https',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#F9D406',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#1A1915',
    },
  },
};

export default config;
```

#### QR Scanner (Camera Plugin)

```typescript
// mobile/components/QRScanner.tsx
import React, { useState } from 'react';
import { Camera, CameraResultType } from '@capacitor/camera';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

export const QRScanner: React.FC<{
  onScan: (code: string) => void;
}> = ({ onScan }) => {
  const [scanning, setScanning] = useState(false);

  const startScan = async () => {
    // Request camera permission
    const permission = await BarcodeScanner.checkPermission({ force: true });

    if (!permission.granted) {
      alert('Camera permission denied');
      return;
    }

    // Start scanning
    setScanning(true);
    BarcodeScanner.hideBackground();

    const result = await BarcodeScanner.startScan();

    if (result.hasContent) {
      onScan(result.content!);
    }

    // Stop scanning
    setScanning(false);
    BarcodeScanner.showBackground();
  };

  const stopScan = () => {
    BarcodeScanner.stopScan();
    BarcodeScanner.showBackground();
    setScanning(false);
  };

  return (
    <div className="relative">
      {!scanning ? (
        <button
          onClick={startScan}
          className="w-full py-4 bg-primary text-black font-bold rounded-xl"
        >
          📷 Scan Ticket
        </button>
      ) : (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
          <div className="w-64 h-64 border-2 border-primary rounded-lg" />
          <p className="text-white mt-4">Align QR code within frame</p>
          <button
            onClick={stopScan}
            className="mt-8 px-6 py-3 bg-red-600 text-white rounded-lg"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};
```

#### Push Notifications Mobile

```typescript
// mobile/utils/pushNotifications.ts
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export const initPushNotifications = async () => {
  if (Capacitor.getPlatform() === 'web') {
    console.log('Push notifications not available on web');
    return;
  }

  // Request permission
  const permission = await PushNotifications.requestPermissions();

  if (permission.receive === 'granted') {
    // Register with Apple / Google to receive push
    await PushNotifications.register();
  }

  // On registration
  PushNotifications.addListener('registration', (token) => {
    console.log('Push registration success, token: ' + token.value);
    
    // Send token to server
    fetch('/api/notifications/register-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token.value }),
    });
  });

  // On registration error
  PushNotifications.addListener('registrationError', (error) => {
    console.error('Error on registration: ' + JSON.stringify(error));
  });

  // On push notification received
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push received: ' + JSON.stringify(notification));
  });

  // On push notification action
  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.log('Push action performed: ' + JSON.stringify(notification));
    
    // Navigate to appropriate screen
    const data = notification.notification.data;
    if (data.type === 'news') {
      window.location.href = `/news/${data.newsId}`;
    } else if (data.type === 'match') {
      window.location.href = `/matches/${data.matchId}`;
    }
  });
};
```

#### Build Scripts

```json
// package.json
{
  "scripts": {
    "build:mobile": "next build && next export",
    "cap:sync": "cap sync",
    "cap:android": "cap open android",
    "cap:ios": "cap open ios",
    "build:android": "npm run build:mobile && cap sync && cd android && ./gradlew assembleRelease",
    "build:ios": "npm run build:mobile && cap sync"
  }
}
```

---

### 📅 MOIS 2 : INTELLIGENCE ARTIFICIELLE

#### ✅ Integration Complète

```typescript
// Integration déjà créée dans les fichiers précédents!
// Voir: SUPABASE_LLM_INTEGRATION_PART*.md

// Résumé des features IA:
```

**1. Chat Assistant Football** ✅
- Multi-LLM (OpenAI, Claude, Gemini)
- RAG avec pgvector
- Context-aware responses

**2. Match Predictions** ✅
- Analyse tactique
- Probabilités de victoire
- Facteurs clés

**3. Live Commentary** ✅
- Commentaires automatiques
- Analyse en temps réel
- Insights tactiques

**4. Content Generation** ✅
- Résumés de matchs
- Biographies joueurs
- Traductions automatiques

**5. Support Bot** ✅
- Réponses instantanées
- Knowledge base
- Ticket routing

---

### 📅 MOIS 3 : PERFORMANCE & CACHE REDIS

#### ✅ Configuration Redis Avancée

```typescript
// server/src/config/redis-advanced.ts
import Redis from 'ioredis';

class RedisManager {
  private client: Redis;
  private subscriber: Redis;
  private publisher: Redis;

  constructor() {
    const config = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: 0,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    };

    this.client = new Redis(config);
    this.subscriber = new Redis(config);
    this.publisher = new Redis(config);
  }

  // Cache methods
  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setex(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  // Pub/Sub
  subscribe(channel: string, callback: (message: string) => void) {
    this.subscriber.subscribe(channel);
    this.subscriber.on('message', (ch, msg) => {
      if (ch === channel) callback(msg);
    });
  }

  publish(channel: string, message: string) {
    this.publisher.publish(channel, message);
  }

  // Advanced patterns
  async cacheAside<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = 3600
  ): Promise<T> {
    // Try cache first
    const cached = await this.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from source
    const data = await fetchFn();

    // Update cache
    await this.set(key, JSON.stringify(data), ttl);

    return data;
  }

  // Rate limiting
  async rateLimit(
    key: string,
    limit: number,
    window: number
  ): Promise<boolean> {
    const current = await this.client.incr(key);

    if (current === 1) {
      await this.client.expire(key, window);
    }

    return current <= limit;
  }

  // Leaderboard
  async addToLeaderboard(
    leaderboard: string,
    member: string,
    score: number
  ): Promise<void> {
    await this.client.zadd(leaderboard, score, member);
  }

  async getLeaderboard(
    leaderboard: string,
    start: number = 0,
    end: number = 9
  ): Promise<Array<{ member: string; score: number }>> {
    const results = await this.client.zrevrange(
      leaderboard,
      start,
      end,
      'WITHSCORES'
    );

    const leaderboardData = [];
    for (let i = 0; i < results.length; i += 2) {
      leaderboardData.push({
        member: results[i],
        score: parseInt(results[i + 1]),
      });
    }

    return leaderboardData;
  }
}

export const redisManager = new RedisManager();
```

---

## 🔵 PRIORITÉ 4 - 3-6 MOIS (180 JOURS)

### Objectif : Social + Marketplace + Analytics

---

### 📅 MOIS 1-2 : FONCTIONNALITÉS SOCIALES

#### ✅ Friends System

```typescript
// server/src/models/Friendship.ts
import mongoose from 'mongoose';

const friendshipSchema = new mongoose.Schema(
  {
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'blocked'],
      default: 'pending',
    },
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Ensure unique friendship (no duplicates)
friendshipSchema.index({ user1: 1, user2: 1 }, { unique: true });

export default mongoose.model('Friendship', friendshipSchema);
```

#### Social Feed

```typescript
// server/src/models/Post.ts
import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    images: [String],
    type: {
      type: String,
      enum: ['text', 'match_prediction', 'poll'],
      default: 'text',
    },
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        content: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    shares: {
      type: Number,
      default: 0,
    },
    visibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Post', postSchema);
```

---

### 📅 MOIS 3-4 : MARKETPLACE AVANCÉE

#### Product Reviews

```typescript
// server/src/models/Review.ts
import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    images: [String],
    verified: {
      type: Boolean,
      default: false, // True if user purchased the product
    },
    helpful: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Review', reviewSchema);
```

#### Wishlist

```typescript
// server/src/routes/wishlist.ts
import express from 'express';
import { authenticate } from '../middleware/auth';
import Wishlist from '../models/Wishlist';

const router = express.Router();

// Get wishlist
router.get('/', authenticate, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.userId })
      .populate('items.product');

    res.json({
      success: true,
      wishlist: wishlist || { items: [] },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Add to wishlist
router.post('/add', authenticate, async (req, res) => {
  try {
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ user: req.userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.userId,
        items: [{ product: productId }],
      });
    } else {
      // Check if already in wishlist
      const exists = wishlist.items.some(
        (item) => item.product.toString() === productId
      );

      if (!exists) {
        wishlist.items.push({ product: productId });
        await wishlist.save();
      }
    }

    res.json({
      success: true,
      wishlist,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
```

---

### 📅 MOIS 5-6 : ANALYTICS & BI

#### Analytics Dashboard

```typescript
// server/src/services/analyticsService.ts
import Order from '../models/Order';
import User from '../models/User';
import Event from '../models/Event';

class AnalyticsService {
  /**
   * Get revenue statistics
   */
  async getRevenueStats(startDate: Date, endDate: Date) {
    const revenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: 'Paid',
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return revenue;
  }

  /**
   * Get user growth
   */
  async getUserGrowth(startDate: Date, endDate: Date) {
    const users = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return users;
  }

  /**
   * Get top products
   */
  async getTopProducts(limit: number = 10) {
    const products = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          revenue: {
            $sum: { $multiply: ['$items.quantity', '$items.price'] },
          },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
    ]);

    return products;
  }

  /**
   * Get engagement metrics
   */
  async getEngagementMetrics() {
    const metrics = {
      activeUsers: await User.countDocuments({ lastLoginAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
      totalOrders: await Order.countDocuments(),
      avgOrderValue: 0,
      conversionRate: 0,
    };

    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          avgValue: { $avg: '$totalAmount' },
          total: { $sum: 1 },
        },
      },
    ]);

    if (orderStats.length > 0) {
      metrics.avgOrderValue = orderStats[0].avgValue;
    }

    const totalUsers = await User.countDocuments();
    metrics.conversionRate = (metrics.totalOrders / totalUsers) * 100;

    return metrics;
  }
}

export const analyticsService = new AnalyticsService();
```

---

## 📊 CHECKLISTS FINALES

### ✅ Priorité 3 (2-3 mois)

```
□ MOBILE
  □ Capacitor configuré
  □ Android build OK
  □ iOS build OK
  □ QR Scanner fonctionnel
  □ Push notifications
  □ Deep linking
  □ App store ready

□ INTELLIGENCE ARTIFICIELLE
  □ LLM Router intelligent
  □ Chat assistant
  □ Match predictions
  □ Content generation
  □ Support bot
  □ Analytics tracking

□ CACHE REDIS
  □ Redis cluster
  □ Cache-aside pattern
  □ Rate limiting
  □ Pub/Sub
  □ Leaderboards
  □ Session management
```

### ✅ Priorité 4 (3-6 mois)

```
□ SOCIAL
  □ Friends system
  □ Social feed
  □ Posts & comments
  □ Likes & shares
  □ Notifications
  □ Privacy settings

□ MARKETPLACE
  □ Product reviews
  □ Ratings
  □ Wishlist
  □ Recommendations
  □ Advanced search
  □ Promotions

□ ANALYTICS
  □ Revenue dashboard
  □ User growth
  □ Engagement metrics
  □ Top products
  □ Conversion tracking
  □ A/B testing
```

---

## 🎉 RÉSUMÉ COMPLET

### Timeline Total : 7-12 Mois

| Priorité | Durée | Features Clés |
|----------|-------|---------------|
| **P1** | 7 jours | Sécurité + Connexion + UI/UX |
| **P2** | 30 jours | Stripe + Billetterie + Admin |
| **P3** | 90 jours | Mobile + IA + Redis |
| **P4** | 180 jours | Social + Marketplace + Analytics |

### Ressources Estimées

- **Développeurs** : 2-3 full-time
- **Budget Infrastructure** : $800-1000/mois
- **Budget APIs** : $200-300/mois
- **Total** : ~$1300/mois

**ROADMAP COMPLET TERMINÉ ! 🚀**

FootballHub+ sera la plateforme football **la plus complète au monde** ! 🏆⚽
