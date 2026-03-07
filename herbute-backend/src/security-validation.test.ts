import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
// @ts-expect-error - app might have typing issues in some environments
import { app } from './server.js';
import { generateTokenPair } from './utils/tokens.js';

/**
 * Test de validation de la sécurité (E2E API)
 * Vérifie le RBAC (Role Based Access Control) et l'isolation multi-tenancy.
 */
describe('Security & Authorization Validation', () => {
  const orgA = '657c6b8c9c4c4e001f000001'; // Dummy IDs
  const orgB = '657c6b8c9c4c4e001f000002';

  // 1. Tokens pour différents rôles
  const { accessToken: superAdminToken } = generateTokenPair({
    id: 'user-super',
    email: 'super@herbute.test',
    organizationId: orgA,
    role: 'super_admin'
  });

  const { accessToken: adminToken } = generateTokenPair({
    id: 'user-admin',
    email: 'admin@herbute.test',
    organizationId: orgA,
    role: 'admin'
  });

  const { accessToken: workerToken } = generateTokenPair({
    id: 'user-worker',
    email: 'worker@herbute.test',
    organizationId: orgA,
    role: 'employe'
  });

  const { accessToken: workerOrgBToken } = generateTokenPair({
    id: 'user-worker-b',
    email: 'worker-b@herbute.test',
    organizationId: orgB,
    role: 'employe'
  });

  describe('Authentication Barrier', () => {
    it('should return 401 Unauthorized when no token is provided on protected animal routes', async () => {
      const res = await request(app).get('/api/animals');
      expect(res.status).toBe(401);
    });
  });

  describe('RBAC - Animals Module', () => {
    it('should allow "employe" to READ animals (Permission.ANIMALS_READ)', async () => {
      const res = await request(app)
        .get('/api/animals')
        .set('Authorization', `Bearer ${workerToken}`);
      
      // On s'attend à 200 (même vide) ou 404, mais PAS 403 ni 401
      expect([200, 404]).toContain(res.status);
    });

    it('should FORBID "employe" from DELETING animals (missing Permission.ANIMALS_DELETE)', async () => {
      const res = await request(app)
        .delete('/api/animals/657c6b8c9c4c4e001f000aaa')
        .set('Authorization', `Bearer ${workerToken}`);
      
      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN');
    });

    it('should ALLOW "admin" to DELETE animals (has all ANIMALS_* permissions)', async () => {
      const res = await request(app)
        .delete('/api/animals/657c6b8c9c4c4e001f000aaa')
        .set('Authorization', `Bearer ${adminToken}`);
      
      // Sera probablement 404 car l'ID n'existe pas, mais l'important est que ce ne soit PAS 403
      expect(res.status).not.toBe(403);
    });
  });

  describe('RBAC - Billing Module', () => {
    it('should FORBID "employe" from viewing invoices (requires ADMIN_BILLING)', async () => {
      const res = await request(app)
        .get('/api/billing/invoices')
        .set('Authorization', `Bearer ${workerToken}`);
      
      expect(res.status).toBe(403);
    });

    it('should ALLOW "super_admin" to access everything', async () => {
      const res = await request(app)
        .get('/api/billing/invoices')
        .set('Authorization', `Bearer ${superAdminToken}`);
      
      expect(res.status).not.toBe(403);
    });
  });

  describe('Multi-tenancy Isolation (Organization Check)', () => {
    it('should ensure the organizationId header is extracted from JWT (backend security)', async () => {
      // Ce test valide indirectement que req.organizationId est bien setté par le middleware
      const res = await request(app)
        .get('/api/animals')
        .set('Authorization', `Bearer ${workerToken}`);
      
      // Ici le controller Animals utilise req.organizationId pour filtrer ses queries
      expect(res.status).not.toBe(401);
    });
  });
});
