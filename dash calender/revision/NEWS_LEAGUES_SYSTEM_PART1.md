# ⚽ Système de News & Informations Ligues Réelles - FootballHub+

## 🎯 Architecture du Système

### Vue d'Ensemble

FootballHub+ va intégrer :
- **News en temps réel** de toutes les ligues mondiales
- **Scores live** et résultats
- **Classements** actualisés
- **Statistiques** joueurs et équipes
- **Calendrier** des matchs
- **Transferts** et rumeurs
- **Vidéos** highlights

---

## 📊 Sources de Données

### APIs Sportives Recommandées

#### 1. **API-Football (Recommandé ⭐)**
```
URL: https://api-football-v1.p.rapidapi.com/v3/
Prix: Gratuit (100 req/jour) → Pro (1000 req/jour)
Couverture: 1000+ ligues, 20+ pays
```

**Avantages:**
- ✅ Données en temps réel
- ✅ Scores live
- ✅ Statistiques détaillées
- ✅ News et transferts
- ✅ Documentation excellente

#### 2. **Football-Data.org**
```
URL: https://api.football-data.org/v4/
Prix: Gratuit (10 req/min) → Premium
Couverture: Ligues européennes principales
```

#### 3. **TheSportsDB**
```
URL: https://www.thesportsdb.com/api/v1/json/
Prix: Gratuit (Plan de base)
Couverture: Multi-sports
```

---

## 🗄️ Modèles de Données Backend

### 1. League Model

```javascript
// server/src/models/League.js

const mongoose = require('mongoose');

const leagueSchema = new mongoose.Schema({
  // IDs externes
  apiFootballId: {
    type: Number,
    unique: true,
    sparse: true,
  },
  
  // Informations de base
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['League', 'Cup'],
    default: 'League',
  },
  country: {
    name: String,
    code: String,
    flag: String,
  },
  
  // Logo et branding
  logo: String,
  flag: String,
  
  // Saison actuelle
  currentSeason: {
    year: Number,
    start: Date,
    end: Date,
    current: Boolean,
  },
  
  // Métadonnées
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: Number,
    default: 0,
  },
  
  // Stats
  followersCount: {
    type: Number,
    default: 0,
  },
  
  // Dernière mise à jour
  lastSyncedAt: Date,
}, {
  timestamps: true,
});

leagueSchema.index({ country: 1, priority: -1 });
leagueSchema.index({ isFeatured: 1 });

module.exports = mongoose.model('League', leagueSchema);
```

### 2. Team Model

```javascript
// server/src/models/Team.js

const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  apiFootballId: {
    type: Number,
    unique: true,
    sparse: true,
  },
  
  name: {
    type: String,
    required: true,
  },
  code: String,
  country: String,
  founded: Number,
  
  // Visual
  logo: String,
  
  // Venue
  venue: {
    name: String,
    address: String,
    city: String,
    capacity: Number,
    surface: String,
    image: String,
  },
  
  // League association
  leagues: [{
    league: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'League',
    },
    season: Number,
  }],
  
  // Stats
  followersCount: {
    type: Number,
    default: 0,
  },
  
  lastSyncedAt: Date,
}, {
  timestamps: true,
});

teamSchema.index({ name: 'text' });
teamSchema.index({ country: 1 });

module.exports = mongoose.model('Team', teamSchema);
```

### 3. Match Model

```javascript
// server/src/models/Match.js

const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  apiFootballId: {
    type: Number,
    unique: true,
    sparse: true,
  },
  
  // Competition
  league: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'League',
    required: true,
  },
  season: Number,
  round: String,
  
  // Teams
  homeTeam: {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    name: String,
    logo: String,
  },
  awayTeam: {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    name: String,
    logo: String,
  },
  
  // Date & Time
  matchDate: {
    type: Date,
    required: true,
  },
  timezone: String,
  
  // Venue
  venue: {
    name: String,
    city: String,
  },
  
  // Status
  status: {
    type: String,
    enum: ['SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED', 'CANCELLED'],
    default: 'SCHEDULED',
  },
  elapsed: Number,
  
  // Score
  score: {
    halftime: {
      home: Number,
      away: Number,
    },
    fulltime: {
      home: Number,
      away: Number,
    },
    extratime: {
      home: Number,
      away: Number,
    },
    penalty: {
      home: Number,
      away: Number,
    },
  },
  
  // Goals
  goals: [{
    team: String,
    player: String,
    minute: Number,
    type: {
      type: String,
      enum: ['Normal Goal', 'Own Goal', 'Penalty'],
    },
  }],
  
  // Stats
  statistics: {
    homeTeam: {
      shotsOnGoal: Number,
      shotsOffGoal: Number,
      possession: Number,
      corners: Number,
      yellowCards: Number,
      redCards: Number,
    },
    awayTeam: {
      shotsOnGoal: Number,
      shotsOffGoal: Number,
      possession: Number,
      corners: Number,
      yellowCards: Number,
      redCards: Number,
    },
  },
  
  lastSyncedAt: Date,
}, {
  timestamps: true,
});

matchSchema.index({ league: 1, matchDate: -1 });
matchSchema.index({ status: 1, matchDate: 1 });
matchSchema.index({ 'homeTeam.team': 1 });
matchSchema.index({ 'awayTeam.team': 1 });

module.exports = mongoose.model('Match', matchSchema);
```

