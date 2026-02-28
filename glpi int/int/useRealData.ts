/**
 * ═══════════════════════════════════════════════════════════════
 * lib/hooks/useRealData.ts — Hook de remplacement des mocks
 * ═══════════════════════════════════════════════════════════════
 *
 * Ce hook est le pont principal entre les composants existants
 * (qui appellaient des mocks) et le nouveau système de données réelles.
 *
 * Usage :
 *   // AVANT (mock)
 *   const vehicles = MOCK_VEHICLES;
 *
 *   // APRÈS (données réelles)
 *   const { data: vehicles, loading, sync, hasSource } = useRealData('fleet');
 *
 * Si aucune source n'est configurée → retourne [] + hasSource=false
 * Le composant peut alors afficher un CTA "Configurer une source"
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';

interface UseRealDataOptions {
  page?:           number;
  limit?:          number;
  search?:         string;
  /** Si true, rafraîchit automatiquement toutes les X ms */
  refreshInterval?: number;
}

interface UseRealDataReturn<T> {
  data:       T[];
  loading:    boolean;
  error:      string | null;
  total:      number;
  page:       number;
  pages:      number;
  hasSource:  boolean;                          // false si aucun Sheet configuré
  sources:    { id: string; name: string; status: string }[];
  notice?:    string;
  refetch:    () => Promise<void>;
  sync:       () => Promise<void>;             // Déclenche une sync manuelle
  isSyncing:  boolean;
}

export function useRealData<T = Record<string, unknown>>(
  module:  'fleet' | 'hr' | 'planning' | 'dashboard',
  options: UseRealDataOptions = {}
): UseRealDataReturn<T> {
  const { page = 1, limit = 100, search = '', refreshInterval } = options;

  const [data,      setData]      = useState<T[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [total,     setTotal]     = useState(0);
  const [pages,     setPages]     = useState(0);
  const [hasSource, setHasSource] = useState(false);
  const [sources,   setSources]   = useState<{ id: string; name: string; status: string }[]>([]);
  const [notice,    setNotice]    = useState<string | undefined>();
  const [isSyncing, setIsSyncing] = useState(false);

  const mountedRef = useRef(true);
  useEffect(() => { return () => { mountedRef.current = false; }; }, []);

  const fetchData = useCallback(async () => {
    try {
      setError(null);

      const params = new URLSearchParams({
        page:  String(page),
        limit: String(limit),
        ...(search ? { search } : {}),
      });

      const { data: result } = await api.get(`/api/datasources/data/${module}?${params}`);

      if (!mountedRef.current) return;

      setData(result.data ?? []);
      setTotal(result.total ?? 0);
      setPages(result.pages ?? 0);
      setSources(result.sources ?? []);
      setHasSource((result.sources ?? []).length > 0);
      setNotice(result._notice);
    } catch (err: any) {
      if (!mountedRef.current) return;
      setError(err.response?.data?.error || 'Erreur de chargement des données.');
      setData([]);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [module, page, limit, search]);

  // Chargement initial
  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  // Rafraîchissement automatique
  useEffect(() => {
    if (!refreshInterval) return;
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  // Sync manuelle
  const sync = useCallback(async () => {
    setIsSyncing(true);
    try {
      await api.post('/api/datasources/sync-all');
      // Attendre la fin de la sync puis recharger
      await new Promise(resolve => setTimeout(resolve, 3000));
      await fetchData();
    } finally {
      if (mountedRef.current) setIsSyncing(false);
    }
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    total,
    page,
    pages,
    hasSource,
    sources,
    notice,
    refetch:   fetchData,
    sync,
    isSyncing,
  };
}

// ─────────────────────────────────────────────
// Composant de fallback quand aucune source n'est configurée
// À utiliser dans les pages Fleet, HR, Planning...
// ─────────────────────────────────────────────
export function NoDataSourceBanner({ module }: { module: string }) {
  const labels: Record<string, string> = {
    fleet:     'la flotte de véhicules',
    hr:        'les données RH',
    planning:  'le planning',
    dashboard: 'le dashboard',
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="text-5xl mb-4">📊</div>
      <h3 className="text-white font-semibold text-lg mb-2">
        Données de démonstration
      </h3>
      <p className="text-gray-400 text-sm mb-6 max-w-md">
        Connectez un Google Sheet pour afficher {labels[module] ?? 'ces données'} en temps réel.
        La configuration prend moins de 2 minutes.
      </p>
      <a
        href="/settings#datasources"
        className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium transition-colors"
      >
        <span>🔌</span>
        <span>Configurer la source de données</span>
      </a>
    </div>
  );
}
