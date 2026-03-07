# 🔔 FootballHub+ - FONCTIONNALITÉS NEWS AVANCÉES (Partie 1)

## 🎯 Vue d'Ensemble

Toutes les fonctionnalités avancées pour maximiser l'engagement :
- ✅ Push Notifications Breaking News
- ✅ Bookmarks/Save for Later
- ✅ Comments System complet
- ✅ Newsletter automatique
- ✅ YouTube Videos Integration

---

## 🔔 PARTIE 1 : PUSH NOTIFICATIONS BREAKING NEWS

### Service Push Notifications News

```javascript
// server/src/services/newsNotificationService.js
const PushNotificationService = require('./pushNotificationService');
const User = require('../models/User');
const News = require('../models/News');
const logger = require('../utils/logger');

class NewsNotificationService {
  /**
   * Send breaking news notification to all users
   */
  async sendBreakingNews(newsId) {
    try {
      const news = await News.findById(newsId).populate('league teams');

      if (!news) {
        throw new Error('News not found');
      }

      const notification = {
        title: '🚨 Breaking News !',
        body: news.title,
        image: news.image,
        data: {
          type: 'breaking_news',
          newsId: news._id.toString(),
          category: news.category,
        },
      };

      // Send to topic "breaking_news"
      const result = await PushNotificationService.sendToTopic('breaking_news', notification);

      logger.info(`Breaking news notification sent: ${news._id}`);

      return result;
    } catch (error) {
      logger.error('Breaking news notification error:', error);
      throw error;
    }
  }

  /**
   * Send transfer alert to users following specific teams
   */
  async sendTransferAlert(newsId) {
    try {
      const news = await News.findById(newsId).populate('teams');

      if (!news || news.category !== 'Transfers') {
        return;
      }

      // Get users following these teams
      const teamIds = news.teams.map(t => t._id);
      const users = await User.find({
        favoriteTeams: { $in: teamIds },
        'notificationSettings.transfers': true,
      }).select('_id fcmTokens');

      if (users.length === 0) {
        logger.info('No users to notify for transfer');
        return;
      }

      const notification = {
        title: '🔄 Alerte Transfert !',
        body: news.title,
        image: news.image,
        data: {
          type: 'transfer_alert',
          newsId: news._id.toString(),
          teams: teamIds.map(id => id.toString()),
        },
      };

      // Send to all users
      const userIds = users.map(u => u._id);
      const result = await PushNotificationService.sendToMultipleUsers(userIds, notification);

      logger.info(`Transfer alert sent to ${userIds.length} users`);

      return result;
    } catch (error) {
      logger.error('Transfer alert error:', error);
      throw error;
    }
  }

  /**
   * Send injury alert
   */
  async sendInjuryAlert(newsId) {
    try {
      const news = await News.findById(newsId).populate('teams players');

      if (!news || news.category !== 'Injuries') {
        return;
      }

      const teamIds = news.teams.map(t => t._id);
      const users = await User.find({
        favoriteTeams: { $in: teamIds },
        'notificationSettings.injuries': true,
      }).select('_id');

      if (users.length === 0) return;

      const notification = {
        title: '⚠️ Alerte Blessure',
        body: news.title,
        image: news.image,
        data: {
          type: 'injury_alert',
          newsId: news._id.toString(),
        },
      };

      const userIds = users.map(u => u._id);
      await PushNotificationService.sendToMultipleUsers(userIds, notification);

      logger.info(`Injury alert sent to ${userIds.length} users`);
    } catch (error) {
      logger.error('Injury alert error:', error);
    }
  }

  /**
   * Send daily news digest
   */
  async sendDailyDigest() {
    try {
      // Get top 5 news from last 24 hours
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const topNews = await News.find({
        status: 'Published',
        publishedAt: { $gte: yesterday },
      })
        .sort({ views: -1, publishedAt: -1 })
        .limit(5);

      if (topNews.length === 0) {
        logger.info('No news for daily digest');
        return;
      }

      // Get users with digest enabled
      const users = await User.find({
        'notificationSettings.dailyDigest': true,
      }).select('_id');

      if (users.length === 0) return;

      const notification = {
        title: '📰 Votre Résumé Quotidien',
        body: `${topNews.length} nouvelles actualités vous attendent !`,
        image: topNews[0].image,
        data: {
          type: 'daily_digest',
          newsCount: topNews.length,
        },
      };

      const userIds = users.map(u => u._id);
      await PushNotificationService.sendToMultipleUsers(userIds, notification);

      logger.info(`Daily digest sent to ${userIds.length} users`);
    } catch (error) {
      logger.error('Daily digest error:', error);
    }
  }

  /**
   * Auto-detect breaking news and send notification
   */
  async autoNotifyBreakingNews(newsId) {
    try {
      const news = await News.findById(newsId);

      if (!news) return;

      // Breaking news criteria
      const isBreaking = 
        news.featured ||
        news.category === 'Transfers' ||
        news.tags.includes('breaking') ||
        news.title.toLowerCase().includes('officiel');

      if (isBreaking) {
        await this.sendBreakingNews(newsId);
      }

      // Category-specific alerts
      if (news.category === 'Transfers') {
        await this.sendTransferAlert(newsId);
      }

      if (news.category === 'Injuries') {
        await this.sendInjuryAlert(newsId);
      }
    } catch (error) {
      logger.error('Auto-notify error:', error);
    }
  }
}

module.exports = new NewsNotificationService();
```

