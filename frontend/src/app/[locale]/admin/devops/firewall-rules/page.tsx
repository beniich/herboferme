'use client'

import DashboardTemplate from '@/components/devops-dashboards/shared/DashboardTemplate'
import { useParams } from 'next/navigation'

export default function PlaceholderDashboard() {
    const params = useParams()
    const dashboardId = params.dashboardId as string || 'Dashboard'

    // Format dashboard ID for display (e.g. 'post-mortem' -> 'Post Mortem')
    const title = dashboardId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

    const kpis = [
        { title: 'Status', value: 'Active', trend: 'neutral' as const, icon: 'check_circle', iconColor: 'green' },
        { title: 'Last Sync', value: '2m ago', trend: 'neutral' as const, icon: 'sync', iconColor: 'blue' },
        { title: 'Incidents', value: '0', change: '0%', trend: 'neutral' as const, icon: 'warning', iconColor: 'amber' },
        { title: 'SLA', value: '99.9%', change: '+0.1%', trend: 'up' as const, icon: 'verified', iconColor: 'purple' },
    ]

    return (
        <DashboardTemplate title={title} icon="dashboard" kpis={kpis}>
            <div className="bg-white dark:bg-surface-dark p-8 rounded-xl border border-slate-200 dark:border-border-dark flex flex-col items-center justify-center text-center space-y-4">
                <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-primary">construction</span>
                </div>
                <h2 className="text-xl font-bold">En cours de d  veloppement</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md">
                    Le module <span className="font-mono">{title}</span> est actuellement en phase de configuration.
                    Les donn  es r  elles seront bient  t disponibles.
                </p>
            </div>
        </DashboardTemplate>
    )
}
