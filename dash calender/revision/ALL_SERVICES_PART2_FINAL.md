# ⚙️ FootballHub+ - TOUS LES SERVICES (SUITE ET FIN)

## Service 3 : Prediction Service (IA Prédictions)

```javascript
// src/services/predictionService.js
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

      if (!match) {
        throw new Error('Match not found');
      }

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
          homeAdvantage: 0.1,
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
      const isHome = match.homeTeam.team?.toString() === teamId.toString();
      const scored = isHome
        ? match.score.fulltime.home
        : match.score.fulltime.away;
      const conceded = isHome
        ? match.score.fulltime.away
        : match.score.fulltime.home;

      if (scored !== undefined && conceded !== undefined) {
        goalsScored += scored;
        goalsConceded += conceded;

        if (scored > conceded) wins++;
        else if (scored === conceded) draws++;
        else losses++;
      }
    });

    return {
      form: `${wins}W ${draws}D ${losses}L`,
      points: wins * 3 + draws,
      avgGoalsScored: last5Matches.length > 0 ? goalsScored / last5Matches.length : 0,
      avgGoalsConceded: last5Matches.length > 0 ? goalsConceded / last5Matches.length : 0,
      wins,
      draws,
      losses,
    };
  }

  // ============================================================
  // CALCULATE PROBABILITIES
  // ============================================================

  calculateProbabilities(homeStats, awayStats, h2h, homeAdvantage = true) {
    // Base probabilities
    let homeWin = 33.33;
    let draw = 33.33;
    let awayWin = 33.33;

    // Form factor (max 20%)
    const homeFormFactor = (homeStats.points / 15) * 20;
    const awayFormFactor = (awayStats.points / 15) * 20;

    homeWin += homeFormFactor;
    awayWin += awayFormFactor;

    // Home advantage (10%)
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

      if (homeScore !== undefined && awayScore !== undefined) {
        if (homeScore > awayScore) {
          if (match.homeTeam.team?.toString() === homeTeamId.toString()) {
            homeWins++;
          } else {
            awayWins++;
          }
        } else if (homeScore === awayScore) {
          draws++;
        } else {
          if (match.awayTeam.team?.toString() === homeTeamId.toString()) {
            homeWins++;
          } else {
            awayWins++;
          }
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

## Service 4 : Notification Service (Push Notifications)

```javascript
// src/services/notificationService.js
const User = require('../models/User');
const Match = require('../models/Match');

class NotificationService {
  constructor() {
    // Firebase Admin will be initialized if credentials are available
    this.admin = null;
    try {
      if (process.env.FIREBASE_PROJECT_ID) {
        this.admin = require('firebase-admin');
        const serviceAccount = require('../../config/firebase-service-account.json');
        
        if (!this.admin.apps.length) {
          this.admin.initializeApp({
            credential: this.admin.credential.cert(serviceAccount),
          });
        }
        console.log('✅ Firebase Admin initialized');
      }
    } catch (error) {
      console.log('⚠️  Firebase not configured, notifications disabled');
    }
  }

  // ============================================================
  // SEND TO USER
  // ============================================================

