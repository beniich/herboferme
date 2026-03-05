'use client';

import { ReactNode } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/store/authStore';
import { useOrgStore } from '@/store/orgStore';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function ClientLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, _hasHydrated: authHydrated } = useAuthStore();
    const {
        activeOrganization,
        fetchOrganizations,
        organizations,
        _hasHydrated: orgHydrated,
        isLoading: orgLoading
    } = useOrgStore();

    const [isChecking, setIsChecking] = useState(true);

    const isTechnician = pathname?.includes('/technician');
    const isMap = pathname?.includes('/map');
    const isFleet = pathname?.includes('/fleet');
    const isAdminSystem = pathname?.includes('/admin/system');
    const isAuthPage = pathname?.includes('/login') || pathname?.includes('/register');
    const isOrgSelectPage = pathname?.includes('/org-select');

    useEffect(() => {
        const checkOrg = async () => {
            if (!authHydrated || !orgHydrated) return;

            if (user && !isAuthPage && !isOrgSelectPage) {
                // User is logged in but not on an auth/org-select page
                if (organizations.length === 0 && !orgLoading) {
                    await fetchOrganizations();
                }

                if (!activeOrganization && !orgLoading) {
                    // Still no active org after fetch? Redirect
                    console.log('No active organization, redirecting to org-select');
                    router.push('/org-select');
                }
            }
            setIsChecking(false);
        };

        checkOrg();
    }, [
        user,
        activeOrganization,
        authHydrated,
        orgHydrated,
        pathname,
        organizations.length,
        orgLoading,
        fetchOrganizations,
        router,
        isAuthPage,
        isOrgSelectPage
    ]);

    if (user && !activeOrganization && !isAuthPage && !isOrgSelectPage && isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    // Full screen layouts (No global Header/Footer)
    if (isTechnician || isFleet || isAdminSystem || isOrgSelectPage) {
        return <>{children}</>;
    }

    // Map: App Header, No Footer (maybe?), Full Width, No Padding
    if (isMap) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 w-full relative">
                    {children}
                </main>
            </div>
        );
    }

    // Default: App Header, Footer, Centered Content
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
            </main>
            <Footer />
        </div>
    );
}
