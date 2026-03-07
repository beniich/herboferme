# 🛡️ FootballHub+ - MIDDLEWARE, CRON JOBS & SEED DATA COMPLETS

## 🔐 Middleware 1 : Authentication

```javascript
// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ============================================================
// AUTHENTICATE TOKEN
// ============================================================

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is disabled',
      });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};

// ============================================================
// OPTIONAL AUTHENTICATION
// ============================================================

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

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

// ============================================================
// CHECK ADMIN ROLE
// ============================================================

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }

  next();
};

// ============================================================
// CHECK STAFF ROLE
// ============================================================

const requireStaff = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (!['admin', 'staff'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Staff access required',
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  requireStaff,
};
```

## ⚠️ Middleware 2 : Error Handler

```javascript
// src/middleware/errorHandler.js

// ============================================================
// NOT FOUND HANDLER
// ============================================================

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// ============================================================
// ERROR HANDLER
// ============================================================

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

// ============================================================
// ASYNC HANDLER (Wrapper for async routes)
// ============================================================

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ============================================================
// VALIDATION ERROR HANDLER
// ============================================================

const handleValidationError = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors,
    });
  }

  next(err);
};

// ============================================================
// MONGOOSE ERROR HANDLER
// ============================================================

const handleMongooseError = (err, req, res, next) => {
  // Duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // Cast error
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
    });
  }

  next(err);
};

module.exports = {
  notFound,
  errorHandler,
  asyncHandler,
  handleValidationError,
  handleMongooseError,
};
```

## ✅ Middleware 3 : Validation

```javascript
// src/middleware/validation.js
const Joi = require('joi');

// ============================================================
// VALIDATE REQUEST
// ============================================================

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
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
        message: 'Validation Error',
        errors,
      });
    }

    next();
  };
};

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const schemas = {
  // User Registration
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().min(2).required(),
    lastName: Joi.string().min(2).required(),
    phone: Joi.string().optional(),
    country: Joi.string().optional(),
  }),

  // User Login
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  // Create Member
  createMember: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().optional(),
    role: Joi.string().valid('Player', 'Staff', 'Fan', 'Admin').optional(),
    tier: Joi.string().valid('VIP', 'Elite', 'Standard').optional(),
    dateOfBirth: Joi.date().optional(),
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    country: Joi.string().optional(),
  }),

  // Create Event
  createEvent: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().optional(),
    category: Joi.string().valid('Match', 'Training', 'Tournament', 'Meeting', 'Other').required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().optional(),
    venue: Joi.object({
      name: Joi.string().optional(),
      address: Joi.string().optional(),
      city: Joi.string().optional(),
      capacity: Joi.number().optional(),
    }).optional(),
    capacity: Joi.number().optional(),
    ticketPrice: Joi.number().optional(),
    coverImage: Joi.string().uri().optional(),
  }),

  // Create Product
  createProduct: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().optional(),
    category: Joi.string().valid('Jersey', 'Training', 'Accessories', 'Memorabilia', 'Equipment').required(),
    price: Joi.number().min(0).required(),
    comparePrice: Joi.number().min(0).optional(),
    stock: Joi.number().min(0).optional(),
    images: Joi.array().items(Joi.string().uri()).optional(),
    sizes: Joi.array().items(Joi.object({
      size: Joi.string().required(),
      stock: Joi.number().min(0).required(),
    })).optional(),
    colors: Joi.array().items(Joi.string()).optional(),
  }),

  // Create Order
  createOrder: Joi.object({
    memberId: Joi.string().required(),
    items: Joi.array().items(Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().min(1).required(),
      size: Joi.string().optional(),
      color: Joi.string().optional(),
    })).min(1).required(),
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

---

## ⏰ CRON Jobs - Tâches Automatisées

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

---

## 🌱 SEED DATA - Données de Test Marocaines

```javascript
// src/seeds/index.js
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Member = require('../models/Member');
const Event = require('../models/Event');
const Product = require('../models/Product');
const League = require('../models/League');
const Team = require('../models/Team');

// ============================================================
// CONNECT TO DATABASE
// ============================================================

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/footballhub');
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// ============================================================
// CLEAR DATABASE
// ============================================================

const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await Member.deleteMany({});
    await Event.deleteMany({});
    await Product.deleteMany({});
    await League.deleteMany({});
    await Team.deleteMany({});
    console.log('🗑️  Database cleared');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
};

// ============================================================
// SEED USERS
// ============================================================

const seedUsers = async () => {
  const users = [
    {
      email: 'admin@footballhub.ma',
      password: 'admin123',
      firstName: 'Mohamed',
      lastName: 'Alami',
      role: 'admin',
      country: 'Morocco',
      city: 'Casablanca',
      isActive: true,
    },
    {
      email: 'staff@footballhub.ma',
      password: 'staff123',
      firstName: 'Fatima',
      lastName: 'Benali',
      role: 'staff',
      country: 'Morocco',
      city: 'Rabat',
      isActive: true,
    },
    {
      email: 'user@footballhub.ma',
      password: 'user123',
      firstName: 'Youssef',
      lastName: 'El Idrissi',
      role: 'user',
      country: 'Morocco',
      city: 'Marrakech',
      isActive: true,
    },
  ];

  const createdUsers = await User.create(users);
  console.log(`✅ Created ${createdUsers.length} users`);
  return createdUsers;
};

