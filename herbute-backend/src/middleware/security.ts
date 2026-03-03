/**
 * @file security.ts
 * @description Single source of truth for all Express security middleware.
 *              Handles authentication, organization context, RBAC, API key
 *              validation, and subscription feature gating.
 * @module backend/middleware
 */

import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Membership } from '../models/Membership.js';
import {
  AppError,
  ForbiddenAppError,
  TokenExpiredAppError,
  TokenInvalidAppError,
} from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import { verifyAccessToken } from '../utils/tokens.js';

//
// Types
//

export interface JwtPayload {
  id?: string;
  _id?: string;
  sub?: string;
  orgId?: string;
  org?: string;
  role: string;
  email?: string;
  plan?: string;
  farmId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      // id: string; // Provided by external typedefs (e.g. pino-http/express/etc)
    }
  }
}

//
// 1. Authentication          verify JWT access token
//

/**
 * Verifies the Bearer JWT in the Authorization header or HttpOnly cookie.
 * Attaches `req.user` on success.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  let token: string | undefined;

  // 1. Check Cookie
  if (req.cookies?.access_token) {
    token = req.cookies.access_token;
  } 
  // 2. Check Authorization Header
  else {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return next(new AppError('Token manquant', 401, 'AUTH_TOKEN_MISSING'));
  }

  try {
    const decoded = verifyAccessToken(token) as JwtPayload;
    
    // Normalize user ID (sub -> id)
    if (decoded.sub && !decoded.id) {
      decoded.id = decoded.sub;
    }
    
    // Normalize Org ID (org -> orgId)
    if (decoded.org && !decoded.orgId) {
      decoded.orgId = decoded.org;
    }

    req.user = decoded;
    logger.debug(`[Auth]     User ${decoded.id || decoded.sub} authenticated`, { requestId: req.id });
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return next(new TokenExpiredAppError());
    }
    return next(new TokenInvalidAppError());
  }
};

// Backward-compatibility aliases
export const auth = authenticate;
export const protect = authenticate;

//
// 2. Organization context          verify membership
//

/**
 * Verifies the user is an ACTIVE member of the organization specified
 * in the `x-organization-id` request header.
 * Must be called AFTER `authenticate`.
 * Attaches `req.organizationId` and `req.membership` on success.
 */
export const requireOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id ?? req.user?.id;
    if (!userId) {
      return next(new AppError('Non authentifi    ', 401, 'AUTH_USER_MISSING'));
    }

    const organizationId = req.headers['x-organization-id'] as string | undefined;
    if (!organizationId) {
      return next(new AppError('En-t    te x-organization-id requis', 400, 'ORG_HEADER_MISSING'));
    }

    const membership = await Membership.findOne({
      userId,
      organizationId,
      status: 'ACTIVE',
    });

    if (!membership) {
      return next(new ForbiddenAppError('Acc    s refus         cette organisation', 'ORG_ACCESS_DENIED'));
    }

    req.organizationId = organizationId;
    req.membership = membership as any;

    logger.debug(`[Org]         User ${userId}          org ${organizationId}`, { requestId: req.id });
    next();
  } catch (err) {
    next(err);
  }
};

//
// 3. Admin role          requires requireOrganization to run first
//

/**
 * Requires the user to have admin rights in the current organization.
 * Must be called AFTER `requireOrganization`.
 */
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.membership) {
      return next(new ForbiddenAppError("Contexte d'organisation manquant", 'ORG_CONTEXT_MISSING'));
    }
    if (!(req.membership as any).isAdmin()) {
      return next(new ForbiddenAppError('Droits administrateur requis', 'ADMIN_REQUIRED'));
    }
    logger.debug(`[Admin]         Admin access granted`, { requestId: req.id });
    next();
  } catch (err) {
    next(err);
  }
};

//
// 4. Role-based access control
//

/**
 * Requires the user to have at least one of the specified roles.
 * Must be called AFTER `requireOrganization`.
 * @param roles - Single role or array of roles (OR logic)
 */
export const requireRole = (roles: string | string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.membership) {
        return next(
          new ForbiddenAppError("Contexte d'organisation manquant", 'ORG_CONTEXT_MISSING')
        );
      }
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      const hasPermission = allowedRoles.some((role) => (req.membership as any).hasRole(role));
      if (!hasPermission) {
        return next(
          new ForbiddenAppError(`R    le requis: ${allowedRoles.join(' ou ')}`, 'ROLE_REQUIRED')
        );
      }
      logger.debug(`[RBAC]         Role check passed: ${allowedRoles.join('|')}`, { requestId: req.id });
      next();
    } catch (err) {
      next(err);
    }
  };
};

//
// 5. API Key authentication
//

/**
 * Validates the API key provided in the `x-api-key` header.
 * Sets `req.apiKey` with key metadata on success.
 * Can be used independently of JWT authentication (for service-to-service calls).
 */
export const requireApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rawKey = req.headers['x-api-key'] as string | undefined;
    if (!rawKey) {
      return next(new AppError('En-t    te x-api-key requis', 401, 'API_KEY_MISSING'));
    }

    // Lazy import to avoid circular dependency before apiKeyService is created
    const { apiKeyService } = await import('../services/apiKeyService.js');
    const keyDoc = await apiKeyService.validateApiKey(rawKey);

    if (!keyDoc) {
      return next(new AppError('Cl     API invalide ou expir    e', 401, 'API_KEY_INVALID'));
    }

    req.apiKey = {
      orgId: keyDoc.orgId.toString(),
      scopes: keyDoc.scopes,
      plan: keyDoc.plan,
      name: keyDoc.name,
    };

    logger.debug(`[ApiKey]         Key "${keyDoc.name}" validated`, { requestId: req.id });
    next();
  } catch (err) {
    next(err);
  }
};

//
// 6. Subscription feature gating
//

/**
 * Requires the organization's subscription to include a specific feature.
 * Must be called AFTER `requireOrganization`.
 * @param feature - Feature name to check (e.g. 'api_access', 'sso', 'advanced_analytics')
 */
export const requireSubscription = (feature: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.organizationId) {
        return next(
          new ForbiddenAppError("Contexte d'organisation manquant", 'ORG_CONTEXT_MISSING')
        );
      }

      const { subscriptionService } = await import('../services/subscriptionService.js');
      const allowed = await subscriptionService.hasFeature(req.organizationId, feature);

      if (!allowed) {
        return next(
          new AppError(
            `Cette fonctionnalit     ('${feature}') n'est pas disponible dans votre plan`,
            402,
            'SUBSCRIPTION_FEATURE_REQUIRED'
          )
        );
      }

      logger.debug(`[Sub]         Feature '${feature}' granted`, { requestId: req.id });
      next();
    } catch (err) {
      next(err);
    }
  };
};

//
// 7. Security headers (additional to Helmet)
//

/**
 * Adds supplemental security response headers not covered by Helmet.
 */
export const securityHeaders = (_req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  next();
};
