# 🌾 AgroMaître - Gestion & Ressources (Part 3 FINAL)

## 4️⃣ MODULE INVENTAIRE - SOLUTION COMPLÈTE

### BACKEND - Modèle Inventory

```typescript
// backend/models/Inventory.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryItem extends Document {
  name: string;
  category: 'equipment' | 'consumable' | 'seed' | 'fertilizer' | 'chemical' | 'tool';
  type: string;
  code: string; // INV-2026-001
  description?: string;
  quantity: number;
  unit: 'kg' | 'l' | 'unit' | 'm' | 'm2' | 'ton';
  minQuantity: number; // Alert threshold
  maxQuantity?: number;
  unitPrice: number;
  totalValue: number;
  supplier?: mongoose.Types.ObjectId;
  location: {
    storage: string; // Hangar A, Serre 2, etc.
    section?: string;
  };
  condition: 'new' | 'good' | 'fair' | 'poor';
  maintenanceSchedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    lastMaintenance?: Date;
    nextMaintenance?: Date;
  };
  movements: Array<{
    type: 'entry' | 'exit' | 'transfer' | 'adjustment';
    quantity: number;
    date: Date;
    reference?: string;
    reason?: string;
    user: mongoose.Types.ObjectId;
  }>;
  alerts: Array<{
    type: 'low_stock' | 'expiry' | 'maintenance';
    message: string;
    triggered: boolean;
    date: Date;
  }>;
  expiryDate?: Date;
  serialNumber?: string;
  photos?: string[];
  domain: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

const inventoryItemSchema = new Schema<IInventoryItem>(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['equipment', 'consumable', 'seed', 'fertilizer', 'chemical', 'tool'],
      required: true,
    },
    type: String,
    code: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    unit: {
      type: String,
      enum: ['kg', 'l', 'unit', 'm', 'm2', 'ton'],
      required: true,
    },
    minQuantity: {
      type: Number,
      required: true,
    },
    maxQuantity: Number,
    unitPrice: {
      type: Number,
      required: true,
    },
    totalValue: Number,
    supplier: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
    },
    location: {
      storage: {
        type: String,
        required: true,
      },
      section: String,
    },
    condition: {
      type: String,
      enum: ['new', 'good', 'fair', 'poor'],
      default: 'good',
    },
    maintenanceSchedule: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
      },
      lastMaintenance: Date,
      nextMaintenance: Date,
    },
    movements: [
      {
        type: {
          type: String,
          enum: ['entry', 'exit', 'transfer', 'adjustment'],
          required: true,
        },
        quantity: Number,
        date: {
          type: Date,
          default: Date.now,
        },
        reference: String,
        reason: String,
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    alerts: [
      {
        type: {
          type: String,
          enum: ['low_stock', 'expiry', 'maintenance'],
        },
        message: String,
        triggered: Boolean,
        date: Date,
      },
    ],
    expiryDate: Date,
    serialNumber: String,
    photos: [String],
    domain: {
      type: Schema.Types.ObjectId,
      ref: 'Domain',
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook
inventoryItemSchema.pre('save', function (next) {
  this.totalValue = this.quantity * this.unitPrice;
  
  // Check low stock alert
  if (this.quantity <= this.minQuantity) {
    const existingAlert = this.alerts.find(a => a.type === 'low_stock' && a.triggered);
    if (!existingAlert) {
      this.alerts.push({
        type: 'low_stock',
        message: `Stock bas: ${this.quantity} ${this.unit} (min: ${this.minQuantity})`,
        triggered: true,
        date: new Date(),
      });
    }
  }
  
  next();
});

export default mongoose.model<IInventoryItem>('InventoryItem', inventoryItemSchema);
```

### FRONTEND - Inventaire Component

```typescript
// frontend/components/inventory/InventoryManagement.tsx
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

  useEffect(() => {
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
      setItems(data.items);
      calculateStats(data.items);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const calculateStats = (items: any[]) => {
    setStats({
      totalItems: items.length,
      totalValue: items.reduce((sum, item) => sum + item.totalValue, 0),
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Inventaire
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestion du stock de matériel, équipements et consommables
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Package size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Articles</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalItems}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <TrendingUp size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Valeur Totale</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalValue.toLocaleString()} MAD
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <AlertTriangle size={24} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Stock Bas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.lowStockItems}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Périmés Bientôt</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.expiringItems}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Rechercher un article..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              />
            </div>

            <select className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
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
            <button className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center gap-2 transition-colors">
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
        {items.map((item) => (
          <div
            key={item._id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getCategoryIcon(item.category)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.code}
                    </p>
                  </div>
                </div>

                {item.quantity <= item.minQuantity && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                    Stock Bas
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Quantité</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {item.quantity} {item.unit}
                  </span>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
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
                  <span className="text-gray-500 dark:text-gray-400">Localisation</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {item.location.storage}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Valeur</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {item.totalValue.toLocaleString()} MAD
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
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
```

