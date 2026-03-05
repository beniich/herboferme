'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

export interface UseMutationResult<T, R> {
  execute: (data: T) => Promise<R>;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

export function useMutation<T = unknown, R = unknown>(
  method: 'post' | 'patch' | 'put' | 'delete',
  endpoint: string,
  options?: {
    onSuccess?: (data: R) => void;
    onError?: (error: Error) => void;
  }
): UseMutationResult<T, R> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (data: T): Promise<R> => {
      setIsLoading(true);
      setError(null);

      try {
        let response;
        if (method === 'post') {
          response = await apiClient.post<R>(endpoint, data);
        } else if (method === 'patch') {
          response = await apiClient.patch<R>(endpoint, data);
        } else if (method === 'put') {
          response = await apiClient.put<R>(endpoint, data);
        } else {
          response = await apiClient.delete<R>(endpoint);
        }

        options?.onSuccess?.(response.data);
        return response.data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erreur inconnue');
        setError(error);
        options?.onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [method, endpoint, options]
  );

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
  }, []);

  return { execute, isLoading, error, reset };
}