### Mise à jour du User Model (Notification Settings)

```javascript
// server/src/models/User.js - Add to schema
notificationSettings: {
  breakingNews: {
    type: Boolean,
    default: true,
  },
  transfers: {
    type: Boolean,
    default: true,
  },
  injuries: {
    type: Boolean,
    default: true,
  },
  matchAlerts: {
    type: Boolean,
    default: true,
  },
  dailyDigest: {
    type: Boolean,
    default: false,
  },
  weeklyDigest: {
    type: Boolean,
    default: true,
  },
},

favoriteTeams: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  },
],

favoritePlayers: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
  },
],
```

### Routes Notification Settings

```javascript
// server/src/routes/notifications.js - Add routes
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');

// Get notification settings
router.get('/settings', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('notificationSettings favoriteTeams favoritePlayers');

    res.json({
      success: true,
      settings: user.notificationSettings,
      favoriteTeams: user.favoriteTeams,
      favoritePlayers: user.favoritePlayers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Update notification settings
router.patch('/settings', authenticate, async (req, res) => {
  try {
    const updates = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { notificationSettings: updates } },
      { new: true }
    ).select('notificationSettings');

    res.json({
      success: true,
      settings: user.notificationSettings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Add favorite team
router.post('/favorites/teams/:teamId', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user.favoriteTeams.includes(req.params.teamId)) {
      user.favoriteTeams.push(req.params.teamId);
      await user.save();
    }

    res.json({
      success: true,
      favoriteTeams: user.favoriteTeams,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Remove favorite team
router.delete('/favorites/teams/:teamId', authenticate, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $pull: { favoriteTeams: req.params.teamId } },
      { new: true }
    ).select('favoriteTeams');

    res.json({
      success: true,
      favoriteTeams: user.favoriteTeams,
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

## 🔖 PARTIE 2 : BOOKMARKS/SAVE FOR LATER

### Bookmark Model

```javascript
// server/src/models/Bookmark.js
const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    news: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'News',
      required: true,
    },

    // Optional: Organize bookmarks in collections
    collection: {
      type: String,
      default: 'default',
    },

    notes: {
      type: String,
      maxlength: 500,
    },

    tags: [String],
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicates
bookmarkSchema.index({ user: 1, news: 1 }, { unique: true });
bookmarkSchema.index({ user: 1, collection: 1, createdAt: -1 });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
```

### Bookmark Service

```javascript
// server/src/services/bookmarkService.js
const Bookmark = require('../models/Bookmark');
const News = require('../models/News');
const logger = require('../utils/logger');

