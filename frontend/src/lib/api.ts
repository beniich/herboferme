import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { HERBUTE_ROUTES } from '@reclamtrack/shared';
import { authEventBus } from './auth-event-bus';

/**
 * lib/api.ts — Client Axios Unique (Version Finale Stabilisée)
 */

const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    // Si la variable d'environnement existe, elle a toujours priorité pour l'API
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }

    // Fallback dynamique si on accède depuis le réseau local
    if (!isLocalhost) {
      return `${window.location.protocol}//${window.location.hostname}:2065`;
    }
  }
  
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2065';
};

const API_BASE_URL = getApiUrl();
class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      withCredentials: true,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Intercepteur de requête : injection de l'Organisation ID
    this.client.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        const orgId = localStorage.getItem('active_organization_id');
        if (orgId) {
          config.headers['x-organization-id'] = orgId;
        }
      }
      console.log('[Axios Request]', config.method?.toUpperCase(), config.url, config.data);
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Prevent aggressive Red Error Overlay in Next.js Dev by using console.warn instead of console.error
        console.warn('[Axios API Error]', error.config?.url, error.response?.status, error.response?.data || error.message);
        if (error.response?.status === 401) {
          authEventBus.emit('session-expired');
        }
        return Promise.reject(error);
      }
    );
  }

  private unwrap<T>(res: AxiosResponse<any>): T {
    const body = res.data;
    if (body && typeof body === 'object' && body.success === true && body.data !== undefined) {
      return body.data as T;
    }
    return body as T;
  }

  get<T = any>(url: string, config?: any) { return this.client.get<any>(url, config).then(r => this.unwrap<T>(r)); }
  post<T = any>(url: string, data?: any, config?: any) { return this.client.post<any>(url, data, config).then(r => this.unwrap<T>(r)); }
  put<T = any>(url: string, data?: any, config?: any) { return this.client.put<any>(url, data, config).then(r => this.unwrap<T>(r)); }
  patch<T = any>(url: string, data?: any, config?: any) { return this.client.patch<any>(url, data, config).then(r => this.unwrap<T>(r)); }
  delete<T = any>(url: string, config?: any) { return this.client.delete<any>(url, config).then(r => this.unwrap<T>(r)); }
}

export const apiClient = new ApiClient(API_BASE_URL);

/**
 * Helpers API
 */
export const authApi = {
  login: (data: any) => apiClient.post(HERBUTE_ROUTES.auth.login, data),
  register: (data: any) => apiClient.post(HERBUTE_ROUTES.auth.register, data),
  logout: () => apiClient.post(HERBUTE_ROUTES.auth.logout),
  me: () => apiClient.get(HERBUTE_ROUTES.auth.me),
  refresh: () => apiClient.post(HERBUTE_ROUTES.auth.refresh),
  googleLogin: (credential: string) => apiClient.post('/api/auth/google', { credential }),
  mockUpgradePlan: () => apiClient.post('/api/billing/mock-checkout'),
};

export const organizationsApi = {
  getOrganizations: () => apiClient.get('/api/organizations'),
  getMyOrganizations: () => apiClient.get('/api/organizations'),
  getOrganization: (id: string) => apiClient.get(`/api/organizations/${id}`),
  createOrganization: (data: any) => apiClient.post('/api/organizations', data),
  updateOrganization: (id: string, data: any) => apiClient.patch(`/api/organizations/${id}`, data),
  getMembers: (id: string) => apiClient.get(`/api/organizations/${id}/members`),
  inviteMember: (id: string, email: string, roles: string[]) => apiClient.post(`/api/organizations/${id}/members`, { email, roles }),
  updateMemberRole: (id: string, membershipId: string, roles: string[]) => apiClient.patch(`/api/organizations/${id}/members/${membershipId}`, { roles }),
  removeMember: (id: string, membershipId: string) => apiClient.delete(`/api/organizations/${id}/members/${membershipId}`),
};

export const fleetApi = {
  getVehicles: () => apiClient.get(HERBUTE_ROUTES.fleet.vehicles),
  getVehicle: (id: string) => apiClient.get(HERBUTE_ROUTES.fleet.vehicleById(id)),
};

