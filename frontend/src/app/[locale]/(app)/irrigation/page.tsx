'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { irrigationApi } from '@/lib/api';
import toast from 'react-hot-toast';
import PageHeader from '@/components/layout/PageHeader';

interface IrrigationLog {
  _id: string;
  plotId: string;
  volume: number;
  duration: number;
  date: string;
  status: 'COMPLETED' | 'SCHEDULED' | 'IN_PROGRESS';
  method: 'DRIP' | 'SPRINKLER' | 'SURFACE';
  notes?: string;
}

interface IrrigationForm {
  plotId: string;
  volume: number | string;
  duration: number | string;
  date: string;
  status: string;
  method: string;
  notes: string;
}

const EMPTY_FORM: IrrigationForm = {
  plotId: '', volume: '', duration: '',
  date: new Date().toISOString().split('T')[0],
  status: 'COMPLETED', method: 'DRIP', notes: ''
};

const STATUS_MAP: Record<string, { label: string; pill: string }> = {
  COMPLETED:   { label: 'Terminé',    pill: 'pill-green' },
  SCHEDULED:   { label: 'Planifié',   pill: 'pill-blue' },
  IN_PROGRESS: { label: 'En cours',   pill: 'pill-gold' },
};

const METHOD_LABEL: Record<string, string> = {
  DRIP:      'Goutte-à-goutte',
  SPRINKLER: 'Aspersion',
  SURFACE:   'Surface / Gravité',
};

