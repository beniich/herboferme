# ⚽ Système de News & Ligues - Partie 2 : Routes & Frontend

## 🛣️ Routes API Backend

### 1. Leagues Routes

```javascript
// server/src/routes/leagues.js

const express = require('express');
const router = express.Router();
const League = require('../models/League');
const footballApi = require('../services/footballApi');

// GET /api/leagues - Get all leagues
router.get('/', async (req, res) => {
  try {
    const {
      country,
      featured,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const query = { isActive: true };
    
    if (country) query['country.name'] = country;
    if (featured) query.isFeatured = featured === 'true';
    if (search) query.name = new RegExp(search, 'i');

    const leagues = await League.find(query)
      .sort({ priority: -1, 'country.name': 1, name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await League.countDocuments(query);

    res.json({
      leagues,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/leagues/featured - Get featured leagues
router.get('/featured', async (req, res) => {
  try {
    const leagues = await League.find({ isFeatured: true, isActive: true })
      .sort({ priority: -1 })
      .limit(10);

    res.json(leagues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/leagues/:id - Get league by ID
router.get('/:id', async (req, res) => {
  try {
    const league = await League.findById(req.params.id);
    
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }

    res.json(league);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/leagues/sync - Sync leagues from API
router.post('/sync', async (req, res) => {
  try {
    const leagues = await footballApi.syncLeagues();
    res.json({ message: 'Leagues synced successfully', count: leagues.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/leagues/:id/follow - Follow a league
router.post('/:id/follow', async (req, res) => {
  try {
    const league = await League.findByIdAndUpdate(
      req.params.id,
      { $inc: { followersCount: 1 } },
      { new: true }
    );

    res.json(league);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

### 2. Matches Routes

```javascript
// server/src/routes/matches.js

const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const footballApi = require('../services/footballApi');

