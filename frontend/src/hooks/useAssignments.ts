import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';

export interface Assignment {
    _id: string;
    status: 'affect  ' | 'en cours' | 'termin  ';
    assignedAt: string;
    complaintId: {
        _id: string;
        title: string;
        description: string;
        category: string;
        priority: string;
        address: string;
        status: string;
    };
    teamId: {
        _id: string;
        name: string;
        color: string;
    };
}

export function useAssignments(status?: string) {
    return useQuery({
        queryKey: ['assignments', status],
        queryFn: async () => {
            const url = status ? `/api/assignments?status=${status}` : '/api/assignments';
            return await apiClient.get<Assignment[]>(url);
        },
        refetchInterval: 60000,
    });
}
