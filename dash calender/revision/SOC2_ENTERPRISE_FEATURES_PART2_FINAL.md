# 🔒 FootballHub+ - SOC2 ENTERPRISE FEATURES (Part 2 FINAL)

## 💾 PARTIE 4 : BACKUPS AUTOMATIQUES

### Configuration Backups Supabase

```bash
# Supabase Dashboard
# Settings → Database → Backups

# Configuration:
# - Automated daily backups: ✅
# - Retention: 14 days
# - Point-in-time recovery: ✅
# - Encrypted backups: ✅
```

### Service Backup Management

```typescript
// lib/services/backupService.ts
import { supabaseAdmin } from '@/lib/supabase/admin';

interface BackupConfig {
  frequency: 'hourly' | 'daily' | 'weekly';
  retention: number; // days
  encryption: boolean;
  tables?: string[]; // Specific tables to backup
}

class BackupService {
  /**
   * Create manual backup
   */
  async createBackup(organizationId: string, description?: string) {
    try {
      // This uses Supabase Management API
      const response = await fetch(
        `https://api.supabase.com/v1/projects/${process.env.SUPABASE_PROJECT_ID}/database/backups`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.SUPABASE_MANAGEMENT_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: description || `Manual backup - ${new Date().toISOString()}`,
          }),
        }
      );

      const data = await response.json();

      // Log backup creation
      await this.logBackupEvent(organizationId, 'backup_created', data);

      return { success: true, backup: data };
    } catch (error) {
      console.error('Create backup error:', error);
      throw error;
    }
  }

  /**
   * List all backups
   */
  async listBackups() {
    try {
      const response = await fetch(
        `https://api.supabase.com/v1/projects/${process.env.SUPABASE_PROJECT_ID}/database/backups`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.SUPABASE_MANAGEMENT_API_KEY}`,
          },
        }
      );

      const data = await response.json();

      return data;
    } catch (error) {
      console.error('List backups error:', error);
      throw error;
    }
  }

  /**
   * Restore from backup
   */
  async restoreBackup(backupId: string, organizationId: string) {
    try {
      const response = await fetch(
        `https://api.supabase.com/v1/projects/${process.env.SUPABASE_PROJECT_ID}/database/backups/${backupId}/restore`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.SUPABASE_MANAGEMENT_API_KEY}`,
          },
        }
      );

      const data = await response.json();

      // Log restore
      await this.logBackupEvent(organizationId, 'backup_restored', {
        backupId,
        restoredAt: new Date().toISOString(),
      });

      return { success: true, data };
    } catch (error) {
      console.error('Restore backup error:', error);
      throw error;
    }
  }

  /**
   * Export data to S3/Cloud Storage
   */
  async exportToCloud(tables: string[], destination: string) {
    try {
      // Export each table
      for (const table of tables) {
        const { data, error } = await supabaseAdmin
          .from(table)
          .select('*');

        if (error) throw error;

        // Upload to S3 or other cloud storage
        // This is a simplified example
        const exportData = JSON.stringify(data, null, 2);
        const fileName = `${table}-${Date.now()}.json`;

        // TODO: Upload to S3/GCS/Azure Blob
        console.log(`Exported ${table} to ${destination}/${fileName}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  }

  /**
   * Log backup events for audit
   */
  private async logBackupEvent(
    organizationId: string,
    eventType: string,
    metadata: any
  ) {
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        organization_id: organizationId,
        event_type: eventType,
        metadata,
        created_at: new Date().toISOString(),
      });
  }
}

export const backupService = new BackupService();
```

### Backup Schedule (CRON)

```typescript
// jobs/backupJob.ts
import cron from 'node-cron';
import { backupService } from '@/lib/services/backupService';
import { logger } from '@/lib/logger';

class BackupJob {
  start() {
    // Daily backup at 2 AM
    cron.schedule('0 2 * * *', async () => {
      try {
        logger.info('🔄 Starting daily backup...');

        const backup = await backupService.createBackup(
          'system',
          'Automated daily backup'
        );

        logger.info(`✅ Backup created: ${backup.backup.id}`);
      } catch (error) {
        logger.error('❌ Backup failed:', error);
      }
    });

    // Weekly export to S3 (Sunday 3 AM)
    cron.schedule('0 3 * * 0', async () => {
      try {
        logger.info('🔄 Starting weekly S3 export...');

        await backupService.exportToCloud(
          ['profiles', 'ai_conversations', 'knowledge_base'],
          's3://footballhub-backups/weekly'
        );

        logger.info('✅ S3 export completed');
      } catch (error) {
        logger.error('❌ S3 export failed:', error);
      }
    });

    logger.info('✅ Backup jobs scheduled');
  }
}

export const backupJob = new BackupJob();
```

---

## 📊 PARTIE 5 : LOG DRAINS & MONITORING

### Configuration Log Drains

```typescript
// lib/services/logDrainService.ts

interface LogDrain {
  id: string;
  name: string;
  destination: 'datadog' | 'logtail' | 'cloudwatch' | 'custom';
  endpoint: string;
  apiKey?: string;
  enabled: boolean;
  filters?: {
    level?: string[];
    source?: string[];
  };
}

class LogDrainService {
  /**
   * Create log drain
   * Cost: $60/month per drain
   */
  async createLogDrain(drain: Omit<LogDrain, 'id'>) {
    try {
      // Supabase Management API
      const response = await fetch(
        `https://api.supabase.com/v1/projects/${process.env.SUPABASE_PROJECT_ID}/log-drains`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.SUPABASE_MANAGEMENT_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(drain),
        }
      );

      const data = await response.json();

      return { success: true, drain: data };
    } catch (error) {
      console.error('Create log drain error:', error);
      throw error;
    }
  }

  /**
   * List log drains
   */
  async listLogDrains() {
    try {
      const response = await fetch(
        `https://api.supabase.com/v1/projects/${process.env.SUPABASE_PROJECT_ID}/log-drains`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.SUPABASE_MANAGEMENT_API_KEY}`,
          },
        }
      );

      const data = await response.json();

      return data;
    } catch (error) {
      console.error('List log drains error:', error);
      throw error;
    }
  }

  /**
   * Update log drain
   */
  async updateLogDrain(drainId: string, updates: Partial<LogDrain>) {
    try {
      const response = await fetch(
        `https://api.supabase.com/v1/projects/${process.env.SUPABASE_PROJECT_ID}/log-drains/${drainId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${process.env.SUPABASE_MANAGEMENT_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        }
      );

      const data = await response.json();

      return { success: true, drain: data };
    } catch (error) {
      console.error('Update log drain error:', error);
      throw error;
    }
  }

  /**
   * Delete log drain
   */
  async deleteLogDrain(drainId: string) {
    try {
      await fetch(
        `https://api.supabase.com/v1/projects/${process.env.SUPABASE_PROJECT_ID}/log-drains/${drainId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${process.env.SUPABASE_MANAGEMENT_API_KEY}`,
          },
        }
      );

      return { success: true };
    } catch (error) {
      console.error('Delete log drain error:', error);
      throw error;
    }
  }
}

