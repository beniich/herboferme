'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useCropsData } from '@/hooks/useDomainData';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';
import { StatCard } from '@/components/shared/StatCard';
import { Skeleton } from '@/components/shared/Skeleton';
import { ErrorFallback } from '@/components/shared/ErrorFallback';
import {
  RefreshCw, Plus, Edit2, Trash2, X, Leaf, Maximize,
  CheckCircle2, Package, Layers, Search, Filter, Wheat, LucideIcon
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────
interface Crop {
  _id: string;
  name: string;
  category: string;
  plotId: string;
  status: string;
  plantedDate: string;
  expectedHarvestDate?: string;
  estimatedYield: number;
  surface?: number;
  notes?: string;
}

interface CropForm {
  name: string;
  category: string;
  plotId: string;
  status: string;
  plantedDate: string;
  expectedHarvestDate: string;
  estimatedYield: number | string;
  surface: number | string;
  notes: string;
}

const EMPTY_FORM: CropForm = {
  name: '', category: 'VEGETABLE', plotId: '', status: 'PLANTED',
  plantedDate: new Date().toISOString().split('T')[0], expectedHarvestDate: '',
  estimatedYield: '', surface: '', notes: ''
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PLANTED:   { label: 'Planté',          color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  GROWING:   { label: 'En croissance',   color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  READY:     { label: 'Prêt à récolter', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  HARVESTED: { label: 'Récolté',         color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
};

const CATEGORY_LABEL: Record<string, string> = {
  VEGETABLE: 'Légumes & Fruits',
  HERB:      'Herbes & Aromates',
  NURSERY:   'Pépinière',
  FOREST:    'Forêt',
};

export interface LegumesPageProps {
  category?: string;
  pageTitle?: string;
  pageLabel?: string;
  pageIcon?: string;
  accentColor?: string;
}

export default function LegumesPage({
  category = 'VEGETABLE',
  pageTitle = 'Légumes & Fruits',
  pageLabel = 'Module Cultures',
  pageIcon = '🥕',
  accentColor = 'emerald',
}: LegumesPageProps) {
  const { items: rawItems, isLoading, error, refresh } = useCropsData();
  const allCrops = (rawItems as unknown as Crop[]) || [];
  const crops = useMemo(() => allCrops.filter(c => c.category === category), [allCrops, category]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CropForm>({ ...EMPTY_FORM, category });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [harvestModal, setHarvestModal] = useState<string | null>(null);
  const [actualYield, setActualYield] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    if (!searchTerm) return crops;
    return crops.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.plotId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [crops, searchTerm]);

  const kpis = useMemo(() => ({
    total: crops.length,
    surface: crops.reduce((s, c) => s + (c.surface || 0), 0),
    ready: crops.filter(c => c.status === 'READY').length,
    yield: crops.reduce((s, c) => s + c.estimatedYield, 0),
  }), [crops]);

  // ─── Actions ──────────────────────────────────────────────────────────────
  const openCreate = () => { setForm({ ...EMPTY_FORM, category }); setEditingId(null); setShowModal(true); };
  const openEdit = (c: Crop) => {
    setForm({
      name: c.name, category: c.category, plotId: c.plotId, status: c.status,
      plantedDate: c.plantedDate?.split('T')[0] || '',
      expectedHarvestDate: c.expectedHarvestDate?.split('T')[0] || '',
      estimatedYield: c.estimatedYield, surface: c.surface || '', notes: c.notes || ''
    });
    setEditingId(c._id);
    setShowModal(true);
  };
  const closeModal = useCallback(() => { setShowModal(false); setEditingId(null); setForm({ ...EMPTY_FORM, category }); }, [category]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        estimatedYield: Number(form.estimatedYield),
        surface: form.surface ? Number(form.surface) : undefined,
        expectedHarvestDate: form.expectedHarvestDate || undefined,
      };
      if (editingId) {
        await apiClient.put(`/api/crops/${editingId}`, payload);
        toast.success('Culture modifiée ✓');
      } else {
        await apiClient.post('/api/crops', payload);
        toast.success('Culture ajoutée ✓');
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
      await apiClient.delete(`/api/crops/${id}`);
      toast.success('Supprimé');
      setDeleteId(null);
      refresh();
    } catch {
      toast.error('Erreur de suppression');
    }
  };

  const handleHarvest = async () => {
    if (!harvestModal || !actualYield) return;
    try {
      await apiClient.patch(`/api/crops/${harvestModal}/harvest`, { actualYield: Number(actualYield) });
      toast.success('Récolte enregistrée ✓');
      setHarvestModal(null);
      setActualYield('');
      refresh();
    } catch {
      toast.error('Erreur lors de la récolte');
    }
  };

  const accentCls = {
    emerald: 'text-emerald-500',
    amber: 'text-amber-500',
    teal: 'text-teal-500',
    green: 'text-green-500',
  }[accentColor] ?? 'text-emerald-500';

  if (error) return <ErrorFallback onRetry={refresh} message={`Impossible de charger les données — ${pageTitle}`} />;

  return (
    <div className="page active p-6 lg:p-10 space-y-10" id="page-legumes">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="text-[10px] font-mono tracking-[3px] text-zinc-500 uppercase mb-1">{pageLabel} · Cultures</div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <Leaf className={accentCls} size={32} /> {pageTitle}
          </h1>
          <p className="text-sm text-zinc-400">Suivi des cultures, statuts et rendements — données temps réel.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={refresh} className="p-2 text-zinc-500 hover:text-white transition-colors" title="Actualiser">
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus size={16} /> Nouvelle Culture
          </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {isLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} type="card" />) : (
          <>
            <StatCard label="Cultures Actives" value={kpis.total} unit="lots" icon={<Leaf size={20} />} color="green" />
            <StatCard label="Surface Totale" value={kpis.surface.toFixed(1)} unit="ha" icon={<Maximize size={20} />} color="teal" />
            <StatCard label="Prêt à Récolter" value={kpis.ready} unit="lots" icon={<CheckCircle2 size={20} />} color="amber" />
            <StatCard label="Rendement Estimé" value={kpis.yield.toFixed(0)} unit="kg" icon={<Package size={20} />} color="green" />
          </>
        )}
      </div>

      {/* TABLE PANEL */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-zinc-900 bg-zinc-950/50 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <Layers className="text-emerald-500" size={18} />
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Cultures Enregistrées</h3>
            {filtered.length !== crops.length && (
              <span className="text-emerald-400 font-mono text-xs">({filtered.length}/{crops.length})</span>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={13} />
            <input
              type="text"
              placeholder="Culture, parcelle..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-8 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 w-48"
            />
          </div>
        </div>
        <div className="overflow-x-auto text-sm">
          {isLoading ? (
            <div className="p-8"><Skeleton type="table" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <Leaf className="mx-auto mb-4 text-zinc-700" size={40} />
              <p className="text-zinc-500 italic mb-6">Aucune culture enregistrée.</p>
              <button onClick={openCreate} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold">
                + Ajouter une culture
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900/30">
                  {['Culture', 'Parcelle', 'Plantation', 'Récolte Prévue', 'Rendement (kg)', 'Statut', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-900">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/40">
                {filtered.map(c => (
                  <tr key={c._id} className="hover:bg-zinc-900/30 transition-colors group">
                    <td className="px-5 py-3 font-bold text-zinc-200">{pageIcon} {c.name}</td>
                    <td className="px-5 py-3 font-mono text-xs text-zinc-400 uppercase">{c.plotId}</td>
                    <td className="px-5 py-3 font-mono text-xs text-zinc-500">{new Date(c.plantedDate).toLocaleDateString('fr-FR')}</td>
                    <td className="px-5 py-3 font-mono text-xs text-zinc-500">{c.expectedHarvestDate ? new Date(c.expectedHarvestDate).toLocaleDateString('fr-FR') : '—'}</td>
                    <td className="px-5 py-3 font-mono font-bold text-emerald-400">{c.estimatedYield}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_MAP[c.status]?.color ?? 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>
                        {STATUS_MAP[c.status]?.label ?? c.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {c.status === 'READY' && (
                          <button onClick={() => { setHarvestModal(c._id); setActualYield(String(c.estimatedYield)); }} className="p-1.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-400" title="Récolter">
                            <Wheat size={13} />
                          </button>
                        )}
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white" title="Modifier"><Edit2 size={13} /></button>
                        <button onClick={() => setDeleteId(c._id)} className="p-1.5 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-500" title="Supprimer"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL — FORMULAIRE */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-[2px] mb-1">{editingId ? 'Modification' : 'Nouvelle culture'}</div>
                <h2 className="text-xl font-bold text-white">{editingId ? 'Modifier la Culture' : 'Ajouter une Culture'}</h2>
              </div>
              <button onClick={closeModal} title="Fermer" aria-label="Fermer" className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Nom de la culture *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Tomates, Menthe, Basilic…" required className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Catégorie</label>
                  <select title="Catégorie" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50">
                    <option value="VEGETABLE">Légumes & Fruits</option>
                    <option value="HERB">Herbes & Aromates</option>
                    <option value="NURSERY">Pépinière</option>
                    <option value="FOREST">Forêt</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">ID Parcelle *</label>
                  <input value={form.plotId} onChange={e => setForm(f => ({ ...f, plotId: e.target.value }))} placeholder="Ex: P1, Zone-Nord…" required className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Date Plantation *</label>
                  <input type="date" value={form.plantedDate} onChange={e => setForm(f => ({ ...f, plantedDate: e.target.value }))} required className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Récolte Prévue</label>
                  <input type="date" value={form.expectedHarvestDate} onChange={e => setForm(f => ({ ...f, expectedHarvestDate: e.target.value }))} className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Rendement Estimé (kg)</label>
                  <input type="number" title="Rendement estimé" value={form.estimatedYield} onChange={e => setForm(f => ({ ...f, estimatedYield: e.target.value }))} min={0} placeholder="0" className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Surface (ha)</label>
                  <input type="number" title="Surface en ha" value={form.surface} onChange={e => setForm(f => ({ ...f, surface: e.target.value }))} min={0} step={0.01} placeholder="0.00" className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Statut</label>
                  <select title="Statut" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50">
                    <option value="PLANTED">Planté</option>
                    <option value="GROWING">En croissance</option>
                    <option value="READY">Prêt à récolter</option>
                    <option value="HARVESTED">Récolté</option>
                  </select>
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Observations, traitements, conditions…" rows={3} className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 resize-vertical" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-400 hover:text-white font-bold transition-colors">Annuler</button>
                <button type="submit" disabled={saving} className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm text-white font-bold transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20">
                  {saving ? 'Enregistrement…' : editingId ? 'Sauvegarder' : 'Ajouter la culture'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HARVEST MODAL */}
      {harvestModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-amber-500/30 rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4"><Wheat className="text-amber-400" size={28} /></div>
              <h3 className="text-lg font-bold text-white mb-1">Enregistrer la Récolte</h3>
              <p className="text-sm text-zinc-500">Saisissez le rendement réel obtenu.</p>
            </div>
            <div className="space-y-1.5 mb-6">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Rendement Réel (kg)</label>
              <input type="number" value={actualYield} onChange={e => setActualYield(e.target.value)} min={0} autoFocus className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50 text-center text-lg font-bold" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setHarvestModal(null)} className="flex-1 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-400 hover:text-white font-bold transition-colors">Annuler</button>
              <button onClick={handleHarvest} className="flex-1 py-3 bg-amber-500/20 border border-amber-500/30 rounded-lg text-sm text-amber-400 hover:bg-amber-500/30 font-bold transition-colors">Confirmer</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-rose-500/30 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-14 h-14 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-5"><Trash2 className="text-rose-500" size={24} /></div>
            <h3 className="text-lg font-bold text-white mb-2">Supprimer cette culture ?</h3>
            <p className="text-sm text-zinc-500 mb-8">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-400 hover:text-white font-bold transition-colors">Annuler</button>
              <button onClick={() => deleteId && handleDelete(deleteId)} className="flex-1 py-3 bg-rose-500/20 border border-rose-500/30 rounded-lg text-sm text-rose-400 hover:bg-rose-500/30 font-bold transition-colors">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
