# 📰 FootballHub+ - COMPOSANTS NEWS ÉLÉGANTS (React)

## 🎨 PARTIE 4 : COMPOSANTS REACT PROFESSIONNELS

### Page News Principale

```typescript
// src/pages/News.tsx
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Clock, Eye, Search, Filter, 
  ChevronRight, Calendar, Tag, Share2 
} from 'lucide-react';
import { apiClient } from '@/config/axios';
import { NewsCard } from '@/components/news/NewsCard';
import { NewsFeatured } from '@/components/news/NewsFeatured';
import { NewsFilter } from '@/components/news/NewsFilter';
import { NewsCategories } from '@/components/news/NewsCategories';

interface NewsArticle {
  _id: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  publishedAt: string;
  category: string;
  views: number;
  league?: {
    name: string;
    logo: string;
  };
  teams?: Array<{
    name: string;
    logo: string;
  }>;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [featuredNews, setFeaturedNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchFeaturedNews();
  }, []);

  useEffect(() => {
    fetchNews();
  }, [category, searchTerm, page]);

  const fetchFeaturedNews = async () => {
    try {
      const response = await apiClient.get('/api/news/featured');
      setFeaturedNews(response.data.news);
    } catch (error) {
      console.error('Failed to fetch featured news:', error);
    }
  };

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/news', {
        params: {
          page,
          limit: 12,
          category: category !== 'all' ? category : undefined,
          search: searchTerm || undefined,
        },
      });

      setNews(response.data.news);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-yellow-500 to-primary py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-2">
            ⚽ Football News
          </h1>
          <p className="text-black/80 text-lg">
            Les dernières actualités du monde du football
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured News */}
        {featuredNews.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="text-primary" size={28} />
                À la Une
              </h2>
            </div>
            <NewsFeatured news={featuredNews} />
          </div>
        )}

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher une actualité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
            />
          </div>

          {/* Categories */}
          <NewsCategories
            activeCategory={category}
            onCategoryChange={setCategory}
          />
        </div>

        {/* News Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-800 h-48 rounded-t-xl" />
                <div className="bg-white dark:bg-gray-800 p-4 rounded-b-xl">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : news.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((article) => (
                <NewsCard key={article._id} article={article} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Précédent
                </button>

                <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                  Page {page} sur {totalPages}
                </span>

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Aucune actualité trouvée
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 🎴 COMPOSANT NEWS CARD

```typescript
// src/components/news/NewsCard.tsx
import React from 'react';
import { Clock, Eye, ChevronRight, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NewsCardProps {
  article: {
    _id: string;
    title: string;
    excerpt: string;
    image: string;
    author: string;
    publishedAt: string;
    category: string;
    views: number;
    league?: {
      name: string;
      logo: string;
    };
  };
}

export const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  const getCategoryColor = (category: string) => {
    const colors = {
      Transfers: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      Injuries: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      Matches: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      Interviews: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      Rumors: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      General: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    };
    return colors[category as keyof typeof colors] || colors.General;
  };

  const timeAgo = formatDistanceToNow(new Date(article.publishedAt), {
    addSuffix: true,
    locale: fr,
  });

  return (
    <article className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={article.image || 'https://via.placeholder.com/400x300/1A1915/F9D406?text=FootballHub+'}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getCategoryColor(article.category)}`}>
            {article.category}
          </span>
        </div>

        {/* League Badge */}
        {article.league && (
          <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2">
            <img
              src={article.league.logo}
              alt={article.league.name}
              className="w-5 h-5 object-contain"
            />
            <span className="text-xs font-medium text-gray-900 dark:text-white">
              {article.league.name}
            </span>
          </div>
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{timeAgo}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye size={14} />
            <span>{article.views.toLocaleString()} vues</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {article.excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Par {article.author}
          </span>
          
          <a
            href={`/news/${article._id}`}
            className="flex items-center gap-1 text-primary hover:gap-2 transition-all text-sm font-medium"
          >
            Lire plus
            <ChevronRight size={16} />
          </a>
        </div>
      </div>
    </article>
  );
};
```

---

## ⭐ COMPOSANT NEWS FEATURED

```typescript
// src/components/news/NewsFeatured.tsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, TrendingUp } from 'lucide-react';

interface NewsFeaturedProps {
  news: Array<{
    _id: string;
    title: string;
    excerpt: string;
    image: string;
    category: string;
    publishedAt: string;
  }>;
}

export const NewsFeatured: React.FC<NewsFeaturedProps> = ({ news }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % news.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + news.length) % news.length);
  };

  const currentArticle = news[currentIndex];

  return (
    <div className="relative h-[500px] rounded-2xl overflow-hidden group">
      {/* Background Image */}
      <img
        src={currentArticle.image || 'https://via.placeholder.com/1200x500'}
        alt={currentArticle.title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
        {/* Category Badge */}
        <div className="mb-4">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-full text-sm font-bold">
            <TrendingUp size={16} />
            {currentArticle.category}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 max-w-3xl">
          {currentArticle.title}
        </h2>

        {/* Excerpt */}
        <p className="text-white/90 text-lg mb-6 max-w-2xl line-clamp-2">
          {currentArticle.excerpt}
        </p>

        {/* Meta & CTA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/80">
            <Clock size={16} />
            <span className="text-sm">
              {new Date(currentArticle.publishedAt).toLocaleDateString('fr-FR')}
            </span>
          </div>

          <a
            href={`/news/${currentArticle._id}`}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-black font-bold rounded-xl transition-colors"
          >
            Lire l'article
          </a>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
      >
        <ChevronRight size={24} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {news.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'w-8 bg-primary'
                : 'w-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
```

---

## 🏷️ COMPOSANT CATEGORIES

```typescript
// src/components/news/NewsCategories.tsx
import React from 'react';
import { 
  TrendingUp, Heart, AlertCircle, Trophy, 
  MessageSquare, Zap, Users 
} from 'lucide-react';

interface NewsCategoriesProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: 'all', label: 'Tout', icon: TrendingUp, color: 'text-primary' },
  { id: 'Transfers', label: 'Transferts', icon: Users, color: 'text-blue-500' },
  { id: 'Matches', label: 'Matchs', icon: Trophy, color: 'text-green-500' },
  { id: 'Injuries', label: 'Blessures', icon: AlertCircle, color: 'text-red-500' },
  { id: 'Interviews', label: 'Interviews', icon: MessageSquare, color: 'text-purple-500' },
  { id: 'Rumors', label: 'Rumeurs', icon: Zap, color: 'text-yellow-500' },
];

export const NewsCategories: React.FC<NewsCategoriesProps> = ({
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => {
        const Icon = category.icon;
        const isActive = activeCategory === category.id;

        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
              isActive
                ? 'bg-primary text-black shadow-lg scale-105'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Icon size={18} className={!isActive ? category.color : ''} />
            <span>{category.label}</span>
          </button>
        );
      })}
    </div>
  );
};
```

---

## 📄 COMPOSANT PAGE DETAIL

```typescript
// src/pages/NewsDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Clock, Eye, Share2, Calendar, User, 
  ArrowLeft, Facebook, Twitter, Linkedin 
} from 'lucide-react';
import { apiClient } from '@/config/axios';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function NewsDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedNews, setRelatedNews] = useState([]);

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/news/${id}`);
      setArticle(response.data.news);

      // Fetch related news
      if (response.data.news.league) {
        const relatedResponse = await apiClient.get('/api/news/league/' + response.data.news.league._id, {
          params: { limit: 3 },
        });
        setRelatedNews(relatedResponse.data.news.filter((n: any) => n._id !== id));
      }
    } catch (error) {
      console.error('Failed to fetch article:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = article.title;

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}`,
    };

    window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Article non trouvé</p>
      </div>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(article.publishedAt), {
    addSuffix: true,
    locale: fr,
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <a
            href="/news"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Retour aux actualités</span>
          </a>

          {/* Category */}
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold">
              {article.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{timeAgo}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye size={16} />
              <span>{article.views.toLocaleString()} vues</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Image */}
        {article.image && (
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-96 object-cover rounded-2xl mb-8"
          />
        )}

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
            {article.content}
          </p>
        </div>

        {/* Share Buttons */}
        <div className="flex items-center gap-4 py-6 border-y border-gray-200 dark:border-gray-700">
          <span className="font-medium text-gray-900 dark:text-white">
            Partager :
          </span>
          <button
            onClick={() => handleShare('facebook')}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Facebook size={20} />
          </button>
          <button
            onClick={() => handleShare('twitter')}
            className="p-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
          >
            <Twitter size={20} />
          </button>
          <button
            onClick={() => handleShare('linkedin')}
            className="p-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors"
          >
            <Linkedin size={20} />
          </button>
        </div>

        {/* Related News */}
        {relatedNews.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Articles similaires
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedNews.map((news: any) => (
                <NewsCard key={news._id} article={news} />
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
```

Suite dans le prochain fichier avec CRON job de sync et guide complet ! 🚀
