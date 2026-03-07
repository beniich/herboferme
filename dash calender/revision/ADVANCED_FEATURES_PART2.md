# 🚀 FootballHub+ - Fonctionnalités Avancées Partie 2

## 📊 5. Heat Maps & Statistiques Avancées

### Player Heat Map Component

```typescript
// src/components/stats/PlayerHeatMap.tsx

import React from 'react';

interface HeatMapPoint {
  x: number; // 0-100
  y: number; // 0-100
  intensity: number; // 0-1
}

interface PlayerHeatMapProps {
  playerId: string;
  data: HeatMapPoint[];
  playerName: string;
}

export const PlayerHeatMap: React.FC<PlayerHeatMapProps> = ({
  playerId,
  data,
  playerName,
}) => {
  // Create grid (10x10)
  const gridSize = 10;
  const heatGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));

  // Populate grid with data
  data.forEach((point) => {
    const gridX = Math.floor((point.x / 100) * gridSize);
    const gridY = Math.floor((point.y / 100) * gridSize);
    
    if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
      heatGrid[gridY][gridX] += point.intensity;
    }
  });

  // Find max value for normalization
  const maxValue = Math.max(...heatGrid.flat());

  // Get color based on intensity
  const getHeatColor = (value: number) => {
    if (maxValue === 0) return 'rgba(0, 0, 0, 0)';
    
    const intensity = value / maxValue;
    
    if (intensity === 0) return 'rgba(0, 0, 0, 0)';
    if (intensity < 0.2) return 'rgba(59, 130, 246, 0.3)'; // Blue
    if (intensity < 0.4) return 'rgba(34, 197, 94, 0.4)';  // Green
    if (intensity < 0.6) return 'rgba(251, 191, 36, 0.5)'; // Yellow
    if (intensity < 0.8) return 'rgba(249, 115, 22, 0.6)'; // Orange
    return 'rgba(239, 68, 68, 0.7)'; // Red
  };

  return (
    <div className="relative w-full aspect-[16/9] bg-gradient-to-b from-green-600 to-green-700 rounded-2xl overflow-hidden">
      {/* Field Lines (simplified) */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect
          x="2%"
          y="2%"
          width="96%"
          height="96%"
          fill="none"
          stroke="white"
          strokeWidth="2"
          opacity="0.3"
        />
        <line
          x1="50%"
          y1="2%"
          x2="50%"
          y2="98%"
          stroke="white"
          strokeWidth="2"
          opacity="0.3"
        />
      </svg>

      {/* Heat Map Grid */}
      <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
        {heatGrid.map((row, rowIndex) =>
          row.map((value, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="transition-all duration-300"
              style={{
                backgroundColor: getHeatColor(value),
              }}
            />
          ))
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md rounded-xl p-3 border border-white/20">
        <div className="text-xs text-white mb-2 font-bold">{playerName}</div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-300">Faible</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(59, 130, 246, 0.5)' }} />
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(34, 197, 94, 0.5)' }} />
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(251, 191, 36, 0.6)' }} />
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(249, 115, 22, 0.7)' }} />
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.8)' }} />
          </div>
          <span className="text-xs text-gray-300">Élevée</span>
        </div>
      </div>

      {/* Title */}
      <div className="absolute top-4 left-4 px-4 py-2 bg-black/70 backdrop-blur-md rounded-xl border border-white/20">
        <span className="text-sm font-bold text-white">Heat Map - Activité</span>
      </div>
    </div>
  );
};
```

---

## 🎥 6. Video Highlights Intégration

### Video Model

