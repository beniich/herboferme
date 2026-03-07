# 📰 FootballHub+ - SPORTMONKS NEWS PART 3 (FINAL)

## 🗄️ PARTIE 5 : MODÈLE NEWS MONGODB

```javascript
// server/src/models/News.js
const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema(
  {
    // External reference (SportMonks ID)
    externalId: {
      type: Number,
      unique: true,
      sparse: true,
    },

    // Content
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    excerpt: {
      type: String,
      maxlength: 300,
    },

    content: {
      type: String,
      required: true,
    },

    // Media
    image: {
      type: String,
    },

    images: [String],

    video: {
      type: String,
    },

    // Author & Source
    author: {
      type: String,
      default: 'FootballHub+',
    },

    source: {
      type: String,
      enum: ['SportMonks', 'API-Football', 'Manual', 'RSS'],
      default: 'Manual',
    },

    sourceUrl: {
      type: String,
    },

    // Classification
    category: {
      type: String,
      enum: ['Transfers', 'Injuries', 'Matches', 'Interviews', 'Rumors', 'General'],
      default: 'General',
    },

    tags: [String],

    // Relations
    league: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'League',
    },

    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
      },
    ],

    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
      },
    ],

    relatedMatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
    },

    // Publication
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Archived'],
      default: 'Published',
    },

    publishedAt: {
      type: Date,
      default: Date.now,
    },

    // Engagement
    views: {
      type: Number,
      default: 0,
    },

    likes: {
      type: Number,
      default: 0,
    },

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

    // SEO
    metaTitle: String,
    metaDescription: String,
    keywords: [String],

    // Featured
    featured: {
      type: Boolean,
      default: false,
    },

    featuredUntil: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
newsSchema.index({ title: 'text', content: 'text', excerpt: 'text' });
newsSchema.index({ publishedAt: -1 });
newsSchema.index({ status: 1, publishedAt: -1 });
newsSchema.index({ category: 1, publishedAt: -1 });
newsSchema.index({ league: 1, publishedAt: -1 });
newsSchema.index({ teams: 1, publishedAt: -1 });
newsSchema.index({ featured: 1, publishedAt: -1 });

// Virtual for URL
newsSchema.virtual('url').get(function () {
  return `/news/${this.slug || this._id}`;
});

// Pre-save hook to generate slug
newsSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Pre-save hook for featured until
newsSchema.pre('save', function (next) {
  if (this.isModified('featured') && this.featured && !this.featuredUntil) {
    // Featured for 7 days by default
    this.featuredUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  next();
});

// Method to check if still featured
newsSchema.methods.isFeatured = function () {
  if (!this.featured) return false;
  if (!this.featuredUntil) return true;
  return new Date() < this.featuredUntil;
};

// Static method to get featured news
newsSchema.statics.getFeatured = function (limit = 5) {
  return this.find({
    status: 'Published',
    featured: true,
    $or: [
      { featuredUntil: { $exists: false } },
      { featuredUntil: { $gte: new Date() } },
    ],
  })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .populate('league teams');
};

module.exports = mongoose.model('News', newsSchema);
```

---

## ⏰ PARTIE 6 : CRON JOB SYNC AUTOMATIQUE

