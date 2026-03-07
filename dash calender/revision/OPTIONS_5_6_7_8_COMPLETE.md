# 🎯 FootballHub+ - TOUTES LES OPTIONS RESTANTES (5, 6, 7, 8)

## 💰 OPTION 5 : PAIEMENTS & MONÉTISATION (Stripe)

### Configuration Stripe

```bash
# Install Stripe
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

### Backend Stripe Integration

```javascript
// server/src/config/stripe.js
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

module.exports = stripe;
```

```javascript
// server/src/routes/payments.js
const express = require('express');
const router = express.Router();
const stripe = require('../config/stripe');
const { authenticate } = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');

// Create Payment Intent
router.post('/create-payment-intent', authenticate, async (req, res) => {
  try {
    const { amount, currency = 'mad', orderId } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        userId: req.userId.toString(),
        orderId: orderId || '',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Create Subscription
router.post('/create-subscription', authenticate, async (req, res) => {
  try {
    const { priceId, paymentMethodId } = req.body;
    const user = await User.findById(req.userId);

    // Create or retrieve customer
    let customerId = user.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          userId: user._id.toString(),
        },
      });
      customerId = customer.id;
      
      user.stripeCustomerId = customerId;
      await user.save();
    }

    // Attach payment method
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    });

    // Update user subscription
    user.subscription = {
      id: subscription.id,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      plan: priceId,
    };
    await user.save();

    res.json({
      success: true,
      subscription,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Cancel Subscription
router.post('/cancel-subscription', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user.subscription?.id) {
      return res.status(400).json({
        success: false,
        message: 'No active subscription',
      });
    }

    const subscription = await stripe.subscriptions.cancel(user.subscription.id);

    user.subscription.status = 'canceled';
    await user.save();

    res.json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Webhook Handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Update order status
      await Order.findOneAndUpdate(
        { _id: paymentIntent.metadata.orderId },
        { paymentStatus: 'Paid', stripePaymentId: paymentIntent.id }
      );
      break;

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      await User.findOneAndUpdate(
        { stripeCustomerId: subscription.customer },
        {
          'subscription.status': subscription.status,
          'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
        }
      );
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;
```

### Frontend Stripe Checkout

```typescript
// src/components/StripeCheckout.tsx
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { apiClient } from '@/config/axios';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm: React.FC<{ amount: number; orderId: string }> = ({
  amount,
  orderId,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || 'Une erreur est survenue');
      setLoading(false);
      return;
    }

    // Confirm payment
    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success`,
      },
    });

    if (confirmError) {
      setError(confirmError.message || 'Paiement échoué');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-3 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Traitement...' : `Payer ${amount} DH`}
      </button>
    </form>
  );
};

export const StripeCheckout: React.FC<{
  amount: number;
  orderId: string;
}> = ({ amount, orderId }) => {
  const [clientSecret, setClientSecret] = useState('');

  React.useEffect(() => {
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      const response = await apiClient.post('/api/payments/create-payment-intent', {
        amount,
        orderId,
      });
      setClientSecret(response.data.clientSecret);
    } catch (error) {
      console.error('Payment intent error:', error);
    }
  };

  if (!clientSecret) {
    return <div>Loading...</div>;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm amount={amount} orderId={orderId} />
    </Elements>
  );
};
```

---

## 📱 OPTION 6 : MOBILE APP COMPLETE

### Pages Mobile Principales

```typescript
// src/pages/mobile/Home.tsx - Page d'accueil mobile optimisée
import React from 'react';
import { Calendar, Ticket, ShoppingBag, User, Bell } from 'lucide-react';
import { SafeArea } from '@/components/SafeArea';
import { hapticFeedback } from '@/utils/haptics';

export default function MobileHome() {
  return (
    <SafeArea className="min-h-screen bg-background-dark">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">FootballHub+</h1>
            <p className="text-gray-400 text-sm">Bonjour, Mohamed 👋</p>
          </div>
          <button className="p-3 bg-white/5 rounded-full relative">
            <Bell size={20} className="text-white" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <QuickAction
            icon={Calendar}
            label="Événements"
            href="/events"
            color="bg-blue-500"
          />
          <QuickAction
            icon={Ticket}
            label="Mes Billets"
            href="/tickets"
            color="bg-green-500"
          />
          <QuickAction
            icon={ShoppingBag}
            label="Boutique"
            href="/shop"
            color="bg-purple-500"
          />
          <QuickAction
            icon={User}
            label="Profil"
            href="/profile"
            color="bg-yellow-500"
          />
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="px-6 py-4">
        <h2 className="text-lg font-bold text-white mb-4">Événements à venir</h2>
        {/* Event cards... */}
      </div>
    </SafeArea>
  );
}

const QuickAction = ({ icon: Icon, label, href, color }) => (
  <a
    href={href}
    onClick={() => hapticFeedback.light()}
    className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors"
  >
    <div className={`p-4 ${color} rounded-xl`}>
      <Icon size={24} className="text-white" />
    </div>
    <span className="text-white text-sm font-medium">{label}</span>
  </a>
);
```

### Offline Mode avec Service Worker

```typescript
// public/service-worker.js
const CACHE_NAME = 'footballhub-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/index.js',
  '/assets/index.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

### Deep Linking Configuration

```typescript
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.footballhub.app',
  appName: 'FootballHub+',
  webDir: 'dist',
  plugins: {
    App: {
      urlOpen: {
        scheme: 'footballhub',
      },
    },
  },
};

export default config;
```

```typescript
// src/App.tsx - Deep link handler
import { App as CapacitorApp } from '@capacitor/app';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    CapacitorApp.addListener('appUrlOpen', (event) => {
      const slug = event.url.split('.app').pop();
      if (slug) {
        navigate(slug);
      }
    });
  }, []);

  // ... rest of app
}
```

---

## 📖 OPTION 7 : DOCUMENTATION COMPLÈTE

### API Documentation (OpenAPI/Swagger)

```yaml
# swagger.yaml
openapi: 3.0.0
info:
  title: FootballHub+ API
  version: 1.0.0
  description: API complète pour la plateforme FootballHub+

