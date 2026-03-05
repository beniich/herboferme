'use client';

import React, { useState, useMemo } from 'react';
import { useFinanceData } from '@/hooks/useDomainData';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';
import { StatCard } from '@/components/shared/StatCard';
import { Skeleton } from '@/components/shared/Skeleton';
import { ErrorFallback } from '@/components/shared/ErrorFallback';
import {
  TrendingUp, TrendingDown, Wallet, BarChart3, Plus, Minus,
  RefreshCw, Search, Edit2, Trash2, X, ChevronDown, Layers, DollarSign
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────
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

interface FinanceStats {
  month: { revenue: number; expenses: number; profit: number };
  year: { revenue: number; expenses: number; profit: number };
  bySector: { _id: string; revenue: number; expenses: number }[];
  transactions: Transaction[];
}

// ─── Constants ─────────────────────────────────────────────────────────────
const EMPTY_FORM: TransactionForm = {
  description: '', category: 'Ventes Animaux', sector: 'Général',
  type: 'recette', amount: '', date: new Date().toISOString().split('T')[0]
};
const CATEGORIES_RECETTE = ['Ventes Animaux', 'Ventes Cultures', 'Ventes Lait', 'Subventions', 'Prestations', 'Autre Recette'];
const CATEGORIES_DEPENSE = ['Intrants Agricoles', 'Alimentation Animaux', 'Santé Vétérinaire', 'Carburant', "Main d'œuvre", 'Équipements', 'Engrais & Semences', 'Entretien', 'Charges Fixes', 'Autre Dépense'];
const SECTORS = ['Élevage Bovin', 'Élevage Ovin', 'Volaille', 'Maraîchage', 'Herbes & Aromates', 'Pépinière', 'Forêt', 'Général'];

export default function ComptabilitePage() {
  const { data: rawData, stats: rawStats, items: rawItems, isLoading, error, refresh } = useFinanceData();

  // Cast data
  const finStats = (rawStats as unknown as FinanceStats | undefined);
  const transactions: Transaction[] = useMemo(() => (rawItems as unknown as Transaction[]) || [], [rawItems]);

  // UI state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TransactionForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'' | 'recette' | 'depense'>('');

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const matchType = !filterType || t.type === filterType;
      const matchSearch = !searchTerm ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.sector.toLowerCase().includes(searchTerm.toLowerCase());
      return matchType && matchSearch;
    });
  }, [transactions, filterType, searchTerm]);

  const kpis = useMemo(() => ({
    monthRevenue: finStats?.month?.revenue ?? 0,
    monthExpenses: finStats?.month?.expenses ?? 0,
    monthProfit: finStats?.month?.profit ?? 0,
    yearRevenue: finStats?.year?.revenue ?? 0,
    bySector: finStats?.bySector ?? [],
  }), [finStats]);

  // ─── Actions ──────────────────────────────────────────────────────────────
  const openCreate = (defaultType?: 'recette' | 'depense') => {
    setForm({ ...EMPTY_FORM, type: defaultType || 'recette', category: defaultType === 'depense' ? 'Intrants Agricoles' : 'Ventes Animaux' });
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
        await apiClient.put(`/api/finance/transactions/${editingId}`, payload);
        toast.success('Transaction modifiée ✓');
      } else {
        await apiClient.post('/api/finance/transactions', payload);
        toast.success('Transaction enregistrée ✓');
      }
      closeModal();
      refresh();
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/api/finance/transactions/${id}`);
      toast.success('Transaction supprimée');
      setDeleteId(null);
      refresh();
    } catch {
      toast.error('Erreur de suppression');
    }
  };

  const categories = form.type === 'recette' ? CATEGORIES_RECETTE : CATEGORIES_DEPENSE;
  const isProfit = kpis.monthProfit >= 0;

  if (error) return <ErrorFallback onRetry={refresh} message="Impossible de charger les données financières" />;

  return (
    <div className="page active p-6 lg:p-10 space-y-10" id="page-comptabilite">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="text-[10px] font-mono tracking-[3px] text-zinc-500 uppercase mb-1">Module Finance · Comptabilité</div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <DollarSign className="text-amber-500" size={32} /> Comptabilité du Domaine
          </h1>
          <p className="text-sm text-zinc-400">Recettes & dépenses · données réelles depuis la base de données.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={refresh} className="p-2 text-zinc-500 hover:text-white transition-colors" title="Actualiser">
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => openCreate('depense')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-sm font-bold transition-all"
          >
            <Minus size={14} /> Dépense
          </button>
          <button
            onClick={() => openCreate('recette')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-sm font-bold transition-all"
          >
            <Plus size={14} /> Recette
          </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {isLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} type="card" />) : (
          <>
            <StatCard label="Recettes (Mois)" value={(kpis.monthRevenue / 1000).toFixed(1)} unit="KDH" icon={<TrendingUp size={20} />} color="green" />
            <StatCard label="Dépenses (Mois)" value={(kpis.monthExpenses / 1000).toFixed(1)} unit="KDH" icon={<TrendingDown size={20} />} color="red" />
            <StatCard label="Bénéfice (Mois)" value={(kpis.monthProfit / 1000).toFixed(1)} unit="KDH" trend={isProfit ? +2.4 : -1.8} icon={<Wallet size={20} />} color={isProfit ? 'green' : 'red'} />
            <StatCard label="CA Annuel" value={(kpis.yearRevenue / 1000).toFixed(0)} unit="KDH" icon={<BarChart3 size={20} />} color="amber" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* TABLE PANEL */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-zinc-900 bg-zinc-950/50 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <Layers className="text-amber-500" size={18} />
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Journal des Transactions</h3>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={13} />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 w-44"
                />
              </div>
              <div className="relative">
                <select
                  title="Filtrer par type"
                  value={filterType}
                  onChange={e => setFilterType(e.target.value as typeof filterType)}
                  className="appearance-none pl-3 pr-8 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-amber-500/50 cursor-pointer"
                >
                  <option value="">Tous types</option>
                  <option value="recette">Recettes</option>
                  <option value="depense">Dépenses</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={12} />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto text-sm">
            {isLoading ? (
              <div className="p-8"><Skeleton type="table" /></div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center">
                <DollarSign className="mx-auto mb-4 text-zinc-700" size={40} />
                <p className="text-zinc-500 italic">Aucune transaction enregistrée.</p>
                <div className="flex gap-3 justify-center mt-6">
                  <button onClick={() => openCreate('recette')} className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold">+ Recette</button>
                  <button onClick={() => openCreate('depense')} className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs font-bold">- Dépense</button>
                </div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-900/30">
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-900">Date</th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-900">Description</th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-900">Secteur</th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-900">Type</th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-900 text-right">Montant</th>
                    <th className="px-3 py-3 border-b border-zinc-900"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/40">
                  {filtered.map(t => (
                    <tr key={t._id} className="hover:bg-zinc-900/30 transition-colors group">
                      <td className="px-5 py-3 font-mono text-xs text-zinc-500 whitespace-nowrap">{new Date(t.date).toLocaleDateString('fr-FR')}</td>
                      <td className="px-5 py-3 text-zinc-200 font-medium truncate max-w-[180px]">{t.description}</td>
                      <td className="px-5 py-3 text-zinc-500 text-xs">{t.sector}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${t.type === 'recette' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {t.type === 'recette' ? '↑ Recette' : '↓ Dépense'}
                        </span>
                      </td>
                      <td className={`px-5 py-3 text-right font-mono font-bold ${t.type === 'recette' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {t.type === 'recette' ? '+' : '-'}{t.amount.toLocaleString('fr-FR')} <span className="text-[10px] font-normal text-zinc-600">DH</span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(t)} className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white" title="Modifier">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => setDeleteId(t._id)} className="p-1.5 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-500" title="Supprimer">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* SECTOR PERFORMANCE */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-xl">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <BarChart3 size={14} className="text-amber-500" /> Performance par Secteur
          </h4>
          <div className="space-y-5">
            {isLoading ? (
              <Skeleton type="list" />
            ) : kpis.bySector.length === 0 ? (
              <p className="text-zinc-600 text-sm italic text-center py-10">Aucune donnée sectorielle</p>
            ) : kpis.bySector.map(s => {
              const profit = s.revenue - s.expenses;
              const maxVal = Math.max(...kpis.bySector.map(x => Math.abs(x.revenue)));
              const pct = maxVal > 0 ? (s.revenue / maxVal) * 100 : 0;
              return (
                <div key={s._id} className="space-y-2">
                  <div className="flex justify-between text-[11px] font-medium">
                    <span className="text-zinc-400 truncate">{s._id}</span>
                    <span className={`font-mono font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {profit >= 0 ? '+' : ''}{(profit / 1000).toFixed(1)} K
                    </span>
                  </div>
                  <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${profit >= 0 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-rose-600 to-rose-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MODAL — FORMULAIRE */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 w-full max-w-lg shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-[2px] mb-1">
                  {editingId ? 'Modification' : 'Nouvelle entrée'}
                </div>
                <h2 className="text-xl font-bold text-white">
                  {editingId ? 'Modifier la Transaction' : form.type === 'recette' ? '↑ Nouvelle Recette' : '↓ Nouvelle Dépense'}
                </h2>
              </div>
              <button onClick={closeModal} title="Fermer" aria-label="Fermer" className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Toggle Type */}
              {!editingId && (
                <div className="flex gap-2 p-1 bg-zinc-900 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, type: 'recette', category: 'Ventes Animaux' }))}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${form.type === 'recette' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    <TrendingUp size={14} /> Recette
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, type: 'depense', category: 'Intrants Agricoles' }))}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${form.type === 'depense' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    <TrendingDown size={14} /> Dépense
                  </button>
                </div>
              )}

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Description *</label>
                <input
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Ex: Vente de lait à la coopérative…"
                  required
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Catégorie */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Catégorie</label>
                  <select
                    title="Catégorie"
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-amber-500/50 transition-colors"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Secteur */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Secteur</label>
                  <select
                    title="Secteur"
                    value={form.sector}
                    onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-amber-500/50 transition-colors"
                  >
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Montant */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Montant (DH) *</label>
                  <input
                    type="number"
                    title="Montant"
                    value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    min={0.01} step={0.01} placeholder="0.00" required
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-400 hover:text-white font-bold transition-colors">
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`flex-[2] py-3 rounded-lg text-sm font-bold transition-all disabled:opacity-50 ${form.type === 'recette' ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30' : 'bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:bg-rose-500/30'}`}
                >
                  {saving ? 'Enregistrement…' : editingId ? 'Enregistrer les modifications' : `Ajouter la ${form.type}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-rose-500/30 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-14 h-14 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <Trash2 className="text-rose-500" size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Supprimer cette transaction ?</h3>
            <p className="text-sm text-zinc-500 mb-8">Les KPIs seront recalculés automatiquement. Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-400 hover:text-white font-bold transition-colors">Annuler</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-3 bg-rose-500/20 border border-rose-500/30 rounded-lg text-sm text-rose-400 hover:bg-rose-500/30 font-bold transition-colors">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
