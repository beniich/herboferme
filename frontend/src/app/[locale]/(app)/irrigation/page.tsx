'use client';

import React, { useState, useMemo } from 'react';
import { useIrrigationData } from '@/hooks/useDomainData';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';
import { StatCard } from '@/components/shared/StatCard';
import { Skeleton } from '@/components/shared/Skeleton';
import { ErrorFallback } from '@/components/shared/ErrorFallback';
import { 
  Droplets, 
  Calendar, 
  MapPin, 
  Settings, 
  Edit2, 
  Trash2, 
  Plus, 
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  Waves,
  LayoutGrid
} from 'lucide-react';

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
  plotId: '', 
  volume: '', 
  duration: '',
  date: new Date().toISOString().split('T')[0],
  status: 'COMPLETED', 
  method: 'DRIP', 
  notes: ''
};

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  COMPLETED:   { label: 'Terminé',    color: 'bg-emerald-500/10 text-emerald-500', icon: <CheckCircle2 size={12} /> },
  SCHEDULED:   { label: 'Planifié',   color: 'bg-blue-500/10 text-blue-500', icon: <Calendar size={12} /> },
  IN_PROGRESS: { label: 'En cours',   color: 'bg-amber-500/10 text-amber-500', icon: <Clock size={12} /> },
};

const METHOD_LABEL: Record<string, string> = {
  DRIP:      'Goutte-à-goutte',
  SPRINKLER: 'Aspersion',
  SURFACE:   'Surface / Gravité',
};