// GET /api/matches - Get all matches
router.get('/', async (req, res) => {
  try {
    const {
      league,
      team,
      status,
      date,
      live,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};
    
    if (league) query.league = league;
    if (team) {
      query.$or = [
        { 'homeTeam.team': team },
        { 'awayTeam.team': team },
      ];
    }
    if (status) query.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.matchDate = { $gte: startDate, $lt: endDate };
    }
    if (live) query.status = 'LIVE';

    const matches = await Match.find(query)
      .populate('league', 'name logo country')
      .populate('homeTeam.team', 'name logo')
      .populate('awayTeam.team', 'name logo')
      .sort({ matchDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Match.countDocuments(query);

    res.json({
      matches,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/matches/live - Get live matches
router.get('/live', async (req, res) => {
  try {
    const matches = await Match.find({ status: 'LIVE' })
      .populate('league', 'name logo')
      .sort({ matchDate: -1 });

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/matches/upcoming - Get upcoming matches
router.get('/upcoming', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const matches = await Match.find({
      status: 'SCHEDULED',
      matchDate: { $gte: new Date() },
    })
      .populate('league', 'name logo')
      .sort({ matchDate: 1 })
      .limit(Number(limit));

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/matches/:id - Get match by ID
router.get('/:id', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('league')
      .populate('homeTeam.team')
      .populate('awayTeam.team');

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    res.json(match);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/matches/sync/:leagueId/:season - Sync matches
router.post('/sync/:leagueId/:season', async (req, res) => {
  try {
    const { leagueId, season } = req.params;
    const matches = await footballApi.syncFixturesByLeague(
      Number(leagueId),
      Number(season)
    );
    res.json({ message: 'Matches synced', count: matches.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

### 3. News Routes

```javascript
// server/src/routes/news.js

const express = require('express');
const router = express.Router();
const NewsArticle = require('../models/NewsArticle');

// GET /api/news - Get all news
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
      .populate('league', 'name logo')
      .populate('teams', 'name logo')
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

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

// GET /api/news/featured - Get featured news
router.get('/featured', async (req, res) => {
  try {
    const articles = await NewsArticle.find({
      isFeatured: true,
      isPublished: true,
    })
      .populate('league', 'name logo')
      .sort({ publishedAt: -1 })
      .limit(5);

    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/news/:id - Get article by ID
router.get('/:id', async (req, res) => {
  try {
    const article = await NewsArticle.findById(req.params.id)
      .populate('league')
      .populate('teams');

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Increment view count
    article.viewCount += 1;
    await article.save();

    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/news - Create news article
router.post('/', async (req, res) => {
  try {
    const article = new NewsArticle(req.body);
    await article.save();
    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/news/:id/like - Like an article
router.post('/:id/like', async (req, res) => {
  try {
    const article = await NewsArticle.findByIdAndUpdate(
      req.params.id,
      { $inc: { likeCount: 1 } },
      { new: true }
    );

    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

### 4. Standings Routes

```javascript
// server/src/routes/standings.js

const express = require('express');
const router = express.Router();
const Standing = require('../models/Standing');
const footballApi = require('../services/footballApi');

// GET /api/standings/:leagueId/:season
router.get('/:leagueId/:season', async (req, res) => {
  try {
    const { leagueId, season } = req.params;

    const standing = await Standing.findOne({
      league: leagueId,
      season: Number(season),
    })
      .populate('league', 'name logo country')
      .populate('rankings.team', 'name logo');

    if (!standing) {
      return res.status(404).json({ message: 'Standings not found' });
    }

    res.json(standing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/standings/sync/:leagueId/:season
router.post('/sync/:leagueId/:season', async (req, res) => {
  try {
    const { leagueId, season } = req.params;
    const standing = await footballApi.syncStandingsByLeague(
      Number(leagueId),
      Number(season)
    );
    res.json({ message: 'Standings synced', standing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

---

## 🎨 Composants Frontend React

### 1. League Card Component

```typescript
// src/components/leagues/LeagueCard.tsx

import React from 'react';
import { Users, TrendingUp } from 'lucide-react';
import { hapticFeedback } from '@/utils/haptics';

interface LeagueCardProps {
  league: {
    _id: string;
    name: string;
    logo: string;
    country: {
      name: string;
      flag: string;
    };
    followersCount: number;
  };
  onClick?: () => void;
}

export const LeagueCard: React.FC<LeagueCardProps> = ({ league, onClick }) => {
  const handleClick = async () => {
    await hapticFeedback.light();
    if (onClick) onClick();
  };

  return (
    <div
      onClick={handleClick}
      className="group relative overflow-hidden rounded-2xl bg-surface-dark border border-white/10 p-5 cursor-pointer hover:border-primary/30 transition-all active:scale-95"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative flex items-center gap-4">
        {/* League Logo */}
        <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/10">
          {league.logo ? (
            <img
              src={league.logo}
              alt={league.name}
              className="w-12 h-12 object-contain"
            />
          ) : (
            <span className="text-3xl">⚽</span>
          )}
        </div>

        {/* League Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-white mb-1 truncate group-hover:text-primary transition-colors">
            {league.name}
          </h3>
          
          <div className="flex items-center gap-2 text-sm text-gray-400">
            {league.country.flag && (
              <img
                src={league.country.flag}
                alt={league.country.name}
                className="w-5 h-3 object-cover rounded"
              />
            )}
            <span>{league.country.name}</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
            <Users size={14} />
            <span>{league.followersCount?.toLocaleString()} followers</span>
          </div>
        </div>

        {/* Arrow Icon */}
        <div className="text-gray-600 group-hover:text-primary transition-colors">
          <TrendingUp size={20} />
        </div>
      </div>
    </div>
  );
};
```

### 2. Match Card Component

```typescript
// src/components/matches/MatchCard.tsx

import React from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { hapticFeedback } from '@/utils/haptics';

interface MatchCardProps {
  match: {
    _id: string;
    homeTeam: {
      name: string;
      logo: string;
    };
    awayTeam: {
      name: string;
      logo: string;
    };
    matchDate: string;
    status: 'SCHEDULED' | 'LIVE' | 'FINISHED';
    score?: {
      fulltime: {
        home: number;
        away: number;
      };
    };
    league: {
      name: string;
      logo: string;
    };
    venue?: {
      name: string;
      city: string;
    };
  };
  onClick?: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onClick }) => {
  const handleClick = async () => {
    await hapticFeedback.light();
    if (onClick) onClick();
  };

  const isLive = match.status === 'LIVE';
  const isFinished = match.status === 'FINISHED';

  return (
    <div
      onClick={handleClick}
      className="relative overflow-hidden rounded-2xl bg-surface-dark border border-white/10 p-5 cursor-pointer hover:border-primary/30 transition-all active:scale-95"
    >
      {/* Live Indicator */}
      {isLive && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-500 animate-pulse" />
      )}

      {/* League Info */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
        {match.league.logo && (
          <img
            src={match.league.logo}
            alt={match.league.name}
            className="w-5 h-5 object-contain"
          />
        )}
        <span className="text-xs text-gray-400 font-medium">
          {match.league.name}
        </span>
        {isLive && (
          <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
            LIVE
          </span>
        )}
      </div>

      {/* Teams & Score */}
      <div className="flex items-center justify-between gap-4 mb-4">
        {/* Home Team */}
        <div className="flex flex-col items-center flex-1">
          <div className="w-16 h-16 mb-2 rounded-xl bg-white/5 flex items-center justify-center">
            {match.homeTeam.logo ? (
              <img
                src={match.homeTeam.logo}
                alt={match.homeTeam.name}
                className="w-12 h-12 object-contain"
              />
            ) : (
              <span className="text-2xl">🏴</span>
            )}
          </div>
          <span className="text-sm font-medium text-white text-center">
            {match.homeTeam.name}
          </span>
        </div>

        {/* Score or Time */}
        <div className="flex flex-col items-center gap-1">
          {isFinished || isLive ? (
            <>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-white">
                  {match.score?.fulltime.home ?? 0}
                </span>
                <span className="text-xl text-gray-500">-</span>
                <span className="text-3xl font-bold text-white">
                  {match.score?.fulltime.away ?? 0}
                </span>
              </div>
              {isFinished && (
                <span className="text-xs text-gray-500 uppercase">FT</span>
              )}
            </>
          ) : (
            <div className="text-center">
              <div className="text-lg font-bold text-primary">
                {format(new Date(match.matchDate), 'HH:mm')}
              </div>
              <div className="text-xs text-gray-500">
                {format(new Date(match.matchDate), 'dd MMM')}
              </div>
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center flex-1">
          <div className="w-16 h-16 mb-2 rounded-xl bg-white/5 flex items-center justify-center">
            {match.awayTeam.logo ? (
              <img
                src={match.awayTeam.logo}
                alt={match.awayTeam.name}
                className="w-12 h-12 object-contain"
              />
            ) : (
              <span className="text-2xl">🏴</span>
            )}
          </div>
          <span className="text-sm font-medium text-white text-center">
            {match.awayTeam.name}
          </span>
        </div>
      </div>

      {/* Venue */}
      {match.venue && (
        <div className="flex items-center gap-2 text-xs text-gray-500 pt-3 border-t border-white/5">
          <MapPin size={14} />
          <span>{match.venue.name}, {match.venue.city}</span>
        </div>
      )}
    </div>
  );
};
```

### 3. News Article Card

```typescript
// src/components/news/NewsCard.tsx

import React from 'react';
import { Clock, Eye, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { hapticFeedback } from '@/utils/haptics';

interface NewsCardProps {
  article: {
    _id: string;
    title: string;
    description: string;
    image: string;
    category: string;
    publishedAt: string;
    viewCount: number;
    likeCount: number;
    author?: {
      name: string;
      avatar: string;
    };
    league?: {
      name: string;
      logo: string;
    };
  };
  variant?: 'default' | 'featured';
  onClick?: () => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  article,
  variant = 'default',
  onClick,
}) => {
  const handleClick = async () => {
    await hapticFeedback.light();
    if (onClick) onClick();
  };

  const isFeatured = variant === 'featured';

  return (
    <div
      onClick={handleClick}
      className={`group relative overflow-hidden rounded-2xl bg-surface-dark border border-white/10 cursor-pointer hover:border-primary/30 transition-all active:scale-[0.98] ${
        isFeatured ? 'col-span-2' : ''
      }`}
    >
      {/* Image */}
      <div className={`relative overflow-hidden ${isFeatured ? 'h-64' : 'h-48'}`}>
        {article.image ? (
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-6xl opacity-20">📰</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-primary text-black text-xs font-bold rounded-full uppercase">
            {article.category}
          </span>
        </div>

        {/* League Badge */}
        {article.league && (
          <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full border border-white/20">
            {article.league.logo && (
              <img
                src={article.league.logo}
                alt={article.league.name}
                className="w-4 h-4 object-contain"
              />
            )}
            <span className="text-xs text-white font-medium">
              {article.league.name}
            </span>
          </div>
        )}

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className={`font-bold text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors ${
            isFeatured ? 'text-2xl' : 'text-lg'
          }`}>
            {article.title}
          </h3>
          
          {isFeatured && article.description && (
            <p className="text-sm text-gray-300 line-clamp-2 mb-3">
              {article.description}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>
                {formatDistanceToNow(new Date(article.publishedAt), {
                  addSuffix: true,
                  locale: fr,
                })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Eye size={14} />
              <span>{article.viewCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart size={14} />
              <span>{article.likeCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## 🎯 Suite dans le Prochain Fichier

Je continue avec :
1. Pages complètes (Leagues, News, Matches)
2. Service de synchronisation automatique
3. Tâches CRON pour mise à jour
4. Configuration et déploiement

Prêt pour la suite ? 🚀
