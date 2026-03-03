'use client';

import { Search, Bell, LogOut } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils'; // Using main project utils

interface HeaderProps {
    variant?: 'default' | 'compact';
}

export function Header({ variant = 'default' }: HeaderProps) {
    return (
        <header className={cn(
            'sticky top-0 z-40 border-b',
            'bg-white/50 dark:bg-slate-900/50 backdrop-blur-md', // Adjusted for compatibility
            'border-slate-200 dark:border-slate-800'
        )}>
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">   </span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight">Support Hub</h1>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                            Unified Platform
                        </p>
                    </div>
                </Link>

                {/* Search Bar */}
                {variant === 'default' && (
                    <div className="flex-1 max-w-md mx-8 hidden md:block">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search tickets, services..."
                                className={cn(
                                    'w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800',
                                    'border-none rounded-lg focus:ring-2 focus:ring-primary/50 outline-none',
                                    'transition-all text-sm'
                                )}
                            />
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <button className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
                    </button>

                    <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700" />

                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:text-primary dark:hover:text-primary">
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Sign Out</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
