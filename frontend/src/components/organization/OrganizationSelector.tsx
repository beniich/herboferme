'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useOrgStore } from '@/store/orgStore';
import {
    LayoutGrid,
    Plus,
    Check,
    ChevronDown,
    Building2
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const OrganizationSelector: React.FC = () => {
    const router = useRouter();
    const {
        organizations,
        activeOrganization,
        setActiveOrganization,
        isLoading
    } = useOrgStore();

    if (isLoading && organizations.length === 0) {
        return (
            <div className="h-10 w-40 bg-slate-100 animate-pulse rounded-md" />
        );
    }

    if (organizations.length === 0) {
        return (
            <Button variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Cr  er une organisation
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-2 hover:bg-slate-100 transition-colors"
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                        {activeOrganization?.logo ? (
                            <Image
                                src={activeOrganization.logo}
                                alt={activeOrganization.name}
                                width={24}
                                height={24}
                                className="rounded-sm object-cover"
                            />
                        ) : (
                            <Building2 className="h-5 w-5" />
                        )}
                    </div>
                    <div className="hidden sm:flex flex-col items-start">
                        <span className="text-sm font-semibold truncate max-w-[120px]">
                            {activeOrganization?.name || 'S  lectionner...'}
                        </span>
                        <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                            {activeOrganization?.subscription?.plan || 'Gratuit'}
                        </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400 ml-1" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Mes Organisations</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {organizations.map((org) => (
                    <DropdownMenuItem
                        key={org._id}
                        onClick={() => setActiveOrganization(org._id)}
                        className="flex items-center justify-between cursor-pointer"
                    >
                        <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-xs font-bold">
                                {org.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className={cn(
                                "truncate",
                                org._id === activeOrganization?._id && "font-bold text-primary"
                            )}>
                                {org.name}
                            </span>
                        </div>
                        {org._id === activeOrganization?._id && (
                            <Check className="h-4 w-4 text-primary" />
                        )}
                    </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/org-select')} className="cursor-pointer text-primary focus:text-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle organisation
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/org-select')} className="cursor-pointer">
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    G  rer les organisations
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
