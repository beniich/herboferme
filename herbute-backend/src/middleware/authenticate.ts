/**
 *
 * middleware/authenticate.ts          V    rification JWT RS256
 *
 *
 * IMPORTANT : Ce middleware utilise UNIQUEMENT la cl     publique
 * pour v    rifier les tokens          il ne peut pas en     mettre.
 *
 * Lecture du token : Cookie HttpOnly en priorit    ,
 * fallback header Authorization (pour clients API non-browser)
 */

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/tokens';
// The Express.Request global augmentation (user?) is declared in middleware/security.ts

//
// Extraction du token depuis la requ    te
// Priorit     : Cookie HttpOnly > Header Authorization
//
const extractToken = (req: Request): string | null => {
  // 1. Cookie HttpOnly (recommand              prot    ge contre XSS)
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

//
// Middleware : authentification obligatoire
//
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({
      error: 'Non authentifi    ',
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
        error: 'Session expir    e',
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

//
// Middleware : authentification optionnelle
// Attache req.user si un token valide est pr    sent,
// mais laisse passer si absent (routes publiques enrichies)
//
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
      // Token pr    sent mais invalide          on ignore silencieusement
    }
  }

  next();
};
