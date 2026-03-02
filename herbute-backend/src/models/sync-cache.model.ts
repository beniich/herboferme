/**
 * models/sync-cache.model.ts — Cache des lignes importées depuis Sheets
 *
 * Chaque document représente UNE ligne d'un Google Sheet importée.
 * Le frontend lit toujours depuis ce cache → le backend est découplé
 * de Google Sheets en runtime (pas de dépendance directe pendant la nav).
 *
 * Structure :
 *   dataSourceId → identifie la source
 *   rowIndex     → numéro de ligne dans le sheet (pour le déduplication)
 *   data         → objet JSON normalisé (après mapping des colonnes)
 *   module       → copie dénormalisée pour requêtes rapides
 *   farmId       → isolation par ferme
 */

import mongoose, { Schema, Document } from 'mongoose';
import type { DataSourceModule } from './datasource.model.js';

export interface ISyncCache extends Document {
  dataSourceId: mongoose.Types.ObjectId;
  farmId:       mongoose.Types.ObjectId;
  module:       DataSourceModule;
  rowIndex:     number;
  rawData:      Record<string, string>;  // Données brutes (avant transform)
  data:         Record<string, unknown>; // Données normalisées (après mapping)
  importedAt:   Date;
}

const SyncCacheSchema = new Schema<ISyncCache>({
  dataSourceId: { type: Schema.Types.ObjectId, ref: 'DataSource', required: true, index: true },
  farmId:       { type: Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
  module:       { type: String, enum: ['fleet', 'hr', 'planning', 'dashboard', 'glpi'], required: true },
  rowIndex:     { type: Number, required: true },
  rawData:      { type: Schema.Types.Mixed, default: {} },
  data:         { type: Schema.Types.Mixed, default: {} },
  importedAt:   { type: Date, default: Date.now },
}, {
  // TTL : suppression automatique des caches après 7 jours sans sync
  expireAfterSeconds: 7 * 24 * 60 * 60,
});

SyncCacheSchema.index({ importedAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });
// Unicité : un seul enregistrement par (source, ligne)
SyncCacheSchema.index({ dataSourceId: 1, rowIndex: 1 }, { unique: true });

export const SyncCache = mongoose.model<ISyncCache>('SyncCache', SyncCacheSchema);