### 4. News Article Model

```javascript
// server/src/models/NewsArticle.js

const mongoose = require('mongoose');

const newsArticleSchema = new mongoose.Schema({
  // Source
  source: {
    type: String,
    required: true,
  },
  sourceUrl: String,
  
  // Content
  title: {
    type: String,
    required: true,
  },
  description: String,
  content: String,
  
  // Media
  image: String,
  video: String,
  
  // Categories
  category: {
    type: String,
    enum: ['Match', 'Transfer', 'Injury', 'Interview', 'General'],
    default: 'General',
  },
  tags: [String],
  
  // Relations
  league: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'League',
  },
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  }],
  
  // Publishing
  publishedAt: {
    type: Date,
    default: Date.now,
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  
  // Engagement
  viewCount: {
    type: Number,
    default: 0,
  },
  likeCount: {
    type: Number,
    default: 0,
  },
  
  // Author
  author: {
    name: String,
    avatar: String,
  },
}, {
  timestamps: true,
});

newsArticleSchema.index({ publishedAt: -1 });
newsArticleSchema.index({ league: 1, publishedAt: -1 });
newsArticleSchema.index({ category: 1, publishedAt: -1 });
newsArticleSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('NewsArticle', newsArticleSchema);
```

### 5. Standing Model

```javascript
// server/src/models/Standing.js

const mongoose = require('mongoose');

const standingSchema = new mongoose.Schema({
  league: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'League',
    required: true,
  },
  season: {
    type: Number,
    required: true,
  },
  
  rankings: [{
    rank: Number,
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    teamName: String,
    teamLogo: String,
    
    // Stats
    played: Number,
    win: Number,
    draw: Number,
    lose: Number,
    
    goals: {
      for: Number,
      against: Number,
      diff: Number,
    },
    
    points: Number,
    
    // Form (last 5 matches)
    form: String, // "WWDLW"
    
    // Status
    status: String, // "Champions League", "Relegation", etc.
    description: String,
  }],
  
  lastSyncedAt: Date,
}, {
  timestamps: true,
});

standingSchema.index({ league: 1, season: -1 });

module.exports = mongoose.model('Standing', standingSchema);
```

---

## 🔌 Service d'Intégration API

### API Service Football

