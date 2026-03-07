# 📰 FootballHub+ - INTÉGRATION SPORTMONKS & NEWS ÉLÉGANTES

## 🎯 Vue d'Ensemble

Intégration complète de l'API SportMonks pour :
- ✅ News de ligues en temps réel
- ✅ Actualités par équipe
- ✅ Statistiques détaillées
- ✅ Affichage élégant et professionnel
- ✅ Cache intelligent
- ✅ Images optimisées

---

## 📡 PARTIE 1 : INTÉGRATION API SPORTMONKS

### Installation

```bash
npm install axios date-fns lodash
```

### Configuration SportMonks

```javascript
// server/src/config/sportmonks.js
const axios = require('axios');
const redis = require('./redis');
const logger = require('../utils/logger');

class SportMonksAPI {
  constructor() {
    this.baseURL = 'https://api.sportmonks.com/v3/football';
    this.apiToken = process.env.SPORTMONKS_API_TOKEN;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
      },
    });

    // Add token to all requests
    this.client.interceptors.request.use((config) => {
      config.params = {
        ...config.params,
        api_token: this.apiToken,
      };
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error('SportMonks API Error:', {
          status: error.response?.status,
          message: error.response?.data?.message,
          endpoint: error.config?.url,
        });
        throw error;
      }
    );
  }

  /**
   * Make cached API request
   */
  async makeRequest(endpoint, params = {}, cacheTTL = 300) {
    const cacheKey = `sportmonks:${endpoint}:${JSON.stringify(params)}`;

    try {
      // Check cache first
      const cached = await redis.get(cacheKey);
      if (cached) {
        logger.info(`Cache hit: ${cacheKey}`);
        return JSON.parse(cached);
      }

      // Make API request
      logger.info(`API request: ${endpoint}`);
      const response = await this.client.get(endpoint, { params });
      
      const data = response.data;

      // Cache response
      await redis.setex(cacheKey, cacheTTL, JSON.stringify(data));

      return data;
    } catch (error) {
      logger.error('API request failed:', error.message);
      throw error;
    }
  }

  // ============================================================
  // NEWS ENDPOINTS
  // ============================================================

  /**
   * Get latest news (all leagues)
   */
  async getLatestNews(params = {}) {
    const defaultParams = {
      per_page: 20,
      page: 1,
      include: 'image',
      ...params,
    };

    return await this.makeRequest('/news/pre-match', defaultParams, 300); // 5 min cache
  }

  /**
   * Get news by season (league)
   */
  async getNewsBySeason(seasonId, params = {}) {
    const defaultParams = {
      per_page: 20,
      page: 1,
      include: 'image',
      ...params,
    };

    return await this.makeRequest(`/news/pre-match/seasons/${seasonId}`, defaultParams, 300);
  }

  /**
   * Get news by team
   */
  async getNewsByTeam(teamId, params = {}) {
    const defaultParams = {
      per_page: 20,
      page: 1,
      include: 'image',
      ...params,
    };

    return await this.makeRequest(`/news/pre-match/teams/${teamId}`, defaultParams, 300);
  }

  /**
   * Get post-match news
   */
  async getPostMatchNews(params = {}) {
    const defaultParams = {
      per_page: 20,
      page: 1,
      include: 'image',
      ...params,
    };

    return await this.makeRequest('/news/post-match', defaultParams, 300);
  }

  /**
   * Get upcoming fixtures news
   */
  async getUpcomingNews(params = {}) {
    const defaultParams = {
      per_page: 20,
      page: 1,
      include: 'image',
      ...params,
    };

    return await this.makeRequest('/news/upcoming', defaultParams, 300);
  }

  // ============================================================
  // LEAGUES & TEAMS
  // ============================================================

  /**
   * Get all leagues
   */
  async getLeagues() {
    return await this.makeRequest('/leagues', {
      include: 'country,season,currentSeason',
    }, 3600); // 1 hour cache
  }

  /**
   * Get league by ID
   */
  async getLeague(leagueId) {
    return await this.makeRequest(`/leagues/${leagueId}`, {
      include: 'country,season,currentSeason',
    }, 3600);
  }

  /**
   * Get teams by season
   */
  async getTeamsBySeason(seasonId) {
    return await this.makeRequest(`/teams/seasons/${seasonId}`, {
      include: 'country,venue',
    }, 3600);
  }

  /**
   * Get team details
   */
  async getTeam(teamId) {
    return await this.makeRequest(`/teams/${teamId}`, {
      include: 'country,venue,currentSeason',
    }, 3600);
  }

  // ============================================================
  // FIXTURES & STANDINGS
  // ============================================================

  /**
   * Get fixtures by date
   */
  async getFixturesByDate(date) {
    return await this.makeRequest('/fixtures/date/' + date, {
      include: 'league,teams,scores,venue',
    }, 300);
  }

  /**
   * Get live fixtures
   */
  async getLiveFixtures() {
    return await this.makeRequest('/livescores', {
      include: 'league,teams,scores,events',
    }, 30); // 30 seconds cache
  }

  /**
   * Get standings by season
   */
  async getStandings(seasonId) {
    return await this.makeRequest(`/standings/seasons/${seasonId}`, {
      include: 'team,league',
    }, 3600);
  }

  /**
   * Get top scorers by season
   */
  async getTopScorers(seasonId) {
    return await this.makeRequest(`/topscorers/seasons/${seasonId}`, {
      include: 'player,team',
    }, 3600);
  }

  // ============================================================
  // STATISTICS & PREDICTIONS
  // ============================================================

  /**
   * Get team statistics
   */
  async getTeamStatistics(teamId, seasonId) {
    return await this.makeRequest(`/statistics/teams/${teamId}/seasons/${seasonId}`, {}, 3600);
  }

  /**
   * Get head to head
   */
  async getHeadToHead(team1Id, team2Id) {
    return await this.makeRequest(`/fixtures/head-to-head/${team1Id}/${team2Id}`, {
      include: 'league,teams,scores',
    }, 3600);
  }

  /**
   * Get predictions (Premium feature)
   */
  async getPredictions(fixtureId) {
    return await this.makeRequest(`/predictions/fixtures/${fixtureId}`, {}, 3600);
  }
}

module.exports = new SportMonksAPI();
```

