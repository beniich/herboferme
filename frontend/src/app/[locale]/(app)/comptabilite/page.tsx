'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { financeApi } from '@/lib/api';
import toast from 'react-hot-toast';
import PageHeader from '@/components/layout/PageHeader';

interface Transaction {
  _id: string;
  date: string;
  description: string;
  category: string;
  sector: string;
  type: 'recette' | 'depense';
  amount: number;
}

interface TransactionForm {
  description: string;
  category: string;
  sector: string;
  type: 'recette' | 'depense';
  amount: number | string;
  date: string;
}

interface Stats {
  month: { revenue: number; expenses: number; profit: number };
  year: { revenue: number; expenses: number; profit: number };
  bySector: { _id: string; revenue: number; expenses: number }[];
}

const EMPTY_FORM: TransactionForm = {
  description: '', category: 'Ventes', sector: 'Général',
  type: 'recette', amount: '', date: new Date().toISOString().split('T')[0]
};

const CATEGORIES_RECETTE = ['Ventes Animaux', 'Ventes Cultures', 'Ventes Lait', 'Subventions', 'Prestations', 'Autre Recette'];
const CATEGORIES_DEPENSE = ['Intrants Agricoles', 'Alimentation Animaux', 'Santé Vétérinaire', 'Carburant', 'Main d\'œuvre', 'Équipements', 'Engrais & Semences', 'Entretien', 'Charges Fixes', 'Autre Dépense'];
const SECTORS = ['Élevage Bovin', 'Élevage Ovin', 'Volaille', 'Maraîchage', 'Herbes & Aromates', 'Pépinière', 'Forêt', 'Général'];

