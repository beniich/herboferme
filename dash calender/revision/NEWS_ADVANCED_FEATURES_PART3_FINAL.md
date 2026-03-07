# 🎥 FootballHub+ - FONCTIONNALITÉS NEWS AVANCÉES (Partie 3 FINAL)

## 🎥 PARTIE 5 : YOUTUBE VIDEOS INTEGRATION

### YouTube Service

```javascript
// server/src/services/youtubeService.js
const axios = require('axios');
const redis = require('../config/redis');
const logger = require('../utils/logger');

class YouTubeService {
  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY;
    this.baseURL = 'https://www.googleapis.com/youtube/v3';
  }

  /**
   * Search videos by query
   */
  async searchVideos(query, maxResults = 10) {
    try {
      // Check cache
      const cacheKey = `youtube:search:${query}:${maxResults}`;
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      const response = await axios.get(`${this.baseURL}/search`, {
        params: {
          key: this.apiKey,
          q: query,
          part: 'snippet',
          type: 'video',
          maxResults,
          order: 'date',
          videoDuration: 'any',
          relevanceLanguage: 'fr',
        },
      });

      const videos = response.data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high.url,
        publishedAt: item.snippet.publishedAt,
        channelTitle: item.snippet.channelTitle,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
      }));

      // Cache for 1 hour
      await redis.setex(cacheKey, 3600, JSON.stringify(videos));

      return videos;
    } catch (error) {
      logger.error('YouTube search error:', error);
      throw error;
    }
  }

  /**
   * Get related videos for news article
   */
  async getRelatedVideos(newsTitle, league = null, teams = []) {
    try {
      // Build search query
      let query = newsTitle;
      
      if (league) {
        query += ` ${league.name}`;
      }
      
      if (teams && teams.length > 0) {
        query += ` ${teams.map(t => t.name).join(' ')}`;
      }

      query += ' highlights goals';

      const videos = await this.searchVideos(query, 5);

      return videos;
    } catch (error) {
      logger.error('Get related videos error:', error);
      return [];
    }
  }

  /**
   * Get trending football videos
   */
  async getTrendingVideos() {
    try {
      const cacheKey = 'youtube:trending:football';
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      const response = await axios.get(`${this.baseURL}/videos`, {
        params: {
          key: this.apiKey,
          part: 'snippet,statistics',
          chart: 'mostPopular',
          videoCategoryId: '17', // Sports category
          maxResults: 20,
          regionCode: 'MA', // Morocco
        },
      });

      const videos = response.data.items
        .filter(item => 
          item.snippet.title.toLowerCase().includes('football') ||
          item.snippet.title.toLowerCase().includes('soccer')
        )
        .slice(0, 10)
        .map(item => ({
          id: item.id,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.high.url,
          publishedAt: item.snippet.publishedAt,
          channelTitle: item.snippet.channelTitle,
          viewCount: parseInt(item.statistics.viewCount),
          likeCount: parseInt(item.statistics.likeCount),
          url: `https://www.youtube.com/watch?v=${item.id}`,
          embedUrl: `https://www.youtube.com/embed/${item.id}`,
        }));

      // Cache for 6 hours
      await redis.setex(cacheKey, 21600, JSON.stringify(videos));

      return videos;
    } catch (error) {
      logger.error('Get trending videos error:', error);
      return [];
    }
  }

  /**
   * Get video details
   */
  async getVideoDetails(videoId) {
    try {
      const response = await axios.get(`${this.baseURL}/videos`, {
        params: {
          key: this.apiKey,
          part: 'snippet,statistics,contentDetails',
          id: videoId,
        },
      });

      const item = response.data.items[0];

      if (!item) {
        return null;
      }

      return {
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high.url,
        publishedAt: item.snippet.publishedAt,
        channelTitle: item.snippet.channelTitle,
        duration: item.contentDetails.duration,
        viewCount: parseInt(item.statistics.viewCount),
        likeCount: parseInt(item.statistics.likeCount),
        commentCount: parseInt(item.statistics.commentCount),
        url: `https://www.youtube.com/watch?v=${item.id}`,
        embedUrl: `https://www.youtube.com/embed/${item.id}`,
      };
    } catch (error) {
      logger.error('Get video details error:', error);
      return null;
    }
  }
}

module.exports = new YouTubeService();
```

### YouTube Routes

```javascript
// server/src/routes/youtube.js
const express = require('express');
const router = express.Router();
const youtubeService = require('../services/youtubeService');
const { cache } = require('../middleware/cache');

