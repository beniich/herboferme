/**
 * ═══════════════════════════════════════════════════════════════
 * services/sync.service.ts — Orchestrateur de synchronisation
 * ═══════════════════════════════════════════════════════════════
 *
 * Pipeline d'une synchronisation :
 *   1. Charger la DataSource depuis MongoDB
 *   2. Marquer status → 'syncing'
 *   3. Appeler sheets.service → fetchSheetData()
 *   4. Appliquer les mappers (mapRowByModule)
 *   5. Upsert dans SyncCache (remplacer les anciennes lignes)
 *   6. Mettre à jour lastSyncAt, status, rowCount
 *   7. (Optionnel) Propager vers les vrais modèles Fleet/HR/Planning
 */

import { DataSource } from '../models/datasource.model.js';
import { SyncCache } from '../models/sync-cache.model.js';
import { fetchSheetData } from './sheets.service.js';
import { mapRowByModule } from '../mappers/index.js';

export interface SyncResult {
  dataSourceId: string;
  module:       string;
  rowCount:     number;
  duration:     number;   // ms
  status:       'success' | 'error';
  error?:       string;
}

// ─────────────────────────────────────────────
// Synchroniser UNE source de données
// ─────────────────────────────────────────────
export const syncDataSource = async (dataSourceId: string): Promise<SyncResult> => {
  const startTime = Date.now();

  const source = await DataSource.findById(dataSourceId);
  if (!source) {
    throw new Error(`DataSource ${dataSourceId} introuvable.`);
  }

  // Marquer comme en cours
  await DataSource.findByIdAndUpdate(dataSourceId, {
    lastSyncStatus: 'syncing',
  });

  try {
    // ── 1. Fetch depuis Google Sheets ──────────
    const { rows } = await fetchSheetData(source);

    // ── 2. Mapper les lignes ──────────────────
    const mappedRows = rows.map((row, index) => ({
      rowIndex:     index,
      rawData:      row,
      data:         mapRowByModule(source.module, row, source.columnMappings),
    }));

    // ── 3. Supprimer les anciennes lignes en cache
    //       puis insérer les nouvelles (remplace complètement)
    await SyncCache.deleteMany({ dataSourceId: source._id });

    if (mappedRows.length > 0) {
      await SyncCache.insertMany(
        mappedRows.map(({ rowIndex, rawData, data }) => ({
          dataSourceId: source._id,
          farmId:       source.farmId,
          module:       source.module,
          rowIndex,
          rawData,
          data,
          importedAt:   new Date(),
        })),
        { ordered: false } // Continue même si une ligne échoue
      );
    }

    // ── 4. Mettre à jour le statut ─────────────
    const duration = Date.now() - startTime;
    await DataSource.findByIdAndUpdate(dataSourceId, {
      lastSyncAt:     new Date(),
      lastSyncStatus: 'success',
      lastSyncCount:  mappedRows.length,
      lastSyncError:  undefined,
    });

    console.log(
      `✅ [Sync] ${source.name} (${source.module}) — ` +
      `${mappedRows.length} lignes importées en ${duration}ms`
    );

    return {
      dataSourceId: String(source._id),
      module:       source.module,
      rowCount:     mappedRows.length,
      duration,
      status:       'success',
    };

  } catch (err: any) {
    const duration = Date.now() - startTime;

    await DataSource.findByIdAndUpdate(dataSourceId, {
      lastSyncStatus: 'error',
      lastSyncError:  err.message,
    });

    console.error(`❌ [Sync] ${source.name}: ${err.message}`);

    return {
      dataSourceId: String(source._id),
      module:       source.module,
      rowCount:     0,
      duration,
      status:       'error',
      error:        err.message,
    };
  }
};

// ─────────────────────────────────────────────
// Synchroniser TOUTES les sources actives d'une ferme
// ─────────────────────────────────────────────
export const syncAllForFarm = async (farmId: string): Promise<SyncResult[]> => {
  const sources = await DataSource.find({
    farmId,
    isActive: true,
    lastSyncStatus: { $ne: 'syncing' }, // Ne pas re-lancer si déjà en cours
  });

  const results = await Promise.allSettled(
    sources.map(s => syncDataSource(String(s._id)))
  );

  return results.map((r, i) =>
    r.status === 'fulfilled'
      ? r.value
      : {
          dataSourceId: String(sources[i]._id),
          module:       sources[i].module,
          rowCount:     0,
          duration:     0,
          status:       'error' as const,
          error:        (r as PromiseRejectedResult).reason?.message,
        }
  );
};

// ─────────────────────────────────────────────
// Récupérer les données en cache pour un module
// C'est ce qu'appelle le frontend (via les routes API)
// ─────────────────────────────────────────────
export const getCachedData = async (
  farmId:  string,
  module:  string,
  page    = 1,
  limit   = 100,
  search?: string,
): Promise<{
  data:     Record<string, unknown>[];
  total:    number;
  page:     number;
  pages:    number;
  sources:  { id: string; name: string; lastSyncAt?: Date; status: string }[];
}> => {
  const filter: Record<string, unknown> = { farmId, module };

  // Recherche full-text dans les données JSON (simple, pas Elasticsearch)
  const skip = (page - 1) * limit;

  const [total, rows, sources] = await Promise.all([
    SyncCache.countDocuments(filter),
    SyncCache.find(filter).skip(skip).limit(limit).lean(),
    DataSource.find({ farmId, module, isActive: true })
      .select('name lastSyncAt lastSyncStatus lastSyncCount')
      .lean(),
  ]);

  let data = rows.map(r => ({ _cacheId: r._id, ...r.data }));

  // Filtrage texte côté app si recherche (pour petits volumes <10k lignes)
  if (search && search.trim()) {
    const q = search.toLowerCase();
    data = data.filter(item =>
      JSON.stringify(item).toLowerCase().includes(q)
    );
  }

  return {
    data,
    total,
    page,
    pages: Math.ceil(total / limit),
    sources: sources.map(s => ({
      id:         String(s._id),
      name:       s.name,
      lastSyncAt: s.lastSyncAt,
      status:     s.lastSyncStatus,
    })),
  };
};
