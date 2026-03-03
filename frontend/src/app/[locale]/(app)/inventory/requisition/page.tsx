
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Save, Send, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Validation Schema
const requisitionItemSchema = z.object({
    itemId: z.string().min(1, 'Article requis'),
    itemName: z.string().min(1, 'Nom requis'),
    quantityRequested: z.number()
        .min(1, 'Quantit   minimum: 1')
        .max(1000, 'Quantit   maximum: 1000'),
    unit: z.string(),
    urgency: z.enum(['normal', 'urgent', 'emergency']),
    justification: z.string().optional(),
});

const requisitionFormSchema = z.object({
    title: z.string()
        .min(5, 'Le titre doit contenir au moins 5 caract  res')
        .max(100, 'Le titre ne peut pas d  passer 100 caract  res'),
    description: z.string()
        .min(10, 'Description trop courte')
        .max(500, 'Description trop longue'),
    teamId: z.string().optional(),
    complaintId: z.string().optional(),
    requiredBy: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date().optional()),
    urgency: z.enum(['normal', 'urgent', 'emergency']).default('normal'),
    items: z.array(requisitionItemSchema)
        .min(1, 'Au moins un article requis')
        .max(20, 'Maximum 20 articles par r  quisition'),
});

type RequisitionFormData = z.infer<typeof requisitionFormSchema>;

interface InventoryItem {
    id: string;
    code: string;
    name: string;
    category: string;
    unit: string;
    currentStock: number;
    minStock: number;
    description?: string;
    price?: number;
}