---

## 🎨 PARTIE 2 : SERVICE NEWS BACKEND

```javascript
// server/src/services/newsService.js
const sportmonks = require('../config/sportmonks');
const News = require('../models/News');
const logger = require('../utils/logger');

class NewsService {
  /**
   * Sync news from SportMonks to database
   */
  async syncNews(seasonId = null, limit = 50) {
    try {
      logger.info('Syncing news from SportMonks...');

      let newsData;
      if (seasonId) {
        newsData = await sportmonks.getNewsBySeason(seasonId, { per_page: limit });
      } else {
        newsData = await sportmonks.getLatestNews({ per_page: limit });
      }

      if (!newsData.data || newsData.data.length === 0) {
        logger.warn('No news data received from SportMonks');
        return { synced: 0 };
      }

      let syncedCount = 0;

      for (const article of newsData.data) {
        // Check if article already exists
        const exists = await News.findOne({ externalId: article.id });
        
        if (!exists) {
          await News.create({
            externalId: article.id,
            title: article.title,
            content: article.description || '',
            excerpt: this.generateExcerpt(article.description),
            author: article.author || 'SportMonks',
            source: 'SportMonks',
            sourceUrl: article.url,
            image: article.image_path || null,
            category: this.determineCategory(article),
            tags: this.extractTags(article),
            publishedAt: new Date(article.published_at),
            league: article.season_id || null,
            teams: article.team_id ? [article.team_id] : [],
            featured: false,
            status: 'Published',
          });

          syncedCount++;
        }
      }

      logger.info(`✅ Synced ${syncedCount} news articles`);
      
      return { synced: syncedCount, total: newsData.data.length };
    } catch (error) {
      logger.error('News sync error:', error);
      throw error;
    }
  }

  /**
   * Generate excerpt from content
   */
  generateExcerpt(content, length = 150) {
    if (!content) return '';
    
    const text = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    return text.length > length 
      ? text.substring(0, length) + '...'
      : text;
  }

  /**
   * Determine article category
   */
  determineCategory(article) {
    const title = article.title.toLowerCase();
    
    if (title.includes('transfer') || title.includes('signing')) return 'Transfers';
    if (title.includes('injury') || title.includes('injured')) return 'Injuries';
    if (title.includes('match') || title.includes('game')) return 'Matches';
    if (title.includes('interview') || title.includes('says')) return 'Interviews';
    if (title.includes('rumor') || title.includes('rumour')) return 'Rumors';
    
    return 'General';
  }

  /**
   * Extract tags from article
   */
  extractTags(article) {
    const tags = [];
    
    if (article.season_id) tags.push('season');
    if (article.team_id) tags.push('team');
    if (article.title.includes('goal')) tags.push('goals');
    if (article.title.includes('win')) tags.push('wins');
    
    return tags;
  }

  /**
   * Get featured news
   */
  async getFeaturedNews(limit = 5) {
    return await News.find({ 
      status: 'Published',
      featured: true,
    })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .populate('league teams');
  }

  /**
   * Get news by league
   */
  async getNewsByLeague(leagueId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [news, total] = await Promise.all([
      News.find({ league: leagueId, status: 'Published' })
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('league teams'),
      News.countDocuments({ league: leagueId, status: 'Published' }),
    ]);

    return {
      news,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get news by team
   */
  async getNewsByTeam(teamId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [news, total] = await Promise.all([
      News.find({ teams: teamId, status: 'Published' })
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('league teams'),
      News.countDocuments({ teams: teamId, status: 'Published' }),
    ]);

    return {
      news,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Search news
   */
  async searchNews(query, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const searchQuery = {
      status: 'Published',
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $in: [query.toLowerCase()] } },
      ],
    };

    const [news, total] = await Promise.all([
      News.find(searchQuery)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('league teams'),
      News.countDocuments(searchQuery),
    ]);

    return {
      news,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = new NewsService();
```

