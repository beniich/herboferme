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
 *
 * Exemple :
 *   Sheets row : { "Immatriculation": "AB-123-CD", "Type": "Tracteur", "KM": "45000" }
 *   Fleet row  : { immatriculation: "AB-123-CD", type: "tracteur", kilometrage: 45000 }
 */

import type { ColumnMapping } from '../models/datasource.model';
import type { SheetRow } from '../services/sheets.service';

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
      // Gère les formats courants : DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
      const parts = value.split(/[\/\-\.]/);
      if (parts.length === 3) {
        // Détection : si partie[0] > 12 → format DD/MM/YYYY
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

/**
 * Applique les columnMappings de l'utilisateur sur une ligne brute.
 * Si un champ n'a pas de mapping, on essaie de l'auto-détecter par nom.
 */
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

/**
 * Auto-mapping par correspondance de noms (insensible à la casse + accents)
 * Utilisé quand l'utilisateur n'a pas configuré de mapping manuel.
 */
const normalize = (s: string) =>
  s.toLowerCase()
   .normalize('NFD')
   .replace(/[\u0300-\u036f]/g, '')
   .replace(/[\s_\-\.]/g, '');

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
// MAPPER FLEET — Véhicules et maintenance
// ═══════════════════════════════════════════════════════════════
const FLEET_ALIASES: Record<string, string[]> = {
  immatriculation: ['immatriculation', 'plaque', 'matricule', 'registration', 'license plate'],
  marque:          ['marque', 'brand', 'fabricant', 'make'],
  modele:          ['modele', 'model', 'type vehicule', 'vehicle type'],
  type:            ['type', 'categorie', 'category'],
  annee:           ['annee', 'year', 'année fabrication', 'year of manufacture'],
  kilometrage:     ['kilometrage', 'km', 'kilométrage', 'odometer', 'mileage'],
  statut:          ['statut', 'status', 'etat', 'état'],
  prochaineMaintenance: ['prochaine maintenance', 'next maintenance', 'next service', 'prochain entretien'],
  responsable:     ['responsable', 'driver', 'chauffeur', 'conducteur'],
  notes:           ['notes', 'remarques', 'comments', 'observations'],
};

export const mapFleetRow = (row: SheetRow, mappings: ColumnMapping[]): Record<string, unknown> => {
  const base = mappings.length > 0
    ? applyMappings(row, mappings)
    : autoMap(row, FLEET_ALIASES);

  // Normaliser le type de véhicule vers les valeurs Herbute
  if (base.type) {
    const t = String(base.type).toLowerCase();
    if (t.includes('tracteur') || t.includes('tractor'))        base.type = 'tracteur';
    else if (t.includes('camion') || t.includes('truck'))       base.type = 'camion';
    else if (t.includes('utilitaire') || t.includes('utility')) base.type = 'utilitaire';
    else                                                          base.type = 'autre';
  }

  // Normaliser le statut
  if (base.statut) {
    const s = String(base.statut).toLowerCase();
    if (s.includes('actif') || s.includes('active') || s.includes('ok'))        base.statut = 'actif';
    else if (s.includes('maintenance') || s.includes('repair'))                  base.statut = 'en_maintenance';
    else if (s.includes('hors') || s.includes('hs') || s.includes('out'))        base.statut = 'hors_service';
  }

  if (base.kilometrage) base.kilometrage = Number(String(base.kilometrage).replace(/[^\d]/g, '')) || 0;
  if (base.annee)       base.annee       = parseInt(String(base.annee)) || null;

  return base;
};

// ═══════════════════════════════════════════════════════════════
// MAPPER HR — Staff, congés, roster
// ═══════════════════════════════════════════════════════════════
const HR_STAFF_ALIASES: Record<string, string[]> = {
  nom:          ['nom', 'name', 'last name', 'nom de famille'],
  prenom:       ['prenom', 'prénom', 'first name', 'firstname'],
  poste:        ['poste', 'position', 'fonction', 'job title', 'role'],
  secteur:      ['secteur', 'sector', 'department', 'département', 'service'],
  typeContrat:  ['type contrat', 'contrat', 'contract type', 'contract'],
  salaireBase:  ['salaire', 'salary', 'wage', 'salaire base', 'base salary', 'rémunération'],
  dateEmbauche: ['date embauche', 'hire date', 'start date', 'date début', 'date entrée'],
  telephone:    ['telephone', 'téléphone', 'phone', 'mobile', 'tel'],
  email:        ['email', 'e-mail', 'mail', 'courriel'],
  cin:          ['cin', 'id card', 'carte identite', 'identifiant'],
  statut:       ['statut', 'status', 'actif', 'active'],
};

export const mapHrStaffRow = (row: SheetRow, mappings: ColumnMapping[]): Record<string, unknown> => {
  const base = mappings.length > 0
    ? applyMappings(row, mappings)
    : autoMap(row, HR_STAFF_ALIASES);

  // Normaliser type de contrat
  if (base.typeContrat) {
    const t = String(base.typeContrat).toLowerCase();
    if (t.includes('cdi') || t.includes('permanent'))    base.typeContrat = 'cdi';
    else if (t.includes('cdd') || t.includes('fixed'))   base.typeContrat = 'cdd';
    else if (t.includes('saisonnier') || t.includes('seasonal')) base.typeContrat = 'saisonnier';
    else if (t.includes('interim') || t.includes('temp'))base.typeContrat = 'interim';
  }

  if (base.salaireBase) {
    base.salaireBase = parseFloat(String(base.salaireBase).replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
  }

  // Date embauche → ISO
  if (base.dateEmbauche) {
    try {
      const d = String(base.dateEmbauche);
      const parts = d.split(/[\/\-\.]/);
      if (parts.length === 3 && parseInt(parts[0]) <= 31) {
        base.dateEmbauche = new Date(`${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`).toISOString();
      }
    } catch { /* garder la valeur brute */ }
  }

  return base;
};

// ═══════════════════════════════════════════════════════════════
// MAPPER PLANNING — Interventions & schedules
// ═══════════════════════════════════════════════════════════════
const PLANNING_ALIASES: Record<string, string[]> = {
  titre:        ['titre', 'title', 'intitulé', 'intervention', 'task', 'tâche'],
  description:  ['description', 'details', 'détails', 'notes'],
  dateDebut:    ['date debut', 'start date', 'date début', 'date', 'début'],
  dateFin:      ['date fin', 'end date', 'fin', 'deadline', 'échéance'],
  responsable:  ['responsable', 'assigned to', 'assigné à', 'intervenant'],
  secteur:      ['secteur', 'zone', 'area', 'parcelle', 'field'],
  priorite:     ['priorite', 'priorité', 'priority', 'urgence'],
  statut:       ['statut', 'status', 'état', 'avancement'],
  type:         ['type', 'categorie', 'category', 'type intervention'],
};

export const mapPlanningRow = (row: SheetRow, mappings: ColumnMapping[]): Record<string, unknown> => {
  const base = mappings.length > 0
    ? applyMappings(row, mappings)
    : autoMap(row, PLANNING_ALIASES);

  // Normaliser priorité
  if (base.priorite) {
    const p = String(base.priorite).toLowerCase();
    if (p.includes('haute') || p.includes('high') || p.includes('urgent')) base.priorite = 'haute';
    else if (p.includes('basse') || p.includes('low'))                      base.priorite = 'basse';
    else                                                                      base.priorite = 'normale';
  }

  // Normaliser statut planning
  if (base.statut) {
    const s = String(base.statut).toLowerCase();
    if (s.includes('terminé') || s.includes('done') || s.includes('completed')) base.statut = 'termine';
    else if (s.includes('cours') || s.includes('progress') || s.includes('en cours')) base.statut = 'en_cours';
    else if (s.includes('annul'))  base.statut = 'annule';
    else                           base.statut = 'planifie';
  }

  return base;
};

// ═══════════════════════════════════════════════════════════════
// MAPPER DASHBOARD — KPIs et métriques
// ═══════════════════════════════════════════════════════════════
const DASHBOARD_ALIASES: Record<string, string[]> = {
  indicateur:   ['indicateur', 'kpi', 'metric', 'métrique', 'indicator'],
  valeur:       ['valeur', 'value', 'montant', 'amount', 'total'],
  unite:        ['unite', 'unité', 'unit'],
  periode:      ['periode', 'période', 'period', 'mois', 'month', 'date'],
  categorie:    ['categorie', 'catégorie', 'category', 'secteur', 'module'],
  objectif:     ['objectif', 'target', 'goal', 'cible'],
  variation:    ['variation', 'delta', 'evolution', 'évolution', 'change'],
};

export const mapDashboardRow = (row: SheetRow, mappings: ColumnMapping[]): Record<string, unknown> => {
  const base = mappings.length > 0
    ? applyMappings(row, mappings)
    : autoMap(row, DASHBOARD_ALIASES);

  if (base.valeur)   base.valeur   = parseFloat(String(base.valeur).replace(/[^\d.,\-]/g, '').replace(',', '.')) || 0;
  if (base.objectif) base.objectif = parseFloat(String(base.objectif).replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

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
      // Mapper générique : retourne les données brutes
      return Object.fromEntries(Object.entries(row).map(([k, v]) => [k, v]));
  }
};