export default function IrrigationPage() {
  const { items: rawLogs, isLoading, error, refresh } = useIrrigationData();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<IrrigationForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const logs = useMemo(() => {
    const list = (rawLogs as unknown as IrrigationLog[]) || [];
    if (!searchTerm) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(l => 
      l.plotId.toLowerCase().includes(term) || 
      l.notes?.toLowerCase().includes(term)
    );
  }, [rawLogs, searchTerm]);

  const kpis = useMemo(() => {
    const list = (rawLogs as unknown as IrrigationLog[]) || [];
    const totalVolume = list.reduce((s, l) => s + (l.volume || 0), 0);
    const activePlots = new Set(list.map(l => l.plotId)).size;
    const lastDate = list.length > 0 
      ? new Date(list[0].date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
      : '—';
    
    return {
      totalVolume,
      activePlots,
      lastDate,
      count: list.length
    };
  }, [rawLogs]);

  const openCreate = () => { setForm(EMPTY_FORM); setEditingId(null); setShowModal(true); };
  
  const openEdit = (l: IrrigationLog) => {
    setForm({
      plotId: l.plotId, 
      volume: l.volume, 
      duration: l.duration,
      date: l.date.split('T')[0], 
      status: l.status, 
      method: l.method, 
      notes: l.notes || ''
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
        await apiClient.patch(`/api/irrigation/${editingId}`, payload);
        toast.success('Session mise à jour');
      } else {
        await apiClient.post('/api/irrigation', payload);
        toast.success('Nouvelle session ajoutée');
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
      await apiClient.delete(`/api/irrigation/${id}`);
      toast.success('Enregistrement supprimé');
      setDeleteId(null);
      refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  if (error) return <ErrorFallback onRetry={refresh} message="Impossible de charger l'irrigation" />;

  return (
    <div className="page active p-6 lg:p-10 space-y-8" id="page-irrigation">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="text-[10px] font-mono tracking-[3px] text-zinc-500 uppercase mb-1">Module Agriculture · Ressources</div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <Droplets className="text-blue-500" size={32} /> Irrigation & Eau
          </h1>
          <p className="text-sm text-zinc-400">Journal des sessions d'arrosage et gestion des volumes.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher une parcelle..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-500/10"
          >
            <Plus size={18} /> Nouvelle Session
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
              label="Volume Total" 
              value={kpis.totalVolume.toFixed(1)} 
              unit="m³"
              icon={<Waves size={20} />}
              color="blue"
            />
            <StatCard 
              label="Dernière Session" 
              value={kpis.lastDate} 
              unit=""
              icon={<Calendar size={20} />}
              color="indigo"
            />
            <StatCard 
              label="Parcelles Actives" 
              value={kpis.activePlots} 
              unit="zones"
              icon={<MapPin size={20} />}
              color="teal"
            />
            <StatCard 
              label="Sessions Logguées" 
              value={kpis.count} 
              unit="relevés"
              icon={<LayoutGrid size={20} />}
              color="zinc"
            />
          </>
        )}
      </div>

      {/* MAIN TABLE PANEL */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/50">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span> Journal d'Irrigation
          </h3>
          <button onClick={refresh} className="text-zinc-500 hover:text-white transition-colors">
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-10"><Skeleton type="table" /></div>
          ) : logs.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <Droplets size={48} className="mx-auto text-zinc-800" />
              <div className="text-zinc-500 font-medium italic">Aucun relevé d'irrigation enregistré.</div>
              <button 
                onClick={openCreate}
                className="px-6 py-2 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all"
              >
                Ajouter une session
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900/40">
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-900">Date & Parcelle</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-900">Volume</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-900">Durée</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-900">Méthode</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-900">Statut</th>
                  <th className="px-8 py-4 text-zinc-500 border-b border-zinc-900"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/50">
                {logs.map(l => (
                  <tr key={l._id} className="hover:bg-zinc-900/30 transition-colors group">
                    <td className="px-8 py-4">
                      <div>
                        <div className="text-xs font-bold text-white uppercase tracking-wider">{l.plotId}</div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          {new Date(l.date).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-blue-400">{l.volume} m³</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-zinc-400">{l.duration} min</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-zinc-300 font-medium">{METHOD_LABEL[l.method] || l.method}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_MAP[l.status]?.color || 'bg-zinc-500/10 text-zinc-500'}`}>
                        {STATUS_MAP[l.status]?.icon}
                        {STATUS_MAP[l.status]?.label || l.status}
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(l)} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-all">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteId(l._id)} className="p-2 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all">
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
                {editingId ? <Edit2 className="text-blue-500" size={20} /> : <Plus className="text-blue-500" size={20} />}
                {editingId ? 'Modifier la session' : 'Nouvelle session d\'irrigation'}
              </h2>
              <button onClick={closeModal} className="text-zinc-500 hover:text-white transition-colors">✕</button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Identifiant Parcelle *</label>
                  <input 
                    type="text" 
                    value={form.plotId} 
                    onChange={e => setForm(f => ({ ...f, plotId: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none transition-all"
                    placeholder="Ex: P1, Zone Nord..." 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Volume (m³) *</label>
                  <input 
                    type="number" 
                    value={form.volume} 
                    onChange={e => setForm(f => ({ ...f, volume: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none transition-all"
                    placeholder="0.0" 
                    step="0.1"
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Durée (minutes) *</label>
                  <input 
                    type="number" 
                    value={form.duration} 
                    onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none transition-all"
                    placeholder="0" 
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Date *</label>
                  <input 
                    type="date" 
                    value={form.date} 
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none transition-all font-mono"
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Méthode</label>
                  <select 
                    value={form.method} 
                    onChange={e => setForm(f => ({ ...f, method: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none transition-all appearance-none"
                  >
                    <option value="DRIP">Goutte-à-goutte</option>
                    <option value="SPRINKLER">Aspersion</option>
                    <option value="SURFACE">Surface / Gravité</option>
                  </select>
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Statut</label>
                  <select 
                    value={form.status} 
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none transition-all appearance-none"
                  >
                    {Object.entries(STATUS_MAP).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Notes personnelles</label>
                  <textarea 
                    value={form.notes} 
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    rows={3}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none transition-all resize-none"
                    placeholder="Observations sur le débit, pannes, remarques..."
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
                  className="flex-[2] px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  {saving ? 'Enregistrement...' : editingId ? 'Enregistrer les modifications' : 'Confirmer la session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-sm p-8 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
              <Trash2 size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Supprimer ce relevé ?</h3>
              <p className="text-sm text-zinc-500">Cette action supprimera définitivement cet historique d'irrigation. Vous ne pourrez pas revenir en arrière.</p>
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
                Supprimer définitvement
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
