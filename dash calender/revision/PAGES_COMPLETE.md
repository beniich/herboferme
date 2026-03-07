# ⚽ Pages Complètes React - Leagues, News & Matches

## 📄 Page 1 : Leagues (Ligues)

```typescript
// src/pages/Leagues.tsx

import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, Globe, Star } from 'lucide-react';
import { LeagueCard } from '@/components/leagues/LeagueCard';
import { SafeArea } from '@/components/SafeArea';
import { hapticFeedback } from '@/utils/haptics';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '@/config/api';

interface League {
  _id: string;
  name: string;
  logo: string;
  country: {
    name: string;
    code: string;
    flag: string;
  };
  followersCount: number;
  isFeatured: boolean;
  currentSeason: {
    year: number;
    current: boolean;
  };
}

export default function LeaguesPage() {
  const navigate = useNavigate();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [filteredLeagues, setFilteredLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'featured' | 'all'>('featured');

  // Fetch leagues
  useEffect(() => {
    fetchLeagues();
  }, [activeTab]);

  const fetchLeagues = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === 'featured' 
        ? `${getApiUrl()}/leagues/featured`
        : `${getApiUrl()}/leagues?limit=100`;
      
      const response = await axios.get(endpoint);
      const data = activeTab === 'featured' ? response.data : response.data.leagues;
      
      setLeagues(data);
      setFilteredLeagues(data);
    } catch (error) {
      console.error('Error fetching leagues:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter leagues
  useEffect(() => {
    let filtered = leagues;

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter((league) =>
        league.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        league.country.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by country
    if (selectedCountry !== 'all') {
      filtered = filtered.filter((league) => league.country.name === selectedCountry);
    }

    setFilteredLeagues(filtered);
  }, [searchQuery, selectedCountry, leagues]);

  // Get unique countries
  const countries = Array.from(
    new Set(leagues.map((league) => league.country.name))
  ).sort();

  const handleLeagueClick = (leagueId: string) => {
    hapticFeedback.light();
    navigate(`/leagues/${leagueId}`);
  };

  const handleTabChange = (tab: 'featured' | 'all') => {
    hapticFeedback.selection();
    setActiveTab(tab);
    setSearchQuery('');
    setSelectedCountry('all');
  };

  return (
    <SafeArea className="min-h-screen bg-background-dark pb-20">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background-dark/95 backdrop-blur-xl border-b border-white/10 pt-safe">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Ligues</h1>
              <p className="text-sm text-gray-400 mt-1">
                Suivez vos compétitions préférées
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Filter size={20} className="text-primary" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une ligue..."
              className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => handleTabChange('featured')}
              className={`flex-1 h-10 rounded-xl font-medium transition-all ${
                activeTab === 'featured'
                  ? 'bg-primary text-black'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Star size={16} />
                <span>Populaires</span>
              </div>
            </button>
            <button
              onClick={() => handleTabChange('all')}
              className={`flex-1 h-10 rounded-xl font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-primary text-black'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Globe size={16} />
                <span>Toutes</span>
              </div>
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="px-6 pb-4 border-t border-white/10 pt-4 animate-slide-down">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Pays
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary"
            >
              <option value="all">Tous les pays</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="px-6 py-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-24 bg-white/5 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredLeagues.length > 0 ? (
          <div className="space-y-4">
            {filteredLeagues.map((league) => (
              <LeagueCard
                key={league._id}
                league={league}
                onClick={() => handleLeagueClick(league._id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Search size={32} className="text-gray-600" />
            </div>
            <p className="text-gray-400 text-center">
              Aucune ligue trouvée
            </p>
          </div>
        )}
      </main>
    </SafeArea>
  );
}
```

---

## 📄 Page 2 : Matches

```typescript
// src/pages/Matches.tsx

import React, { useState, useEffect } from 'react';
import { Calendar, Play, Clock, Filter } from 'lucide-react';
import { MatchCard } from '@/components/matches/MatchCard';
import { SafeArea } from '@/components/SafeArea';
import { hapticFeedback } from '@/utils/haptics';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '@/config/api';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Match {
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
    _id: string;
    name: string;
    logo: string;
  };
}

type MatchTab = 'live' | 'upcoming' | 'finished';

export default function MatchesPage() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MatchTab>('live');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch matches
  useEffect(() => {
    fetchMatches();
    
    // Auto-refresh live matches every 30 seconds
    if (activeTab === 'live' && autoRefresh) {
      const interval = setInterval(fetchMatches, 30000);
      return () => clearInterval(interval);
    }
  }, [activeTab, selectedDate, autoRefresh]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      let endpoint = '';

      switch (activeTab) {
        case 'live':
          endpoint = `${getApiUrl()}/matches/live`;
          break;
        case 'upcoming':
          endpoint = `${getApiUrl()}/matches/upcoming?limit=20`;
          break;
        case 'finished':
          endpoint = `${getApiUrl()}/matches?status=FINISHED&limit=20`;
          break;
      }

      const response = await axios.get(endpoint);
      const data = response.data.matches || response.data;
      setMatches(data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: MatchTab) => {
    hapticFeedback.selection();
    setActiveTab(tab);
  };

  const handleMatchClick = (matchId: string) => {
    hapticFeedback.light();
    navigate(`/matches/${matchId}`);
  };

  // Date selector
  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i - 3));

  return (
    <SafeArea className="min-h-screen bg-background-dark pb-20">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background-dark/95 backdrop-blur-xl border-b border-white/10 pt-safe">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Matchs</h1>
              <p className="text-sm text-gray-400 mt-1">
                Scores et résultats en direct
              </p>
            </div>
            {activeTab === 'live' && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-full">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-red-500">LIVE</span>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => handleTabChange('live')}
              className={`flex-1 h-12 rounded-xl font-medium transition-all ${
                activeTab === 'live'
                  ? 'bg-red-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Play size={16} />
                <span>Live</span>
              </div>
            </button>
            <button
              onClick={() => handleTabChange('upcoming')}
              className={`flex-1 h-12 rounded-xl font-medium transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-primary text-black'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Clock size={16} />
                <span>À venir</span>
              </div>
            </button>
            <button
              onClick={() => handleTabChange('finished')}
              className={`flex-1 h-12 rounded-xl font-medium transition-all ${
                activeTab === 'finished'
                  ? 'bg-primary text-black'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Calendar size={16} />
                <span>Terminés</span>
              </div>
            </button>
          </div>

          {/* Date Selector (only for finished matches) */}
          {activeTab === 'finished' && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide mt-4 pb-2">
              {dates.map((date) => {
                const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-primary text-black'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-xs font-medium uppercase">
                      {format(date, 'EEE', { locale: fr })}
                    </span>
                    <span className="text-lg font-bold">
                      {format(date, 'd')}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="px-6 py-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 bg-white/5 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : matches.length > 0 ? (
          <div className="space-y-4">
            {matches.map((match) => (
              <MatchCard
                key={match._id}
                match={match}
                onClick={() => handleMatchClick(match._id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Calendar size={32} className="text-gray-600" />
            </div>
            <p className="text-gray-400 text-center">
              {activeTab === 'live'
                ? 'Aucun match en direct'
                : activeTab === 'upcoming'
                ? 'Aucun match à venir'
                : 'Aucun match terminé'}
            </p>
          </div>
        )}

        {/* Auto-refresh toggle for live matches */}
        {activeTab === 'live' && matches.length > 0 && (
          <div className="mt-6 flex items-center justify-center">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                autoRefresh
                  ? 'bg-primary/20 border border-primary text-primary'
                  : 'bg-white/5 border border-white/10 text-gray-400'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-primary animate-pulse' : 'bg-gray-600'}`} />
              <span className="text-sm font-medium">
                Actualisation auto {autoRefresh ? 'activée' : 'désactivée'}
              </span>
            </button>
          </div>
        )}
      </main>
    </SafeArea>
  );
}
```

---

## 📄 Page 3 : News

```typescript
// src/pages/News.tsx

import React, { useState, useEffect } from 'react';
import { Newspaper, TrendingUp, Filter, Search } from 'lucide-react';
import { NewsCard } from '@/components/news/NewsCard';
import { SafeArea } from '@/components/SafeArea';
import { hapticFeedback } from '@/utils/haptics';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '@/config/api';

interface NewsArticle {
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
    _id: string;
    name: string;
    logo: string;
  };
  isFeatured: boolean;
}

type NewsCategory = 'all' | 'Match' | 'Transfer' | 'Injury' | 'Interview' | 'General';

export default function NewsPage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const categories: { value: NewsCategory; label: string; icon: string }[] = [
    { value: 'all', label: 'Tout', icon: '📰' },
    { value: 'Match', label: 'Matchs', icon: '⚽' },
    { value: 'Transfer', label: 'Transferts', icon: '🔄' },
    { value: 'Injury', label: 'Blessures', icon: '🏥' },
    { value: 'Interview', label: 'Interviews', icon: '🎤' },
    { value: 'General', label: 'Général', icon: '📢' },
  ];

  // Fetch featured articles
  useEffect(() => {
    fetchFeaturedArticles();
  }, []);

  // Fetch articles
  useEffect(() => {
    fetchArticles();
  }, [selectedCategory, page]);

  const fetchFeaturedArticles = async () => {
    try {
      const response = await axios.get(`${getApiUrl()}/news/featured`);
      setFeaturedArticles(response.data);
    } catch (error) {
      console.error('Error fetching featured articles:', error);
    }
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      
      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await axios.get(`${getApiUrl()}/news`, { params });
      
      if (page === 1) {
        setArticles(response.data.articles);
      } else {
        setArticles((prev) => [...prev, ...response.data.articles]);
      }
      
      setHasMore(response.data.currentPage < response.data.totalPages);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: NewsCategory) => {
    hapticFeedback.selection();
    setSelectedCategory(category);
    setPage(1);
  };

  const handleArticleClick = (articleId: string) => {
    hapticFeedback.light();
    navigate(`/news/${articleId}`);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <SafeArea className="min-h-screen bg-background-dark pb-20">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background-dark/95 backdrop-blur-xl border-b border-white/10 pt-safe">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Actualités</h1>
              <p className="text-sm text-gray-400 mt-1">
                Les dernières news du football
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 border border-primary/30 rounded-full">
              <TrendingUp size={16} className="text-primary" />
              <span className="text-xs font-bold text-primary">Hot</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une actualité..."
              className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mt-4 pb-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => handleCategoryChange(category.value)}
                className={`flex-shrink-0 flex items-center gap-2 h-10 px-4 rounded-full font-medium transition-all ${
                  selectedCategory === category.value
                    ? 'bg-primary text-black'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                <span>{category.icon}</span>
                <span className="text-sm">{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-6 py-6">
        {/* Featured Section */}
        {featuredArticles.length > 0 && selectedCategory === 'all' && !searchQuery && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" />
              À la Une
            </h2>
            <div className="space-y-4">
              {featuredArticles.slice(0, 2).map((article, index) => (
                <NewsCard
                  key={article._id}
                  article={article}
                  variant="featured"
                  onClick={() => handleArticleClick(article._id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Articles Grid */}
        <div>
          {selectedCategory !== 'all' && (
            <h2 className="text-xl font-bold text-white mb-4">
              {categories.find((c) => c.value === selectedCategory)?.label}
            </h2>
          )}

          {loading && page === 1 ? (
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-64 bg-white/5 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : articles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-4">
                {articles.map((article) => (
                  <NewsCard
                    key={article._id}
                    article={article}
                    onClick={() => handleArticleClick(article._id)}
                  />
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="w-full mt-6 h-12 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  {loading ? 'Chargement...' : 'Charger plus'}
                </button>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Newspaper size={32} className="text-gray-600" />
              </div>
              <p className="text-gray-400 text-center">
                Aucune actualité trouvée
              </p>
            </div>
          )}
        </div>
      </main>
    </SafeArea>
  );
}
```

---

## 🎯 Points Clés des Pages

### ✅ Leagues Page
- **Tabs** : Featured / All leagues
- **Search** : Recherche par nom
- **Filters** : Par pays
- **Navigation** : Vers détails de la ligue
- **UI** : Cards avec logos, drapeaux, followers

### ✅ Matches Page
- **Tabs** : Live / Upcoming / Finished
- **Auto-refresh** : Scores live toutes les 30s
- **Date selector** : Pour matchs terminés
- **Status** : Indicateur LIVE animé
- **Navigation** : Vers détails du match

### ✅ News Page
- **Featured** : Articles à la une
- **Categories** : Match, Transfer, Injury, etc.
- **Search** : Recherche full-text
- **Infinite scroll** : Load more
- **Engagement** : Views, likes

Suite dans le prochain fichier avec :
1. Services de synchronisation automatique
2. Tâches CRON
3. Configuration déploiement
