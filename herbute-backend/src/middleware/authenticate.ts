/**
 * ═══════════════════════════════════════════════════════
 * middleware/authenticate.ts — Vérification JWT RS256
 * ═══════════════════════════════════════════════════════
 *
 * IMPORTANT : Ce middleware utilise UNIQUEMENT la clé publique
 * pour vérifier les tokens — il ne peut pas en émettre.
 *
 * Lecture du token : Cookie HttpOnly en priorité,
 * fallback header Authorization (pour clients API non-browser)
 */

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/tokens.js';
import type { JwtPayload } from '@reclamtrack/shared';

// ─────────────────────────────────────────────
// Extraction du token depuis la requête
// Priorité : Cookie HttpOnly > Header Authorization
// ─────────────────────────────────────────────
const extractToken = (req: Request): string | null => {
  // 1. Cookie HttpOnly (recommandé — protège contre XSS)
  if (req.cookies?.access_token) {
    return req.cookies.access_token;
  }

  // 2. Fallback header Bearer (pour clients API, mobile, scripts)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  return null;
};

// ─────────────────────────────────────────────
// Middleware : authentification obligatoire
// ─────────────────────────────────────────────
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({
      error: 'Non authentifié',
      code:  'TOKEN_MISSING',
    });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({
        error: 'Session expirée',
        code:  'TOKEN_EXPIRED',
      });
      return;
    }

    res.status(401).json({
      error: 'Token invalide',
      code:  'TOKEN_INVALID',
    });
  }
};

// ─────────────────────────────────────────────
// Middleware : authentification optionnelle
// Attache req.user si un token valide est présent,
// mais laisse passer si absent (routes publiques enrichies)
// ─────────────────────────────────────────────
export const authenticateOptional = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = extractToken(req);

  if (token) {
    try {
      req.user = verifyAccessToken(token);
    } catch {
      // Token présent mais invalide → on ignore silencieusement
    }
  }

  next();
};
