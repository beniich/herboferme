# 🎯 FootballHub+ - PLAN D'EXÉCUTION PAR PRIORITÉS

## 📋 VUE D'ENSEMBLE

```
┌─────────────────────────────────────────────────────────┐
│           ROADMAP FOOTBALLHUB+ 2026                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🔴 PRIORITÉ 1 - CETTE SEMAINE (7 jours)              │
│     └─ Sécurité + Connexion + UI/UX                   │
│                                                         │
│  🟡 PRIORITÉ 2 - CE MOIS (30 jours)                   │
│     └─ Paiements + Billetterie + Admin                │
│                                                         │
│  🟢 PRIORITÉ 3 - 2-3 MOIS (90 jours)                  │
│     └─ Mobile + IA + Performance                      │
│                                                         │
│  🔵 PRIORITÉ 4 - 3-6 MOIS (180 jours)                 │
│     └─ Social + Marketplace + Analytics               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

# 🔴 PRIORITÉ 1 - CETTE SEMAINE (7 JOURS)

## Objectif : Application fonctionnelle et sécurisée

### 📅 JOUR 1-2 : SÉCURITÉ

#### ✅ Tâche 1.1 : Protection CSRF

```typescript
// server/src/middleware/csrf.ts
import csrf from 'csurf';
import cookieParser from 'cookie-parser';

// Configure CSRF protection
export const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
});

// Generate CSRF token route
export const csrfToken = (req: any, res: any) => {
  res.json({ csrfToken: req.csrfToken() });
};
```

```typescript
// server/src/index.ts - Add CSRF middleware
import { csrfProtection, csrfToken } from './middleware/csrf';

// Apply to state-changing routes
app.use(cookieParser());

// CSRF token endpoint
app.get('/api/csrf-token', csrfToken);

// Protect routes
app.post('/api/*', csrfProtection);
app.put('/api/*', csrfProtection);
app.delete('/api/*', csrfProtection);
```

```typescript
// web/lib/api/client.ts - Frontend CSRF handling
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Request interceptor to add CSRF token
apiClient.interceptors.request.use(async (config) => {
  if (['post', 'put', 'delete', 'patch'].includes(config.method!)) {
    // Get CSRF token
    const { data } = await axios.get('/api/csrf-token', {
      withCredentials: true,
    });
    
    config.headers['X-CSRF-Token'] = data.csrfToken;
  }
  
  return config;
});
```

**✅ Checklist Sécurité:**
- [ ] CSRF middleware installé (`npm install csurf cookie-parser`)
- [ ] Token endpoint créé
- [ ] Frontend interceptor configuré
- [ ] Tests CSRF passants

#### ✅ Tâche 1.2 : Tests de Sécurité

```typescript
// tests/security.test.ts
import request from 'supertest';
import app from '../src/index';

describe('Security Tests', () => {
  test('Should reject request without CSRF token', async () => {
    const res = await request(app)
      .post('/api/members')
      .send({ email: 'test@test.com' });
    
    expect(res.status).toBe(403);
  });

  test('Should accept request with valid CSRF token', async () => {
    // Get token
    const tokenRes = await request(app).get('/api/csrf-token');
    const token = tokenRes.body.csrfToken;

    // Use token
    const res = await request(app)
      .post('/api/members')
      .set('X-CSRF-Token', token)
      .set('Cookie', tokenRes.headers['set-cookie'])
      .send({ email: 'test@test.com' });
    
    expect(res.status).not.toBe(403);
  });

  test('Should have security headers (Helmet)', async () => {
    const res = await request(app).get('/');
    
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['x-xss-protection']).toBe('1; mode=block');
  });

  test('Should enforce rate limiting', async () => {
    const requests = Array(101).fill(null);
    
    const results = await Promise.all(
      requests.map(() => request(app).get('/api/news'))
    );

    const rateLimited = results.filter(r => r.status === 429);
    expect(rateLimited.length).toBeGreaterThan(0);
  });
});
```

**Commandes:**
```bash
# Install test dependencies
npm install --save-dev jest supertest @types/jest @types/supertest