---

## 🛣️ PARTIE 3 : ROUTES NEWS

```javascript
// server/src/routes/news.js
const express = require('express');
const router = express.Router();
const newsService = require('../services/newsService');
const sportmonks = require('../config/sportmonks');
const { cache } = require('../middleware/cache');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Get featured news (public)
router.get('/featured', cache(300), async (req, res) => {
  try {
    const news = await newsService.getFeaturedNews(5);
    
    res.json({
      success: true,
      news,
    });
  } catch (error) {
    console.error('Featured news error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured news',
    });
  }
});

// Get all news (public, paginated)
router.get('/', cache(300), async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;

    let result;
    
    if (search) {
      result = await newsService.searchNews(search, parseInt(page), parseInt(limit));
    } else if (category) {
      result = await newsService.getNewsByCategory(category, parseInt(page), parseInt(limit));
    } else {
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const [news, total] = await Promise.all([
        News.find({ status: 'Published' })
          .sort({ publishedAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .populate('league teams'),
        News.countDocuments({ status: 'Published' }),
      ]);

      result = {
        news,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      };
    }

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news',
    });
  }
});

// Get news by league
router.get('/league/:leagueId', cache(300), async (req, res) => {
  try {
    const { leagueId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await newsService.getNewsByLeague(
      leagueId,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('League news error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch league news',
    });
  }
});

// Get news by team
router.get('/team/:teamId', cache(300), async (req, res) => {
  try {
    const { teamId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await newsService.getNewsByTeam(
      teamId,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Team news error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team news',
    });
  }
});

// Get single news article
router.get('/:id', cache(300), async (req, res) => {
  try {
    const news = await News.findById(req.params.id).populate('league teams');

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News article not found',
      });
    }

    // Increment views
    news.views += 1;
    await news.save();

    res.json({
      success: true,
      news,
    });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news',
    });
  }
});

// Sync news from SportMonks (admin only)
router.post('/sync', authenticate, requireAdmin, async (req, res) => {
  try {
    const { seasonId, limit = 50 } = req.body;

    const result = await newsService.syncNews(seasonId, limit);

    res.json({
      success: true,
      message: `Synced ${result.synced} news articles`,
      ...result,
    });
  } catch (error) {
    console.error('News sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync news',
    });
  }
});

module.exports = router;
```

Suite dans le prochain fichier avec les composants React élégants ! 🎨
