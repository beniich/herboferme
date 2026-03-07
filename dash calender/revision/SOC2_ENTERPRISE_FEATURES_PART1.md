# 🔒 FootballHub+ - SOC2 COMPLIANCE & ENTERPRISE FEATURES

## 🎯 Vue d'Ensemble

Intégration complète des fonctionnalités Enterprise Supabase pour FootballHub+ :
- ✅ SOC2 Compliance
- ✅ RBAC (Role-Based Access Control)
- ✅ SSO (Single Sign-On)
- ✅ Backups automatiques (14 jours)
- ✅ Log Retention (28 jours)
- ✅ Log Drains
- ✅ Support prioritaire

---

## 📋 PARTIE 1 : CONFORMITÉ SOC2

### Qu'est-ce que SOC2 ?

SOC2 (Service Organization Control 2) est un framework de sécurité qui garantit :
- **Security** : Protection des données
- **Availability** : Disponibilité du service
- **Processing Integrity** : Intégrité des traitements
- **Confidentiality** : Confidentialité des données
- **Privacy** : Respect de la vie privée

### Activation SOC2 sur Supabase

```bash
# 1. Contactez Supabase Sales
# https://supabase.com/contact/enterprise

# 2. Demandez l'activation SOC2 Compliance
# - Accès au rapport SOC2 Type II
# - Conformité HIPAA (optionnel, payant)
# - Audit trails complets

# 3. Configuration projet
# Dashboard Supabase → Settings → Security → SOC2 Compliance
```

### Configuration Sécurité Renforcée

```typescript
// lib/supabase/config.ts
import { createClient } from '@supabase/supabase-js';

export const supabaseConfig = {
  // Encryption at rest
  encryption: {
    enabled: true,
    algorithm: 'AES-256-GCM',
  },

  // Encryption in transit
  ssl: {
    enabled: true,
    minVersion: 'TLSv1.2',
  },

  // Access control
  security: {
    rls: true, // Row Level Security
    mfa: true, // Multi-Factor Authentication
    sso: true, // Single Sign-On
  },

  // Audit logging
  audit: {
    enabled: true,
    logLevel: 'verbose',
    retention: 28, // days
  },

  // Backup policy
  backup: {
    automated: true,
    frequency: 'daily',
    retention: 14, // days
    encryption: true,
  },
};
```

---

## 👥 PARTIE 2 : RBAC (CONTRÔLE D'ACCÈS BASÉ SUR LES RÔLES)

### Définition des Rôles

```sql
-- ============================================================
-- ROLES DEFINITION
-- ============================================================

-- Create custom roles
CREATE TYPE user_role AS ENUM (
    'viewer',           -- Read-only access
    'editor',           -- Can create/edit content
    'moderator',        -- Can moderate comments/users
    'admin',            -- Full access to app
    'super_admin'       -- System-level access
);

-- Add role to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'viewer';

-- Add team/organization support
CREATE TABLE public.organizations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    
    -- Settings
    settings JSONB DEFAULT '{
        "sso_enabled": false,
        "ip_whitelist": [],
        "allowed_domains": []
    }'::jsonb,
    
    -- SOC2 Compliance
    soc2_enabled BOOLEAN DEFAULT false,
    hipaa_enabled BOOLEAN DEFAULT false,
    
    -- Billing
    plan TEXT DEFAULT 'free', -- 'free', 'pro', 'team', 'enterprise'
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization members
CREATE TABLE public.organization_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    role user_role NOT NULL,
    
    -- Permissions override
    permissions JSONB DEFAULT '{
        "can_read": true,
        "can_write": false,
        "can_delete": false,
        "can_manage_users": false,
        "can_manage_billing": false
    }'::jsonb,
    
    invited_by UUID REFERENCES public.profiles(id),
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    joined_at TIMESTAMPTZ,
    
    UNIQUE(organization_id, user_id)
);

-- RLS Policies
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memberships"
    ON public.organization_members FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage members"
    ON public.organization_members FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.user_id = auth.uid()
            AND om.role IN ('admin', 'super_admin')
        )
    );
```

### Service RBAC

