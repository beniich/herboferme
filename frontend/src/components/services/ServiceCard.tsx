'use client';

import { ReactNode } from 'react';
import { AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils'; // Using main project utils

interface ServiceCardProps {
    title: string;
    icon: ReactNode;
    status: 'operational' | 'maintenance' | 'planning';
    details: Array<{
        label: string;
        value: string;
        highlight?: boolean;
    }>;
    onReportIssue?: () => void;
    onInfo?: () => void;
}

const STATUS_CONFIG = {
    operational: {
        color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        label: 'OPERATIONAL',
    },
    maintenance: {
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        label: 'MAINTENANCE',
    },
    planning: {
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        label: 'PLANNING',
    },
};

export function ServiceCard({
    title,
    icon,
    status,
    details,
    onReportIssue,
    onInfo,
}: ServiceCardProps) {
    const statusConfig = STATUS_CONFIG[status];

    return (
        <div className={cn(
            'bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800',
            'rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group'
        )}>
            <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center text-primary text-2xl">
                        {icon}
                    </div>
                    <span className={cn('px-2 py-1 text-xs font-bold rounded', statusConfig.color)}>
                        {statusConfig.label}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-4">{title}</h3>

                {/* Details */}
                <div className="space-y-3 mb-6">
                    {details.map((detail, idx) => (
                        <div key={idx} className="flex items-center justify-between group/line">
                            <span className="text-slate-500 dark:text-slate-400 text-sm">
                                {detail.label}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    'font-medium text-sm',
                                    detail.highlight && 'text-primary font-bold'
                                )}>
                                    {detail.value}
                                </span>
                                {detail.highlight && (
                                    <button className="opacity-0 group-hover/line:opacity-100 transition-opacity text-slate-400 hover:text-primary p-1">

                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className={cn(
                'bg-slate-50 dark:bg-slate-800/50 p-4 border-t border-slate-100 dark:border-slate-800',
                'flex gap-3'
            )}>
                <button
                    onClick={onReportIssue}
                    className={cn(
                        'flex-1 bg-primary text-white py-2 px-4 rounded-lg font-semibold text-sm',
                        'hover:bg-blue-700 transition-colors flex items-center justify-center gap-2'
                    )}
                >
                    <AlertCircle className="w-4 h-4" />
                    Report Issue
                </button>
                <button
                    onClick={onInfo}
                    className={cn(
                        'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600',
                        'p-2 rounded-lg hover:bg-slate-50 transition-colors'
                    )}
                >
                    <Info className="w-5 h-5 text-slate-500 dark:text-slate-300" />
                </button>
            </div>
        </div>
    );
}
