import { useQuery } from '@tanstack/react-query';
import { ThreatMetrics, ThreatEvent } from '@/lib/types/threats';

// Mock data
const mockThreatData: ThreatMetrics = {
    totalBlocks24h: 1248302,
    activeDDoS: 3,
    sqlInjectionAttempts: 45210,
    threatFeedSync: 14,
    blocksChange: 12.4,
};

const mockEvents: ThreatEvent[] = [
    {
        id: '1',
        timestamp: new Date(),
        sourceIP: '192.168.1.45',
        attackVector: 'SQL Injection',
        targetURI: '/api/v1/user/auth',
        geoLocation: 'RU',
        severityScore: 98,
        status: 'blocked',
    },
    {
        id: '2',
        timestamp: new Date(),
        sourceIP: '45.22.129.8',
        attackVector: 'XSS',
        targetURI: '/search?q=<script>',
        geoLocation: 'CN',
        severityScore: 72,
        status: 'blocked',
    },
];

async function fetchThreatMetrics(): Promise<ThreatMetrics> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockThreatData;
}

async function fetchThreatEvents(): Promise<ThreatEvent[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockEvents;
}

export function useThreatData() {
    const metricsQuery = useQuery({
        queryKey: ['threat-metrics'],
        queryFn: fetchThreatMetrics,
        refetchInterval: 30000,
    });

    const eventsQuery = useQuery({
        queryKey: ['threat-events'],
        queryFn: fetchThreatEvents,
        refetchInterval: 5000, // Plus fr  quent pour les   v  nements en temps r  el
    });

    return {
        metrics: metricsQuery.data,
        events: eventsQuery.data,
        loading: metricsQuery.isLoading || eventsQuery.isLoading,
        error: metricsQuery.error || eventsQuery.error,
    };
}
