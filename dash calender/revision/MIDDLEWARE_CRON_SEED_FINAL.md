# 🛡️ FootballHub+ - MIDDLEWARE + CRON + SEED DATA (FINAL)

## 1. Middleware d'Authentification

```javascript
// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authenticate user with JWT
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

// Check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Optional authentication (user can be null)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (user && user.isActive) {
        req.user = user;
        req.userId = user._id;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  authenticate,
  requireAdmin,
  optionalAuth,
};
```

## 2. Middleware de Validation

```javascript
// src/middleware/validation.js
const Joi = require('joi');

// Validate request body against schema
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }

    req.validatedBody = value;
    next();
  };
};

// Common validation schemas
const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phone: Joi.string().optional(),
    country: Joi.string().optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  createMember: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().optional(),
    role: Joi.string().valid('Player', 'Staff', 'Fan', 'Admin').default('Fan'),
    tier: Joi.string().valid('VIP', 'Elite', 'Standard').default('Standard'),
  }),

  createEvent: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().optional(),
    category: Joi.string().valid('Match', 'Training', 'Tournament', 'Meeting', 'Other').required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().optional(),
    venue: Joi.object({
      name: Joi.string().required(),
      address: Joi.string().optional(),
      city: Joi.string().optional(),
      capacity: Joi.number().optional(),
    }).optional(),
    capacity: Joi.number().optional(),
    ticketPrice: Joi.number().optional(),
  }),

  createProduct: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().optional(),
    category: Joi.string().valid('Jersey', 'Training', 'Accessories', 'Memorabilia', 'Equipment').required(),
    price: Joi.number().min(0).required(),
    stock: Joi.number().min(0).default(0),
    images: Joi.array().items(Joi.string()).optional(),
  }),

  createOrder: Joi.object({
    memberId: Joi.string().required(),
    items: Joi.array().items(
      Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().min(1).required(),
        size: Joi.string().optional(),
        color: Joi.string().optional(),
      })
    ).min(1).required(),
    shippingAddress: Joi.object({
      fullName: Joi.string().required(),
      phone: Joi.string().required(),
      address: Joi.string().required(),
      city: Joi.string().required(),
      postalCode: Joi.string().required(),
      country: Joi.string().required(),
    }).required(),
    paymentMethod: Joi.string().required(),
  }),
};

module.exports = {
  validate,
  schemas,
};
```

## 3. Middleware de Gestion d'Erreurs

```javascript
// src/middleware/errorHandler.js

// Not Found handler (404)
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err,
    }),
  });
};

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Custom error classes
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

class AuthenticationError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
  }
}

class AuthorizationError extends Error {
  constructor(message = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = 403;
  }
}

class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

module.exports = {
  notFound,
  errorHandler,
  asyncHandler,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
};
```

## 4. CRON Jobs (Tâches Automatisées)

```javascript
// src/jobs/cronJobs.js
const cron = require('node-cron');
const syncService = require('../services/syncService');
const Match = require('../models/Match');

class CronJobs {
  constructor() {
    this.jobs = [];
  }

  // ============================================================
  // INITIALIZE ALL CRON JOBS
  // ============================================================

  initializeJobs() {
    console.log('⏰ Initializing CRON jobs...');

    // 1. LIVE MATCHES - Every 30 seconds
    this.jobs.push(
      cron.schedule('*/30 * * * * *', async () => {
        try {
          const count = await syncService.syncLiveMatches();
          if (count > 0) {
            console.log(`⚡ Live update: ${count} matches`);
          }
        } catch (error) {
          console.error('Live matches CRON error:', error.message);
        }
      })
    );

    // 2. UPCOMING MATCHES - Every 15 minutes
    this.jobs.push(
      cron.schedule('*/15 * * * *', async () => {
        try {
          console.log('🔄 Updating upcoming matches...');
          await syncService.syncFeaturedMatches();
        } catch (error) {
          console.error('Upcoming matches CRON error:', error.message);
        }
      })
    );

    // 3. STANDINGS - Daily at 2 AM
    this.jobs.push(
      cron.schedule('0 2 * * *', async () => {
        try {
          console.log('📊 Daily standings update...');
          await syncService.syncFeaturedStandings();
        } catch (error) {
          console.error('Standings CRON error:', error.message);
        }
      })
    );

    // 4. LEAGUES REFRESH - Weekly on Monday at 3 AM
    this.jobs.push(
      cron.schedule('0 3 * * 1', async () => {
        try {
          console.log('🔄 Weekly leagues refresh...');
          await syncService.syncFeaturedLeagues();
        } catch (error) {
          console.error('Leagues CRON error:', error.message);
        }
      })
    );

    // 5. FULL SYNC - Weekly on Sunday at 4 AM
    this.jobs.push(
      cron.schedule('0 4 * * 0', async () => {
        try {
          console.log('🚀 Weekly full sync...');
          await syncService.fullSync();
        } catch (error) {
          console.error('Full sync CRON error:', error.message);
        }
      })
    );

    // 6. CLEANUP OLD MATCHES - Daily at 5 AM
    this.jobs.push(
      cron.schedule('0 5 * * *', async () => {
        try {
          console.log('🗑️  Cleaning old matches...');
          await this.cleanupOldMatches();
        } catch (error) {
          console.error('Cleanup CRON error:', error.message);
        }
      })
    );

    console.log(`✅ ${this.jobs.length} CRON jobs initialized`);
  }

  // ============================================================
  // CLEANUP OLD MATCHES
  // ============================================================

  async cleanupOldMatches() {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const result = await Match.deleteMany({
      matchDate: { $lt: ninetyDaysAgo },
      status: 'FINISHED',
    });

    console.log(`🗑️  Deleted ${result.deletedCount} old matches`);
  }

  // ============================================================
  // STOP ALL JOBS
  // ============================================================

  stopAllJobs() {
    console.log('⏸️  Stopping all CRON jobs...');
    this.jobs.forEach((job) => job.stop());
    console.log('✅ All CRON jobs stopped');
  }

  // ============================================================
  // GET JOBS STATUS
  // ============================================================

  getJobsStatus() {
    return {
      totalJobs: this.jobs.length,
      jobs: [
        { name: 'Live Matches', schedule: 'Every 30 seconds', active: true },
        { name: 'Upcoming Matches', schedule: 'Every 15 minutes', active: true },
        { name: 'Standings', schedule: 'Daily at 2 AM', active: true },
        { name: 'Leagues Refresh', schedule: 'Weekly Monday 3 AM', active: true },
        { name: 'Full Sync', schedule: 'Weekly Sunday 4 AM', active: true },
        { name: 'Cleanup', schedule: 'Daily at 5 AM', active: true },
      ],
    };
  }
}

module.exports = new CronJobs();
```

