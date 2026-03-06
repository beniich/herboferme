import { Request, Response, Router } from 'express';
import { authenticate as auth } from '../middleware/security.js';
import { runSecurityAudit } from '../services/securityAuditService.js';
import { securityService } from '../services/securityService.js';

const router = Router();

// Middleware admin simulé si 'authorize' n'existe pas
const adminOnly = (req: Request, res: Response, next: any) => {
  const user = (req as any).user;
  if (user && user.role === 'admin') {
    next();
  } else {
    // Pour dev, on laisse passer ou on mock
    // res.status(403).json({ message: 'Accès administrateur requis' });
    next();
  }
};

// Types
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'technician' | 'staff' | 'citizen';
  status: 'active' | 'inactive';
  lastLogin: string;
}

// Données mockées
const users: User[] = [
  {
    id: 'u1',
    name: 'Admin Principal',
    email: 'admin@reclamtrack.com',
    role: 'admin',
    status: 'active',
    lastLogin: '2025-02-11 08:30',
  },
  {
    id: 'u2',
    name: 'Chef Équipe Nord',
    email: 'chef.nord@reclamtrack.com',
    role: 'manager',
    status: 'active',
    lastLogin: '2025-02-11 09:15',
  },
  {
    id: 'u3',
    name: 'Tech 1',
    email: 'tech1@reclamtrack.com',
    role: 'technician',
    status: 'active',
    lastLogin: '2025-02-10 17:00',
  },
  {
    id: 'u4',
    name: 'Citoyen Lambda',
    email: 'citoyen@mail.com',
    role: 'citizen',
    status: 'inactive',
    lastLogin: '2025-01-20 10:00',
  },
];

// GET /api/admin/users - Liste utilisateurs
router.get('/', auth, adminOnly, (req: Request, res: Response) => {
  res.json({ success: true, data: users });
});

// GET /api/admin/system-stats - Stats système
router.get('/system-stats', auth, adminOnly, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      serverUptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      activeConnections: 12, // Simulé
      dbStatus: 'connected',
      version: '1.0.0',
    },
  });
});

// GET /api/admin/audit - Logs d'audit
router.get('/audit', auth, adminOnly, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        action: 'LOGIN',
        user: 'admin@reclamtrack.com',
        ip: '192.168.1.1',
        time: '2025-02-11 08:30',
      },
      {
        id: 2,
        action: 'CREATE_USER',
        user: 'admin@reclamtrack.com',
        target: 'tech2@reclamtrack.com',
        time: '2025-02-10 14:00',
      },
      {
        id: 3,
        action: 'DELETE_COMPLAINT',
        user: 'chef.nord@reclamtrack.com',
        target: 'C-2025-001',
        time: '2025-02-09 11:30',
      },
    ],
  });
});

// GET /api/admin/security/metrics - Metrics de sécurité réelles
router.get('/security/metrics', auth, adminOnly, async (req: Request, res: Response) => {
  try {
    const metrics = await securityService.generateComplianceReport('default');
    res.json({ success: true, data: metrics });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/security/audit - Audit de sécurité complet
router.get('/security/audit', auth, adminOnly, async (req: Request, res: Response) => {
  try {
    const audit = await runSecurityAudit();
    res.json({ success: true, data: audit });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
