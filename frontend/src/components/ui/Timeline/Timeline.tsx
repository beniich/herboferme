'use client'

import React from 'react'
import { Check, User, Wrench, MessageSquare, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatTime } from '@/lib/utils'
import type { TimelineEvent } from '@/types'

interface TimelineProps {
    events: TimelineEvent[]
    className?: string
}

export function Timeline({ events, className }: TimelineProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'created':
                return <Check className="w-4 h-4" />
            case 'assigned':
                return <User className="w-4 h-4" />
            case 'in_progress':
                return <Wrench className="w-4 h-4" />
            case 'note':
                return <MessageSquare className="w-4 h-4" />
            default:
                return <Clock className="w-4 h-4" />
        }
    }

    const getIconColor = (type: string, isLast: boolean) => {
        if (isLast) return 'bg-primary shadow-[0_0_15px_rgba(37,99,235,0.4)] border-primary'
        switch (type) {
            case 'created':
                return 'bg-emerald-500/10 border-emerald-500/30'
            case 'assigned':
                return 'bg-indigo-500/10 border-indigo-500/30'
            case 'note':
                return 'bg-amber-500/10 border-amber-500/30'
            default:
                return 'bg-primary/10 border-primary/30'
        }
    }

    const getTextColor = (type: string, isLast: boolean) => {
        if (isLast) return 'text-white'
        switch (type) {
            case 'created':
                return 'text-emerald-400'
            case 'assigned':
                return 'text-indigo-400'
            case 'note':
                return 'text-amber-400'
            default:
                return 'text-primary'
        }
    }

    return (
        <div className={cn("relative space-y-0", className)}>
            <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-slate-200 dark:bg-slate-800"></div>

            {events.map((event, index) => {
                const isNotLast = index !== events.length - 1

                return (
                    <div key={event.id} className={cn("relative pl-12", isNotLast && "pb-10")}>
                        <div
                            className={cn(
                                "absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                getIconColor(event.type, index === events.length - 1),
                                getTextColor(event.type, index === events.length - 1)
                            )}
                        >
                            {getIcon(event.type)}
                        </div>

                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm md:text-base">{event.title}</p>
                                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{event.description}</p>

                                {index === events.length - 1 && event.actor && (
                                    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700/50 relative overflow-hidden transition-all duration-500">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/80"></div>
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                                            Derni  re Mise    Jour
                                        </p>
                                        <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                                            &quot;{event.description}&quot;     <span className="font-semibold text-primary">{event.actor}</span>
                                        </p>
                                    </div>
                                )}
                            </div>

                            <span className={cn(
                                "text-[10px] md:text-xs font-medium flex-shrink-0 mt-1 whitespace-nowrap",
                                index === events.length - 1 ? "font-bold text-primary dark:text-primary-light animate-pulse" : "text-slate-400 dark:text-slate-500"
                            )}>
                                {index === events.length - 1 ? 'MAINTENANT' : formatTime(event.timestamp)}
                            </span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
