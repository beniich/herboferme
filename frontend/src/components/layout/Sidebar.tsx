
'use client';

import { cn } from '@/lib/utils';
import {
    BarChart3,
    Calendar,
    FileText,
    HelpCircle,
    LayoutDashboard,
    Map,
    Package,
    Settings,
    Users
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MenuItem {
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
}

const menuItems: MenuItem[] = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        label: 'Complaints',
        href: '/complaints',
        icon: FileText,
        badge: '12',
    },
    {
        label: 'Teams',
        href: '/teams',
        icon: Users,
    },
    {
        label: 'Planning',
        href: '/planning',
        icon: Calendar,
    },
    {
        label: 'Maps',
        href: '/maps',
        icon: Map,
    },
    {
        label: 'Inventory',
        href: '/inventory',
        icon: Package,
    },
    {
        label: 'Satisfaction',
        href: '/feedback/satisfaction',
        icon: BarChart3,
    },
    {
        label: 'Audit Logs',
        href: '/audit-logs',
        icon: FileText,
    },
    {
        label: 'Roster',
        href: '/roster',
        icon: Users,
    },
    {
        label: 'Settings',
        href: '/settings',
        icon: Settings,
    },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-20 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 flex flex-col h-[calc(100vh-4rem)] sticky top-16 hidden lg:flex transition-all duration-300 group/sidebar hover:w-64">
            <nav className="flex-1 space-y-2 p-3 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={item.label}
                            className={cn(
                                "flex items-center gap-4 px-3 py-3 rounded-xl font-medium transition-all duration-200 overflow-hidden",
                                isActive
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                            )}
                        >
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                                <Icon className={cn("w-6 h-6", isActive ? "text-white" : "text-gray-500")} />
                            </div>
                            <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                                {item.label}
                            </span>
                            {item.badge && (
                                <span className="absolute right-2 top-2 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-sm group-hover/sidebar:static group-hover/sidebar:ml-auto">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* System Status Footer */}
            <div className="p-3 mt-auto border-t border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="h-3 w-3 flex-shrink-0 rounded-full bg-green-500 animate-pulse"></span>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest opacity-0 group-hover/sidebar:opacity-100 transition-opacity">
                            Online
                        </p>
                    </div>
                    <div className="group-hover/sidebar:block hidden space-y-2">
                        <div className="flex items-center justify-between text-[10px]">
                            <span className="text-gray-500">Rate</span>
                            <span className="font-bold text-primary">94%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                            <div className="bg-primary h-full w-[94%]" />
                        </div>
                    </div>
                </div>

                <button className="w-full mt-4 flex items-center gap-4 px-3 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 transition-colors">
                    <HelpCircle className="w-6 h-6 flex-shrink-0" />
                    <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity">Help</span>
                </button>
            </div>
        </aside>
    );
}