// Search videos
router.get('/search', cache(3600), async (req, res) => {
  try {
    const { q, maxResults = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter required',
      });
    }

    const videos = await youtubeService.searchVideos(q, parseInt(maxResults));

    res.json({
      success: true,
      videos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get trending videos
router.get('/trending', cache(21600), async (req, res) => {
  try {
    const videos = await youtubeService.getTrendingVideos();

    res.json({
      success: true,
      videos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get related videos for news
router.get('/news/:newsId/related', cache(3600), async (req, res) => {
  try {
    const news = await News.findById(req.params.newsId).populate('league teams');

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found',
      });
    }

    const videos = await youtubeService.getRelatedVideos(
      news.title,
      news.league,
      news.teams
    );

    res.json({
      success: true,
      videos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get video details
router.get('/video/:videoId', cache(3600), async (req, res) => {
  try {
    const video = await youtubeService.getVideoDetails(req.params.videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    res.json({
      success: true,
      video,
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

## ⏰ PARTIE 6 : NEWSLETTER CRON JOBS

```javascript
// server/src/jobs/newsletterJob.js
const cron = require('node-cron');
const newsletterService = require('../services/newsletterService');
const logger = require('../utils/logger');

class NewsletterJob {
  constructor() {
    this.isRunning = {
      daily: false,
      weekly: false,
    };
  }

  /**
   * Start CRON jobs
   */
  start() {
    // Daily digest - Every day at 8 AM
    cron.schedule('0 8 * * *', async () => {
      if (this.isRunning.daily) {
        logger.warn('Daily digest already running');
        return;
      }

      try {
        this.isRunning.daily = true;
        logger.info('🔄 Starting daily newsletter...');

        const result = await newsletterService.sendDailyDigest();

        logger.info(`✅ Daily newsletter sent: ${result.sent}/${result.total}`);
      } catch (error) {
        logger.error('❌ Daily newsletter failed:', error);
      } finally {
        this.isRunning.daily = false;
      }
    });

    // Weekly digest - Every Monday at 9 AM
    cron.schedule('0 9 * * 1', async () => {
      if (this.isRunning.weekly) {
        logger.warn('Weekly digest already running');
        return;
      }

      try {
        this.isRunning.weekly = true;
        logger.info('🔄 Starting weekly newsletter...');

        const result = await newsletterService.sendWeeklyDigest();

        logger.info(`✅ Weekly newsletter sent: ${result.sent}/${result.total}`);
      } catch (error) {
        logger.error('❌ Weekly newsletter failed:', error);
      } finally {
        this.isRunning.weekly = false;
      }
    });

    logger.info('✅ Newsletter CRON jobs started');
  }

  /**
   * Send newsletter now (manual trigger)
   */
  async sendNow(type = 'daily') {
    try {
      logger.info(`🔄 Sending ${type} newsletter manually...`);

      const result = type === 'daily'
        ? await newsletterService.sendDailyDigest()
        : await newsletterService.sendWeeklyDigest();

      logger.info(`✅ Newsletter sent: ${result.sent}/${result.total}`);

      return result;
    } catch (error) {
      logger.error('Manual newsletter send failed:', error);
      throw error;
    }
  }
}

const newsletterJob = new NewsletterJob();

module.exports = newsletterJob;
```

```javascript
// server/src/index.js - Add to main file
const newsletterJob = require('./jobs/newsletterJob');

// Start newsletter CRON jobs
newsletterJob.start();
```

---

## 🎨 PARTIE 7 : COMPOSANTS REACT

### Composant Bookmark Button

```typescript
// src/components/news/BookmarkButton.tsx
import React, { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { apiClient } from '@/config/axios';
import { useAuth } from '@/hooks/useAuth';

interface BookmarkButtonProps {
  newsId: string;
  onToggle?: (isBookmarked: boolean) => void;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({ newsId, onToggle }) => {
  const { isAuthenticated } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      checkBookmark();
    }
  }, [newsId, isAuthenticated]);

  const checkBookmark = async () => {
    try {
      const response = await apiClient.get(`/api/bookmarks/check/${newsId}`);
      setIsBookmarked(response.data.isBookmarked);
    } catch (error) {
      console.error('Check bookmark error:', error);
    }
  };

  const toggleBookmark = async () => {
    if (!isAuthenticated) {
      alert('Veuillez vous connecter pour sauvegarder des articles');
      return;
    }

    try {
      setLoading(true);

      if (isBookmarked) {
        await apiClient.delete(`/api/bookmarks/${newsId}`);
        setIsBookmarked(false);
        onToggle?.(false);
      } else {
        await apiClient.post('/api/bookmarks', { newsId });
        setIsBookmarked(true);
        onToggle?.(true);
      }
    } catch (error) {
      console.error('Toggle bookmark error:', error);
      alert('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleBookmark}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        isBookmarked
          ? 'bg-primary text-black'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      } disabled:opacity-50`}
    >
      <Bookmark size={18} className={isBookmarked ? 'fill-current' : ''} />
      <span>{isBookmarked ? 'Enregistré' : 'Enregistrer'}</span>
    </button>
  );
};
```

### Composant Comments Section

```typescript
// src/components/news/CommentsSection.tsx
import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Flag, Reply, Edit, Trash2 } from 'lucide-react';
import { apiClient } from '@/config/axios';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Comment {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
  edited: boolean;
  likes: string[];
  replyCount?: number;
}

export const CommentsSection: React.FC<{ newsId: string }> = ({ newsId }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchComments();
  }, [newsId, page]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/comments/news/${newsId}`, {
        params: { page, limit: 10 },
      });

      setComments(response.data.comments);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Fetch comments error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert('Veuillez vous connecter pour commenter');
      return;
    }

    if (!newComment.trim()) return;

    try {
      await apiClient.post('/api/comments', {
        newsId,
        content: newComment,
        parentCommentId: replyTo,
      });

      setNewComment('');
      setReplyTo(null);
      fetchComments();
    } catch (error) {
      console.error('Submit comment error:', error);
      alert('Une erreur est survenue');
    }
  };

  const handleLike = async (commentId: string) => {
    if (!isAuthenticated) {
      alert('Veuillez vous connecter pour liker');
      return;
    }

    try {
      await apiClient.post(`/api/comments/${commentId}/like`);
      fetchComments();
    } catch (error) {
      console.error('Like comment error:', error);
    }
  };

  return (
    <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <MessageSquare size={24} />
        Commentaires ({comments.length})
      </h3>

      {/* Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajouter un commentaire..."
            className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            rows={3}
          />
          <div className="flex justify-end gap-2 mt-2">
            {replyTo && (
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Annuler
              </button>
            )}
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="px-6 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {replyTo ? 'Répondre' : 'Commenter'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
          <p className="text-gray-600 dark:text-gray-400">
            <a href="/login" className="text-primary hover:underline">
              Connectez-vous
            </a>{' '}
            pour commenter
          </p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                  <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length > 0 ? (
        <>
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                onReply={() => setReplyTo(comment._id)}
                onLike={() => handleLike(comment._id)}
                currentUserId={user?._id}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50"
              >
                Précédent
              </button>
              <span className="px-4 py-2">
                Page {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <MessageSquare size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Soyez le premier à commenter !
          </p>
        </div>
      )}
    </div>
  );
};

const CommentItem: React.FC<{
  comment: Comment;
  onReply: () => void;
  onLike: () => void;
  currentUserId?: string;
}> = ({ comment, onReply, onLike, currentUserId }) => {
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: fr,
  });

  const isLiked = currentUserId && comment.likes.includes(currentUserId);

  return (
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
        <span className="text-primary font-bold">
          {comment.user.firstName[0]}{comment.user.lastName[0]}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="font-medium text-gray-900 dark:text-white">
                {comment.user.firstName} {comment.user.lastName}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                {timeAgo}
                {comment.edited && ' (modifié)'}
              </span>
            </div>
          </div>

          <p className="text-gray-700 dark:text-gray-300">
            {comment.content}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-2 text-sm">
          <button
            onClick={onLike}
            className={`flex items-center gap-1 ${
              isLiked ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ThumbsUp size={14} className={isLiked ? 'fill-current' : ''} />
            <span>{comment.likes.length}</span>
          </button>

          <button
            onClick={onReply}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
          >
            <Reply size={14} />
            <span>Répondre</span>
          </button>

          {comment.replyCount && comment.replyCount > 0 && (
            <span className="text-gray-500">
              {comment.replyCount} réponse{comment.replyCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
```

### Composant YouTube Videos

```typescript
// src/components/news/RelatedVideos.tsx
import React, { useState, useEffect } from 'react';
import { Play, Eye } from 'lucide-react';
import { apiClient } from '@/config/axios';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  viewCount?: number;
  embedUrl: string;
}

export const RelatedVideos: React.FC<{ newsId: string }> = ({ newsId }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  useEffect(() => {
    fetchVideos();
  }, [newsId]);

  const fetchVideos = async () => {
    try {
      const response = await apiClient.get(`/api/youtube/news/${newsId}/related`);
      setVideos(response.data.videos);
    } catch (error) {
      console.error('Fetch videos error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || videos.length === 0) return null;

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        🎥 Vidéos Associées
      </h3>

      {selectedVideo ? (
        <div className="mb-6">
          <div className="aspect-video rounded-xl overflow-hidden">
            <iframe
              src={selectedVideo.embedUrl}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
          <button
            onClick={() => setSelectedVideo(null)}
            className="mt-4 text-primary hover:underline"
          >
            ← Retour aux vidéos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {videos.map((video) => (
            <button
              key={video.id}
              onClick={() => setSelectedVideo(video)}
              className="group relative aspect-video rounded-xl overflow-hidden"
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                <Play size={48} className="text-white" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white text-sm font-medium line-clamp-2">
                  {video.title}
                </p>
                <p className="text-white/70 text-xs mt-1">
                  {video.channelTitle}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## ✅ RÉCAPITULATIF COMPLET

### Variables d'Environnement

```bash
# .env
YOUTUBE_API_KEY=your_youtube_api_key
```

### Installation

```bash
npm install axios googleapis
```

### Routes à ajouter dans index.js

```javascript
app.use('/api/bookmarks', require('./routes/bookmarks'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/youtube', require('./routes/youtube'));
```

### CRON Jobs à démarrer

```javascript
const newsletterJob = require('./jobs/newsletterJob');
newsletterJob.start();
```

---

## 🎉 TOUTES LES FONCTIONNALITÉS CRÉÉES !

✅ **Push Notifications Breaking News**
✅ **Bookmarks/Save for Later**
✅ **Comments System Complet**
✅ **Newsletter Automatique**
✅ **YouTube Videos Integration**

**SYSTÈME DE NEWS 100% COMPLET ! 🚀📰**
