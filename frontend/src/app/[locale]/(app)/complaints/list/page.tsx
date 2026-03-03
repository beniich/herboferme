'use client';

import { LoadingSpinner } from '@/components/LoadingSpinner';
import api from '@/lib/api';
import { Complaint } from '@/types';
import { Download, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { StatusBadge } from '@/components/ui/StatusBadge';
import { useRouter } from 'next/navigation';

export default function ComplaintListPage() {
    const router = useRouter();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        setExporting(true);
        const toastId = toast.loading('G  n  ration de l\'export Excel...');
        try {
            const result = await api.get('/analytics/export/complaints');
            toast.dismiss(toastId);
            if (result?.data?.mode === 'local' && result?.data?.downloadUrl) {
                toast.success('Export pr  t ! T  l  chargement en cours...');
                window.open(result.data.downloadUrl, '_blank');
            } else if (result?.data?.mode === 'google_drive' && result?.data?.driveViewLink) {
                toast.success('Export sauvegard   sur Google Drive !');
                window.open(result.data.driveViewLink, '_blank');
            } else {
                toast.success(result?.message || 'Export r  ussi !');
            }
        } catch (err: unknown) {
            toast.dismiss(toastId);
            toast.error(err instanceof Error ? err.message : 'Erreur lors de l\'export');
        } finally {
            setExporting(false);
        }
    };

    useEffect(() => {
        api
            .get('/complaints')
            .then((res) => setComplaints(res || []))
            .catch((err) => {
                console.error(err);
                setComplaints([]);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner />
            </div>
        );
    }



    return (
        <section className="max-w-6xl mx-auto py-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <FileText className="w-6 h-6" />
                    Liste des r  clamations
                </h2>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white px-4 py-2 rounded-lg transition-colors font-bold text-sm shadow-lg shadow-emerald-900/20"
                    >
                        {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        Exporter Excel
                    </button>
                    <Link
                        href="/complaints/new"
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Nouvelle r  clamation
                    </Link>
                </div>
            </div>

            {complaints.length === 0 ? (
                <div className="bg-white rounded-lg border p-12 text-center text-gray-500">
                    Aucune r  clamation pour le moment.
                </div>
            ) : (
                <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N  </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom / Pr  nom</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nature</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {complaints.map((c) => (
                                <tr
                                    key={c._id}
                                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => router.push(`/complaints/${c._id}`)}
                                >
                                    <td className="px-6 py-4 font-mono text-sm font-medium text-primary">
                                        #{c.number}
                                    </td>
                                    <td className="px-6 py-4">
                                        {c.isAnonymous ? (
                                            <div className="font-medium text-gray-500 italic">Anonyme</div>
                                        ) : (
                                            <>
                                                <div className="font-medium text-gray-900">{c.firstName} {c.lastName}</div>
                                                <div className="text-xs text-gray-500">{c.phone}</div>
                                            </>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 capitalize">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-700">{c.category}</span>
                                            <span className="text-xs text-slate-500">{c.subcategory}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={c.status} size="sm" />
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(c.createdAt).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
