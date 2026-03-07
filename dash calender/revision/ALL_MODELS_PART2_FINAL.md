# 🗄️ FootballHub+ - MODÈLES 11-18 (Final)

## Modèles Avancés Complets

### 11. MatchLineup Model

```javascript
// src/models/MatchLineup.js
const mongoose = require('mongoose');

const lineupPlayerSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true,
  },
  position: String,
  positionX: Number,
  positionY: Number,
  jerseyNumber: Number,
  isCaptain: Boolean,
  matchStats: {
    goals: Number,
    assists: Number,
    yellowCard: Boolean,
    redCard: Boolean,
    rating: Number,
  },
});

const matchLineupSchema = new mongoose.Schema({
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  formation: String,
  startingEleven: [lineupPlayerSchema],
  substitutes: [lineupPlayerSchema],
  coach: {
    name: String,
    photo: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('MatchLineup', matchLineupSchema);
```

### 12. NewsArticle Model

```javascript
// src/models/NewsArticle.js
const mongoose = require('mongoose');

const newsArticleSchema = new mongoose.Schema({
  source: String,
  sourceUrl: String,
  
  title: {
    type: String,
    required: true,
  },
  description: String,
  content: String,
  
  image: String,
  video: String,
  
  category: {
    type: String,
    enum: ['Match', 'Transfer', 'Injury', 'Interview', 'General'],
    default: 'General',
  },
  
  tags: [String],
  
  league: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'League',
  },
  
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  }],
  
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
  
  viewCount: {
    type: Number,
    default: 0,
  },
  
  likeCount: {
    type: Number,
    default: 0,
  },
  
  author: {
    name: String,
    avatar: String,
  },
  
}, {
  timestamps: true,
});

newsArticleSchema.index({ publishedAt: -1 });
newsArticleSchema.index({ category: 1 });
newsArticleSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('NewsArticle', newsArticleSchema);
```

### 13. Standing Model

```javascript
// src/models/Standing.js
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
    form: String,
    status: String,
    description: String,
  }],
  lastSyncedAt: Date,
}, {
  timestamps: true,
});

standingSchema.index({ league: 1, season: -1 });

module.exports = mongoose.model('Standing', standingSchema);
```

### 14. Prediction Model

```javascript
// src/models/Prediction.js
const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true,
  },
  
  predictions: {
    homeWin: Number,
    draw: Number,
    awayWin: Number,
    expectedScore: {
      home: Number,
      away: Number,
    },
    overUnder: {
      over2_5: Number,
      under2_5: Number,
    },
    bothTeamsScore: {
      yes: Number,
      no: Number,
    },
  },
  
  confidence: {
    type: Number,
    min: 0,
    max: 100,
  },
  
  factors: {
    headToHead: Object,
    recentForm: Object,
    homeAdvantage: Number,
    injuries: Array,
    averageGoals: Object,
  },
  
  actualResult: {
    homeScore: Number,
    awayScore: Number,
    outcome: String,
  },
  
  accuracy: Number,
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Prediction', predictionSchema);
```

### 15. Comment Model

```javascript
// src/models/Comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  entityType: {
    type: String,
    enum: ['match', 'news', 'player', 'team'],
    required: true,
  },
  
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  
  content: {
    type: String,
    required: true,
    maxLength: 500,
  },
  
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  },
  
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  
  isHidden: {
    type: Boolean,
    default: false,
  },
  
  reportCount: {
    type: Number,
    default: 0,
  },
  
}, {
  timestamps: true,
});

commentSchema.index({ entityType: 1, entityId: 1 });

module.exports = mongoose.model('Comment', commentSchema);
```

### 16. Video Model

```javascript
// src/models/Video.js
const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  
  url: {
    type: String,
    required: true,
  },
  thumbnail: String,
  duration: Number,
  
  provider: {
    type: String,
    enum: ['youtube', 'dailymotion', 'streamable', 'custom'],
    default: 'youtube',
  },
  providerId: String,
  
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
  },
  
  league: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'League',
  },
  
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  }],
  
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
  }],
  
  type: {
    type: String,
    enum: ['highlight', 'fullMatch', 'interview', 'analysis', 'goal', 'skill'],
    default: 'highlight',
  },
  
  views: {
    type: Number,
    default: 0,
  },
  
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  
  publishedAt: {
    type: Date,
    default: Date.now,
  },
  
  isPublished: {
    type: Boolean,
    default: true,
  },
  
}, {
  timestamps: true,
});

videoSchema.index({ match: 1 });
videoSchema.index({ type: 1, publishedAt: -1 });

module.exports = mongoose.model('Video', videoSchema);
```

### 17. FantasyTeam Model

