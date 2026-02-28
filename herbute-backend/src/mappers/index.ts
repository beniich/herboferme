/**
 * ═══════════════════════════════════════════════════════════════
 * mappers/index.ts — Transformateurs de données Sheets → Herbute
 * ═══════════════════════════════════════════════════════════════
 *
 * Chaque mapper prend une ligne brute Google Sheets (clé=colonne, valeur=string)
 * et la transforme en objet typé du modèle Herbute.
 *
 * Les mappers respectent les columnMappings configurés par l'utilisateur
 * dans la page Settings. Si aucun mapping n'est défini, ils tentent une
 * détection automatique par similarité de nom de colonne.
 */

import type { ColumnMapping } from '../models/datasource.model.js';
import type { SheetRow } from '../services/sheets.service.js';

// ─────────────────────────────────────────────
// Utilitaires de transformation
// ─────────────────────────────────────────────
const applyTransform = (value: string, transform?: string): unknown => {
  if (!value || value.trim() === '') return null;
  switch (transform) {
    case 'uppercase':  return value.toUpperCase().trim();
    case 'lowercase':  return value.toLowerCase().trim();
    case 'number':     return parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    case 'boolean':    return ['oui', 'yes', 'true', '1', 'vrai'].includes(value.toLowerCase().trim());
    case 'date_iso': {
      const parts = value.split(/[/\-.]/);
      if (parts.length === 3) {
        if (parseInt(parts[0]) > 12) {
          return new Date(`${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`).toISOString();
        }
        return new Date(value).toISOString();
      }
      return value;
    }
    default: return value.trim();
  }
};

const applyMappings = (
  row:      SheetRow,
  mappings: ColumnMapping[]
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const mapping of mappings) {
    const rawValue = row[mapping.sheetColumn];
    if (rawValue !== undefined) {
      result[mapping.targetField] = applyTransform(rawValue, mapping.transform);
    }
  }
  return result;
};

const normalize = (s: string) =>
  s.toLowerCase()
   .normalize('NFD')
   .replace(/[\u0300-\u036f]/g, '')
   .replace(/[\s_\-.]/g, '');

const autoMap = (row: SheetRow, fieldAliases: Record<string, string[]>): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  const rowKeys = Object.keys(row);

  for (const [targetField, aliases] of Object.entries(fieldAliases)) {
    const normalizedAliases = aliases.map(normalize);
    const matchedKey = rowKeys.find(k => normalizedAliases.includes(normalize(k)));
    if (matchedKey) {
      result[targetField] = row[matchedKey]?.trim() || null;
    }
  }
  return result;
};

// ═══════════════════════════════════════════════════════════════
// MAPPER FLEET
// ═══════════════════════════════════════════════════════════════
const FLEET_ALIASES: Record<string, string[]> = {
  immatriculation: ['immatriculation', 'plaque', 'matricule', 'registration'],
  marque:          ['marque', 'brand', 'fabricant'],
  modele:          ['modele', 'model', 'type vehicule'],
  type:            ['type', 'categorie'],
  annee:           ['annee', 'year'],
  kilometrage:     ['kilometrage', 'km', 'odometer'],
  statut:          ['statut', 'status', 'etat'],
  prochaineMaintenance: ['prochaine maintenance', 'next maintenance'],
};

export const mapFleetRow = (row: SheetRow, mappings: ColumnMapping[]): Record<string, unknown> => {
  const base = mappings.length > 0 ? applyMappings(row, mappings) : autoMap(row, FLEET_ALIASES);
  if (base.type) {
    const t = String(base.type).toLowerCase();
    if (t.includes('tracteur')) base.type = 'tracteur';
    else if (t.includes('camion')) base.type = 'camion';
    else if (t.includes('utilitaire')) base.type = 'utilitaire';
    else base.type = 'autre';
  }
  if (base.statut) {
    const s = String(base.statut).toLowerCase();
    if (s.includes('actif')) base.statut = 'actif';
    else if (s.includes('maintenance')) base.statut = 'en_maintenance';
    else base.statut = 'hors_service';
  }
  return base;
};

// ═══════════════════════════════════════════════════════════════
// MAPPER HR
// ═══════════════════════════════════════════════════════════════
const HR_STAFF_ALIASES: Record<string, string[]> = {
  nom:          ['nom', 'name'],
  prenom:       ['prenom', 'first name'],
  poste:        ['poste', 'position'],
  secteur:      ['secteur', 'department'],
  typeContrat:  ['type contrat', 'contrat'],
  salaireBase:  ['salaire', 'salary'],
  dateEmbauche: ['date embauche', 'hire date'],
};

export const mapHrStaffRow = (row: SheetRow, mappings: ColumnMapping[]): Record<string, unknown> => {
  const base = mappings.length > 0 ? applyMappings(row, mappings) : autoMap(row, HR_STAFF_ALIASES);
  if (base.typeContrat) {
    const t = String(base.typeContrat).toLowerCase();
    if (t.includes('cdi')) base.typeContrat = 'cdi';
    else if (t.includes('cdd')) base.typeContrat = 'cdd';
    else if (t.includes('saisonnier')) base.typeContrat = 'saisonnier';
    else base.typeContrat = 'interim';
  }
  return base;
};

// ═══════════════════════════════════════════════════════════════
// MAPPER PLANNING
// ═══════════════════════════════════════════════════════════════
const PLANNING_ALIASES: Record<string, string[]> = {
  titre:        ['titre', 'title'],
  dateDebut:    ['date debut', 'start date'],
  dateFin:      ['date fin', 'end date'],
  responsable:  ['responsable', 'assigned to'],
};

export const mapPlanningRow = (row: SheetRow, mappings: ColumnMapping[]): Record<string, unknown> => {
  const base = mappings.length > 0 ? applyMappings(row, mappings) : autoMap(row, PLANNING_ALIASES);
  return base;
};

// ═══════════════════════════════════════════════════════════════
// MAPPER DASHBOARD
// ═══════════════════════════════════════════════════════════════
const DASHBOARD_ALIASES: Record<string, string[]> = {
  indicateur:   ['indicateur', 'kpi'],
  valeur:       ['valeur', 'value'],
  unite:        ['unite', 'unit'],
};

export const mapDashboardRow = (row: SheetRow, mappings: ColumnMapping[]): Record<string, unknown> => {
  const base = mappings.length > 0 ? applyMappings(row, mappings) : autoMap(row, DASHBOARD_ALIASES);
  return base;
};

// ─────────────────────────────────────────────
// Dispatcher principal par module
// ─────────────────────────────────────────────
export const mapRowByModule = (
  module:   string,
  row:      SheetRow,
  mappings: ColumnMapping[]
): Record<string, unknown> => {
  switch (module) {
    case 'fleet':     return mapFleetRow(row, mappings);
    case 'hr':        return mapHrStaffRow(row, mappings);
    case 'planning':  return mapPlanningRow(row, mappings);
    case 'dashboard': return mapDashboardRow(row, mappings);
    default:
      return Object.fromEntries(Object.entries(row).map(([k, v]) => [k, v]));
  }
};