```javascript
// server/src/models/Video.js

const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  
  // Video sources
  url: {
    type: String,
    required: true,
  },
  thumbnail: String,
  duration: Number, // seconds
  
  // Provider
  provider: {
    type: String,
    enum: ['youtube', 'dailymotion', 'streamable', 'custom'],
    default: 'youtube',
  },
  providerId: String, // Video ID on provider platform
  
  // Relations
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
  
  // Type
  type: {
    type: String,
    enum: ['highlight', 'fullMatch', 'interview', 'analysis', 'goal', 'skill'],
    default: 'highlight',
  },
  
  // Engagement
  views: {
    type: Number,
    default: 0,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  
}, {
  timestamps: true,
});

videoSchema.index({ match: 1 });
videoSchema.index({ type: 1, publishedAt: -1 });

module.exports = mongoose.model('Video', videoSchema);
```

### Video Component

```typescript
// src/components/video/VideoPlayer.tsx

import React, { useState } from 'react';
import { Play, Share2, Heart, Eye } from 'lucide-react';
import { hapticFeedback } from '@/utils/haptics';

interface VideoPlayerProps {
  video: {
    id: string;
    title: string;
    thumbnail: string;
    url: string;
    provider: 'youtube' | 'dailymotion' | 'custom';
    providerId: string;
    duration: number;
    views: number;
    likes: number;
    match?: {
      homeTeam: string;
      awayTeam: string;
      score: string;
    };
  };
  onLike?: () => void;
  onShare?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  onLike,
  onShare,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const getEmbedUrl = () => {
    switch (video.provider) {
      case 'youtube':
        return `https://www.youtube.com/embed/${video.providerId}?autoplay=1`;
      case 'dailymotion':
        return `https://www.dailymotion.com/embed/video/${video.providerId}?autoplay=1`;
      default:
        return video.url;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlay = async () => {
    await hapticFeedback.medium();
    setIsPlaying(true);
  };

  const handleLike = async () => {
    await hapticFeedback.light();
    onLike?.();
  };

  const handleShare = async () => {
    await hapticFeedback.light();
    onShare?.();
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-black">
      {/* Video Player or Thumbnail */}
      {isPlaying ? (
        <div className="relative w-full aspect-video">
          <iframe
            src={getEmbedUrl()}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="relative w-full aspect-video cursor-pointer" onClick={handlePlay}>
          {/* Thumbnail */}
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center group hover:bg-black/50 transition-colors">
            {/* Play Button */}
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
              <Play size={40} className="text-black ml-1" fill="currentColor" />
            </div>
          </div>

          {/* Duration Badge */}
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 rounded-lg">
            <span className="text-xs font-bold text-white">
              {formatDuration(video.duration)}
            </span>
          </div>

          {/* Match Score (if available) */}
          {video.match && (
            <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-lg">
              <span className="text-xs font-bold text-white">
                {video.match.homeTeam} {video.match.score} {video.match.awayTeam}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Video Info */}
      <div className="p-4 bg-surface-dark">
        <h3 className="text-lg font-bold text-white mb-3 line-clamp-2">
          {video.title}
        </h3>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Eye size={16} />
              <span>{video.views.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Heart size={16} className="text-red-500" />
              <span className="text-sm font-medium text-white">
                {video.likes}
              </span>
            </button>

            <button
              onClick={handleShare}
              className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Share2 size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## 🏆 7. Fantasy League Système

### Fantasy Team Model

```javascript
// server/src/models/FantasyTeam.js

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
  isCaptain: {
    type: Boolean,
    default: false,
  },
  isViceCaptain: {
    type: Boolean,
    default: false,
  },
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
  
  // League/Competition
  league: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'League',
    required: true,
  },
  season: Number,
  
  // Squad (15 players: 2 GK, 5 DEF, 5 MID, 3 FWD)
  squad: [fantasyPlayerSchema],
  
  // Starting 11
  formation: {
    type: String,
    default: '4-3-3',
  },
  startingEleven: [fantasyPlayerSchema],
  
  // Budget
  budget: {
    type: Number,
    default: 100000000, // 100M
  },
  remainingBudget: Number,
  
  // Points
  totalPoints: {
    type: Number,
    default: 0,
  },
  gameweekPoints: [{
    gameweek: Number,
    points: Number,
    transfers: Number,
  }],
  
  // Transfers
  freeTransfers: {
    type: Number,
    default: 1,
  },
  transfersMade: {
    type: Number,
    default: 0,
  },
  
  // Chips
  chipsAvailable: [{
    type: {
      type: String,
      enum: ['wildcard', 'bench_boost', 'triple_captain', 'free_hit'],
    },
    used: Boolean,
    gameweekUsed: Number,
  }],
  
  // Rank
  globalRank: Number,
  countryRank: Number,
  
}, {
  timestamps: true,
});

fantasyTeamSchema.index({ user: 1, league: 1 });
fantasyTeamSchema.index({ totalPoints: -1 });

module.exports = mongoose.model('FantasyTeam', fantasyTeamSchema);
```

### Fantasy Points Calculation

```javascript
// server/src/services/fantasyService.js

class FantasyService {
  // ============================================================
  // CALCULATE PLAYER POINTS
  // ============================================================

  calculatePlayerPoints(playerStats, position) {
    let points = 0;

    // Base points for playing
    if (playerStats.minutesPlayed >= 60) {
      points += 2;
    } else if (playerStats.minutesPlayed > 0) {
      points += 1;
    }

    // Goals
    if (position === 'FWD') {
      points += playerStats.goals * 4;
    } else if (position === 'MID') {
      points += playerStats.goals * 5;
    } else if (position === 'DEF' || position === 'GK') {
      points += playerStats.goals * 6;
    }

    // Assists
    points += playerStats.assists * 3;

    // Clean sheet (for defenders and goalkeepers)
    if ((position === 'DEF' || position === 'GK') && playerStats.cleanSheet) {
      points += 4;
    } else if (position === 'MID' && playerStats.cleanSheet) {
      points += 1;
    }

    // Saves (goalkeepers)
    if (position === 'GK') {
      points += Math.floor(playerStats.saves / 3); // 1 point per 3 saves
    }

    // Penalty save
    if (playerStats.penaltySaved) {
      points += 5;
    }

    // Penalty miss
    if (playerStats.penaltyMissed) {
      points -= 2;
    }

    // Yellow card
    if (playerStats.yellowCard) {
      points -= 1;
    }

    // Red card
    if (playerStats.redCard) {
      points -= 3;
    }

    // Own goal
    if (playerStats.ownGoal) {
      points -= 2;
    }

    // Goals conceded (for GK and DEF)
    if (position === 'GK' || position === 'DEF') {
      const goalsConceded = playerStats.goalsConceded || 0;
      points -= Math.floor(goalsConceded / 2); // -1 per 2 goals conceded
    }

    return Math.max(0, points); // Can't go below 0
  }

  // ============================================================
  // UPDATE GAMEWEEK POINTS
  // ============================================================

  async updateGameweekPoints(gameweek) {
    const fantasyTeams = await FantasyTeam.find({}).populate('startingEleven.player');

    for (const team of fantasyTeams) {
      let gameweekPoints = 0;

      for (const fantasyPlayer of team.startingEleven) {
        // Get player's match stats for this gameweek
        const playerStats = await this.getPlayerGameweekStats(
          fantasyPlayer.player._id,
          gameweek
        );

        let playerPoints = this.calculatePlayerPoints(
          playerStats,
          fantasyPlayer.position
        );

        // Captain gets double points
        if (fantasyPlayer.isCaptain) {
          playerPoints *= 2;
        }

        gameweekPoints += playerPoints;
      }

      // Deduct points for extra transfers (if any)
      const extraTransfers = Math.max(0, team.transfersMade - team.freeTransfers);
      gameweekPoints -= extraTransfers * 4;

      // Update team
      team.gameweekPoints.push({
        gameweek,
        points: gameweekPoints,
        transfers: team.transfersMade,
      });
      team.totalPoints += gameweekPoints;
      team.transfersMade = 0; // Reset for next gameweek
      team.freeTransfers = 1; // Reset free transfers

      await team.save();
    }

    // Update rankings
    await this.updateRankings();
  }

  async updateRankings() {
    const teams = await FantasyTeam.find({})
      .sort({ totalPoints: -1 })
      .populate('user', 'country');

    // Global rankings
    teams.forEach((team, index) => {
      team.globalRank = index + 1;
    });

    // Country rankings
    const countriesMap = new Map();
    teams.forEach((team) => {
      const country = team.user.country || 'Unknown';
      if (!countriesMap.has(country)) {
        countriesMap.set(country, []);
      }
      countriesMap.get(country).push(team);
    });

    countriesMap.forEach((countryTeams) => {
      countryTeams.forEach((team, index) => {
        team.countryRank = index + 1;
      });
    });

    // Save all
    await Promise.all(teams.map((team) => team.save()));
  }
}

module.exports = new FantasyService();
```

---

## 💰 8. Betting Odds

### Odds Model

```javascript
// server/src/models/Odds.js

const mongoose = require('mongoose');

const oddsSchema = new mongoose.Schema({
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true,
  },
  
  // Bookmaker
  bookmaker: {
    name: String,
    logo: String,
  },
  
  // Match Winner
  matchWinner: {
    home: Number,
    draw: Number,
    away: Number,
  },
  
  // Over/Under
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
  
  // Both Teams Score
  bothTeamsScore: {
    yes: Number,
    no: Number,
  },
  
  // Correct Score
  correctScore: [{
    score: String, // "2-1"
    odds: Number,
  }],
  
  // First Goalscorer
  firstGoalscorer: [{
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
    },
    odds: Number,
  }],
  
  // Updated timestamp
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

oddsSchema.index({ match: 1, bookmaker: 1 });

module.exports = mongoose.model('Odds', oddsSchema);
```

**⚠️ Note Légale** : Le betting est soumis à régulation. Assurez-vous de vérifier les lois locales avant d'activer cette fonctionnalité.

---

## 🏟️ 9. Import depuis UEFA

### UEFA Scraper Service

```javascript
// server/src/services/uefaScraper.js

const axios = require('axios');
const cheerio = require('cheerio');
const League = require('../models/League');
const Team = require('../models/Team');
const Match = require('../models/Match');

class UEFAScraper {
  constructor() {
    this.baseURL = 'https://www.uefa.com';
  }

  // ============================================================
  // SCRAPE CHAMPIONS LEAGUE
  // ============================================================

  async scrapeChampionsLeague() {
    try {
      console.log('🔄 Scraping UEFA Champions League...');

      // UEFA provides an API endpoint
      const response = await axios.get(
        'https://match.uefa.com/v5/matches?competitionId=1&limit=100',
        {
          headers: {
            'User-Agent': 'Mozilla/5.0',
          },
        }
      );

      const matches = response.data;

      for (const match of matches) {
        await this.processUEFAMatch(match, 'Champions League');
      }

      console.log('✅ Champions League scraped successfully');
    } catch (error) {
      console.error('❌ UEFA scraping error:', error);
    }
  }

  // ============================================================
  // PROCESS UEFA MATCH
  // ============================================================

  async processUEFAMatch(matchData, leagueName) {
    try {
      // Find or create league
      let league = await League.findOne({ name: leagueName });
      if (!league) {
        league = await League.create({
          name: leagueName,
          type: 'Cup',
          country: {
            name: 'Europe',
            code: 'EU',
          },
          logo: 'https://img.uefa.com/imgml/uefacom/ucl/logo.png',
          isFeatured: true,
        });
      }

      // Find or create teams
      const homeTeam = await this.findOrCreateTeam(matchData.homeTeam);
      const awayTeam = await this.findOrCreateTeam(matchData.awayTeam);

      // Create or update match
      await Match.findOneAndUpdate(
        { 
          league: league._id,
          'homeTeam.name': matchData.homeTeam.name,
          'awayTeam.name': matchData.awayTeam.name,
          matchDate: new Date(matchData.kickOffTime.dateTime),
        },
        {
          league: league._id,
          season: matchData.season.year,
          round: matchData.round.metaData.name,
          
          homeTeam: {
            team: homeTeam._id,
            name: matchData.homeTeam.internationalName,
            logo: matchData.homeTeam.logoUrl,
          },
          awayTeam: {
            team: awayTeam._id,
            name: matchData.awayTeam.internationalName,
            logo: matchData.awayTeam.logoUrl,
          },
          
          matchDate: new Date(matchData.kickOffTime.dateTime),
          venue: {
            name: matchData.stadium.name,
            city: matchData.stadium.city,
          },
          
          status: this.mapUEFAStatus(matchData.status),
          
          score: {
            fulltime: {
              home: matchData.score?.total?.home || 0,
              away: matchData.score?.total?.away || 0,
            },
          },
          
          lastSyncedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      console.log(`✅ Processed: ${matchData.homeTeam.name} vs ${matchData.awayTeam.name}`);
    } catch (error) {
      console.error('Error processing UEFA match:', error);
    }
  }

  // ============================================================
  // FIND OR CREATE TEAM
  // ============================================================

  async findOrCreateTeam(teamData) {
    let team = await Team.findOne({ name: teamData.internationalName });
    
    if (!team) {
      team = await Team.create({
        name: teamData.internationalName,
        logo: teamData.logoUrl,
        country: teamData.country.name,
        venue: {
          name: teamData.stadium?.name,
          city: teamData.stadium?.city,
        },
      });
    }

    return team;
  }

  // ============================================================
  // MAP UEFA STATUS
  // ============================================================

  mapUEFAStatus(status) {
    const statusMap = {
      'SCHEDULED': 'SCHEDULED',
      'LIVE': 'LIVE',
      'FINISHED': 'FINISHED',
      'POSTPONED': 'POSTPONED',
      'CANCELLED': 'CANCELLED',
    };

    return statusMap[status] || 'SCHEDULED';
  }

  // ============================================================
  // SCRAPE EUROPA LEAGUE
  // ============================================================

  async scrapeEuropaLeague() {
    try {
      console.log('🔄 Scraping UEFA Europa League...');

      const response = await axios.get(
        'https://match.uefa.com/v5/matches?competitionId=2&limit=100',
        {
          headers: {
            'User-Agent': 'Mozilla/5.0',
          },
        }
      );

      const matches = response.data;

      for (const match of matches) {
        await this.processUEFAMatch(match, 'Europa League');
      }

      console.log('✅ Europa League scraped successfully');
    } catch (error) {
      console.error('❌ UEFA scraping error:', error);
    }
  }
}

module.exports = new UEFAScraper();
```

---

## ⚙️ 10. Formations Prédéfinies

```typescript
// src/utils/formations.ts

export interface FormationPosition {
  position: string;
  x: number;
  y: number;
}

export interface Formation {
  name: string;
  description: string;
  positions: FormationPosition[];
  strengths: string[];
  weaknesses: string[];
}

export const formations: Record<string, Formation> = {
  '4-3-3': {
    name: '4-3-3',
    description: 'Formation équilibrée avec ailiers',
    positions: [
      { position: 'GK', x: 10, y: 50 },
      { position: 'RB', x: 25, y: 20 },
      { position: 'CB', x: 25, y: 40 },
      { position: 'CB', x: 25, y: 60 },
      { position: 'LB', x: 25, y: 80 },
      { position: 'CDM', x: 45, y: 35 },
      { position: 'CM', x: 45, y: 50 },
      { position: 'CM', x: 45, y: 65 },
      { position: 'RW', x: 70, y: 25 },
      { position: 'ST', x: 70, y: 50 },
      { position: 'LW', x: 70, y: 75 },
    ],
    strengths: ['Largeur', 'Contrôle milieu', 'Pression haute'],
    weaknesses: ['Vulnérable sur les côtés', 'Dépend des ailiers'],
  },

  '4-4-2': {
    name: '4-4-2',
    description: 'Formation classique et solide',
    positions: [
      { position: 'GK', x: 10, y: 50 },
      { position: 'RB', x: 25, y: 20 },
      { position: 'CB', x: 25, y: 40 },
      { position: 'CB', x: 25, y: 60 },
      { position: 'LB', x: 25, y: 80 },
      { position: 'RM', x: 50, y: 20 },
      { position: 'CM', x: 50, y: 40 },
      { position: 'CM', x: 50, y: 60 },
      { position: 'LM', x: 50, y: 80 },
      { position: 'ST', x: 75, y: 40 },
      { position: 'ST', x: 75, y: 60 },
    ],
    strengths: ['Équilibre', 'Solidité défensive', 'Duo d\'attaquants'],
    weaknesses: ['Manque de créativité', 'Milieu surchargé'],
  },

  '3-5-2': {
    name: '3-5-2',
    description: 'Domination du milieu',
    positions: [
      { position: 'GK', x: 10, y: 50 },
      { position: 'CB', x: 25, y: 30 },
      { position: 'CB', x: 25, y: 50 },
      { position: 'CB', x: 25, y: 70 },
      { position: 'RWB', x: 45, y: 15 },
      { position: 'CDM', x: 45, y: 35 },
      { position: 'CM', x: 45, y: 50 },
      { position: 'CDM', x: 45, y: 65 },
      { position: 'LWB', x: 45, y: 85 },
      { position: 'ST', x: 70, y: 40 },
      { position: 'ST', x: 70, y: 60 },
    ],
    strengths: ['Surnombre milieu', 'Flexibilité', 'Largeur'],
    weaknesses: ['Exige des latéraux endurants', 'Espace dans le dos'],
  },

  '4-2-3-1': {
    name: '4-2-3-1',
    description: 'Contrôle et créativité',
    positions: [
      { position: 'GK', x: 10, y: 50 },
      { position: 'RB', x: 25, y: 20 },
      { position: 'CB', x: 25, y: 40 },
      { position: 'CB', x: 25, y: 60 },
      { position: 'LB', x: 25, y: 80 },
      { position: 'CDM', x: 40, y: 35 },
      { position: 'CDM', x: 40, y: 65 },
      { position: 'RW', x: 60, y: 25 },
      { position: 'CAM', x: 60, y: 50 },
      { position: 'LW', x: 60, y: 75 },
      { position: 'ST', x: 80, y: 50 },
    ],
    strengths: ['Protection défensive', 'Créativité', 'Options offensives'],
    weaknesses: ['Attaquant isolé', 'Lent en transition'],
  },

  '3-4-3': {
    name: '3-4-3',
    description: 'Attaque totale',
    positions: [
      { position: 'GK', x: 10, y: 50 },
      { position: 'CB', x: 25, y: 30 },
      { position: 'CB', x: 25, y: 50 },
      { position: 'CB', x: 25, y: 70 },
      { position: 'RM', x: 45, y: 20 },
      { position: 'CM', x: 45, y: 40 },
      { position: 'CM', x: 45, y: 60 },
      { position: 'LM', x: 45, y: 80 },
      { position: 'RW', x: 70, y: 25 },
      { position: 'ST', x: 70, y: 50 },
      { position: 'LW', x: 70, y: 75 },
    ],
    strengths: ['Pression haute', 'Largeur', 'Offensif'],
    weaknesses: ['Vulnérable défensivement', 'Espace derrière'],
  },
};
```

**Système complet créé ! 🎉**

Dans le prochain fichier, je vais créer un guide d'intégration complète de toutes ces fonctionnalités ! 🚀
