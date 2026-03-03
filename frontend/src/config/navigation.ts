// Navigation configuration for ReclamTrack
// This file centralizes all routes and navigation items

export interface NavItem {
    label: string;
    href: string;
    icon?: string;
    badge?: string;
    children?: NavItem[];
    roles?: string[]; // Roles autoris  s    voir cet   l  ment
}

export const mainNavigation: NavItem[] = [
    {
        label: 'Tableau de Bord',
        href: '/dashboard',
        icon: 'dashboard',
        roles: ['admin', 'manager', 'technician', 'staff']
    },
    {
        label: 'R  clamations',
        href: '/complaints',
        icon: 'report_problem',
        roles: ['admin', 'manager', 'technician', 'staff'],
        children: [
            {
                label: 'Nouvelle r  clamation',
                href: '/complaints/new',
                icon: 'add_circle'
            },
            {
                label: 'Liste des r  clamations',
                href: '/complaints/list',
                icon: 'list'
            }
        ]
    },
    {
        label: 'Carte',
        href: '/map',
        icon: 'map',
        roles: ['admin', 'manager', 'technician']
    },
    {
        label: '  quipes',
        href: '/teams',
        icon: 'groups',
        roles: ['admin', 'manager'],
        children: [
            {
                label: 'Gestion   quipes',
                href: '/teams',
                icon: 'group'
            },
            {
                label: 'Planning shifts',
                href: '/teams/scheduler',
                icon: 'schedule'
            }
        ]
    },
    {
        label: 'Planning',
        href: '/planning',
        icon: 'event',
        roles: ['admin', 'manager', 'technician']
    },
    {
        label: 'Inventaire',
        href: '/inventory',
        icon: 'inventory_2',
        roles: ['admin', 'manager', 'warehouse'],
        children: [
            {
                label: 'Stock',
                href: '/inventory/inventory',
                icon: 'warehouse'
            },
            {
                label: 'Nouvelle r  quisition',
                href: '/inventory/requisition',
                icon: 'add_shopping_cart'
            },
            {
                label: 'Approbations',
                href: '/inventory/approvals',
                icon: 'approval',
                badge: '3'
            }
        ]
    },
    {
        label: 'Analytics',
        href: '/analytics',
        icon: 'analytics',
        roles: ['admin', 'manager'],
        children: [
            {
                label: 'Vue d\'ensemble',
                href: '/analytics',
                icon: 'insights'
            },
            {
                label: 'Satisfaction',
                href: '/analytics/satisfaction',
                icon: 'sentiment_satisfied'
            }
        ]
    },
    {
        label: 'Rapports',
        href: '/reports',
        icon: 'assessment',
        roles: ['admin', 'manager']
    },
    {
        label: 'Flotte',
        href: '/fleet',
        icon: 'local_shipping',
        roles: ['admin', 'manager', 'fleet_manager']
    },
    {
        label: 'Messages',
        href: '/messages',
        icon: 'message',
        roles: ['admin', 'manager', 'technician', 'staff']
    },
    {
        label: 'Base de connaissances',
        href: '/knowledge',
        icon: 'menu_book',
        roles: ['admin', 'manager', 'technician', 'staff']
    },
    {
        label: 'Feedback',
        href: '/feedback',
        icon: 'feedback',
        roles: ['admin', 'manager']
    }
];

export const adminNavigation: NavItem[] = [
    {
        label: 'Administration',
        href: '/admin',
        icon: 'admin_panel_settings',
        roles: ['admin'],
        children: [
            {
                label: 'Utilisateurs',
                href: '/admin/users',
                icon: 'people'
            },
            {
                label: 'Cat  gories',
                href: '/admin/categories',
                icon: 'category'
            },
            {
                label: 'Audit',
                href: '/admin/audit',
                icon: 'history'
            },
            {
                label: 'Int  grations',
                href: '/admin/integrations',
                icon: 'extension'
            },
            {
                label: 'Finances',
                href: '/admin/finance/costs',
                icon: 'payments'
            },
            {
                label: 'Informations syst  me',
                href: '/admin/info',
                icon: 'info'
            }
        ]
    }
];

export const userNavigation: NavItem[] = [
    {
        label: 'Mon profil',
        href: '/settings',
        icon: 'account_circle'
    },
    {
        label: 'Notifications',
        href: '/settings/notifications',
        icon: 'notifications'
    },
    {
        label: 'D  connexion',
        href: '/logout',
        icon: 'logout'
    }
];

// Routes publiques (sans authentification)
export const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/system-info'
];

// Routes qui n  cessitent une authentification
export const protectedRoutes = [
    '/dashboard',
    '/complaints',
    '/teams',
    '/planning',
    '/inventory',
    '/analytics',
    '/reports',
    '/map',
    '/fleet',
    '/messages',
    '/knowledge',
    '/feedback',
    '/settings',
    '/admin',
    '/technician'
];

// Mapping des routes backend
export const apiRoutes = {
    auth: {
        login: '/api/auth/login',
        register: '/api/auth/register',
        me: '/api/auth/me'
    },
    complaints: {
        list: '/api/complaints',
        create: '/api/complaints',
        details: (id: string) => `/api/complaints/${id}`,
        update: (id: string) => `/api/complaints/${id}`,
        delete: (id: string) => `/api/complaints/${id}`
    },
    teams: {
        list: '/api/teams',
        details: (id: string) => `/api/teams/${id}`
    },
    planning: {
        list: '/api/planning',
        create: '/api/planning'
    },
    inventory: {
        items: '/api/inventory/items',
        search: '/api/inventory/items/search',
        itemDetails: (id: string) => `/api/inventory/items/${id}`
    },
    requisitions: {
        list: '/api/requisitions',
        create: '/api/requisitions',
        details: (id: string) => `/api/requisitions/${id}`,
        transition: (id: string) => `/api/requisitions/${id}/transition`
    },
    analytics: {
        satisfaction: '/api/analytics/satisfaction',
        performance: '/api/analytics/performance',
        heatmap: '/api/analytics/heatmap'
    },
    dashboard: {
        stats: '/api/dashboard/stats'
    },
    assignments: {
        list: '/api/assignments',
        create: '/api/assignments'
    }
};

// Helper function to check if user has access to a route
export function hasAccess(userRole: string, navItem: NavItem): boolean {
    if (!navItem.roles || navItem.roles.length === 0) {
        return true; // Accessible    tous si pas de r  les sp  cifi  s
    }
    return navItem.roles.includes(userRole);
}

// Helper function to filter navigation based on user role
export function getNavigationForRole(role: string): NavItem[] {
    return mainNavigation.filter(item => hasAccess(role, item));
}
