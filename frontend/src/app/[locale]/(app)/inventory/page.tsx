'use client';

import React, { useState, useMemo } from 'react';
import { useInventoryData } from '@/hooks/useDomainData';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';
import { StatCard } from '@/components/shared/StatCard';
import { Skeleton } from '@/components/shared/Skeleton';
import { ErrorFallback } from '@/components/shared/ErrorFallback';
import {
  Package, AlertTriangle, ShoppingCart, Coins, RefreshCw, Search,
  Plus, Edit2, Trash2, X, Layers, Tag, Filter, ChevronDown
} from 'lucide-react';

import { agroInventoryApi } from '@/lib/api';

// ─── Types ─────────────────────────────────────────────────────────────────
interface InventoryItem {
  _id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  price: number;
}

interface ItemForm {
  code: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number | string;
  minStock: number | string;
  price: number | string;
}

const EMPTY_FORM: ItemForm = {
  code: '', name: '', category: 'Intrants', unit: 'kg',
  currentStock: '', minStock: '', price: ''
};

const CATEGORIES = ['Intrants', 'Engrais', 'Phytosanitaires', 'Équipements', 'Matériels', 'Semences', 'Emballages', 'Autre'];
const UNITS = ['kg', 'L', 'unité', 'sac', 'tonne', 'boîte', 'paquet'];

