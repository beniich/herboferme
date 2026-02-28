'use client';

/**
 * ═══════════════════════════════════════════════════════════════
 * components/settings/DataSourceSettings.tsx
 * Page Paramètres > Sources de données
 * ═══════════════════════════════════════════════════════════════
 *
 * Permet à l'admin/manager de :
 *   1. Voir toutes ses sources connectées (avec statut de sync)
 *   2. Ajouter une nouvelle source (lien Sheets + module + méthode)
 *   3. Tester la connexion avant de sauvegarder (aperçu 3 lignes)
 *   4. Configurer le mapping des colonnes
 *   5. Activer/désactiver la sync automatique
 *   6. Déclencher une sync manuelle
 */

import { useState, useEffect, useCallback } from 'react';
import { apiHelpers } from '@/lib/api';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Module  = 'fleet' | 'hr' | 'planning' | 'dashboard';
type Method  = 'csv_public' | 'sheets_api_v4';
type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

interface DataSource {
  _id:             string;
  name:            string;
  module:          Module;
  method:          Method;
  csvUrl?:         string;
  spreadsheetId?:  string;
  sheetName?:      string;
  autoSync:        boolean;
  syncIntervalMin: number;
  lastSyncAt?:     string;
  lastSyncStatus:  SyncStatus;
  lastSyncCount?:  number;
  lastSyncError?:  string;
  isActive:        boolean;
  columnMappings:  { sheetColumn: string; targetField: string; transform?: string }[];
}

interface TestResult {
  ok:       boolean;
  rowCount: number;
  headers:  string[];
  preview:  Record<string, string>[];
  error?:   string;
}

