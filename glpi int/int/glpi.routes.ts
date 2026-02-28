/**
 * routes/glpi.routes.ts — Proxy API GLPI 11
 * Toutes les requêtes vers GLPI passent par ce proxy backend.
 * Le token GLPI n'est jamais exposé au frontend.
 */

import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { authenticate } from '../middleware/authenticate';

const router = Router();
router.use(authenticate);

const GLPI_BASE  = process.env.GLPI_URL    || 'http://localhost/glpi/apirest.php';
const GLPI_TOKEN = process.env.GLPI_APP_TOKEN;
const GLPI_USER  = process.env.GLPI_USER_TOKEN;

// ─────────────────────────────────────────────
// Client GLPI authentifié
// ─────────────────────────────────────────────
let glpiSessionToken: string | null = null;
let sessionExpires:   Date          = new Date(0);

const getGlpiSession = async (): Promise<string> => {
  if (glpiSessionToken && sessionExpires > new Date()) return glpiSessionToken;

  const { data } = await axios.get(`${GLPI_BASE}/initSession`, {
    headers: {
      'App-Token':        GLPI_TOKEN,
      'Authorization':    `user_token ${GLPI_USER}`,
      'Content-Type':     'application/json',
    },
  });

  glpiSessionToken = data.session_token;
  sessionExpires   = new Date(Date.now() + 60 * 60 * 1000); // 1h
  return glpiSessionToken!;
};

const glpiRequest = async (method: string, path: string, body?: unknown) => {
  const session = await getGlpiSession();

  const { data } = await axios({
    method,
    url:  `${GLPI_BASE}${path}`,
    data: body,
    headers: {
      'App-Token':     GLPI_TOKEN,
      'Session-Token': session,
      'Content-Type':  'application/json',
    },
  });

  return data;
};

// ═══════════════════════════════════════════════════════
// GET /api/glpi/tickets — Liste les tickets avec filtres
// ═══════════════════════════════════════════════════════
router.get('/tickets', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 25, status, priority, type, search } = req.query;
    const offset = (parseInt(String(page)) - 1) * parseInt(String(limit));

    // Construction des filtres GLPI (searchoptions)
    const criteria: any[] = [];
    if (status   && status   !== 'all') criteria.push({ field: '12', searchtype: 'equals', value: status   });
    if (priority && priority !== 'all') criteria.push({ field: '3',  searchtype: 'equals', value: priority });
    if (type     && type     !== 'all') criteria.push({ field: '14', searchtype: 'equals', value: type     });
    if (search)                          criteria.push({ field: '1',  searchtype: 'contains', value: search  });

    const searchParams = new URLSearchParams({
      'range':              `${offset}-${offset + parseInt(String(limit)) - 1}`,
      'sort':               '19',     // tri par date de modification
      'order':              'DESC',
      'forcedisplay[0]':   '1',       // ID
      'forcedisplay[1]':   '2',       // Nom/Titre
      'forcedisplay[2]':   '12',      // Statut
      'forcedisplay[3]':   '3',       // Priorité
      'forcedisplay[4]':   '14',      // Type
      'forcedisplay[5]':   '5',       // Date création
      'forcedisplay[6]':   '19',      // Date modification
      'forcedisplay[7]':   '4',       // Assigné (nom)
      'forcedisplay[8]':   '83',      // Catégorie
    });

    // Ajouter les critères de recherche
    criteria.forEach((c, i) => {
      searchParams.set(`criteria[${i}][field]`,      c.field);
      searchParams.set(`criteria[${i}][searchtype]`, c.searchtype);
      searchParams.set(`criteria[${i}][value]`,      String(c.value));
    });

    const data = await glpiRequest('GET', `/Ticket?${searchParams.toString()}`);

    // Transformer les données GLPI vers le format frontend
    const tickets = (data.data ?? []).map((row: Record<string, unknown>) => ({
      id:             row['2'] ?? row.id,
      name:           row['1'] ?? row.name ?? '(Sans titre)',
      status:         row['12'] ?? row.status ?? 1,
      priority:       row['3']  ?? row.priority ?? 3,
      type:           row['14'] ?? row.type ?? 1,
      date_creation:  row['5']  ?? row.date_creation ?? new Date().toISOString(),
      date_mod:       row['19'] ?? row.date_mod ?? new Date().toISOString(),
      assignee_name:  row['4']  ?? row.users_id_assign ?? null,
      category_name:  row['83'] ?? null,
    }));

    res.json({
      data,
      total:    data.totalcount ?? tickets.length,
      lastSync: new Date().toISOString(),
    });

  } catch (err: any) {
    // Erreur GLPI → message clair au frontend
    if (err.response?.status === 401) {
      glpiSessionToken = null; // Forcer re-auth
    }
    next(err);
  }
});

// ═══════════════════════════════════════════════════════
// PUT /api/glpi/tickets/:id — Modifier un ticket (inline edit)
// ═══════════════════════════════════════════════════════
router.put('/tickets/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id }  = req.params;
    const { name, status, priority, type, content } = req.body;

    // Construire le payload GLPI (seuls les champs fournis)
    const input: Record<string, unknown> = { id: parseInt(id) };
    if (name     !== undefined) input.name     = name;
    if (status   !== undefined) input.status   = parseInt(String(status));
    if (priority !== undefined) input.priority = parseInt(String(priority));
    if (type     !== undefined) input.type     = parseInt(String(type));
    if (content  !== undefined) input.content  = content;

    await glpiRequest('PUT', `/Ticket/${id}`, { input });

    res.json({ success: true, message: 'Ticket mis à jour dans GLPI.' });
  } catch (err: any) {
    const message = err.response?.data?.[1] ?? err.message;
    res.status(400).json({ error: `Erreur GLPI : ${message}` });
  }
});

// ═══════════════════════════════════════════════════════
// POST /api/glpi/sync — Forcer une sync (cache interne)
// ═══════════════════════════════════════════════════════
router.post('/sync', async (req: Request, res: Response, next: NextFunction) => {
  try {
    glpiSessionToken = null; // Reset session
    await getGlpiSession();  // Re-initialiser
    res.json({ success: true, message: 'Session GLPI réinitialisée.' });
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════
// GET /api/glpi/status — Statut de la connexion GLPI
// ═══════════════════════════════════════════════════════
router.get('/status', async (req: Request, res: Response) => {
  try {
    await getGlpiSession();
    res.json({ connected: true, url: GLPI_BASE });
  } catch {
    res.json({ connected: false, error: 'Impossible de se connecter à GLPI. Vérifiez GLPI_URL et GLPI_APP_TOKEN dans .env' });
  }
});

export default router;
