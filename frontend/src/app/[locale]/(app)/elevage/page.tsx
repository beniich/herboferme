'use client';

import React, { useState, useMemo } from 'react';
import { useAnimalsData } from '@/hooks/useDomainData';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';
import { StatCard } from '@/components/shared/StatCard';
import { Skeleton } from '@/components/shared/Skeleton';
import { ErrorFallback } from '@/components/shared/ErrorFallback';
import { 
  Beef, 
  TrendingUp, 
  AlertCircle, 
  Layers, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Plus, 
  RefreshCw,
  Search,
  CheckCircle2,
  Activity,
  ArrowRight
} from 'lucide-react';

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
  type: '', 
  breed: '', 
  category: 'LIVESTOCK', 
  count: '', 
  averageAge: '', 
  status: 'ACTIVE', 
  estimatedValue: '', 
  notes: ''
};

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PRODUCTION: { label: 'En production', color: 'bg-emerald-500/10 text-emerald-500', icon: <Activity size={12} /> },
  ACTIVE:     { label: 'Actif',         color: 'bg-emerald-500/10 text-emerald-500', icon: <CheckCircle2 size={12} /> },
  GROWING:    { label: 'Croissance',    color: 'bg-amber-500/10 text-amber-500', icon: <TrendingUp size={12} /> },
  LAYING:     { label: 'En ponte',      color: 'bg-blue-500/10 text-blue-500', icon: <Layers size={12} /> },
  SICK:       { label: 'Malade',        color: 'bg-rose-500/10 text-rose-500', icon: <AlertCircle size={12} /> },
  SOLD:       { label: 'Vendu',         color: 'bg-zinc-500/10 text-zinc-500', icon: <ArrowRight size={12} /> },
};

interface ElevagePageProps {
  category?: string;
  pageTitle?: string;
  pageLabel?: string;
  pageIcon?: string;
}