// ─────────────────────────────────────────────
// Constantes UI
// ─────────────────────────────────────────────
const MODULE_LABELS: Record<Module, { label: string; icon: string; color: string }> = {
  fleet:     { label: 'Flotte',    icon: '🚜', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  hr:        { label: 'RH',        icon: '👥', color: 'bg-blue-500/20  text-blue-400  border-blue-500/30'  },
  planning:  { label: 'Planning',  icon: '📅', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  dashboard: { label: 'Dashboard', icon: '📊', color: 'bg-green-500/20  text-green-400  border-green-500/30'  },
};

const STATUS_CONFIG: Record<SyncStatus, { label: string; color: string; dot: string }> = {
  idle:    { label: 'Non synchronisé', color: 'text-gray-400',  dot: 'bg-gray-500'  },
  syncing: { label: 'En cours…',       color: 'text-yellow-400', dot: 'bg-yellow-400 animate-pulse' },
  success: { label: 'Synchronisé',     color: 'text-green-400', dot: 'bg-green-400'  },
  error:   { label: 'Erreur',          color: 'text-red-400',   dot: 'bg-red-400'    },
};

// ─────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────
export default function DataSourceSettings() {
  const [sources,    setSources]    = useState<DataSource[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [editSource, setEditSource] = useState<DataSource | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testing,    setTesting]    = useState(false);
  const [syncing,    setSyncing]    = useState<string | null>(null);

  // Formulaire
  const [form, setForm] = useState({
    name:            '',
    module:          'fleet' as Module,
    method:          'csv_public' as Method,
    csvUrl:          '',
    spreadsheetId:   '',
    sheetName:       '',
    autoSync:        false,
    syncIntervalMin: 60,
  });

  // ── Chargement ──────────────────────────────
  const loadSources = useCallback(async () => {
    try {
      const { data } = await apiHelpers.datasources.list();
      setSources(data.data);
    } catch (err) {
      console.error('Erreur chargement sources:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSources(); }, [loadSources]);

  // Polling pour les syncs en cours
  useEffect(() => {
    const hasSyncing = sources.some(s => s.lastSyncStatus === 'syncing');
    if (!hasSyncing) return;

    const interval = setInterval(loadSources, 3_000);
    return () => clearInterval(interval);
  }, [sources, loadSources]);

  // ── Test de connexion ───────────────────────
  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      // Créer une source temporaire pour le test
      const tempSource = await apiHelpers.datasources.create(form);
      const { data } = await apiHelpers.datasources.test(tempSource.data.data._id);
      setTestResult(data);
      // Garder la source créée si test OK, sinon la supprimer
      if (!data.ok) {
        await apiHelpers.datasources.delete(tempSource.data.data._id);
      }
    } catch (err: any) {
      setTestResult({ ok: false, rowCount: 0, headers: [], preview: [], error: err.message });
    } finally {
      setTesting(false);
    }
  };

  // ── Sauvegarde ──────────────────────────────
  const handleSave = async () => {
    try {
      if (editSource) {
        await apiHelpers.datasources.update(editSource._id, form);
      } else {
        await apiHelpers.datasources.create(form);
      }
      setShowForm(false);
      setEditSource(null);
      setTestResult(null);
      await loadSources();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de la sauvegarde.');
    }
  };

  // ── Sync manuelle ───────────────────────────
  const handleSync = async (sourceId: string) => {
    setSyncing(sourceId);
    try {
      await apiHelpers.datasources.sync(sourceId);
      // Optimistic update
      setSources(prev => prev.map(s =>
        s._id === sourceId ? { ...s, lastSyncStatus: 'syncing' } : s
      ));
      setTimeout(loadSources, 2000);
    } catch (err: any) {
      alert('Erreur lors du lancement de la sync.');
    } finally {
      setSyncing(null);
    }
  };

  // ── Suppression ─────────────────────────────
  const handleDelete = async (sourceId: string, name: string) => {
    if (!confirm(`Supprimer "${name}" et son cache de données ?`)) return;
    try {
      await apiHelpers.datasources.delete(sourceId);
      setSources(prev => prev.filter(s => s._id !== sourceId));
    } catch { alert('Erreur lors de la suppression.'); }
  };

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1,2,3].map(i => (
          <div key={i} className="h-20 bg-white/5 rounded-xl"/>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── En-tête ──────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Sources de données</h2>
          <p className="text-sm text-gray-400 mt-1">
            Connectez vos Google Sheets pour remplacer les données de démonstration.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => apiHelpers.datasources.syncAll()}
            className="px-3 py-2 text-sm bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg transition-colors"
          >
            🔄 Tout synchroniser
          </button>
          <button
            onClick={() => { setShowForm(true); setEditSource(null); setForm({ name: '', module: 'fleet', method: 'csv_public', csvUrl: '', spreadsheetId: '', sheetName: '', autoSync: false, syncIntervalMin: 60 }); }}
            className="px-4 py-2 text-sm bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors font-medium"
          >
            + Connecter un Sheet
          </button>
        </div>
      </div>

      {/* ── Liste des sources ─────────────────── */}
      {sources.length === 0 ? (
        <EmptyState onAdd={() => setShowForm(true)} />
      ) : (
        <div className="space-y-3">
          {sources.map(source => (
            <SourceCard
              key={source._id}
              source={source}
              syncing={syncing === source._id}
              onSync={() => handleSync(source._id)}
              onEdit={() => { setEditSource(source); setForm({ name: source.name, module: source.module, method: source.method, csvUrl: source.csvUrl || '', spreadsheetId: source.spreadsheetId || '', sheetName: source.sheetName || '', autoSync: source.autoSync, syncIntervalMin: source.syncIntervalMin }); setShowForm(true); }}
              onDelete={() => handleDelete(source._id, source.name)}
            />
          ))}
        </div>
      )}

      {/* ── Formulaire d'ajout/édition ────────── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1209] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">
                  {editSource ? 'Modifier la source' : 'Connecter un Google Sheet'}
                </h3>
                <button onClick={() => { setShowForm(false); setTestResult(null); }} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
              </div>

              <div className="space-y-4">

                {/* Nom */}
                <Field label="Nom de la source" required>
                  <input
                    type="text"
                    title="Nom de la source"
                    placeholder="Ex: Flotte principale, RH 2026..."
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500/50"
                  />
                </Field>

                {/* Module + Méthode */}
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Module cible" required>
                    <select
                      value={form.module}
                      title="Module cible"
                      onChange={e => setForm(p => ({ ...p, module: e.target.value as Module }))}
                      className="w-full bg-[#111] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500/50"
                    >
                      {(Object.entries(MODULE_LABELS) as [Module, any][]).map(([k, v]) => (
                        <option key={k} value={k}>{v.icon} {v.label}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Méthode d'accès" required>
                    <select
                      value={form.method}
                      title="Méthode d'accès"
                      onChange={e => setForm(p => ({ ...p, method: e.target.value as Method }))}
                      className="w-full bg-[#111] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500/50"
                    >
                      <option value="csv_public">🔓 CSV Public</option>
                      <option value="sheets_api_v4">🔑 API v4 (Privé)</option>
                    </select>
                  </Field>
                </div>

                {/* URL / Config selon méthode */}
                {form.method === 'csv_public' ? (
                  <Field
                    label="Lien Google Sheets"
                    hint="Fichier > Partager > Publier sur le web > CSV"
                    required
                  >
                    <input
                      type="url"
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      value={form.csvUrl}
                      onChange={e => setForm(p => ({ ...p, csvUrl: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500/50 font-mono text-xs"
                    />
                  </Field>
                ) : (
                  <Field
                    label="ID du Spreadsheet"
                    hint="Extrait de l'URL : spreadsheets/d/→ ICI ←/edit"
                    required
                  >
                    <input
                      type="text"
                      placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
                      value={form.spreadsheetId}
                      onChange={e => setForm(p => ({ ...p, spreadsheetId: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500/50 font-mono text-xs"
                    />
                  </Field>
                )}

                {/* Nom de l'onglet */}
                <Field label="Nom de l'onglet (optionnel)" hint="Laissez vide pour le premier onglet">
                  <input
                    type="text"
                    title="Nom de l'onglet"
                    placeholder="Feuille1, Véhicules, RH 2026..."
                    value={form.sheetName}
                    onChange={e => setForm(p => ({ ...p, sheetName: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500/50"
                  />
                </Field>

                {/* Sync automatique */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div>
                    <p className="text-sm font-medium text-white">Synchronisation automatique</p>
                    <p className="text-xs text-gray-400 mt-0.5">Mettre à jour les données régulièrement</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {form.autoSync && (
                      <select
                        value={form.syncIntervalMin}
                        onChange={e => setForm(p => ({ ...p, syncIntervalMin: parseInt(e.target.value) }))}
                        className="bg-[#111] border border-white/10 text-white text-xs rounded-lg px-2 py-1"
                      >
                        <option value={15}>15 min</option>
                        <option value={30}>30 min</option>
                        <option value={60}>1h</option>
                        <option value={360}>6h</option>
                        <option value={1440}>24h</option>
                      </select>
                    )}
                    <button
                      onClick={() => setForm(p => ({ ...p, autoSync: !p.autoSync }))}
                      title="Activer/Désactiver la synchronisation automatique"
                      className={`relative w-12 h-6 rounded-full transition-colors ${form.autoSync ? 'bg-green-600' : 'bg-white/20'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${form.autoSync ? 'translate-x-7' : 'translate-x-1'}`}/>
                    </button>
                  </div>
                </div>

                {/* Résultat du test */}
                {testResult && <TestResultCard result={testResult} />}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleTest}
                    disabled={testing || (!form.csvUrl && !form.spreadsheetId)}
                    className="flex-1 py-2.5 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {testing ? '⏳ Test en cours…' : '🧪 Tester la connexion'}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!form.name || (!form.csvUrl && !form.spreadsheetId)}
                    className="flex-1 py-2.5 text-sm bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
                  >
                    {editSource ? '💾 Mettre à jour' : '✅ Connecter'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Sous-composants
// ─────────────────────────────────────────────
function SourceCard({ source, syncing, onSync, onEdit, onDelete }: {
  source:   DataSource;
  syncing:  boolean;
  onSync:   () => void;
  onEdit:   () => void;
  onDelete: () => void;
}) {
  const mod    = MODULE_LABELS[source.module];
  const status = STATUS_CONFIG[source.lastSyncStatus];

  return (
    <div className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/[0.07] border border-white/10 rounded-xl transition-colors">
      <span className="text-2xl">{mod.icon}</span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-white">{source.name}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${mod.color}`}>{mod.label}</span>
          {!source.isActive && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">Inactif</span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className={`flex items-center gap-1.5 text-xs ${status.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}/>
            {status.label}
          </span>
          {source.lastSyncCount !== undefined && (
            <span className="text-xs text-gray-500">{source.lastSyncCount} lignes</span>
          )}
          {source.lastSyncAt && (
            <span className="text-xs text-gray-600">
              {new Date(source.lastSyncAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {source.autoSync && (
            <span className="text-xs text-gray-500">🔄 {source.syncIntervalMin}min</span>
          )}
        </div>
        {source.lastSyncError && (
          <p className="text-xs text-red-400 mt-1 truncate">{source.lastSyncError}</p>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onSync}
          disabled={syncing || source.lastSyncStatus === 'syncing'}
          title="Synchroniser maintenant"
          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-40 text-sm"
        >
          {syncing || source.lastSyncStatus === 'syncing' ? '⏳' : '🔄'}
        </button>
        <button onClick={onEdit}   title="Modifier" className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-sm">✏️</button>
        <button onClick={onDelete} title="Supprimer" className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm">🗑️</button>
      </div>
    </div>
  );
}

function TestResultCard({ result }: { result: TestResult }) {
  return (
    <div className={`rounded-xl border p-4 ${result.ok ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
      <p className={`text-sm font-medium mb-2 ${result.ok ? 'text-green-400' : 'text-red-400'}`}>
        {result.ok ? `✅ Connexion réussie — ${result.rowCount} lignes détectées` : `❌ Échec de connexion`}
      </p>
      {result.error && <p className="text-xs text-red-300 mb-2">{result.error}</p>}
      {result.ok && result.headers.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-1">Colonnes détectées :</p>
          <div className="flex flex-wrap gap-1">
            {result.headers.map(h => (
              <span key={h} className="text-[10px] px-1.5 py-0.5 bg-white/10 text-gray-300 rounded">{h}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, hint, required, children }: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="text-center py-16 px-8">
      <div className="text-5xl mb-4">📊</div>
      <h3 className="text-white font-medium mb-2">Aucune source de données configurée</h3>
      <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
        Connectez un Google Sheet pour alimenter les modules Fleet, RH, Planning et Dashboard avec vos vraies données.
      </p>
      <button
        onClick={onAdd}
        className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium transition-colors"
      >
        + Connecter mon premier Sheet
      </button>
    </div>
  );
}
