import React, { useState, useEffect, useRef } from 'react';
import { Search, Package, DollarSign, Warehouse } from 'lucide-react';
import { Material } from '@/types/material-requisition';
import { searchMaterials } from '@/lib/inventory/mockData';
import { formatCurrency, cn } from '@/lib/inventory/utils';

interface MaterialSearchProps {
    onSelect: (material: Material) => void;
    excludeIds?: string[];
    placeholder?: string;
}

export const MaterialSearch: React.FC<MaterialSearchProps> = ({
    onSelect,
    excludeIds = [],
    placeholder = "Rechercher un mat  riau..."
}) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Material[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (query.length >= 2) {
            const filtered = searchMaterials(query).filter(
                m => !excludeIds.includes(m.id)
            );
            setResults(filtered);
            setIsOpen(filtered.length > 0);
        } else {
            setResults([]);
            setIsOpen(false);
        }
    }, [query, excludeIds]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (material: Material) => {
        onSelect(material);
        setQuery('');
        setResults([]);
        setIsOpen(false);
        setSelectedIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < results.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && results[selectedIndex]) {
                    handleSelect(results[selectedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSelectedIndex(-1);
                break;
        }
    };

    const getStockStatus = (material: Material) => {
        if (material.currentStock === 0) return { color: 'text-rose-600', label: 'Rupture' };
        if (material.currentStock <= material.minStockLevel) return { color: 'text-amber-600', label: 'Stock faible' };
        return { color: 'text-emerald-600', label: 'En stock' };
    };

    return (
        <div ref={wrapperRef} className="relative">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => results.length > 0 && setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full h-12 pl-12 pr-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                />
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute z-50 w-full mt-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                    {results.map((material, index) => {
                        const stockStatus = getStockStatus(material);
                        const isSelected = index === selectedIndex;

                        return (
                            <button
                                key={material.id}
                                onClick={() => handleSelect(material)}
                                className={cn(
                                    'w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors mb-1 last:mb-0',
                                    isSelected && 'bg-primary/5 ring-1 ring-primary/20'
                                )}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Package className="h-4 w-4 text-primary" />
                                            <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">
                                                {material.name}
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                                            SKU: {material.sku}     {material.category}
                                        </p>
                                        <div className="flex items-center justify-between gap-4 text-[10px] font-black uppercase tracking-[0.1em]">
                                            <span className="flex items-center gap-1.5">
                                                <Warehouse className="h-3.5 w-3.5 text-slate-400" />
                                                <span className={stockStatus.color}>
                                                    {material.currentStock} {material.unit}     {stockStatus.label}
                                                </span>
                                            </span>
                                            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                                <DollarSign className="h-3.5 w-3.5" />
                                                {formatCurrency(material.unitPrice)}/{material.unit}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {query.length >= 2 && results.length === 0 && (
                <div className="absolute z-50 w-full mt-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 text-center animate-in fade-in slide-in-from-top-2">
                    <Package className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Aucun mat  riau trouv   pour &quot;{query}&quot;
                    </p>
                </div>
            )}
        </div>
    );
};
