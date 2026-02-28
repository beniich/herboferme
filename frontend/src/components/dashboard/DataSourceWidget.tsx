'use client';

/**
 * ═══════════════════════════════════════════════════════════════
 * components/dashboard/DataSourceWidget.tsx
 * Widget Dashboard — Statut des sources + sync rapide
 * ═══════════════════════════════════════════════════════════════
 *
 * Affiché dans le Dashboard principal.
 * Montre en un coup d'œil :
 *   - Quelles sources sont connectées et leur statut
 *   - Un bouton "Connecter" si aucune source n'est configurée
 *   - Un bouton "Sync rapide" pour déclencher une sync sans aller dans Settings
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiHelpers } from '@/lib/api';

interface SourceStatus {
  _id:            string;
  name:           string;
  module:         string;
  lastSyncStatus: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncAt?:    string;
  lastSyncCount?: number;
  lastSyncError?: string;
}

const MODULE_ICONS: Record<string, string> = {
  fleet:     '🚜',
  hr:        '👥',
  planning:  '📅',
  dashboard: '📊',
  glpi:      '🖥️',
};

const STATUS_DOT: Record<string, string> = {
  idle:    'bg-gray-500',
  syncing: 'bg-yellow-400 animate-pulse',
  success: 'bg-green-400',
  error:   'bg-red-400',
};

export default function DataSourceWidget() {
  const [sources,       setSources]       = useState<SourceStatus[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [syncingAll,    setSyncingAll]    = useState(false);
  const [quickAddOpen,  setQuickAddOpen]  = useState(false);
  const [quickUrl,      setQuickUrl]      = useState('');
  const [quickModule,   setQuickModule]   = useState('fleet');
  const [quickName,     setQuickName]     = useState('');
  const [quickLoading,  setQuickLoading]  = useState(false);
  const [quickSuccess,  setQuickSuccess]  = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await apiHelpers.datasources.list();
      setSources(data.data);
    } catch { /* silencieux dans le dashboard */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Polling si sync en cours
  useEffect(() => {
    const hasSyncing = sources.some(s => s.lastSyncStatus === 'syncing');
    if (!hasSyncing) return;
    const interval = setInterval(load, 3_000);
    return () => clearInterval(interval);
  }, [sources, load]);

  // ── Sync tout ──────────────────────────────
  const handleSyncAll = async () => {
    setSyncingAll(true);
    try {
      await apiHelpers.datasources.syncAll();
      setSources(prev => prev.map(s => ({ ...s, lastSyncStatus: 'syncing' as const })));
      setTimeout(load, 2000);
    } finally { setSyncingAll(false); }
  };

  // ── Quick connect ──────────────────────────
  const handleQuickAdd = async () => {
    if (!quickUrl || !quickName) return;
    setQuickLoading(true);
    try {
      await apiHelpers.datasources.create({
        name:     quickName,
        module:   quickModule,
        method:   'csv_public',
        csvUrl:   quickUrl,
        autoSync: true,
        syncIntervalMin: 60,
      });
      setQuickSuccess(true);
      await load();
      setTimeout(() => {
        setQuickAddOpen(false);
        setQuickSuccess(false);
        setQuickUrl('');
        setQuickName('');
      }, 2000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'URL invalide.');
    } finally { setQuickLoading(false); }
  };

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-1/3 mb-4"/>
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-8 bg-white/5 rounded-lg"/>)}
        </div>
      </div>
    );
  }

  const successCount = sources.filter(s => s.lastSyncStatus === 'success').length;
  const errorCount   = sources.filter(s => s.lastSyncStatus === 'error').length;
  const totalRows    = sources.reduce((acc, s) => acc + (s.lastSyncCount ?? 0), 0);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      {/* ── En-tête ──────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-base">🔌</span>
          <h3 className="text-sm font-medium text-white">Sources de données</h3>
          {sources.length > 0 && (
            <span className="text-[11px] px-1.5 py-0.5 bg-white/10 text-gray-400 rounded-full">
              {sources.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {sources.length > 0 && (
            <button
              onClick={handleSyncAll}
              disabled={syncingAll}
              className="text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-40"
            >
              {syncingAll ? '⏳' : '🔄'} Sync
            </button>
          )}
          <Link
            href="/settings#datasources"
            className="text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            ⚙️ Gérer
          </Link>
        </div>
      </div>

      <div className="p-5">
        {/* ── Résumé stats ─────────────────────── */}
        {sources.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <StatPill value={sources.length} label="Sources" color="text-blue-400"/>
            <StatPill value={successCount}   label="Actives"  color="text-green-400"/>
            <StatPill value={totalRows}      label="Lignes"   color="text-amber-400"/>
          </div>
        )}

        {/* ── Liste des sources ─────────────────── */}
        {sources.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-400 mb-3">
              Vos données sont en mode démo.<br/>
              <span className="text-gray-500 text-xs">Connectez un Sheet pour des données réelles.</span>
            </p>
            <button
              onClick={() => setQuickAddOpen(true)}
              className="w-full py-2.5 text-sm bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 rounded-xl transition-colors"
            >
              + Connecter un Google Sheet
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {sources.slice(0, 5).map(source => (
              <div key={source._id} className="flex items-center gap-3 py-2">
                <span className="text-base w-5 text-center">{MODULE_ICONS[source.module] ?? '📄'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-200 truncate">{source.name}</p>
                  {source.lastSyncError ? (
                    <p className="text-[10px] text-red-400 truncate">{source.lastSyncError}</p>
                  ) : source.lastSyncAt ? (
                    <p className="text-[10px] text-gray-500">
                      {source.lastSyncCount} lignes · {formatRelativeTime(source.lastSyncAt)}
                    </p>
                  ) : (
                    <p className="text-[10px] text-gray-500">Jamais synchronisé</p>
                  )}
                </div>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[source.lastSyncStatus]}`}/>
              </div>
            ))}

            {sources.length > 5 && (
              <Link href="/settings#datasources" className="block text-center text-xs text-gray-500 hover:text-gray-300 pt-1">
                +{sources.length - 5} autres sources →
              </Link>
            )}

            {errorCount > 0 && (
              <div className="mt-3 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-xs text-red-400">
                  ⚠️ {errorCount} source{errorCount > 1 ? 's' : ''} en erreur —{' '}
                  <Link href="/settings#datasources" className="underline">vérifier</Link>
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Quick add inline ─────────────────── */}
        {sources.length > 0 && !quickAddOpen && (
          <button
            onClick={() => setQuickAddOpen(true)}
            className="w-full mt-3 py-2 text-xs text-gray-500 hover:text-gray-300 border border-dashed border-white/10 hover:border-white/20 rounded-lg transition-colors"
          >
            + Ajouter une source
          </button>
        )}

        {quickAddOpen && (
          <div className="mt-3 space-y-2.5 p-3 bg-white/5 rounded-xl border border-white/10">
            {quickSuccess ? (
              <p className="text-sm text-green-400 text-center py-2">✅ Source connectée !</p>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Nom de la source..."
                  value={quickName}
                  onChange={e => setQuickName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-green-500/40 placeholder-gray-600"
                />
                <select
                  value={quickModule}
                  onChange={e => setQuickModule(e.target.value)}
                  className="w-full bg-[#0f0b06] border border-white/10 text-white text-xs rounded-lg px-2 py-2 focus:outline-none"
                >
                  <option value="fleet">🚜 Flotte</option>
                  <option value="hr">👥 RH</option>
                  <option value="planning">📅 Planning</option>
                  <option value="dashboard">📊 Dashboard</option>
                </select>
                <input
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={quickUrl}
                  onChange={e => setQuickUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-green-500/40 placeholder-gray-600 font-mono"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setQuickAddOpen(false); setQuickUrl(''); setQuickName(''); }}
                    className="flex-1 py-1.5 text-xs text-gray-400 bg-white/5 hover:bg-white/10 rounded-lg"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleQuickAdd}
                    disabled={quickLoading || !quickUrl || !quickName}
                    className="flex-1 py-1.5 text-xs bg-green-600 hover:bg-green-500 text-white rounded-lg disabled:opacity-40"
                  >
                    {quickLoading ? '⏳' : 'Connecter'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatPill({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="text-center p-2 bg-white/5 rounded-lg">
      <p className={`text-lg font-bold ${color}`}>{value.toLocaleString('fr-FR')}</p>
      <p className="text-[10px] text-gray-500">{label}</p>
    </div>
  );
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min  = Math.floor(diff / 60000);
  if (min < 1)   return 'À l\'instant';
  if (min < 60)  return `il y a ${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24)    return `il y a ${h}h`;
  return `il y a ${Math.floor(h / 24)}j`;
}
