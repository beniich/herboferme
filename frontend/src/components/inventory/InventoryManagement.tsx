'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  Plus,
  Search,
  Download,
  ArrowUpCircle,
  ArrowDownCircle,
} from 'lucide-react';

export const InventoryManagement: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    expiringItems: 0,
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setItems(data.items || []);
      calculateStats(data.items || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const calculateStats = (items: any[]) => {
    setStats({
      totalItems: items.length,
      totalValue: items.reduce((sum, item) => sum + (item.totalValue || 0), 0),
      lowStockItems: items.filter((item) => item.quantity <= item.minQuantity)
        .length,
      expiringItems: items.filter(
        (item) =>
          item.expiryDate &&
          new Date(item.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ).length,
    });
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      equipment: '🚜',
      consumable: '📦',
      seed: '🌱',
      fertilizer: '🧪',
      chemical: '⚗️',
      tool: '🔧',
    };
    return icons[category] || '📦';
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-[calc(100vh-100px)] bg-slate-50 dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Inventaire
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Gestion du stock de matériel, équipements et consommables
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Package size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Articles</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.totalItems}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <TrendingUp size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Valeur Totale</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.totalValue.toLocaleString()} MAD
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <AlertTriangle size={24} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Stock Bas</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.lowStockItems}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Périmés Bientôt</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.expiringItems}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 mb-6 border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Rechercher un article..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 outline-none"
              />
            </div>

            <select className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 outline-none">
              <option value="">Toutes catégories</option>
              <option value="equipment">Équipements</option>
              <option value="consumable">Consommables</option>
              <option value="seed">Semences</option>
              <option value="fertilizer">Engrais</option>
              <option value="chemical">Produits chimiques</option>
              <option value="tool">Outils</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg flex items-center gap-2 transition-colors">
              <Download size={18} />
              Export
            </button>

            <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors">
              <Plus size={20} />
              Ajouter Article
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            Aucun article dans l'inventaire.
          </div>
        ) : items.map((item) => (
          <div
            key={item._id}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-slate-100 dark:border-slate-800"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getCategoryIcon(item.category)}</span>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {item.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {item.code}
                    </p>
                  </div>
                </div>

                {item.quantity <= item.minQuantity && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 text-xs font-medium rounded-full">
                    Stock Bas
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Quantité</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {item.quantity} {item.unit}
                  </span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      item.quantity <= item.minQuantity
                        ? 'bg-orange-500'
                        : 'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.min(
                        (item.quantity / (item.maxQuantity || item.minQuantity * 2)) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Localisation</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {item.location?.storage || "-"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Valeur</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {(item.totalValue || 0).toLocaleString()} MAD
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex gap-2">
                <button className="flex-1 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/30 flex items-center justify-center gap-2 transition-colors">
                  <ArrowUpCircle size={16} />
                  Entrée
                </button>
                <button className="flex-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center gap-2 transition-colors">
                  <ArrowDownCircle size={16} />
                  Sortie
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
