'use client';

import { MaterialRequisitionForm } from '@/components/inventory/requisition/MaterialRequisitionForm';
import Link from 'next/link';

export default function MaterialRequestPage() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#0a0a14] font-display pb-24 transition-colors">
            {/* Header / Nav */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0a0a14]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-3">
                <div className="max-w-[1440px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/dashboard" className="flex items-center gap-3 group">
                            <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-white text-xl">inventory_2</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black tracking-tight dark:text-white uppercase leading-none">RT Inventory</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Supply Chain System</span>
                            </div>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Connect   en tant que</p>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1">Ahmed El Mansouri</p>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-800 border-2 border-primary/20 p-0.5">
                            <img src="https://ui-avatars.com/api/?name=Ahmed+El+Mansouri&background=2424eb&color=fff" alt="Profile" className="w-full h-full object-cover rounded-[10px]" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-[1280px] mx-auto w-full px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Hero / Title Section */}
                <div className="mb-12 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                        <span className="hover:text-primary transition-colors cursor-pointer">Gestion des Flux</span>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                        <span className="text-primary italic">R  quisition Intelligente</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic leading-none mb-4">
                                Centre de <span className="text-primary underline decoration-primary/20 underline-offset-[12px]">R  quisition</span>
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl font-medium leading-relaxed italic">
                                Optimisez vos op  rations de terrain avec notre nouveau moteur de r  quisition. Gestion des stocks en temps r  el, alertes budg  taires et tra  abilit   compl  te de vos besoins mat  riels.
                            </p>
                        </div>
                    </div>
                </div>

                <MaterialRequisitionForm />
            </main>
        </div>
    );
}

