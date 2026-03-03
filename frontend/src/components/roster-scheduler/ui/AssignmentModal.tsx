'use client';

import React from 'react';

interface AssignmentModalProps {
    onClose: () => void;
}

export default function AssignmentModal({ onClose }: AssignmentModalProps) {
    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-2xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <span className="material-symbols-outlined text-blue-500">assignment_add</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white leading-none">Advanced Shift Assignment</h2>
                            <p className="text-xs text-slate-500 mt-1">Configure task details, personnel, and assets for #WO-9842</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-800">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        {/* Left Column */}
                        <div className="md:col-span-7 space-y-6">
                            <section>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Task Specification</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Task Nature</label>
                                        <div className="relative group">
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">construction</span>
                                            <input
                                                className="w-full bg-slate-800 border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                                type="text"
                                                defaultValue="Main Valve Repair - Sector 4B"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Estimated Duration</label>
                                        <select className="w-full bg-slate-800 border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                                            <option>2 Hours 30 Minutes</option>
                                            <option>4 Hours</option>
                                            <option>Full Shift (8h)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Priority Level</label>
                                        <div className="flex gap-2">
                                            <button className="flex-1 py-2 rounded-lg bg-red-900/20 border border-red-500/50 text-red-500 text-xs font-bold ring-2 ring-red-500/20">Urgent</button>
                                            <button className="flex-1 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-xs font-bold hover:bg-slate-700 transition-colors">Standard</button>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Smart Recommendation</h3>
                                    <span className="bg-emerald-900/30 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">Match Score: 98%</span>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        { name: 'Alex Henderson', tags: ['L3 ELECTR', 'SAFETY CERT'], img: 'https://i.pravatar.cc/150?u=alex', primary: true },
                                        { name: 'Sarah Jenkins', tags: ['LEAD ENG', 'WATER MGT'], img: 'https://i.pravatar.cc/150?u=sarah', primary: false }
                                    ].map((person, idx) => (
                                        <div key={idx} className={`p-3 bg-slate-800/50 border ${person.primary ? 'border-blue-500/30' : 'border-slate-700/50'} rounded-xl flex items-center justify-between group hover:border-${person.primary ? 'blue-500' : 'slate-600'} transition-all`}>
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <img alt="Avatar" className="w-10 h-10 rounded-full border border-slate-700" src={person.img} />
                                                    <span className="absolute -bottom-1 -right-1 bg-emerald-500 w-3 h-3 border-2 border-slate-900 rounded-full"></span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-200">{person.name}</p>
                                                    <div className="flex gap-1 mt-1">
                                                        {person.tags.map((tag, i) => (
                                                            <span key={i} className={`text-[9px] px-1.5 py-0.5 rounded border ${i === 0 ? 'bg-blue-900/30 text-blue-400 border-blue-500/20' : 'bg-amber-900/30 text-amber-400 border-amber-500/20'}`}>{tag}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <button className={`${person.primary ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'} text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors`}>
                                                ASSIGN
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Right Column */}
                        <div className="md:col-span-5 space-y-6">
                            <section>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Equipment & Vehicle</h3>
                                <div className="bg-slate-950/40 rounded-xl border border-slate-800 p-4 space-y-4">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 ml-1">Assigned Vehicle</label>
                                        <div className="relative">
                                            <select className="w-full bg-slate-800 border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                                                <option>Utility Truck #U-204 (Active)</option>
                                                <option>Heavy Duty Truck #H-102 (Maintenance)</option>
                                                <option>Van #V-092 (Available)</option>
                                            </select>
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">local_shipping</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 ml-1">Toolbox Checklist</label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {[
                                                { name: 'Hydraulic Pipe Cutter', asset: 'TC-441     Bin A-4', checked: true },
                                                { name: 'Digital Flow Meter', asset: 'DM-902     Bin C-2', checked: true },
                                                { name: 'Safety Barrier Kit', asset: 'SK-012     Loading Bay 1', checked: false }
                                            ].map((tool, idx) => (
                                                <label key={idx} className="flex items-center gap-3 p-2 bg-slate-800/40 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        defaultChecked={tool.checked}
                                                        className="rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-offset-slate-900"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="text-xs font-medium text-slate-200">{tool.name}</p>
                                                        <p className="text-[10px] text-slate-500">Asset #{tool.asset}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="bg-amber-900/10 border border-amber-500/20 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-amber-500 text-lg">inventory_2</span>
                                    <div>
                                        <p className="text-xs font-bold text-amber-400">Inventory Warning</p>
                                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                                            2 Sealing Gaskets are currently low in stock (4 remaining). Please verify availability at the warehouse before departure.
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-950/50 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                            <img alt="S1" className="w-8 h-8 rounded-full border-2 border-slate-900" src="https://i.pravatar.cc/150?u=alex" />
                            <img alt="S2" className="w-8 h-8 rounded-full border-2 border-slate-900" src="https://i.pravatar.cc/150?u=sarah" />
                            <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-slate-400">+1</span>
                            </div>
                        </div>
                        <span className="text-xs font-medium text-slate-400">3 Members Assigned</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="px-5 py-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">Cancel</button>
                        <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all">
                            Confirm Assignment
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