export const hrApi = {
  getStaff: () => apiClient.get(HERBUTE_ROUTES.hr.staff),
  getLeaves: () => apiClient.get(HERBUTE_ROUTES.hr.leaves),
};

export const planningApi = {
  getSchedule: () => apiClient.get(HERBUTE_ROUTES.planning.schedule),
  getInterventions: () => apiClient.get(HERBUTE_ROUTES.planning.interventions),
  updateIntervention: (id: string, data: any) => apiClient.patch(`${HERBUTE_ROUTES.planning.interventions}/${id}`, data),
  createIntervention: (data: any) => apiClient.post(HERBUTE_ROUTES.planning.interventions, data),
  deleteIntervention: (id: string) => apiClient.delete(`${HERBUTE_ROUTES.planning.interventions}/${id}`),
};

export const inventoryApi = {
  getItems: () => apiClient.get('/api/inventory'), 
  getItem: (id: string) => apiClient.get(`/api/inventory/${id}`),
  updateStock: (id: string, quantity: number) => apiClient.patch(`/api/inventory/${id}/stock`, { quantity }),
};

export const complaintsApi = {
  getAll: (params?: any) => apiClient.get('/api/complaints' + (params ? '?' + new URLSearchParams(params).toString() : '')),
  getById: (id: string) => apiClient.get(`/api/complaints/${id}`),
};

export const animalsApi = {
  getAll: (params?: Record<string, string>) => apiClient.get('/api/animals' + (params ? '?' + new URLSearchParams(params).toString() : '')),
  getById: (id: string) => apiClient.get(`/api/animals/${id}`),
  getStats: (params?: Record<string, string>) => apiClient.get('/api/animals/stats' + (params ? '?' + new URLSearchParams(params).toString() : '')),
  create: (data: any) => apiClient.post('/api/animals', data),
  update: (id: string, data: any) => apiClient.put(`/api/animals/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/animals/${id}`),
};

export const cropsApi = {
  getAll: (params?: Record<string, string>) => apiClient.get('/api/crops' + (params ? '?' + new URLSearchParams(params).toString() : '')),
  getById: (id: string) => apiClient.get(`/api/crops/${id}`),
  getStats: (params?: Record<string, string>) => apiClient.get('/api/crops/stats' + (params ? '?' + new URLSearchParams(params).toString() : '')),
  create: (data: any) => apiClient.post('/api/crops', data),
  update: (id: string, data: any) => apiClient.put(`/api/crops/${id}`, data),
  harvest: (id: string, actualYield: number) => apiClient.post(`/api/crops/${id}/harvest`, { actualYield }),
  delete: (id: string) => apiClient.delete(`/api/crops/${id}`),
};

export const financeApi = {
  getTransactions: (params?: Record<string, string>) => apiClient.get('/api/finance/transactions' + (params ? '?' + new URLSearchParams(params).toString() : '')),
  createTransaction: (data: any) => apiClient.post('/api/finance/transactions', data),
  updateTransaction: (id: string, data: any) => apiClient.put(`/api/finance/transactions/${id}`, data),
  deleteTransaction: (id: string) => apiClient.delete(`/api/finance/transactions/${id}`),
  getStats: () => apiClient.get('/api/finance/stats'),
  getKPIs: (params?: Record<string, string>) => apiClient.get('/api/finance/kpis' + (params ? '?' + new URLSearchParams(params).toString() : '')),
};

export const agroAccountingApi = {
  getEntries: (params?: any) => apiClient.get('/api/agro-accounting/entries', { params }),
  createEntry: (data: any) => apiClient.post('/api/agro-accounting/entries', data),
  getStats: (params?: any) => apiClient.get('/api/agro-accounting/stats', { params }),
};

export const agroBudgetsApi = {
  getAll: (params?: any) => apiClient.get('/api/agro-budgets', { params }),
  getById: (id: string) => apiClient.get(`/api/agro-budgets/${id}`),
  create: (data: any) => apiClient.post('/api/agro-budgets', data),
  update: (id: string, data: any) => apiClient.patch(`/api/agro-budgets/${id}`, data),
};

