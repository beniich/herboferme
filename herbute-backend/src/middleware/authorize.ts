/**
 *
 * middleware/authorize.ts          Contr    le d'acc    s (RBAC + Plans)
 *
 */

import { Request, Response, NextFunction } from 'express';
import type { UserRole, SubscriptionPlan } from '@reclamtrack/shared';

type AuthMiddleware = (req: Request, res: Response, next: NextFunction) => void;

//
// authorize(...roles)          V    rification de r    le
// Usage: router.delete('/resource', authenticate, authorize('admin', 'manager'), handler)
//
export const authorize = (...roles: UserRole[]): AuthMiddleware => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ error: 'Non authentifi    ', code: 'NOT_AUTHENTICATED' });
      return;
    }

    if (!roles.includes(req.user.role as UserRole)) {
      res.status(403).json({
        error:    'Acc    s refus              r    le insuffisant',
        code:     'FORBIDDEN_ROLE',
        required: roles,
        current:  req.user.role,
      });
      return;
    }

    next();
  };
};

//
// requirePlan(...plans)          V    rification d'abonnement
// Usage: router.get('/rapports', authenticate, requirePlan('professionnel', 'entreprise'), handler)
//
export const requirePlan = (...plans: SubscriptionPlan[]): AuthMiddleware => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ error: 'Non authentifi    ', code: 'NOT_AUTHENTICATED' });
      return;
    }

    if (!plans.includes((req.user as any).plan as SubscriptionPlan)) {
      res.status(403).json({
        error:         'Fonctionnalit   non disponible pour votre plan',
        code:          'FORBIDDEN_PLAN',
        currentPlan:   (req.user as any).plan,
        requiredPlans: plans,
      });
      return;
    }

    next();
  };
};

//
// requireFarmAccess          V    rifie que l'utilisateur
// appartient bien     la ferme de la ressource demand    e
// Usage: router.get('/farm/:farmId/data', authenticate, requireFarmAccess, handler)
//
export const requireFarmAccess: AuthMiddleware = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({ error: 'Non authentifi    ' });
    return;
  }

  const requestedFarmId = req.params.farmId || req.body?.farmId;

  // Les super_admin et admin ont acc    s     toutes les fermes
  if (['super_admin', 'admin'].includes(req.user.role)) {
    return next();
  }

  if (requestedFarmId && (req.user as any).farmId !== requestedFarmId) {
    res.status(403).json({
      error: 'Acc    s refus              ferme non autoris    e',
      code:  'FORBIDDEN_FARM',
    });
    return;
  }

  next();
};