```javascript
// src/models/FantasyTeam.js
const mongoose = require('mongoose');

const fantasyPlayerSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true,
  },
  position: {
    type: String,
    enum: ['GK', 'DEF', 'MID', 'FWD'],
    required: true,
  },
  isCaptain: Boolean,
  isViceCaptain: Boolean,
  purchasePrice: Number,
  currentValue: Number,
});

const fantasyTeamSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  name: {
    type: String,
    required: true,
  },
  
  league: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'League',
    required: true,
  },
  
  season: Number,
  
  squad: [fantasyPlayerSchema],
  
  formation: {
    type: String,
    default: '4-3-3',
  },
  
  startingEleven: [fantasyPlayerSchema],
  
  budget: {
    type: Number,
    default: 100000000,
  },
  
  remainingBudget: Number,
  
  totalPoints: {
    type: Number,
    default: 0,
  },
  
  gameweekPoints: [{
    gameweek: Number,
    points: Number,
    transfers: Number,
  }],
  
  freeTransfers: {
    type: Number,
    default: 1,
  },
  
  transfersMade: {
    type: Number,
    default: 0,
  },
  
  chipsAvailable: [{
    type: {
      type: String,
      enum: ['wildcard', 'bench_boost', 'triple_captain', 'free_hit'],
    },
    used: Boolean,
    gameweekUsed: Number,
  }],
  
  globalRank: Number,
  countryRank: Number,
  
}, {
  timestamps: true,
});

fantasyTeamSchema.index({ user: 1, league: 1 });
fantasyTeamSchema.index({ totalPoints: -1 });

module.exports = mongoose.model('FantasyTeam', fantasyTeamSchema);
```

### 18. Odds Model

```javascript
// src/models/Odds.js
const mongoose = require('mongoose');

const oddsSchema = new mongoose.Schema({
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true,
  },
  
  bookmaker: {
    name: String,
    logo: String,
  },
  
  matchWinner: {
    home: Number,
    draw: Number,
    away: Number,
  },
  
  overUnder: {
    over0_5: Number,
    under0_5: Number,
    over1_5: Number,
    under1_5: Number,
    over2_5: Number,
    under2_5: Number,
    over3_5: Number,
    under3_5: Number,
  },
  
  bothTeamsScore: {
    yes: Number,
    no: Number,
  },
  
  correctScore: [{
    score: String,
    odds: Number,
  }],
  
  firstGoalscorer: [{
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
    },
    odds: Number,
  }],
  
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  
}, {
  timestamps: true,
});

oddsSchema.index({ match: 1 });

module.exports = mongoose.model('Odds', oddsSchema);
```

---

## 📦 Fichier d'Export Central

```javascript
// src/models/index.js
module.exports = {
  User: require('./User'),
  Member: require('./Member'),
  Event: require('./Event'),
  Ticket: require('./Ticket'),
  Product: require('./Product'),
  Order: require('./Order'),
  League: require('./League'),
  Team: require('./Team'),
  Match: require('./Match'),
  Player: require('./Player'),
  MatchLineup: require('./MatchLineup'),
  NewsArticle: require('./NewsArticle'),
  Standing: require('./Standing'),
  Prediction: require('./Prediction'),
  Comment: require('./Comment'),
  Video: require('./Video'),
  FantasyTeam: require('./FantasyTeam'),
  Odds: require('./Odds'),
};
```

---

## ✅ TOUS les Modèles Créés !

Vous avez maintenant **18 modèles complets** :

### Core Features (6)
1. ✅ User - Authentication & Social
2. ✅ Member - Club Members
3. ✅ Event - Events Management
4. ✅ Ticket - Ticketing avec QR
5. ✅ Product - E-commerce
6. ✅ Order - Orders Management

### Football Data (7)
7. ✅ League - Compétitions
8. ✅ Team - Équipes
9. ✅ Match - Matchs
10. ✅ Player - Joueurs
11. ✅ MatchLineup - Compositions
12. ✅ NewsArticle - Actualités
13. ✅ Standing - Classements

### Advanced Features (5)
14. ✅ Prediction - Prédictions IA
15. ✅ Comment - Social Comments
16. ✅ Video - Video Highlights
17. ✅ FantasyTeam - Fantasy League
18. ✅ Odds - Betting Odds

---

## 🎯 Prochaine Étape

Maintenant que TOUS les modèles sont créés, je vais créer :

1. ✅ Toutes les Routes API (11 fichiers)
2. ✅ Tous les Services (7 fichiers)
3. ✅ Middleware (Auth, Validation, Error Handling)
4. ✅ Configuration serveur principale
5. ✅ Seed data

Voulez-vous que je continue avec les Routes maintenant ? 🚀
