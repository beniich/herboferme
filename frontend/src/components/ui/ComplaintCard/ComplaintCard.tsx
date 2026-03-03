'use client'

import React from 'react'
import Link from 'next/link'
import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react'
import { StatusBadge, PriorityBadge } from '../StatusBadge/StatusBadge'
import { formatDate, formatTime } from '@/lib/utils'
import type { Complaint } from '@/types'

export interface ComplaintCardProps {
    complaint: Complaint
    className?: string
}

export function ComplaintCard({ complaint, className }: ComplaintCardProps) {
    // Map our internal statuses/priorities to the ones expected by the badges if necessary
    // or define the badges to handle our internal types.

    return (
        <Link
            href={`/complaints/${complaint._id || (complaint as any).id}`}
            className="group block bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md"
        >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        #{complaint.number || complaint._id?.slice(-6) || 'N/A'}
                    </span>
                    <StatusBadge status={complaint.status as any} />
                </div>
                <PriorityBadge priority={complaint.priority as any} />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-2 group-hover:text-primary transition-colors">
                {complaint.title}
            </h3>

            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                {complaint.description}
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400 dark:text-slate-500">
                <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(complaint.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatTime(complaint.createdAt)}</span>
                </div>
                {complaint.address && (
                    <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[150px]">{complaint.address}</span>
                    </div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary">
                            {(complaint.technicianId as any)?.name?.charAt(0) || '?'}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {(complaint.technicianId as any)?.name || 'Non assign  '}
                    </p>
                </div>
                <div className="flex items-center text-primary font-bold text-xs group-hover:translate-x-1 transition-transform">
                    D  tails <ChevronRight className="w-3 h-3 ml-1" />
                </div>
            </div>
        </Link>
    )
}
