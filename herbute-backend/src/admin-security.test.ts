import { describe, it, expect } from 'vitest';
import request from 'supertest';
// @ts-ignore - module resolution may vary in CI
import { app } from './server.js';
import jwt from 'jsonwebtoken';
import { jwtConfig } from './config/jwt.js';

function generateTestToken(payload: Record<string, unknown>): string {
  return jwt.sign(
    {
      ...payload,
      iss: jwtConfig.issuer,
      aud: jwtConfig.audience,
    },
    jwtConfig.privateKey,
    {
      algorithm: jwtConfig.algorithm as jwt.Algorithm,
      expiresIn: '1h',
    }
  );
}

describe('Admin Route Security', () => {
  const adminToken = generateTestToken({
    sub: 'admin-id',
    email: 'admin@test.com',
    role: 'admin',
    organizationId: 'org-1'
  });

  const userToken = generateTestToken({
    sub: 'user-id',
    email: 'user@test.com',
    role: 'employe',
    organizationId: 'org-1'
  });

  it('should allow access to admin routes for admin users', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should deny access to admin routes for non-admin users', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('ADMIN_REQUIRED');
  });

  it('should allow access for super_admin users', async () => {
    const superAdminToken = generateTestToken({
      sub: 'super-admin-id',
      email: 'super@test.com',
      roles: ['super_admin'],
      organizationId: 'org-1'
    });

    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
