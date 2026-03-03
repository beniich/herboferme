'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { inventoryApi } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { toast } from 'react-hot-toast';

// Types
type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

interface InventoryItem {
    id: string;
    _id?: string;
    name: string;
    sku: string;
    category: string;
    currentStock: number;
    reorderPoint: number;
    unitPrice: number;
    status?: StockStatus;
}

export default function InventoryPage() {
    // State
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                setLoading(true);
                const data = await inventoryApi.getItems();
                setItems(Array.isArray(data) ? data : data.data || []);
            } catch (error) {
                console.error('Error fetching inventory:', error);
                toast.error('Impossible de charger l\'inventaire');
                setItems([]); // Fallback
            } finally {
                setLoading(false);
            }
        };
        fetchInventory();
    }, []);

    // Logic for status determination (if backend doesn't provide it)
    const processedItems = useMemo(() => {
        return items.map(item => {
            let status: StockStatus = 'IN_STOCK';
            if (item.currentStock <= 0) status = 'OUT_OF_STOCK';
            else if (item.currentStock <= item.reorderPoint) status = 'LOW_STOCK';
            
            return { ...item, status };
        });
    }, [items]);

    const filteredInventory = useMemo(() => {
        return processedItems.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.sku.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
            const matchesStatus = selectedStatus === 'All' ||
                (selectedStatus === 'Low Stock' && item.status === 'LOW_STOCK') ||
                (selectedStatus === 'Out of Stock' && item.status === 'OUT_OF_STOCK') ||
                (selectedStatus === 'In Stock' && item.status === 'IN_STOCK');

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [processedItems, searchQuery, selectedCategory, selectedStatus]);

    const categories = Array.from(new Set(items.map(item => item.category)));

    const stats = useMemo(() => {
        const totalValue = processedItems.reduce((acc, item) => acc + (item.currentStock * item.unitPrice), 0);
        const lowStock = processedItems.filter(i => i.status === 'LOW_STOCK').length;
        const outOfStock = processedItems.filter(i => i.status === 'OUT_OF_STOCK').length;
        return { totalValue, lowStock, outOfStock };
    }, [processedItems]);

    const getStatusBadge = (status: StockStatus) => {
        switch (status) {
            case 'IN_STOCK': return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    En Stock
                </span>
            );
            case 'LOW_STOCK': return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Stock Bas
                </span>
            );
            case 'OUT_OF_STOCK': return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    Rupture
                </span>
            );
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <LoadingSpinner />
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
             <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3">
                <div className="max-w-[1440px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/dashboard" className="flex items-center gap-3">
                            <h1 className="text-lg font-bold tracking-tight">Inventaire Herbute</h1>
                        </Link>
                    </div>
                    <div className="relative w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                        <input
                            type="text"
                            placeholder="Rechercher SKU ou article..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 py-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight">Gestion des Stocks</h2>
                        <p className="text-slate-500 mt-1">Surveillez et g  rez les pi  ces d  tach  es et consommables.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Total Articles</p>
                        <p className="text-2xl font-bold">{items.length}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm ring-1 ring-amber-500/20">
                        <p className="text-sm font-medium text-slate-500">Alertes Stock</p>
                        <p className="text-2xl font-bold">{stats.lowStock + stats.outOfStock}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Valeur Totale</p>
                        <p className="text-2xl font-bold">{stats.totalValue.toLocaleString()} DH</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="bg-transparent border-none text-sm focus:ring-0 cursor-pointer text-slate-700 dark:text-slate-300 font-medium"
                            >
                                <option value="All">Toutes Cat  gories</option>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="bg-transparent border-none text-sm focus:ring-0 cursor-pointer text-slate-700 dark:text-slate-300 font-medium"
                            >
                                <option value="All">Tous les Statuts</option>
                                <option value="In Stock">En Stock</option>
                                <option value="Low Stock">Stock Bas</option>
                                <option value="Out of Stock">Rupture</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                    <th className="px-6 py-4">Article / SKU</th>
                                    <th className="px-6 py-4">Cat  gorie</th>
                                    <th className="px-6 py-4">Stock Actuel</th>
                                    <th className="px-6 py-4">Point Commande</th>
                                    <th className="px-6 py-4">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {filteredInventory.map(item => (
                                    <tr key={item.id || item._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{item.name}</span>
                                                <span className="text-xs text-slate-500">{item.sku}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-medium">{item.category}</span>
                                        </td>
                                        <td className="px-6 py-4 font-bold">{item.currentStock} unit  s</td>
                                        <td className="px-6 py-4 text-slate-500">{item.reorderPoint} unit  s</td>
                                        <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredInventory.length === 0 && (
                            <div className="p-10 text-center text-slate-500 italic">Aucun article trouv  </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