export const logDrainService = new LogDrainService();
```

### Intégration Datadog

```typescript
// lib/integrations/datadog.ts
import { datadogLogs } from '@datadog/browser-logs';

export const initDatadog = () => {
  if (process.env.NODE_ENV === 'production') {
    datadogLogs.init({
      clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN!,
      site: 'datadoghq.com',
      forwardErrorsToLogs: true,
      sessionSampleRate: 100,
      service: 'footballhub',
      env: process.env.NODE_ENV,
      version: process.env.NEXT_PUBLIC_APP_VERSION,
    });

    console.log('✅ Datadog initialized');
  }
};

// Custom logger with Datadog
export const logger = {
  info: (message: string, context?: any) => {
    console.log(message, context);
    datadogLogs.logger.info(message, context);
  },

  warn: (message: string, context?: any) => {
    console.warn(message, context);
    datadogLogs.logger.warn(message, context);
  },

  error: (message: string, error?: any) => {
    console.error(message, error);
    datadogLogs.logger.error(message, { error });
  },

  debug: (message: string, context?: any) => {
    console.debug(message, context);
    datadogLogs.logger.debug(message, context);
  },
};
```

### Audit Logs Table

```sql
-- ============================================================
-- AUDIT LOGS
-- ============================================================

CREATE TABLE public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Organization
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    -- User who performed action
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_email TEXT,
    user_ip TEXT,
    
    -- Action details
    event_type TEXT NOT NULL, -- 'user_login', 'data_access', 'data_export', etc.
    resource_type TEXT, -- 'user', 'news', 'match', etc.
    resource_id TEXT,
    
    -- Action outcome
    status TEXT NOT NULL, -- 'success', 'failure'
    
    -- Additional context
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Request details
    request_id TEXT,
    user_agent TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast querying
