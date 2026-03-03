'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
    Calendar,
    User,
    Building2,
    MapPin,
    DollarSign,
    Trash2,
    AlertCircle,
    Save,
    Send,
    FileText,
    Truck,
    Package,
    TrendingUp,
    Clock,
    CheckCircle2,
    Warehouse
} from 'lucide-react';

import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Alert } from './ui/Alert';
import { Badge } from './ui/Badge';
import { MaterialSearch } from './MaterialSearch';

import {
    MaterialRequisition,
    RequestedItem,
    Material,
    StockAlert
} from '@/types/material-requisition';
import {
    mockComplaints,
    mockDepartments,
    mockSites,
    mockUsers,
    getMaterialById,
    getComplaintById,
    checkStockAvailability
} from '@/lib/inventory/mockData';
import {
    formatCurrency,
    generateRequisitionId,
    getPriorityColor,
    determineApprovalLevel,
    calculateDaysUntil,
    cn
} from '@/lib/inventory/utils';

interface FormData {
    requesterName: string;
    requesterId: string;
    department: string;
    site: string;
    complaintId: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    neededBy: string;
    estimatedBudget: number;
    approverId: string;
    items: RequestedItem[];
    deliveryMode: 'warehouse_pickup' | 'site_delivery';
    deliveryAddress: string;
    deliveryInstructions: string;
    notes: string;
}

