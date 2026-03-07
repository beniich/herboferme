# 💬 FootballHub+ - FONCTIONNALITÉS NEWS AVANCÉES (Partie 2)

## 💬 PARTIE 3 : COMMENTS SYSTEM COMPLET

### Comment Model (Enhanced)

```javascript
// server/src/models/Comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    news: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'News',
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    // Thread support (replies)
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },

    // Engagement
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // Moderation
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'flagged'],
      default: 'approved', // Auto-approve for now
    },

    flaggedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        reason: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Metadata
    edited: {
      type: Boolean,
      default: false,
    },

    editedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
commentSchema.index({ news: 1, createdAt: -1 });
commentSchema.index({ user: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1, createdAt: 1 });
commentSchema.index({ status: 1 });

// Virtual for reply count
commentSchema.virtual('replyCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment',
  count: true,
});

// Virtual for like count
commentSchema.virtual('likeCount').get(function () {
  return this.likes.length;
});

// Virtual for dislike count
commentSchema.virtual('dislikeCount').get(function () {
  return this.dislikes.length;
});

module.exports = mongoose.model('Comment', commentSchema);
```

### Comment Service

```javascript
// server/src/services/commentService.js
const Comment = require('../models/Comment');
const News = require('../models/News');
const logger = require('../utils/logger');

class CommentService {
  /**
   * Add comment
   */
  async addComment(userId, newsId, content, parentCommentId = null) {
    try {
      // Validate content
      if (!content || content.trim().length === 0) {
        throw new Error('Comment content is required');
      }

      // Check if news exists
      const news = await News.findById(newsId);
      if (!news) {
        throw new Error('News not found');
      }

      // If reply, check parent comment exists
      if (parentCommentId) {
        const parentComment = await Comment.findById(parentCommentId);
        if (!parentComment) {
          throw new Error('Parent comment not found');
        }
      }

      // Create comment
      const comment = await Comment.create({
        news: newsId,
        user: userId,
        content: content.trim(),
        parentComment: parentCommentId,
      });

      // Populate user info
      await comment.populate('user', 'firstName lastName avatar');

      logger.info(`Comment added: ${comment._id} by ${userId}`);

      return { success: true, comment };
    } catch (error) {
      logger.error('Add comment error:', error);
      throw error;
    }
  }

  /**
   * Get comments for news article
   */
  async getComments(newsId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      // Get top-level comments (no parent)
      const [comments, total] = await Promise.all([
        Comment.find({
          news: newsId,
          parentComment: null,
          status: 'approved',
        })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('user', 'firstName lastName avatar')
          .populate({
            path: 'replyCount',
          }),
        Comment.countDocuments({
          news: newsId,
          parentComment: null,
          status: 'approved',
        }),
      ]);

      return {
        comments,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get comments error:', error);
      throw error;
    }
  }

  /**
   * Get replies for a comment
   */
  async getReplies(commentId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const [replies, total] = await Promise.all([
        Comment.find({
          parentComment: commentId,
          status: 'approved',
        })
          .sort({ createdAt: 1 })
          .skip(skip)
          .limit(limit)
          .populate('user', 'firstName lastName avatar'),
        Comment.countDocuments({
          parentComment: commentId,
          status: 'approved',
        }),
      ]);

      return {
        replies,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get replies error:', error);
      throw error;
    }
  }

  /**
   * Update comment
   */
  async updateComment(commentId, userId, content) {
    try {
      const comment = await Comment.findOne({ _id: commentId, user: userId });

      if (!comment) {
        return { success: false, message: 'Comment not found or unauthorized' };
      }

      comment.content = content.trim();
      comment.edited = true;
      comment.editedAt = new Date();
      await comment.save();

      logger.info(`Comment updated: ${commentId}`);

      return { success: true, comment };
    } catch (error) {
      logger.error('Update comment error:', error);
      throw error;
    }
  }

  /**
   * Delete comment
   */
  async deleteComment(commentId, userId) {
    try {
      const comment = await Comment.findOne({ _id: commentId, user: userId });

      if (!comment) {
        return { success: false, message: 'Comment not found or unauthorized' };
      }

      // Delete comment and all replies
      await Comment.deleteMany({
        $or: [
          { _id: commentId },
          { parentComment: commentId },
        ],
      });

      logger.info(`Comment deleted: ${commentId}`);

      return { success: true };
    } catch (error) {
      logger.error('Delete comment error:', error);
      throw error;
    }
  }

  /**
   * Like/Unlike comment
   */
  async toggleLike(commentId, userId) {
    try {
      const comment = await Comment.findById(commentId);

      if (!comment) {
        return { success: false, message: 'Comment not found' };
      }

      const likeIndex = comment.likes.indexOf(userId);
      const dislikeIndex = comment.dislikes.indexOf(userId);

      // Remove dislike if exists
      if (dislikeIndex > -1) {
        comment.dislikes.splice(dislikeIndex, 1);
      }

      // Toggle like
      if (likeIndex > -1) {
        comment.likes.splice(likeIndex, 1);
      } else {
        comment.likes.push(userId);
      }

      await comment.save();

      return {
        success: true,
        liked: likeIndex === -1,
        likeCount: comment.likes.length,
        dislikeCount: comment.dislikes.length,
      };
    } catch (error) {
      logger.error('Toggle like error:', error);
      throw error;
    }
  }

  /**
   * Flag comment
   */
  async flagComment(commentId, userId, reason) {
    try {
      const comment = await Comment.findById(commentId);

      if (!comment) {
        return { success: false, message: 'Comment not found' };
      }

      // Check if already flagged by this user
      const alreadyFlagged = comment.flaggedBy.some(
        f => f.user.toString() === userId.toString()
      );

      if (alreadyFlagged) {
        return { success: false, message: 'Already flagged' };
      }

      comment.flaggedBy.push({
        user: userId,
        reason,
      });

      // Auto-moderate if flagged by 5+ users
      if (comment.flaggedBy.length >= 5) {
        comment.status = 'flagged';
      }

      await comment.save();

      return { success: true };
    } catch (error) {
      logger.error('Flag comment error:', error);
      throw error;
    }
  }
}

module.exports = new CommentService();
```

