/**
 * ⚡ HERBOFERME FRONTEND - HOOKS (PRODUCTION READY)
 * 
 * SWR optimization patterns:
 * ├─ Type-safe data fetching
 * ├─ Automatic caching & deduplication
 * ├─ Error handling & retry logic
 * └─ Memory leak prevention
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 1. API CLIENT - Typed fetcher with auth
// ═══════════════════════════════════════════════════════════════════════════════

// frontend/lib/api-client.ts
import axios, { AxiosInstance, AxiosError } from 'axios';

interface FetcherResponse<T> {
  data: T;
  status: number;
}

export class APIClient {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2065') {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load token from storage
    this.loadToken();

    // Add token to all requests
    this.client.interceptors.request.use((config) => {
      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }

      const orgId = localStorage.getItem('organizationId');
      if (orgId) {
        config.headers['x-organization-id'] = orgId;
      }

      return config;
    });

    // Handle 401 Unauthorized
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  private loadToken(): void {
    if (typeof window !== 'undefined') {
      this.authToken = localStorage.getItem('authToken');
    }
  }

  setToken(token: string): void {
    this.authToken = token;
    localStorage.setItem('authToken', token);
  }

  clearToken(): void {
    this.authToken = null;
    localStorage.removeItem('authToken');
  }

  async fetch<T>(url: string, options?: any): Promise<FetcherResponse<T>> {
    const response = await this.client.get<T>(url, options);
    return {
      data: response.data,
      status: response.status,
    };
  }

  async post<T>(url: string, data?: any, options?: any): Promise<FetcherResponse<T>> {
    const response = await this.client.post<T>(url, data, options);
    return {
      data: response.data,
      status: response.status,
    };
  }

  async patch<T>(url: string, data?: any, options?: any): Promise<FetcherResponse<T>> {
    const response = await this.client.patch<T>(url, data, options);
    return {
      data: response.data,
      status: response.status,
    };
  }

  async delete<T>(url: string, options?: any): Promise<FetcherResponse<T>> {
    const response = await this.client.delete<T>(url, options);
    return {
      data: response.data,
      status: response.status,
    };
  }
}

export const apiClient = new APIClient();


// ═══════════════════════════════════════════════════════════════════════════════
// 2. TYPES - Data Models
// ═══════════════════════════════════════════════════════════════════════════════

// frontend/types/index.ts
export interface Stats {
  total: number;
  active: number;
  [key: string]: number;
}

export interface Item {
  _id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  errorId?: string;
}

export interface UseFetchOptions {
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  dedupingInterval?: number;
  focusThrottleInterval?: number;
}


// ═══════════════════════════════════════════════════════════════════════════════
// 3. HOOK - Generic Data Fetching (SWR)
// ═══════════════════════════════════════════════════════════════════════════════

// frontend/hooks/useFetch.ts
import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import { apiClient } from '@/lib/api-client';
import { ApiResponse } from '@/types';
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
  options?: UseFetchOptions & SWRConfiguration
): UseFetchResult<T> {
  const fetcher = useCallback(
    async (url: string): Promise<T> => {
      const response = await apiClient.fetch<T>(url);
      return response.data;
    },
    []
  );

  const {
    data,
    error,
    mutate,
    isValidating,
  } = useSWR<T, Error>(
    endpoint,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: options?.dedupingInterval ?? 60000, // 1 min
      focusThrottleInterval: options?.focusThrottleInterval ?? 300000, // 5 min
      errorRetryCount: 2,
      errorRetryInterval: 5000,
      shouldRetryOnError: true,
      ...options,
    }
  );

  return {
    data,
    isLoading: !error && !data && isValidating,
    error: error ?? null,
    mutate,
    isValidating,
  };
}


// ═══════════════════════════════════════════════════════════════════════════════
// 4. HOOK - Domain Data (Animals, Crops, etc.)
// ═══════════════════════════════════════════════════════════════════════════════

// frontend/hooks/useDomainData.ts
import { useFetch, UseFetchResult } from '@/hooks/useFetch';
import { Stats, Item } from '@/types';

export interface DomainData {
  stats: Stats;
  items: Item[];
}

export interface UseDomainDataResult extends UseFetchResult<DomainData> {
  stats: Stats | undefined;
  items: Item[] | undefined;
  refresh: () => Promise<void>;
}

export function useDomainData(
  endpoint: string,
  cacheTime: number = 60000
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

// Specific domain hooks
export function useAnimalsData(): UseDomainDataResult {
  return useDomainData('/api/animals', 60000); // 1 min
}

export function useCropsData(): UseDomainDataResult {
  return useDomainData('/api/crops', 60000); // 1 min
}

export function useFinanceData(): UseDomainDataResult {
  return useDomainData('/api/finance', 300000); // 5 min
}

export function useIrrigationData(): UseDomainDataResult {
  return useDomainData('/api/irrigation', 120000); // 2 min
}


// ═══════════════════════════════════════════════════════════════════════════════
// 5. HOOK - Dashboard (Multiple endpoints)
// ═══════════════════════════════════════════════════════════════════════════════

// frontend/hooks/useDashboardData.ts
import { useFetch, UseFetchResult } from '@/hooks/useFetch';
import { useCallback, useMemo } from 'react';

export interface DashboardStats {
  finance: {
    year: { revenue: number; expenses: number; profit: number };
    month: { profit: number };
    bySector: Array<{ _id: string; revenue: number; expenses: number }>;
  };
  animals: { totalAnimals: number };
  crops: {
    byStatus: Array<{ _id: string; count: number }>;
    byCategory: Array<{ _id: string; count: number }>;
  };
  irrigation: { totalVolume: number };
  transactions: Array<{
    _id: string;
    date: string;
    description: string;
    sector: string;
    type: 'recette' | 'depense';
    amount: number;
  }>;
}

export interface UseDashboardResult extends UseFetchResult<DashboardStats> {
  refresh: () => Promise<void>;
}

export function useDashboardData(): UseDashboardResult {
  const { data, isLoading, error, mutate, isValidating } = useFetch<DashboardStats>(
    '/api/dashboard',
    {
      dedupingInterval: 60000, // 1 min
      focusThrottleInterval: 300000, // 5 min
    }
  );

  const refresh = useCallback(() => mutate(), [mutate]);

  return {
    data,
    isLoading,
    error,
    mutate,
    isValidating,
    refresh,
  };
}


// ═══════════════════════════════════════════════════════════════════════════════
// 6. HOOK - Mutations (Create, Update, Delete)
// ═══════════════════════════════════════════════════════════════════════════════

// frontend/hooks/useMutation.ts
import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';

export interface UseMutationResult<T, R> {
  execute: (data: T) => Promise<R>;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

export function useMutation<T, R>(
  method: 'post' | 'patch' | 'delete',
  endpoint: string,
  options?: { onSuccess?: (data: R) => void; onError?: (error: Error) => void }
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
        } else {
          response = await apiClient.delete<R>(endpoint);
        }

        options?.onSuccess?.(response.data);
        toast.success('Success');
        return response.data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        options?.onError?.(error);
        toast.error(error.message);
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


// ═══════════════════════════════════════════════════════════════════════════════
// 7. HOOK - Authentication
// ═══════════════════════════════════════════════════════════════════════════════

// frontend/hooks/useAuth.ts
import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  organizationId: string;
  roles: string[];
}

export interface UseAuthResult {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        apiClient.setToken(token);
        setUser(JSON.parse(userData));
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      setIsLoading(true);

      try {
        const response = await apiClient.post<{ token: string; user: User }>(
          '/api/auth/login',
          { email, password }
        );

        const { token, user } = response.data;

        apiClient.setToken(token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('organizationId', user.organizationId);

        setUser(user);
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback((): void => {
    apiClient.clearToken();
    localStorage.removeItem('user');
    localStorage.removeItem('organizationId');
    setUser(null);
    router.push('/login');
  }, [router]);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;

      // Admin has all permissions
      if (user.roles.includes('admin')) return true;

      // Check against role permissions
      const rolePermissions: Record<string, string[]> = {
        user: ['animals:read', 'crops:read'],
        manager: ['animals:read', 'animals:create', 'crops:read', 'crops:create'],
        admin: ['*'],
      };

      const primaryRole = user.roles[0];
      const permissions = rolePermissions[primaryRole] || [];

      return permissions.includes('*') || permissions.includes(permission);
    },
    [user]
  );

  return {
    user,
    isLoggedIn: !!user,
    isLoading,
    login,
    logout,
    hasPermission,
  };
}