```javascript
// server/src/services/footballApi.js

const axios = require('axios');
const League = require('../models/League');
const Team = require('../models/Team');
const Match = require('../models/Match');
const Standing = require('../models/Standing');

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const API_BASE_URL = 'https://api-football-v1.p.rapidapi.com/v3';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'X-RapidAPI-Key': RAPIDAPI_KEY,
    'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
  },
});

class FootballApiService {
  // ============================================================
  // LEAGUES
  // ============================================================
  
  async syncLeagues() {
    try {
      const response = await apiClient.get('/leagues', {
        params: { current: true },
      });

      const leagues = response.data.response;
      const syncedLeagues = [];

      for (const leagueData of leagues) {
        const league = await League.findOneAndUpdate(
          { apiFootballId: leagueData.league.id },
          {
            apiFootballId: leagueData.league.id,
            name: leagueData.league.name,
            type: leagueData.league.type,
            logo: leagueData.league.logo,
            country: {
              name: leagueData.country.name,
              code: leagueData.country.code,
              flag: leagueData.country.flag,
            },
            currentSeason: {
              year: leagueData.seasons[0]?.year,
              start: leagueData.seasons[0]?.start,
              end: leagueData.seasons[0]?.end,
              current: leagueData.seasons[0]?.current,
            },
            lastSyncedAt: new Date(),
          },
          { upsert: true, new: true }
        );

        syncedLeagues.push(league);
      }

      console.log(`✅ Synced ${syncedLeagues.length} leagues`);
      return syncedLeagues;
    } catch (error) {
      console.error('Error syncing leagues:', error);
      throw error;
    }
  }

  async getLeagueById(leagueId) {
    try {
      const response = await apiClient.get('/leagues', {
        params: { id: leagueId },
      });

      return response.data.response[0];
    } catch (error) {
      console.error('Error fetching league:', error);
      throw error;
    }
  }

  // ============================================================
  // TEAMS
  // ============================================================

  async syncTeamsByLeague(leagueId, season) {
    try {
      const response = await apiClient.get('/teams', {
        params: {
          league: leagueId,
          season: season,
        },
      });

      const teams = response.data.response;
      const syncedTeams = [];

      for (const teamData of teams) {
        const team = await Team.findOneAndUpdate(
          { apiFootballId: teamData.team.id },
          {
            apiFootballId: teamData.team.id,
            name: teamData.team.name,
            code: teamData.team.code,
            country: teamData.team.country,
            founded: teamData.team.founded,
            logo: teamData.team.logo,
            venue: {
              name: teamData.venue.name,
              address: teamData.venue.address,
              city: teamData.venue.city,
              capacity: teamData.venue.capacity,
              surface: teamData.venue.surface,
              image: teamData.venue.image,
            },
            lastSyncedAt: new Date(),
          },
          { upsert: true, new: true }
        );

        syncedTeams.push(team);
      }

      console.log(`✅ Synced ${syncedTeams.length} teams`);
      return syncedTeams;
    } catch (error) {
      console.error('Error syncing teams:', error);
      throw error;
    }
  }

  // ============================================================
  // MATCHES
  // ============================================================

  async syncFixturesByLeague(leagueId, season) {
    try {
      const dbLeague = await League.findOne({ apiFootballId: leagueId });
      if (!dbLeague) {
        throw new Error('League not found in database');
      }

      const response = await apiClient.get('/fixtures', {
        params: {
          league: leagueId,
          season: season,
        },
      });

      const fixtures = response.data.response;
      const syncedMatches = [];

      for (const fixtureData of fixtures) {
        const homeTeam = await Team.findOne({
          apiFootballId: fixtureData.teams.home.id,
        });
        const awayTeam = await Team.findOne({
          apiFootballId: fixtureData.teams.away.id,
        });

        const match = await Match.findOneAndUpdate(
          { apiFootballId: fixtureData.fixture.id },
          {
            apiFootballId: fixtureData.fixture.id,
            league: dbLeague._id,
            season: season,
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
            timezone: fixtureData.fixture.timezone,
            
            venue: {
              name: fixtureData.fixture.venue?.name,
              city: fixtureData.fixture.venue?.city,
            },
            
            status: this.mapFixtureStatus(fixtureData.fixture.status.short),
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

        syncedMatches.push(match);
      }

      console.log(`✅ Synced ${syncedMatches.length} matches`);
      return syncedMatches;
    } catch (error) {
      console.error('Error syncing fixtures:', error);
      throw error;
    }
  }

  async getLiveMatches() {
    try {
      const response = await apiClient.get('/fixtures', {
        params: { live: 'all' },
      });

      return response.data.response;
    } catch (error) {
      console.error('Error fetching live matches:', error);
      throw error;
    }
  }

  // ============================================================
  // STANDINGS
  // ============================================================

  async syncStandingsByLeague(leagueId, season) {
    try {
      const dbLeague = await League.findOne({ apiFootballId: leagueId });
      if (!dbLeague) {
        throw new Error('League not found in database');
      }

      const response = await apiClient.get('/standings', {
        params: {
          league: leagueId,
          season: season,
        },
      });

      const standingsData = response.data.response[0]?.league?.standings[0];
      if (!standingsData) return null;

      const rankings = [];

      for (const entry of standingsData) {
        const team = await Team.findOne({ apiFootballId: entry.team.id });

        rankings.push({
          rank: entry.rank,
          team: team?._id,
          teamName: entry.team.name,
          teamLogo: entry.team.logo,
          
          played: entry.all.played,
          win: entry.all.win,
          draw: entry.all.draw,
          lose: entry.all.lose,
          
          goals: {
            for: entry.all.goals.for,
            against: entry.all.goals.against,
            diff: entry.goalsDiff,
          },
          
          points: entry.points,
          form: entry.form,
          status: entry.status,
          description: entry.description,
        });
      }

      const standing = await Standing.findOneAndUpdate(
        { league: dbLeague._id, season: season },
        {
          league: dbLeague._id,
          season: season,
          rankings: rankings,
          lastSyncedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      console.log(`✅ Synced standings for league ${leagueId}`);
      return standing;
    } catch (error) {
      console.error('Error syncing standings:', error);
      throw error;
    }
  }

  // ============================================================
  // HELPERS
  // ============================================================

  mapFixtureStatus(statusCode) {
    const statusMap = {
      'NS': 'SCHEDULED',
      'TBD': 'SCHEDULED',
      '1H': 'LIVE',
      'HT': 'LIVE',
      '2H': 'LIVE',
      'ET': 'LIVE',
      'P': 'LIVE',
      'FT': 'FINISHED',
      'AET': 'FINISHED',
      'PEN': 'FINISHED',
      'PST': 'POSTPONED',
      'CANC': 'CANCELLED',
      'ABD': 'CANCELLED',
    };

    return statusMap[statusCode] || 'SCHEDULED';
  }
}

module.exports = new FootballApiService();
```

---

## 🎯 Suite dans le Prochain Fichier

Je continue avec :
1. Routes API Backend
2. Composants Frontend React
3. Pages de News et Ligues
4. Service de synchronisation automatique
5. Intégration mobile

Prêt pour la suite ? 🚀
