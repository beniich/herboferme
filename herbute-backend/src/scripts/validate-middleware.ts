import { authorize, requireFarmAccess } from '../middleware/authorize.js';
import { Permission } from '../config/permissions.js';

async function validateMiddleware() {
  console.log('--- VALIDATION MIDDLEWARE ARMOURED ---');
  
  let successCount = 0;
  let totalTests = 0;

  const runTest = (name, middleware, req, expectedStatus, expectedNext) => {
    totalTests++;
    let nextCalled = false;
    let statusCalled = null;
    let jsonCalled = null;

    const res = {
      status: (s) => { statusCalled = s; return res; },
      json: (j) => { jsonCalled = j; return res; }
    };
    const next = () => { nextCalled = true; };

    middleware(req, res, next);

    const statusMatch = statusCalled === expectedStatus;
    const nextMatch = nextCalled === expectedNext;
    const success = statusMatch && nextMatch;

    console.log(`[Test] ${name.padEnd(40)} | ${success ? 'Ô£à PASS' : 'Ô£î FAIL'} (Status: ${statusCalled}, Next: ${nextCalled})`);
    if (success) successCount++;
  };

  // Test 1: Authorize - Access Granted
  runTest('Authorize: Admin access animals:read', 
    authorize(Permission.ANIMALS_READ),
    { user: { roles: ['admin'] } },
    null, true
  );

  // Test 2: Authorize - Access Denied
  runTest('Authorize: Worker delete animals', 
    authorize(Permission.ANIMALS_DELETE),
    { user: { roles: ['employe'] }, path: '/api/animals', method: 'DELETE' },
    403, false
  );

  // Test 3: Multi-tenancy - Org Match
  runTest('Tenancy: Org Match',
    requireFarmAccess,
    { user: { organizationId: 'ORG_1' }, params: { farmId: 'ORG_1' } },
    null, true
  );

  // Test 4: Multi-tenancy - Org Mismatch
  runTest('Tenancy: Org Mismatch (Attack)',
    requireFarmAccess,
    { user: { organizationId: 'ORG_1' }, params: { farmId: 'ORG_2' } },
    403, false
  );

  console.log('---');
  console.log(`Verdict: ${successCount}/${totalTests} tests pass├®s.`);
  
  if (successCount === totalTests) {
    console.log('Ô£à MIDDLEWARE LOGIC VALIDATED');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

validateMiddleware();
