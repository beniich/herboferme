'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';
import { CalendarDays, MessageSquare, MoreHorizontal, Search, SlidersHorizontal, ArrowLeft, Clock } from 'lucide-react';

interface Intervention {
    id: string;
    title: string;
    description?: string;
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    start: Date;
    end: Date;
    teamName: string;
    location: string;
    assignedTechnicians: Array<{
        id: string;
        name: string;
        avatar?: string;
    }>;
}

interface KanbanBoardProps {
    interventions: Intervention[];
    onInterventionClick?: (intervention: Intervention) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ interventions, onInterventionClick }) => {
    const [activeTab, setActiveTab] = useState<'todo' | 'progress' | 'done'>('todo');
    const [searchQuery, setSearchQuery] = useState('');
    const [isMounted, setIsMounted] = useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    const filteredInterventions = interventions.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const todoItems = filteredInterventions.filter(item => item.status === 'scheduled');
    const progressItems = filteredInterventions.filter(item => item.status === 'in-progress');
    const doneItems = filteredInterventions.filter(item => item.status === 'completed');

    const renderCard = (item: Intervention) => {
        const priorityColors = {
            urgent: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
            high: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
            medium: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
            low: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
        };

        const isToday = new Date(item.start).toDateString() === new Date().toDateString();

        return (
            <div 
                key={item.id}
                onClick={() => onInterventionClick?.(item)}
                className="bg-white dark:bg-[#1A2633] p-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800 active:scale-[0.99] transition-transform duration-100 cursor-pointer"
            >
                <div className="flex justify-between items-start mb-2">
                    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider", priorityColors[item.priority] || priorityColors.medium)}>
                        {item.priority}
                    </span>
                    <button className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug mb-3">
                    {item.title}
                </h3>
                {item.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                        {item.description}
                    </p>
                )}
                <div className="flex items-center justify-between mt-auto">
                    <div className={cn("flex items-center gap-2 text-xs font-medium", isToday ? "text-red-500" : "text-slate-500 dark:text-slate-400")}>
                        {isToday ? <Clock className="w-4 h-4" /> : <CalendarDays className="w-4 h-4" />}
                        <span>
                            {isMounted ? (isToday ? "Due Today" : new Date(item.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) : "..."}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-slate-400 text-xs mr-2">
                            <MessageSquare className="w-4 h-4" />
                            <span>3</span>
                        </div>
                        <div className="flex -space-x-2 overflow-hidden">
                            {item.assignedTechnicians.slice(0, 3).map((tech, i) => (
                                <img 
                                    key={tech.id}
                                    src={tech.avatar || `https://ui-avatars.com/api/?name=${tech.name}&background=random`}
                                    alt={tech.name}
                                    className="h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#1A2633] object-cover"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark">
            {/* Search / Filter */}
            <div className="px-4 py-4">
                <div className="relative flex items-center">
                    <Search className="absolute left-3 text-slate-400 w-5 h-5" />
                    <input 
                        className="w-full h-10 pl-10 pr-4 rounded-lg bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-primary/50 text-sm" 
                        placeholder="Filter tasks..." 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="absolute right-2 p-1 text-slate-400 hover:text-primary transition-colors">
                        <SlidersHorizontal className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Column Tabs (Mobile Only) */}
            <div className="flex lg:hidden px-4 gap-6 border-b border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
                <button 
                    onClick={() => setActiveTab('todo')}
                    className={cn(
                        "flex items-center gap-2 pb-3 border-b-2 font-semibold whitespace-nowrap",
                        activeTab === 'todo' ? "border-primary text-primary" : "border-transparent text-slate-500"
                    )}
                >
                    <span>To Do</span>
                    <span className={cn("flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-bold", activeTab === 'todo' ? "bg-primary/10" : "bg-slate-100")}>
                        {todoItems.length}
                    </span>
                </button>
                <button 
                    onClick={() => setActiveTab('progress')}
                    className={cn(
                        "flex items-center gap-2 pb-3 border-b-2 font-medium whitespace-nowrap",
                        activeTab === 'progress' ? "border-primary text-primary" : "border-transparent text-slate-500"
                    )}
                >
                    <span>In Progress</span>
                    <span className={cn("flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-bold", activeTab === 'progress' ? "bg-primary/10" : "bg-slate-100")}>
                        {progressItems.length}
                    </span>
                </button>
                <button 
                    onClick={() => setActiveTab('done')}
                    className={cn(
                        "flex items-center gap-2 pb-3 border-b-2 font-medium whitespace-nowrap",
                        activeTab === 'done' ? "border-primary text-primary" : "border-transparent text-slate-500"
                    )}
                >
                    <span>Done</span>
                    <span className={cn("flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-bold", activeTab === 'done' ? "bg-primary/10" : "bg-slate-100")}>
                        {doneItems.length}
                    </span>
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                {/* Desktop Grid */}
                <div className="hidden lg:grid grid-cols-3 gap-6 p-6 h-full overflow-y-auto">
                    <div className="space-y-4">
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">To Do ({todoItems.length})</h2>
                        {todoItems.map(renderCard)}
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">In Progress ({progressItems.length})</h2>
                        {progressItems.map(renderCard)}
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">Done ({doneItems.length})</h2>
                        {doneItems.map(renderCard)}
                    </div>
                </div>

                {/* Mobile View */}
                <div className="lg:hidden h-full overflow-y-auto p-4 space-y-4 pb-24">
                    {activeTab === 'todo' && todoItems.map(renderCard)}
                    {activeTab === 'progress' && progressItems.map(renderCard)}
                    {activeTab === 'done' && doneItems.map(renderCard)}
                </div>
            </div>
        </div>
    );
};