export default function ComptabilitePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TransactionForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('');
  const [filterSector, setFilterSector] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterType) params.type = filterType;
      if (filterSector) params.sector = filterSector;
      const [txRes, statsRes] = await Promise.all([
        financeApi.getTransactions(params) as any,
        financeApi.getStats() as any,
      ]);
      setTransactions(txRes?.data || []);
      setStats(statsRes?.data || null);
    } catch {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [filterType, filterSector]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = (defaultType?: 'recette' | 'depense') => {
    setForm({ ...EMPTY_FORM, type: defaultType || 'recette' });
    setEditingId(null);
    setShowModal(true);
  };
  const openEdit = (t: Transaction) => {
    setForm({ description: t.description, category: t.category, sector: t.sector, type: t.type, amount: t.amount, date: t.date.split('T')[0] });
    setEditingId(t._id);
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditingId(null); setForm(EMPTY_FORM); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (editingId) {
        await financeApi.updateTransaction(editingId, payload);
        toast.success('Transaction modifiée');
      } else {
        await financeApi.createTransaction(payload);
        toast.success('Transaction enregistrée');
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
      await financeApi.deleteTransaction(id);
      toast.success('Supprimé');
      setDeleteId(null);
      fetchData();
    } catch {
      toast.error('Erreur');
    }
  };

  const categories = form.type === 'recette' ? CATEGORIES_RECETTE : CATEGORIES_DEPENSE;

  return (
    <div className="page active">
      <div style={{ padding: '24px' }}>
        <PageHeader 
          label="Module Finance"
          title="Comptabilité du Domaine"
          subtitle="Recettes & Dépenses · Données réelles depuis la base de données"
          labelColor="var(--gold)"
          actions={
            <>
              <button onClick={() => openCreate('depense')} style={{ padding: '10px 16px', background: 'rgba(192,57,43,0.12)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: '10px', color: '#e87070', fontFamily: 'var(--font-mono)', fontSize: '12px', cursor: 'pointer' }}>
                ➖ Dépense
              </button>
              <button onClick={() => openCreate('recette')} style={{ padding: '10px 16px', background: 'rgba(90,158,69,0.15)', border: '1px solid rgba(90,158,69,0.4)', borderRadius: '10px', color: 'var(--green2)', fontFamily: 'var(--font-mono)', fontSize: '12px', cursor: 'pointer' }}>
                ➕ Recette
              </button>
            </>
          }
        />

        {/* KPIs Stats du mois */}
        <div className="kpi-grid kpi-grid-4" style={{ marginBottom: '24px' }}>
          <div className="kpi-card" style={{ '--kpi-color': 'var(--green)' } as React.CSSProperties}>
            <div className="kpi-icon">📈</div>
            <div className="kpi-label">Recettes (Mois)</div>
            <div className="kpi-value">{stats ? (stats.month.revenue / 1000).toFixed(1) : '—'}<span className="kpi-unit">KDH</span></div>
          </div>
          <div className="kpi-card" style={{ '--kpi-color': 'var(--red)' } as React.CSSProperties}>
            <div className="kpi-icon">📉</div>
            <div className="kpi-label">Dépenses (Mois)</div>
            <div className="kpi-value">{stats ? (stats.month.expenses / 1000).toFixed(1) : '—'}<span className="kpi-unit">KDH</span></div>
          </div>
          <div className="kpi-card" style={{ '--kpi-color': stats && stats.month.profit >= 0 ? 'var(--green)' : 'var(--red)' } as React.CSSProperties}>
            <div className="kpi-icon">💵</div>
            <div className="kpi-label">Bénéfice (Mois)</div>
            <div className={`kpi-value ${stats && stats.month.profit >= 0 ? '' : ''}`}>
              {stats ? (stats.month.profit / 1000).toFixed(1) : '—'}<span className="kpi-unit">KDH</span>
            </div>
            {stats && <div className={`kpi-trend ${stats.month.profit >= 0 ? 'up' : 'down'}`}>{stats.month.profit >= 0 ? '▲' : '▼'} {Math.abs(stats.month.profit / 1000).toFixed(1)} KDH</div>}
          </div>
          <div className="kpi-card" style={{ '--kpi-color': 'var(--gold)' } as React.CSSProperties}>
            <div className="kpi-icon">📊</div>
            <div className="kpi-label">Recettes (Année)</div>
            <div className="kpi-value">{stats ? (stats.year.revenue / 1000).toFixed(0) : '—'}<span className="kpi-unit">KDH</span></div>
          </div>
        </div>

        {/* Filtres + Tableau */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title"><div className="dot" style={{ background: 'var(--gold)' }}></div>Journal des Transactions</div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select title="Filtrer par type" value={filterType} onChange={e => setFilterType(e.target.value)} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text2)', padding: '4px 8px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                <option value="">Tous types</option>
                <option value="recette">Recettes</option>
                <option value="depense">Dépenses</option>
              </select>
              <select title="Filtrer par secteur" value={filterSector} onChange={e => setFilterSector(e.target.value)} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text2)', padding: '4px 8px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                <option value="">Tous secteurs</option>
                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="panel-action" onClick={fetchData} style={{ cursor: 'pointer' }}>↺</div>
            </div>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>Chargement…</div>
            ) : transactions.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>💰</div>
                <div style={{ color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>Aucune transaction enregistrée</div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '16px' }}>
                  <button onClick={() => openCreate('recette')} style={{ padding: '8px 16px', background: 'rgba(90,158,69,0.15)', border: '1px solid rgba(90,158,69,0.4)', borderRadius: '8px', color: 'var(--green2)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>➕ Recette</button>
                  <button onClick={() => openCreate('depense')} style={{ padding: '8px 16px', background: 'rgba(192,57,43,0.12)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: '8px', color: '#e87070', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>➖ Dépense</button>
                </div>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>Date</th><th>Description</th><th>Catégorie</th><th>Secteur</th><th>Type</th><th style={{ textAlign: 'right' }}>Montant (DH)</th><th></th></tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t._id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', whiteSpace: 'nowrap' }}>{new Date(t.date).toLocaleDateString('fr-FR')}</td>
                      <td>{t.description}</td>
                      <td style={{ color: 'var(--text3)', fontSize: '12px' }}>{t.category}</td>
                      <td style={{ color: 'var(--text3)', fontSize: '12px' }}>{t.sector}</td>
                      <td>
                        <span className={`pill ${t.type === 'recette' ? 'pill-green' : 'pill-red'}`}>{t.type === 'recette' ? '▲ Recette' : '▼ Dépense'}</span>
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: t.type === 'recette' ? 'var(--green2)' : '#e87070' }}>
                        {t.type === 'recette' ? '+' : '-'}{t.amount.toLocaleString('fr-FR')}
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button onClick={() => openEdit(t)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '14px', marginRight: '8px' }} title="Modifier">✏️</button>
                        <button onClick={() => setDeleteId(t._id)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '14px' }} title="Supprimer">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Bénéfice par secteur */}
        {stats && stats.bySector.length > 0 && (
          <div className="panel" style={{ marginTop: '18px' }}>
            <div className="panel-header">
              <div className="panel-title"><div className="dot" style={{ background: 'var(--teal)' }}></div>Performance par Secteur</div>
            </div>
            <div className="panel-body">
              {stats.bySector.map(s => {
                const profit = s.revenue - s.expenses;
                return (
                  <div key={s._id} className="fin-row">
                    <div className="fin-label">{s._id}</div>
                    <div style={{ display: 'flex', gap: '16px', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                      <span style={{ color: 'var(--green2)' }}>+{(s.revenue / 1000).toFixed(1)} K</span>
                      <span style={{ color: '#e87070' }}>-{(s.expenses / 1000).toFixed(1)} K</span>
                      <span style={{ fontWeight: 700, color: profit >= 0 ? 'var(--green2)' : '#e87070' }}>{profit >= 0 ? '+' : ''}{(profit / 1000).toFixed(1)} K DH</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal Formulaire Transaction */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border2)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--cream)' }}>
                {editingId ? '✏️ Modifier' : form.type === 'recette' ? '➕ Nouvelle Recette' : '➖ Nouvelle Dépense'}
              </h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              {/* Toggle Recette/Dépense */}
              {!editingId && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '4px' }}>
                  <button type="button" onClick={() => setForm(f => ({ ...f, type: 'recette', category: 'Ventes' }))} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '12px', background: form.type === 'recette' ? 'rgba(90,158,69,0.25)' : 'transparent', color: form.type === 'recette' ? 'var(--green2)' : 'var(--text3)' }}>▲ Recette</button>
                  <button type="button" onClick={() => setForm(f => ({ ...f, type: 'depense', category: 'Intrants Agricoles' }))} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '12px', background: form.type === 'depense' ? 'rgba(192,57,43,0.2)' : 'transparent', color: form.type === 'depense' ? '#e87070' : 'var(--text3)' }}>▼ Dépense</button>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Description *</label>
                  <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Ex: Vente de lait à la coopérative…" required />
                </div>
                <div className="form-group">
                  <label>Catégorie</label>
                  <select title="Catégorie" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Secteur</label>
                  <select title="Secteur" value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}>
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Montant (DH) *</label>
                  <input type="number" title="Montant" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} min={0.01} step={0.01} placeholder="0.00" required />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={closeModal} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>Annuler</button>
                <button type="submit" disabled={saving} style={{ flex: 2, padding: '12px', background: form.type === 'recette' ? 'rgba(90,158,69,0.2)' : 'rgba(192,57,43,0.15)', border: `1px solid ${form.type === 'recette' ? 'rgba(90,158,69,0.4)' : 'rgba(192,57,43,0.3)'}`, borderRadius: '10px', color: form.type === 'recette' ? 'var(--green2)' : '#e87070', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}>
                  {saving ? 'Enregistrement…' : editingId ? 'Enregistrer' : `Ajouter la ${form.type}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dialog Suppression */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--red)', borderRadius: '16px', padding: '28px', maxWidth: '380px', textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚠️</div>
            <h3 style={{ color: 'var(--cream)', marginBottom: '8px' }}>Supprimer cette transaction ?</h3>
            <p style={{ color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: '13px', marginBottom: '24px' }}>Les KPIs seront recalculés automatiquement.</p>
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