# Run tests
npm run test:security
```

---

### 📅 JOUR 3-4 : CONNEXION FRONTEND-BACKEND

#### ✅ Tâche 2.1 : Configuration API Client

```typescript
// web/lib/api/config.ts
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// API endpoints
export const ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me',
  
  // Members
  MEMBERS: '/api/members',
  MEMBER_BY_ID: (id: string) => `/api/members/${id}`,
  
  // News
  NEWS: '/api/news',
  NEWS_BY_ID: (id: string) => `/api/news/${id}`,
  NEWS_FEATURED: '/api/news/featured',
  
  // Events
  EVENTS: '/api/events',
  EVENT_BY_ID: (id: string) => `/api/events/${id}`,
  
  // Tickets
  TICKETS: '/api/tickets',
  TICKET_VALIDATE: '/api/tickets/validate',
  
  // Products
  PRODUCTS: '/api/products',
  PRODUCT_BY_ID: (id: string) => `/api/products/${id}`,
  
  // Orders
  ORDERS: '/api/orders',
  CREATE_ORDER: '/api/orders/create',
  
  // Matches
  MATCHES: '/api/matches',
  LIVE_MATCHES: '/api/matches/live',
};
```

```typescript
// web/lib/api/services.ts
import { apiClient } from './client';
import { ENDPOINTS } from './config';

// Auth Service
export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await apiClient.post(ENDPOINTS.LOGIN, { email, password });
    return data;
  },
  
  register: async (userData: any) => {
    const { data } = await apiClient.post(ENDPOINTS.REGISTER, userData);
    return data;
  },
  
  me: async () => {
    const { data } = await apiClient.get(ENDPOINTS.ME);
    return data;
  },
  
  logout: async () => {
    const { data } = await apiClient.post(ENDPOINTS.LOGOUT);
    return data;
  },
};

// Members Service
export const membersService = {
  getAll: async (params?: any) => {
    const { data } = await apiClient.get(ENDPOINTS.MEMBERS, { params });
    return data;
  },
  
  getById: async (id: string) => {
    const { data } = await apiClient.get(ENDPOINTS.MEMBER_BY_ID(id));
    return data;
  },
  
  create: async (memberData: any) => {
    const { data } = await apiClient.post(ENDPOINTS.MEMBERS, memberData);
    return data;
  },
  
  update: async (id: string, memberData: any) => {
    const { data } = await apiClient.put(ENDPOINTS.MEMBER_BY_ID(id), memberData);
    return data;
  },
  
  delete: async (id: string) => {
    const { data } = await apiClient.delete(ENDPOINTS.MEMBER_BY_ID(id));
    return data;
  },
};

// News Service
export const newsService = {
  getAll: async (params?: any) => {
    const { data } = await apiClient.get(ENDPOINTS.NEWS, { params });
    return data;
  },
  
  getFeatured: async () => {
    const { data } = await apiClient.get(ENDPOINTS.NEWS_FEATURED);
    return data;
  },
  
  getById: async (id: string) => {
    const { data } = await apiClient.get(ENDPOINTS.NEWS_BY_ID(id));
    return data;
  },
};

// Events Service
export const eventsService = {
  getAll: async (params?: any) => {
    const { data } = await apiClient.get(ENDPOINTS.EVENTS, { params });
    return data;
  },
  
  getById: async (id: string) => {
    const { data } = await apiClient.get(ENDPOINTS.EVENT_BY_ID(id));
    return data;
  },
};

// Products Service
export const productsService = {
  getAll: async (params?: any) => {
    const { data } = await apiClient.get(ENDPOINTS.PRODUCTS, { params });
    return data;
  },
  
  getById: async (id: string) => {
    const { data } = await apiClient.get(ENDPOINTS.PRODUCT_BY_ID(id));
    return data;
  },
};

// Orders Service
export const ordersService = {
  getAll: async () => {
    const { data } = await apiClient.get(ENDPOINTS.ORDERS);
    return data;
  },
  
  create: async (orderData: any) => {
    const { data } = await apiClient.post(ENDPOINTS.CREATE_ORDER, orderData);
    return data;
  },
};

