'use client';

import useSWR, { SWRConfiguration } from 'swr';
import { apiClient } from '@/lib/api-client';
import { useCallback } from 'react';

export interface UseFetchResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  mutate: () => Promise<void>;
  isValidating: boolean;
}

export function useFetch<T>(
  endpoint: string | null,
  options?: SWRConfiguration
): UseFetchResult<T> {
  const fetcher = useCallback(
    async (url: string): Promise<T> => {
      const response = await apiClient.fetch<T>(url);
      return response.data;
    },
    []
  );

  const { data, error, mutate, isValidating } = useSWR<T, Error>(
    endpoint,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60_000,      // 1 min
      focusThrottleInterval: 300_000, // 5 min
      errorRetryCount: 2,
      errorRetryInterval: 5_000,
      shouldRetryOnError: true,
      ...options,
    }
  );

  return {
    data,
    isLoading: !error && !data && isValidating,
    error: error ?? null,
    mutate: mutate as () => Promise<void>,
    isValidating,
  };
}