  async sendToUser(userId, notification) {
    if (!this.admin) {
      console.log('Firebase not configured');
      return;
    }

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

      const response = await this.admin.messaging().send(message);
      console.log('✅ Notification sent:', response);
      return response;
    } catch (error) {
      console.error('❌ Notification error:', error.message);
    }
  }

  // ============================================================
  // SEND TO MULTIPLE USERS
  // ============================================================

  async sendToMultiple(userIds, notification) {
    if (!this.admin) return;

    try {
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

      const response = await this.admin.messaging().sendMulticast(message);
      console.log(`✅ Sent to ${response.successCount} devices`);
      return response;
    } catch (error) {
      console.error('❌ Multicast error:', error.message);
    }
  }

  // ============================================================
  // SEND TO TOPIC
  // ============================================================

  async sendToTopic(topic, notification) {
    if (!this.admin) return;

    try {
      const message = {
        topic,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data || {},
      };

      const response = await this.admin.messaging().send(message);
      console.log('✅ Topic notification sent:', response);
      return response;
    } catch (error) {
      console.error('❌ Topic notification error:', error.message);
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

    const users = await User.find({
      $or: [
        { favoriteTeams: { $in: [match.homeTeam.team, match.awayTeam.team] } },
        { favoriteLeagues: match.league._id },
      ],
      'notificationSettings.matchStart': true,
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
      body: `${goalData.player} (${goalData.team})`,
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
      'notificationSettings.matchResult': true,
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

## Service 5 : UEFA Scraper

```javascript
// src/services/uefaScraper.js
const axios = require('axios');
const League = require('../models/League');
const Team = require('../models/Team');
const Match = require('../models/Match');

class UEFAScraper {
  constructor() {
    this.apiURL = 'https://match.uefa.com/v5/';
    this.client = axios.create({
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
      },
    });
  }

  // ============================================================
  // SCRAPE CHAMPIONS LEAGUE
  // ============================================================

  async scrapeChampionsLeague(season = '2024') {
    try {
      console.log('🏆 Scraping Champions League...');

      const matchesURL = `${this.apiURL}matches?competitionId=1&seasonYear=${season}`;
      const response = await this.client.get(matchesURL);
      const matches = response.data;

      for (const match of matches) {
        await this.processUEFAMatch(match, 'Champions League');
      }

      console.log('✅ Champions League scraping completed');
    } catch (error) {
      console.error('❌ Champions League error:', error.message);
    }
  }

  // ============================================================
  // PROCESS UEFA MATCH
  // ============================================================

  async processUEFAMatch(matchData, leagueName) {
    try {
      const league = await League.findOneAndUpdate(
        { name: leagueName },
        {
          name: leagueName,
          type: 'Cup',
          country: {
            name: 'Europe',
            code: 'EU',
          },
          isFeatured: true,
          isActive: true,
          priority: 10,
        },
        { upsert: true, new: true }
      );

      const homeTeam = await this.processUEFATeam(matchData.homeTeam);
      const awayTeam = await this.processUEFATeam(matchData.awayTeam);

      await Match.findOneAndUpdate(
        { apiFootballId: matchData.id },
        {
          apiFootballId: matchData.id,
          league: league._id,
          season: matchData.season?.year || new Date().getFullYear(),
          round: matchData.round?.name || matchData.phase,

          homeTeam: {
            team: homeTeam._id,
            name: matchData.homeTeam.name,
            logo: matchData.homeTeam.logoUrl,
          },
          awayTeam: {
            team: awayTeam._id,
            name: matchData.awayTeam.name,
            logo: matchData.awayTeam.logoUrl,
          },

          matchDate: new Date(matchData.kickOffTime?.dateTime),

          venue: {
            name: matchData.stadium?.name,
            city: matchData.stadium?.city,
          },

          status: this.mapUEFAStatus(matchData.status),

          score: {
            fulltime: {
              home: matchData.score?.total?.home,
              away: matchData.score?.total?.away,
            },
          },

          lastSyncedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error('Error processing UEFA match:', error.message);
    }
  }

  // ============================================================
  // PROCESS UEFA TEAM
  // ============================================================

  async processUEFATeam(teamData) {
    const team = await Team.findOneAndUpdate(
      { apiFootballId: teamData.id },
      {
        apiFootballId: teamData.id,
        name: teamData.name,
        logo: teamData.logoUrl,
        country: teamData.country?.name,
        lastSyncedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return team;
  }

  // ============================================================
  // MAP UEFA STATUS
  // ============================================================

  mapUEFAStatus(status) {
    const statusMap = {
      'SCHEDULED': 'SCHEDULED',
      'PLAYING': 'LIVE',
      'FINISHED': 'FINISHED',
      'POSTPONED': 'POSTPONED',
      'CANCELLED': 'CANCELLED',
    };

    return statusMap[status] || 'SCHEDULED';
  }

  // ============================================================
  // FULL UEFA SYNC
  // ============================================================

  async fullUEFASync(season = '2024') {
    console.log('🚀 Starting full UEFA sync...');

    try {
      await this.scrapeChampionsLeague(season);
      console.log('✅ Full UEFA sync completed');
    } catch (error) {
      console.error('❌ Full UEFA sync error:', error);
    }
  }
}

module.exports = new UEFAScraper();
```

## Service 6 : WebSocket Service (Temps Réel)

```javascript
// src/services/websocketService.js
const WebSocket = require('ws');
const Match = require('../models/Match');

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Map();
  }

  initialize(server) {
    this.wss = new WebSocket.Server({
      server,
      path: '/ws',
    });

    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();

      console.log(`✅ WebSocket client connected: ${clientId}`);

      this.clients.set(clientId, {
        ws,
        subscriptions: new Set(),
      });

      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message);
          await this.handleMessage(clientId, data);
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      ws.on('close', () => {
        console.log(`❌ WebSocket client disconnected: ${clientId}`);
        this.clients.delete(clientId);
      });

      // Send welcome
      this.sendToClient(clientId, {
        type: 'connected',
        clientId,
        timestamp: new Date().toISOString(),
      });
    });

    // Start live broadcast
    this.startLiveBroadcast();

    console.log('✅ WebSocket server initialized');
  }

  async handleMessage(clientId, data) {
    const { type, payload } = data;

    switch (type) {
      case 'subscribe':
        this.handleSubscribe(clientId, payload);
        break;
      case 'unsubscribe':
        this.handleUnsubscribe(clientId, payload);
        break;
      case 'ping':
        this.sendToClient(clientId, { type: 'pong' });
        break;
    }
  }

  handleSubscribe(clientId, payload) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.subscriptions.add(payload.channel);
    this.sendToClient(clientId, {
      type: 'subscribed',
      channel: payload.channel,
    });
  }

  handleUnsubscribe(clientId, payload) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.subscriptions.delete(payload.channel);
    this.sendToClient(clientId, {
      type: 'unsubscribed',
      channel: payload.channel,
    });
  }

  sendToClient(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) return;

    try {
      client.ws.send(JSON.stringify(data));
    } catch (error) {
      console.error('Error sending to client:', error);
    }
  }

  broadcast(channel, data) {
    let count = 0;

    this.clients.forEach((client, clientId) => {
      if (client.subscriptions.has(channel) || channel === 'all') {
        this.sendToClient(clientId, {
          type: 'broadcast',
          channel,
          data,
          timestamp: new Date().toISOString(),
        });
        count++;
      }
    });

    return count;
  }

  async startLiveBroadcast() {
    setInterval(async () => {
      try {
        const liveMatches = await Match.find({ status: 'LIVE' })
          .populate('league', 'name logo')
          .select('homeTeam awayTeam score elapsed status league');

        if (liveMatches.length > 0) {
          this.broadcast('live-scores', liveMatches);
        }
      } catch (error) {
        console.error('Live broadcast error:', error);
      }
    }, 10000); // Every 10 seconds

    console.log('🔴 Live broadcast started');
  }

  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  getStats() {
    const subscriptions = {};

    this.clients.forEach((client) => {
      client.subscriptions.forEach((channel) => {
        subscriptions[channel] = (subscriptions[channel] || 0) + 1;
      });
    });

    return {
      totalClients: this.clients.size,
      subscriptions,
    };
  }
}

module.exports = new WebSocketService();
```

## Service 7 : Fantasy Service

```javascript
// src/services/fantasyService.js
const FantasyTeam = require('../models/FantasyTeam');

class FantasyService {
  // ============================================================
  // CALCULATE PLAYER POINTS
  // ============================================================

  calculatePlayerPoints(playerStats, position) {
    let points = 0;

    // Base points for playing
    if (playerStats.minutesPlayed >= 60) points += 2;
    else if (playerStats.minutesPlayed > 0) points += 1;

    // Goals
    if (position === 'FWD') points += playerStats.goals * 4;
    else if (position === 'MID') points += playerStats.goals * 5;
    else if (position === 'DEF' || position === 'GK') points += playerStats.goals * 6;

    // Assists
    points += playerStats.assists * 3;

    // Clean sheet
    if ((position === 'DEF' || position === 'GK') && playerStats.cleanSheet) {
      points += 4;
    }

    // Yellow card
    if (playerStats.yellowCard) points -= 1;

    // Red card
    if (playerStats.redCard) points -= 3;

    return Math.max(0, points);
  }

  // ============================================================
  // UPDATE RANKINGS
  // ============================================================

  async updateRankings() {
    const teams = await FantasyTeam.find({})
      .sort({ totalPoints: -1 })
      .populate('user', 'country');

    // Global rankings
    teams.forEach((team, index) => {
      team.globalRank = index + 1;
    });

    await Promise.all(teams.map((team) => team.save()));
  }
}

module.exports = new FantasyService();
```

---

## ✅ TOUS LES 7 SERVICES CRÉÉS !

1. ✅ **footballApi.js** - API-Football integration
2. ✅ **syncService.js** - Auto synchronization
3. ✅ **predictionService.js** - AI predictions
4. ✅ **notificationService.js** - Push notifications
5. ✅ **uefaScraper.js** - UEFA data import
6. ✅ **websocketService.js** - Real-time WebSocket
7. ✅ **fantasyService.js** - Fantasy league logic

**Prochaine étape** : Seed Data + Middleware + CRON Jobs

Voulez-vous que je continue ? 🚀