export const MaterialRequisitionForm: React.FC = () => {
    const [alerts, setAlerts] = useState<StockAlert[]>([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [approvalLevel, setApprovalLevel] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState<any>(null);

    const {
        register,
        control,
        watch,
        setValue,
        handleSubmit,
        formState: { errors }
    } = useForm<FormData>({
        defaultValues: {
            items: [],
            deliveryMode: 'warehouse_pickup',
            priority: 'medium',
            neededBy: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            requesterName: 'Ahmed El Mansouri', // Mock logged in user
            requesterId: 'USR-001'
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items'
    });

    const watchedItems = watch('items');
    const watchedComplaintId = watch('complaintId');
    const watchedNeededBy = watch('neededBy');
    const watchedDeliveryMode = watch('deliveryMode');

    // Calculate total amount whenever items change
    useEffect(() => {
        let total = 0;
        const newAlerts: StockAlert[] = [];

        watchedItems?.forEach((item) => {
            if (item.materialId) {
                const material = getMaterialById(item.materialId);
                if (material && item.quantity) {
                    const itemTotal = material.unitPrice * item.quantity;
                    total += itemTotal;

                    // Check stock availability
                    const stockCheck = checkStockAvailability(item.materialId, item.quantity);
                    if (!stockCheck.available) {
                        if (stockCheck.currentStock === 0) {
                            newAlerts.push({
                                type: 'out_of_stock',
                                message: `${material.name} est en rupture de stock. Stock actuel: 0`,
                                severity: 'error',
                                materialId: material.id
                            });
                        } else {
                            newAlerts.push({
                                type: 'low_stock',
                                message: `Stock insuffisant pour ${material.name}. Disponible: ${stockCheck.currentStock}, Demand  : ${item.quantity}`,
                                severity: 'warning',
                                materialId: material.id
                            });
                        }
                    }

                    // Check reorder time
                    if (material.reorderTime > 3) {
                        const daysUntilNeeded = watchedNeededBy ? calculateDaysUntil(watchedNeededBy) : 7;
                        if (daysUntilNeeded < material.reorderTime) {
                            newAlerts.push({
                                type: 'long_lead_time',
                                message: `D  lai d'approvisionnement de ${material.name} (${material.reorderTime} jours) sup  rieur    votre   ch  ance`,
                                severity: 'warning',
                                materialId: material.id
                            });
                        }
                    }
                }
            }
        });

        setTotalAmount(total);

        // Check budget
        const estimatedBudget = watch('estimatedBudget');
        if (estimatedBudget && total > estimatedBudget) {
            newAlerts.push({
                type: 'overbudget',
                message: `Le montant total (${formatCurrency(total)}) d  passe le budget estim   (${formatCurrency(estimatedBudget)})`,
                severity: 'error'
            });
        }

        setAlerts(newAlerts);
        setApprovalLevel(determineApprovalLevel(total));
    }, [watchedItems, watchedNeededBy, watch]);

    // Load complaint details when selected
    useEffect(() => {
        if (watchedComplaintId) {
            const complaint = getComplaintById(watchedComplaintId);
            setSelectedComplaint(complaint);
            if (complaint) {
                setValue('deliveryAddress', complaint.address);
            }
        } else {
            setSelectedComplaint(null);
        }
    }, [watchedComplaintId, setValue]);

    const handleAddMaterial = (material: Material) => {
        append({
            materialId: material.id,
            material: material,
            quantity: 1,
            justification: ''
        });
    };

    const handleRemoveItem = (index: number) => {
        remove(index);
    };

    const onSubmit = async (data: FormData, isDraft: boolean = false) => {
        setIsSubmitting(true);

        try {
            const requisition: MaterialRequisition = {
                id: generateRequisitionId(),
                requestDate: new Date(),
                requesterName: data.requesterName,
                requesterId: data.requesterId,
                department: data.department,
                site: data.site,
                complaintId: data.complaintId,
                priority: data.priority,
                neededBy: new Date(data.neededBy),
                estimatedBudget: data.estimatedBudget,
                approverId: data.approverId,
                items: data.items,
                deliveryMode: data.deliveryMode,
                deliveryAddress: data.deliveryAddress,
                deliveryInstructions: data.deliveryInstructions,
                notes: data.notes,
                status: isDraft ? 'draft' : 'pending_approval',
                totalAmount: totalAmount,
                submittedAt: isDraft ? undefined : new Date(),
            };

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            console.log('Requisition submitted:', requisition);
            alert(`R  quisition ${isDraft ? 'sauvegard  e en brouillon' : 'soumise'} avec succ  s! ID: ${requisition.id}`);

        } catch (error) {
            console.error('Error submitting requisition:', error);
            alert('Erreur lors de la soumission');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <form onSubmit={handleSubmit((data) => onSubmit(data, false))} className="space-y-8">
                {/* Alerts */}
                {alerts.length > 0 && (
                    <div className="space-y-3">
                        {alerts.map((alert, index) => (
                            <Alert
                                key={index}
                                variant={alert.severity === 'error' ? 'error' : 'warning'}
                                title={alert.type === 'overbudget' ? 'Budget d  pass  ' :
                                    alert.type === 'out_of_stock' ? 'Rupture de stock' :
                                        alert.type === 'low_stock' ? 'Stock faible' :
                                            'D  lai d\'approvisionnement'}
                            >
                                {alert.message}
                            </Alert>
                        ))}
                    </div>
                )}

                {/* Progress / Status Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/20 transition-all duration-1000"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">
                            <span className="size-2 bg-primary rounded-full animate-pulse"></span>
                            Nouvelle R  quisition
                        </div>
                        <h2 className="text-2xl font-black italic uppercase tracking-tight leading-none mb-1">RT-Material-<span className="text-primary italic">Sync</span></h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Syst  me de gestion des flux critiques</p>
                    </div>
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aujourd'hui</p>
                            <p className="text-sm font-black italic">{new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <div className="h-10 w-[1px] bg-slate-800"></div>
                        <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:rotate-12 transition-transform">
                            <Package className="size-6" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* General Information Card */}
                        <Card
                            title="Contexte & Identification"
                            icon={<FileText className="h-5 w-5" />}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Input
                                    label="Demandeur"
                                    icon={<User className="h-4 w-4" />}
                                    {...register('requesterName', { required: 'Ce champ est requis' })}
                                    error={errors.requesterName?.message}
                                    placeholder="Nom complet"
                                    required
                                />

                                <Select
                                    label="D  partement Op  rationnel"
                                    icon={<Building2 className="h-4 w-4" />}
                                    {...register('department', { required: 'Ce champ est requis' })}
                                    error={errors.department?.message}
                                    options={mockDepartments.map(d => ({ value: d.id, label: d.name }))}
                                    placeholder="Choisir..."
                                    required
                                />

                                <Select
                                    label="Site de Stockage / Retrait"
                                    icon={<MapPin className="h-4 w-4" />}
                                    {...register('site', { required: 'Ce champ est requis' })}
                                    error={errors.site?.message}
                                    options={mockSites.map(s => ({ value: s.id, label: s.name }))}
                                    placeholder="Choisir un d  p  t..."
                                    required
                                />

                                <Input
                                    label="  ch  ance Souhait  e"
                                    type="date"
                                    icon={<Calendar className="h-4 w-4" />}
                                    {...register('neededBy', { required: 'Ce champ est requis' })}
                                    error={errors.neededBy?.message}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />

                                <Input
                                    label="Budget (MAD)"
                                    type="number"
                                    step="0.01"
                                    icon={<DollarSign className="h-4 w-4" />}
                                    {...register('estimatedBudget', {
                                        required: 'Ce champ est requis',
                                        min: { value: 0, message: 'Le budget doit   tre positif' }
                                    })}
                                    error={errors.estimatedBudget?.message}
                                    placeholder="0.00"
                                    required
                                />

                                <Select
                                    label="Approbateur Manager"
                                    icon={<User className="h-4 w-4" />}
                                    {...register('approverId', { required: 'Ce champ est requis' })}
                                    error={errors.approverId?.message}
                                    options={mockUsers.filter(u => u.role === 'manager').map(u => ({
                                        value: u.id,
                                        label: u.name
                                    }))}
                                    placeholder="Choisir l'autorit  ..."
                                    required
                                />
                            </div>
                        </Card>

                        {/* Complaint Information Card */}
                        <Card
                            title="R  f  rence Incident"
                            icon={<AlertCircle className="h-5 w-5" />}
                            description="Lier cette demande    une intervention sp  cifique"
                        >
                            <div className="space-y-6">
                                <Select
                                    label="Ticket ReclamTrack"
                                    {...register('complaintId')}
                                    options={mockComplaints.map(c => ({
                                        value: c.id,
                                        label: `${c.id} - ${c.title}`
                                    }))}
                                    placeholder="S  lectionner une r  clamation (optionnel)"
                                />

                                {selectedComplaint && (
                                    <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-2">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Interface</p>
                                                <Badge variant="info" size="sm">
                                                    {selectedComplaint.type === 'repair' ? 'R  paration' :
                                                        selectedComplaint.type === 'installation' ? 'Installation' :
                                                            'Maintenance'}
                                                </Badge>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Urgence</p>
                                                <Badge className={getPriorityColor(selectedComplaint.priority)} size="sm">
                                                    {selectedComplaint.priority.toUpperCase()}
                                                </Badge>
                                            </div>
                                            <div className="md:col-span-2">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Localisation Intervention</p>
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 italic">{selectedComplaint.address}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <Select
                                    label="Niveau de Priorit   Logistique"
                                    {...register('priority', { required: 'Ce champ est requis' })}
                                    error={errors.priority?.message}
                                    options={[
                                        { value: 'low', label: 'Standard (Basse)' },
                                        { value: 'medium', label: 'Op  rationnelle (Moyenne)' },
                                        { value: 'high', label: 'Prioritaire (Haute)' },
                                        { value: 'urgent', label: 'Critique (Urgente)' },
                                    ]}
                                    required
                                />
                            </div>
                        </Card>

                        {/* Requested Materials Card */}
                        <Card
                            title="Articles de Inventaire"
                            icon={<Package className="h-5 w-5" />}
                            actions={
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{fields.length} ligne{fields.length !== 1 ? 's' : ''}</span>
                                    <Badge variant="success" size="sm">
                                        {formatCurrency(totalAmount)}
                                    </Badge>
                                </div>
                            }
                        >
                            <div className="mb-8">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">
                                    Recherche Dynamique du Catalogue
                                </label>
                                <MaterialSearch
                                    onSelect={handleAddMaterial}
                                    excludeIds={fields.map(f => f.materialId)}
                                />
                            </div>

                            {fields.length === 0 ? (
                                <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/30">
                                    <div className="size-16 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                                        <Package className="size-8" />
                                    </div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Le panier est actuellement vide</p>
                                    <p className="text-[10px] font-bold text-slate-500 mt-2 italic max-w-[200px] mx-auto">Veuillez utiliser la barre de recherche ci-dessus pour ajouter des articles.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {fields.map((field, index) => {
                                        const material = getMaterialById(field.materialId);
                                        if (!material) return null;

                                        const quantity = watchedItems[index]?.quantity || 0;
                                        const itemTotal = material.unitPrice * quantity;
                                        const stockCheck = checkStockAvailability(material.id, quantity);

                                        return (
                                            <div
                                                key={field.id}
                                                className="p-6 border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 group/item hover:border-primary/50 transition-all duration-300 relative overflow-hidden"
                                            >
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-bl-[4rem] -mr-6 -mt-6 group-hover/item:bg-primary/5 transition-colors"></div>

                                                <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-6 relative z-10">
                                                    <div className="flex-1">
                                                        <div className="flex flex-wrap items-center gap-3 mb-3">
                                                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
                                                                {material.name}
                                                            </h4>
                                                            <span className="text-[9px] font-black text-primary px-2 py-0.5 bg-primary/5 rounded-full border border-primary/10 tracking-widest">{material.sku}</span>
                                                            {!stockCheck.available && (
                                                                <span className="text-[9px] font-black text-rose-500 px-2 py-0.5 bg-rose-50 rounded-full border border-rose-100 tracking-widest animate-pulse">ALERTE STOCK</span>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                            <span className="flex items-center gap-1.5"><Building2 className="size-3" /> {material.category}</span>
                                                            <span className="flex items-center gap-1.5"><Warehouse className="size-3" /> {(material as any).currentStock} {material.unit} en rayon</span>
                                                            <span className="flex items-center gap-1.5"><DollarSign className="size-3" /> {formatCurrency(material.unitPrice)}/pce</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveItem(index)}
                                                        className="size-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                                    >
                                                        <Trash2 className="size-5" />
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                                                    <div className="md:col-span-1">
                                                        <Input
                                                            type="number"
                                                            label="Quantit   Demand  e"
                                                            min="1"
                                                            {...register(`items.${index}.quantity`, {
                                                                required: 'Requis',
                                                                min: { value: 1, message: 'Min 1' },
                                                                valueAsNumber: true
                                                            })}
                                                            error={errors.items?.[index]?.quantity?.message}
                                                        />
                                                    </div>
                                                    <div className="md:col-span-3">
                                                        <Input
                                                            label="Justification Op  rationnelle"
                                                            {...register(`items.${index}.justification`, {
                                                                required: 'Requis'
                                                            })}
                                                            error={errors.items?.[index]?.justification?.message}
                                                            placeholder="Indiquez pourquoi ce mat  riel est n  cessaire..."
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mt-6 flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 relative z-10 group-hover/item:bg-primary/5 group-hover/item:border-primary/10 transition-all">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Sous-total article</span>
                                                    <span className="text-lg font-black italic text-slate-900 dark:text-white">
                                                        {formatCurrency(itemTotal)}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    <div className="mt-10 p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                                        <div className="relative z-10 space-y-6">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-black text-slate-400 uppercase tracking-[0.3em]">Total R  quisition HT</span>
                                                <span className="text-3xl font-black italic text-primary">{formatCurrency(totalAmount)}</span>
                                            </div>
                                            <div className="h-[1px] bg-slate-800"></div>
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                                    <CheckCircle2 className="size-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Protocole d'Approbation</p>
                                                    <p className="text-sm font-black italic">
                                                        {approvalLevel === 'auto' ? 'Validation Automatique (Seuil bas)' :
                                                            approvalLevel === 'manager' ? 'Validation Niveau Manager' :
                                                                approvalLevel === 'director' ? 'Validation Directoire' : 'Validation Conseil Strat  gique'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>

                    <div className="space-y-8">
                        {/* Summary / Action Card */}
                        <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                            <div className="relative z-10 space-y-8">
                                <div>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">
                                        <TrendingUp className="size-4" />
                                        Monitoring Analytics
                                    </div>
                                    <h3 className="text-xl font-black italic uppercase italic tracking-tight mb-6">R  sum   Global</h3>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Articles</p>
                                            <p className="text-2xl font-black italic uppercase leading-none">{fields.length}</p>
                                        </div>
                                        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Items Totaux</p>
                                            <p className="text-2xl font-black italic uppercase leading-none">
                                                {watchedItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 col-span-2">
                                            <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1">Montant Estim  </p>
                                            <p className="text-2xl font-black italic uppercase leading-none">{formatCurrency(totalAmount)}</p>
                                        </div>
                                        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 col-span-2">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">D  lai Livraison</p>
                                                <Clock className="size-3 text-primary animate-pulse" />
                                            </div>
                                            <p className="text-2xl font-black italic uppercase leading-none">
                                                {watchedNeededBy ? calculateDaysUntil(watchedNeededBy) : 0} Jours
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="w-full py-5 rounded-[2rem] text-xs shadow-2xl hover:scale-[1.02] active:scale-95"
                                        isLoading={isSubmitting}
                                        disabled={fields.length === 0}
                                        icon={<Send className="h-5 w-5" />}
                                    >
                                        TRANSMETTRE AU STOCK
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full py-5 rounded-[2rem] text-xs border-slate-700 text-slate-400 hover:text-white hover:border-slate-500"
                                        onClick={handleSubmit((data) => onSubmit(data, true))}
                                        disabled={isSubmitting || fields.length === 0}
                                        icon={<Save className="h-5 w-5" />}
                                    >
                                        BROUILLON SECURISE
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Logistics Configuration */}
                        <Card
                            title="Logistique Sync"
                            icon={<Truck className="h-5 w-5" />}
                            description="Param  tres de acheminement"
                        >
                            <div className="space-y-6">
                                <Select
                                    label="Canal de Distribution"
                                    {...register('deliveryMode', { required: 'Ce champ est requis' })}
                                    error={errors.deliveryMode?.message}
                                    options={[
                                        { value: 'warehouse_pickup', label: 'Retrait Magasin Central' },
                                        { value: 'site_delivery', label: 'Livraison Rapide sur Site' },
                                    ]}
                                    required
                                />

                                {watchedDeliveryMode === 'site_delivery' && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                                        <Input
                                            label="Destination Pr  cise"
                                            icon={<MapPin className="h-4 w-4" />}
                                            {...register('deliveryAddress', {
                                                required: watchedDeliveryMode === 'site_delivery' ? 'Requis pour livraison' : false
                                            })}
                                            error={errors.deliveryAddress?.message}
                                            placeholder="Indiquez l'adresse ou coordonn  es..."
                                        />
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                                Notes pour le Transporteur
                                            </label>
                                            <textarea
                                                {...register('deliveryInstructions')}
                                                rows={3}
                                                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold italic text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                                                placeholder="Ex: Acc  s restreint, badge requis..."
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Additional Notes Card */}
                        <Card
                            title="Observations"
                            icon={<FileText className="h-5 w-5" />}
                        >
                            <textarea
                                {...register('notes')}
                                rows={4}
                                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold italic text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                                placeholder="Pr  cisions utiles pour le traitement de votre demande..."
                            />
                        </Card>

                        <div className="p-8 bg-amber-500/5 border border-amber-500/10 rounded-[2.5rem] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 text-amber-600 font-black text-[10px] uppercase tracking-widest italic mb-3">
                                    <span className="material-symbols-outlined text-sm">warning</span>
                                    Avis de Conformit
                                </div>
                                <p className="text-[11px] text-amber-700/70 font-bold leading-relaxed italic">
                                    Toute demande de mat  riel doit   tre justifi  e par une urgence r  elle. L&apos;inventaire est audit   hebdomadairement. En cas de pr  t d&apos;outillage, retour sous 48h.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};
