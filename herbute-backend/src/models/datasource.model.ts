/**
 * ═══════════════════════════════════════════════════════════════
 * models/datasource.model.ts — Configuration des sources de données
 * ═══════════════════════════════════════════════════════════════
 *
 * Chaque "DataSource" représente un lien entre :
 *   - Un module Herbute (fleet, hr, planning, dashboard)
 *   - Une feuille Google Sheets (publique CSV ou API v4)
 *
 * Le backend stocke la config, effectue les syncs,
 * et met en cache la donnée dans MongoDB.
 * Le frontend ne touche jamais Google Sheets directement.
 */

import mongoose, { Schema, Document } from 'mongoose';

export type DataSourceModule = 'fleet' | 'hr' | 'planning' | 'dashboard' | 'glpi';
export type DataSourceMethod = 'csv_public' | 'sheets_api_v4';
export type SyncStatus       = 'idle' | 'syncing' | 'success' | 'error';

// ─────────────────────────────────────────────
// Mapping : quelle colonne Sheets → quel champ
// Ex: { sheetColumn: "Immatriculation", targetField: "immatriculation" }
// ─────────────────────────────────────────────
interface ColumnMapping {
  sheetColumn:  string;   // Nom exact de la colonne dans Google Sheets
  targetField:  string;   // Nom du champ dans le modèle Herbute
  transform?:   'uppercase' | 'lowercase' | 'date_iso' | 'number' | 'boolean';
}

export interface IDataSource extends Document {
  farmId:       mongoose.Types.ObjectId;
  name:         string;           // Label affiché dans Settings ("Flotte Principale")
  module:       DataSourceModule;
  method:       DataSourceMethod;

  // ── Config CSV public ────────────────────────
  csvUrl?:      string;           // URL directe du CSV publié

  // ── Config Sheets API v4 ────────────────────
  spreadsheetId?: string;         // ID extrait de l'URL Sheets
  sheetName?:     string;         // Nom de l'onglet (ex: "Véhicules")
  range?:         string;         // Plage optionnelle (ex: "A1:Z1000")
  serviceAccountEmail?: string;   // Email du compte de service

  // ── Mapping des colonnes ─────────────────────
  columnMappings: ColumnMapping[];
  headerRow:      number;         // Numéro de la ligne d'en-tête (défaut: 1)

  // ── Synchronisation ──────────────────────────
  autoSync:       boolean;
  syncIntervalMin: number;        // Fréquence de sync automatique (minutes)
  lastSyncAt?:    Date;
  lastSyncStatus: SyncStatus;
  lastSyncError?: string;
  lastSyncCount?: number;         // Nombre de lignes importées au dernier sync

  // ── État ─────────────────────────────────────
  isActive:       boolean;
  createdBy:      mongoose.Types.ObjectId;
  createdAt:      Date;
  updatedAt:      Date;
}

const ColumnMappingSchema = new Schema<ColumnMapping>({
  sheetColumn:  { type: String, required: true },
  targetField:  { type: String, required: true },
  transform:    {
    type: String,
    enum: ['uppercase', 'lowercase', 'date_iso', 'number', 'boolean'],
  },
}, { _id: false });

const DataSourceSchema = new Schema<IDataSource>({
  farmId:       { type: Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
  name:         { type: String, required: true, trim: true, maxlength: 100 },
  module: {
    type: String,
    enum: ['fleet', 'hr', 'planning', 'dashboard', 'glpi'],
    required: true,
    index: true,
  },
  method: {
    type: String,
    enum: ['csv_public', 'sheets_api_v4'],
    required: true,
  },

  // CSV
  csvUrl:       { type: String },

  // API v4
  spreadsheetId:        { type: String },
  sheetName:            { type: String },
  range:                { type: String, default: 'A:Z' },
  serviceAccountEmail:  { type: String },

  // Mapping
  columnMappings: { type: [ColumnMappingSchema], default: [] },
  headerRow:      { type: Number, default: 1 },

  // Sync
  autoSync:        { type: Boolean, default: false },
  syncIntervalMin: { type: Number, default: 60, min: 5 },
  lastSyncAt:      { type: Date },
  lastSyncStatus:  { type: String, enum: ['idle', 'syncing', 'success', 'error'], default: 'idle' },
  lastSyncError:   { type: String },
  lastSyncCount:   { type: Number },

  // État
  isActive:  { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true,
});

// Index composé : une ferme ne peut avoir qu'une source active par module+onglet
DataSourceSchema.index({ farmId: 1, module: 1, isActive: 1 });

export const DataSource = mongoose.model<IDataSource>('DataSource', DataSourceSchema);