class BookmarkService {
  /**
   * Add bookmark
   */
  async addBookmark(userId, newsId, collection = 'default', notes = '') {
    try {
      // Check if already bookmarked
      const existing = await Bookmark.findOne({ user: userId, news: newsId });

      if (existing) {
        return { success: false, message: 'Already bookmarked' };
      }

      const bookmark = await Bookmark.create({
        user: userId,
        news: newsId,
        collection,
        notes,
      });

      logger.info(`Bookmark added: ${userId} -> ${newsId}`);

      return { success: true, bookmark };
    } catch (error) {
      logger.error('Add bookmark error:', error);
      throw error;
    }
  }

  /**
   * Remove bookmark
   */
  async removeBookmark(userId, newsId) {
    try {
      const result = await Bookmark.findOneAndDelete({ user: userId, news: newsId });

      if (!result) {
        return { success: false, message: 'Bookmark not found' };
      }

      logger.info(`Bookmark removed: ${userId} -> ${newsId}`);

      return { success: true };
    } catch (error) {
      logger.error('Remove bookmark error:', error);
      throw error;
    }
  }

  /**
   * Get user bookmarks
   */
  async getUserBookmarks(userId, collection = null, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      const query = { user: userId };

      if (collection) {
        query.collection = collection;
      }

      const [bookmarks, total] = await Promise.all([
        Bookmark.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('news'),
        Bookmark.countDocuments(query),
      ]);

      return {
        bookmarks,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get bookmarks error:', error);
      throw error;
    }
  }

  /**
   * Get user collections
   */
  async getUserCollections(userId) {
    try {
      const collections = await Bookmark.aggregate([
        { $match: { user: mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: '$collection',
            count: { $sum: 1 },
            lastUpdated: { $max: '$createdAt' },
          },
        },
        { $sort: { lastUpdated: -1 } },
      ]);

      return collections.map(c => ({
        name: c._id,
        count: c.count,
        lastUpdated: c.lastUpdated,
      }));
    } catch (error) {
      logger.error('Get collections error:', error);
      throw error;
    }
  }

  /**
   * Check if bookmarked
   */
  async isBookmarked(userId, newsId) {
    try {
      const bookmark = await Bookmark.findOne({ user: userId, news: newsId });
      return !!bookmark;
    } catch (error) {
      logger.error('Check bookmark error:', error);
      return false;
    }
  }

  /**
   * Update bookmark (notes, collection)
   */
  async updateBookmark(userId, newsId, updates) {
    try {
      const bookmark = await Bookmark.findOneAndUpdate(
        { user: userId, news: newsId },
        updates,
        { new: true }
      );

      if (!bookmark) {
        return { success: false, message: 'Bookmark not found' };
      }

      return { success: true, bookmark };
    } catch (error) {
      logger.error('Update bookmark error:', error);
      throw error;
    }
  }
}

module.exports = new BookmarkService();
```

### Bookmark Routes

```javascript
// server/src/routes/bookmarks.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const bookmarkService = require('../services/bookmarkService');

// Get user bookmarks
router.get('/', authenticate, async (req, res) => {
  try {
    const { collection, page = 1, limit = 20 } = req.query;

    const result = await bookmarkService.getUserBookmarks(
      req.userId,
      collection,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get collections
router.get('/collections', authenticate, async (req, res) => {
  try {
    const collections = await bookmarkService.getUserCollections(req.userId);

    res.json({
      success: true,
      collections,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Add bookmark
router.post('/', authenticate, async (req, res) => {
  try {
    const { newsId, collection, notes } = req.body;

    const result = await bookmarkService.addBookmark(
      req.userId,
      newsId,
      collection,
      notes
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Check if bookmarked
router.get('/check/:newsId', authenticate, async (req, res) => {
  try {
    const isBookmarked = await bookmarkService.isBookmarked(
      req.userId,
      req.params.newsId
    );

    res.json({
      success: true,
      isBookmarked,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Update bookmark
router.patch('/:newsId', authenticate, async (req, res) => {
  try {
    const { collection, notes, tags } = req.body;

    const result = await bookmarkService.updateBookmark(
      req.userId,
      req.params.newsId,
      { collection, notes, tags }
    );

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Remove bookmark
router.delete('/:newsId', authenticate, async (req, res) => {
  try {
    const result = await bookmarkService.removeBookmark(
      req.userId,
      req.params.newsId
    );

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
```

Suite dans le prochain fichier avec Comments, Newsletter et YouTube ! 🚀
