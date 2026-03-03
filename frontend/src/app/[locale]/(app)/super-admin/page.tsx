'use client';

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    LayoutDashboard, 
    Settings, 
    ShieldAlert, 
    Database, 
    Users, 
    ListTodo, 
    Activity,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function SuperAdminPage() {
    const { user } = useAuth();

    if (!user || user.role !== 'super_admin' && user.role !== 'admin') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
                <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Acc  s Refus  </h1>
                <p className="text-slate-500 max-w-md">
                    Cette interface est r  serv  e aux administrateurs. Veuillez contacter votre responsable si vous pensez qu'il s'agit d'une erreur.
                </p>
                <Link href="/dashboard" className="mt-6 px-6 py-2 bg-primary text-white rounded-lg font-bold shadow-md hover:bg-primary/90 transition-colors">
                    Retour au Dashboard
                </Link>
            </div>
        );
    }

    const adminSections = [
        {
            title: "Performance & Ops",
            items: [
                {
                    name: "Dashboard Herbute",
                    desc: "Statistiques agricoles et performances",
                    href: "/dashboard",
                    icon: LayoutDashboard,
                    color: "bg-emerald-500"
                },
                {
                    name: "GLPI Helpdesk",
                    desc: "Gestion unifi  e des t  ches et tickets",
                    href: "/tasks",
                    icon: ListTodo,
                    color: "bg-blue-500"
                }
            ]
        },
        {
            title: "Syst  me & Donn  es",
            items: [
                {
                    name: "Logs d'Audit",
                    desc: "Tra  abilit   compl  te des actions",
                    href: "/audit-logs",
                    icon: Activity,
                    color: "bg-purple-500"
                },
                {
                    name: "Utilisateurs & Acc  s",
                    desc: "G  rer les membres et les r  les",
                    href: "/admin/users",
                    icon: Users,
                    color: "bg-orange-500"
                },
                {
                    name: "Topologie DB",
                    desc: "Structure et   tat de la base",
                    href: "/admin/dashboards/database-topology",
                    icon: Database,
                    color: "bg-slate-500"
                }
            ]
        }
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Espace Super-Admin</h1>
                    <p className="text-slate-500 font-medium">Contr  le centralis   de l'  cosyst  me Herbute & GLPI.</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-xl border border-slate-200">
                    <ShieldAlert className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">Mode Admin Actif</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="col-span-1 md:col-span-2 lg:col-span-3 border-none bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-2xl overflow-hidden relative">
                    <CardContent className="p-8 relative z-10">
                        <div className="max-w-2xl">
                            <h2 className="text-2xl font-bold mb-4">Bienvenue, {user.email.split('@')[0]}</h2>
                            <p className="text-indigo-100 text-lg mb-6 leading-relaxed">
                                Vous   tes connect   avec les privil  ges maximum. Cette interface regroupe tous les outils de pilotage strat  gique de votre domaine.
                            </p>
                            <div className="flex gap-4">
                                <Link 
                                    href="/settings" 
                                    className="px-6 py-2.5 bg-white text-indigo-950 rounded-xl font-bold hover:bg-indigo-50 transition-all flex items-center gap-2"
                                >
                                    <Settings className="w-4 h-4" />
                                    Configuration Syst  me
                                </Link>
                                <button className="px-6 py-2.5 bg-indigo-500/30 border border-indigo-400/30 rounded-xl font-bold hover:bg-indigo-500/40 transition-all">
                                    G  n  rer Rapport Global
                                </button>
                            </div>
                        </div>
                    </CardContent>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                </Card>

                {adminSections.map((section, idx) => (
                    <React.Fragment key={idx}>
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{section.title}</h3>
                        </div>
                        {section.items.map((item, i) => (
                            <Link key={i} href={item.href} className="group">
                                <Card className="h-full border border-slate-200 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={cn("p-3 rounded-2xl text-white shadow-lg", item.color)}>
                                                <item.icon className="w-6 h-6" />
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors transform group-hover:translate-x-1" />
                                        </div>
                                        <h4 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">{item.name}</h4>
                                        <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </React.Fragment>
                ))}
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mt-12 flex flex-col md:flex-row gap-6 items-center">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-2xl shadow-sm border border-amber-200 flex-shrink-0">    </div>
                <div>
                    <h4 className="text-lg font-bold text-amber-900 mb-1">Comment alimenter ces dashboards ?</h4>
                    <p className="text-amber-800/80 leading-relaxed font-medium">
                        Les donn  es proviennent de l'API centrale Herbute. Pour mettre    jour les informations en temps r  el, vous pouvez utiliser les modules de saisie (Inventaire, HR, Planning) ou connecter des capteurs IoT via les Webhooks configurables dans les param  tres.
                    </p>
                </div>
            </div>
        </div>
    );
}
