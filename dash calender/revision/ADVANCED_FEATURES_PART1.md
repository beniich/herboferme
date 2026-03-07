# 🚀 FootballHub+ - Fonctionnalités Avancées Complètes

## 📋 Table des Matières
1. [Notifications Push](#notifications-push)
2. [Système de Favoris](#système-de-favoris)
3. [Prédictions IA](#prédictions-ia)
4. [Social Features](#social-features)
5. [Heat Maps & Stats Avancées](#heat-maps--stats-avancées)
6. [Video Highlights](#video-highlights)
7. [Fantasy League](#fantasy-league)
8. [Betting Odds](#betting-odds)
9. [Import UEFA](#import-uefa)
10. [Formations Prédéfinies](#formations-prédéfinies)

---

## 🔔 1. Notifications Push

### Backend - Notification Service

```javascript
// server/src/services/notificationService.js

const admin = require('firebase-admin');
const User = require('../models/User');
const Match = require('../models/Match');

// Initialize Firebase Admin
const serviceAccount = require('../../config/firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

class NotificationService {
  // ============================================================
  // SEND NOTIFICATION
  // ============================================================

  async sendToUser(userId, notification) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.pushToken) {
        console.log('User has no push token');
        return;
      }

      const message = {
        token: user.pushToken,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data || {},
        android: {
          priority: 'high',
          notification: {
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
      console.log('✅ Notification sent:', response);
      return response;
    } catch (error) {
      console.error('❌ Notification error:', error);
      throw error;
    }
  }

  // ============================================================
  // SEND TO MULTIPLE USERS
  // ============================================================

  async sendToMultiple(userIds, notification) {
    const users = await User.find({
      _id: { $in: userIds },
      pushToken: { $exists: true, $ne: null },
    });

    const tokens = users.map((u) => u.pushToken);

    if (tokens.length === 0) return;

    const message = {
      tokens,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data || {},
    };

    try {
      const response = await admin.messaging().sendMulticast(message);
      console.log(`✅ Sent to ${response.successCount} devices`);
      return response;
    } catch (error) {
      console.error('❌ Multicast error:', error);
      throw error;
    }
  }

  // ============================================================
  // TOPIC-BASED NOTIFICATIONS
  // ============================================================

  async sendToTopic(topic, notification) {
    const message = {
      topic,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data || {},
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('✅ Topic notification sent:', response);
      return response;
    } catch (error) {
      console.error('❌ Topic notification error:', error);
      throw error;
    }
  }

  // ============================================================
  // MATCH NOTIFICATIONS
  // ============================================================

  async notifyMatchStart(matchId) {
    const match = await Match.findById(matchId)
      .populate('league', 'name')
      .populate('homeTeam.team', 'name')
      .populate('awayTeam.team', 'name');

    if (!match) return;

    // Find users who favorited this match's teams or league
    const users = await User.find({
      $or: [
        { favoriteTeams: { $in: [match.homeTeam.team, match.awayTeam.team] } },
        { favoriteLeagues: match.league._id },
      ],
    });

    await this.sendToMultiple(
      users.map((u) => u._id),
      {
        title: '⚽ Match en direct !',
        body: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
        data: {
          type: 'match_start',
          matchId: match._id.toString(),
        },
      }
    );
  }

  async notifyGoal(matchId, goalData) {
    const match = await Match.findById(matchId)
      .populate('homeTeam.team', 'name')
      .populate('awayTeam.team', 'name');

    await this.sendToTopic(`match_${matchId}`, {
      title: '⚽ BUUUUT !',
      body: `${goalData.player} (${goalData.team}) - ${match.homeTeam.name} ${match.score.fulltime.home} - ${match.score.fulltime.away} ${match.awayTeam.name}`,
      data: {
        type: 'goal',
        matchId: matchId.toString(),
      },
    });
  }

  async notifyMatchResult(matchId) {
    const match = await Match.findById(matchId)
      .populate('homeTeam.team', 'name')
      .populate('awayTeam.team', 'name');

    const users = await User.find({
      favoriteTeams: { $in: [match.homeTeam.team, match.awayTeam.team] },
    });

    await this.sendToMultiple(
      users.map((u) => u._id),
      {
        title: '🏁 Match terminé',
        body: `${match.homeTeam.name} ${match.score.fulltime.home} - ${match.score.fulltime.away} ${match.awayTeam.name}`,
        data: {
          type: 'match_result',
          matchId: matchId.toString(),
        },
      }
    );
  }
}

module.exports = new NotificationService();
```

---

## ⭐ 2. Système de Favoris

### User Model Extended

```javascript
// server/src/models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  
  // Profile
  firstName: String,
  lastName: String,
  avatar: String,
  country: String,
  
  // Push Notifications
  pushToken: String,
  notificationSettings: {
    matchStart: { type: Boolean, default: true },
    goals: { type: Boolean, default: true },
    matchResult: { type: Boolean, default: true },
    news: { type: Boolean, default: false },
  },
  
  // Favorites
  favoriteLeagues: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'League',
  }],
  favoriteTeams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  }],
  favoritePlayers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
  }],
  
  // Preferences
  preferences: {
    defaultLeague: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'League',
    },
    language: {
      type: String,
      default: 'fr',
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'dark',
    },
  },
  
  // Fantasy League
  fantasyTeams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FantasyTeam',
  }],
  
  // Social
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
```

### Favorites Routes

```javascript
// server/src/routes/favorites.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// GET /api/favorites - Get user favorites
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('favoriteLeagues', 'name logo country')
      .populate('favoriteTeams', 'name logo')
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
router.post('/leagues/:id', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.favoriteLeagues.includes(req.params.id)) {
      user.favoriteLeagues.push(req.params.id);
      await user.save();
    }

    res.json({ message: 'League added to favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/favorites/leagues/:id - Remove league from favorites
router.delete('/leagues/:id', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.favoriteLeagues = user.favoriteLeagues.filter(
      (l) => l.toString() !== req.params.id
    );
    await user.save();

    res.json({ message: 'League removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Similar routes for teams and players...

module.exports = router;
```

---

## 🤖 3. Prédictions IA

### Prediction Model

```javascript
// server/src/models/Prediction.js

const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true,
  },
  
  // AI Predictions
  predictions: {
    homeWin: Number,      // Probability 0-100
    draw: Number,         // Probability 0-100
    awayWin: Number,      // Probability 0-100
    
    expectedScore: {
      home: Number,
      away: Number,
    },
    
    overUnder: {
      over2_5: Number,    // Probability
      under2_5: Number,
    },
    
    bothTeamsScore: {
      yes: Number,
      no: Number,
    },
  },
  
  // Confidence Score
  confidence: {
    type: Number,
    min: 0,
    max: 100,
  },
  
  // Factors Used
  factors: {
    headToHead: Object,
    recentForm: Object,
    homeAdvantage: Number,
    injuries: Array,
    averageGoals: Object,
  },
  
  // Result (after match)
  actualResult: {
    homeScore: Number,
    awayScore: Number,
    outcome: {
      type: String,
      enum: ['home', 'draw', 'away'],
    },
  },
  
  accuracy: Number,
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Prediction', predictionSchema);
```

### AI Prediction Service

```javascript
// server/src/services/predictionService.js

const Match = require('../models/Match');
const Team = require('../models/Team');
const Prediction = require('../models/Prediction');

class PredictionService {
  // ============================================================
  // PREDICT MATCH OUTCOME
  // ============================================================

  async predictMatch(matchId) {
    try {
      const match = await Match.findById(matchId)
        .populate('homeTeam.team')
        .populate('awayTeam.team');

      // Get team stats
      const homeStats = await this.getTeamStats(match.homeTeam.team);
      const awayStats = await this.getTeamStats(match.awayTeam.team);

      // Get head-to-head
      const h2h = await this.getHeadToHead(
        match.homeTeam.team,
        match.awayTeam.team
      );

      // Calculate probabilities
      const predictions = this.calculateProbabilities(
        homeStats,
        awayStats,
        h2h,
        true // home advantage
      );

      // Save prediction
      const prediction = await Prediction.create({
        match: matchId,
        predictions,
        confidence: predictions.confidence,
        factors: {
          headToHead: h2h,
          recentForm: {
            home: homeStats.form,
            away: awayStats.form,
          },
          homeAdvantage: 0.1, // 10% boost
          averageGoals: {
            home: homeStats.avgGoalsScored,
            away: awayStats.avgGoalsScored,
          },
        },
      });

      return prediction;
    } catch (error) {
      console.error('Prediction error:', error);
      throw error;
    }
  }

  // ============================================================
  // GET TEAM STATS
  // ============================================================

  async getTeamStats(teamId) {
    const last5Matches = await Match.find({
      $or: [
        { 'homeTeam.team': teamId },
        { 'awayTeam.team': teamId },
      ],
      status: 'FINISHED',
    })
      .sort({ matchDate: -1 })
      .limit(5);

    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsScored = 0;
    let goalsConceded = 0;

    last5Matches.forEach((match) => {
      const isHome = match.homeTeam.team.toString() === teamId.toString();
      const scored = isHome ? match.score.fulltime.home : match.score.fulltime.away;
      const conceded = isHome ? match.score.fulltime.away : match.score.fulltime.home;

      goalsScored += scored;
      goalsConceded += conceded;

      if (scored > conceded) wins++;
      else if (scored === conceded) draws++;
      else losses++;
    });

    return {
      form: `${wins}W ${draws}D ${losses}L`,
      points: wins * 3 + draws,
      avgGoalsScored: goalsScored / 5,
      avgGoalsConceded: goalsConceded / 5,
      wins,
      draws,
      losses,
    };
  }

  // ============================================================
  // CALCULATE PROBABILITIES
  // ============================================================

  calculateProbabilities(homeStats, awayStats, h2h, homeAdvantage = true) {
    // Simple algorithm (can be replaced with ML model)
    
    // Base probabilities
    let homeWin = 33.33;
    let draw = 33.33;
    let awayWin = 33.33;

    // Form factor
    const homeFormFactor = (homeStats.points / 15) * 20; // Max 20%
    const awayFormFactor = (awayStats.points / 15) * 20;

    homeWin += homeFormFactor;
    awayWin += awayFormFactor;

    // Home advantage
    if (homeAdvantage) {
      homeWin += 10;
      awayWin -= 5;
      draw -= 5;
    }

    // Head-to-head
    if (h2h.homeWins > h2h.awayWins) {
      homeWin += 5;
      awayWin -= 5;
    } else if (h2h.awayWins > h2h.homeWins) {
      awayWin += 5;
      homeWin -= 5;
    }

    // Normalize to 100%
    const total = homeWin + draw + awayWin;
    homeWin = (homeWin / total) * 100;
    draw = (draw / total) * 100;
    awayWin = (awayWin / total) * 100;

    // Expected score
    const expectedHomeGoals = homeStats.avgGoalsScored * 1.1; // Home boost
    const expectedAwayGoals = awayStats.avgGoalsScored;

    // Over/Under 2.5
    const totalExpected = expectedHomeGoals + expectedAwayGoals;
    const over2_5 = totalExpected > 2.5 ? 60 : 40;

    // Both teams score
    const bothScore = 
      homeStats.avgGoalsScored > 0.8 && awayStats.avgGoalsScored > 0.8
        ? 65
        : 35;

    // Confidence (0-100)
    const confidence = Math.min(
      100,
      Math.abs(homeWin - awayWin) + (homeStats.points + awayStats.points) / 2
    );

    return {
      homeWin: Math.round(homeWin * 10) / 10,
      draw: Math.round(draw * 10) / 10,
      awayWin: Math.round(awayWin * 10) / 10,
      expectedScore: {
        home: Math.round(expectedHomeGoals * 10) / 10,
        away: Math.round(expectedAwayGoals * 10) / 10,
      },
      overUnder: {
        over2_5: Math.round(over2_5),
        under2_5: Math.round(100 - over2_5),
      },
      bothTeamsScore: {
        yes: Math.round(bothScore),
        no: Math.round(100 - bothScore),
      },
      confidence: Math.round(confidence),
    };
  }

  // ============================================================
  // HEAD TO HEAD
  // ============================================================

  async getHeadToHead(homeTeamId, awayTeamId) {
    const matches = await Match.find({
      $or: [
        {
          'homeTeam.team': homeTeamId,
          'awayTeam.team': awayTeamId,
        },
        {
          'homeTeam.team': awayTeamId,
          'awayTeam.team': homeTeamId,
        },
      ],
      status: 'FINISHED',
    })
      .sort({ matchDate: -1 })
      .limit(10);

    let homeWins = 0;
    let draws = 0;
    let awayWins = 0;

    matches.forEach((match) => {
      const homeScore = match.score.fulltime.home;
      const awayScore = match.score.fulltime.away;

      if (homeScore > awayScore) {
        if (match.homeTeam.team.toString() === homeTeamId.toString()) {
          homeWins++;
        } else {
          awayWins++;
        }
      } else if (homeScore === awayScore) {
        draws++;
      } else {
        if (match.awayTeam.team.toString() === homeTeamId.toString()) {
          homeWins++;
        } else {
          awayWins++;
        }
      }
    });

    return {
      totalMatches: matches.length,
      homeWins,
      draws,
      awayWins,
    };
  }
}

module.exports = new PredictionService();
```

---

## 💬 4. Social Features

### Comment & Like Models

```javascript
// server/src/models/Comment.js

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Can comment on different things
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
  
  // Nested comments (replies)
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  },
  
  // Engagement
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  
  // Moderation
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

commentSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
commentSchema.index({ user: 1 });

module.exports = mongoose.model('Comment', commentSchema);
```

Suite dans le prochain fichier avec Heat Maps, Video Highlights, Fantasy League et Import UEFA ! 🚀
