"use client"

import DashboardTemplate from "@/components/devops-dashboards/shared/DashboardTemplate"
import { Badge } from "@/components/ui/badge"
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { securityApi } from '@/lib/api'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface Secret {
  _id: string;
  name: string;
  category: string;
  environment: string;
  description: string;
  lastAccessed: string;
  lastRotation: string;
  expiresAt: string;
}

export default function SecretVaultPage() {
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
  const [revealedValue, setRevealedValue] = useState<string>('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newSecret, setNewSecret] = useState({
    name: '',
    value: '',
    category: 'API_KEY',
    environment: 'production',
    description: ''
  });

  useEffect(() => {
    loadSecrets();
  }, []);

  const loadSecrets = async () => {
    try {
      const data = await securityApi.getSecrets();
      setSecrets(data);
    } catch {
      toast.error('Failed to load secrets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await securityApi.createSecret(newSecret);
      toast.success('Secret created successfully');
      setIsCreateOpen(false);
      setNewSecret({ name: '', value: '', category: 'API_KEY', environment: 'production', description: '' });
      loadSecrets();
    } catch (error: unknown) {
      const message = (error as any).response?.data?.error || 'Creation failed';
      toast.error(message);
    }
  };

  const handleReveal = async (id: string) => {
    if (revealedSecret === id) {
      setRevealedSecret(null);
      setRevealedValue('');
      return;
    }

    try {
      const data = await securityApi.revealSecret(id);
      setRevealedSecret(id);
      setRevealedValue(data.value);
      toast.success('Secret revealed');
    } catch {
      toast.error('Access denied or failed to reveal');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this secret? This cannot be undone.')) return;
    try {
      await securityApi.deleteSecret(id);
      toast.success('Secret deleted');
      loadSecrets();
    } catch {
      toast.error('Deletion failed');
    }
  };

  const filteredSecrets = secrets.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  const kpis = [
      {
          title: 'Total Secrets',
          value: secrets.length.toString(),
          icon: 'vault',
          iconColor: 'primary'
      },
      {
          title: 'Active Rotations',
          value: '4',
          icon: 'sync',
          iconColor: 'emerald'
      },
      {
          title: 'Expiring Soon',
          value: '0',
          icon: 'alarm',
          iconColor: 'amber'
      },
      {
          title: 'Compliance',
          value: 'Passed',
          icon: 'verified_user',
          iconColor: 'emerald'
      }
  ]

  return (
    <DashboardTemplate
        title="Secret Vault"
        icon="encrypted"
        kpis={kpis}
    >
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 bg-white dark:bg-white/5 px-6 py-3 rounded-2xl border border-slate-200 dark:border-white/5 flex-1 max-w-xl shadow-sm">
                <span className="material-symbols-outlined text-slate-400">search</span>
                <input
                    type="text"
                    placeholder="Search secrets by name or category..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium outline-none"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <button className="px-6 py-3 bg-primary text-white font-black rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">add</span>
                  New Secret
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="font-display font-black uppercase tracking-tight">Add New Secret</DialogTitle>
                  <DialogDescription>
                    Store a sensitive value in the encrypted vault.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 font-display">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Secret Name</label>
                    <Input
                      placeholder="e.g. STRIPE_PROD_KEY"
                      value={newSecret.name}
                      onChange={(e) => setNewSecret({...newSecret, name: e.target.value})}
                      className="rounded-xl border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Value (will be encrypted)</label>
                    <Input
                      type="password"
                      placeholder="sk_test_..."
                      value={newSecret.value}
                      onChange={(e) => setNewSecret({...newSecret, value: e.target.value})}
                      className="rounded-xl border-slate-200"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Category</label>
                      <Select
                        value={newSecret.category}
                        onValueChange={(v) => setNewSecret({...newSecret, category: v})}
                      >
                        <SelectTrigger className="rounded-xl border-slate-200">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="API_KEY">API Key</SelectItem>
                          <SelectItem value="DB_PASSWORD">DB Password</SelectItem>
                          <SelectItem value="SSL_CERT">SSL Certificate</SelectItem>
                          <SelectItem value="SSH_KEY">SSH Key</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Environment</label>
                      <Select
                        value={newSecret.environment}
                        onValueChange={(v) => setNewSecret({...newSecret, environment: v})}
                      >
                        <SelectTrigger className="rounded-xl border-slate-200">
                          <SelectValue placeholder="Env" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="production">Production</SelectItem>
                          <SelectItem value="staging">Staging</SelectItem>
                          <SelectItem value="development">Development</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Description</label>
                    <Input
                      placeholder="What is this used for?"
                      value={newSecret.description}
                      onChange={(e) => setNewSecret({...newSecret, description: e.target.value})}
                      className="rounded-xl border-slate-200"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreate} className="w-full bg-primary hover:bg-primary-dark rounded-xl font-black uppercase tracking-widest h-12">Store Secret</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {loading ? (
              <div className="col-span-full py-20 text-center text-slate-500 font-bold animate-pulse font-display">
                Accessing Vault Securely...
              </div>
            ) : filteredSecrets.length > 0 ? (
              filteredSecrets.map((secret) => (
                <Card key={secret._id} className="group hover:border-primary/50 transition-all duration-300 rounded-3xl overflow-hidden border-slate-200 dark:border-white/5 bg-white dark:bg-white/5">
                  <CardContent className="p-6 font-display">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                          <span className="material-symbols-outlined">
                              {secret.category === 'API_KEY' ? 'key' : secret.category === 'DB_PASSWORD' ? 'lock' : 'security'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-black text-lg group-hover:text-primary transition-colors tracking-tight">{secret.name}</h3>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-[8px] uppercase font-black tracking-widest border-slate-200 dark:border-white/10 px-2">
                              {secret.category}
                            </Badge>
                            <Badge className={`${secret.environment === 'production' ? 'bg-rose-500' : 'bg-primary'} text-[8px] uppercase font-black tracking-widest px-2`}>
                              {secret.environment}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                            className="size-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                            onClick={() => handleReveal(secret._id)}
                        >
                          <span className="material-symbols-outlined text-xl">
                              {revealedSecret === secret._id ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                        <button
                            className="size-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                            onClick={() => handleDelete(secret._id)}
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {revealedSecret === secret._id ? (
                        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-primary/20 font-mono text-sm break-all flex justify-between items-center animate-in slide-in-from-top-2">
                          <span className="text-primary font-bold overflow-hidden text-ellipsis mr-4">{revealedValue}</span>
                          <button
                            className="px-4 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-primary/20"
                            onClick={() => {
                                navigator.clipboard.writeText(revealedValue);
                                toast.success('Copied to clipboard');
                            }}
                          >
                            Copy
                          </button>
                        </div>
                      ) : (
                        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-white/5 font-mono text-sm text-slate-300 dark:text-slate-700 select-none">

                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          Last: {secret.lastAccessed ? new Date(secret.lastAccessed).toLocaleTimeString() : 'Never'}
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="material-symbols-outlined text-sm">update</span>
                           Rotate: {new Date(secret.lastRotation).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-24 text-center bg-slate-50 dark:bg-white/5 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-white/10">
                <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">lock_reset</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No secrets secured</h3>
                <p className="text-sm text-slate-500 font-medium">Search for something else or create a new entry.</p>
              </div>
            )}
        </div>

        <div className="p-8 bg-amber-500/5 rounded-[32px] border border-amber-500/10 flex gap-6 items-start relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-8xl text-amber-500">lock_open</span>
            </div>
            <div className="size-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-amber-500">gpp_maybe</span>
            </div>
            <div className="text-sm relative z-10">
              <p className="font-black text-amber-500 uppercase tracking-widest mb-1">Security Best Practice</p>
              <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-3xl">
                Avoid reusing secrets across environments. Production secrets are automatically enrolled in
                <span className="text-slate-900 dark:text-white font-bold mx-1">Advanced Audit Logging</span>
                and rotation reminders are sent every 90 days.
              </p>
            </div>
        </div>
      </div>
    </DashboardTemplate>
  );
}
