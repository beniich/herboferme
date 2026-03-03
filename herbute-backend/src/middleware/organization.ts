import { NextFunction, Response } from 'express';
import { Membership } from '../models/Membership.js';

/**
 * Middleware to check if user is a member of the organization specified in header
 * Requires protect middleware to be called first
 */
export const requireOrganization = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      console.warn('[Org Middleware] User ID missing from request user context');
      return res.status(401).json({ message: 'Non authentifi    ' });
    }

    // Get organization ID from header
    const organizationId = req.headers['x-organization-id'];
    if (!organizationId) {
      return res.status(400).json({
        message: 'En-t    te x-organization-id requis',
      });
    }

    // Check membership
    const membership = await Membership.findOne({
      userId,
      organizationId,
      status: 'ACTIVE',
    });

    if (!membership) {
      return res.status(403).json({
        message: 'Acc    s refus         cette organisation',
      });
    }

    // Attach organization context to request
    req.organizationId = organizationId;
    req.membership = membership;

    next();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Middleware to check if user has admin rights in the organization
 */
export const requireAdmin = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.membership) {
      return res.status(403).json({ message: "Context d'organisation manquant" });
    }

    if (!req.membership.isAdmin()) {
      return res.status(403).json({
        message: 'Droits administrateur requis',
      });
    }

    next();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Middleware to check if user has one of the specified roles
 * @param roles - Single role string or array of role strings
 */
export const requireRole = (roles: string | string[]) => {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.membership) {
        return res.status(403).json({ message: "Context d'organisation manquant" });
      }

      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      const hasPermission = allowedRoles.some((role) => req.membership.hasRole(role));

      if (!hasPermission) {
        return res.status(403).json({
          message: `R    le requis: ${allowedRoles.join(' ou ')}`,
        });
      }

      next();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
};
