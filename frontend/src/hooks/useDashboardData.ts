import useSWR from 'swr';
import { apiClient } from '@/lib/api-client';

// ─── Types exportés (Refléétant le backend) ────────────────────────────────
export interface AgroFinancials {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  cashFlow: number;
}

export interface CheptelStats {
  total: number;
  poultry: number;
  bovine: number;
}

export interface CulturesStats {
  totalHa: number;
  categories: Array<{ _id: string; count: number }>;
}

export interface AgroStats {
  financials: AgroFinancials;
  cheptel: CheptelStats;
  cultures: CulturesStats;
}

export interface ITStats {
  total: number;
  byStatus: Array<{ _id: string; count: number }>;
  byPriority: Array<{ _id: string; count: number }>;
  slaBreach: number;
}

export interface MaintenanceStats {
  total: number;
  byStatus: Record<string, number>;
  teamStats: Array<{ name: string; color: string; activeAssignments: number }>;
}

export interface DashboardResponse {
  success: boolean;
  agro: AgroStats;
  it: ITStats;
  maintenance: MaintenanceStats;
}

// ─── Fetcher parallèle optimisé ───────────────────────────────────────────
const dashboardFetcher = async (): Promise<DashboardResponse> => {
  const res = await apiClient.get<DashboardResponse>('/api/dashboard');
  return res.data;
};

// ─── Hook principal ────────────────────────────────────────────────────────
export function useDashboardData() {
  const { data, error, isLoading, mutate } = useSWR<DashboardResponse>('dashboard-stats', dashboardFetcher, {
    revalidateOnFocus:    false,
    dedupingInterval:     30_000,
    errorRetryCount:      2,
    keepPreviousData:     true,
  });

  return {
    agro:         data?.agro        ?? null,
    it:           data?.it          ?? null,
    maintenance:  data?.maintenance ?? null,
    loading:  isLoading,
    error,
    refresh: () => mutate(),
  };
}
