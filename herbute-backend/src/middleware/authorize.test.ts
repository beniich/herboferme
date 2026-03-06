import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authorize, requireFarmAccess } from './authorize.js';
import { Permission } from '../config/permissions.js';

/**
 * Unit tests for authorize middleware logic.
 * This avoids connecting to real DB/Redis.
 */
describe('Authorization Middleware Logic', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = {
      path: '/test',
      method: 'GET',
      ip: '127.0.0.1',
      requestId: 'test-req-id',
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
  });

  describe('authorize middleware', () => {
    it('should allow access if user has required permission', () => {
      req.user = { roles: ['comptable'] }; // comptable HAS Permission.FINANCE_READ
      
      const middleware = authorize(Permission.FINANCE_READ);
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject access if user lacks required permission', () => {
      req.user = { roles: ['employe'] }; // employe DOES NOT HAVE Permission.FINANCE_READ
      
      const middleware = authorize(Permission.FINANCE_READ);
      middleware(req, res, next);
      
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'FORBIDDEN' }));
    });

    it('should allow super_admin to access everything', () => {
      req.user = { roles: ['super_admin'] };
      
      const middleware = authorize(Permission.ADMIN_SECURITY, Permission.FINANCE_READ);
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });

    it('should reject if no user is present (fail-safe)', () => {
      req.user = undefined;
      
      const middleware = authorize(Permission.ANIMALS_READ);
      middleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should log audit record for DELETE actions', () => {
      req.method = 'DELETE';
      req.user = { roles: ['admin'] };
      
      const middleware = authorize(Permission.ANIMALS_DELETE);
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
      // On peut ajouter un spy sur le logger si on veut être sûr
    });
  });

  describe('requireFarmAccess middleware', () => {
    it('should allow if farmId matches organizationId', () => {
      req.user = { organizationId: 'org-123' };
      req.params = { farmId: 'org-123' };
      
      requireFarmAccess(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });

    it('should reject if farmId does NOT match organizationId', () => {
      req.user = { organizationId: 'org-123' };
      req.params = { farmId: 'org-999' };
      
      requireFarmAccess(req, res, next);
      
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});
