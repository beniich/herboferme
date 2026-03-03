'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight, Loader2, Sparkles, Sprout, ShieldCheck, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams.get('session_id');
    const { refreshUser } = useAuth();
    const [verifying, setVerifying] = useState(true);

    useEffect(() => {
        const verify = async () => {
            try {
                // Simulate verification delay or call API
                await new Promise(resolve => setTimeout(resolve, 2000));
                await refreshUser(); // Refresh user state (roles, plan, etc.)
            } finally {
                setVerifying(false);
            }
        };
        verify();
    }, [sessionId, refreshUser]);

    return (
        <div className="bg-[var(--bg)] text-[var(--text)] min-h-screen font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,var(--green)_0%,transparent_70%)] opacity-5 z-0"></div>
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-[var(--gold)] opacity-5 blur-[120px] rounded-full"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[var(--green)] opacity-5 blur-[120px] rounded-full"></div>

            <div className="relative z-10 bg-white p-12 md:p-16 rounded-[4rem] shadow-2xl border border-[var(--border)] max-w-2xl w-full text-center">
                <div className="flex justify-center mb-10">
                    <div className="size-32 bg-[var(--green)]/10 rounded-[2.5rem] flex items-center justify-center text-[var(--green)] shadow-inner relative group">
                        <CheckCircle2 className="w-16 h-16 group-hover:scale-110 transition-transform duration-500" />
                        <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-[var(--gold)] animate-pulse" />
                    </div>
                </div>

                <div className="space-y-6 mb-12">
                    <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">Paiement <span className="text-[var(--green)] not-italic underline underline-offset-8">Confirmé !</span></h1>
                    <p className="text-[var(--text2)] text-lg font-normal leading-relaxed opacity-80 max-w-md mx-auto">
                        Félicitations ! Votre compte a été mis à niveau vers la formule <span className="text-[var(--green)] font-black italic">Pro Écosystème</span>. Vous avez désormais un accès illimité à nos technologies de précision.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="p-6 bg-[var(--bg)] rounded-3xl border border-[var(--border)] group hover:border-[var(--green)] transition-all">
                        <Sprout className="w-6 h-6 text-[var(--green)] mb-3 mx-auto" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text3)]">Analyses Illimitées</p>
                    </div>
                    <div className="p-6 bg-[var(--bg)] rounded-3xl border border-[var(--border)] group hover:border-[var(--green)] transition-all">
                        <ShieldCheck className="w-6 h-6 text-[var(--gold)] mb-3 mx-auto" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text3)]">Support Prioritaire</p>
                    </div>
                    <div className="p-6 bg-[var(--bg)] rounded-3xl border border-[var(--border)] group hover:border-[var(--green)] transition-all">
                        <Rocket className="w-6 h-6 text-[var(--green)] mb-3 mx-auto" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text3)]">Multi-Domaines</p>
                    </div>
                </div>

                {verifying ? (
                    <div className="flex flex-col items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-[var(--text3)] italic">
                        <Loader2 className="w-8 h-8 animate-spin text-[var(--green)]" />
                        Finalisation de la configuration...
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        <button
                            className="w-full bg-[var(--green)] hover:bg-[var(--green)]/90 text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-[var(--green)]/20 transition-all flex items-center justify-center gap-4 group"
                            onClick={() => router.push('/dashboard')}
                        >
                            Accéder au Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <Link
                            href="/billing"
                            className="inline-block text-[10px] font-black text-[var(--green)] hover:underline uppercase tracking-widest italic"
                        >
                            Voir les détails de facturation
                        </Link>
                    </div>
                )}
            </div>
            
            <p className="mt-12 text-[var(--text3)] text-[10px] font-black uppercase tracking-[0.4em] opacity-40">AgroMaître © {new Date().getFullYear()} • Le Futur de la Terre</p>
        </div>
    );
}
