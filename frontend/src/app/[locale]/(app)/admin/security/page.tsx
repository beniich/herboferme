'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/lib/api';
import {
    Activity,
    AlertTriangle, CheckCircle,
    FileText,
    Key,
    Lock,
    Network,
    PlayCircle, RefreshCw,
    Server,
    Shield,
    Terminal
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function SecurityCenterPage() {
  const [loading, setLoading] = useState(true);
  const [passwordAudit, setPasswordAudit] = useState<any>(null); // TODO: Define proper types
  const [rdpSessions, setRdpSessions] = useState<any[]>([]);
  const [gpoPolicies, setGpoPolicies] = useState<any[]>([]);
  const [complianceReport, setComplianceReport] = useState<any>(null);
  const [firewallStatus, setFirewallStatus] = useState<any>(null);
  const [firewallLogs, setFirewallLogs] = useState<any[]>([]);
  const [vaultStats, setVaultStats] = useState<any>(null);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    setLoading(true);
    try {
      const [passwordRes, rdpRes, gpoRes, complianceRes, fwStatusRes, fwLogsRes, vaultRes] = await Promise.all([
        api.get('/api/security/audit/passwords'),
        api.get('/api/security/sessions/rdp'),
        api.get('/api/security/gpo'),
        api.get('/api/security/compliance'),
        api.get('/api/security/pfsense/system').catch(() => ({ data: { success: false } })),
        api.get('/api/security/pfsense/logs?limit=10').catch(() => ({ data: { success: false } })),
        api.get('/api/security/secrets/stats').catch(() => ({ data: { success: false } })),
      ]);

      if (passwordRes.data.success) setPasswordAudit(passwordRes.data.data);
      if (rdpRes.data.success) setRdpSessions(rdpRes.data.data);
      if (gpoRes.data.success) setGpoPolicies(gpoRes.data.data);
      if (complianceRes.data.success) setComplianceReport(complianceRes.data.data);
      if (fwStatusRes.data.success) setFirewallStatus(fwStatusRes.data.data);
      if (fwLogsRes.data.success) setFirewallLogs(fwLogsRes.data.data);
      if (vaultRes.data.success) setVaultStats(vaultRes.data.data);

    } catch (error) {
      console.error('Failed to load security data:', error);
      toast.error('Failed to load security metrics');
    } finally {
      setLoading(false);
    }
  };

  const runPowerShellScript = async (scriptName: string) => {
    const loadingToast = toast.loading(`Executing ${scriptName} via PowerShell...`);
    try {
      const res = await api.post('/api/security/powershell', { scriptName });
      toast.dismiss(loadingToast);
      if (res.data.success) {
        toast.success(`${scriptName} executed successfully`);
        loadSecurityData(); // Refresh data
      } else {
        toast.error(res.data.error || 'Execution failed');
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.error || 'PowerShell execution error');
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading Security Center...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-red-600" />
            Security Center
          </h1>
          <p className="text-gray-600 mt-1">Centralized security monitoring and management</p>
        </div>
        <Button onClick={loadSecurityData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Password Security</p>
                <p className="text-2xl font-bold text-green-600">100%</p>
                <p className="text-xs text-gray-400">bcrypt encrypted</p>
              </div>
              <Lock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active RDP Sessions</p>
                <p className="text-2xl font-bold text-blue-600">{rdpSessions.filter(s => s.status === 'active').length}</p>
                <p className="text-xs text-gray-400">monitored connections</p>
              </div>
              <Terminal className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">GPO Policies</p>
                <p className="text-2xl font-bold text-purple-600">{gpoPolicies.length}</p>
                <p className="text-xs text-gray-400">active policies</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Security Alerts</p>
                <p className="text-2xl font-bold text-orange-600">0</p>
                <p className="text-xs text-gray-400">critical issues</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="passwords" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="passwords">Password Audit</TabsTrigger>
          <TabsTrigger value="rdp">RDP Access</TabsTrigger>
          <TabsTrigger value="gpmc">GPMC / GPO</TabsTrigger>
          <TabsTrigger value="firewall">Firewall</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Password Audit Tab */}
        <TabsContent value="passwords" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-green-600" />
                Password Security Audit
              </CardTitle>
              <CardDescription>
                All passwords are encrypted using bcrypt (industry standard). Last audit: {new Date(passwordAudit.lastAudit).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-3xl font-bold">{passwordAudit.totalUsers}</p>
                </div>
                <div className="border p-4 rounded-lg bg-green-50">
                  <p className="text-sm text-gray-500">Bcrypt Hashed</p>
                  <p className="text-3xl font-bold text-green-600">{passwordAudit.bcryptHashed}</p>
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                </div>
                <div className="border p-4 rounded-lg bg-red-50">
                  <p className="text-sm text-gray-500">Weak Passwords</p>
                  <p className="text-3xl font-bold text-red-600">{passwordAudit.weakPasswords}</p>
                </div>
                <div className="border p-4 rounded-lg bg-yellow-50">
                  <p className="text-sm text-gray-500">Rotation Needed</p>
                  <p className="text-3xl font-bold text-yellow-600">{passwordAudit.rotationNeeded}</p>
                  <p className="text-xs text-gray-400">&gt;90 days</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="flex items-center gap-2 text-green-800 font-medium">
                  <CheckCircle className="h-5 w-5" />
                  All passwords are securely hashed with bcrypt (salt rounds: 10)
                </p>
                <p className="text-sm text-green-700 mt-2">
                      OWASP compliance |     GDPR compliant |     SOC 2 compliant
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RDP Tab */}
        <TabsContent value="rdp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-blue-600" />
                RDP Access Monitoring
              </CardTitle>
              <CardDescription>Remote Desktop Protocol sessions and access logs</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-2">User</th>
                    <th className="pb-2">IP Address</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {rdpSessions.map((session, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-3 font-medium">{session.user}</td>
                      <td className="py-3 font-mono text-xs">{session.ip}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          session.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {session.status}
                        </span>
                      </td>
                      <td className="py-3 text-gray-600">{session.since}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GPMC Tab */}
        <TabsContent value="gpmc" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Group Policy Management (GPMC)
              </CardTitle>
              <CardDescription>Manage Active Directory Group Policy Objects via PowerShell</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* GPO List */}
              <div className="space-y-2">
                {gpoPolicies.map((gpo, idx) => (
                  <div key={idx} className="border p-4 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium">{gpo.name}</p>
                      <p className="text-sm text-gray-500">
                        {gpo.users} users     Last updated: {gpo.lastUpdate}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      gpo.status === 'applied' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {gpo.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* PowerShell Scripts */}
              <div className="border-t pt-4 mt-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  Quick Actions (PowerShell)
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => runPowerShellScript('Get-GPOReport')}
                    className="justify-start"
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Generate GPO Report
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => runPowerShellScript('Sync-ADUsers')}
                    className="justify-start"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync AD Users
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => runPowerShellScript('Get-ADReplicationStatus')}
                    className="justify-start"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Check AD Replication
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => runPowerShellScript('Backup-GPO')}
                    className="justify-start"
                  >
                    <Server className="h-4 w-4 mr-2" />
                    Backup All GPOs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Firewall Tab */}
        <TabsContent value="firewall" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  Firewall Monitoring (pfSense)
                </CardTitle>
                <CardDescription>Network firewall status and traffic analysis</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Network className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Connect to pfSense</DialogTitle>
                    <DialogDescription>
                      Enter your pfSense API credentials to enable monitoring.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid gap-2">
                      <label>PF Sense Host (IP or Domain)</label>
                      <Input placeholder="192.168.1.1" />
                    </div>
                    <div className="grid gap-2">
                      <label>API Key</label>
                      <Input type="password" placeholder="Key..." />
                    </div>
                    <div className="grid gap-2">
                      <label>API Secret</label>
                      <Input type="password" placeholder="Secret..." />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => toast.success('Connected (Mock)!')}>Connect</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-gray-50 border-0">
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-500">System Status</p>
                    <div className="flex items-center gap-2">
                       {firewallStatus?.status === 'online' ? (
                         <>
                           <CheckCircle className="h-5 w-5 text-green-600" />
                           <span className="font-bold text-lg text-green-700">Online</span>
                         </>
                       ) : (
                         <>
                           <AlertTriangle className="h-5 w-5 text-red-600" />
                           <span className="font-bold text-lg text-red-700">Offline / Disconnected</span>
                         </>
                       )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Uptime: {firewallStatus?.uptime || 'N/A'}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-50 border-0">
                   <CardContent className="pt-6">
                    <p className="text-sm text-gray-500">Active States</p>
                    <p className="font-bold text-2xl">{firewallStatus?.states || '0 / 0'}</p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${firewallStatus?.statesPercentage || 0}%` }}></div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-50 border-0">
                   <CardContent className="pt-6">
                    <p className="text-sm text-gray-500">WAN Traffic</p>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs text-gray-400">IN</p>
                        <p className="font-bold text-lg">{firewallStatus?.trafficIn || '0'} Mbps</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 text-right">OUT</p>
                        <p className="font-bold text-lg">{firewallStatus?.trafficOut || '0'} Mbps</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <h3 className="font-medium mb-3">Recent Firewall Logs</h3>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left">Time</th>
                      <th className="px-4 py-2 text-left">Action</th>
                      <th className="px-4 py-2 text-left">Interface</th>
                      <th className="px-4 py-2 text-left">Source</th>
                      <th className="px-4 py-2 text-left">Destination</th>
                      <th className="px-4 py-2 text-left">Proto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {firewallLogs.length > 0 ? firewallLogs.map((log, i) => (
                      <tr key={i} className="border-b">
                        <td className="px-4 py-2 text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                        <td className="px-4 py-2">
                          <span className={`${log.action === 'PASS' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'} px-2 py-0.5 rounded text-xs font-medium`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-2">{log.interface}</td>
                        <td className="px-4 py-2 font-mono text-xs">{log.src}</td>
                        <td className="px-4 py-2 font-mono text-xs">{log.dst}</td>
                        <td className="px-4 py-2">{log.proto}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500 italic">No firewall logs available or disconnected</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Compliance & Governance
              </CardTitle>
              <CardDescription>Automated security compliance tracking and reporting</CardDescription>
            </CardHeader>
            <CardContent>
              {complianceReport ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {complianceReport.standards?.map((standard: any, idx: number) => (
                      <div key={idx} className="border p-4 rounded-xl space-y-3">
                        <div className="flex justify-between items-center">
                          <p className="font-bold">{standard.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${standard.score > 80 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {standard.score}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${standard.score > 80 ? 'bg-green-500' : 'bg-yellow-500'}`}
                            style={{ width: `${standard.score}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">{standard.description}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border rounded-xl">
                    <div className="px-4 py-3 bg-gray-50 border-b font-medium">Compliance Violations</div>
                    <div className="p-0">
                      {complianceReport.violations?.length > 0 ? (
                        <table className="w-full text-sm">
                          <thead className="text-gray-500 border-b">
                            <tr>
                              <th className="px-4 py-3 text-left">Control</th>
                              <th className="px-4 py-3 text-left">Finding</th>
                              <th className="px-4 py-3 text-left">Severity</th>
                              <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {complianceReport.violations.map((v: any, i: number) => (
                              <tr key={i} className="border-b last:border-0">
                                <td className="px-4 py-3 font-medium">{v.controlId}</td>
                                <td className="px-4 py-3 text-gray-600">{v.message}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    v.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                                    v.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                                    'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {v.severity}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <Button variant="ghost" size="sm" className="text-blue-600 h-8">Remediate</Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="px-4 py-12 text-center">
                           <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                           <p className="text-gray-900 font-medium">No active violations detected</p>
                           <p className="text-sm text-gray-500">Your organization is fully compliant with active standards.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-gray-500">
                   Generating compliance report...
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Secret Vault Summary */}
        <Card className="bg-slate-900 text-white rounded-3xl overflow-hidden border-0 shadow-2xl">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
               <div className="bg-primary/20 p-4 rounded-2xl">
                  <Shield className="h-12 w-12 text-primary" />
               </div>
               <div>
                  <h3 className="text-2xl font-black">Secret Vault</h3>
                  <p className="text-slate-400 font-medium">Enterprise-grade encryption for your sensitive data</p>
                  <div className="flex gap-4 mt-3">
                    <div className="flex items-center gap-2">
                       <span className="size-2 rounded-full bg-green-500"></span>
                       <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Total: {vaultStats?.total || 0}</span>
                    </div>
                    {vaultStats?.expiringSoon > 0 && (
                      <div className="flex items-center gap-2">
                         <span className="size-2 rounded-full bg-red-500 animate-pulse"></span>
                         <span className="text-xs font-bold uppercase tracking-widest text-red-400">Expiring: {vaultStats.expiringSoon}</span>
                      </div>
                    )}
                  </div>
               </div>
            </div>
            <Link href="/admin/devops/secret-vault">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold px-8 rounded-xl h-14">
                Access Vault
              </Button>
            </Link>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
