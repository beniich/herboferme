/**
 * ═══════════════════════════════════════════════════════
 * middleware/authorize.ts — Contrôle d'accès (RBAC + Plans)
 * ═══════════════════════════════════════════════════════
 */

import { Request, Response, NextFunction } from 'express';
import type { UserRole, SubscriptionPlan } from '@reclamtrack/shared';

type AuthMiddleware = (req: Request, res: Response, next: NextFunction) => void;

// ─────────────────────────────────────────────
// authorize(...roles) — Vérification de rôle
// Usage: router.delete('/resource', authenticate, authorize('admin', 'manager'), handler)
// ─────────────────────────────────────────────
export const authorize = (...roles: UserRole[]): AuthMiddleware => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ error: 'Non authentifié', code: 'NOT_AUTHENTICATED' });
      return;
    }

    if (!roles.includes(req.user.role as UserRole)) {
      res.status(403).json({
        error:    'Accès refusé — rôle insuffisant',
        code:     'FORBIDDEN_ROLE',
        required: roles,
        current:  req.user.role,
      });
      return;
    }

    next();
  };
};

// ─────────────────────────────────────────────
// requirePlan(...plans) — Vérification d'abonnement
// Usage: router.get('/rapports', authenticate, requirePlan('professionnel', 'entreprise'), handler)
// ─────────────────────────────────────────────
export const requirePlan = (...plans: SubscriptionPlan[]): AuthMiddleware => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ error: 'Non authentifié', code: 'NOT_AUTHENTICATED' });
      return;
    }

    if (!plans.includes(req.user.plan as SubscriptionPlan)) {
      res.status(403).json({
        error:         'Fonctionnalité non disponible pour votre plan',
        code:          'FORBIDDEN_PLAN',
        currentPlan:   req.user.plan,
        requiredPlans: plans,
      });
      return;
    }

    next();
  };
};

// ─────────────────────────────────────────────
// requireFarmAccess — Vérifie que l'utilisateur
// appartient bien à la ferme de la ressource demandée
// Usage: router.get('/farm/:farmId/data', authenticate, requireFarmAccess, handler)
// ─────────────────────────────────────────────
export const requireFarmAccess: AuthMiddleware = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({ error: 'Non authentifié' });
    return;
  }

  const requestedFarmId = req.params.farmId || req.body?.farmId;

  // Les super_admin et admin ont accès à toutes les fermes
  if (['super_admin', 'admin'].includes(req.user.role)) {
    return next();
  }

  if (requestedFarmId && req.user.farmId !== requestedFarmId) {
    res.status(403).json({
      error: 'Accès refusé — ferme non autorisée',
      code:  'FORBIDDEN_FARM',
    });
    return;
  }

  next();
};
