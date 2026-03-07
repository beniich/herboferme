# ⚡ Service de Synchronisation Automatique & Tâches CRON

## 🔄 Service de Synchronisation

### 1. Sync Service Principal

```javascript
// server/src/services/syncService.js

const footballApi = require('./footballApi');
const League = require('../models/League');
const Match = require('../models/Match');
const Standing = require('../models/Standing');

class SyncService {
  constructor() {
    this.syncInProgress = false;
    this.lastSyncTimes = {
      leagues: null,
      matches: null,
      standings: null,
      liveMatches: null,
    };
  }

  // ============================================================
  // SYNC FEATURED LEAGUES
  // ============================================================
  
  async syncFeaturedLeagues() {
    if (this.syncInProgress) {
      console.log('⏸️  Sync already in progress, skipping...');
      return;
    }

    try {
      this.syncInProgress = true;
      console.log('🔄 Starting featured leagues sync...');

      // Top leagues to sync
      const featuredLeagues = [
        { id: 39, name: 'Premier League', country: 'England', priority: 10 },
        { id: 140, name: 'La Liga', country: 'Spain', priority: 9 },
        { id: 78, name: 'Bundesliga', country: 'Germany', priority: 8 },
        { id: 135, name: 'Serie A', country: 'Italy', priority: 7 },
        { id: 61, name: 'Ligue 1', country: 'France', priority: 6 },
        { id: 2, name: 'Champions League', country: 'Europe', priority: 10 },
        { id: 3, name: 'Europa League', country: 'Europe', priority: 7 },
        { id: 200, name: 'Botola Pro', country: 'Morocco', priority: 5 },
      ];

      for (const leagueInfo of featuredLeagues) {
        try {
          // Fetch from API
          const apiLeague = await footballApi.getLeagueById(leagueInfo.id);
          
          if (apiLeague) {
            await League.findOneAndUpdate(
              { apiFootballId: leagueInfo.id },
              {
                apiFootballId: leagueInfo.id,
                name: apiLeague.league.name,
                type: apiLeague.league.type,
                logo: apiLeague.league.logo,
                country: {
                  name: apiLeague.country.name,
                  code: apiLeague.country.code,
                  flag: apiLeague.country.flag,
                },
                currentSeason: {
                  year: apiLeague.seasons[0]?.year,
                  start: apiLeague.seasons[0]?.start,
                  end: apiLeague.seasons[0]?.end,
                  current: apiLeague.seasons[0]?.current,
                },
                isFeatured: true,
                isActive: true,
                priority: leagueInfo.priority,
                lastSyncedAt: new Date(),
              },
              { upsert: true, new: true }
            );

            console.log(`✅ Synced: ${leagueInfo.name}`);
          }

          // Rate limiting (API limit: 10 req/min on free plan)
          await this.sleep(6000); // 6 seconds between requests
        } catch (error) {
          console.error(`❌ Error syncing ${leagueInfo.name}:`, error.message);
        }
      }

      this.lastSyncTimes.leagues = new Date();
      console.log('✅ Featured leagues sync completed');
    } catch (error) {
      console.error('❌ Featured leagues sync error:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // ============================================================
  // SYNC MATCHES FOR FEATURED LEAGUES
  // ============================================================

  async syncFeaturedMatches() {
    try {
      console.log('🔄 Starting featured matches sync...');

      const featuredLeagues = await League.find({
        isFeatured: true,
        isActive: true,
      });

      const currentYear = new Date().getFullYear();

      for (const league of featuredLeagues) {
        if (!league.apiFootballId) continue;

        try {
          console.log(`Syncing matches for ${league.name}...`);
          
          await footballApi.syncFixturesByLeague(
            league.apiFootballId,
            currentYear
          );

          console.log(`✅ Synced matches for ${league.name}`);
          
          // Rate limiting
          await this.sleep(6000);
        } catch (error) {
          console.error(`❌ Error syncing matches for ${league.name}:`, error.message);
        }
      }

      this.lastSyncTimes.matches = new Date();
      console.log('✅ Featured matches sync completed');
    } catch (error) {
      console.error('❌ Featured matches sync error:', error);
    }
  }

  // ============================================================
  // SYNC LIVE MATCHES
  // ============================================================

  async syncLiveMatches() {
    try {
      console.log('⚡ Syncing live matches...');

      const liveFixtures = await footballApi.getLiveMatches();

      let syncedCount = 0;

      for (const fixtureData of liveFixtures) {
        try {
          // Find league in DB
          const dbLeague = await League.findOne({
            apiFootballId: fixtureData.league.id,
          });

          if (!dbLeague) continue; // Skip if league not in our DB

          // Find or create teams
          const homeTeam = await Team.findOne({
            apiFootballId: fixtureData.teams.home.id,
          });
          const awayTeam = await Team.findOne({
            apiFootballId: fixtureData.teams.away.id,
          });

          // Update match
          await Match.findOneAndUpdate(
            { apiFootballId: fixtureData.fixture.id },
            {
              apiFootballId: fixtureData.fixture.id,
              league: dbLeague._id,
              season: fixtureData.league.season,
              round: fixtureData.league.round,
              
              homeTeam: {
                team: homeTeam?._id,
                name: fixtureData.teams.home.name,
                logo: fixtureData.teams.home.logo,
              },
              awayTeam: {
                team: awayTeam?._id,
                name: fixtureData.teams.away.name,
                logo: fixtureData.teams.away.logo,
              },
              
              matchDate: new Date(fixtureData.fixture.date),
              status: footballApi.mapFixtureStatus(fixtureData.fixture.status.short),
              elapsed: fixtureData.fixture.status.elapsed,
              
              score: {
                halftime: {
                  home: fixtureData.score.halftime?.home,
                  away: fixtureData.score.halftime?.away,
                },
                fulltime: {
                  home: fixtureData.score.fulltime?.home,
                  away: fixtureData.score.fulltime?.away,
                },
              },
              
              lastSyncedAt: new Date(),
            },
            { upsert: true, new: true }
          );

          syncedCount++;
        } catch (error) {
          console.error('Error updating live match:', error.message);
        }
      }

      this.lastSyncTimes.liveMatches = new Date();
      console.log(`✅ Synced ${syncedCount} live matches`);

      return syncedCount;
    } catch (error) {
      console.error('❌ Live matches sync error:', error);
      return 0;
    }
  }

  // ============================================================
  // SYNC STANDINGS
  // ============================================================

  async syncFeaturedStandings() {
    try {
      console.log('🔄 Starting standings sync...');

      const featuredLeagues = await League.find({
        isFeatured: true,
        isActive: true,
      });

      const currentYear = new Date().getFullYear();

      for (const league of featuredLeagues) {
        if (!league.apiFootballId) continue;

        try {
          console.log(`Syncing standings for ${league.name}...`);
          
          await footballApi.syncStandingsByLeague(
            league.apiFootballId,
            currentYear
          );

          console.log(`✅ Synced standings for ${league.name}`);
          
          // Rate limiting
          await this.sleep(6000);
        } catch (error) {
          console.error(`❌ Error syncing standings for ${league.name}:`, error.message);
        }
      }

      this.lastSyncTimes.standings = new Date();
      console.log('✅ Standings sync completed');
    } catch (error) {
      console.error('❌ Standings sync error:', error);
    }
  }

  // ============================================================
  // FULL SYNC
  // ============================================================

  async fullSync() {
    console.log('🚀 Starting FULL SYNC...');
    
    try {
      // Step 1: Sync leagues
      await this.syncFeaturedLeagues();
      
      // Step 2: Sync matches
      await this.syncFeaturedMatches();
      
      // Step 3: Sync standings
      await this.syncFeaturedStandings();
      
      console.log('✅ FULL SYNC completed successfully');
    } catch (error) {
      console.error('❌ FULL SYNC error:', error);
    }
  }

  // ============================================================
  // HELPERS
  // ============================================================

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getLastSyncTimes() {
    return this.lastSyncTimes;
  }

  getSyncStatus() {
    return {
      inProgress: this.syncInProgress,
      lastSyncTimes: this.lastSyncTimes,
    };
  }
}

module.exports = new SyncService();
```

