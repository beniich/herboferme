'use client';

import { usePermissions } from '@/hooks/usePermissions';
import { Permission, Role } from '@/lib/rbac/permissions';
import { useRouter } from '@/i18n/navigation';
import { ReactNode, useEffect } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredPermissions?: Permission[];
    requiredRole?: Role;
    requireAll?: boolean;
    fallback?: ReactNode;
}

export function ProtectedRoute({
    children,
    requiredPermissions = [],
    requiredRole,
    requireAll = false,
    fallback,
}: ProtectedRouteProps) {
    const { canAny, canAll, isRoleOrHigher } = usePermissions();
    const router = useRouter();

    const isAuthorized = () => {
        // Si aucun rôle/permission requis, accès autorisé
        if (!requiredRole && requiredPermissions.length === 0) return true;

        if (requiredRole && !isRoleOrHigher(requiredRole)) return false;

        if (requiredPermissions.length > 0) {
            return requireAll
                ? canAll(requiredPermissions)
                : canAny(requiredPermissions);
        }

        return true;
    };

    const authorized = isAuthorized();

    useEffect(() => {
        if (!authorized) {
            router.push('/unauthorized');
        }
    }, [authorized, router]);

    if (!authorized) {
        return fallback ? <>{fallback}</> : null;
    }

    return <>{children}</>;
}
