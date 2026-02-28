/**
 * ═══════════════════════════════════════════════════════
 * lib/api.ts — Client API Unifié (Post-migration)
 * ═══════════════════════════════════════════════════════
 *
 * Architecture post-suppression ReclamTrack :
 *  - 1 seul backend Herbute (port 2065)
 *  - 1 seul client Axios
 *  - Authentification via cookies HttpOnly (plus de localStorage)
 *  - Refresh automatique des tokens transparents
 *  - Déconnexion synchronisée via AuthEventBus
 *
 * ⚠️  BREAKING CHANGE vs ancienne version :
 *  - Supprimé : herbuteApiClient + reclamtrackApiClient
 *  - Supprimé : token dans localStorage
 *  - Ajouté   : client unique avec cookies HttpOnly
 *  - Ajouté   : AuthEventBus pour la déconnexion synchronisée
 *  - Ajouté   : retry automatique après refresh token
 */

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { HERBUTE_ROUTES } from '@reclamtrack/shared';
import { authBus } from './auth-event-bus';

// ─────────────────────────────────────────────
// Configuration de base
// ─────────────────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2065';

// Flag pour éviter les boucles infinies de refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject:  (reason?: unknown) => void;
}> = [];

// Traiter la queue des requêtes en attente pendant le refresh
const processQueue = (error: Error | null): void => {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(undefined);
  });
  failedQueue = [];
};

