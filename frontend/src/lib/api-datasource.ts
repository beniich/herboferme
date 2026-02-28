/**
 * lib/api-datasource.ts — Extension de l'apiHelpers pour les DataSources
 *
 * Ajouter ce bloc dans votre lib/api.ts existant,
 * dans l'objet apiHelpers :
 *
 *   export const apiHelpers = {
 *     auth: { ... },
 *     fleet: { ... },
 *     ...
 *     datasources: datasourceHelpers,  ← AJOUTER
 *   };
 */

import { api } from './api';

export const datasourceHelpers = {

  /** Liste toutes les sources de la ferme */
  list: () =>
    api.get('/api/datasources'),

  /** Créer une nouvelle source */
  create: (data: Record<string, unknown>) =>
    api.post('/api/datasources', data),

  /** Modifier une source */
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/api/datasources/${id}`, data),

  /** Supprimer une source et son cache */
  delete: (id: string) =>
    api.delete(`/api/datasources/${id}`),

  /** Tester la connexion (retourne preview 3 lignes) */
  test: (id: string) =>
    api.post(`/api/datasources/${id}/test`),

  /** Déclencher une sync manuelle sur une source */
  sync: (id: string) =>
    api.post(`/api/datasources/${id}/sync`),

  /** Synchroniser toutes les sources de la ferme */
  syncAll: () =>
    api.post('/api/datasources/sync-all'),

  /** Aperçu des 10 premières lignes en cache */
  preview: (id: string) =>
    api.get(`/api/datasources/${id}/preview`),

  /** Données réelles du module (remplace les mocks) */
  getData: (module: string, params?: { page?: number; limit?: number; search?: string }) =>
    api.get(`/api/datasources/data/${module}`, { params }),
};