### Comment Routes

```javascript
// server/src/routes/comments.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const commentService = require('../services/commentService');

// Get comments for news article
router.get('/news/:newsId', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const result = await commentService.getComments(
      req.params.newsId,
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

// Get replies for comment
router.get('/:commentId/replies', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const result = await commentService.getReplies(
      req.params.commentId,
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

// Add comment (requires auth)
router.post('/', authenticate, async (req, res) => {
  try {
    const { newsId, content, parentCommentId } = req.body;

    const result = await commentService.addComment(
      req.userId,
      newsId,
      content,
      parentCommentId
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Update comment
router.patch('/:commentId', authenticate, async (req, res) => {
  try {
    const { content } = req.body;

    const result = await commentService.updateComment(
      req.params.commentId,
      req.userId,
      content
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

// Delete comment
router.delete('/:commentId', authenticate, async (req, res) => {
  try {
    const result = await commentService.deleteComment(
      req.params.commentId,
      req.userId
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

// Like comment
router.post('/:commentId/like', authenticate, async (req, res) => {
  try {
    const result = await commentService.toggleLike(
      req.params.commentId,
      req.userId
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

// Flag comment
router.post('/:commentId/flag', authenticate, async (req, res) => {
  try {
    const { reason } = req.body;

    const result = await commentService.flagComment(
      req.params.commentId,
      req.userId,
      reason
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

module.exports = router;
```

---

## 📧 PARTIE 4 : NEWSLETTER AUTOMATIQUE

### Newsletter Service

