'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import PageHeader from '@/components/layout/PageHeader';
import Link from 'next/link';

interface Stats {
  totalAssets: number;
  assetsThisMonth: number;
  networkDevices: number;
  devicesOnline: number;
  openTickets: number;
  urgentTickets: number;
  adUsers: number;
  lastAdSync?: string;
}

interface Alert {
  _id: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

export default function ITAdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [assetsRes, networkRes, ticketsRes] = await Promise.all([
        api.get('/api/admin/it/assets/stats'),
        api.get('/api/network/stats'),
        api.get('/api/admin/it/tickets/stats'),
      ]);

      const assetsStats = assetsRes?.data?.stats || {};
      const networkStats = networkRes?.data?.stats || {};
      const ticketsStats = ticketsRes?.data?.stats || {};

      setStats({
        totalAssets: assetsStats.total || 0,
        assetsThisMonth: 0,
        networkDevices: networkStats.total || 0,
        devicesOnline: networkStats.online || 0,
        openTickets: ticketsStats.byStatus?.find((s: any) => s._id !== 'closed' && s._id !== 'resolved')?.count || 0,
        urgentTickets: ticketsStats.byPriority?.find((p: any) => p._id === 'urgent' || p._id === 'critical')?.count || 0,
        adUsers: 0,
        lastAdSync: undefined,
      });
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="page active" id="page-it-admin">
        <PageHeader 
          label="Administration IT" 
          title="Moniteur Système & Infrastructure"
          subtitle="Suivi des actifs, du réseau et des tickets de support IT"
        />

        <div className="kpi-grid kpi-grid-4">
          <div className="kpi-card" style={{ '--kpi-color': 'var(--blue)' } as React.CSSProperties}>
            <div className="kpi-icon">🖥️</div>
            <div className="kpi-label">Actifs IT</div>
            <div className="kpi-value">{loading ? '—' : stats?.totalAssets || 0}</div>
          </div>
          <div className="kpi-card" style={{ '--kpi-color': 'var(--purple)' } as React.CSSProperties}>
            <div className="kpi-icon">🌐</div>
            <div className="kpi-label">Réseau (Online)</div>
            <div className="kpi-value">{loading ? '—' : `${stats?.devicesOnline || 0}/${stats?.networkDevices || 0}`}</div>
          </div>
          <div className="kpi-card" style={{ '--kpi-color': 'var(--orange)' } as React.CSSProperties}>
            <div className="kpi-icon">🎫</div>
            <div className="kpi-label">Tickets Ouverts</div>
            <div className="kpi-value">{loading ? '—' : stats?.openTickets || 0}</div>
          </div>
          <div className="kpi-card" style={{ '--kpi-color': 'var(--red)' } as React.CSSProperties}>
            <div className="kpi-icon">⚠️</div>
            <div className="kpi-label">Urgent / Critique</div>
            <div className="kpi-value">{loading ? '—' : stats?.urgentTickets || 0}</div>
          </div>
        </div>

        <div className="kpi-grid kpi-grid-4">
          <Link href="/it-admin/assets" className="panel-card-link">
            <div className="kpi-card" style={{ '--kpi-color': 'var(--blue)', cursor: 'pointer' } as React.CSSProperties}>
               <div className="kpi-icon">📦</div>
               <div className="kpi-label">Inventaire</div>
               <div className="kpi-value">Actifs →</div>
            </div>
          </Link>
          <Link href="/it-admin/network" className="panel-card-link">
            <div className="kpi-card" style={{ '--kpi-color': 'var(--purple)', cursor: 'pointer' } as React.CSSProperties}>
               <div className="kpi-icon">📡</div>
               <div className="kpi-label">Infrastructure</div>
               <div className="kpi-value">Réseau →</div>
            </div>
          </Link>
          <Link href="/it-admin/tickets" className="panel-card-link">
            <div className="kpi-card" style={{ '--kpi-color': 'var(--orange)', cursor: 'pointer' } as React.CSSProperties}>
               <div className="kpi-icon">🛠️</div>
               <div className="kpi-label">Support</div>
               <div className="kpi-value">Tickets →</div>
            </div>
          </Link>
          <Link href="/it-admin/active-directory" className="panel-card-link">
            <div className="kpi-card" style={{ '--kpi-color': 'var(--indigo)', cursor: 'pointer' } as React.CSSProperties}>
               <div className="kpi-icon">👥</div>
               <div className="kpi-label">Annuaire</div>
               <div className="kpi-value">Utilisateurs →</div>
            </div>
          </Link>
        </div>

        {recentAlerts.length > 0 && (
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title"><div className="dot" style={{ background: 'var(--red)' }}></div>Alertes Récentes</div>
            </div>
            <div className="panel-body">
              {recentAlerts.map(alert => (
                <div key={alert._id} className="alert-item">
                  <div className={`alert-indicator ${alert.severity}`}></div>
                  <div className="alert-content">
                    <div className="alert-msg">{alert.message}</div>
                    <div className="alert-time">{new Date(alert.timestamp).toLocaleString('fr-FR')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