export const agroInventoryApi = {
  getAll: (params?: any) => apiClient.get('/api/agro-inventory', { params }),
  getById: (id: string) => apiClient.get(`/api/agro-inventory/${id}`),
  create: (data: any) => apiClient.post('/api/agro-inventory', data),
  update: (id: string, data: any) => apiClient.patch(`/api/agro-inventory/${id}`, data),
  updateStock: (id: string, quantity: number) => apiClient.patch(`/api/agro-inventory/${id}/stock`, { quantity }),
};

export const agroKnowledgeApi = {
  getArticles: (params?: any) => apiClient.get('/api/agro-knowledge', { params }),
  getArticle: (slug: string) => apiClient.get(`/api/agro-knowledge/${slug}`),
  createArticle: (data: any) => apiClient.post('/api/agro-knowledge', data),
};

export const agroReportsApi = {
  exportAccounting: (format: 'pdf' | 'excel', params?: any) => 
    apiClient.get(`/api/agro-reports/accounting/${format}`, { params, responseType: 'blob' }),
  exportInventory: (format: 'pdf' | 'excel', params?: any) => 
    apiClient.get(`/api/agro-reports/inventory/${format}`, { params, responseType: 'blob' }),
};

export const irrigationApi = {
  getAll: (params?: Record<string, string>) => apiClient.get('/api/irrigation' + (params ? '?' + new URLSearchParams(params).toString() : '')),
  getStats: () => apiClient.get('/api/irrigation/stats'),
  create: (data: any) => apiClient.post('/api/irrigation', data),
  update: (id: string, data: any) => apiClient.put(`/api/irrigation/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/irrigation/${id}`),
};

export const infrastructureApi = {
  getAll: (params?: Record<string, string>) => apiClient.get('/api/infrastructure' + (params ? '?' + new URLSearchParams(params).toString() : '')),
  create: (data: any) => apiClient.post('/api/infrastructure', data),
  update: (id: string, data: any) => apiClient.put(`/api/infrastructure/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/infrastructure/${id}`),
};

// Aliases and Stubs for legacy components and TS build
export const organizationApi = organizationsApi;
export const adminApi = {
  getSecurityMetrics: () => apiClient.get('/api/admin/users/security/metrics'),
  getUsers: () => apiClient.get('/api/admin/users'),
  getAuditLogs: () => apiClient.get('/api/admin/audit-logs'),
  getSecurityAudit: () => apiClient.get('/api/admin/users/security/audit'),
};
export const securityApi = {
  getAlerts: () => apiClient.get('/api/admin/security/alerts'),
  getSecrets: () => apiClient.get('/api/admin/security/secrets'), // This will likely 404 until implemented
  getVaultStats: () => apiClient.get('/api/admin/security/secrets/stats'),
  createSecret: (data: any) => apiClient.post('/api/admin/security/secrets', data),
  revealSecret: (id: string) => apiClient.get(`/api/admin/security/secrets/${id}/reveal`),
  deleteSecret: (id: string) => apiClient.delete(`/api/admin/security/secrets/${id}`),
  getCompliance: () => apiClient.get('/api/security/compliance'),
  getRdpSessions: () => apiClient.get('/api/security/sessions/rdp'),
  getPasswordAudit: () => apiClient.get('/api/security/audit/passwords'),
  getFirewallLogs: () => apiClient.get('/api/security/firewall-logs'),
  getStatus: () => apiClient.get('/api/security/status'),
  getApiKeys: () => apiClient.get('/api/admin/security/api-keys'),
  createApiKey: (data: any) => apiClient.post('/api/admin/security/api-keys', data),
  rotateApiKey: (id: string) => apiClient.post(`/api/admin/security/api-keys/${id}/rotate`),
  deleteApiKey: (id: string) => apiClient.delete(`/api/admin/security/api-keys/${id}`),
};
export const itAssetsApi = {
  getAssets: () => apiClient.get('/api/admin/it/assets'),
  getAll: () => apiClient.get('/api/admin/it/assets'),
  getStats: () => apiClient.get('/api/admin/it/assets/stats'),
};
export const itTicketsApi = {
  getTickets: () => apiClient.get('/api/admin/it/tickets'),
  getAll: () => apiClient.get('/api/admin/it/tickets'),
  getStats: () => apiClient.get('/api/admin/it/tickets/stats'),
};
export const teamsApi = {
  getTeams: () => apiClient.get('/api/teams'),
  getAll: () => apiClient.get('/api/teams'),
  getLocations: () => apiClient.get('/api/teams/locations'),
  create: (data: any) => apiClient.post('/api/teams', data),
};

