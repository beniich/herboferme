'use client';

import { usePermissions } from '@/hooks/usePermissions';
import { Role } from '@/lib/rbac/permissions';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, _hasHydrated } = useAuthStore();
    const router = useRouter();
    const { isRoleOrHigher } = usePermissions();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (_hasHydrated) {
            if (!user) {
                console.log('[AdminLayout] Redirecting to login: No user found after hydration.');
                router.push('/login');
                return;
            }

            // Check for admin role or higher
            if (!isRoleOrHigher(Role.ADMIN)) {
                console.warn('[AdminLayout] Access denied: User does not have required permissions.');
                return;
            }

            setIsAuthorized(true);
        }
    }, [user, _hasHydrated, router, isRoleOrHigher]);

    if (!_hasHydrated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground">Initialisation...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    if (!isAuthorized) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background">
                <div className="text-center space-y-4 p-8">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-red-600 text-3xl">gpp_bad</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Acc  s Refus  </h1>
                    <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                        Vous n'avez pas les permissions n  cessaires pour acc  der    l'administration.
                        Veuillez contacter votre administrateur si vous pensez qu'il s'agit d'une erreur.
                    </p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                    >
                        Retour au tableau de bord
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}
