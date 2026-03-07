'use client';

import React, { useState, useEffect } from 'react';
import {
  Book,
  Search,
  FileText,
  Video,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Download,
} from 'lucide-react';

export const KnowledgeBase: React.FC = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchArticles();
    fetchCategories();
  }, [selectedCategory]);

  const fetchArticles = async () => {
    try {
      const params = selectedCategory !== 'all' ? `?category=${selectedCategory}` : '';
      const response = await fetch(`/api/knowledge${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setArticles(data.articles || []);
    } catch (e) {
      console.error('Error fetching knowledge articles:', e);
    }
  };

  const fetchCategories = () => {
    setCategories([
      { name: 'Guides', count: 12, icon: Book },
      { name: 'Procédures', count: 8, icon: FileText },
      { name: 'FAQ', count: 24, icon: HelpCircle },
      { name: 'Formations', count: 6, icon: Video },
    ]);
  };

  const filteredArticles = articles.filter(a => 
    a.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isMounted) return null;

  return (
    <div className="min-h-[calc(100vh-100px)] bg-slate-50 dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Base de Connaissance
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Documentation, guides et procédures agricoles
        </p>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 mb-8 border border-slate-100 dark:border-slate-800">
        <div className="relative max-w-2xl mx-auto">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={24}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher dans la base de connaissance..."
            className="w-full pl-12 pr-4 py-4 border border-slate-300 dark:border-slate-600 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 outline-none"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {categories.map((category, index) => (
          <button
            key={index}
            onClick={() => setSelectedCategory(category.name.toLowerCase())}
            className={`bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all text-left border ${
              selectedCategory === category.name.toLowerCase() 
                ? 'border-blue-500 ring-1 ring-blue-500' 
                : 'border-slate-100 dark:border-slate-800'
            }`}
          >
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
              <category.icon size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
              {category.name}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {category.count} articles
            </p>
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500">
             Aucun article trouvé.
          </div>
        ) : filteredArticles.map((article) => (
          <article
            key={article._id}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-slate-100 dark:border-slate-800 flex flex-col"
          >
            <div className="p-6 flex flex-col h-full">
              <div className="mb-4">
                <span className="px-2.5 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 text-xs font-medium rounded-full">
                    {article.category || 'Article'}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {article.title}
              </h3>
              
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3 flex-1">
                {article.summary || article.content?.substring(0, 120)}...
              </p>

              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <span>{article.views || 0} vues</span>
                <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('fr-FR') : 'Récent'}</span>
              </div>

              <div className="flex items-center gap-4 text-sm mt-auto">
                <button className="flex items-center gap-1 text-green-600 hover:text-green-700 dark:text-green-400">
                  <ThumbsUp size={16} />
                  {article.helpful?.yes || 0}
                </button>
                <button className="flex items-center gap-1 text-red-600 hover:text-red-700 dark:text-red-400">
                  <ThumbsDown size={16} />
                  {article.helpful?.no || 0}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