## 5. Seed Data (Données de Test Marocaines)

```javascript
// src/seeds/index.js
require('dotenv').config();
const mongoose = require('mongoose');
const Member = require('../models/Member');
const Event = require('../models/Event');
const Product = require('../models/Product');
const Ticket = require('../models/Ticket');
const User = require('../models/User');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/footballhub', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Member.deleteMany({});
    await Event.deleteMany({});
    await Product.deleteMany({});
    await Ticket.deleteMany({});
    await User.deleteMany({});

    // ============================================================
    // CREATE ADMIN USER
    // ============================================================

    const adminUser = await User.create({
      email: 'admin@footballhub.ma',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'FootballHub',
      role: 'admin',
      country: 'Morocco',
      city: 'Casablanca',
      isEmailVerified: true,
    });

    console.log('✅ Admin user created');

    // ============================================================
    // CREATE MEMBERS (Moroccan Names)
    // ============================================================

    const members = await Member.create([
      {
        firstName: 'Youssef',
        lastName: 'Benali',
        email: 'youssef.benali@email.ma',
        phone: '+212 6 12 34 56 78',
        role: 'Player',
        tier: 'VIP',
        status: 'Active',
        city: 'Casablanca',
        country: 'Morocco',
        dateOfBirth: new Date('1995-03-15'),
      },
      {
        firstName: 'Fatima',
        lastName: 'Zahra',
        email: 'fatima.zahra@email.ma',
        phone: '+212 6 98 76 54 32',
        role: 'Fan',
        tier: 'Elite',
        status: 'Active',
        city: 'Rabat',
        country: 'Morocco',
        dateOfBirth: new Date('1998-07-22'),
      },
      {
        firstName: 'Mohamed',
        lastName: 'Alami',
        email: 'mohamed.alami@email.ma',
        phone: '+212 6 55 44 33 22',
        role: 'Staff',
        tier: 'Standard',
        status: 'Active',
        city: 'Marrakech',
        country: 'Morocco',
        dateOfBirth: new Date('1990-11-08'),
      },
    ]);

    console.log(`✅ Created ${members.length} members`);

    // ============================================================
    // CREATE EVENTS
    // ============================================================

    const events = await Event.create([
      {
        title: 'Match Raja vs Wydad - Derby Casablancais',
        description: 'Le grand derby de Casablanca au Stade Mohammed V',
        category: 'Match',
        startDate: new Date('2024-12-15T20:00:00'),
        venue: {
          name: 'Stade Mohammed V',
          address: 'Boulevard Ziraoui',
          city: 'Casablanca',
          capacity: 67000,
        },
        capacity: 50000,
        ticketPrice: 150,
        status: 'Published',
        isFeatured: true,
        organizer: adminUser._id,
        tags: ['Derby', 'Botola', 'Raja', 'Wydad'],
      },
      {
        title: 'Tournoi de Football Junior',
        description: 'Tournoi pour les jeunes de 12-16 ans',
        category: 'Tournament',
        startDate: new Date('2024-12-20T14:00:00'),
        endDate: new Date('2024-12-22T18:00:00'),
        venue: {
          name: 'Complexe Sportif Moulay Abdallah',
          city: 'Rabat',
          capacity: 5000,
        },
        capacity: 200,
        ticketPrice: 50,
        status: 'Published',
        organizer: adminUser._id,
        tags: ['Junior', 'Formation', 'Tournoi'],
      },
    ]);

    console.log(`✅ Created ${events.length} events`);

    // ============================================================
    // CREATE PRODUCTS (Moroccan Teams)
    // ============================================================

    const products = await Product.create([
      {
        name: 'Maillot Raja Casablanca 2024/25 - Domicile',
        description: 'Maillot officiel du Raja Athletic Club saison 2024/25',
        category: 'Jersey',
        price: 450,
        comparePrice: 550,
        stock: 100,
        images: ['/images/products/raja-home-jersey.jpg'],
        sizes: [
          { size: 'S', stock: 20 },
          { size: 'M', stock: 30 },
          { size: 'L', stock: 30 },
          { size: 'XL', stock: 20 },
        ],
        colors: ['Vert', 'Blanc'],
        isFeatured: true,
        isActive: true,
        rating: 4.8,
        reviewCount: 156,
        tags: ['Raja', 'Maillot', 'Officiel'],
      },
      {
        name: 'Écharpe Wydad Athletic Club',
        description: 'Écharpe officielle WAC avec logo brodé',
        category: 'Accessories',
        price: 120,
        stock: 200,
        images: ['/images/products/wydad-scarf.jpg'],
        colors: ['Rouge', 'Blanc'],
        isFeatured: true,
        isActive: true,
        rating: 4.5,
        reviewCount: 89,
        tags: ['Wydad', 'Écharpe', 'Accessoire'],
      },
      {
        name: 'Ballon de Football Professionnel',
        description: 'Ballon utilisé en Botola Pro',
        category: 'Equipment',
        price: 350,
        stock: 50,
        images: ['/images/products/professional-ball.jpg'],
        isFeatured: false,
        isActive: true,
        rating: 4.9,
        reviewCount: 234,
        tags: ['Ballon', 'Botola', 'Professionnel'],
      },
      {
        name: 'Casquette Équipe Nationale Marocaine',
        description: 'Casquette officielle des Lions de l\'Atlas',
        category: 'Accessories',
        price: 180,
        stock: 150,
        images: ['/images/products/morocco-cap.jpg'],
        colors: ['Rouge', 'Vert'],
        isFeatured: true,
        isActive: true,
        rating: 4.7,
        reviewCount: 112,
        tags: ['Maroc', 'Lions', 'Casquette'],
      },
    ]);

    console.log(`✅ Created ${products.length} products`);

    // ============================================================
    // CREATE TICKETS
    // ============================================================

    const tickets = [];
    for (let i = 0; i < 10; i++) {
      const ticket = await Ticket.create({
        event: events[0]._id,
        member: members[i % members.length]._id,
        ticketType: i % 3 === 0 ? 'VIP' : 'Standard',
        price: i % 3 === 0 ? 300 : 150,
        seating: {
          section: `Section ${String.fromCharCode(65 + (i % 4))}`,
          row: `${Math.floor(i / 4) + 1}`,
          seat: `${(i % 10) + 1}`,
        },
        status: 'Valid',
      });

      tickets.push(ticket);

      // Update member
      await Member.findByIdAndUpdate(members[i % members.length]._id, {
        $push: { tickets: ticket._id },
        $inc: { totalSpent: ticket.price },
      });
    }

    console.log(`✅ Created ${tickets.length} tickets`);

    // ============================================================
    // SUMMARY
    // ============================================================

    console.log('\n🎉 =====================================');
    console.log('   Database Seeded Successfully!');
    console.log('   =====================================');
    console.log(`   Admin User: admin@footballhub.ma / admin123`);
    console.log(`   Members: ${members.length}`);
    console.log(`   Events: ${events.length}`);
    console.log(`   Products: ${products.length}`);
    console.log(`   Tickets: ${tickets.length}`);
    console.log('   =====================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
```

