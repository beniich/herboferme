'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StatsCardProps {
    title: string
    value: string | number
    subtitle?: string
    icon: LucideIcon
    trend?: {
        value: string
        isPositive: boolean
    }
    color?: 'blue' | 'green' | 'amber' | 'red' | 'purple'
    className?: string
    style?: React.CSSProperties
}

export function StatsCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    color = 'blue',
    className,
    style
}: StatsCardProps) {
    const colorVariants = {
        blue: 'bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20',
        green: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20',
        amber: 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20',
        red: 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20',
        purple: 'bg-purple-500/10 text-purple-500 dark:text-purple-400 border-purple-500/20',
    }

    const trendColors = {
        positive: 'text-emerald-500 dark:text-emerald-400',
        negative: 'text-rose-500 dark:text-rose-400',
    }

    return (
        <div
            className={cn(
                "bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1",
                className
            )}
            style={style}
        >
            <div className="flex items-center gap-4">
                <div className={cn('p-3 rounded-lg border', colorVariants[color])}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 truncate">
                        {title}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
                        {subtitle && (
                            <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{subtitle}</span>
                        )}
                    </div>
                    {trend && (
                        <div className="flex items-center gap-1 mt-1">
                            <span className={cn(
                                'text-xs font-bold flex items-center gap-0.5',
                                trend.isPositive ? trendColors.positive : trendColors.negative
                            )}>
                                <span>{trend.isPositive ? '   ' : '   '}</span>
                                <span>{trend.value}</span>
                            </span>
                            <span className="text-[10px] text-slate-400">vs mois dernier</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