// Matches Service
export const matchesService = {
  getAll: async (params?: any) => {
    const { data } = await apiClient.get(ENDPOINTS.MATCHES, { params });
    return data;
  },
  
  getLive: async () => {
    const { data } = await apiClient.get(ENDPOINTS.LIVE_MATCHES);
    return data;
  },
};
```

#### ✅ Tâche 2.2 : Tests d'Intégration

```typescript
// web/__tests__/api-integration.test.ts
import { authService, membersService, newsService } from '@/lib/api/services';

describe('API Integration Tests', () => {
  let authToken: string;

  beforeAll(async () => {
    // Login to get token
    const response = await authService.login('test@test.com', 'password123');
    authToken = response.token;
  });

  test('Should fetch news', async () => {
    const news = await newsService.getAll();
    expect(news.success).toBe(true);
    expect(Array.isArray(news.news)).toBe(true);
  });

  test('Should fetch members', async () => {
    const members = await membersService.getAll();
    expect(members.success).toBe(true);
    expect(Array.isArray(members.members)).toBe(true);
  });

  test('Should create member', async () => {
    const newMember = {
      email: 'newmember@test.com',
      firstName: 'Test',
      lastName: 'Member',
      password: 'password123',
    };

    const result = await membersService.create(newMember);
    expect(result.success).toBe(true);
    expect(result.member.email).toBe(newMember.email);
  });
});
```

---

### 📅 JOUR 5-7 : CORRECTION UI/UX

#### ✅ Tâche 3.1 : Audit de tous les boutons

```bash
# Script d'audit des boutons
# scripts/audit-buttons.sh

#!/bin/bash

echo "🔍 Auditing all buttons in the application..."

# Find all button elements
grep -r "button" web/src/components --include="*.tsx" --include="*.jsx" | wc -l

# Find onClick handlers
grep -r "onClick" web/src/components --include="*.tsx" --include="*.jsx" | wc -l

# Find disabled buttons
grep -r "disabled" web/src/components --include="*.tsx" --include="*.jsx"

echo "✅ Audit complete"
```

#### ✅ Tâche 3.2 : Composant Button Universel

```typescript
// web/components/ui/Button.tsx
import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-primary hover:bg-primary/90 text-black focus:ring-primary',
    secondary: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white focus:ring-gray-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-gray-400',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      ) : icon}
      {children}
    </button>
  );
};
```

#### ✅ Tâche 3.3 : Remplacer tous les boutons

```typescript
// Avant:
<button className="bg-primary text-black px-4 py-2 rounded">
  Click me
</button>

// Après:
<Button variant="primary">
  Click me
</Button>

// Avec loading:
<Button variant="primary" loading={isLoading}>
  Submit
</Button>

// Avec icon:
<Button variant="secondary" icon={<Plus size={16} />}>
  Add Item
</Button>
```

**Script de migration automatique:**

```bash
# scripts/migrate-buttons.sh

#!/bin/bash

echo "🔄 Migrating buttons to new Button component..."

# Find all files with button elements
find web/src -type f \( -name "*.tsx" -o -name "*.jsx" \) -exec sed -i.bak \
  's/<button className="\([^"]*\)"/<Button variant="primary"/g' {} +

echo "✅ Migration complete. Please review changes manually."
```

---

## 📊 CHECKLIST PRIORITÉ 1

```
□ SÉCURITÉ
  □ CSRF middleware installé
  □ CSRF token endpoint créé
  □ Frontend interceptor configuré
  □ Tests sécurité passants (4/4)
  □ Helmet configuré
  □ Rate limiting actif

□ CONNEXION FRONTEND-BACKEND
  □ API client configuré
  □ Tous les services créés (8/8)
  □ CORS configuré
  □ Error handling global
  □ Tests d'intégration passants

□ CORRECTION UI/UX
  □ Audit boutons complété
  □ Button component créé
  □ Migration boutons (100%)
  □ Loading states partout
  □ Error states gérés
  □ Success feedback

□ TESTS
  □ Unit tests (>80% coverage)
  □ Integration tests passants
  □ Security tests OK
  □ E2E tests critiques OK
```

**Temps estimé:** 7 jours
**Ressources:** 1-2 développeurs
**Bloquants:** Aucun

Suite dans le prochain fichier avec Priorité 2, 3 et 4 ! 🚀
