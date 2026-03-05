/**
 * API Client — Axios typé avec auth automatique
 * Basé sur le doc SOC2 (02-FRONTEND-HOOKS-PRODUCTION)
 */
import axios, { AxiosInstance, AxiosError } from 'axios';

interface FetcherResponse<T> {
  data: T;
  status: number;
}

export class APIClient {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    // Determine the base URL dynamically just like in api.ts
    const getApiUrl = () => {
      if (typeof window !== 'undefined') {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const envUrl = process.env.NEXT_PUBLIC_API_URL;
        
        if (!isLocalhost && (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
          const port = envUrl ? new URL(envUrl).port : '2065';
          return `${window.location.protocol}//${window.location.hostname}:${port || '2065'}`;
        }
      }
      return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2065';
    };

    const baseURL = getApiUrl();

    this.client = axios.create({
      baseURL,
      timeout: 10_000,
      withCredentials: true, // ← cookies HttpOnly (access_token, refresh_token)
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.loadToken();

    // Injecter le token Bearer si dispo (fallback localStorage)
    this.client.interceptors.request.use((config) => {
      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }
      const orgId = typeof window !== 'undefined'
        ? localStorage.getItem('organizationId')
        : null;
      if (orgId) {
        config.headers['x-organization-id'] = orgId;
      }
      return config;
    });

    // Gérer 401 → redirection login
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
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
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  clearToken(): void {
    this.authToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('organizationId');
    }
  }

  async get<T>(url: string, options?: object): Promise<FetcherResponse<T>> {
    const response = await this.client.get<T>(url, options);
    return { data: response.data, status: response.status };
  }

  async post<T>(url: string, data?: unknown, options?: object): Promise<FetcherResponse<T>> {
    const response = await this.client.post<T>(url, data, options);
    return { data: response.data, status: response.status };
  }

  async patch<T>(url: string, data?: unknown, options?: object): Promise<FetcherResponse<T>> {
    const response = await this.client.patch<T>(url, data, options);
    return { data: response.data, status: response.status };
  }

  async put<T>(url: string, data?: unknown, options?: object): Promise<FetcherResponse<T>> {
    const response = await this.client.put<T>(url, data, options);
    return { data: response.data, status: response.status };
  }

  async delete<T>(url: string, options?: object): Promise<FetcherResponse<T>> {
    const response = await this.client.delete<T>(url, options);
    return { data: response.data, status: response.status };
  }
}

export const apiClient = new APIClient();