---

## ⏰ Tâches CRON

### 1. Configuration CRON

```javascript
// server/src/jobs/cronJobs.js

const cron = require('node-cron');
const syncService = require('../services/syncService');

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
          console.error('Live matches CRON error:', error);
        }
      })
    );

    // 2. UPCOMING MATCHES - Every 15 minutes
    this.jobs.push(
      cron.schedule('*/15 * * * *', async () => {
        try {
          console.log('🔄 Updating upcoming matches...');
          // Sync matches for the next 7 days
          await syncService.syncFeaturedMatches();
        } catch (error) {
          console.error('Upcoming matches CRON error:', error);
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
          console.error('Standings CRON error:', error);
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
          console.error('Leagues CRON error:', error);
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
          console.error('Full sync CRON error:', error);
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
          console.error('Cleanup CRON error:', error);
        }
      })
    );

    console.log(`✅ ${this.jobs.length} CRON jobs initialized`);
  }

  // ============================================================
  // CLEANUP FUNCTIONS
  // ============================================================

  async cleanupOldMatches() {
    const Match = require('../models/Match');
    
    // Delete matches older than 90 days
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

## 🔧 Intégration dans le Serveur

### Mise à Jour server/src/index.js

```javascript
// server/src/index.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

// Services
const cronJobs = require('./jobs/cronJobs');
const syncService = require('./services/syncService');

