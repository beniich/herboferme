/**
 * ═══════════════════════════════════════════════════════════════
 * routes/datasource.routes.ts — API de gestion des sources de données
 * ═══════════════════════════════════════════════════════════════
 *
 * Endpoints :
 *   GET    /api/datasources              — Liste les sources de la ferme
 *   POST   /api/datasources              — Créer une nouvelle source
 *   GET    /api/datasources/:id          — Détail d'une source
 *   PUT    /api/datasources/:id          — Modifier une source
 *   DELETE /api/datasources/:id          — Supprimer une source
 *   POST   /api/datasources/:id/sync     — Déclencher une sync manuelle
 *   POST   /api/datasources/:id/test     — Tester la connexion (preview 3 lignes)
 *   GET    /api/datasources/:id/preview  — Aperçu des 10 premières lignes en cache
 *   GET    /api/data/:module             — Données réelles du module (remplace les mocks)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { DataSource } from '../models/datasource.model';
import { SyncCache } from '../models/sync-cache.model';
import { testDataSource, normalizeToCsvUrl } from '../services/sheets.service';
import { syncDataSource, syncAllForFarm, getCachedData } from '../services/sync.service';

const router = Router();
router.use(authenticate);

// ═══════════════════════════════════════════════════════
// GET /api/datasources
// Liste toutes les sources de la ferme de l'utilisateur
// ═══════════════════════════════════════════════════════
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sources = await DataSource.find({
      farmId:   req.user!.farmId,
    })
    .select('-serviceAccountEmail') // Ne pas exposer les credentials
    .sort({ module: 1, createdAt: -1 })
    .lean();

    res.json({
      data:  sources,
      total: sources.length,
    });
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════
// POST /api/datasources
// Créer une nouvelle source
// ═══════════════════════════════════════════════════════
router.post('/', authorize('admin', 'manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name, module, method,
      csvUrl, spreadsheetId, sheetName, range,
      columnMappings, headerRow,
      autoSync, syncIntervalMin,
    } = req.body;

    // Validation
    if (!name || !module || !method) {
      return res.status(400).json({ error: 'name, module et method sont obligatoires.' });
    }

    if (method === 'csv_public' && !csvUrl) {
      return res.status(400).json({ error: 'csvUrl obligatoire pour la méthode csv_public.' });
    }

    if (method === 'sheets_api_v4' && !spreadsheetId) {
      return res.status(400).json({ error: 'spreadsheetId obligatoire pour sheets_api_v4.' });
    }

    // Normaliser l'URL CSV si fournie
    let normalizedCsvUrl = csvUrl;
    if (csvUrl) {
      try {
        normalizedCsvUrl = normalizeToCsvUrl(csvUrl, sheetName);
      } catch (e: any) {
        return res.status(400).json({ error: e.message });
      }
    }

    const source = await DataSource.create({
      farmId:          req.user!.farmId,
      name:            name.trim(),
      module,
      method,
      csvUrl:          normalizedCsvUrl,
      spreadsheetId,
      sheetName,
      range:           range || 'A:Z',
      columnMappings:  columnMappings || [],
      headerRow:       headerRow || 1,
      autoSync:        autoSync ?? false,
      syncIntervalMin: syncIntervalMin || 60,
      createdBy:       req.user!.sub,
    });

    res.status(201).json({ data: source, message: 'Source créée avec succès.' });
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════
// GET /api/datasources/:id
// ═══════════════════════════════════════════════════════
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const source = await DataSource.findOne({
      _id:    req.params.id,
      farmId: req.user!.farmId,
    }).lean();

    if (!source) return res.status(404).json({ error: 'Source introuvable.' });

    res.json({ data: source });
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════
// PUT /api/datasources/:id
// ═══════════════════════════════════════════════════════
router.put('/:id', authorize('admin', 'manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const source = await DataSource.findOne({
      _id:    req.params.id,
      farmId: req.user!.farmId,
    });

    if (!source) return res.status(404).json({ error: 'Source introuvable.' });

    const allowed = [
      'name', 'csvUrl', 'spreadsheetId', 'sheetName', 'range',
      'columnMappings', 'headerRow', 'autoSync', 'syncIntervalMin', 'isActive',
    ];

    for (const field of allowed) {
      if (req.body[field] !== undefined) {
        (source as any)[field] = req.body[field];
      }
    }

    // Re-normaliser URL si modifiée
    if (req.body.csvUrl) {
      try {
        source.csvUrl = normalizeToCsvUrl(req.body.csvUrl, source.sheetName);
      } catch (e: any) {
        return res.status(400).json({ error: e.message });
      }
    }

    await source.save();
    res.json({ data: source, message: 'Source mise à jour.' });
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════
// DELETE /api/datasources/:id
// ═══════════════════════════════════════════════════════
router.delete('/:id', authorize('admin', 'manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const source = await DataSource.findOneAndDelete({
      _id:    req.params.id,
      farmId: req.user!.farmId,
    });

    if (!source) return res.status(404).json({ error: 'Source introuvable.' });

    // Supprimer le cache associé
    await SyncCache.deleteMany({ dataSourceId: req.params.id });

    res.json({ message: 'Source et cache supprimés.' });
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════
// POST /api/datasources/:id/test
// Tester la connexion et retourner un aperçu (3 lignes)
// ═══════════════════════════════════════════════════════
router.post('/:id/test', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const source = await DataSource.findOne({
      _id:    req.params.id,
      farmId: req.user!.farmId,
    });

    if (!source) return res.status(404).json({ error: 'Source introuvable.' });

    const result = await testDataSource(source);

    res.json({
      ok:       result.ok,
      rowCount: result.rowCount,
      headers:  result.headers,
      preview:  result.preview,
      error:    result.error,
    });
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════
// POST /api/datasources/:id/sync
// Déclencher une synchronisation manuelle
// ═══════════════════════════════════════════════════════
router.post('/:id/sync', authorize('admin', 'manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const source = await DataSource.findOne({
      _id:    req.params.id,
      farmId: req.user!.farmId,
    });

    if (!source) return res.status(404).json({ error: 'Source introuvable.' });

    // Sync asynchrone — répondre immédiatement avec 202 Accepted
    // Le frontend poll /api/datasources/:id pour voir l'état
    res.status(202).json({ message: 'Synchronisation lancée.', dataSourceId: req.params.id });

    // Lancer en arrière-plan
    syncDataSource(req.params.id).catch(err =>
      console.error(`[Sync manuel] ${req.params.id}:`, err.message)
    );
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════
// POST /api/datasources/sync-all
// Synchroniser toutes les sources de la ferme
// ═══════════════════════════════════════════════════════
router.post('/sync-all', authorize('admin', 'manager'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(202).json({ message: 'Synchronisation globale lancée.' });

    syncAllForFarm(req.user!.farmId!).catch(err =>
      console.error('[Sync All]', err.message)
    );
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════
// GET /api/datasources/:id/preview
// Aperçu des 10 premières lignes en cache
// ═══════════════════════════════════════════════════════
router.get('/:id/preview', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const source = await DataSource.findOne({
      _id:    req.params.id,
      farmId: req.user!.farmId,
    });

    if (!source) return res.status(404).json({ error: 'Source introuvable.' });

    const rows = await SyncCache.find({ dataSourceId: req.params.id })
      .sort({ rowIndex: 1 })
      .limit(10)
      .lean();

    res.json({
      data:      rows.map(r => r.data),
      rawSample: rows.slice(0, 2).map(r => r.rawData),
      count:     rows.length,
    });
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════
// GET /api/data/:module
// ✅ ENDPOINT PRINCIPAL — Remplace les mocks du frontend
//
// Le frontend appelle cet endpoint exactement comme avant
// sauf qu'il reçoit maintenant de vraies données depuis Sheets.
//
// Query params :
//   page    (défaut: 1)
//   limit   (défaut: 100)
//   search  (recherche texte dans les données)
// ═══════════════════════════════════════════════════════
router.get('/data/:module', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { module } = req.params;
    const page   = parseInt(String(req.query.page  || '1'));
    const limit  = parseInt(String(req.query.limit || '100'));
    const search = String(req.query.search || '');

    const result = await getCachedData(
      req.user!.farmId!,
      module,
      page,
      limit,
      search,
    );

    // Si aucune donnée en cache → indiquer qu'une config est nécessaire
    if (result.sources.length === 0) {
      return res.json({
        data:     [],
        total:    0,
        page:     1,
        pages:    0,
        sources:  [],
        _notice:  `Aucune source configurée pour le module "${module}". Configurez-en une dans Paramètres > Sources de données.`,
      });
    }

    res.json(result);
  } catch (err) { next(err); }
});

export default router;