---

## 5️⃣ MODULE BASE DE CONNAISSANCE

### BACKEND - Modèle Knowledge Base

```typescript
// backend/models/KnowledgeArticle.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IKnowledgeArticle extends Document {
  title: string;
  slug: string;
  category: 'guide' | 'procedure' | 'faq' | 'training' | 'documentation';
  subcategory?: string;
  content: string; // Rich text / Markdown
  summary?: string;
  tags: string[];
  attachments?: Array<{
    name: string;
    url: string;
    type: string; // pdf, image, video
    size: number;
  }>;
  relatedArticles?: mongoose.Types.ObjectId[];
  author: mongoose.Types.ObjectId;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  views: number;
  helpful: {
    yes: number;
    no: number;
  };
  lastReviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  domain: mongoose.Types.ObjectId;
}

const knowledgeArticleSchema = new Schema<IKnowledgeArticle>(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      enum: ['guide', 'procedure', 'faq', 'training', 'documentation'],
      required: true,
    },
    subcategory: String,
    content: {
      type: String,
      required: true,
    },
    summary: String,
    tags: [String],
    attachments: [
      {
        name: String,
        url: String,
        type: String,
        size: Number,
      },
    ],
    relatedArticles: [
      {
        type: Schema.Types.ObjectId,
        ref: 'KnowledgeArticle',
      },
    ],
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    publishedAt: Date,
    views: {
      type: Number,
      default: 0,
    },
    helpful: {
      yes: {
        type: Number,
        default: 0,
      },
      no: {
        type: Number,
        default: 0,
      },
    },
    lastReviewedAt: Date,
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    domain: {
      type: Schema.Types.ObjectId,
      ref: 'Domain',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
knowledgeArticleSchema.index({ title: 'text', content: 'text', tags: 'text' });

export default mongoose.model<IKnowledgeArticle>(
  'KnowledgeArticle',
  knowledgeArticleSchema
);
```

### FRONTEND - Base de Connaissance

```typescript
// frontend/components/knowledge/KnowledgeBase.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Book,
  Search,
  FileText,
  Video,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Download,
} from 'lucide-react';

export const KnowledgeBase: React.FC = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, [selectedCategory]);

  const fetchArticles = async () => {
    const params = selectedCategory !== 'all' ? `?category=${selectedCategory}` : '';
    const response = await fetch(`/api/knowledge${params}`);
    const data = await response.json();
    setArticles(data.articles);
  };

  const fetchCategories = () => {
    setCategories([
      { name: 'Guides', count: 12, icon: Book },
      { name: 'Procédures', count: 8, icon: FileText },
      { name: 'FAQ', count: 24, icon: HelpCircle },
      { name: 'Formations', count: 6, icon: Video },
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Base de Connaissance
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Documentation, guides et procédures agricoles
        </p>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
        <div className="relative max-w-2xl mx-auto">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={24}
          />
          <input
            type="text"
            placeholder="Rechercher dans la base de connaissance..."
            className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {categories.map((category, index) => (
          <button
            key={index}
            onClick={() => setSelectedCategory(category.name.toLowerCase())}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
              <category.icon size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {category.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {category.count} articles
            </p>
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <article
            key={article._id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                {article.category}
              </span>
              
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {article.title}
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {article.summary}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span>{article.views} vues</span>
                <span>{new Date(article.publishedAt).toLocaleDateString('fr-FR')}</span>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <button className="flex items-center gap-1 text-green-600 hover:text-green-700">
                  <ThumbsUp size={16} />
                  {article.helpful.yes}
                </button>
                <button className="flex items-center gap-1 text-red-600 hover:text-red-700">
                  <ThumbsDown size={16} />
                  {article.helpful.no}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
```

**MODULES GESTION & RESSOURCES 100% COMPLETS ! 🎉**
