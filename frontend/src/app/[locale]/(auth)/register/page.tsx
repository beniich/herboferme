'use client';

import React, { useState } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { 
    Sprout, 
    Lock, 
    Mail, 
    Eye, 
    EyeOff, 
    UserPlus, 
    ShieldCheck,
    Globe,
    User,
    ArrowRight
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { toast } from 'react-hot-toast';

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { authApi } = await import('@/lib/api');
            await authApi.register({ email, password, nom, prenom });
            await login({ email, password }); 
            toast.success('Bienvenue chez AgroMaître !');
        } catch (err: any) {
            const message = err.response?.data?.error || "Échec de l'inscription";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[var(--bg)] font-sans">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,var(--green)_0%,transparent_50%)] opacity-10"></div>
            <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-[var(--gold)] opacity-10 blur-[150px] rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02]"></div>

            <div className="w-full max-w-lg px-6 relative z-10 py-12">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--green)] to-[var(--green2)] text-white shadow-2xl mb-6">
                        <UserPlus size={40} />
                    </div>
                    <h1 className="text-4xl font-black text-[var(--text)] tracking-tighter uppercase italic">
                        Agro<span className="text-[var(--green)] not-italic">Maître</span>
                    </h1>
                    <p className="text-[10px] font-black text-[var(--text3)] uppercase tracking-[0.4rem] mt-2">Rejoindre la Révolution</p>
                </div>

                <GlassCard className="p-1 lg:p-1.5 overflow-hidden">
                    <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl p-8 lg:p-10 rounded-2xl relative">
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-[var(--text)] uppercase italic tracking-tight">Créer un profil Agriculteur</h2>
                            <p className="text-xs text-[var(--text3)] uppercase tracking-widest mt-1">Étape Unique vers l'IA</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text2)] ml-1">Nom</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text3)] group-focus-within:text-[var(--green)] transition-colors">
                                            <User size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Benhakkou"
                                            className="w-full bg-[var(--bg2)]/50 border border-[var(--border)] rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-[var(--green)] focus:ring-4 focus:ring-[var(--green)]/10 transition-all outline-none"
                                            value={nom}
                                            onChange={(e) => setNom(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text2)] ml-1">Prénom</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text3)] group-focus-within:text-[var(--green)] transition-colors">
                                            <User size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Said"
                                            className="w-full bg-[var(--bg2)]/50 border border-[var(--border)] rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-[var(--green)] focus:ring-4 focus:ring-[var(--green)]/10 transition-all outline-none"
                                            value={prenom}
                                            onChange={(e) => setPrenom(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px) font-black uppercase tracking-widest text-[var(--text2)] ml-1">Adresse Email</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text3)] group-focus-within:text-[var(--green)] transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="contact@votre-domaine.ma"
                                        className="w-full bg-[var(--bg2)]/50 border border-[var(--border)] rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-[var(--green)] focus:ring-4 focus:ring-[var(--green)]/10 transition-all outline-none"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text2)] ml-1">Mot de passe</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text3)] group-focus-within:text-[var(--green)] transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="w-full bg-[var(--bg2)]/50 border border-[var(--border)] rounded-2xl py-4 pl-12 pr-12 text-sm focus:border-[var(--green)] focus:ring-4 focus:ring-[var(--green)]/10 transition-all outline-none"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text3)] hover:text-[var(--text2)] transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[var(--green)] hover:bg-[var(--green2)] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-[var(--green)]/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Lancer l'Inscription
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-10 flex items-center justify-center gap-4 text-[9px] font-black uppercase tracking-widest text-[var(--text3)]">
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={14} className="text-[var(--green)]" />
                                <span>100% Souverain</span>
                            </div>
                            <div className="w-1 h-1 rounded-full bg-[var(--border)]"></div>
                            <div className="flex items-center gap-2">
                                <Globe size={14} className="text-[var(--green)]" />
                                <span>Infrastructure Maroc</span>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                <div className="mt-10 text-center space-y-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text2)]">
                        Déjà inscrit ? <Link href="/login" className="text-[var(--green)] hover:underline ml-2 italic">Retourner au cockpit →</Link>
                    </p>
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-[var(--text3)] opacity-40">
                        © 2026 AgroMaître Group • L'Intelligence du Souss au Sahara
                    </p>
                </div>
            </div>
        </div>
    );
}