// ─────────────────────────────────────────────
// Création du client Axios unique
// ─────────────────────────────────────────────
const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL:         BASE_URL,
    timeout:         15_000,           // 15s timeout
    withCredentials: true,             // ← REQUIS pour envoyer les cookies HttpOnly
    headers: {
      'Content-Type': 'application/json',
      'Accept':       'application/json',
    },
  });

  // ─────────────────────────────────────────────
  // INTERCEPTEUR REQUEST
  // Plus d'injection manuelle de token (le cookie est envoyé automatiquement)
  // On peut ajouter des headers de traçabilité ici si besoin
  // ─────────────────────────────────────────────
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Ajouter un header de trace pour les logs backend (optionnel)
      config.headers['X-Request-ID'] = crypto.randomUUID?.() ?? Date.now().toString();
      return config;
    },
    (error) => Promise.reject(error)
  );

  // ─────────────────────────────────────────────
  // INTERCEPTEUR RESPONSE
  // Gestion centralisée des erreurs 401 avec refresh automatique
  // ─────────────────────────────────────────────
  instance.interceptors.response.use(
    // Succès — passe directement
    (response: AxiosResponse) => response,

    // Erreur — traitement centralisé
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // ── 401 Unauthorized ────────────────────────────────
      if (error.response?.status === 401) {
        const errorCode = (error.response?.data as any)?.code;

        // Si c'est la route de refresh elle-même qui échoue
        // → session complètement expirée → logout forcé
        if (originalRequest.url?.includes(HERBUTE_ROUTES.auth.refresh)) {
          authBus.emitUnauthorized('REFRESH_FAILED');
          return Promise.reject(error);
        }

        // Si déjà en cours de refresh → mettre en queue
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(() => instance(originalRequest))
            .catch((err) => Promise.reject(err));
        }

        // Première tentative de refresh
        if (!originalRequest._retry) {
          originalRequest._retry = true;
          isRefreshing = true;

          try {
            // Tenter le refresh (le cookie refresh_token est envoyé automatiquement)
            await instance.post(HERBUTE_ROUTES.auth.refresh);

            // Refresh réussi → rejouer toutes les requêtes en attente
            processQueue(null);
            isRefreshing = false;

            // Rejouer la requête originale
            return instance(originalRequest);
          } catch (refreshError) {
            // Refresh échoué → déconnexion complète
            processQueue(refreshError as Error);
            isRefreshing = false;

            authBus.emitUnauthorized(errorCode);
            return Promise.reject(refreshError);
          }
        }

        // Token invalide et pas de refresh possible
        authBus.emitUnauthorized(errorCode);
        return Promise.reject(error);
      }

      // ── 403 Forbidden ────────────────────────────────
      if (error.response?.status === 403) {
        const errorCode = (error.response?.data as any)?.code;

        if (errorCode === 'FORBIDDEN_PLAN') {
          // Déclencher une modale d'upgrade (à implémenter dans AuthProvider)
          authBus.emit('auth:unauthorized', { code: 'UPGRADE_REQUIRED', ...error.response.data as object });
        }
      }

      // ── Timeout / Network Error ────────────────────────
      if (!error.response) {
        console.error('[API] Erreur réseau ou timeout:', error.message);
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// ─────────────────────────────────────────────
// Export du client unique
// ─────────────────────────────────────────────
export const api = createApiClient();

// ─────────────────────────────────────────────
// Helpers typés pour les appels courants
// Utilisent HERBUTE_ROUTES pour éviter les strings bruts
// ─────────────────────────────────────────────
export const apiHelpers = {

  // Auth
  auth: {
    login:          (data: { email: string; password: string }) =>
      api.post(HERBUTE_ROUTES.auth.login, data),

    logout:         () =>
      api.post(HERBUTE_ROUTES.auth.logout),

    logoutAll:      () =>
      api.post(HERBUTE_ROUTES.auth.logoutAll),

    me:             () =>
      api.get(HERBUTE_ROUTES.auth.me),

    register:       (data: Record<string, unknown>) =>
      api.post(HERBUTE_ROUTES.auth.register, data),

    forgotPassword: (email: string) =>
      api.post(HERBUTE_ROUTES.auth.forgotPassword, { email }),

    resetPassword:  (token: string, password: string) =>
      api.post(HERBUTE_ROUTES.auth.resetPassword, { token, password }),
  },

  // Fleet
  fleet: {
    getVehicles:    (params?: Record<string, unknown>) =>
      api.get(HERBUTE_ROUTES.fleet.vehicles, { params }),

    getVehicle:     (id: string) =>
      api.get(HERBUTE_ROUTES.fleet.vehicleById(id)),

    createVehicle:  (data: Record<string, unknown>) =>
      api.post(HERBUTE_ROUTES.fleet.vehicles, data),

    updateVehicle:  (id: string, data: Record<string, unknown>) =>
      api.patch(HERBUTE_ROUTES.fleet.vehicleById(id), data),

    getMaintenance: (params?: Record<string, unknown>) =>
      api.get(HERBUTE_ROUTES.fleet.maintenance, { params }),
  },

  // HR
  hr: {
    getStaff:       (params?: Record<string, unknown>) =>
      api.get(HERBUTE_ROUTES.hr.staff, { params }),

    getStaffMember: (id: string) =>
      api.get(HERBUTE_ROUTES.hr.staffById(id)),

    createStaff:    (data: Record<string, unknown>) =>
      api.post(HERBUTE_ROUTES.hr.staff, data),

    getRoster:      (params?: Record<string, unknown>) =>
      api.get(HERBUTE_ROUTES.hr.roster, { params }),

    getLeaves:      (params?: Record<string, unknown>) =>
      api.get(HERBUTE_ROUTES.hr.leaves, { params }),

    requestLeave:   (data: Record<string, unknown>) =>
      api.post(HERBUTE_ROUTES.hr.leaves, data),

    approveLeave:   (id: string) =>
      api.patch(HERBUTE_ROUTES.hr.leaveApprove(id)),

    rejectLeave:    (id: string, motif?: string) =>
      api.patch(HERBUTE_ROUTES.hr.leaveReject(id), { motif }),
  },

  // Planning
  planning: {
    getSchedule:        (params?: Record<string, unknown>) =>
      api.get(HERBUTE_ROUTES.planning.schedule, { params }),

    createSchedule:     (data: Record<string, unknown>) =>
      api.post(HERBUTE_ROUTES.planning.schedule, data),

    getInterventions:   (params?: Record<string, unknown>) =>
      api.get(HERBUTE_ROUTES.planning.interventions, { params }),

    createIntervention: (data: Record<string, unknown>) =>
      api.post(HERBUTE_ROUTES.planning.interventions, data),
  },

  // Dashboard
  dashboard: {
    getKpis:        () => api.get(HERBUTE_ROUTES.dashboard.kpis),
    getFarmSummary: () => api.get(HERBUTE_ROUTES.dashboard.farmSummary),
    getFleetSummary:() => api.get(HERBUTE_ROUTES.dashboard.fleetSummary),
  },

};

// ─────────────────────────────────────────────
// Type helper pour extraire les données d'une réponse Axios
// ─────────────────────────────────────────────
export type ApiResponse<T> = Promise<AxiosResponse<T>>;

export default api;
