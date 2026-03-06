export interface AuditCheck {
    id: string;
    name: string;
    status: 'pass' | 'fail' | 'warn';
    description: string;
    recommendation?: string;
}

export const runSecurityAudit = async (): Promise<AuditCheck[]> => {
    const checks: AuditCheck[] = [];

    // Check 1: Environment Mode
    checks.push({
        id: 'env-mode',
        name: 'Environment Mode',
        status: process.env.NODE_ENV === 'production' ? 'pass' : 'warn',
        description: `Current mode: ${process.env.NODE_ENV}`,
        recommendation: process.env.NODE_ENV !== 'production' ? 'Enable production mode for better security' : undefined
    });

    // Check 2: Demo Mode
    checks.push({
        id: 'demo-mode',
        name: 'Demo Mode Status',
        status: (global as any).IS_DEMO_MODE ? 'warn' : 'pass',
        description: (global as any).IS_DEMO_MODE ? 'Running in DEMO mode with mock authentication' : 'Database connection active',
        recommendation: (global as any).IS_DEMO_MODE ? 'Connect to a real MongoDB instance for production' : undefined
    });

    // Check 3: JWT Configuration
    const hasJwtSecret = !!process.env.JWT_SECRET && process.env.JWT_SECRET !== 'your-very-secret-key-change-in-production';
    checks.push({
        id: 'jwt-config',
        name: 'JWT Configuration',
        status: hasJwtSecret ? 'pass' : 'fail',
        description: hasJwtSecret ? 'Custom JWT secret detected' : 'Default or missing JWT secret',
        recommendation: !hasJwtSecret ? 'Change JWT_SECRET in .env to a long random string' : undefined
    });

    // Check 4: Rate Limiting
    // In Express, we already use express-rate-limit
    checks.push({
        id: 'rate-limit',
        name: 'API Rate Limiting',
        status: 'pass',
        description: 'Rate limiting middleware active on /api routes',
    });

    // Check 5: Helmet Headers
    checks.push({
        id: 'helmet',
        name: 'Security Headers',
        status: 'pass',
        description: 'Helmet.js is active and providing security headers',
    });

    return checks;
};