export default apiClient;

// ─────────────────────────────────────────────
// Alias "api" — utilisé dans hooks et pages legacy
// ─────────────────────────────────────────────
export const api = apiClient;

// ─────────────────────────────────────────────
// DataSource helpers
// ─────────────────────────────────────────────
export const datasourceHelpers = {
  list: () => apiClient.get('/api/datasources'),
  create: (data: Record<string, unknown>) => apiClient.post('/api/datasources', data),
  update: (id: string, data: Record<string, unknown>) => apiClient.put(`/api/datasources/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/datasources/${id}`),
  test: (id: string) => apiClient.post(`/api/datasources/${id}/test`),
  sync: (id: string) => apiClient.post(`/api/datasources/${id}/sync`),
  syncAll: () => apiClient.post('/api/datasources/sync-all'),
  preview: (id: string) => apiClient.get(`/api/datasources/${id}/preview`),
  getData: (module: string, params?: Record<string, unknown>) =>
    apiClient.get(`/api/datasources/data/${module}`, { params }),
};

// ─────────────────────────────────────────────
// apiHelpers — objet centralisé pour auth-provider et composants
// ─────────────────────────────────────────────
export const apiHelpers = {
  auth: {
    login: (data: any) => apiClient.post('/api/auth/login', data),
    logout: () => apiClient.post('/api/auth/logout'),
    logoutAll: () => apiClient.post('/api/auth/logout-all'),
    me: () => apiClient.get('/api/auth/me'),
    register: (data: any) => apiClient.post('/api/auth/register', data),
    refresh: () => apiClient.post('/api/auth/refresh'),
    googleLogin: (credential: string) => apiClient.post('/api/auth/google', { credential }),
  },
  fleet: {
    getVehicles: () => apiClient.get('/api/fleet/vehicles'),
    getVehicle: (id: string) => apiClient.get(`/api/fleet/vehicles/${id}`),
  },
  hr: {
    getStaff: () => apiClient.get('/api/hr/staff'),
    getLeaves: () => apiClient.get('/api/hr/leaves'),
  },
  planning: {
    getSchedule: () => apiClient.get('/api/planning/schedule'),
    getInterventions: () => apiClient.get('/api/planning/interventions'),
  },
  organizations: {
    list: () => apiClient.get('/api/organizations'),
    get: (id: string) => apiClient.get(`/api/organizations/${id}`),
    create: (data: any) => apiClient.post('/api/organizations', data),
    update: (id: string, data: any) => apiClient.patch(`/api/organizations/${id}`, data),
    getMembers: (orgId: string) => apiClient.get(`/api/organizations/${orgId}/members`),
    inviteMember: (orgId: string, email: string, role: string) =>
      apiClient.post(`/api/organizations/${orgId}/members`, { email, role }),
    removeMember: (orgId: string, membershipId: string) =>
      apiClient.delete(`/api/organizations/${orgId}/members/${membershipId}`),
  },
  datasources: datasourceHelpers,
  billing: {
    mockCheckout: () => apiClient.post('/api/billing/mock-checkout'),
    getSubscription: () => apiClient.get('/api/billing/subscription'),
    createCheckout: (data: any) => apiClient.post('/api/billing/create-checkout', data),
    createSubscription: (data: any) => apiClient.post('/api/billing/create-subscription', data),
    startTrial: (data: any) => apiClient.post('/api/billing/start-trial', data),
  },
  glpi: {
    getTickets: (params?: any) => apiClient.get('/api/glpi/tickets' + (params ? '?' + new URLSearchParams(params).toString() : '')),
    updateTicket: (id: number, data: any) => apiClient.patch(`/api/glpi/tickets/${id}`, data),
    sync: () => apiClient.post('/api/glpi/sync'),
  },
};