```typescript
// lib/services/rbacService.ts
import { supabase } from '@/lib/supabase/client';

export type UserRole = 'viewer' | 'editor' | 'moderator' | 'admin' | 'super_admin';

export interface Permission {
  can_read: boolean;
  can_write: boolean;
  can_delete: boolean;
  can_manage_users: boolean;
  can_manage_billing: boolean;
}

class RBACService {
  /**
   * Check if user has permission
   */
  async hasPermission(
    userId: string,
    organizationId: string,
    permission: keyof Permission
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select('role, permissions')
        .eq('organization_id', organizationId)
        .eq('user_id', userId)
        .single();

      if (error || !data) return false;

      // Super admin has all permissions
      if (data.role === 'super_admin') return true;

      // Check specific permission
      return data.permissions[permission] === true;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }

  /**
   * Get user role in organization
   */
  async getUserRole(userId: string, organizationId: string): Promise<UserRole | null> {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', organizationId)
        .eq('user_id', userId)
        .single();

      if (error || !data) return null;

      return data.role;
    } catch (error) {
      console.error('Get role error:', error);
      return null;
    }
  }

  /**
   * Assign role to user
   */
  async assignRole(
    userId: string,
    organizationId: string,
    role: UserRole,
    permissions?: Partial<Permission>
  ) {
    try {
      const defaultPermissions: Permission = {
        can_read: true,
        can_write: role !== 'viewer',
        can_delete: ['admin', 'super_admin'].includes(role),
        can_manage_users: ['admin', 'super_admin'].includes(role),
        can_manage_billing: role === 'super_admin',
      };

      const { data, error } = await supabase
        .from('organization_members')
        .upsert({
          organization_id: organizationId,
          user_id: userId,
          role,
          permissions: { ...defaultPermissions, ...permissions },
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Assign role error:', error);
      throw error;
    }
  }

  /**
   * Remove user from organization
   */
  async removeUser(userId: string, organizationId: string) {
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('organization_id', organizationId)
        .eq('user_id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Remove user error:', error);
      throw error;
    }
  }

  /**
   * Get organization members
   */
  async getOrganizationMembers(organizationId: string) {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          *,
          user:profiles(id, email, first_name, last_name, avatar_url)
        `)
        .eq('organization_id', organizationId)
        .order('role', { ascending: false });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Get members error:', error);
      throw error;
    }
  }
}

export const rbacService = new RBACService();
```

### Middleware RBAC

```typescript
// middleware/rbac.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { rbacService } from '@/lib/services/rbacService';

export async function rbacMiddleware(
  request: NextRequest,
  requiredRole: string[] = ['viewer']
) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Get organization from URL or session
  const organizationId = request.nextUrl.searchParams.get('org') || 
                        request.cookies.get('current_org')?.value;

  if (!organizationId) {
    return NextResponse.redirect(new URL('/select-organization', request.url));
  }

  // Check role
  const userRole = await rbacService.getUserRole(user.id, organizationId);

  if (!userRole || !requiredRole.includes(userRole)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return response;
}
```

---

## 🔐 PARTIE 3 : SSO (SINGLE SIGN-ON)

### Configuration SSO SAML

```typescript
// lib/supabase/sso.ts
import { supabase } from './client';

export interface SSOConfig {
  organizationId: string;
  provider: 'saml' | 'azure' | 'google' | 'okta';
  domain: string;
  metadataUrl?: string;
  certificate?: string;
  entryPoint?: string;
  issuer?: string;
}

class SSOService {
  /**
   * Configure SAML SSO
   */
  async configureSAML(config: SSOConfig) {
    try {
      // This requires Enterprise plan and manual setup with Supabase
      // Contact Supabase support to enable SSO

      const { data, error } = await supabase
        .from('organizations')
        .update({
          settings: {
            sso_enabled: true,
            sso_provider: config.provider,
            sso_domain: config.domain,
            sso_config: {
              metadata_url: config.metadataUrl,
              entry_point: config.entryPoint,
              issuer: config.issuer,
            },
          },
        })
        .eq('id', config.organizationId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('SSO configuration error:', error);
      throw error;
    }
  }

  /**
   * Initiate SSO login
   */
  async initiateSSO(domain: string) {
    try {
      // Get organization by domain
      const { data: org } = await supabase
        .from('organizations')
        .select('id, settings')
        .eq('slug', domain)
        .single();

      if (!org || !org.settings.sso_enabled) {
        throw new Error('SSO not configured for this organization');
      }

      // Redirect to SSO provider
      const ssoUrl = `/auth/sso?domain=${domain}`;
      window.location.href = ssoUrl;
    } catch (error) {
      console.error('SSO initiation error:', error);
      throw error;
    }
  }

  /**
   * Handle SSO callback
   */
  async handleSSOCallback(token: string) {
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'saml',
        token,
      });

      if (error) throw error;

      return { success: true, user: data.user };
    } catch (error) {
      console.error('SSO callback error:', error);
      throw error;
    }
  }
}

export const ssoService = new SSOService();
```

### Page Login avec SSO

```typescript
// app/login/page.tsx
'use client';

import React, { useState } from 'react';
import { ssoService } from '@/lib/supabase/sso';
import { supabase } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [useSSODomain, setUseSSODomain] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      window.location.href = '/dashboard';
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleSSOLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await ssoService.initiateSSO(useSSODomain);
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
            FootballHub+
          </h2>
          <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
            Connectez-vous à votre compte
          </p>
        </div>

        {/* SSO Login */}
        <form onSubmit={handleSSOLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Connexion Enterprise (SSO)
            </label>
            <input
              type="text"
              value={useSSODomain}
              onChange={(e) => setUseSSODomain(e.target.value)}
              placeholder="nom-entreprise"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Se connecter avec SSO
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
              ou
            </span>
          </div>
        </div>

        {/* Email/Password Login */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors font-bold"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
```

Suite dans le prochain fichier avec Backups, Log Management et Monitoring ! 🚀
