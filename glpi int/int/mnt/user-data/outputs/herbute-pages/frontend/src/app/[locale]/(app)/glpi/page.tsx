'use client';
/**
 * app/[locale]/(app)/glpi/page.tsx
 * Tableau GLPI 11 éditable — modification inline des tickets
 */

import { useState, useEffect, useCallback } from 'react';
import { apiHelpers } from '@/lib/api';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface GlpiTicket {
  id:             number;
  name:           string;
  status:         number;   // 1=Nouveau 2=En cours (attrib) 3=En cours (plan) 4=En attente 5=Résolu 6=Fermé
  priority:       number;   // 1-6
  type:           number;   // 1=Incident 2=Demande
  content:        string;
  date_creation:  string;
  date_mod:       string;
  users_id_assign?: number;
  assignee_name?: string;
  category_name?: string;
  entities_id:    number;
}

const STATUS_MAP: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: 'Nouveau',            color: '#60a5fa', bg: 'rgba(96,165,250,0.12)'  },
  2: { label: 'En cours (attrib.)', color: '#fb923c', bg: 'rgba(251,146,60,0.12)'  },
  3: { label: 'En cours (planif.)', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  4: { label: 'En attente',         color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  5: { label: 'Résolu',             color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
  6: { label: 'Fermé',              color: '#9ca3af', bg: 'rgba(156,163,175,0.1)'  },
};

const PRIORITY_MAP: Record<number, { label: string; color: string }> = {
  1: { label: 'Très basse', color: '#9ca3af' },
  2: { label: 'Basse',      color: '#6b8f5e' },
  3: { label: 'Normale',    color: '#c49a2e' },
  4: { label: 'Haute',      color: '#fb923c' },
  5: { label: 'Très haute', color: '#ef4444' },
  6: { label: 'Critique',   color: '#dc2626' },
};

const TYPE_MAP: Record<number, string> = { 1: 'Incident', 2: 'Demande' };

// ─────────────────────────────────────────────
// Page principale
// ─────────────────────────────────────────────
export default function GlpiPage() {
  const [tickets,    setTickets]    = useState<GlpiTicket[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [editingId,  setEditingId]  = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Partial<GlpiTicket>>({});
  const [saving,     setSaving]     = useState(false);
  const [filters,    setFilters]    = useState({ status: 'all', priority: 'all', type: 'all', search: '' });
  const [page,       setPage]       = useState(1);
  const [total,      setTotal]      = useState(0);
  const [lastSync,   setLastSync]   = useState<string | null>(null);
  const [syncing,    setSyncing]    = useState(false);
  const PER_PAGE = 25;

  // ── Chargement ──────────────────────────────
  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiHelpers.glpi.getTickets({
        page, limit: PER_PAGE,
        status:   filters.status   !== 'all' ? filters.status   : undefined,
        priority: filters.priority !== 'all' ? filters.priority : undefined,
        type:     filters.type     !== 'all' ? filters.type     : undefined,
        search:   filters.search   || undefined,
      });
      setTickets(data.data);
      setTotal(data.total);
      setLastSync(data.lastSync);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur de connexion à GLPI.');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  // ── Modification inline ──────────────────────
  const startEdit = (ticket: GlpiTicket) => {
    setEditingId(ticket.id);
    setEditValues({
      name:     ticket.name,
      status:   ticket.status,
      priority: ticket.priority,
      type:     ticket.type,
      content:  ticket.content,
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditValues({}); };

  const saveEdit = async (ticketId: number) => {
    setSaving(true);
    try {
      await apiHelpers.glpi.updateTicket(ticketId, editValues);
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, ...editValues } : t));
      setEditingId(null);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de la mise à jour GLPI.');
    } finally { setSaving(false); }
  };

  // ── Sync manuelle ──────────────────────────
  const handleSync = async () => {
    setSyncing(true);
    try {
      await apiHelpers.glpi.sync();
      await loadTickets();
    } finally { setSyncing(false); }
  };

  // ── Filtrage ────────────────────────────────
  const resetFilters = () => setFilters({ status: 'all', priority: 'all', type: 'all', search: '' });
  const hasFilters   = filters.status !== 'all' || filters.priority !== 'all' || filters.type !== 'all' || filters.search;

  // ── Stats rapides ───────────────────────────
  const stats = {
    total:   total,
    nouveau: tickets.filter(t => t.status === 1).length,
    enCours: tickets.filter(t => t.status === 2 || t.status === 3).length,
    resolu:  tickets.filter(t => t.status === 5 || t.status === 6).length,
    critique:tickets.filter(t => t.priority >= 5).length,
  };

  // ─────────────────────────────────────────────
  return (
    <div style={{ padding: '28px', fontFamily: 'system-ui, sans-serif', background: '#0a0702', minHeight: '100vh' }}>

      {/* ── En-tête ───────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '22px' }}>🖥️</span>
            <h1 style={{ color: '#f5e6c8', fontSize: '22px', fontWeight: '800', margin: 0 }}>GLPI 11 — Tickets</h1>
            <span style={{ fontSize: '11px', padding: '3px 8px', background: 'rgba(107,143,94,0.15)', border: '1px solid rgba(107,143,94,0.3)', borderRadius: '100px', color: '#6b8f5e', fontWeight: '700' }}>LIVE</span>
          </div>
          {lastSync && <p style={{ color: '#4a3d28', fontSize: '12px', margin: 0 }}>Dernière sync : {new Date(lastSync).toLocaleString('fr-FR')}</p>}
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <a href={`${process.env.NEXT_PUBLIC_GLPI_URL}/front/ticket.php`} target="_blank" rel="noopener noreferrer"
            style={{ padding: '9px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#9a8060', borderRadius: '10px', fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>
            🔗 Ouvrir GLPI
          </a>
          <button onClick={handleSync} disabled={syncing}
            style={{ padding: '9px 16px', background: 'rgba(196,154,46,0.12)', border: '1px solid rgba(196,154,46,0.25)', color: '#c49a2e', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>
            {syncing ? '⏳ Sync...' : '🔄 Synchroniser'}
          </button>
          <a href={`${process.env.NEXT_PUBLIC_GLPI_URL}/front/ticket.form.php`} target="_blank" rel="noopener noreferrer"
            style={{ padding: '9px 16px', background: 'linear-gradient(135deg,#8b6920,#c49a2e)', color: '#050401', borderRadius: '10px', fontSize: '13px', textDecoration: 'none', fontWeight: '700' }}>
            + Nouveau ticket
          </a>
        </div>
      </div>

      {/* ── Statistiques ───────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total',    value: stats.total,    color: '#9a8060' },
          { label: 'Nouveaux', value: stats.nouveau,  color: '#60a5fa' },
          { label: 'En cours', value: stats.enCours,  color: '#f59e0b' },
          { label: 'Résolus',  value: stats.resolu,   color: '#34d399' },
          { label: 'Critiques',value: stats.critique, color: '#ef4444' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
            <p style={{ fontSize: '28px', fontWeight: '900', color, margin: '0 0 4px' }}>{value}</p>
            <p style={{ fontSize: '11px', color: '#4a3d28', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── Filtres ────────────────────────────── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text" placeholder="🔍 Rechercher un ticket..."
          value={filters.search}
          onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
          style={{ flex: '1', minWidth: '220px', padding: '9px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#f5e6c8', fontSize: '13px', outline: 'none' }}
        />
        <FilterSelect label="Statut"    value={filters.status}   onChange={v => setFilters(p => ({ ...p, status: v }))}
          options={[{ v: 'all', l: 'Tous statuts' }, ...Object.entries(STATUS_MAP).map(([k,v]) => ({ v: k, l: v.label }))]} />
        <FilterSelect label="Priorité"  value={filters.priority} onChange={v => setFilters(p => ({ ...p, priority: v }))}
          options={[{ v: 'all', l: 'Toutes priorités' }, ...Object.entries(PRIORITY_MAP).map(([k,v]) => ({ v: k, l: v.label }))]} />
        <FilterSelect label="Type"      value={filters.type}     onChange={v => setFilters(p => ({ ...p, type: v }))}
          options={[{ v: 'all', l: 'Tous types' }, ...Object.entries(TYPE_MAP).map(([k,v]) => ({ v: k, l: v }))]} />
        {hasFilters && (
          <button onClick={resetFilters} style={{ padding: '9px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#9a8060', borderRadius: '10px', cursor: 'pointer', fontSize: '12px' }}>
            ✕ Réinitialiser
          </button>
        )}
      </div>

      {/* ── Erreur ─────────────────────────────── */}
      {error && (
        <div style={{ padding: '16px 20px', background: 'rgba(224,92,92,0.08)', border: '1px solid rgba(224,92,92,0.2)', borderRadius: '12px', color: '#e05c5c', marginBottom: '20px', fontSize: '14px' }}>
          ❌ {error} — <a href={process.env.NEXT_PUBLIC_GLPI_URL} target="_blank" style={{ color: '#c49a2e' }}>Vérifier la connexion GLPI</a>
        </div>
      )}

      {/* ── Tableau ────────────────────────────── */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['#', 'Titre', 'Statut', 'Priorité', 'Type', 'Assigné à', 'Créé le', 'Modifié', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6b5a3e', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} style={{ padding: '14px' }}><div style={{ height: '14px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', width: j === 1 ? '80%' : '60%', animation: 'pulse 1.5s infinite' }}/></td>
                    ))}
                  </tr>
                ))
              ) : tickets.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '48px', color: '#4a3d28', fontSize: '14px' }}>
                  {hasFilters ? 'Aucun ticket correspond aux filtres.' : 'Aucun ticket trouvé dans GLPI.'}
                </td></tr>
              ) : tickets.map(ticket => {
                const isEditing = editingId === ticket.id;
                const status    = STATUS_MAP[ticket.status]   ?? STATUS_MAP[1];
                const priority  = PRIORITY_MAP[ticket.priority] ?? PRIORITY_MAP[3];

                return (
                  <tr
                    key={ticket.id}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: isEditing ? 'rgba(196,154,46,0.05)' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (!isEditing) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}
                    onMouseLeave={e => { if (!isEditing) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    {/* ID */}
                    <td style={{ padding: '12px 14px', color: '#4a3d28', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                      #{ticket.id}
                    </td>

                    {/* Titre — éditable */}
                    <td style={{ padding: '12px 14px', maxWidth: '280px' }}>
                      {isEditing ? (
                        <input
                          value={editValues.name ?? ''}
                          onChange={e => setEditValues(p => ({ ...p, name: e.target.value }))}
                          style={{ width: '100%', padding: '6px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(196,154,46,0.4)', borderRadius: '6px', color: '#f5e6c8', fontSize: '13px', outline: 'none' }}
                        />
                      ) : (
                        <span style={{ color: '#d4c09a', fontSize: '13px', fontWeight: '500', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={ticket.name}>
                          {ticket.name}
                        </span>
                      )}
                    </td>

                    {/* Statut — éditable */}
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      {isEditing ? (
                        <select
                          value={editValues.status}
                          onChange={e => setEditValues(p => ({ ...p, status: parseInt(e.target.value) }))}
                          style={{ padding: '5px 8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(196,154,46,0.4)', borderRadius: '6px', color: '#f5e6c8', fontSize: '12px', outline: 'none' }}
                        >
                          {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                      ) : (
                        <span style={{ padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '600', background: status.bg, color: status.color }}>
                          {status.label}
                        </span>
                      )}
                    </td>

                    {/* Priorité — éditable */}
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      {isEditing ? (
                        <select
                          value={editValues.priority}
                          onChange={e => setEditValues(p => ({ ...p, priority: parseInt(e.target.value) }))}
                          style={{ padding: '5px 8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(196,154,46,0.4)', borderRadius: '6px', color: '#f5e6c8', fontSize: '12px', outline: 'none' }}
                        >
                          {Object.entries(PRIORITY_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                      ) : (
                        <span style={{ fontSize: '12px', fontWeight: '600', color: priority.color, display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: priority.color, display: 'inline-block', flexShrink: 0 }}/>
                          {priority.label}
                        </span>
                      )}
                    </td>

                    {/* Type — éditable */}
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      {isEditing ? (
                        <select
                          value={editValues.type}
                          onChange={e => setEditValues(p => ({ ...p, type: parseInt(e.target.value) }))}
                          style={{ padding: '5px 8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(196,154,46,0.4)', borderRadius: '6px', color: '#f5e6c8', fontSize: '12px', outline: 'none' }}
                        >
                          {Object.entries(TYPE_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#7a6545' }}>{TYPE_MAP[ticket.type] ?? '—'}</span>
                      )}
                    </td>

                    {/* Assigné */}
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: '12px', color: '#7a6545' }}>{ticket.assignee_name ?? '—'}</span>
                    </td>

                    {/* Dates */}
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '11px', color: '#4a3d28' }}>
                        {new Date(ticket.date_creation).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '11px', color: '#4a3d28' }}>
                        {new Date(ticket.date_mod).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => saveEdit(ticket.id)}
                            disabled={saving}
                            style={{ padding: '5px 12px', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                          >
                            {saving ? '⏳' : '✓ Sauver'}
                          </button>
                          <button
                            onClick={cancelEdit}
                            style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#6b5a3e', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => startEdit(ticket)}
                            title="Modifier"
                            style={{ padding: '5px 10px', background: 'rgba(196,154,46,0.08)', border: '1px solid rgba(196,154,46,0.15)', color: '#c49a2e', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                          >
                            ✏️
                          </button>
                          <a
                            href={`${process.env.NEXT_PUBLIC_GLPI_URL}/front/ticket.form.php?id=${ticket.id}`}
                            target="_blank" rel="noopener noreferrer"
                            title="Ouvrir dans GLPI"
                            style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#6b5a3e', borderRadius: '6px', fontSize: '12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                          >
                            🔗
                          </a>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ─────────────────────── */}
        {total > PER_PAGE && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ color: '#4a3d28', fontSize: '12px' }}>
              {((page - 1) * PER_PAGE) + 1}–{Math.min(page * PER_PAGE, total)} sur {total} tickets
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#9a8060', borderRadius: '8px', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '13px', opacity: page === 1 ? 0.4 : 1 }}>
                ←
              </button>
              {Array.from({ length: Math.min(5, Math.ceil(total / PER_PAGE)) }).map((_, i) => {
                const p = i + 1;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    style={{ padding: '6px 12px', background: page === p ? 'linear-gradient(135deg,#8b6920,#c49a2e)' : 'rgba(255,255,255,0.05)', border: page === p ? 'none' : '1px solid rgba(255,255,255,0.08)', color: page === p ? '#050401' : '#9a8060', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: page === p ? '700' : '400' }}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => p + 1)} disabled={page * PER_PAGE >= total}
                style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#9a8060', borderRadius: '8px', cursor: page * PER_PAGE >= total ? 'not-allowed' : 'pointer', fontSize: '13px', opacity: page * PER_PAGE >= total ? 0.4 : 1 }}>
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: {
  label: string; value: string;
  onChange: (v: string) => void;
  options: { v: string; l: string }[];
}) {
  return (
    <select
      value={value} onChange={e => onChange(e.target.value)}
      style={{ padding: '9px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: value !== 'all' ? '#c49a2e' : '#7a6545', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
    >
      {options.map(({ v, l }) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}
