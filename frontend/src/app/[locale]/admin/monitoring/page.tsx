'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function GrafanaMonitoringPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const GRAFANA_URL = process.env.NEXT_PUBLIC_GRAFANA_URL || 'http://localhost:3001';

    useEffect(() => {
        // V  rifier si l'utilisateur est superadmin
        if (!user || user.role !== 'admin') {
            router.push('/admin/dashboard');
            return;
        }
        setLoading(false);
    }, [user, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                            <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Grafana Monitoring
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Surveillance en temps r  el des performances syst  me
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <a
                            href={GRAFANA_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Ouvrir Grafana
                        </a>
                    </div>
                </div>
            </div>

            {/* Info Cards */}
            <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-lg">
                            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-emerald-500">Active</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Prometheus</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Port: 9090</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-500/10 rounded-lg">
                            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-emerald-500">Active</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Grafana</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Port: 3001</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-lg">
                            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-emerald-500">Active</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Node Exporter</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Port: 9100</p>
                </div>
            </div>

            {/* Embedded Grafana */}
            <div className="flex-1 px-8 pb-8">
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden h-full">
                    <div className="bg-slate-100 dark:bg-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Dashboards Grafana
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-full">
                                    Superadmin Access
                                </span>
                            </div>
                        </div>
                    </div>
                    <iframe
                        src={`${GRAFANA_URL}/d/reclamtrack/reclamtrack-overview?orgId=1&refresh=5s&kiosk`}
                        className="w-full h-full border-0"
                        title="Grafana Dashboard"
                        sandbox="allow-scripts allow-same-origin allow-forms"
                    />
                </div>
            </div>

            {/* Quick Access Links */}
            <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-8 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <span>Identifiants par d  faut: admin / reclamtrack2024</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <a
                            href={`${GRAFANA_URL}/datasources`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Configurer les sources de donn  es
                        </a>
                        <a
                            href={`${GRAFANA_URL}/dashboards`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            G  rer les dashboards
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
