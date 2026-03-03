'use client';

import { itTicketsApi, complaintsApi } from '@/lib/api';
import {
    Activity,
    AlertCircle,
    CheckCircle2,
    Clock,
    Filter,
    HelpCircle,
    LayoutDashboard,
    ListTodo,
    Search,
    Settings,
    Tag,
    User,
    Wrench,
    Plus,
    MonitorIcon,
    ArrowRight
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/LoadingSpinner';

type TaskType = 'it_ticket' | 'complaint';

interface UnifiedTask {
    id: string;
    type: TaskType;
    title: string;
    description: string;
    status: string;
    priority: string;
    assignedTo?: string;
    createdAt: string;
    category: string;
}

export default function UnifiedTasksPage() {
    const [tasks, setTasks] = useState<UnifiedTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<'all' | TaskType>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        loadAllTasks();
    }, []);

    const loadAllTasks = async () => {
        setLoading(true);
        try {
            const [itData, complaintsData] = await Promise.all([
                itTicketsApi.getAll().catch(() => ({ data: [] })),
                complaintsApi.getAll().catch(() => ({ data: [] }))
            ]);

            const itTasks: UnifiedTask[] = (itData.data || []).map((t: any) => ({
                id: t._id,
                type: 'it_ticket' as const,
                title: t.title,
                description: t.description,
                status: t.status,
                priority: t.priority,
                assignedTo: t.assignedTo ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}` : 'Unassigned',
                createdAt: t.createdAt,
                category: t.category
            }));

            const complaintTasks: UnifiedTask[] = (complaintsData.data || []).map((c: any) => ({
                id: c._id,
                type: 'complaint' as const,
                title: c.title,
                description: c.description,
                status: c.status,
                priority: c.priority,
                assignedTo: c.assignedTo ? 'Assigned' : 'Unassigned',
                createdAt: c.createdAt,
                category: c.category
            }));

            setTasks([...itTasks, ...complaintTasks].sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ));
        } catch (error) {
            toast.error('Erreur lors du chargement des t  ches');
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status: string) => {
        const s = status.toLowerCase();
        if (['nouvelle', 'new'].includes(s)) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        if (['en cours', 'in_progress', 'assigned'].includes(s)) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
        if (['r  solue', 'resolved', 'termin  ', 'closed'].includes(s)) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400';
    };

    const getPriorityIcon = (priority: string) => {
        const p = priority.toLowerCase();
        if (['high', 'urgent', 'critical'].includes(p)) return <AlertCircle className="w-4 h-4 text-red-500" />;
        return <Activity className="w-4 h-4 text-blue-500" />;
    };

    const filteredTasks = tasks.filter(task => {
        const matchesType = filterType === 'all' || task.type === filterType;
        const matchesStatus = statusFilter === 'all' || task.status.toLowerCase().includes(statusFilter.toLowerCase());
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             task.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesStatus && matchesSearch;
    });

    const stats = {
        total: tasks.length,
        pending: tasks.filter(t => ['new', 'nouvelle', 'assigned'].includes(t.status.toLowerCase())).length,
        inProgress: tasks.filter(t => ['en cours', 'in_progress'].includes(t.status.toLowerCase())).length,
        resolved: tasks.filter(t => ['r  solue', 'resolved', 'closed', 'termin  '].includes(t.status.toLowerCase())).length,
    };

    return (
        <div className="flex flex-col gap-6 max-w-[1400px] mx-auto animate-in fade-in duration-500">
            {/* Header Secion */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <ListTodo className="w-8 h-8 text-primary" />
                        </div>
                        Helpdesk GLPI
                    </h1>
                    <p className="text-slate-500 font-medium">Gestion centralis  e de toutes les interventions et tickets IT.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" title="Configuration" aria-label="Configuration" className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Configuration
                    </button>
                    <button type="button" title="Nouveau Ticket" aria-label="Nouveau Ticket" className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Nouveau Ticket
                    </button>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total T  ches', value: stats.total, icon: ListTodo, color: 'text-slate-600', bg: 'bg-slate-100' },
                    { label: 'En Attente', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
                    { label: 'En Cours', value: stats.inProgress, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-100' },
                    { label: 'R  solues', value: stats.resolved, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className={cn("p-3 rounded-xl", stat.bg)}>
                            <stat.icon className={cn("w-6 h-6", stat.color)} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden min-h-[600px] flex flex-col">
                {/* Filters Bar */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
                    <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                        <button
                            type="button"
                            onClick={() => setFilterType('all')}
                            className={cn("px-4 py-1.5 rounded-lg text-sm font-bold transition-all", filterType === 'all' ? "bg-primary text-white shadow-md shadow-primary/20" : "text-slate-500 hover:text-slate-700")}
                        >
                            Tous
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterType('it_ticket')}
                            className={cn("px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2", filterType === 'it_ticket' ? "bg-primary text-white shadow-md shadow-primary/20" : "text-slate-500 hover:text-slate-700")}
                        >
                            <MonitorIcon className="w-4 h-4" />
                            IT Support
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterType('complaint')}
                            className={cn("px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2", filterType === 'complaint' ? "bg-primary text-white shadow-md shadow-primary/20" : "text-slate-500 hover:text-slate-700")}
                        >
                            <Wrench className="w-4 h-4" />
                            Technique
                        </button>
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Rechercher une t  che..."
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            title="Filtrer par statut"
                            aria-label="Filtrer par statut"
                            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none cursor-pointer"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Tout Statuts</option>
                            <option value="new">Nouveau</option>
                            <option value="en cours">En cours</option>
                            <option value="r  solue">Termin  </option>
                        </select>
                    </div>
                </div>

                {/* Tasks List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center p-20">
                            <LoadingSpinner />
                        </div>
                    ) : filteredTasks.length > 0 ? (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredTasks.map((task) => (
                                <div key={task.id} className="group p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className={cn("p-2 rounded-xl mt-1", task.type === 'it_ticket' ? "bg-blue-50 text-blue-600" : "bg-primary/5 text-primary")}>
                                            {task.type === 'it_ticket' ? <MonitorIcon className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{task.title}</h3>
                                                <span className={cn("text-[10px] font-black uppercase px-2 py-0.5 rounded-full", getStatusStyle(task.status))}>
                                                    {task.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 line-clamp-1 max-w-2xl">{task.description}</p>
                                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                                    <Tag className="w-3.5 h-3.5" />
                                                    {task.category}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                                    <User className="w-3.5 h-3.5" />
                                                    {task.assignedTo}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium lowercase">
                                                    {getPriorityIcon(task.priority)}
                                                    {task.priority || 'Normale'}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    {new Date(task.createdAt).toLocaleDateString('fr-FR')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 self-end md:self-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button type="button" title="Voir les d  tails" aria-label="Voir les d  tails" className="p-2 text-slate-400 hover:text-primary transition-colors">
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
                            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
                                <Search className="w-8 h-8 text-slate-400" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Aucune t  che trouv  e</h4>
                                <p className="text-slate-500 text-sm">Essayez de modifier vos filtres ou lancez une nouvelle recherche.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Flux de donn  es synchronis  </span>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            API Backend Active
                        </span>
                        <span>{filteredTasks.length} Affich  s</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
