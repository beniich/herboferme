'use client';

import { useAssignments } from '@/hooks/useAssignments';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function TechnicianPage() {
    const { data: assignments, isLoading, refetch } = useAssignments();

    // Trouver la t  che active (en cours)
    const activeTask = assignments?.find((a: any) => a.status === 'en cours');
    // Trouver les t  ches    venir (affect  )
    const upcomingTasks = assignments?.filter((a: any) => a.status === 'affect  ') || [];

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await api.patch(`/assignments/${id}`, { status: newStatus });
            toast.success(`Statut mis    jour : ${newStatus}`);
            refetch();
        } catch (error) {
            toast.error("Erreur lors de la mise    jour");
        }
    };

    if (isLoading) return <div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>;

    return (
        <div className="bg-background-light text-slate-900 min-h-screen font-display flex flex-col">
            {/* Tech Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 lg:px-10 py-3">
                <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 text-primary">
                            <span className="material-symbols-outlined text-3xl font-bold">bolt</span>
                            <h2 className="text-slate-900 text-xl font-black leading-tight tracking-tight">TECHFLOW</h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center bg-slate-100 rounded-xl px-3 py-1.5 gap-2">
                            <span className="material-symbols-outlined text-sm text-slate-500">cloud_done</span>
                            <span className="text-xs font-bold text-slate-500">SYNC</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full max-w-[1200px] mx-auto p-4 lg:p-10 space-y-8">
                {/* Title & Status */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <p className="text-primary font-bold text-sm uppercase tracking-widest">Tableau de Bord Technicien</p>
                        <h1 className="text-4xl font-black tracking-tight">Agenda du Jour</h1>
                        <p className="text-slate-500 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">calendar_today</span>
                            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}     {upcomingTasks.length} interventions en attente
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => refetch()}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 rounded-xl px-6 py-3 font-bold text-sm hover:bg-slate-50 transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">sync</span>
                            Rafra  chir
                        </button>
                    </div>
                </div>

                {/* Active Task Section */}
                {activeTask ? (
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                                T  che Active
                            </h2>
                            <span className="text-xs font-black bg-red-100 text-red-600 px-3 py-1 rounded-full uppercase">
                                Priorit  : {activeTask.complaintId?.priority || 'Normale'}
                            </span>
                        </div>
                        <div className="bg-white rounded-2xl border border-primary/20 shadow-xl shadow-primary/5 overflow-hidden">
                            <div className="flex flex-col lg:flex-row">
                                {/* Map Placeholder - Could be replaced by real map later */}
                                <div className="lg:w-1/3 min-h-[240px] relative bg-slate-200">
                                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-6xl text-primary opacity-20">map</span>
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <button className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-xl font-black shadow-lg shadow-primary/40 hover:scale-[1.02] transition-transform">
                                            <span className="material-symbols-outlined">directions_car</span>
                                            OUVRIR NAVIGATION GPS
                                        </button>
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="lg:w-2/3 p-6 lg:p-8 flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <span className="bg-primary/10 text-primary text-xs font-black px-3 py-1 rounded-full uppercase">
                                                {activeTask.complaintId?.category}     {activeTask.teamId?.name}
                                            </span>
                                            <div className="flex items-center gap-2 text-primary font-mono font-bold text-xl">
                                                <span className="material-symbols-outlined">timer</span>
                                                {formatDistanceToNow(new Date(activeTask.assignedAt), { locale: fr })}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-black">{activeTask.complaintId?.title}</h3>
                                            <p className="text-slate-500 text-lg flex items-start gap-2">
                                                <span className="material-symbols-outlined text-primary">location_on</span>
                                                {activeTask.complaintId?.address}
                                            </p>
                                            <div className="p-4 bg-slate-50 rounded-xl border-l-4 border-primary">
                                                <p className="text-sm font-bold uppercase text-slate-500 mb-1">Description</p>
                                                <p className="text-slate-900">{activeTask.complaintId?.description}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex flex-wrap gap-4">
                                        <button
                                            onClick={() => handleStatusChange(activeTask._id, 'termin  ')}
                                            className="flex-1 min-w-[200px] flex items-center justify-center gap-3 bg-green-600 text-white py-4 rounded-xl font-black text-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
                                        >
                                            <span className="material-symbols-outlined">check_circle</span>
                                            MARQUER R  SOLU
                                        </button>
                                        <button className="flex-1 min-w-[200px] flex items-center justify-center gap-3 bg-slate-100 text-slate-900 py-4 rounded-xl font-black text-lg hover:bg-slate-200 transition-colors">
                                            <span className="material-symbols-outlined">pause</span>
                                            PAUSE
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                ) : (
                    <section className="bg-slate-50 p-8 rounded-2xl border border-slate-200 text-center">
                        <p className="text-slate-500 font-medium">Aucune intervention active pour le moment.</p>
                    </section>
                )}

                {/* Upcoming List */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">list_alt</span>
                        interventions en attente
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {upcomingTasks.length > 0 ? upcomingTasks.map((task: any) => (
                            <div key={task._id} className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between hover:border-primary/50 transition-colors">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-black bg-slate-100 px-2 py-1 rounded">
                                            {task.complaintId?.category}
                                        </span>
                                        <span className="text-xs font-bold text-slate-500">
                                            {new Date(task.assignedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-lg leading-tight">{task.complaintId?.title}</h4>
                                    <p className="text-sm text-slate-500 line-clamp-1">
                                        {task.complaintId?.address}     {task.complaintId?.priority}
                                    </p>
                                </div>
                                <div className="mt-6 flex gap-2">
                                    <button
                                        onClick={() => handleStatusChange(task._id, 'en cours')}
                                        className="flex-1 bg-primary text-white py-2 rounded-lg font-bold text-sm"
                                    >
                                        D  MARRER
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <p className="col-span-2 text-slate-400 italic text-sm">Aucune intervention en attente.</p>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
