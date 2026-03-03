'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Inbox,
    Users,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils'; // Using main project utils

const NAV_ITEMS = [
    { icon: Inbox, label: 'Tickets', href: '/tickets' },
    { icon: Users, label: 'Agents', href: '/agents' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
    { icon: Settings, label: 'Settings', href: '/settings' },
];

export function Sidebar() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Toggle */}
            <button
                className="fixed top-4 left-4 z-50 md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                onClick={() => setOpen(!open)}
            >
                {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Overlay */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                'fixed left-0 top-0 h-screen w-64 md:w-20',
                'bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800', // Adjusted theme colors
                'flex flex-col items-center md:items-start px-4 py-8 gap-8',
                'transition-all duration-300 z-40',
                'md:hover:w-64 md:group',
                open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            )}>
                {/* Logo */}
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <span className="text-xl font-bold">   </span>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-4 flex-1 w-full">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                                    'md:justify-center md:px-3 md:group-hover:justify-start',
                                    isActive
                                        ? 'bg-primary text-white'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-primary'
                                )}
                                title={item.label}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                <span className="md:hidden md:group-hover:inline text-sm font-medium">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="flex flex-col gap-4 w-full mt-auto">
                    <button className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                        'text-slate-600 dark:text-slate-400 hover:text-red-500',
                        'md:justify-center md:px-3 md:group-hover:justify-start'
                    )}>
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        <span className="md:hidden md:group-hover:inline text-sm font-medium">
                            Logout
                        </span>
                    </button>

                    {/* User Avatar */}
                    <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center flex-shrink-0 md:w-10 md:h-10">
                        <span className="text-sm font-bold text-primary">JD</span>
                    </div>
                </div>
            </aside>

            {/* Main content spacer */}
            <div className="md:ml-20" />
        </>
    );
}
