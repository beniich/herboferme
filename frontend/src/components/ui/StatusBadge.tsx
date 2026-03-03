type Status = 'new' | 'in-progress' | 'resolved' | 'urgent' | 'pending' | 'nouvelle' | 'en cours' | 'r  solue' | 'ferm  e';

interface StatusBadgeProps {
    status: Status | string;
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
}

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
    new: {
        label: 'New',
        color: 'bg-primary/10 text-primary border-primary/20',
        icon: '   ',
    },
    'in-progress': {
        label: 'In Progress',
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
        icon: '   ',
    },
    resolved: {
        label: 'Resolved',
        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
        icon: '   ',
    },
    urgent: {
        label: 'Urgent',
        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
        icon: '!',
    },
    pending: {
        label: 'Pending',
        color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
        icon: '      ',
    },
    nouvelle: {
        label: 'Nouvelle',
        color: 'bg-primary/10 text-primary border-primary/20',
        icon: '   ',
    },
    'en cours': {
        label: 'En Cours',
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
        icon: '   ',
    },
    r  solue: {
        label: 'R  solue',
        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
        icon: '   ',
    },
    ferm  e: {
        label: 'Ferm  e',
        color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
        icon: '   ',
    },
};

const priorityConfig: Record<string, { label: string; color: string; icon: string }> = {
    low: {
        label: 'Low',
        color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
        icon: '   ',
    },
    medium: {
        label: 'Medium',
        color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        icon: '   ',
    },
    high: {
        label: 'High',
        color: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800',
        icon: '   ',
    },
    urgent: {
        label: 'Urgent',
        color: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800',
        icon: '!',
    },
    critical: {
        label: 'Critical',
        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-500 border-red-200 dark:border-red-800',
        icon: '   ',
    },
};

export function PriorityBadge({ priority, size = 'md', showIcon = false }: { priority: string; size?: 'sm' | 'md' | 'lg'; showIcon?: boolean }) {
    const normalizePriority = (priority || 'low').toLowerCase();
    const config = priorityConfig[normalizePriority] || priorityConfig.low;

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
    };

    return (
        <span
            className={`${config.color} ${sizeClasses[size]} font-black uppercase rounded border inline-flex items-center gap-1.5`}
        >
            {showIcon && <span>{config.icon}</span>}
            {config.label}
        </span>
    );
}

export function StatusBadge({ status, size = 'md', showIcon = false }: StatusBadgeProps) {
    const normalizeStatus = status.toLowerCase().replace('_', '-');
    const config = statusConfig[normalizeStatus] || {
        label: status,
        color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
        icon: '?',
    };

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
    };

    return (
        <span
            className={`${config.color} ${sizeClasses[size]} font-black uppercase rounded border inline-flex items-center gap-1.5`}
        >
            {showIcon && <span>{config.icon}</span>}
            {config.label}
        </span>
    );
}
