'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import { AlertTriangle, Network, Server, Ticket, TrendingUp, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useState } from 'react';

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
  const t = useTranslations();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load stats from all modules
      const [assetsRes, networkRes, ticketsRes] = await Promise.all([
        api.get('/api/it-assets/stats'),
        api.get('/api/network/stats'),
        api.get('/api/it-tickets/stats'),
      ]);

      const assetsStats = assetsRes.data.stats;
      const networkStats = networkRes.data.stats;
      const ticketsStats = ticketsRes.data.stats;

      // Aggregate stats
      const dashboardStats: Stats = {
        totalAssets: assetsStats.total || 0,
        assetsThisMonth: 0, // TODO: Calculate from createdAt
        networkDevices: networkStats.total || 0,
        devicesOnline: networkStats.online || 0,
        openTickets: ticketsStats.byStatus?.find((s: any) => s._id !== 'closed' && s._id !== 'resolved')?.count || 0,
        urgentTickets: ticketsStats.byPriority?.find((p: any) => p._id === 'urgent' || p._id === 'critical')?.count || 0,
        adUsers: 0, // TODO: AD integration
        lastAdSync: undefined,
      };

      setStats(dashboardStats);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading IT Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">IT Administration</h1>
          <p className="text-gray-600 mt-1">System monitoring and asset management</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Assets Card */}
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Assets</CardTitle>
            <Server className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats?.totalAssets || 0}</div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">+{stats?.assetsThisMonth || 0}</span>
              <span className="text-gray-500 ml-1">this month</span>
            </div>
          </CardContent>
        </Card>

        {/* Network Devices Card */}
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Network Devices</CardTitle>
            <Network className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats?.networkDevices || 0}</div>
            <div className="flex items-center mt-2 text-sm">
              <div className="flex items-center">
                <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                <span className="text-gray-600">
                  {stats?.devicesOnline || 0} online
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Open Tickets Card */}
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Open Tickets</CardTitle>
            <Ticket className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats?.openTickets || 0}</div>
            <div className="flex items-center mt-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-red-600 mr-1" />
              <span className="text-red-600 font-medium">{stats?.urgentTickets || 0}</span>
              <span className="text-gray-500 ml-1">urgent</span>
            </div>
          </CardContent>
        </Card>

        {/* AD Users Card */}
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">AD Users</CardTitle>
            <Users className="h-5 w-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats?.adUsers || 0}</div>
            <p className="text-xs text-gray-500 mt-2">
              {stats?.lastAdSync ? `Last sync: ${new Date(stats.lastAdSync).toLocaleDateString()}` : 'Not configured'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/it-admin/assets" className="block">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Server className="mr-2 h-5 w-5" />
                IT Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-100 mb-4">Manage servers, workstations, and equipment</p>
              <div className="bg-white text-blue-700 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors text-center">
                View Assets
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/it-admin/network" className="block">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Network className="mr-2 h-5 w-5" />
                Network Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-100 mb-4">Monitor routers, switches, and infrastructure</p>
              <div className="bg-white text-purple-700 px-4 py-2 rounded-md font-medium hover:bg-purple-50 transition-colors text-center">
                View Network
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/it-admin/tickets" className="block">
          <Card className="bg-gradient-to-br from-orange-500 to-orange-700 text-white hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Ticket className="mr-2 h-5 w-5" />
                IT Helpdesk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-100 mb-4">Manage IT support tickets and requests</p>
              <div className="bg-white text-orange-700 px-4 py-2 rounded-md font-medium hover:bg-orange-50 transition-colors text-center">
                View Tickets
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/it-admin/active-directory" className="block">
          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Users className="mr-2 h-5 w-5" />
                Active Directory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-indigo-100 mb-4">Sync users and manage permissions</p>
              <div className="bg-white text-indigo-700 px-4 py-2 rounded-md font-medium hover:bg-indigo-50 transition-colors text-center">
                 Manage AD
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Alerts - Placeholder */}
      {recentAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentAlerts.map((alert) => (
                <div
                  key={alert._id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        alert.severity === 'critical'
                          ? 'bg-red-500'
                          : alert.severity === 'high'
                          ? 'bg-orange-500'
                          : 'bg-yellow-500'
                      }`}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{alert.message}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:underline text-sm font-medium">
                    View details
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