export default function MaterialRequisitionPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [availableItems, setAvailableItems] = useState<InventoryItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        // watch,
        formState: { errors, isSubmitting },
    } = useForm<RequisitionFormData>({
        resolver: zodResolver(requisitionFormSchema) as any,
        defaultValues: {
            urgency: 'normal',
            items: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items',
    });

    // Recherche d'articles dans l'inventaire
    const searchInventory = async () => {
        // if (!searchTerm.trim()) return;

        setIsSearching(true);
        try {
            // Mock search for now
            // const response = await fetch(`/api/inventory/items/search?q=${searchTerm}`);
            // const items = await response.json();

            // Simulated mock data
            await new Promise(resolve => setTimeout(resolve, 500));
            const items: InventoryItem[] = [
                { id: '1', code: 'ELEC-001', name: 'C  ble   lectrique 10mm', category: '  lectricit  ', unit: 'm', currentStock: 150, minStock: 50 },
                { id: '2', code: 'EAU-002', name: 'Tuyau PVC 50mm', category: 'Plomberie', unit: 'm', currentStock: 80, minStock: 20 },
                { id: '3', code: 'ROAD-003', name: 'Bitume    froid', category: 'Voirie', unit: 'kg', currentStock: 500, minStock: 100 },
                { id: '4', code: 'LIGHT-004', name: 'Lampe LED 100W', category: '  clairage', unit: 'pcs', currentStock: 30, minStock: 10 },
            ].filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.code.toLowerCase().includes(searchTerm.toLowerCase()));

            setAvailableItems(items);
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors de la recherche');
        } finally {
            setIsSearching(false);
        }
    };

    // Ajouter un article    la r  quisition
    const addItem = (item: InventoryItem) => {
        // V  rifier si d  j   ajout
        const existing = fields.find((f) => f.itemId === item.id);
        if (existing) {
            toast.warning('Article d  j   dans la liste');
            return;
        }

        append({
            itemId: item.id,
            itemName: item.name,
            quantityRequested: 1,
            unit: item.unit,
            urgency: 'normal',
            justification: '',
        });

        toast.success(`${item.name} ajout  `);
    };

    // Sauvegarde brouillon
    const saveDraft = async (data: RequisitionFormData) => {
        try {
            // const response = await fetch('/api/requisitions', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({ ...data, status: 'draft' }),
            // });

            // if (!response.ok) throw new Error('Erreur de sauvegarde');

            // const result = await response.json();

            // Mock API call
            console.log('Saving draft:', data);
            await new Promise(resolve => setTimeout(resolve, 1000));
            // const result = { id: 'REQ-' + Date.now() };

            toast.success('Brouillon sauvegard  ');
            // router.push(`/inventory/requisition/${result.id}`);
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors de la sauvegarde');
        }
    };

    // Soumission finale
    const submitRequisition = async (data: RequisitionFormData) => {
        try {
            // const response = await fetch('/api/requisitions', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({ ...data, status: 'pending' }),
            // });

            // if (!response.ok) throw new Error('Erreur de soumission');

            // const result = await response.json();

            // Mock API call
            console.log('Submitting:', data);
            await new Promise(resolve => setTimeout(resolve, 1000));
            const result = { id: 'REQ-' + Date.now(), referenceNumber: 'REQ-2025-001' };

            toast.success('R  quisition soumise avec succ  s!', {
                description: `R  f  rence: ${result.referenceNumber}`,
            });
            router.push(`/inventory/requisition/${result.id}`);
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors de la soumission');
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    Nouvelle R  quisition de Mat  riel
                </h1>
                <p className="text-slate-500 mt-1">
                    Demandez le mat  riel n  cessaire pour vos interventions
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Formulaire Principal */}
                <div className="lg:col-span-2 space-y-6">
                    <form className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
                        {/* Informations g  n  rales */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Informations g  n  rales</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Titre de la r  quisition *
                                    </label>
                                    <input
                                        {...register('title')}
                                        placeholder="Ex: Mat  riel pour r  paration Avenue Hassan II"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                                    />
                                    {errors.title && (
                                        <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        {...register('description')}
                                        rows={3}
                                        placeholder="D  crivez le contexte et l'utilisation pr  vue..."
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                                    />
                                    {errors.description && (
                                        <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Urgence
                                        </label>
                                        <select
                                            {...register('urgency')}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-slate-800"
                                        >
                                            <option value="normal">Normale</option>
                                            <option value="urgent">Urgente</option>
                                            <option value="emergency">Urgence</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Requis avant (optionnel)
                                        </label>
                                        <input
                                            type="date"
                                            {...register('requiredBy')}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Liste des articles */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Articles demand  s</h3>

                            {fields.length === 0 ? (
                                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600">
                                    <p className="text-slate-500 mb-2">Aucun article ajout  </p>
                                    <p className="text-sm text-slate-400">
                                        Utilisez la recherche pour ajouter des articles
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {fields.map((field, index) => (
                                        <div
                                            key={field.id}
                                            className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h4 className="font-semibold">{field.itemName}</h4>
                                                    <p className="text-sm text-slate-500">ID: {field.itemId}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => remove(index)}
                                                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-3 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium mb-1">
                                                        Quantit   *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        {...register(`items.${index}.quantityRequested`, {
                                                            valueAsNumber: true,
                                                        })}
                                                        min="1"
                                                        className="w-full px-3 py-1.5 border rounded text-sm"
                                                    />
                                                    {errors.items?.[index]?.quantityRequested && (
                                                        <p className="text-red-500 text-xs mt-1">
                                                            {errors.items[index].quantityRequested?.message}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium mb-1">Unit  </label>
                                                    <input
                                                        {...register(`items.${index}.unit`)}
                                                        disabled
                                                        className="w-full px-3 py-1.5 border rounded text-sm bg-slate-100 dark:bg-slate-700"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium mb-1">
                                                        Urgence
                                                    </label>
                                                    <select
                                                        {...register(`items.${index}.urgency`)}
                                                        className="w-full px-3 py-1.5 border rounded text-sm bg-white dark:bg-slate-800"
                                                    >
                                                        <option value="normal">Normal</option>
                                                        <option value="urgent">Urgent</option>
                                                        <option value="emergency">Urgence</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="mt-3">
                                                <label className="block text-xs font-medium mb-1">
                                                    Justification (optionnel)
                                                </label>
                                                <input
                                                    {...register(`items.${index}.justification`)}
                                                    placeholder="Pourquoi cet article est n  cessaire..."
                                                    className="w-full px-3 py-1.5 border rounded text-sm"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {errors.items && (
                                <p className="text-red-500 text-sm mt-2">{errors.items.message}</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between pt-4 border-t">
                            <button
                                type="button"
                                onClick={handleSubmit(saveDraft)}
                                disabled={isSubmitting}
                                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Sauvegarder brouillon
                            </button>

                            <button
                                type="button"
                                onClick={handleSubmit(submitRequisition)}
                                disabled={isSubmitting || fields.length === 0}
                                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                {isSubmitting ? 'Envoi...' : 'Soumettre la r  quisition'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Recherche d'articles */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 sticky top-6">
                        <h3 className="text-lg font-semibold mb-4">Rechercher des articles</h3>

                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && searchInventory()}
                                placeholder="Code ou nom d'article..."
                                className="flex-1 px-3 py-2 border rounded-lg text-sm"
                            />
                            <button
                                onClick={searchInventory}
                                disabled={isSearching}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                type="button"
                            >
                                <Search className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-2 max-h-[600px] overflow-y-auto">
                            {availableItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary transition-colors cursor-pointer"
                                    onClick={() => addItem(item)}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                                            <p className="text-xs text-slate-500">{item.code}</p>
                                        </div>
                                        <button
                                            type="button"
                                            className="p-1 hover:bg-primary/10 text-primary rounded transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500">{item.category}</span>
                                        <span className={`font-semibold ${item.currentStock <= item.minStock
                                            ? 'text-red-500'
                                            : 'text-green-500'
                                            }`}>
                                            Stock: {item.currentStock} {item.unit}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {isSearching && (
                                <div className="text-center py-8">
                                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                                    <p className="text-sm text-slate-500 mt-2">Recherche...</p>
                                </div>
                            )}

                            {!isSearching && searchTerm && availableItems.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-slate-500">Aucun article trouv  </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
