import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format date to human-readable string
 */
export function formatDate(date: string | Date, formatStr: string = 'PPP'): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: fr });
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (isToday(dateObj)) {
        return `Aujourd'hui    ${format(dateObj, 'HH:mm')}`;
    }

    if (isYesterday(dateObj)) {
        return `Hier    ${format(dateObj, 'HH:mm')}`;
    }

    return formatDistanceToNow(dateObj, { addSuffix: true, locale: fr });
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'MAD'): string {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency,
    }).format(amount);
}

/**
 * Format number with separators
 */
export function formatNumber(num: number): string {
    return new Intl.NumberFormat('fr-MA').format(num);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * Generate random ID
 */
export function generateId(prefix: string = ''): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 9);
    return prefix ? `${prefix}-${timestamp}-${randomStr}` : `${timestamp}-${randomStr}`;
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
}

/**
 * Get status color
 */
export function getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
        new: 'blue',
        assigned: 'purple',
        'in-progress': 'amber',
        pending: 'orange',
        resolved: 'green',
        closed: 'gray',
        rejected: 'red',
        urgent: 'red',
        high: 'orange',
        medium: 'yellow',
        low: 'blue',
    };

    return statusColors[status.toLowerCase()] || 'gray';
}

/**
 * Get priority color
 */
export function getPriorityColor(priority: string): string {
    const priorityColors: Record<string, string> = {
        urgent: 'red',
        high: 'orange',
        medium: 'yellow',
        low: 'blue',
    };

    return priorityColors[priority.toLowerCase()] || 'gray';
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number (Morocco)
 */
export function isValidPhone(phone: string): boolean {
    const phoneRegex = /^(\+212|0)[5-7]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Format phone number
 */
export function formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('212')) {
        return `+212 ${cleaned.slice(3, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10)}`;
    }
    if (cleaned.startsWith('0')) {
        return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
    }
    return phone;
}

/**
 * Download file
 */
export function downloadFile(data: BlobPart, filename: string, type: string): void {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

/**
 * Copy to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
}

/**
 * Group array by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((result, item) => {
        const group = String(item[key]);
        if (!result[group]) {
            result[group] = [];
        }
        result[group].push(item);
        return result;
    }, { /* Intentionally empty */ } as Record<string, T[]>);
}

/**
 * Remove duplicates from array
 */
export function unique<T>(array: T[]): T[] {
    return Array.from(new Set(array));
}

/**
 * Sort array by key
 */
export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
    return [...array].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];

        if (aVal < bVal) return order === 'asc' ? -1 : 1;
        if (aVal > bVal) return order === 'asc' ? 1 : -1;
        return 0;
    });
}

/**
 * Check if object is empty
 */
export function isEmpty(obj: any): boolean {
    return Object.keys(obj).length === 0;
}

/**
 * Format time to human-readable string
 */
export function formatTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(d);
}

// --- Dashboard V2 Utilities ---

export function formatLatency(ms: number): string {
    if (ms >= 1000) {
        return `${(ms / 1000).toFixed(2)}s`
    }
    return `${ms}ms`
}

export function formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`
}

export function getTailwindStatusColor(status: string): string {
    const statusMap: Record<string, string> = {
        healthy: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        warning: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        critical: 'text-red-500 bg-red-500/10 border-red-500/20',
        offline: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
        degraded: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    }
    return statusMap[status.toLowerCase()] || statusMap.offline
}

export function getSeverityColor(severity: string): string {
    const severityMap: Record<string, string> = {
        critical: 'bg-red-500/10 text-red-500 border-red-500/20',
        high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
        medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        low: 'bg-green-500/10 text-green-500 border-green-500/20',
    }
    return severityMap[severity.toLowerCase()] || ''
}

export function generateMockTimeSeries(points: number = 24, baseValue: number = 100, variance: number = 20): number[] {
    return Array.from({ length: points }, () =>
        baseValue + (Math.random() - 0.5) * variance
    )
}
