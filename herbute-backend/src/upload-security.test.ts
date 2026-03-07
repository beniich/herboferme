import { describe, it, expect } from 'vitest';
import request from 'supertest';
// @ts-ignore
import { app } from './server.js';
import { generateTokenPair } from './utils/tokens.js';

describe('Security Validation', () => {
  const orgA = '657c6b8c9c4c4e001f000001';

  const { accessToken: workerToken } = generateTokenPair({
    id: '657c6b8c9c4c4e001f00000a',
    email: 'worker@herbute.test',
    organizationId: orgA,
    role: 'employe'
  });

  const { accessToken: adminToken } = generateTokenPair({
    id: '657c6b8c9c4c4e001f00000b',
    email: 'admin@herbute.test',
    organizationId: orgA,
    role: 'admin'
  });

  it('POST /api/upload should require authentication', async () => {
    const res = await request(app)
      .post('/api/upload')
      .attach('file', Buffer.from('test file content'), 'test.txt');

    expect(res.status).toBe(401);
  });

  it('POST /api/upload should NOT return 401 for authenticated users', async () => {
    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${workerToken}`)
      .attach('file', Buffer.from('test file content'), 'test.txt');

    expect(res.status).not.toBe(401);
  });

  it('GET /api/admin/users should forbid non-admin users', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${workerToken}`)
      .set('x-organization-id', orgA);

    // requireAdmin should throw ForbiddenAppError (403)
    // but first requireOrganization is called.
    // If it fails to find membership it might return 403 anyway.
    expect([403]).toContain(res.status);
  });

  it('GET /api/admin/users should NOT return 401 for admin users', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-organization-id', orgA);

    expect(res.status).not.toBe(401);
  });
});