export default function ElevagePage({ category: _category, pageTitle, pageLabel, pageIcon }: ElevagePageProps = {}) {
  const { items: rawAnimals, stats: domainStats, isLoading, error, refresh } = useAnimalsData();
  const _ = domainStats; // suppress unused warning
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AnimalForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const animals = useMemo(() => {
    const list = (rawAnimals as unknown as Animal[]) || [];
    if (!searchTerm) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(a => 
      a.type.toLowerCase().includes(term) || 
      a.breed.toLowerCase().includes(term)
    );
  }, [rawAnimals, searchTerm]);

  const kpis = useMemo(() => {
    const list = (rawAnimals as unknown as Animal[]) || [];
    const totalTetes = list.reduce((s, a) => s + (a.count || 0), 0);
    const totalVal = list.reduce((s, a) => s + (a.estimatedValue || 0), 0);
    const sickCount = list.filter(a => a.status === 'SICK').length;
    
    return {
      totalTetes,
      totalVal: totalVal / 1000,
      groups: list.length,
      sickCount
    };
  }, [rawAnimals]);

  const openCreate = () => { 
    setForm({ ...EMPTY_FORM, category: _category || 'LIVESTOCK' }); 
    setEditingId(null); 
    setShowModal(true); 
  };
  
  const openEdit = (a: Animal) => {
    setForm({ 
      type: a.type, 
      breed: a.breed, 
      category: a.category, 
      count: a.count, 
      averageAge: a.averageAge, 
      status: a.status, 
      estimatedValue: a.estimatedValue, 
      notes: a.notes || '' 
    });
    setEditingId(a._id);
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingId(null); setForm(EMPTY_FORM); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { 
        ...form, 
        count: Number(form.count), 
        averageAge: Number(form.averageAge), 
        estimatedValue: Number(form.estimatedValue) 
      };
      
      if (editingId) {
        await apiClient.patch(`/api/animals/${editingId}`, payload);
        toast.success('Animal mis à jour avec succès');
      } else {
        await apiClient.post('/api/animals', payload);
        toast.success('Nouvel enregistrement ajouté');
      }
      closeModal();
      refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/api/animals/${id}`);
      toast.success('Enregistrement supprimé');
      setDeleteId(null);
      refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  if (error) return <ErrorFallback onRetry={refresh} message="Impossible de charger le cheptel" />;

  return (
    <div className="page active p-6 lg:p-10 space-y-8" id="page-elevage">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="text-[10px] font-mono tracking-[3px] text-zinc-500 uppercase mb-1">{pageLabel || 'Module Agriculture · Élevage'}</div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            {pageIcon ? (
              <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 text-2xl">
                {pageIcon}
              </span>
            ) : (
              <Beef className="text-amber-500" size={32} />
            )} 
            {pageTitle || 'Gestion du Cheptel'}
          </h1>
          <p className="text-sm text-zinc-400">Suivi inventaire, santé et valorisation du bétail.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-sm font-bold transition-all shadow-lg shadow-amber-500/10"
          >
            <Plus size={18} /> Nouveau Lot
          </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} type="card" />)
        ) : (
          <>
            <StatCard 
              label="Effectif Total" 
              value={kpis.totalTetes} 
              unit="têtes"
              icon={<Beef size={20} />}
              color="amber"
            />
            <StatCard 
              label="Valeur Estimée" 
              value={kpis.totalVal.toFixed(0)} 
              unit="KDH"
              icon={<TrendingUp size={20} />}
              color="green"
            />
            <StatCard 
              label="Groupes Actifs" 
              value={kpis.groups} 
              unit="lots"
              icon={<Layers size={20} />}
              color="blue"
            />
            <StatCard 
              label="Alertes Santé" 
              value={kpis.sickCount} 
              unit="lots"
              icon={<AlertCircle size={20} />}
              color="red"
            />
          </>
        )}
      </div>

      {/* MAIN TABLE PANEL */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/50">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span> Inventaire Cheptel
          </h3>
          <button onClick={refresh} className="text-zinc-500 hover:text-white transition-colors">
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-10"><Skeleton type="table" /></div>
          ) : animals.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <Beef size={48} className="mx-auto text-zinc-800" />
              <div className="text-zinc-500 font-medium italic">Aucun animal enregistré pour le moment.</div>
              <button 
                onClick={openCreate}
                className="px-6 py-2 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all"
              >
                Commencer l'inventaire
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900/40">
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-900">Type & Race</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-900">Effectif</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-900">Âge Moyen</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-900">Statut</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-900 text-right">Valeur Estimée</th>
                  <th className="px-8 py-4 text-zinc-500 border-b border-zinc-900"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/50">
                {animals.map(a => (
                  <tr key={a._id} className="hover:bg-zinc-900/30 transition-colors group">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-500">
                          <Beef size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{a.type}</div>
                          <div className="text-[10px] text-zinc-500 uppercase font-mono">{a.breed}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-zinc-200">{a.count}</span>
                      <span className="text-[10px] text-zinc-500 ml-1 uppercase">Unit.</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-zinc-400">{a.averageAge} mois</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_MAP[a.status]?.color || 'bg-zinc-500/10 text-zinc-500'}`}>
                        {STATUS_MAP[a.status]?.icon}
                        {STATUS_MAP[a.status]?.label || a.status}
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="text-sm font-mono font-bold text-amber-400">
                        {a.estimatedValue?.toLocaleString('fr-FR')} <span className="text-[10px] font-normal text-zinc-500">DH</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(a)} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-all">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteId(a._id)} className="p-2 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all">
                          <Trash2 size={14} />
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

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-zinc-900 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {editingId ? <Edit2 className="text-amber-500" size={20} /> : <Plus className="text-amber-500" size={20} />}
                {editingId ? 'Modifier le lot' : 'Nouveau lot de cheptel'}
              </h2>
              <button onClick={closeModal} className="text-zinc-500 hover:text-white transition-colors">✕</button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Type d'animal *</label>
                  <input 
                    type="text" 
                    value={form.type} 
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition-all"
                    placeholder="Ex: Vaches laitières, Brebis..." 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Race *</label>
                  <input 
                    type="text" 
                    value={form.breed} 
                    onChange={e => setForm(f => ({ ...f, breed: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition-all"
                    placeholder="Ex: Holstein, Sardi..." 
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Effectif (têtes) *</label>
                  <input 
                    type="number" 
                    value={form.count} 
                    onChange={e => setForm(f => ({ ...f, count: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition-all"
                    placeholder="0" 
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Âge moyen (mois)</label>
                  <input 
                    type="number" 
                    value={form.averageAge} 
                    onChange={e => setForm(f => ({ ...f, averageAge: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition-all"
                    placeholder="0" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Statut</label>
                  <select 
                    value={form.status} 
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition-all appearance-none"
                  >
                    {Object.entries(STATUS_MAP).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Valeur estimée totale (DH)</label>
                  <input 
                    type="number" 
                    value={form.estimatedValue} 
                    onChange={e => setForm(f => ({ ...f, estimatedValue: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition-all font-mono"
                    placeholder="0" 
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Observations</label>
                  <textarea 
                    value={form.notes} 
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    rows={3}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition-all resize-none"
                    placeholder="Traitements, alimentation, remarques..."
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-zinc-900">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all text-xs font-bold uppercase tracking-widest"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex-[2] px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  {saving ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Ajouter le lot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-sm p-8 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
              <Trash2 size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Supprimer ce lot ?</h3>
              <p className="text-sm text-zinc-500">Cette action est définitive et supprimera toutes les données liées à ce lot d'animaux.</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-3 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white transition-all text-xs font-bold"
              >
                Annuler
              </button>
              <button 
                onClick={() => handleDelete(deleteId)}
                className="flex-1 px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