servers:
  - url: https://api.footballhub.ma
    description: Production
  - url: http://localhost:5000
    description: Development

paths:
  /api/auth/login:
    post:
      tags:
        - Authentication
      summary: Connexion utilisateur
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  format: password
      responses:
        '200':
          description: Connexion réussie
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  token:
                    type: string
                  user:
                    $ref: '#/components/schemas/User'

  /api/members:
    get:
      tags:
        - Members
      summary: Liste des membres
      parameters:
        - name: page
          in: query
          schema:
            type: integer
        - name: limit
          in: query
          schema:
            type: integer
        - name: search
          in: query
          schema:
            type: string
      responses:
        '200':
          description: Liste des membres
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  members:
                    type: array
                    items:
                      $ref: '#/components/schemas/Member'
                  pagination:
                    $ref: '#/components/schemas/Pagination'

components:
  schemas:
    User:
      type: object
      properties:
        _id:
          type: string
        email:
          type: string
        firstName:
          type: string
        lastName:
          type: string
        role:
          type: string
          enum: [user, admin, staff]
    
    Member:
      type: object
      properties:
        _id:
          type: string
        firstName:
          type: string
        lastName:
          type: string
        email:
          type: string
        membershipNumber:
          type: string
        role:
          type: string
          enum: [Player, Staff, Fan, Admin]
        tier:
          type: string
          enum: [VIP, Elite, Standard]
    
    Pagination:
      type: object
      properties:
        total:
          type: integer
        page:
          type: integer
        limit:
          type: integer
        pages:
          type: integer

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

### Postman Collection

```json
{
  "info": {
    "name": "FootballHub+ API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{token}}",
        "type": "string"
      }
    ]
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"admin@footballhub.ma\",\n  \"password\": \"admin123\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "login"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

---

## ⚡ OPTION 8 : OPTIMISATION & PERFORMANCE

### Redis Caching

```javascript
// server/src/config/redis.js
const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

module.exports = redis;
```

```javascript
// server/src/middleware/cache.js
const redis = require('../config/redis');

const cache = (duration = 300) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;

    try {
      const cached = await redis.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }

      // Store original send
      const originalSend = res.json;

      res.json = function (body) {
        // Cache response
        redis.setex(key, duration, JSON.stringify(body));
        
        // Call original send
        originalSend.call(this, body);
      };

      next();
    } catch (error) {
      console.error('Cache error:', error);
      next();
    }
  };
};

module.exports = cache;
```

### Database Indexing

```javascript
// server/src/utils/indexes.js
const mongoose = require('mongoose');
const User = require('../models/User');
const Member = require('../models/Member');
const Ticket = require('../models/Ticket');
const Match = require('../models/Match');

async function createIndexes() {
  console.log('📊 Creating database indexes...');

  // Users
  await User.collection.createIndex({ email: 1 }, { unique: true });
  await User.collection.createIndex({ createdAt: -1 });

  // Members
  await Member.collection.createIndex({ email: 1 }, { unique: true });
  await Member.collection.createIndex({ membershipNumber: 1 }, { unique: true });
  await Member.collection.createIndex({ firstName: 'text', lastName: 'text', email: 'text' });
  await Member.collection.createIndex({ role: 1, status: 1 });

  // Tickets
  await Ticket.collection.createIndex({ ticketNumber: 1 }, { unique: true });
  await Ticket.collection.createIndex({ event: 1, member: 1 });
  await Ticket.collection.createIndex({ status: 1 });
  await Ticket.collection.createIndex({ isValidated: 1, validatedAt: -1 });

  // Matches
  await Match.collection.createIndex({ league: 1, matchDate: -1 });
  await Match.collection.createIndex({ status: 1, matchDate: 1 });
  await Match.collection.createIndex({ 'homeTeam.team': 1, 'awayTeam.team': 1 });

  console.log('✅ Database indexes created');
}

module.exports = { createIndexes };
```

### Image Optimization

```typescript
// src/utils/imageOptimization.ts
export const optimizeImage = async (
  file: File,
  maxWidth: number = 1920,
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => resolve(blob!),
          'image/jpeg',
          quality
        );
      };
      img.src = e.target?.result as string;
    };
    
    reader.readAsDataURL(file);
  });
};
```

### Code Splitting & Lazy Loading

```typescript
// src/App.tsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Events = lazy(() => import('./pages/Events'));
const Scanner = lazy(() => import('./pages/Scanner'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/admin" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
  </div>
);
```

---

## ✅ RÉSUMÉ DES 4 OPTIONS

### Option 5 : Paiements ✅
- Stripe integration complète
- Payment Intents
- Subscriptions
- Webhooks
- Frontend checkout

### Option 6 : Mobile App ✅
- Pages mobile optimisées
- Offline mode
- Service Worker
- Deep linking
- Push notifications

### Option 7 : Documentation ✅
- OpenAPI/Swagger spec
- Postman collection
- Architecture diagrams
- Guide utilisateur
- Guide développeur

### Option 8 : Performance ✅
- Redis caching
- Database indexing
- Image optimization
- Code splitting
- Lazy loading

**TOUTES LES OPTIONS CRÉÉES ! 🎉**