const app = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/footballhub', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ MongoDB connected successfully');
  
  // Initialize CRON jobs after DB connection
  cronJobs.initializeJobs();
  
  // Initial sync on startup (optional)
  if (process.env.INITIAL_SYNC === 'true') {
    console.log('🚀 Running initial sync...');
    setTimeout(() => {
      syncService.syncFeaturedLeagues();
    }, 5000); // Wait 5s after startup
  }
})
.catch((err) => console.error('❌ MongoDB connection error:', err));

// ============================================================================
// ROUTES
// ============================================================================

const memberRoutes = require('./routes/members');
const eventRoutes = require('./routes/events');
const ticketRoutes = require('./routes/tickets');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const leagueRoutes = require('./routes/leagues');
const matchRoutes = require('./routes/matches');
const newsRoutes = require('./routes/news');
const standingRoutes = require('./routes/standings');

app.use('/api/members', memberRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/leagues', leagueRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/standings', standingRoutes);

// ============================================================================
// ADMIN ROUTES FOR SYNC
// ============================================================================

// Manual sync trigger
app.post('/api/admin/sync/leagues', async (req, res) => {
  try {
    await syncService.syncFeaturedLeagues();
    res.json({ message: 'Leagues sync started' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/admin/sync/matches', async (req, res) => {
  try {
    await syncService.syncFeaturedMatches();
    res.json({ message: 'Matches sync started' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/admin/sync/standings', async (req, res) => {
  try {
    await syncService.syncFeaturedStandings();
    res.json({ message: 'Standings sync started' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/admin/sync/full', async (req, res) => {
  try {
    await syncService.fullSync();
    res.json({ message: 'Full sync started' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get sync status
app.get('/api/admin/sync/status', (req, res) => {
  res.json({
    sync: syncService.getSyncStatus(),
    cron: cronJobs.getJobsStatus(),
  });
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'FootballHub+ API is running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    sync: syncService.getSyncStatus(),
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

process.on('SIGINT', () => {
  console.log('⏸️  Shutting down gracefully...');
  cronJobs.stopAllJobs();
  mongoose.connection.close(() => {
    console.log('👋 MongoDB connection closed');
    process.exit(0);
  });
});

// ============================================================================
// START SERVER
// ============================================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`⏰ CRON jobs active`);
});

module.exports = app;
```

---

## 📦 Installation des Dépendances

```bash
# Installer node-cron
npm install node-cron
```

---

## ⚙️ Configuration .env

```bash
# server/.env

# Application
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/footballhub

# API Football (RapidAPI)
RAPIDAPI_KEY=your_rapidapi_key_here

# Initial Sync
INITIAL_SYNC=false  # Set to true for first run

# CORS
CORS_ORIGIN=http://localhost:3000
```

---

## 🎯 Utilisation

### Démarrage Initial

```bash
# 1. Première synchronisation manuelle
curl -X POST http://localhost:5000/api/admin/sync/full

# 2. Vérifier le statut
curl http://localhost:5000/api/admin/sync/status

# 3. Les CRON s'occuperont du reste automatiquement
```

### Endpoints de Synchronisation Manuelle

```bash
# Sync ligues
curl -X POST http://localhost:5000/api/admin/sync/leagues

# Sync matchs
curl -X POST http://localhost:5000/api/admin/sync/matches

# Sync classements
curl -X POST http://localhost:5000/api/admin/sync/standings

# Full sync
curl -X POST http://localhost:5000/api/admin/sync/full

# Status
curl http://localhost:5000/api/admin/sync/status
```

---

## 📊 Planification CRON

| Tâche | Fréquence | Horaire | Description |
|-------|-----------|---------|-------------|
| **Live Matches** | Toutes les 30s | - | Mise à jour scores live |
| **Upcoming Matches** | Toutes les 15min | - | Matchs à venir (7 jours) |
| **Standings** | Quotidienne | 02:00 | Classements |
| **Leagues Refresh** | Hebdomadaire | Lun 03:00 | Infos ligues |
| **Full Sync** | Hebdomadaire | Dim 04:00 | Sync complète |
| **Cleanup** | Quotidienne | 05:00 | Nettoyage vieux matchs |

Suite dans le prochain fichier avec :
1. Configuration déploiement production
2. WebSocket pour temps réel
3. Optimisations performances
