'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  MonitorCheck, Ticket, AlertCircle, Users, RefreshCw, Plus, 
  Server, Clock, CheckCircle, XCircle, AlertTriangle,
  Search, Filter, ExternalLink, Wifi, WifiOff, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────
interface GlpiTicket {
  id: number;
  name: string;
  status: 1 | 2 | 3 | 4 | 5 | 6; // 1=new 2=assigned 3=planned 4=pending 5=solved 6=closed
  priority: 1 | 2 | 3 | 4 | 5 | 6;
  urgency: number;
  impact: number;
  category?: string;
  assignee?: string;
  requester?: string;
  date_creation: string;
  date_mod: string;
  solvedate?: string;
  type: 1 | 2; // 1=incident 2=request
  content?: string;
}

interface GlpiStats {
  total: number;
  new: number;
  in_progress: number;
  pending: number;
  solved: number;
  closed: number;
  avg_resolution_days?: number;
}

interface GlpiConfig {
  url: string;
  app_token: string;
  user_token: string;
  connected: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  1: { label: 'Nouveau',    color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  icon: <AlertCircle size={12} /> },
  2: { label: 'Assigné',   color: '#f97316', bg: 'rgba(249,115,22,0.12)',  icon: <Clock size={12} /> },
  3: { label: 'Planifié',  color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',  icon: <Clock size={12} /> },
  4: { label: 'En attente',color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: <Clock size={12} /> },
  5: { label: 'Résolu',    color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: <CheckCircle size={12} /> },
  6: { label: 'Fermé',     color: '#6b7280', bg: 'rgba(107,114,128,0.12)', icon: <XCircle size={12} /> },
} as const;

const PRIORITY_CONFIG = {
  1: { label: 'Très basse', color: '#9ca3af' },
  2: { label: 'Basse',      color: '#6b7280' },
  3: { label: 'Moyenne',    color: '#f59e0b' },
  4: { label: 'Haute',      color: '#f97316' },
  5: { label: 'Très haute', color: '#ef4444' },
  6: { label: 'Majeure',    color: '#dc2626' },
} as const;

function StatusBadge({ status }: { status: GlpiTicket['status'] }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '99px', background: cfg.bg, color: cfg.color, fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap' }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function PriorityDot({ priority }: { priority: GlpiTicket['priority'] }) {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: cfg.color, fontWeight: '600' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />
      {cfg.label}
    </span>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}j`;
}

// ─── GLPI Config Form ───────────────────────────────────────────────────────
function GlpiConfigPanel({ config, onSave }: { config: Partial<GlpiConfig>; onSave: (c: Partial<GlpiConfig>) => void }) {
  const [form, setForm] = useState(config);
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    if (!form.url || !form.app_token || !form.user_token) {
      toast.error('Remplissez tous les champs pour tester la connexion');
      return;
    }
    setTesting(true);
    try {
      await apiClient.post('/api/glpi/test', {
        url: form.url,
        app_token: form.app_token,
        user_token: form.user_token,
      });
      toast.success('Connexion GLPI établie avec succès !');
      onSave({ ...form, connected: true });
    } catch {
      toast.error('Échec de la connexion — vérifiez vos paramètres');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text3)]">
            URL de l'instance GLPI
          </label>
          <input
            type="url"
            placeholder="https://glpi.mondomaine.com"
            value={form.url || ''}
            onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl py-3 px-4 text-sm font-mono focus:border-[var(--gold)] outline-none transition-all text-[var(--text)]"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text3)]">
            App Token
          </label>
          <input
            type="password"
            placeholder="••••••••••••••••••••••••"
            value={form.app_token || ''}
            onChange={e => setForm(f => ({ ...f, app_token: e.target.value }))}
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl py-3 px-4 text-sm font-mono focus:border-[var(--gold)] outline-none transition-all text-[var(--text)]"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text3)]">
            User Token
          </label>
          <input
            type="password"
            placeholder="••••••••••••••••••••••••"
            value={form.user_token || ''}
            onChange={e => setForm(f => ({ ...f, user_token: e.target.value }))}
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl py-3 px-4 text-sm font-mono focus:border-[var(--gold)] outline-none transition-all text-[var(--text)]"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleTest}
          disabled={testing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--green)] text-white text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
        >
          {testing ? <RefreshCw size={15} className="animate-spin" /> : <Wifi size={15} />}
          {testing ? 'Test en cours...' : 'Tester la connexion'}
        </button>
        <button
          onClick={() => onSave(form)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--gold)] text-white text-sm font-bold transition-all hover:opacity-90"
        >
          Sauvegarder
        </button>
      </div>
    </div>
  );
}

// ─── New Ticket Modal ────────────────────────────────────────────────────────
function NewTicketModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', content: '', priority: 3, type: 1 });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Le titre est requis'); return; }
    setLoading(true);
    try {
      await apiClient.post('/api/glpi/tickets', form);
      toast.success('Ticket GLPI créé avec succès');
      onCreated();
      onClose();
    } catch {
      toast.error('Impossible de créer le ticket — vérifiez la connexion GLPI');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md bg-[var(--panel)] rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <h2 className="font-black text-lg uppercase tracking-tight text-[var(--text)]">Nouveau Ticket GLPI</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--bg3)] text-[var(--text3)]"><XCircle size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text3)]">Titre du ticket *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Décrire brièvement le problème"
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl py-3 px-4 text-sm focus:border-[var(--gold)] outline-none transition-all text-[var(--text)]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text3)]">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: Number(e.target.value) as 1|2 }))}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl py-3 px-3 text-sm focus:border-[var(--gold)] outline-none text-[var(--text)] appearance-none">
                <option value={1}>Incident</option>
                <option value={2}>Demande</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text3)]">Priorité</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: Number(e.target.value) }))}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl py-3 px-3 text-sm focus:border-[var(--gold)] outline-none text-[var(--text)] appearance-none">
                <option value={1}>Très basse</option>
                <option value={2}>Basse</option>
                <option value={3}>Moyenne</option>
                <option value={4}>Haute</option>
                <option value={5}>Très haute</option>
                <option value={6}>Majeure</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text3)]">Description</label>
            <textarea
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              rows={4}
              placeholder="Décrivez le problème en détail..."
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl py-3 px-4 text-sm focus:border-[var(--gold)] outline-none transition-all text-[var(--text)] resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm font-bold text-[var(--text2)] hover:bg-[var(--bg3)] transition-all">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-[var(--gold)] text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function GlpiPage() {
  const [tickets, setTickets]           = useState<GlpiTicket[]>([]);
  const [stats, setStats]               = useState<GlpiStats | null>(null);
  const [loading, setLoading]           = useState(false);
  const [connected, setConnected]       = useState(false);
  const [showConfig, setShowConfig]     = useState(false);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [glpiConfig, setGlpiConfig]     = useState<Partial<GlpiConfig>>({});

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const [ticketsRes, statsRes] = await Promise.all([
        apiClient.get('/api/glpi/tickets'),
        apiClient.get('/api/glpi/stats'),
      ]);
      setTickets(ticketsRes as GlpiTicket[]);
      setStats(statsRes as GlpiStats);
      setConnected(true);
    } catch {
      setConnected(false);
      // Use mock data for demonstration
      setTickets(MOCK_TICKETS);
      setStats(MOCK_STATS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const filtered = tickets.filter(t => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || String(t.id).includes(search);
    const matchStatus = filterStatus === 'all' || String(t.status) === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleConfigSave = (c: Partial<GlpiConfig>) => {
    setGlpiConfig(c);
    if (c.connected) { setShowConfig(false); fetchTickets(); }
    toast.success('Configuration GLPI sauvegardée');
  };

  return (
    <div className="page active flex flex-col gap-6 p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
        <div className="space-y-1">
          <div className="page-label flex items-center gap-2">
            <Server size={13} className="text-[var(--gold)]" />
            Intégration ITSM
          </div>
          <h1 className="page-title">GLPI — Gestion des tickets</h1>
          <p className="page-sub text-sm opacity-70">Suivi et gestion des incidents & demandes via votre instance GLPI</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Connection badge */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border ${connected ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            {connected ? <Wifi size={13} /> : <WifiOff size={13} />}
            {connected ? 'Connecté à GLPI' : 'Non connecté'}
          </div>
          <button onClick={() => setShowConfig(s => !s)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--text2)] hover:bg-[var(--bg3)] transition-all">
            <Zap size={13} /> Configurer
          </button>
          <button onClick={() => fetchTickets()} disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg3)] text-xs font-bold text-[var(--text2)] hover:bg-[var(--border)] transition-all disabled:opacity-50">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Actualiser
          </button>
          <button onClick={() => setShowNewTicket(true)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[var(--gold)] text-white text-xs font-bold hover:opacity-90 transition-all">
            <Plus size={14} /> Nouveau ticket
          </button>
        </div>
      </div>

      {/* Config Panel */}
      {showConfig && (
        <div className="bg-[var(--panel)] border border-[var(--border)] rounded-2xl p-6 animate-in fade-in slide-in-from-top-1 duration-200">
          <h3 className="font-black text-sm uppercase tracking-widest text-[var(--gold)] mb-5 flex items-center gap-2">
            <Zap size={14} /> Configuration de la connexion GLPI
          </h3>
          <GlpiConfigPanel config={glpiConfig} onSave={handleConfigSave} />
        </div>
      )}

      {/* Stats KPIs */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total', value: stats.total,       color: 'var(--blue)',   icon: <Ticket size={18} /> },
            { label: 'Nouveaux', value: stats.new,      color: '#3b82f6',       icon: <AlertCircle size={18} /> },
            { label: 'En cours', value: stats.in_progress, color: 'var(--gold)', icon: <Clock size={18} /> },
            { label: 'En attente', value: stats.pending,color: '#f59e0b',       icon: <Clock size={18} /> },
            { label: 'Résolus', value: stats.solved,    color: '#10b981',       icon: <CheckCircle size={18} /> },
            { label: 'Fermés', value: stats.closed,     color: 'var(--text3)', icon: <XCircle size={18} /> },
          ].map((kpi, i) => (
            <div key={i} className="bg-[var(--panel)] border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-2 hover:border-[var(--gold)] transition-all">
              <div style={{ color: kpi.color }}>{kpi.icon}</div>
              <div className="text-2xl font-black text-[var(--text)]">{kpi.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text3)]">{kpi.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text3)]" />
          <input
            type="text"
            placeholder="Rechercher un ticket (ID, titre…)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl py-2.5 pl-9 pr-4 text-sm focus:border-[var(--gold)] outline-none text-[var(--text)] transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-[var(--text3)]" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-[var(--bg)] border border-[var(--border)] rounded-xl py-2.5 px-3 text-sm text-[var(--text)] focus:border-[var(--gold)] outline-none appearance-none"
          >
            <option value="all">Tous les statuts</option>
            <option value="1">Nouveau</option>
            <option value="2">Assigné</option>
            <option value="3">Planifié</option>
            <option value="4">En attente</option>
            <option value="5">Résolu</option>
            <option value="6">Fermé</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-[var(--panel)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border)]">
          <h3 className="font-black text-sm uppercase tracking-widest text-[var(--text2)]">Tickets ({filtered.length})</h3>
          {!connected && <span className="text-xs text-amber-500 font-medium">Mode démo — données simulées</span>}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40 text-[var(--text3)]">
            <RefreshCw size={20} className="animate-spin mr-2" /> Chargement…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-[var(--text3)] gap-3">
            <Ticket size={32} className="opacity-30" />
            <p className="text-sm">Aucun ticket correspondant</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--bg3)]">
                    {['#ID', 'Titre', 'Statut', 'Priorité', 'Type', 'Assigné à', 'Créé'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-[var(--text3)]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t, i) => (
                    <tr key={t.id} className={`border-b border-[var(--border)] hover:bg-[var(--bg3)] transition-all ${i % 2 === 0 ? '' : 'bg-[var(--bg)]/30'}`}>
                      <td className="px-4 py-3 font-mono font-bold text-[var(--gold)] text-xs">#{t.id}</td>
                      <td className="px-4 py-3 max-w-xs">
                        <span className="text-[var(--text)] font-medium line-clamp-2 text-sm">{t.name}</span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                      <td className="px-4 py-3"><PriorityDot priority={t.priority} /></td>
                      <td className="px-4 py-3 text-xs font-medium text-[var(--text3)]">{t.type === 1 ? '🔴 Incident' : '🔵 Demande'}</td>
                      <td className="px-4 py-3 text-xs text-[var(--text3)]">{t.assignee || '—'}</td>
                      <td className="px-4 py-3 text-xs text-[var(--text3)]">{timeAgo(t.date_creation)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-[var(--border)]">
              {filtered.map(t => (
                <div key={t.id} className="p-4 flex flex-col gap-2.5 hover:bg-[var(--bg3)] transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs text-[var(--gold)] font-bold">#{t.id}</span>
                      <p className="text-sm font-medium text-[var(--text)] mt-0.5">{t.name}</p>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text3)]">
                    <PriorityDot priority={t.priority} />
                    <span>{t.type === 1 ? '🔴 Incident' : '🔵 Demande'}</span>
                    {t.assignee && <span>👤 {t.assignee}</span>}
                    <span>{timeAgo(t.date_creation)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* New Ticket Modal */}
      {showNewTicket && (
        <NewTicketModal onClose={() => setShowNewTicket(false)} onCreated={fetchTickets} />
      )}
    </div>
  );
}

// ─── Mock data (used when GLPI is not connected) ─────────────────────────────
const MOCK_TICKETS: GlpiTicket[] = [
  { id: 1042, name: 'Imprimante réseau - Hors service bureau RH', status: 2, priority: 4, urgency: 3, impact: 3, category: 'Matériel', assignee: 'Y. Benmoussa', requester: 'K. Alami', date_creation: new Date(Date.now() - 3600000).toISOString(), date_mod: new Date().toISOString(), type: 1 },
  { id: 1041, name: 'Accès VPN - Problème de connexion télétravail', status: 1, priority: 5, urgency: 5, impact: 4, category: 'Réseau', assignee: undefined, requester: 'M. Chraibi', date_creation: new Date(Date.now() - 7200000).toISOString(), date_mod: new Date().toISOString(), type: 1 },
  { id: 1040, name: 'Installation logiciel de comptabilité SAGE', status: 4, priority: 2, urgency: 2, impact: 2, category: 'Logiciels', assignee: 'A. El Fassi', requester: 'O. Mansour', date_creation: new Date(Date.now() - 86400000).toISOString(), date_mod: new Date().toISOString(), type: 2 },
  { id: 1039, name: 'Serveur de fichiers - Espace disque critique', status: 2, priority: 6, urgency: 6, impact: 6, category: 'Serveurs', assignee: 'Y. Benmoussa', requester: 'Admin', date_creation: new Date(Date.now() - 1800000).toISOString(), date_mod: new Date().toISOString(), type: 1 },
  { id: 1038, name: 'Demande accès ERP agricole pour stagiaire', status: 5, priority: 1, urgency: 1, impact: 1, category: 'Utilisateurs', assignee: 'A. El Fassi', requester: 'DRH', date_creation: new Date(Date.now() - 172800000).toISOString(), date_mod: new Date().toISOString(), solvedate: new Date(Date.now() - 43200000).toISOString(), type: 2 },
  { id: 1037, name: 'Mise à jour firmware routeur WiFi terrain', status: 3, priority: 3, urgency: 2, impact: 3, category: 'Réseau', assignee: 'Y. Benmoussa', requester: 'Resp. Terrain', date_creation: new Date(Date.now() - 259200000).toISOString(), date_mod: new Date().toISOString(), type: 2 },
  { id: 1036, name: 'Webcam défectueuse salle de réunion B', status: 6, priority: 2, urgency: 2, impact: 1, category: 'Matériel', assignee: 'A. El Fassi', requester: 'Direction', date_creation: new Date(Date.now() - 432000000).toISOString(), date_mod: new Date().toISOString(), solvedate: new Date(Date.now() - 259200000).toISOString(), type: 1 },
];

const MOCK_STATS: GlpiStats = {
  total: MOCK_TICKETS.length,
  new: MOCK_TICKETS.filter(t => t.status === 1).length,
  in_progress: MOCK_TICKETS.filter(t => t.status === 2 || t.status === 3).length,
  pending: MOCK_TICKETS.filter(t => t.status === 4).length,
  solved: MOCK_TICKETS.filter(t => t.status === 5).length,
  closed: MOCK_TICKETS.filter(t => t.status === 6).length,
  avg_resolution_days: 1.8,
};