```javascript
// server/src/services/newsletterService.js
const { sendEmail } = require('../config/resend');
const News = require('../models/News');
const User = require('../models/User');
const logger = require('../utils/logger');

class NewsletterService {
  /**
   * Generate daily digest HTML
   */
  generateDailyDigestHTML(topNews, user) {
    const newsItems = topNews.map(article => `
      <div style="margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 20px;">
        <img src="${article.image}" alt="${article.title}" 
             style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 15px;">
        
        <div style="background: #F9D406; color: #000; display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; margin-bottom: 10px;">
          ${article.category}
        </div>
        
        <h3 style="margin: 10px 0; color: #1A1915;">
          <a href="https://footballhub.ma/news/${article._id}" 
             style="color: #1A1915; text-decoration: none;">
            ${article.title}
          </a>
        </h3>
        
        <p style="color: #666; line-height: 1.6; margin: 10px 0;">
          ${article.excerpt}
        </p>
        
        <div style="margin-top: 10px;">
          <a href="https://footballhub.ma/news/${article._id}" 
             style="background: #F9D406; color: #000; padding: 8px 20px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: bold;">
            Lire l'article →
          </a>
        </div>
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #F9D406 0%, #FBDD28 100%); padding: 40px 30px; text-align: center; }
          .header h1 { color: #000; margin: 0; font-size: 32px; }
          .header p { color: #000; opacity: 0.8; margin: 10px 0 0; }
          .content { padding: 30px; }
          .footer { background: #1A1915; color: white; padding: 30px; text-align: center; font-size: 12px; }
          .footer a { color: #F9D406; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚽ Votre Résumé Quotidien</h1>
            <p>Les meilleures actualités football du jour</p>
          </div>
          
          <div class="content">
            <p style="color: #666; margin-bottom: 30px;">
              Bonjour ${user.firstName},
            </p>
            
            <p style="color: #666; margin-bottom: 30px;">
              Voici les ${topNews.length} actualités les plus importantes de la journée :
            </p>
            
            ${newsItems}
            
            <div style="text-align: center; margin-top: 40px; padding: 20px; background: #f8f8f8; border-radius: 8px;">
              <p style="margin: 0 0 15px; color: #666;">Vous voulez plus d'actualités ?</p>
              <a href="https://footballhub.ma/news" 
                 style="background: #1A1915; color: #F9D406; padding: 12px 30px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: bold;">
                Voir toutes les news
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>© 2024 FootballHub+. Tous droits réservés.</p>
            <p style="margin: 10px 0;">
              <a href="https://footballhub.ma/settings/notifications">Gérer mes préférences</a> | 
              <a href="https://footballhub.ma/unsubscribe">Se désabonner</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate weekly digest HTML
   */
  generateWeeklyDigestHTML(topNews, stats, user) {
    const newsItems = topNews.slice(0, 10).map(article => `
      <tr>
        <td style="padding: 15px 0; border-bottom: 1px solid #eee;">
          <div style="display: flex; align-items: center;">
            <img src="${article.image}" 
                 style="width: 80px; height: 60px; object-fit: cover; border-radius: 6px; margin-right: 15px;">
            <div>
              <div style="background: #F9D406; color: #000; display: inline-block; padding: 2px 8px; border-radius: 8px; font-size: 10px; font-weight: bold; margin-bottom: 5px;">
                ${article.category}
              </div>
              <h4 style="margin: 5px 0; font-size: 14px;">
                <a href="https://footballhub.ma/news/${article._id}" 
                   style="color: #1A1915; text-decoration: none;">
                  ${article.title}
                </a>
              </h4>
              <p style="color: #999; font-size: 11px; margin: 5px 0;">
                ${article.views.toLocaleString()} vues
              </p>
            </div>
          </div>
        </td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #1A1915 0%, #2D2A25 100%); padding: 40px 30px; text-align: center; }
          .header h1 { color: #F9D406; margin: 0; font-size: 32px; }
          .content { padding: 30px; }
          .stats { display: flex; justify-content: space-around; margin: 30px 0; }
          .stat { text-align: center; padding: 20px; background: #f8f8f8; border-radius: 8px; flex: 1; margin: 0 10px; }
          .stat-number { font-size: 32px; font-weight: bold; color: #F9D406; }
          .stat-label { color: #666; font-size: 12px; margin-top: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📰 Résumé Hebdomadaire</h1>
            <p style="color: white; opacity: 0.8; margin: 10px 0 0;">
              Les actualités de la semaine
            </p>
          </div>
          
          <div class="content">
            <p style="color: #666;">
              Bonjour ${user.firstName},
            </p>
            
            <p style="color: #666; margin-bottom: 30px;">
              Voici le résumé de cette semaine en chiffres :
            </p>
            
            <div class="stats">
              <div class="stat">
                <div class="stat-number">${stats.totalNews}</div>
                <div class="stat-label">Nouveaux Articles</div>
              </div>
              <div class="stat">
                <div class="stat-number">${stats.totalViews}</div>
                <div class="stat-label">Vues Totales</div>
              </div>
              <div class="stat">
                <div class="stat-number">${stats.topCategory}</div>
                <div class="stat-label">Catégorie Populaire</div>
              </div>
            </div>
            
            <h3 style="color: #1A1915; margin: 30px 0 20px;">
              Top 10 des articles les plus lus :
            </h3>
            
            <table style="width: 100%;">
              ${newsItems}
            </table>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send daily digest
   */
  async sendDailyDigest() {
    try {
      logger.info('📧 Sending daily digest...');

      // Get top news from last 24 hours
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const topNews = await News.find({
        status: 'Published',
        publishedAt: { $gte: yesterday },
      })
        .sort({ views: -1, publishedAt: -1 })
        .limit(5)
        .select('title excerpt image category views _id');

      if (topNews.length === 0) {
        logger.info('No news for daily digest');
        return { sent: 0 };
      }

      // Get users with daily digest enabled
      const users = await User.find({
        'notificationSettings.dailyDigest': true,
      }).select('email firstName');

      if (users.length === 0) {
        logger.info('No users subscribed to daily digest');
        return { sent: 0 };
      }

      let sentCount = 0;

      for (const user of users) {
        try {
          const html = this.generateDailyDigestHTML(topNews, user);

          await sendEmail({
            to: user.email,
            subject: `📰 Votre résumé quotidien - ${new Date().toLocaleDateString('fr-FR')}`,
            html,
          });

          sentCount++;
        } catch (error) {
          logger.error(`Failed to send digest to ${user.email}:`, error.message);
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      logger.info(`✅ Daily digest sent to ${sentCount} users`);

      return { sent: sentCount, total: users.length };
    } catch (error) {
      logger.error('Daily digest error:', error);
      throw error;
    }
  }

  /**
   * Send weekly digest
   */
  async sendWeeklyDigest() {
    try {
      logger.info('📧 Sending weekly digest...');

      // Get top news from last 7 days
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const [topNews, stats] = await Promise.all([
        News.find({
          status: 'Published',
          publishedAt: { $gte: lastWeek },
        })
          .sort({ views: -1 })
          .limit(10)
          .select('title excerpt image category views _id'),
        
        News.aggregate([
          { $match: { status: 'Published', publishedAt: { $gte: lastWeek } } },
          {
            $group: {
              _id: null,
              totalNews: { $sum: 1 },
              totalViews: { $sum: '$views' },
            },
          },
        ]),
      ]);

      if (topNews.length === 0) {
        logger.info('No news for weekly digest');
        return { sent: 0 };
      }

      // Get most popular category
      const categoryStats = await News.aggregate([
        { $match: { status: 'Published', publishedAt: { $gte: lastWeek } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]);

      const digestStats = {
        totalNews: stats[0]?.totalNews || 0,
        totalViews: stats[0]?.totalViews?.toLocaleString() || '0',
        topCategory: categoryStats[0]?._id || 'N/A',
      };

      // Get users with weekly digest enabled
      const users = await User.find({
        'notificationSettings.weeklyDigest': true,
      }).select('email firstName');

      let sentCount = 0;

      for (const user of users) {
        try {
          const html = this.generateWeeklyDigestHTML(topNews, digestStats, user);

          await sendEmail({
            to: user.email,
            subject: `📊 Votre résumé hebdomadaire - Semaine ${new Date().getWeek()}`,
            html,
          });

          sentCount++;
        } catch (error) {
          logger.error(`Failed to send weekly digest to ${user.email}:`, error.message);
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      logger.info(`✅ Weekly digest sent to ${sentCount} users`);

      return { sent: sentCount, total: users.length };
    } catch (error) {
      logger.error('Weekly digest error:', error);
      throw error;
    }
  }
}

// Helper: Get week number
Date.prototype.getWeek = function() {
  const d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNo;
};

module.exports = new NewsletterService();
```

Suite dans le prochain fichier avec YouTube Integration et Composants React ! 🚀