```javascript
// server/src/jobs/newsSyncJob.js
const cron = require('node-cron');
const newsService = require('../services/newsService');
const sportmonks = require('../config/sportmonks');
const League = require('../models/League');
const logger = require('../utils/logger');

class NewsSyncJob {
  constructor() {
    this.isRunning = false;
    this.lastSync = null;
    this.syncErrors = 0;
  }

  /**
   * Start CRON job
   */
  start() {
    // Sync news every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
      if (this.isRunning) {
        logger.warn('News sync already running, skipping...');
        return;
      }

      try {
        this.isRunning = true;
        logger.info('🔄 Starting automated news sync...');

        await this.syncAllLeaguesNews();

        this.lastSync = new Date();
        this.syncErrors = 0;
        logger.info('✅ Automated news sync completed');
      } catch (error) {
        this.syncErrors++;
        logger.error('❌ Automated news sync failed:', error);

        // Alert if too many errors
        if (this.syncErrors >= 5) {
          logger.error('🚨 Too many sync errors! Manual intervention required.');
          // TODO: Send alert to admin
        }
      } finally {
        this.isRunning = false;
      }
    });

    logger.info('✅ News sync CRON job started (every 30 minutes)');
  }

  /**
   * Sync news for all featured leagues
   */
  async syncAllLeaguesNews() {
    try {
      // Get featured leagues
      const leagues = await League.find({ priority: { $gte: 8 } }).select('_id externalId name');

      logger.info(`Syncing news for ${leagues.length} featured leagues`);

      let totalSynced = 0;

      for (const league of leagues) {
        try {
          if (league.externalId) {
            // Get current season for league
            const leagueData = await sportmonks.getLeague(league.externalId);
            const currentSeason = leagueData.data?.currentSeason?.id;

            if (currentSeason) {
              const result = await newsService.syncNews(currentSeason, 10);
              totalSynced += result.synced;
              
              logger.info(`✅ ${league.name}: ${result.synced} new articles`);
            }
          }
        } catch (error) {
          logger.error(`Failed to sync news for ${league.name}:`, error.message);
          // Continue with other leagues
        }

        // Rate limiting: wait 2 seconds between leagues
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Also sync general news (no specific league)
      try {
        const generalResult = await newsService.syncNews(null, 20);
        totalSynced += generalResult.synced;
        logger.info(`✅ General news: ${generalResult.synced} new articles`);
      } catch (error) {
        logger.error('Failed to sync general news:', error.message);
      }

      logger.info(`🎉 Total synced: ${totalSynced} new articles`);

      return { totalSynced };
    } catch (error) {
      logger.error('Sync all leagues news error:', error);
      throw error;
    }
  }

  /**
   * Sync news on-demand
   */
  async syncNow(seasonId = null, limit = 50) {
    if (this.isRunning) {
      throw new Error('Sync already in progress');
    }

    try {
      this.isRunning = true;
      logger.info('🔄 Starting manual news sync...');

      const result = seasonId
        ? await newsService.syncNews(seasonId, limit)
        : await this.syncAllLeaguesNews();

      this.lastSync = new Date();
      logger.info('✅ Manual news sync completed');

      return result;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Get job status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastSync: this.lastSync,
      syncErrors: this.syncErrors,
      nextSync: this.getNextSyncTime(),
    };
  }

  /**
   * Get next sync time (approximate)
   */
  getNextSyncTime() {
    if (!this.lastSync) return 'Pending...';

    const nextSync = new Date(this.lastSync.getTime() + 30 * 60 * 1000);
    return nextSync;
  }
}

const newsSyncJob = new NewsSyncJob();

module.exports = newsSyncJob;
```

```javascript
// server/src/index.js - Add to main file
const newsSyncJob = require('./jobs/newsSyncJob');

// Start CRON jobs
newsSyncJob.start();
```

---

## 📊 PARTIE 7 : ROUTE ADMIN NEWS SYNC

```javascript
// server/src/routes/admin/news.js
const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../../middleware/auth');
const newsSyncJob = require('../../jobs/newsSyncJob');
const newsService = require('../../services/newsService');
const News = require('../../models/News');

// All routes require admin
router.use(authenticate);
router.use(requireAdmin);

// Get sync status
router.get('/sync/status', (req, res) => {
  try {
    const status = newsSyncJob.getStatus();
    
    res.json({
      success: true,
      status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Trigger manual sync
router.post('/sync/now', async (req, res) => {
  try {
    const { seasonId, limit = 50 } = req.body;

    const result = await newsSyncJob.syncNow(seasonId, limit);

    res.json({
      success: true,
      message: 'Sync completed',
      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Toggle featured status
router.patch('/:id/featured', async (req, res) => {
  try {
    const { featured, featuredUntil } = req.body;

    const news = await News.findByIdAndUpdate(
      req.params.id,
      {
        featured,
        featuredUntil: featuredUntil || (featured ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null),
      },
      { new: true }
    );

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found',
      });
    }

    res.json({
      success: true,
      news,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Delete news
router.delete('/:id', async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found',
      });
    }

    res.json({
      success: true,
      message: 'News deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Update news
router.patch('/:id', async (req, res) => {
  try {
    const updates = req.body;

    const news = await News.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found',
      });
    }

    res.json({
      success: true,
      news,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
```

