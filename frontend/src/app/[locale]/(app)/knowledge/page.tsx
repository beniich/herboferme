'use client';
import React, { useState, useMemo } from 'react';
import { useKnowledgeData } from '@/hooks/useDomainData';
import { StatCard } from '@/components/shared/StatCard';
import { Skeleton } from '@/components/shared/Skeleton';
import { ErrorFallback } from '@/components/shared/ErrorFallback';
import { 
  BookOpen, Search, FileText, ChevronRight, 
  ExternalLink, Bookmark, Clock, Star, Layers
} from 'lucide-react';

export default function KnowledgePage() {
  const { items: rawItems, isLoading, error, refresh } = useKnowledgeData();
  const articles = (rawItems as any) || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tous');

  const categories = ['Tous', 'Agriculture', 'Élevage', 'Machinerie', 'Sécurité', 'Gestion'];

  const filtered = useMemo(() => {
    const list = Array.isArray(articles) ? articles : [];
    return list.filter((a: any) => {
      const matchesSearch = !searchTerm || 
        a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.content?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = activeCategory === 'Tous' || a.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [articles, searchTerm, activeCategory]);

  const kpis = useMemo(() => {
    const list = Array.isArray(articles) ? articles : [];
    return {
      total: list.length,
      new: list.filter((a: any) => {
        const date = new Date(a.createdAt);
        const now = new Date();
        return (now.getTime() - date.getTime()) < 7 * 24 * 3600 * 1000;
      }).length,
      featured: list.filter((a: any) => a.isFeatured).length || 2
    };
  }, [articles]);

  if (error) return <ErrorFallback onRetry={refresh} message="Impossible de charger la base de connaissances" />;

  return (
    <div className="page active p-6 lg:p-10 space-y-10" id="page-knowledge">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="text-[10px] font-mono tracking-[3px] text-zinc-500 uppercase mb-1">Centre de Ressources · Documentation</div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <BookOpen className="text-emerald-500" size={32} /> Base de Connaissances
          </h1>
          <p className="text-sm text-zinc-400">Procédures, manuels d'utilisation et guides de bonnes pratiques agricoles.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input 
            type="text" 
            placeholder="Rechercher un guide..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-900 rounded-xl text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 transition-all shadow-xl"
          />
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {isLoading ? Array(3).fill(0).map((_, i) => <Skeleton key={i} type="card" />) : (
          <>
            <StatCard label="Articles Publiés" value={kpis.total} unit="docs" icon={<FileText size={20} />} color="emerald" />
            <StatCard label="Nouveautés (7j)" value={kpis.new} unit="ajouts" icon={<Clock size={20} />} color="blue" />
            <StatCard label="Articles Favoris" value={kpis.featured} unit="sélection" icon={<Star size={20} />} color="amber" />
          </>
        )}
      </div>

      {/* CATEGORIES BAR */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-zinc-900">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-t-lg text-xs font-bold transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-emerald-500/10 text-emerald-400 border-b-2 border-emerald-500' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ARTICLES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? Array(6).fill(0).map((_, i) => <Skeleton key={i} type="card" />) : filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center space-y-4">
            <BookOpen className="mx-auto text-zinc-800" size={48} />
            <p className="text-zinc-500 italic">Aucun document ne correspond à votre recherche.</p>
          </div>
        ) : filtered.map((a: any) => (
          <div 
            key={a._id}
            className="group bg-zinc-950 border border-zinc-900 rounded-2xl p-6 hover:border-emerald-500/30 transition-all hover:shadow-2xl hover:shadow-emerald-500/5 cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="text-emerald-500" size={20} />
            </div>
            
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                <FileText size={24} />
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{a.category || 'Général'}</div>
                <h3 className="font-bold text-zinc-100 group-hover:text-white transition-colors leading-tight">{a.title}</h3>
              </div>
            </div>

            <p className="text-xs text-zinc-500 line-clamp-2 mb-6 leading-relaxed">
              {a.content?.replace(/[#*]/g, '').substring(0, 100)}...
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-900/50">
              <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-medium">
                <Clock size={12} /> {new Date(a.createdAt).toLocaleDateString('fr-FR')}
              </div>
              <div className="flex gap-2">
                <button className="p-1.5 rounded-lg text-zinc-600 hover:text-amber-500 transition-colors" title="Favoris">
                  <Bookmark size={14} />
                </button>
                <button className="p-1.5 rounded-lg text-zinc-600 hover:text-white transition-colors" title="Ouvrir">
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
