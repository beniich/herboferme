import { getPermissionsForRoles, Permission } from '../config/permissions.js';

function checkAuth() {
  console.log('--- VALIDATION LOGIQUE AUTH ---');
  
  const testCases = [
    { role: 'employe', required: Permission.ANIMALS_READ, expected: true },
    { role: 'employe', required: Permission.FINANCE_READ, expected: false },
    { role: 'comptable', required: Permission.FINANCE_READ, expected: true },
    { role: 'comptable', required: Permission.ANIMALS_CREATE, expected: false },
    { role: 'manager', required: Permission.ANIMALS_CREATE, expected: true },
    { role: 'admin', required: Permission.ADMIN_SECURITY, expected: false }, // admin n'a pas ADMIN_SECURITY par défaut
    { role: 'super_admin', required: Permission.ADMIN_SECURITY, expected: true },
  ];

  let successCount = 0;
  testCases.forEach((tc, i) => {
    const userPermissions = getPermissionsForRoles([tc.role]);
    const hasPerm = userPermissions.has(tc.required);
    const success = hasPerm === tc.expected;
    
    console.log(`[Test ${i+1}] Role: ${tc.role.padEnd(12)} | Required: ${tc.required.padEnd(20)} | Result: ${hasPerm ? 'OK ' : 'KO '} | Expected: ${tc.expected ? 'OK ' : 'KO '} | ${success ? 'Ô£à PASS' : 'Ô£î FAIL'}`);
    if (success) successCount++;
  });

  console.log('---');
  console.log(`Verdict: ${successCount}/${testCases.length} tests pass├®s.`);
  
  if (successCount === testCases.length) {
    console.log('Ô£à RBAC LOGIC VALIDATED');
    process.exit(0);
  } else {
    console.log('Ô£î RBAC LOGIC FAILED');
    process.exit(1);
  }
}

checkAuth();
