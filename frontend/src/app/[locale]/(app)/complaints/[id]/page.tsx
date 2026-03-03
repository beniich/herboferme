'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, MapPin, User, Phone, Mail, ArrowLeft, Printer, Edit, MessageSquare, MoreHorizontal, ShieldCheck, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { StatusBadge, PriorityBadge } from '@/components/ui/StatusBadge';
import { Timeline } from '@/components/ui/Timeline';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatDate, formatTime } from '@/lib/utils';
import type { Complaint, TimelineEvent } from '@/types';

export default function ComplaintDetailPage() {
    const router = useRouter();
    const params = useParams();
    const complaintId = params.id as string;

    // States
    const [complaint, setComplaint] = useState<Complaint | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');

    useEffect(() => {
        if (!complaintId) return;

        const fetchComplaint = async () => {
            try {
                const data = await apiClient.get<Complaint>(`/complaints/${complaintId}`);
                setComplaint(data);
            } catch (err: any) {
                console.error(err);
                setError(err.response?.status === 404 ? "R  clamation introuvable" : "Erreur de chargement");
            } finally {
                setLoading(false);
            }
        };

        fetchComplaint();
    }, [complaintId]);

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (error || !complaint) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
                <div className="bg-rose-500/10 p-4 rounded-full">
                    <AlertCircle className="w-12 h-12 text-rose-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{error || "Introuvable"}</h2>
                <button
                    onClick={() => router.back()}
                    className="px-6 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                >
                    Retour    la liste
                </button>
            </div>
        );
    }

    // Prepare timeline (merge actual backend data if available, otherwise use placeholders)
    // Note: The backend schema might differ, adjusting to what was seen in the types
    const timelineEvents: TimelineEvent[] = (complaint as any).timeline || [
        {
            id: '1',
            type: 'created',
            title: 'R  clamation Cr    e',
            description: 'La r  clamation a   t   transmise au syst  me.',
            timestamp: complaint.createdAt,
        },
        ...(complaint.status !== 'nouvelle' ? [{
            id: '2',
            type: 'assigned',
            title: 'Assign      l\'  quipe',
            description: `Le ticket est g  r   par ${(complaint.assignedTeamId as any)?.name || 'l\'  quipe technique'}.`,
            timestamp: complaint.updatedAt,
            actor: (complaint.technicianId as any)?.name || 'Superviseur',
        }] : [])
    ];

    return (
        <div className="min-h-screen animate-in fade-in duration-500">
            {/* Header / Breadcrumbs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                        <Link
                            href="/complaints"
                            className="text-sm font-semibold text-slate-400 hover:text-primary transition-colors flex items-center gap-1"
                        >
                            <ArrowLeft className="w-3 h-3" />
                            R  clamations
                        </Link>
                        <span className="text-slate-600">/</span>
                        <span className="text-sm font-bold text-primary"> #{complaint.number || complaint._id.slice(-6)}</span>
                        <StatusBadge status={complaint.status as any} />
                        <PriorityBadge priority={complaint.priority as any} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        {complaint.title}
                    </h2>
                    <div className="text-slate-500 dark:text-slate-400 mt-2 flex flex-wrap items-center gap-4 text-sm font-medium">
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-primary/70" />
                            {formatDate(complaint.createdAt)}
                        </span>
                        <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></span>
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-primary/70" />
                            {formatTime(complaint.createdAt)}
                        </span>
                        <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></span>
                        <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-rose-500/70" />
                            {complaint.city}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                        <Printer className="w-4 h-4" />
                        Imprimer
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-primary/20">
                        <Edit className="w-4 h-4" />
                          diter
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Content */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Timeline Card */}
                    <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-tight">
                                <span className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <Clock className="w-5 h-5" />
                                </span>
                                Historique d'Intervention
                            </h3>
                            <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                                Live Updates
                            </span>
                        </div>
                        <Timeline events={timelineEvents} />
                    </section>

                    {/* Details Section */}
                    <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4 mb-6 uppercase tracking-tight">
                            Description du Probl  me
                        </h3>
                        <div className="space-y-6">
                            <div className="text-slate-600 dark:text-slate-300 text-base leading-relaxed italic">
                                "{complaint.description || "Aucune description d  taill  e n'a   t   fournie pour cette r  clamation."}"
                            </div>

                            {complaint.priority === 'urgent' && (
                                <div className="bg-rose-50 dark:bg-rose-950/20 p-5 rounded-2xl border-l-4 border-rose-500 flex items-start gap-4">
                                    <AlertCircle className="w-6 h-6 text-rose-500 shrink-0" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">Alerte Prioritaire</p>
                                        <p className="text-sm text-rose-700 dark:text-rose-300 leading-relaxed font-medium">
                                            Cette r  clamation a   t   marqu  e comme critique. Une intervention imm  diate est requise pour assurer la continuit   du service et la s  curit   publique.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Images Grid */}
                            {complaint.photos && complaint.photos.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Preuves Photographiques</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {complaint.photos.map((photo, index) => (
                                            <div
                                                key={index}
                                                className="group relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 cursor-pointer"
                                                onClick={() => {
                                                    setSelectedImage(photo);
                                                    setShowImageModal(true);
                                                }}
                                            >
                                                <img
                                                    src={photo}
                                                    alt={`Evidence ${index + 1}`}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-x-0 bottom-0 bg-black/50 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <p className="text-[10px] text-white font-bold text-center">Zoomer</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Team Discussion / Notes (Placeholder UI) */}
                    <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Commentaires Techniques</h3>
                            <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                                Ajouter une note
                            </button>
                        </div>
                        <div className="flex flex-col items-center justify-center py-10 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                            <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-3" />
                            <p className="text-sm text-slate-400 font-medium italic">Aucun commentaire technique disponible pour le moment.</p>
                        </div>
                    </section>
                </div>

                {/* Right Side - Info & Actions */}
                <aside className="lg:col-span-4 space-y-8">
                    {/* Client Profile Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h4 className="font-extrabold text-[10px] uppercase tracking-[0.2em] text-slate-400">Information Signalement</h4>
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="p-8 flex flex-col items-center">
                            <div className="mb-6 relative">
                                <div className="size-24 rounded-[2rem] bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center text-3xl font-black italic shadow-2xl shadow-primary/40 ring-4 ring-white dark:ring-slate-900">
                                    {complaint.isAnonymous ? '?' : (complaint.firstName?.charAt(0) || 'U')}
                                </div>
                                <div className="absolute -bottom-1 -right-1 size-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-sm text-primary">person</span>
                                </div>
                            </div>

                            <div className="text-center mb-8">
                                <p className="font-black text-slate-900 dark:text-white text-2xl tracking-tight">
                                    {complaint.isAnonymous ? 'Citoyen Anonyme' : `${complaint.firstName} ${complaint.lastName}`}
                                </p>
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">
                                    D  clarant {complaint.isAnonymous ? 'Inconnu' : 'V  rifi  '}
                                </p>
                            </div>

                            <div className="w-full space-y-4">
                                {!complaint.isAnonymous && (
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700 group cursor-pointer">
                                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500 group-hover:scale-110 transition-transform">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">T  l  phone</p>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{complaint.phone || 'Non renseign  '}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                    <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500 shrink-0">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Localisation</p>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 italic leading-relaxed">{complaint.address}</p>
                                    </div>
                                </div>
                            </div>

                            {!complaint.isAnonymous && (
                                <button className="w-full mt-8 py-4 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3">
                                    <MessageSquare className="w-4 h-4" />
                                    Contacter le d  clarant
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Operations Card */}
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 space-y-6 text-white overflow-hidden relative group">
                        <div className="absolute -right-10 -bottom-10 size-48 bg-primary/10 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-700"></div>

                        <div className="flex items-center justify-between relative z-10">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Contr  les</h3>
                            <MoreHorizontal className="w-4 h-4 text-white/20" />
                        </div>

                        <div className="grid grid-cols-2 gap-3 relative z-10">
                            <button className="flex flex-col items-center gap-3 py-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all group/btn">
                                <ShieldCheck className="w-6 h-6 text-emerald-500 group-hover/btn:text-white" />
                                <span className="text-[10px] font-black uppercase tracking-widest">R  soudre</span>
                            </button>
                            <button className="flex flex-col items-center gap-3 py-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-primary hover:text-white hover:border-primary transition-all group/btn">
                                <User className="w-6 h-6 text-primary group-hover/btn:text-white" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Assigner</span>
                            </button>
                            <button className="flex flex-col items-center gap-3 py-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all group/btn">
                                <AlertCircle className="w-6 h-6 text-rose-500 group-hover/btn:text-white" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Urgent</span>
                            </button>
                            <button className="flex flex-col items-center gap-3 py-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all group/btn">
                                <Edit className="w-6 h-6 text-amber-500 group-hover/btn:text-white" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Modifier</span>
                            </button>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Modal Image */}
            {showImageModal && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-20 bg-black/95 backdrop-blur-sm transition-all animate-in fade-in duration-300"
                    onClick={() => setShowImageModal(false)}
                >
                    <button className="absolute top-6 right-6 text-white hover:rotate-90 transition-all p-2">
                        <ArrowLeft className="w-8 h-8" />
                    </button>
                    <div className="relative max-w-5xl w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
                        <img
                            src={selectedImage}
                            alt="Preview"
                            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-in zoom-in duration-300"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