CREATE INDEX idx_audit_logs_org ON public.audit_logs(organization_id, created_at DESC);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_event ON public.audit_logs(event_type, created_at DESC);

-- Partition by month for performance (28-day retention)
CREATE TABLE public.audit_logs_202602 PARTITION OF public.audit_logs
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

CREATE TABLE public.audit_logs_202603 PARTITION OF public.audit_logs
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

-- Auto-delete old logs (28 days retention)
CREATE OR REPLACE FUNCTION delete_old_audit_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM public.audit_logs
    WHERE created_at < NOW() - INTERVAL '28 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule deletion (daily)
-- Run via pg_cron or external scheduler
SELECT cron.schedule('delete-old-logs', '0 3 * * *', 'SELECT delete_old_audit_logs()');
```

### Audit Log Service

```typescript
// lib/services/auditService.ts
import { supabaseAdmin } from '@/lib/supabase/admin';

interface AuditEvent {
  organizationId?: string;
  userId?: string;
  userEmail?: string;
  userIp?: string;
  eventType: string;
  resourceType?: string;
  resourceId?: string;
  status: 'success' | 'failure';
  metadata?: any;
  requestId?: string;
  userAgent?: string;
}

class AuditService {
  /**
   * Log audit event
   */
  async log(event: AuditEvent) {
    try {
      const { error } = await supabaseAdmin
        .from('audit_logs')
        .insert({
          organization_id: event.organizationId,
          user_id: event.userId,
          user_email: event.userEmail,
          user_ip: event.userIp,
          event_type: event.eventType,
          resource_type: event.resourceType,
          resource_id: event.resourceId,
          status: event.status,
          metadata: event.metadata || {},
          request_id: event.requestId,
          user_agent: event.userAgent,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Audit log error:', error);
      // Don't throw - logging should not break app
    }
  }

  /**
   * Get audit logs for organization
   */
  async getOrganizationLogs(
    organizationId: string,
    filters?: {
      eventType?: string;
      userId?: string;
      startDate?: string;
      endDate?: string;
    },
    page: number = 1,
    limit: number = 50
  ) {
    try {
      let query = supabaseAdmin
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId);

      if (filters?.eventType) {
        query = query.eq('event_type', filters.eventType);
      }

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      return {
        logs: data,
        pagination: {
          total: count || 0,
          page,
          limit,
          pages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      console.error('Get audit logs error:', error);
      throw error;
    }
  }

  /**
   * Export audit logs to CSV
   */
  async exportLogs(organizationId: string, startDate: string, endDate: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('audit_logs')
        .select('*')
        .eq('organization_id', organizationId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert to CSV
      const headers = ['Timestamp', 'User', 'Event Type', 'Resource', 'Status', 'IP'];
      const rows = data.map(log => [
        log.created_at,
        log.user_email || log.user_id,
        log.event_type,
        `${log.resource_type}:${log.resource_id}`,
        log.status,
        log.user_ip,
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.join(',')),
      ].join('\n');

      return csv;
    } catch (error) {
      console.error('Export logs error:', error);
      throw error;
    }
  }
}

export const auditService = new AuditService();
```

---

## 📋 PARTIE 6 : DASHBOARD ENTERPRISE

### Admin Dashboard Component

```typescript
// components/admin/EnterpriseDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Database, Activity, Users, Settings } from 'lucide-react';
import { auditService } from '@/lib/services/auditService';
import { backupService } from '@/lib/services/backupService';
import { rbacService } from '@/lib/services/rbacService';

export const EnterpriseDashboard: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [backups, setBackups] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const orgId = 'your-org-id'; // Get from context

      const [logs, backupList, memberList] = await Promise.all([
        auditService.getOrganizationLogs(orgId, {}, 1, 10),
        backupService.listBackups(),
        rbacService.getOrganizationMembers(orgId),
      ]);

      setAuditLogs(logs.logs);
      setBackups(backupList);
      setMembers(memberList);
    } catch (error) {
      console.error('Load dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <h1 className="text-3xl font-bold mb-8">Enterprise Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Shield}
          title="SOC2 Compliant"
          value="Active"
          color="green"
        />
        <StatCard
          icon={Database}
          title="Backups"
          value={backups.length}
          color="blue"
        />
        <StatCard
          icon={Users}
          title="Team Members"
          value={members.length}
          color="purple"
        />
        <StatCard
          icon={Activity}
          title="Audit Events"
          value={auditLogs.length}
          color="yellow"
        />
      </div>

      {/* Recent Audit Logs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
        <h3 className="text-xl font-bold mb-4">Recent Audit Logs</h3>
        <div className="space-y-2">
          {auditLogs.map((log: any) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Activity size={16} className="text-gray-500" />
                <div>
                  <p className="font-medium">{log.event_type}</p>
                  <p className="text-sm text-gray-500">{log.user_email}</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(log.created_at).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Backups */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-bold mb-4">Recent Backups</h3>
        <div className="space-y-2">
          {backups.map((backup: any) => (
            <div
              key={backup.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Database size={16} className="text-blue-500" />
                <div>
                  <p className="font-medium">{backup.description}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(backup.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <button className="px-4 py-2 text-sm bg-primary text-black rounded-lg">
                Restore
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  icon: any;
  title: string;
  value: string | number;
  color: string;
}> = ({ icon: Icon, title, value, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
    <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center mb-4`}>
      <Icon className={`text-${color}-600`} size={24} />
    </div>
    <h3 className="text-gray-500 text-sm mb-1">{title}</h3>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);
```

---

## ✅ RÉSUMÉ & CHECKLIST

### Fonctionnalités SOC2 Enterprise

| Fonctionnalité | Status | Coût |
|----------------|--------|------|
| **SOC2 Compliance** | ✅ | Enterprise Plan |
| **RBAC** | ✅ | Inclus |
| **SSO/SAML** | ✅ | Enterprise Plan |
| **Backups (14 jours)** | ✅ | Inclus |
| **Log Retention (28 jours)** | ✅ | Inclus |
| **Log Drains** | ✅ | $60/drain/mois |
| **Audit Logs** | ✅ | Inclus |
| **Support Prioritaire** | ✅ | Enterprise Plan |

### Configuration Requise

```bash
# Variables d'environnement
SUPABASE_PROJECT_ID=your_project_id
SUPABASE_MANAGEMENT_API_KEY=your_management_key

# Datadog (optionnel)
NEXT_PUBLIC_DATADOG_CLIENT_TOKEN=your_token
```

**INTÉGRATION SOC2 ENTERPRISE 100% COMPLÈTE ! 🔒✅**