---

## ✅ PARTIE 8 : GUIDE D'INTÉGRATION COMPLET

### Variables d'Environnement

```bash
# .env
SPORTMONKS_API_TOKEN=your_sportmonks_api_token_here
```

### Installation

```bash
# Install dependencies
npm install axios date-fns lodash node-cron
```

### Configuration Étape par Étape

1. **Créer un compte SportMonks**
   - Aller sur https://www.sportmonks.com/
   - S'inscrire et obtenir une API key
   - Ajouter la clé dans `.env`

2. **Créer les fichiers**
   ```bash
   # Config
   touch server/src/config/sportmonks.js
   
   # Service
   touch server/src/services/newsService.js
   
   # Model
   touch server/src/models/News.js
   
   # Job
   touch server/src/jobs/newsSyncJob.js
   
   # Routes
   touch server/src/routes/news.js
   touch server/src/routes/admin/news.js
   ```

3. **Ajouter les routes dans index.js**
   ```javascript
   app.use('/api/news', require('./routes/news'));
   app.use('/api/admin/news', require('./routes/admin/news'));
   ```

4. **Démarrer le CRON job**
   ```javascript
   const newsSyncJob = require('./jobs/newsSyncJob');
   newsSyncJob.start();
   ```

5. **Première synchronisation**
   ```bash
   # Via API
   curl -X POST http://localhost:5000/api/admin/news/sync/now \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"limit": 100}'
   ```

---

## 📊 API ENDPOINTS DISPONIBLES

### Public Endpoints

```bash
# Get featured news
GET /api/news/featured

# Get all news (paginated)
GET /api/news?page=1&limit=10&category=Transfers&search=ronaldo

# Get news by league
GET /api/news/league/:leagueId?page=1&limit=10

# Get news by team
GET /api/news/team/:teamId?page=1&limit=10

# Get single article
GET /api/news/:id
```

### Admin Endpoints

```bash
# Get sync status
GET /api/admin/news/sync/status

# Trigger manual sync
POST /api/admin/news/sync/now
Body: { "seasonId": 123, "limit": 50 }

# Toggle featured
PATCH /api/admin/news/:id/featured
Body: { "featured": true, "featuredUntil": "2024-12-31" }

# Update news
PATCH /api/admin/news/:id
Body: { "title": "New Title", "category": "Transfers" }

# Delete news
DELETE /api/admin/news/:id
```

---

## 🎯 FONCTIONNALITÉS COMPLÈTES

### ✅ Backend
- [x] Intégration API SportMonks
- [x] Service news avec sync automatique
- [x] Modèle MongoDB avec indexes
- [x] CRON job (sync toutes les 30 min)
- [x] Cache Redis (5 min)
- [x] Routes publiques + admin
- [x] Catégorisation automatique
- [x] Tags extraction
- [x] Featured news system
- [x] Search full-text
- [x] Pagination

### ✅ Frontend
- [x] Page news élégante
- [x] Featured news carousel
- [x] Categories filter
- [x] Search bar
- [x] News cards responsive
- [x] News detail page
- [x] Related articles
- [x] Social sharing
- [x] Views counter
- [x] Lazy loading images

---

## 🎉 RÉSUMÉ

Vous avez maintenant une **intégration complète SportMonks** avec :

### Infrastructure ✅
- API SportMonks professionnelle
- Cache Redis intelligent
- CRON sync automatique
- Rate limiting

### Données ✅
- News de toutes les ligues
- Catégorisation automatique
- Featured system
- Full-text search

### UI/UX ✅
- Design élégant type SportMonks
- Featured carousel
- Categories filter
- Responsive design
- Social sharing

**INTÉGRATION SPORTMONKS 100% COMPLÈTE ! 🎉⚽**
