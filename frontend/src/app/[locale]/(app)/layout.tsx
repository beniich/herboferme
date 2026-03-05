'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from '@/i18n/navigation';
import { useEffect } from 'react';
import AgroLayout from '@/components/layout/AgroLayout';
import useNotifications from '@/hooks/useNotifications';
import { useOrgStore } from '@/store/orgStore';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();
    const { fetchOrganizations } = useOrgStore();
    const router = useRouter();
    useNotifications();

    useEffect(() => {
        if (!isLoading && user) {
            fetchOrganizations();
        }
    }, [user, isLoading, fetchOrganizations]);

    useEffect(() => {
        if (!isLoading && !user) {
            console.log('[AppLayout] Redirecting to login — Session missing');
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="text-sm text-slate-500">Chargement de votre session...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <AgroLayout>
            {children}
        </AgroLayout>
    );
}
