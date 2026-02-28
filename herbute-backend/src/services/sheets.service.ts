/**
 * ═══════════════════════════════════════════════════════════════
 * services/sheets.service.ts — Connecteur Google Sheets
 * ═══════════════════════════════════════════════════════════════
 *
 * Gère deux modes d'accès selon la configuration de la DataSource :
 *
 * Mode 1 : CSV PUBLIC (csv_public)
 *   → Le sheet est publié (Fichier > Partager > Publier sur le web > CSV)
 *   → URL format : https://docs.google.com/spreadsheets/d/{ID}/gviz/tq?tqx=out:csv&sheet={SHEET}
 *   → Aucune auth requise, lecture seule
 *   → Idéal pour : données de référence, plannings partagés
 *
 * Mode 2 : SHEETS API v4 (sheets_api_v4)
 *   → Authentification via Service Account Google (fichier JSON credentials)
 *   → Accès aux sheets privés
 *   → Idéal pour : données sensibles (salaires, données perso RH)
 *   → Requires: GOOGLE_SERVICE_ACCOUNT_KEY_PATH ou GOOGLE_SERVICE_ACCOUNT_JSON en .env
 */

import axios from 'axios';
import { parse as parseCsv } from 'csv-parse/sync';
import type { IDataSource } from '../models/datasource.model';

// ─────────────────────────────────────────────
// Type de retour : tableau de lignes normalisées
// Chaque ligne est un objet { colonneA: valeur, colonneB: valeur... }
// ─────────────────────────────────────────────
export type SheetRow = Record<string, string>;

export interface FetchResult {
  rows:      SheetRow[];
  headers:   string[];
  fetchedAt: Date;
  rowCount:  number;
}

// ─────────────────────────────────────────────
// MODE 1 : Fetch CSV public
// ─────────────────────────────────────────────
const fetchCsvPublic = async (source: IDataSource): Promise<FetchResult> => {
  if (!source.csvUrl) {
    throw new Error('[Sheets CSV] csvUrl manquante dans la configuration.');
  }

  // Convertir les URLs "edit" ou "view" vers le format CSV direct
  const csvUrl = normalizeToCsvUrl(source.csvUrl, source.sheetName);

  const response = await axios.get<string>(csvUrl, {
    timeout: 15_000,
    headers: { 'Accept': 'text/csv, text/plain' },
    // Permettre les redirections Google
    maxRedirects: 5,
  });

  if (typeof response.data !== 'string' || response.data.trim().length === 0) {
    throw new Error('[Sheets CSV] Réponse vide — vérifiez que le sheet est bien publié en mode CSV.');
  }

  const allRows: string[][] = parseCsv(response.data, {
    skip_empty_lines: true,
    trim:             true,
    relax_quotes:     true,
  });

  if (allRows.length === 0) {
    return { rows: [], headers: [], fetchedAt: new Date(), rowCount: 0 };
  }

  const headerIndex = (source.headerRow ?? 1) - 1;
  const headers     = allRows[headerIndex]?.map(h => h.trim()) ?? [];
  const dataRows    = allRows.slice(headerIndex + 1);

  const rows: SheetRow[] = dataRows
    .filter(row => row.some(cell => cell.trim() !== '')) // Ignorer les lignes vides
    .map(row => {
      const obj: SheetRow = {};
      headers.forEach((header, i) => {
        if (header) obj[header] = row[i]?.trim() ?? '';
      });
      return obj;
    });

  return { rows, headers, fetchedAt: new Date(), rowCount: rows.length };
};

