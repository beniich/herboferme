'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { animalsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import PageHeader from '@/components/layout/PageHeader';

interface Animal {
  _id: string;
  type: string;
  breed: string;
  category: string;
  count: number;
  averageAge: number;
  status: string;
  estimatedValue: number;
  notes?: string;
  createdAt: string;
}

interface AnimalForm {
  type: string;
  breed: string;
  category: string;
  count: number | string;
  averageAge: number | string;
  status: string;
  estimatedValue: number | string;
  notes: string;
}

const EMPTY_FORM: AnimalForm = {
  type: '', breed: '', category: 'LIVESTOCK', count: '', averageAge: '', status: 'ACTIVE', estimatedValue: '', notes: ''
};

const STATUS_MAP: Record<string, { label: string; pill: string }> = {
  PRODUCTION: { label: 'En production', pill: 'pill-green' },
  ACTIVE:     { label: 'Actif',         pill: 'pill-green' },
  GROWING:    { label: 'Croissance',    pill: 'pill-gold' },
  LAYING:     { label: 'En ponte',      pill: 'pill-blue' },
  SICK:       { label: 'Malade',        pill: 'pill-red' },
  SOLD:       { label: 'Vendu',         pill: 'pill-brown' },
};

interface AnimalsPageProps {
  category?: string;
  pageTitle?: string;
  pageLabel?: string;
  pageIcon?: string;
}

