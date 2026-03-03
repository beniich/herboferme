'use client';

export default function SettingsPage() {
    return (
        <div className="bg-background-light font-display min-h-[calc(100vh-64px)] overflow-y-auto">
            <div className="flex min-h-full">
                {/* Main Content Area */}
                <main className="flex-1 w-full p-8 lg:p-12 max-w-4xl mx-auto">
                    <div className="mb-10">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Param  tres du Compte</h1>
                        <p className="text-slate-500 mt-2">Mettez    jour votre profil, les notifications et l'apparence du syst  me.</p>
                    </div>

                    {/* Personal Information */}
                    <section className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8 shadow-sm">
                        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                            <h2 className="text-lg font-bold">Informations Personnelles</h2>
                            <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">ID: #SYS-74291</span>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full border-4 border-slate-50 overflow-hidden shadow-md bg-slate-200">
                                        {/* Placeholder Avatar */}
                                    </div>
                                    <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:scale-105 transition-transform">
                                        <span className="material-symbols-outlined text-sm">photo_camera</span>
                                    </button>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Photo de Profil</h3>
                                    <div className="flex gap-2 mt-3">
                                        <button className="text-sm font-semibold px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">Changer Photo</button>
                                        <button className="text-sm font-semibold px-4 py-2 text-slate-400 hover:text-red-500 transition-colors">Supprimer</button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-slate-700">Nom Complet</label>
                                    <input className="rounded-lg border-slate-200 bg-slate-50 focus:border-primary focus:ring-primary w-full p-3 text-sm outline-none" type="text" defaultValue="Alex Johnson" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-slate-700">Email Professionnel</label>
                                    <input className="rounded-lg border-slate-200 bg-slate-50 focus:border-primary focus:ring-primary w-full p-3 text-sm outline-none" type="email" defaultValue="alex.j@reclamtrack.com" />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Notification Preferences */}
                    <section className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8 shadow-sm">
                        <div className="p-6 border-b border-slate-200">
                            <h2 className="text-lg font-bold">Notifications</h2>
                            <p className="text-sm text-slate-500 mt-1">G  rez vos alertes pour les   v  nements syst  me.</p>
                        </div>
                        <div className="divide-y divide-slate-100">
                            <div className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">Nouvelle R  clamation Assign  e</p>
                                    <p className="text-sm text-slate-500">Soyez notifi   lorsqu'un cas est rout   vers votre d  partement.</p>
                                </div>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input defaultChecked className="rounded text-primary focus:ring-primary h-5 w-5 bg-slate-100 border-slate-300" type="checkbox" />
                                        <span className="text-xs font-bold uppercase text-slate-400">Email</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Action Footer */}
                    <div className="flex items-center justify-end gap-4 mt-12 pb-20">
                        <button className="px-6 py-3 rounded-lg border border-slate-200 font-bold hover:bg-slate-50 transition-colors">
                            Annuler
                        </button>
                        <button className="px-8 py-3 rounded-lg bg-primary text-white font-bold hover:shadow-lg hover:shadow-primary/30 transition-all">
                            Enregistrer
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}