export default function IrrigationPage() {
  const [logs, setLogs] = useState<IrrigationLog[]>([]);
  const [stats, setStats] = useState({ totalVolume: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<IrrigationForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [logsRes, statsRes] = await Promise.all([
        irrigationApi.getAll() as any,
        irrigationApi.getStats() as any,
      ]);
      setLogs(logsRes?.data || []);
      setStats(statsRes?.data || { totalVolume: 0 });
    } catch {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setForm(EMPTY_FORM); setEditingId(null); setShowModal(true); };
  const openEdit = (l: IrrigationLog) => {
    setForm({
      plotId: l.plotId, volume: l.volume, duration: l.duration,
      date: l.date.split('T')[0], status: l.status, method: l.method, notes: l.notes || ''
    });
    setEditingId(l._id);
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditingId(null); setForm(EMPTY_FORM); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        volume: Number(form.volume),
        duration: Number(form.duration),
      };
      if (editingId) {
        await irrigationApi.update(editingId, payload);
        toast.success('Fiche modifiée');
      } else {
        await irrigationApi.create(payload);
        toast.success('Fiche ajoutée');
      }
      closeModal();
      fetchData();
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await irrigationApi.delete(id);
      toast.success('Supprimé');
      setDeleteId(null);
      fetchData();
    } catch {
      toast.error('Erreur');
    }
  };

  return (
    <div className="page active">
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <div className="page-label" style={{ color: 'var(--blue)' }}>Module Irrigation</div>
            <h1 className="page-title">Gestion de l&apos;Eau &amp; Arrosage</h1>
            <div className="page-sub">Suivi des volumes et des sessions · Base de données active</div>
          </div>
          <button onClick={openCreate} style={{ padding: '10px 20px', background: 'rgba(52,152,219,0.15)', border: '1px solid rgba(52,152,219,0.4)', borderRadius: '10px', color: 'var(--blue)', fontFamily: 'var(--font-mono)', fontSize: '12px', cursor: 'pointer' }}>
            ➕ Nouvelle Session
          </button>
        </div>

        {/* KPIs */}
        <div className="kpi-grid kpi-grid-4" style={{ marginBottom: '24px' }}>
          <div className="kpi-card" style={{ '--kpi-color': 'var(--blue)' } as React.CSSProperties}>
            <div className="kpi-icon">💧</div>
            <div className="kpi-label">Volume Total (m³)</div>
            <div className="kpi-value">{loading ? '—' : stats.totalVolume.toFixed(1)}</div>
          </div>
          <div className="kpi-card" style={{ '--kpi-color': 'var(--blue)' } as React.CSSProperties}>
            <div className="kpi-icon">⏱️</div>
            <div className="kpi-label">Dernière Session</div>
            <div className="kpi-value">{loading || logs.length === 0 ? '—' : new Date(logs[0].date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</div>
          </div>
          <div className="kpi-card" style={{ '--kpi-color': 'var(--teal)' } as React.CSSProperties}>
            <div className="kpi-icon">📍</div>
            <div className="kpi-label">Parcelles Actives</div>
            <div className="kpi-value">{loading ? '—' : new Set(logs.map(l => l.plotId)).size}</div>
          </div>
          <div className="kpi-card" style={{ '--kpi-color': 'var(--gold)' } as React.CSSProperties}>
            <div className="kpi-icon">⚙️</div>
            <div className="kpi-label">Méthodes</div>
            <div className="kpi-value">DRIP/ASP</div>
          </div>
        </div>

        {/* Tableau */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title"><div className="dot" style={{ background: 'var(--blue)' }}></div>Journal d&apos;Irrigation</div>
            <div className="panel-action" onClick={fetchData} style={{ cursor: 'pointer' }}>↺ Actualiser</div>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>Chargement…</div>
            ) : logs.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>💧</div>
                <div style={{ color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>Aucun relevé d&apos;irrigation</div>
                <button onClick={openCreate} style={{ marginTop: '16px', padding: '8px 20px', background: 'rgba(52,152,219,0.15)', border: '1px solid rgba(52,152,219,0.4)', borderRadius: '8px', color: 'var(--blue)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>➕ Saisir un relevé</button>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>Date</th><th>Parcelle</th><th>Volume (m³)</th><th>Durée (min)</th><th>Méthode</th><th>Statut</th><th></th></tr>
                </thead>
                <tbody>
                  {logs.map(l => (
                    <tr key={l._id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{new Date(l.date).toLocaleDateString('fr-FR')}</td>
                      <td style={{ fontWeight: 700 }}>{l.plotId}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--blue)' }}>{l.volume} m³</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{l.duration} min</td>
                      <td>{METHOD_LABEL[l.method] || l.method}</td>
                      <td><span className={`pill ${STATUS_MAP[l.status]?.pill || 'pill-green'}`}>{STATUS_MAP[l.status]?.label || l.status}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => openEdit(l)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '14px', marginRight: '8px' }}>✏️</button>
                        <button onClick={() => setDeleteId(l._id)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '14px' }}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border2)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--cream)' }}>{editingId ? '✏️ Modifier Session' : '➕ Nouvelle Session'}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Identifiant Parcelle *</label>
                  <input value={form.plotId} onChange={e => setForm(f => ({ ...f, plotId: e.target.value }))} placeholder="Ex: P1, Zone Nord…" required />
                </div>
                <div className="form-group">
                  <label>Volume (m³) *</label>
                  <input type="number" title="Volume en m³" value={form.volume} onChange={e => setForm(f => ({ ...f, volume: e.target.value }))} min={0} step={0.1} required placeholder="0.0" />
                </div>
                <div className="form-group">
                  <label>Durée (minutes) *</label>
                  <input type="number" title="Durée en minutes" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} min={0} required placeholder="0" />
                </div>
                <div className="form-group">
                  <label>Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Méthode</label>
                  <select title="Méthode d'irrigation" value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))}>
                    <option value="DRIP">Goutte-à-goutte</option>
                    <option value="SPRINKLER">Aspersion</option>
                    <option value="SURFACE">Surface / Gravité</option>
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Statut</label>
                  <select title="Statut de la session" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="COMPLETED">Terminé</option>
                    <option value="SCHEDULED">Planifié</option>
                    <option value="IN_PROGRESS">En cours</option>
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Remarques éventuelles…" rows={3} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={closeModal} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text2)', cursor: 'pointer' }}>Annuler</button>
                <button type="submit" disabled={saving} style={{ flex: 2, padding: '12px', background: 'rgba(52,152,219,0.2)', border: '1px solid rgba(52,152,219,0.4)', borderRadius: '10px', color: 'var(--blue)', cursor: 'pointer', fontWeight: 700 }}>
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Suppression */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--red)', borderRadius: '16px', padding: '28px', maxWidth: '380px', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--cream)', marginBottom: '24px' }}>Supprimer ce relevé ?</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text2)', cursor: 'pointer' }}>Annuler</button>
              <button onClick={() => handleDelete(deleteId)} style={{ flex: 1, padding: '10px', background: 'rgba(192,57,43,0.2)', border: '1px solid rgba(192,57,43,0.4)', borderRadius: '8px', color: '#e87070', cursor: 'pointer', fontWeight: 700 }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