// ============================================================
// SEED MEMBERS
// ============================================================

const seedMembers = async () => {
  const members = [
    {
      firstName: 'Achraf',
      lastName: 'Hakimi',
      email: 'achraf.hakimi@footballhub.ma',
      phone: '+212 6 12 34 56 78',
      role: 'Player',
      tier: 'VIP',
      status: 'Active',
      city: 'Casablanca',
      country: 'Morocco',
      dateOfBirth: new Date('1998-11-04'),
    },
    {
      firstName: 'Hakim',
      lastName: 'Ziyech',
      email: 'hakim.ziyech@footballhub.ma',
      phone: '+212 6 23 45 67 89',
      role: 'Player',
      tier: 'Elite',
      status: 'Active',
      city: 'Dronten',
      country: 'Netherlands',
      dateOfBirth: new Date('1993-03-19'),
    },
    {
      firstName: 'Yassine',
      lastName: 'Bounou',
      email: 'yassine.bounou@footballhub.ma',
      phone: '+212 6 34 56 78 90',
      role: 'Player',
      tier: 'VIP',
      status: 'Active',
      city: 'Montréal',
      country: 'Canada',
      dateOfBirth: new Date('1991-04-05'),
    },
    {
      firstName: 'Walid',
      lastName: 'Regragui',
      email: 'walid.regragui@footballhub.ma',
      phone: '+212 6 45 67 89 01',
      role: 'Staff',
      tier: 'Elite',
      status: 'Active',
      city: 'Corbeil-Essonnes',
      country: 'France',
      dateOfBirth: new Date('1975-09-23'),
    },
    {
      firstName: 'Ahmed',
      lastName: 'Benkirane',
      email: 'ahmed.benkirane@footballhub.ma',
      phone: '+212 6 56 78 90 12',
      role: 'Fan',
      tier: 'Standard',
      status: 'Active',
      city: 'Tangier',
      country: 'Morocco',
      dateOfBirth: new Date('1995-08-15'),
    },
  ];

  const createdMembers = await Member.create(members);
  console.log(`✅ Created ${createdMembers.length} members`);
  return createdMembers;
};

// ============================================================
// SEED EVENTS
// ============================================================

const seedEvents = async (users) => {
  const events = [
    {
      title: 'Match Raja vs Wydad - Derby de Casablanca',
      description: 'Le derby le plus chaud du Maroc ! Ambiance garantie au Stade Mohamed V.',
      category: 'Match',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // In 7 days
      venue: {
        name: 'Stade Mohamed V',
        address: 'Avenue Moulay Abdellah',
        city: 'Casablanca',
        capacity: 67000,
      },
      capacity: 60000,
      ticketPrice: 150,
      status: 'Published',
      isFeatured: true,
      organizer: users[0]._id,
    },
    {
      title: 'Botola Pro - WAC vs FUS Rabat',
      description: 'Match de championnat Botola Pro',
      category: 'Match',
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // In 14 days
      venue: {
        name: 'Stade Mohamed V',
        address: 'Avenue Moulay Abdellah',
        city: 'Casablanca',
        capacity: 67000,
      },
      capacity: 45000,
      ticketPrice: 100,
      status: 'Published',
      organizer: users[0]._id,
    },
    {
      title: 'Stage de Formation - Jeunes Talents',
      description: 'Stage intensif de 3 jours pour jeunes footballeurs (12-16 ans)',
      category: 'Training',
      startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // In 21 days
      endDate: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000),
      venue: {
        name: 'Complexe Mohammed VI',
        city: 'Salé',
        capacity: 200,
      },
      capacity: 100,
      ticketPrice: 500,
      status: 'Published',
      organizer: users[1]._id,
    },
  ];

  const createdEvents = await Event.create(events);
  console.log(`✅ Created ${createdEvents.length} events`);
  return createdEvents;
};

// ============================================================
// SEED PRODUCTS
// ============================================================

