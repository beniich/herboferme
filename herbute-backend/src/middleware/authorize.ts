/**
 * ═══════════════════════════════════════════════════════
 * middleware/authorize.ts — Authorization (RBAC)
 * Production-ready, SOC2-compliant
 * ═══════════════════════════════════════════════════════
 *
 * Usage:
 *   router.post('/', authenticate, authorize(Permission.ANIMALS_CREATE), handler)
 *   router.delete('/:id', authenticate, authorize(Permission.ANIMALS_DELETE), handler)
 */

import { Request, Response, NextFunction } from 'express';
import { Permission, getPermissionsForRoles } from '../config/permissions.js';
import { logger } from '../utils/logger.js';

/**
 * Authorize middleware — vérifie que l'utilisateur possède TOUTES les permissions requises.
 *
 * @param requiredPermissions - Une ou plusieurs permissions requises (AND logic)
 */
export const authorize = (...requiredPermissions: (Permission | string)[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;

    // 1. Vérifier que l'utilisateur est authentifié
    if (!user) {
      res.status(401).json({
        error: 'Non authentifié',
        code: 'UNAUTHORIZED',
      });
      return;
    }

    const userId = user.userId || user.sub || user.id || 'unknown';
    const userRoles: string[] = user.roles || (user.role ? [user.role] : []);

    // 2. Calculer les permissions de l'utilisateur depuis ses rôles
    const userPermissions = getPermissionsForRoles(userRoles);

    // 3. Vérifier toutes les permissions requises
    const missingPermissions = requiredPermissions.filter(
      p => !userPermissions.has(p as Permission)
    );

    if (missingPermissions.length > 0) {
      logger.warn('[SECURITY] Unauthorized access attempt', {
        userId,
        userRoles,
        requiredPermissions,
        missingPermissions,
        path: req.path,
        method: req.method,
        ip: req.ip,
        requestId: (req as any).requestId,
      });

      res.status(403).json({
        error: 'Accès refusé',
        code: 'FORBIDDEN',
        errorId: (req as any).requestId,
      });
      return;
    }

    // 4. Log d'audit pour les actions sensibles (DELETE, opérations admin)
    if (req.method === 'DELETE' || requiredPermissions.some(p => String(p).startsWith('admin:'))) {
      logger.info('[AUDIT] Sensitive action authorized', {
        userId,
        userRoles,
        permissions: requiredPermissions,
        path: req.path,
        method: req.method,
        ip: req.ip,
      });
    }

    next();
  };
};

/**
 * Middleware de vérification d'accès à la ferme (multi-tenancy)
 */
export const requireFarmAccess = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;
  const farmId = req.params.farmId || req.body.farmId || req.query.farmId;

  if (!user || !user.organizationId) {
    res.status(401).json({ error: 'Non authentifié' });
    return;
  }

  // Si un farmId est spécifié, il doit correspondre à l'organisation de l'utilisateur
  // (Ou dans notre logique, organizationId est le pivot)
  if (farmId && farmId !== user.organizationId) {
    logger.warn('[SECURITY] Cross-organization access attempt', {
      userId: user.userId,
      userOrg: user.organizationId,
      targetFarm: farmId,
    });
    res.status(403).json({ error: 'Accès refusé à cette ferme' });
    return;
  }

  next();
};

// ─── Re-export Permission enum for convenience ───────────
export { Permission } from '../config/permissions.js';
