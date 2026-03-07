# 🛣️ FootballHub+ - ROUTES FINALES + SERVEUR PRINCIPAL

## Route 9 : News (Actualités)

```javascript
// src/routes/news.js
const express = require('express');
const router = express.Router();
const NewsArticle = require('../models/NewsArticle');

// GET /api/news - Get all news articles
router.get('/', async (req, res) => {
  try {
    const {
      league,
      team,
      category,
      featured,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const query = { isPublished: true };
    if (league) query.league = league;
    if (team) query.teams = team;
    if (category) query.category = category;
    if (featured) query.isFeatured = featured === 'true';
    if (search) {
      query.$text = { $search: search };
    }

    const articles = await NewsArticle.find(query)
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('league', 'name logo')
      .populate('teams', 'name logo');

    const count = await NewsArticle.countDocuments(query);

    res.json({
      articles,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/news/featured - Get featured articles
router.get('/featured', async (req, res) => {
  try {
    const articles = await NewsArticle.find({
      isFeatured: true,
      isPublished: true,
    })
      .sort({ publishedAt: -1 })
      .limit(5)
      .populate('league', 'name logo')
      .populate('teams', 'name logo');

    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/news/:id - Get article by ID
router.get('/:id', async (req, res) => {
  try {
    const article = await NewsArticle.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    )
      .populate('league', 'name logo')
      .populate('teams', 'name logo');

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/news - Create new article
router.post('/', async (req, res) => {
  try {
    const article = await NewsArticle.create(req.body);
    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/news/:id/like - Like article
router.post('/:id/like', async (req, res) => {
  try {
    const article = await NewsArticle.findByIdAndUpdate(
      req.params.id,
      { $inc: { likeCount: 1 } },
      { new: true }
    );

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json({ message: 'Article liked', article });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/news/:id - Update article
router.patch('/:id', async (req, res) => {
  try {
    const article = await NewsArticle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/news/:id - Delete article
router.delete('/:id', async (req, res) => {
  try {
    const article = await NewsArticle.findByIdAndUpdate(
      req.params.id,
      { isPublished: false },
      { new: true }
    );

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json({ message: 'Article unpublished' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

## Route 10 : Standings (Classements)

```javascript
// src/routes/standings.js
const express = require('express');
const router = express.Router();
const Standing = require('../models/Standing');

