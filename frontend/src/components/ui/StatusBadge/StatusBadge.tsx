'use client'

import { cn } from '@/lib/utils'

export type ComplaintStatus = 'new' | 'in_progress' | 'resolved' | 'closed'
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical'

interface StatusBadgeProps {
    status: ComplaintStatus
    className?: string
}

interface PriorityBadgeProps {
    priority: ComplaintPriority
    className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const variants = {
        new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        in_progress: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        closed: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    }

    const labels = {
        new: 'Nouveau',
        in_progress: 'En Cours',
        resolved: 'R  solu',
        closed: 'Ferm  ',
    }

    return (
        <span
            className={cn(
                'px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider',
                variants[status] || variants.new,
                className
            )}
        >
            {labels[status] || status}
        </span>
    )
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
    const variants = {
        low: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        critical: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    }

    const labels = {
        low: 'Priorit   Basse',
        medium: 'Priorit   Moyenne',
        high: 'Priorit   Haute',
        critical: 'Critique',
    }

    return (
        <span
            className={cn(
                'px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider',
                variants[priority] || variants.low,
                className
            )}
        >
            {labels[priority] || priority}
        </span>
    )
}
