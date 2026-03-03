import axios from 'axios';

const API_URL = 'http://localhost:5001';
const FRONTEND_URL = 'http://localhost:3000';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  details: string;
}

const results: TestResult[] = [];

async function testLogin(email: string, password: string) {
  console.log(`\n          Testing login for: ${email}`);

  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      password,
    });

    if (response.data.token && response.data.user) {
      results.push({
        test: `Login - ${email}`,
        status: 'PASS',
        details: `Token received, user role: ${response.data.user.role}`,
      });
      return response.data.token;
    } else {
      results.push({
        test: `Login - ${email}`,
        status: 'FAIL',
        details: 'No token or user in response',
      });
      return null;
    }
  } catch (error: any) {
    let details = 'Unknown error';
    if (error.response) {
      details = `Server Error (${error.response.status}): ${JSON.stringify(error.response.data)}`;
    } else if (error.request) {
      details = `No response from server: ${error.message}`;
    } else {
      details = `Request setup error: ${error.message}`;
    }
    results.push({
      test: `Login - ${email}`,
      status: 'FAIL',
      details,
    });
    return null;
  }
}

async function testProtectedEndpoint(token: string, endpoint: string, organizationId?: string) {
  try {
    const headers: any = {
      Authorization: `Bearer ${token}`,
    };
    if (organizationId) {
      headers['x-organization-id'] = organizationId;
    }

    const response = await axios.get(`${API_URL}${endpoint}`, { headers });

    results.push({
      test: `Access ${endpoint}`,
      status: 'PASS',
      details: `Status: ${response.status}`,
    });
    return response.data;
  } catch (error: any) {
    results.push({
      test: `Access ${endpoint}`,
      status: 'FAIL',
      details:
        error.response?.status === 401
          ? 'Unauthorized (401)'
          : error.response?.status === 400
            ? `Bad Request (400): ${JSON.stringify(error.response.data)}`
            : error.response?.status === 403
              ? 'Forbidden (403)'
              : error.message,
    });
    return null;
  }
}

async function getOrgId(token: string) {
  try {
    const response = await axios.get(`${API_URL}/api/organizations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const orgs = response.data.organizations || response.data;
    return orgs[0]?._id || orgs[0]?.id;
  } catch (error) {
    return undefined;
  }
}

async function testFrontendAccess() {
  console.log('\n         Testing frontend accessibility...');

  try {
    const response = await axios.get(FRONTEND_URL, {
      timeout: 5000,
    });

    if (response.status === 200) {
      results.push({
        test: 'Frontend Accessibility',
        status: 'PASS',
        details: `Frontend is running on port 3000`,
      });
    }
  } catch (error: any) {
    results.push({
      test: 'Frontend Accessibility',
      status: 'FAIL',
      details: error.message,
    });
  }
}

async function testMonitoringRoute() {
  console.log('\n          Testing monitoring route...');

  try {
    // Just check if the route exists (will return HTML)
    const response = await axios.get(`${FRONTEND_URL}/fr/admin/monitoring`, {
      timeout: 5000,
      validateStatus: (status) => status < 500, // Accept any non-500 error
    });

    results.push({
      test: 'Monitoring Page Route',
      status: 'PASS',
      details: `Route exists, returned status ${response.status}`,
    });
  } catch (error: any) {
    results.push({
      test: 'Monitoring Page Route',
      status: 'FAIL',
      details: error.message,
    });
  }
}

async function testGrafanaAccess() {
  console.log('\n          Testing Grafana accessibility...');

  const GRAFANA_URL = 'http://localhost:3001';

  try {
    const response = await axios.get(GRAFANA_URL, {
      timeout: 5000,
      validateStatus: (status) => status < 500,
    });

    results.push({
      test: 'Grafana Accessibility',
      status: 'PASS',
      details: `Grafana is accessible on port 3001 (Status: ${response.status})`,
    });
  } catch (error: any) {
    results.push({
      test: 'Grafana Accessibility',
      status: 'FAIL',
      details: `Grafana not running: ${error.message}`,
    });
  }
}

function printResults() {
  console.log('\n' + '='.repeat(70));
  console.log('           TEST RESULTS - MONITORING DASHBOARD ACCESS');
  console.log('='.repeat(70));

  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;

  results.forEach((result) => {
    const icon = result.status === 'PASS' ? '       ' : '      ';
    console.log(`\n${icon} ${result.test}`);
    console.log(`   ${result.details}`);
  });

  console.log('\n' + '='.repeat(70));
  console.log(`SUMMARY: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(70) + '\n');
}

async function runTests() {
  console.log('          Starting Monitoring Dashboard Access Tests...');

  // Test 1: Frontend accessibility
  await testFrontendAccess();

  // Test 2: Monitoring route
  await testMonitoringRoute();

  // Test 3: Admin login
  const adminToken = await testLogin('admin@reclamtrack.com', 'Admin123!');
  let orgId: string | undefined = undefined;
  if (adminToken) {
    orgId = await getOrgId(adminToken);
    console.log(`         Found Organization ID: ${orgId}`);
    await testProtectedEndpoint(adminToken, '/api/teams', orgId);
  }

  // Test 4: Superadmin login
  const superadminToken = await testLogin('superadmin@reclamtrack.com', 'SuperAdmin123!');
  if (superadminToken && orgId) {
    await testProtectedEndpoint(superadminToken, '/api/teams', orgId);
  }

  // Test 5: Grafana accessibility
  await testGrafanaAccess();

  // Print results
  printResults();

  // Exit with appropriate code
  const hasFailed = results.some((r) => r.status === 'FAIL');
  process.exit(hasFailed ? 1 : 0);
}

runTests();
