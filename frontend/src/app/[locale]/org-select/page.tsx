'use client';

import React, { useEffect } from 'react';
import { useOrgStore } from '@/store/orgStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from '@/i18n/navigation';
import {
    Building2,
    Plus,
    ArrowRight,
    Users,
    ShieldCheck,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function OrgSelectPage() {
    const { organizations, fetchOrganizations, setActiveOrganization, isLoading } = useOrgStore();
    const { user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            fetchOrganizations();
        } else {
            router.push('/login');
        }
    }, [user, fetchOrganizations, router]);

    const handleSelect = (orgId: string) => {
        setActiveOrganization(orgId);
        router.push('/dashboard'); // or where they came from
    };

    if (isLoading && organizations.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Chargement de vos espaces de travail...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-4">
                        Bienvenue, {user?.name?.split(' ')[0]}
                    </h1>
                    <p className="text-xl text-slate-600">
                        Sélectionnez une organisation pour commencer votre session.
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {organizations.map((org, index) => (
                        <motion.div
                            key={org._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card
                                className="group hover:shadow-xl transition-all cursor-pointer border-2 hover:border-primary/50 overflow-hidden h-full flex flex-col"
                                onClick={() => handleSelect(org._id)}
                            >
                                <div className="h-2 bg-primary group-hover:h-3 transition-all" />
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-primary/10 transition-colors">
                                            <Building2 className="h-8 w-8 text-slate-600 group-hover:text-primary" />
                                        </div>
                                        <div className="px-2 py-1 rounded bg-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                            {org.subscription.plan}
                                        </div>
                                    </div>
                                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                                        {org.name}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        Espace de travail actif pour votre équipe.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <div className="space-y-3">
                                        <div className="flex items-center text-sm text-slate-500">
                                            <Users className="h-4 w-4 mr-2" />
                                            <span>Membres illimités</span>
                                        </div>
                                        <div className="flex items-center text-sm text-slate-500">
                                            <ShieldCheck className="h-4 w-4 mr-2" />
                                            <span>Isolation complète</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-2">
                                    <Button variant="ghost" className="w-full justify-between group-hover:bg-primary group-hover:text-white transition-all">
                                        Entrer
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: organizations.length * 0.1 }}
                    >
                        <Card className="border-2 border-dashed border-slate-300 hover:border-primary/50 hover:bg-slate-50/50 transition-all h-full flex flex-col justify-center items-center p-8 group cursor-pointer">
                            <div className="p-4 bg-slate-100 rounded-full group-hover:bg-primary/10 transition-colors mb-4 border border-slate-200 group-hover:border-primary/30">
                                <Plus className="h-8 w-8 text-slate-400 group-hover:text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Nouvelle Organisation</h3>
                            <p className="text-sm text-slate-500 text-center mb-6">
                                Créez un nouvel espace de travail pour une autre structure.
                            </p>
                            <Button variant="outline" className="w-full">
                                Créer
                            </Button>
                        </Card>
                    </motion.div>
                </div>

                {organizations.length === 0 && !isLoading && (
                    <div className="mt-12 p-8 bg-blue-50 border border-blue-100 rounded-2xl text-center">
                        <h3 className="text-blue-900 font-bold text-lg mb-2">Aucune organisation trouvée</h3>
                        <p className="text-blue-700">
                            Il semble que vous ne fassiez partie d'aucune organisation.
                            Vérifiez vos invitations ou créez votre propre espace de travail.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