// GET /api/standings/:leagueId/:season - Get standings
router.get('/:leagueId/:season', async (req, res) => {
  try {
    const standing = await Standing.findOne({
      league: req.params.leagueId,
      season: req.params.season,
    })
      .populate('league', 'name logo')
      .populate('rankings.team', 'name logo');

    if (!standing) {
      return res.status(404).json({ message: 'Standings not found' });
    }

    res.json(standing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/standings/sync/:leagueId/:season - Sync standings
router.post('/sync/:leagueId/:season', async (req, res) => {
  try {
    const footballApi = require('../services/footballApi');
    await footballApi.syncStandingsByLeague(
      req.params.leagueId,
      req.params.season
    );

    res.json({ message: 'Standings sync started' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/standings - Create/Update standings
router.post('/', async (req, res) => {
  try {
    const { league, season, rankings } = req.body;

    const standing = await Standing.findOneAndUpdate(
      { league, season },
      { league, season, rankings, lastSyncedAt: new Date() },
      { upsert: true, new: true }
    );

    res.status(201).json(standing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
```

## Route 11 : Favorites (Favoris Utilisateur)

```javascript
// src/routes/favorites.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware d'authentification
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// GET /api/favorites - Get user favorites
router.get('/', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('favoriteLeagues', 'name logo country')
      .populate('favoriteTeams', 'name logo country')
      .populate('favoritePlayers', 'firstName lastName photo position');

    res.json({
      leagues: user.favoriteLeagues,
      teams: user.favoriteTeams,
      players: user.favoritePlayers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/favorites/leagues/:id - Add league to favorites
router.post('/leagues/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (user.favoriteLeagues.includes(req.params.id)) {
      return res.status(400).json({ message: 'Already in favorites' });
    }

    user.favoriteLeagues.push(req.params.id);
    await user.save();

    res.json({ message: 'League added to favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/favorites/leagues/:id - Remove league from favorites
router.delete('/leagues/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    user.favoriteLeagues = user.favoriteLeagues.filter(
      (l) => l.toString() !== req.params.id
    );

    await user.save();

    res.json({ message: 'League removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/favorites/teams/:id - Add team to favorites
router.post('/teams/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (user.favoriteTeams.includes(req.params.id)) {
      return res.status(400).json({ message: 'Already in favorites' });
    }

    user.favoriteTeams.push(req.params.id);
    await user.save();

    res.json({ message: 'Team added to favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/favorites/teams/:id - Remove team from favorites
router.delete('/teams/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    user.favoriteTeams = user.favoriteTeams.filter(
      (t) => t.toString() !== req.params.id
    );

    await user.save();

    res.json({ message: 'Team removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/favorites/players/:id - Add player to favorites
router.post('/players/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (user.favoritePlayers.includes(req.params.id)) {
      return res.status(400).json({ message: 'Already in favorites' });
    }

    user.favoritePlayers.push(req.params.id);
    await user.save();

    res.json({ message: 'Player added to favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/favorites/players/:id - Remove player from favorites
router.delete('/players/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    user.favoritePlayers = user.favoritePlayers.filter(
      (p) => p.toString() !== req.params.id
    );

    await user.save();

    res.json({ message: 'Player removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

---

## 🎯 SERVEUR PRINCIPAL COMPLET

```javascript
// src/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/footballhub', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// ============================================================================
// ROUTES
// ============================================================================

// Core routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/members', require('./routes/members'));
app.use('/api/events', require('./routes/events'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

// Football data routes
app.use('/api/leagues', require('./routes/leagues'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/news', require('./routes/news'));
app.use('/api/standings', require('./routes/standings'));

// User features
app.use('/api/favorites', require('./routes/favorites'));

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'FootballHub+ API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'FootballHub+ API',
    version: '1.0.0',
    description: 'Backend API for FootballHub+ SaaS Platform',
    endpoints: {
      auth: '/api/auth',
      members: '/api/members',
      events: '/api/events',
      tickets: '/api/tickets',
      products: '/api/products',
      orders: '/api/orders',
      leagues: '/api/leagues',
      matches: '/api/matches',
      news: '/api/news',
      standings: '/api/standings',
      favorites: '/api/favorites',
      health: '/api/health',
    },
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

process.on('SIGINT', async () => {
  console.log('\n⏸️  Shutting down gracefully...');

  try {
    await mongoose.connection.close();
    console.log('👋 MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// ============================================================================
// START SERVER
// ============================================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n🚀 =====================================');
  console.log(`   FootballHub+ API Server`);
  console.log('   =====================================');
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Port: ${PORT}`);
  console.log(`   URL: http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log('   =====================================\n');
});

module.exports = app;
```

---

## ✅ TOUTES LES ROUTES CRÉÉES ! (11/11)

1. ✅ **Auth** - Register, Login, Profile
2. ✅ **Members** - CRUD + Stats
3. ✅ **Events** - CRUD + Registration
4. ✅ **Tickets** - CRUD + QR Validation
5. ✅ **Products** - E-commerce
6. ✅ **Orders** - Commandes
7. ✅ **Leagues** - Football Data + Sync
8. ✅ **Matches** - Matchs + Lineups + Live
9. ✅ **News** - Actualités
10. ✅ **Standings** - Classements
11. ✅ **Favorites** - Favoris Utilisateur

**✅ Serveur Principal Complet !**

**Prochaines étapes** : Services (footballApi, syncService, etc.) + Seed Data

Je continue ? 🚀
