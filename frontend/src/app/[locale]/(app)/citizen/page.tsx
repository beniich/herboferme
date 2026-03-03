'use client';

import { useState } from 'react';
import { Shield, Clock, Search, MapPin, ChevronRight, AlertCircle, Phone, FileText, CheckCircle2 } from 'lucide-react';

export default function CitizenPortal() {
    const [searchQuery, setSearchQuery] = useState('');

    const activeRequests = [
        { id: 'TKT-2026-092', title: 'Fuite d\'eau publique', location: 'Avenue Hassan II', status: 'En cours', date: 'Aujourd\'hui', progress: 65, color: 'blue' },
        { id: 'TKT-2026-081', title: 'Lampadaire cass  ', location: 'Rue de la Paix', status: 'Planifi  ', date: 'Hier', progress: 30, color: 'orange' }
    ];

    const historicalRequests = [
        { id: 'TKT-2025-999', title: 'Collecte des d  chets bloqu  e', status: 'R  solu', date: '12 Jan 2026', color: 'emerald' },
        { id: 'TKT-2025-874', title: 'Nid de poule', status: 'R  solu', date: '24 D  c 2025', color: 'emerald' },
    ];

    return (
        <div className="flex-1 w-full min-h-screen bg-slate-50 dark:bg-slate-900 overflow-x-hidden font-display">
            
            {/* Hero Section */}
            <div className="relative w-full overflow-hidden bg-primary/5 pt-12 pb-24 md:pt-20 md:pb-32 px-6 lg:px-20 border-b border-primary/10">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                
                <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="flex-1 space-y-6 md:pr-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-300 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Bienvenue sur votre portail
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-700">
                            Simplifiez vos d  marches <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">citoyennes</span>
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
                            Signalez un probl  me, suivez l'avancement de vos requ  tes en temps r  el et consultez l'historique de vos interventions publiques en un seul endroit.
                        </p>
                        
                        {/* Search Bar - Glassmorphism */}
                        <div className="pt-4 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                            <div className="relative max-w-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/50 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none p-2 rounded-2xl flex items-center gap-2 group focus-within:ring-4 ring-primary/20 transition-all">
                                <Search className="w-5 h-5 ml-3 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder="N   de suivi (ex: TKT-2026...)"
                                    className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400 text-lg px-2"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95">
                                    Suivre
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Action Cards Grid */}
                    <div className="flex-1 w-full grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-1000 delay-200">
                        <button className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white dark:border-slate-700 p-6 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none hover:-translate-y-1 transition-transform text-left">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                                <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">Signaler</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Nouvelle r  clamation</p>
                        </button>
                        
                        <button className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white dark:border-slate-700 p-6 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none hover:-translate-y-1 transition-transform text-left mt-8">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="bg-emerald-100 dark:bg-emerald-900/30 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                                <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">Paiements</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Taxes & abonnements</p>
                        </button>
                        
                        <button className="col-span-2 group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white dark:border-slate-700 p-6 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none hover:-translate-y-1 transition-transform text-left flex items-center justify-between">
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex items-center gap-4">
                                <div className="bg-orange-100 dark:bg-orange-900/30 w-12 h-12 rounded-2xl flex items-center justify-center">
                                    <Phone className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">Annuaire Urgent</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Services d'intervention d'urgence</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors transform group-hover:translate-x-1" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="max-w-7xl mx-auto px-6 lg:px-20 -mt-8 pb-20 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Active Requests */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Vos demandes en cours</h2>
                            <button className="text-sm font-bold text-primary hover:text-blue-700 transition-colors">Tout voir</button>
                        </div>
                        
                        <div className="space-y-4">
                            {activeRequests.map((req) => (
                                <div key={req.id} className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-3xl shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden relative">
                                    <div className={`absolute top-0 left-0 w-1.5 h-full bg-${req.color}-500`}></div>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        
                                        <div className="space-y-1 flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-xs font-black bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md">{req.id}</span>
                                                <span className="text-xs font-bold text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3"/> {req.date}</span>
                                            </div>
                                            <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">{req.title}</h3>
                                            <p className="text-sm text-slate-500 flex items-center gap-1">
                                                <MapPin className="w-4 h-4" /> {req.location}
                                            </p>
                                        </div>
                                        
                                        <div className="w-full md:w-64 space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className={`font-bold text-${req.color}-500`}>{req.status}</span>
                                                <span className="font-bold text-slate-700 dark:text-slate-300">{req.progress}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full bg-${req.color}-500 rounded-full transition-all duration-1000 ease-out`} 
                                                    style={{ width: `${req.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        
                                        <ChevronRight className="hidden md:block w-5 h-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar: Profile & History */}
                    <div className="space-y-6">
                        {/* Summary Widget */}
                        <div className="bg-slate-900 dark:bg-slate-950 p-6 rounded-3xl shadow-xl text-white relative overflow-hidden">
                            <Shield className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5" />
                            <h3 className="font-black text-lg mb-4 text-white">Bilan Citoyen</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                                    <span className="text-3xl font-black">4</span>
                                    <p className="text-xs text-white/70 font-bold uppercase tracking-wide mt-1">Total</p>
                                </div>
                                <div className="bg-emerald-500/20 p-4 rounded-2xl backdrop-blur-sm">
                                    <span className="text-3xl font-black text-emerald-400">2</span>
                                    <p className="text-xs text-emerald-400/70 font-bold uppercase tracking-wide mt-1">R  solus</p>
                                </div>
                            </div>
                        </div>

                        {/* History */}
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-3xl shadow-sm">
                            <h3 className="font-black text-slate-900 dark:text-white mb-4">Requ  tes cl  tur  es</h3>
                            <div className="space-y-4">
                                {historicalRequests.map((req) => (
                                    <div key={req.id} className="flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-900 dark:text-white">{req.title}</p>
                                                <p className="text-xs text-slate-500">{req.date}     {req.id}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-6 py-2.5 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-xl transition-colors">
                                Consulter les archives
                            </button>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    );
}