---

## ✅ BACKEND 100% COMPLÉTÉ !

### 🎯 Ce qui vient d'être créé :

**Middleware (3 fichiers)** :
1. ✅ **auth.js** - JWT authentication, requireAdmin, optionalAuth
2. ✅ **validation.js** - Joi validation schemas pour toutes les routes
3. ✅ **errorHandler.js** - Global error handling + custom errors

**CRON Jobs** :
4. ✅ **cronJobs.js** - 6 tâches automatiques :
   - Live matches (30s)
   - Upcoming matches (15min)
   - Standings (daily 2AM)
   - Leagues refresh (Monday 3AM)
   - Full sync (Sunday 4AM)
   - Cleanup (daily 5AM)

**Seed Data** :
5. ✅ **seeds/index.js** - Données de test marocaines :
   - 1 Admin user
   - 3 Members (Youssef, Fatima, Mohamed)
   - 2 Events (Derby Raja-Wydad, Tournoi Junior)
   - 4 Products (Maillots, Écharpe, Ballon, Casquette)
   - 10 Tickets

## 🎉 BACKEND FOOTBALLHUB+ 100% PRÊT !

**Pour démarrer** :
```bash
# 1. Seed database
npm run seed

# 2. Start server
npm run dev
```

**Voulez-vous maintenant le guide de démarrage complet ou on passe au Frontend ? 🚀**