// ─────────────────────────────────────────────
// MODE 2 : Google Sheets API v4
// Utilise googleapis (npm install googleapis)
// ─────────────────────────────────────────────
const fetchSheetsApiV4 = async (source: IDataSource): Promise<FetchResult> => {
  if (!source.spreadsheetId) {
    throw new Error('[Sheets API] spreadsheetId manquant dans la configuration.');
  }

  // Import dynamique pour éviter de charger googleapis si non utilisé
  const { google } = await import('googleapis');

  // Charger les credentials du Service Account depuis l'env
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;

  if (!serviceAccountJson && !serviceAccountPath) {
    throw new Error(
      '[Sheets API] Credentials manquants.\n' +
      'Définissez GOOGLE_SERVICE_ACCOUNT_JSON ou GOOGLE_SERVICE_ACCOUNT_KEY_PATH dans .env'
    );
  }

  let credentials: Record<string, unknown>;
  if (serviceAccountJson) {
    credentials = JSON.parse(serviceAccountJson);
  } else {
    const fs = await import('fs');
    credentials = JSON.parse(fs.readFileSync(serviceAccountPath!, 'utf-8'));
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Construction de la plage : "NomOnglet!A1:Z1000" ou juste "A1:Z1000"
  const range = source.sheetName
    ? `${source.sheetName}!${source.range || 'A:Z'}`
    : (source.range || 'A:Z');

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: source.spreadsheetId,
    range,
    valueRenderOption:     'FORMATTED_VALUE',
    dateTimeRenderOption:  'FORMATTED_STRING',
  });

  const allValues = response.data.values ?? [];

  if (allValues.length === 0) {
    return { rows: [], headers: [], fetchedAt: new Date(), rowCount: 0 };
  }

  const headerIndex = (source.headerRow ?? 1) - 1;
  const headers     = (allValues[headerIndex] ?? []).map((h: unknown) => String(h).trim());
  const dataValues  = allValues.slice(headerIndex + 1);

  const rows: SheetRow[] = dataValues
    .filter((row: unknown[]) => row.some((cell: unknown) => String(cell).trim() !== ''))
    .map((row: unknown[]) => {
      const obj: SheetRow = {};
      headers.forEach((header, i) => {
        if (header) obj[header] = String(row[i] ?? '').trim();
      });
      return obj;
    });

  return { rows, headers, fetchedAt: new Date(), rowCount: rows.length };
};

// ─────────────────────────────────────────────
// Dispatcher principal
// ─────────────────────────────────────────────
export const fetchSheetData = async (source: IDataSource): Promise<FetchResult> => {
  switch (source.method) {
    case 'csv_public':
      return fetchCsvPublic(source);
    case 'sheets_api_v4':
      return fetchSheetsApiV4(source);
    default:
      throw new Error(`[Sheets] Méthode inconnue: ${source.method}`);
  }
};

// ─────────────────────────────────────────────
// Utilitaire : normaliser une URL Google Sheets vers CSV direct
//
// Accepte tous ces formats :
//   https://docs.google.com/spreadsheets/d/ID/edit#gid=0
//   https://docs.google.com/spreadsheets/d/ID/view
//   https://docs.google.com/spreadsheets/d/ID/gviz/tq?tqx=out:csv
//   https://docs.google.com/spreadsheets/d/ID              ← lien direct
// ─────────────────────────────────────────────
export const normalizeToCsvUrl = (url: string, sheetName?: string): string => {
  // Extraire l'ID du spreadsheet
  const idMatch = url.match(/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (!idMatch) {
    // Si c'est déjà une URL CSV directe, la retourner telle quelle
    if (url.includes('.csv') || url.includes('tqx=out:csv')) return url;
    throw new Error(
      `[Sheets] URL invalide: "${url}"\n` +
      'Format attendu: https://docs.google.com/spreadsheets/d/VOTRE_ID/...'
    );
  }

  const spreadsheetId = idMatch[1];
  const sheetParam    = sheetName ? `&sheet=${encodeURIComponent(sheetName)}` : '';

  // Format gviz/tq — le plus fiable pour les sheets publics
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv${sheetParam}`;
};

// ─────────────────────────────────────────────
// Validation : tester si une source est accessible
// Retourne { ok, rowCount, headers, error }
// ─────────────────────────────────────────────
export const testDataSource = async (source: IDataSource): Promise<{
  ok:       boolean;
  rowCount: number;
  headers:  string[];
  preview:  SheetRow[];   // 3 premières lignes pour aperçu
  error?:   string;
}> => {
  try {
    const result = await fetchSheetData(source);
    return {
      ok:       true,
      rowCount: result.rowCount,
      headers:  result.headers,
      preview:  result.rows.slice(0, 3),
    };
  } catch (err: any) {
    return {
      ok:       false,
      rowCount: 0,
      headers:  [],
      preview:  [],
      error:    err.message,
    };
  }
};
