'use client';

import { useState } from 'react';
import KPICard from '@/components/feedback/satisfaction/KPICard';
import TrendChart from '@/components/feedback/satisfaction/TrendChart';
import FeedbackList from '@/components/feedback/satisfaction/FeedbackList';
import TopDepartments from '@/components/feedback/satisfaction/TopDepartments';
import SentimentKeywords from '@/components/feedback/satisfaction/SentimentKeywords';
import ResolutionEfficiency from '@/components/feedback/satisfaction/ResolutionEfficiency';
import { useSatisfactionData } from '@/hooks/useSatisfaction';
import { Search, Bell, Download, Loader2 } from 'lucide-react';

export default function SatisfactionDashboardPage() {
    const { data, isLoading, error } = useSatisfactionData();
    const [search, setSearch] = useState('');

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <p className="text-sm font-medium text-slate-500 animate-pulse uppercase tracking-widest">Initialisation du Dashboard...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center p-8 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/20 max-w-md">
                    <p className="text-rose-600 dark:text-rose-400 font-bold mb-2">Erreur de chargement</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Impossible de r  cup  rer les donn  es de satisfaction. Veuillez r  essayer plus tard.</p>
                </div>
            </div>
        );
    }

    const filteredFeedback = data.feedbacks.filter((fb) => {
        const term = search.toLowerCase();
        return (
            fb.name.toLowerCase().includes(term) ||
            fb.comment.toLowerCase().includes(term) ||
            fb.district.toLowerCase().includes(term) ||
            fb.tags.some((t) => t.toLowerCase().includes(term))
        );
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                            Satisfaction Dashboard
                        </h2>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ring-1 ring-emerald-200 dark:ring-emerald-500/20">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live Data
                        </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                        Analyse en temps r  el du sentiment des citoyens et de l'efficacit   des interventions.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Search container */}
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                        <input
                            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm w-full md:w-64 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="Rechercher un feedback..."
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <button className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <Bell className="size-5" />
                    </button>

                    <button className="bg-primary text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20">
                        <Download className="size-4" />
                        Exporter
                    </button>
                </div>
            </header>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.kpis.map((k, idx) => (
                    <KPICard
                        key={idx}
                        title={k.title}
                        value={k.value}
                        sub={k.sub}
                        change={k.change}
                        changePositive={k.changePositive}
                        iconStars={k.iconStars}
                    />
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Charts & Feedbacks) */}
                <div className="lg:col-span-2 space-y-8">
                    <TrendChart data={data.trend} />
                    <FeedbackList feedbacks={filteredFeedback} />
                </div>

                {/* Right Column (Sidebar Metrics) */}
                <div className="space-y-8">
                    <TopDepartments departments={data.departments} />
                    <SentimentKeywords keywords={data.keywords} />
                    <ResolutionEfficiency />
                </div>
            </div>
        </div>
    );
}
