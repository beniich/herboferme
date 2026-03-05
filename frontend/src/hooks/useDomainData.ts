'use client';

import { useFetch, UseFetchResult } from '@/hooks/useFetch';

export interface Stats {
  total: number;
  active: number;
  [key: string]: number;
}

export interface DomainItem {
  _id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface DomainData {
  stats: Stats;
  items: DomainItem[];
}

export interface UseDomainDataResult extends UseFetchResult<DomainData> {
  stats: Stats | undefined;
  items: DomainItem[] | undefined;
  refresh: () => Promise<void>;
}

export function useDomainData(
  endpoint: string,
  cacheTime: number = 60_000
): UseDomainDataResult {
  const { data, isLoading, error, mutate, isValidating } = useFetch<DomainData>(
    endpoint,
    {
      dedupingInterval: cacheTime,
      focusThrottleInterval: cacheTime * 5,
    }
  );

  return {
    data,
    stats: data?.stats,
    items: data?.items,
    isLoading,
    error,
    mutate,
    isValidating,
    refresh: mutate,
  };
}

// ─── Hooks domaine spécifiques ───────────────────────────
export function useAnimalsData(): UseDomainDataResult {
  return useDomainData('/api/animals', 60_000);  // 1 min
}

export function useCropsData(): UseDomainDataResult {
  return useDomainData('/api/crops', 60_000);    // 1 min
}

export function useFinanceData(): UseDomainDataResult {
  return useDomainData('/api/finance', 300_000); // 5 min
}

export function useIrrigationData(): UseDomainDataResult {
  return useDomainData('/api/irrigation', 120_000); // 2 min
}

export function useInventoryData(): UseDomainDataResult {
  return useDomainData('/api/inventory', 120_000);
}