export default function InventoryPage() {
  const { items: rawItems, isLoading, error, refresh } = useInventoryData();
  const items = (rawItems as any) || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ItemForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('');

  const filtered = useMemo(() => {
    const cat = filterCategory || activeCategory;
    const list = Array.isArray(items) ? items : [];
    return list.filter((item: any) => {
      const matchSearch = !searchTerm ||
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = !cat || item.category === cat;
      return matchSearch && matchCategory;
    });
  }, [items, searchTerm, filterCategory, activeCategory]);

  const kpis = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    const totalItems = list.length;
    const lowStock = list.filter((i: any) => i.currentStock <= i.minStock).length;
    const totalValue = list.reduce((acc: number, i: any) => acc + (i.currentStock * i.price), 0);
    const categoryCounts = list.reduce((acc: Record<string, number>, i: any) => {
      acc[i.category] = (acc[i.category] || 0) + 1;
      return acc;
    }, {});
    return { totalItems, lowStock, totalValue, categoryCounts };
  }, [items]);

  // ─── Actions ──────────────────────────────────────────────────────────────
  const openCreate = () => { setForm(EMPTY_FORM); setEditingId(null); setShowModal(true); };
  const openEdit = (item: InventoryItem) => {
    setForm({ 
      code: item.code, 
      name: item.name, 
      category: item.category, 
      unit: item.unit, 
      currentStock: item.currentStock, 
      minStock: item.minStock, 
      price: item.price 
    });
    setEditingId(item._id);
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditingId(null); setForm(EMPTY_FORM); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { 
        ...form, 
        currentStock: Number(form.currentStock), 
        minStock: Number(form.minStock), 
        price: Number(form.price) 
      };
      if (editingId) {
        await agroInventoryApi.update(editingId, payload);
        toast.success('Article mis à jour ✓');
      } else {
        await agroInventoryApi.create(payload);
        toast.success('Article ajouté ✓');
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
      await agroInventoryApi.delete(id);
      toast.success('Article supprimé');
      setDeleteId(null);
      refresh();
    } catch {
      toast.error('Erreur de suppression');
    }
  };

  if (error) return <ErrorFallback onRetry={refresh} message="Impossible de charger l'inventaire" />;

  return (
    <div className="page active p-6 lg:p-10 space-y-10" id="page-inventory">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="text-[10px] font-mono tracking-[3px] text-zinc-500 uppercase mb-1">Module Opérations · Stocks</div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <Package className="text-blue-500" size={32} /> Inventaire & Stocks
          </h1>
          <p className="text-sm text-zinc-400">Gestion des intrants, engrais, matériels et approvisionnements.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={refresh} className="p-2 text-zinc-500 hover:text-white transition-colors" title="Actualiser">
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus size={16} /> Nouvel Article
          </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {isLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} type="card" />) : (
          <>
            <StatCard label="Articles en Stock" value={kpis.totalItems} unit="réf." icon={<Package size={20} />} color="blue" />
            <StatCard label="Alertes Stock Faible" value={kpis.lowStock} unit="articles" icon={<AlertTriangle size={20} />} color={kpis.lowStock > 0 ? 'red' : 'green'} />
            <StatCard label="Commandes en Attente" value={3} unit="cmd." icon={<ShoppingCart size={20} />} color="amber" />
            <StatCard label="Valeur du Stock" value={(kpis.totalValue / 1000).toFixed(1)} unit="k MAD" icon={<Coins size={20} />} color="blue" />
          </>
        )}
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* SIDEBAR CATEGORIES */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 shadow-xl h-fit">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-5 flex items-center gap-2">
            <Tag size={13} className="text-blue-500" /> Catégories
          </h4>
          <div className="space-y-1">
            <button
              onClick={() => setActiveCategory('')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold transition-colors ${!activeCategory ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-zinc-400 hover:bg-zinc-900'}`}
            >
              Toutes les catégories ({items.length})
            </button>
            {Object.entries(kpis.categoryCounts).map(([cat, count]) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat === activeCategory ? '' : cat)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold transition-colors ${activeCategory === cat ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'}`}
              >
                {cat} <span className="float-right text-zinc-600">({count})</span>
              </button>
            ))}
            {Object.keys(kpis.categoryCounts).length === 0 && !isLoading && (
              <p className="text-zinc-600 text-xs italic text-center py-4">Aucune catégorie</p>
            )}
          </div>
        </div>

        {/* INVENTORY TABLE */}
        <div className="lg:col-span-3 bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-zinc-900 bg-zinc-950/50 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <Layers className="text-blue-500" size={18} />
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
                Catalogue des Articles
                {filtered.length !== items.length && <span className="ml-2 text-blue-400 font-mono">({filtered.length}/{items.length})</span>}
              </h3>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={13} />
              <input
                type="text"
                placeholder="Réf., nom..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 w-48"
              />
            </div>
          </div>
          <div className="overflow-x-auto text-sm">
            {isLoading ? (
              <div className="p-8"><Skeleton type="table" /></div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center">
                <Package className="mx-auto mb-4 text-zinc-700" size={40} />
                <p className="text-zinc-500 italic mb-6">Aucun article trouvé.</p>
                <button onClick={openCreate} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold">
                  + Ajouter un article
                </button>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-900/30">
                    {['Réf.', 'Article', 'Catégorie', 'Quantité', 'Statut', ''].map(h => (
                      <th key={h} className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-900">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/40">
                  {filtered.map(item => {
                    const isCritical = item.currentStock <= item.minStock;
                    return (
                      <tr key={item._id} className="hover:bg-zinc-900/30 transition-colors group">
                        <td className="px-5 py-3 font-mono text-xs text-zinc-500">{item.code}</td>
                        <td className="px-5 py-3 text-zinc-200 font-bold">{item.name}</td>
                        <td className="px-5 py-3">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800/60 text-zinc-400 uppercase tracking-wider">{item.category}</span>
                        </td>
                        <td className={`px-5 py-3 font-mono font-bold ${isCritical ? 'text-rose-400' : 'text-white'}`}>
                          {item.currentStock} <span className="text-zinc-500 font-normal">{item.unit}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isCritical ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                            {isCritical ? <AlertTriangle size={10} /> : <Package size={10} />}
                            {isCritical ? 'Stock Faible' : 'En Stock'}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(item)} className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white" title="Modifier"><Edit2 size={13} /></button>
                            <button onClick={() => setDeleteId(item._id)} className="p-1.5 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-500" title="Supprimer"><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* MODAL — FORMULAIRE */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <div>
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-[2px] mb-1">{editingId ? 'Modification' : 'Nouvel article'}</div>
                <h2 className="text-xl font-bold text-white">{editingId ? 'Modifier l\'Article' : 'Ajouter un Article'}</h2>
              </div>
              <button onClick={closeModal} title="Fermer" aria-label="Fermer" className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Code Réf. *</label>
                  <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="EX-001" required className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50" />
                </div>
                <div className="space-y-1.5 col-span-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Nom de l'Article *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Engrais NPK 20-10-10" required className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Catégorie</label>
                  <select title="Catégorie" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-blue-500/50">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Unité</label>
                  <select title="Unité" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-blue-500/50">
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Quantité *</label>
                  <input type="number" title="Quantité" value={form.currentStock} onChange={e => setForm(f => ({ ...f, currentStock: e.target.value }))} min={0} step={0.1} placeholder="0" required className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Stock Min. Alerte</label>
                  <input type="number" title="Stock minimum" value={form.minStock} onChange={e => setForm(f => ({ ...f, minStock: e.target.value }))} min={0} step={0.1} placeholder="0" className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50" />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Prix Unitaire (MAD)</label>
                  <input type="number" title="Prix unitaire" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} min={0} step={0.01} placeholder="0.00" className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-400 hover:text-white font-bold transition-colors">Annuler</button>
                <button type="submit" disabled={saving} className="flex-[2] py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white font-bold transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20">
                  {saving ? 'Enregistrement…' : editingId ? 'Sauvegarder' : 'Ajouter l\'article'}
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
            <div className="w-14 h-14 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-5"><Trash2 className="text-rose-500" size={24} /></div>
            <h3 className="text-lg font-bold text-white mb-2">Supprimer cet article ?</h3>
            <p className="text-sm text-zinc-500 mb-8">Cette action est irréversible et retirera l'article de l'inventaire.</p>
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