const seedProducts = async () => {
  const products = [
    {
      name: 'Maillot Équipe Nationale Maroc 2024',
      description: 'Maillot officiel de l\'équipe nationale du Maroc - Coupe du Monde 2026',
      category: 'Jersey',
      price: 799,
      comparePrice: 999,
      stock: 500,
      images: [
        'https://images.unsplash.com/photo-1522778526621-1b0b8bfc0b22',
      ],
      sizes: [
        { size: 'S', stock: 100 },
        { size: 'M', stock: 150 },
        { size: 'L', stock: 150 },
        { size: 'XL', stock: 100 },
      ],
      colors: ['Rouge', 'Vert'],
      isFeatured: true,
      isActive: true,
      rating: 4.8,
      reviewCount: 245,
    },
    {
      name: 'Ballon Nike Officiel Botola Pro',
      description: 'Ballon officiel du championnat marocain Botola Pro',
      category: 'Equipment',
      price: 450,
      stock: 200,
      images: [
        'https://images.unsplash.com/photo-1575361204480-aadea25e6e68',
      ],
      isFeatured: true,
      isActive: true,
      rating: 4.5,
      reviewCount: 89,
    },
    {
      name: 'Écharpe Supporters - Lions de l\'Atlas',
      description: 'Écharpe officielle des supporters de l\'équipe nationale',
      category: 'Accessories',
      price: 120,
      stock: 1000,
      images: [
        'https://images.unsplash.com/photo-1556821840-3a63f95609a7',
      ],
      colors: ['Rouge/Vert', 'Blanc/Rouge'],
      isActive: true,
      rating: 4.2,
      reviewCount: 156,
    },
    {
      name: 'Tenue d\'Entraînement Complète',
      description: 'Ensemble veste + pantalon pour entraînement',
      category: 'Training',
      price: 650,
      comparePrice: 850,
      stock: 300,
      images: [
        'https://images.unsplash.com/photo-1556906781-9a412961c28c',
      ],
      sizes: [
        { size: 'S', stock: 60 },
        { size: 'M', stock: 100 },
        { size: 'L', stock: 80 },
        { size: 'XL', stock: 60 },
      ],
      isActive: true,
      rating: 4.6,
      reviewCount: 67,
    },
  ];

  const createdProducts = await Product.create(products);
  console.log(`✅ Created ${createdProducts.length} products`);
  return createdProducts;
};

// ============================================================
// SEED LEAGUES
// ============================================================

const seedLeagues = async () => {
  const leagues = [
    {
      name: 'Botola Pro',
      type: 'League',
      country: {
        name: 'Morocco',
        code: 'MA',
        flag: '🇲🇦',
      },
      isFeatured: true,
      isActive: true,
      priority: 9,
      currentSeason: {
        year: 2024,
        current: true,
      },
    },
    {
      name: 'Champions League',
      type: 'Cup',
      country: {
        name: 'Europe',
        code: 'EU',
        flag: '🇪🇺',
      },
      isFeatured: true,
      isActive: true,
      priority: 10,
      currentSeason: {
        year: 2024,
        current: true,
      },
    },
  ];

  const createdLeagues = await League.create(leagues);
  console.log(`✅ Created ${createdLeagues.length} leagues`);
  return createdLeagues;
};

// ============================================================
// SEED TEAMS
// ============================================================

const seedTeams = async () => {
  const teams = [
    {
      name: 'Raja Club Athletic',
      code: 'RCA',
      country: 'Morocco',
      founded: 1949,
      venue: {
        name: 'Stade Mohamed V',
        city: 'Casablanca',
        capacity: 67000,
      },
    },
    {
      name: 'Wydad Athletic Club',
      code: 'WAC',
      country: 'Morocco',
      founded: 1937,
      venue: {
        name: 'Stade Mohamed V',
        city: 'Casablanca',
        capacity: 67000,
      },
    },
    {
      name: 'AS FAR',
      code: 'FAR',
      country: 'Morocco',
      founded: 1958,
      venue: {
        name: 'Stade Moulay Abdellah',
        city: 'Rabat',
        capacity: 52000,
      },
    },
  ];

  const createdTeams = await Team.create(teams);
  console.log(`✅ Created ${createdTeams.length} teams`);
  return createdTeams;
};

// ============================================================
// RUN SEED
// ============================================================

const runSeed = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    await connectDB();
    await clearDatabase();

    const users = await seedUsers();
    const members = await seedMembers();
    const events = await seedEvents(users);
    const products = await seedProducts();
    const leagues = await seedLeagues();
    const teams = await seedTeams();

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Members: ${members.length}`);
    console.log(`   Events: ${events.length}`);
    console.log(`   Products: ${products.length}`);
    console.log(`   Leagues: ${leagues.length}`);
    console.log(`   Teams: ${teams.length}`);
    console.log('\n🔐 Test Credentials:');
    console.log('   Admin: admin@footballhub.ma / admin123');
    console.log('   Staff: staff@footballhub.ma / staff123');
    console.log('   User: user@footballhub.ma / user123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  runSeed();
}

module.exports = { runSeed };
```

---

## ✅ BACKEND 100% TERMINÉ !

**Middleware créés** :
- ✅ auth.js - JWT authentication + role checks
- ✅ errorHandler.js - Error handling + async wrapper
- ✅ validation.js - Joi validation schemas

**CRON Jobs créés** :
- ✅ 6 tâches automatisées
- ✅ Live matches (30s)
- ✅ Upcoming matches (15min)
- ✅ Standings (daily)
- ✅ Leagues (weekly)
- ✅ Full sync (weekly)
- ✅ Cleanup (daily)

**Seed Data créés** :
- ✅ 3 Users (admin, staff, user)
- ✅ 5 Members (joueurs marocains)
- ✅ 3 Events (matchs + stage)
- ✅ 4 Products (maillots, ballon, etc.)
- ✅ 2 Leagues (Botola Pro, Champions League)
- ✅ 3 Teams (Raja, Wydad, FAR)

**BACKEND COMPLET À 100% ! 🎉**
