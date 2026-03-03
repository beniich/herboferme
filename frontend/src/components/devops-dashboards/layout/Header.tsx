'use client';

import Link from "next/link";
import { Icon } from "../ui/Icon";
import { useState } from "react";

export const Header = () => (
    <header className="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark sticky top-0 z-50">
        {/* Logo & title */}
        <div className="flex items-center gap-3">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
                <Icon name="hub" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {process.env.NEXT_PUBLIC_APP_NAME || "Dashboard"}
            </h2>
        </div>

        {/* Navigation principal     visible sur lg+ */}
        <nav className="hidden lg:flex items-center gap-6">
            <Link href="/admin/devops" className="text-primary font-medium">
                Dashboard
            </Link>
            <Link href="/admin/devops/gslb" className="text-slate-500 hover:text-primary">
                GSLB
            </Link>
            <Link href="/admin/devops/waf" className="text-slate-500 hover:text-primary">
                WAF
            </Link>
            <Link href="/admin/devops/guardian" className="text-slate-500 hover:text-primary">
                Guardian AI
            </Link>
            <Link href="/admin/devops/chaos-hub" className="text-slate-500 hover:text-primary">
                Chaos Hub
            </Link>
            <Link href="/admin/devops/vault" className="text-slate-500 hover:text-primary">
                Security Vault
            </Link>
            <Link href="/admin/devops/drift" className="text-slate-500 hover:text-primary">
                Cloud-Drift
            </Link>
            <Link href="/admin/devops/trace" className="text-slate-500 hover:text-primary">
                Trace Explorer
            </Link>
        </nav>

        {/* Actions (search, notifications, avatar) */}
        <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
                <Icon
                    name="search"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
                />
                <input
                    className="pl-10 pr-4 h-9 w-64 rounded-lg bg-slate-100 dark:bg-slate-800 border-none focus:ring-0 placeholder:text-slate-500 text-sm"
                    placeholder="Search..."
                />
            </div>

            <button className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700">
                <Icon name="notifications" />
            </button>

            <button className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700">
                <Icon name="settings" />
            </button>

            {/* Avatar     replace with user image */}
            <div className="size-9 rounded-full bg-primary/20 border border-primary/40 overflow-hidden">
                <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuByCMQor8ht-aBrywH_iytyW_KdNlom3blLU-b6YCJoHZfFQQBmBqcVGVrj61FGxDdpJcnXaB94gX5z0CV1zgtQ5aBf5wsb4frxjqWiIg5lw_OvA92fNzByIa5lMR4ex22SRnG-bZfMy6JZKjaO7j6OxTvjh4qWPcRQpaZRxdrmWAUaP4aJC7A5SQ93H_aa9m6BJ5mkxz3cTlhHleTRi3-XLkflqvp1cxlX4-59m8LCCBIYZljD7aKpOzdYKuzYpRyUPCvMb8gAuB8s"
                    alt="User avatar"
                    className="size-full object-cover"
                />
            </div>
        </div>
    </header>
);