export default function ElevagePage({ 
  category = 'LIVESTOCK', 
  pageTitle = 'Gestion du Cheptel Bovin & Ovin', 
  pageLabel = 'Module Élevage', 
  pageIcon = '🐄' 
}: AnimalsPageProps) {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [stats, setStats] = useState({ totalAnimals: 0, totalValue: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AnimalForm>({ ...EMPTY_FORM, category });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [animRes, statsRes] = await Promise.all([
        animalsApi.getAll({ category }) as any,
        animalsApi.getStats({ category }) as any,
      ]);
      setAnimals(animRes?.data || []);
      setStats(statsRes?.data || { totalAnimals: 0, totalValue: 0 });
    } catch {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setForm(EMPTY_FORM); setEditingId(null); setShowModal(true); };
  const openEdit = (a: Animal) => {
    setForm({ type: a.type, breed: a.breed, category: a.category, count: a.count, averageAge: a.averageAge, status: a.status, estimatedValue: a.estimatedValue, notes: a.notes || '' });
    setEditingId(a._id);
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditingId(null); setForm(EMPTY_FORM); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, count: Number(form.count), averageAge: Number(form.averageAge), estimatedValue: Number(form.estimatedValue) };
      if (editingId) {
        await animalsApi.update(editingId, payload);
        toast.success('Animal modifié');
      } else {
        await animalsApi.create(payload);
        toast.success('Animal ajouté');
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
      await animalsApi.delete(id);
      toast.success('Supprimé');
      setDeleteId(null);
      fetchData();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const totalTetes = animals.reduce((s, a) => s + a.count, 0);
  const totalVal = animals.reduce((s, a) => s + a.estimatedValue, 0);

  return (
    <div className="page active" id="page-elevage">
      <div style={{ padding: '24px' }}>

        <PageHeader 
          label={pageLabel}
          title={pageTitle}
          subtitle="Suivi en temps réel · Données depuis la base de données"
          labelColor="var(--amber)"
          actions={
            <button
              onClick={openCreate}
              style={{ padding: '10px 20px', background: 'rgba(200,146,26,0.15)', border: '1px solid rgba(200,146,26,0.4)', borderRadius: '10px', color: 'var(--gold2)', fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '1px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              ➕ Ajouter {category === 'POULTRY' ? 'un lot' : 'un animal'}
            </button>
          }
        />

        {/* KPI Cards */}
        <div className="kpi-grid kpi-grid-4" style={{ marginBottom: '24px' }}>
          <div className="kpi-card" style={{ '--kpi-color': 'var(--amber)' } as React.CSSProperties}>
            <div className="kpi-icon">{pageIcon}</div>
            <div className="kpi-label">Effectif Total</div>
            <div className="kpi-value">{loading ? '—' : totalTetes}<span className="kpi-unit">{category === 'POULTRY' ? 'sujets' : 'têtes'}</span></div>
          </div>
          <div className="kpi-card" style={{ '--kpi-color': 'var(--gold)' } as React.CSSProperties}>
            <div className="kpi-icon">💰</div>
            <div className="kpi-label">Valeur Estimée</div>
            <div className="kpi-value">{loading ? '—' : (totalVal / 1000).toFixed(0)}<span className="kpi-unit">KDH</span></div>
          </div>
          <div className="kpi-card" style={{ '--kpi-color': 'var(--green)' } as React.CSSProperties}>
            <div className="kpi-icon">📋</div>
            <div className="kpi-label">Groupes / Lots</div>
            <div className="kpi-value">{loading ? '—' : animals.length}<span className="kpi-unit">lots</span></div>
          </div>
          <div className="kpi-card" style={{ '--kpi-color': 'var(--red)' } as React.CSSProperties}>
            <div className="kpi-icon">⚠️</div>
            <div className="kpi-label">En Alerte</div>
            <div className="kpi-value">{loading ? '—' : animals.filter(a => a.status === 'SICK').length}<span className="kpi-unit">lots</span></div>
          </div>
        </div>

        {/* Table */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title"><div className="dot" style={{ background: 'var(--amber)' }}></div>Inventaire Cheptel</div>
            <div className="panel-action" onClick={fetchData} style={{ cursor: 'pointer' }}>↺ Actualiser</div>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>Chargement…</div>
            ) : animals.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{pageIcon}</div>
                <div style={{ color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>Aucune donnée enregistrée</div>
                <button onClick={openCreate} style={{ marginTop: '16px', padding: '8px 20px', background: 'rgba(200,146,26,0.15)', border: '1px solid rgba(200,146,26,0.4)', borderRadius: '8px', color: 'var(--gold2)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>➕ Ajouter le premier lot</button>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Type</th><th>Race</th><th>Nb</th><th>Âge Moy.</th><th>Statut</th><th style={{ textAlign: 'right' }}>Valeur (DH)</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {animals.map(a => (
                    <tr key={a._id}>
                      <td>{pageIcon} {a.type}</td>
                      <td>{a.breed}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{a.count}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{a.averageAge} mois</td>
                      <td><span className={`pill ${STATUS_MAP[a.status]?.pill || 'pill-green'}`}>{STATUS_MAP[a.status]?.label || a.status}</span></td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--gold2)' }}>{a.estimatedValue.toLocaleString('fr-FR')}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => openEdit(a)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '14px', marginRight: '8px' }} title="Modifier">✏️</button>
                        <button onClick={() => setDeleteId(a._id)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '14px' }} title="Supprimer">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modal Formulaire */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border2)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--cream)' }}>{editingId ? '✏️ Modifier' : `➕ Ajouter ${category === 'POULTRY' ? 'un lot' : 'un animal'}`}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Type d&apos;animal *</label>
                  <input type="text" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} placeholder="Ex: Vaches laitières, Brebis…" required />
                </div>
                <div className="form-group">
                  <label>Race *</label>
                  <input type="text" value={form.breed} onChange={e => setForm(f => ({ ...f, breed: e.target.value }))} placeholder="Ex: Holstein, Sardi…" required />
                </div>
                <div className="form-group">
                  <label>Catégorie</label>
                  <select title="Catégorie de l'animal" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    <option value="LIVESTOCK">Élevage (Bovin/Ovin)</option>
                    <option value="POULTRY">Volaille</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Nombre de têtes *</label>
                  <input type="number" title="Nombre de têtes" value={form.count} onChange={e => setForm(f => ({ ...f, count: e.target.value }))} min={1} required placeholder="0" />
                </div>
                <div className="form-group">
                  <label>Âge moyen (mois) *</label>
                  <input type="number" title="Âge moyen en mois" value={form.averageAge} onChange={e => setForm(f => ({ ...f, averageAge: e.target.value }))} min={0} step={0.1} required placeholder="0" />
                </div>
                <div className="form-group">
                  <label>Statut</label>
                  <select title="Statut de l'animal" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="ACTIVE">Actif</option>
                    <option value="PRODUCTION">En production</option>
                    <option value="GROWING">Croissance</option>
                    <option value="LAYING">En ponte</option>
                    <option value="SICK">Malade</option>
                    <option value="SOLD">Vendu</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Valeur estimée (DH)</label>
                  <input type="number" value={form.estimatedValue} onChange={e => setForm(f => ({ ...f, estimatedValue: e.target.value }))} min={0} placeholder="0" />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Observations, traitements, remarques…" rows={3} style={{ resize: 'vertical' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={closeModal} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>Annuler</button>
                <button type="submit" disabled={saving} style={{ flex: 2, padding: '12px', background: 'rgba(200,146,26,0.2)', border: '1px solid rgba(200,146,26,0.4)', borderRadius: '10px', color: 'var(--gold2)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '1px', fontWeight: 700 }}>
                  {saving ? 'Enregistrement…' : editingId ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dialog Confirmation Suppression */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--red)', borderRadius: '16px', padding: '28px', maxWidth: '380px', textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚠️</div>
            <h3 style={{ color: 'var(--cream)', marginBottom: '8px' }}>Confirmer la suppression</h3>
            <p style={{ color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: '13px', marginBottom: '24px' }}>Cette action est irréversible.</p>
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
