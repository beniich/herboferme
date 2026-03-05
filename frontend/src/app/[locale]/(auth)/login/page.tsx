'use client';

import React, { useState, useEffect } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { GoogleLogin } from '@react-oauth/google';
import { useLocale } from 'next-intl';
import { toast } from 'react-hot-toast';
import { 
    Sprout, 
    Lock, 
    Mail, 
    Eye, 
    EyeOff, 
    ArrowRight, 
    ShieldCheck,
    Globe
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const locale = useLocale();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login({ email, password });
            toast.success('Connexion réussie !');
        } catch (error: any) {
            console.error('Login error:', error);
            const message = error.response?.data?.error || error.response?.data?.message || 'Identifiants invalides';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        toast.success('Connexion Google réussie');
        const from = searchParams.get('from') || '/dashboard';
        router.push(from);
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[var(--bg)] font-sans">
            {/* Background elements - Premium Gradients */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,var(--green)_0%,transparent_50%)] opacity-10"></div>
            <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-[var(--gold)] opacity-10 blur-[150px] rounded-full animate-pulse"></div>
            <div className="absolute -bottom-24 -left-24 w-[600px] h-[600px] bg-[var(--green)] opacity-10 blur-[150px] rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02]"></div>

            <div className="w-full max-w-md px-6 relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--green)] to-[var(--green2)] text-white shadow-2xl mb-6 hover:rotate-12 transition-transform duration-500">
                        {isMounted && <Sprout size={40} />}
                    </div>
                    <h1 className="text-4xl font-black text-[var(--text)] tracking-tighter uppercase italic">
                        Agro<span className="text-[var(--green)] not-italic">Maître</span>
                    </h1>
                    <p className="text-[10px] font-black text-[var(--text3)] uppercase tracking-[0.4rem] mt-2">Écosystème Digital Agricole</p>
                </div>

                <GlassCard className="p-1 lg:p-1.5 overflow-hidden shadow-2xl">
                    <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl p-8 lg:p-10 rounded-2xl relative">
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-[var(--text)] uppercase italic tracking-tight">Content de vous revoir</h2>
                            <p className="text-xs text-[var(--text3)] uppercase tracking-widest mt-1">Authentification Sécurisée</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text2)] ml-1">Email ou Identifiant</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text3)] group-focus-within:text-[var(--green)] transition-colors">
                                        {isMounted && <Mail size={18} />}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="votre@email.com"
                                        className="w-full bg-[var(--bg2)]/50 border border-[var(--border)] rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-[var(--green)] focus:ring-4 focus:ring-[var(--green)]/10 transition-all outline-none text-[var(--text)]"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text2)]">Mot de passe</label>
                                    <Link href="#" className="text-[9px] font-black uppercase tracking-widest text-[var(--green)] hover:underline">Oublié ?</Link>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text3)] group-focus-within:text-[var(--green)] transition-colors">
                                        {isMounted && <Lock size={18} />}
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="w-full bg-[var(--bg2)]/50 border border-[var(--border)] rounded-2xl py-4 pl-12 pr-12 text-sm focus:border-[var(--green)] focus:ring-4 focus:ring-[var(--green)]/10 transition-all outline-none text-[var(--text)]"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text3)] hover:text-[var(--text2)] transition-colors"
                                    >
                                        {isMounted && (showPassword ? <EyeOff size={18} /> : <Eye size={18} />)}
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
                                        Connexion
                                        {isMounted && <ArrowRight size={16} />}
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 relative text-center">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[var(--border)]"></div>
                            </div>
                            <span className="relative px-4 bg-white dark:bg-slate-900 text-[9px] font-black uppercase tracking-widest text-[var(--text3)]">Ou</span>
                        </div>

                        <div className="mt-8 flex justify-center overflow-hidden rounded-xl">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => toast.error('Échec Google Login')}
                                theme="filled_blue"
                                shape="pill"
                                width="320"
                            />
                        </div>

                        <div className="mt-10 flex items-center justify-center gap-4 text-[9px] font-black uppercase tracking-widest text-[var(--text3)]">
                            <div className="flex items-center gap-2">
                                {isMounted && <ShieldCheck size={14} className="text-[var(--green)]" />}
                                <span>SSL Sécurisé</span>
                            </div>
                            <div className="w-1 h-1 rounded-full bg-[var(--border)]"></div>
                            <div className="flex items-center gap-2">
                                {isMounted && <Globe size={14} className="text-[var(--green)]" />}
                                <span>Cloud Maroc</span>
                            </div>
                        </div>
                    </div>
                </GlassCard>


                <div className="mt-10 text-center space-y-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text2)]">
                        Pas de compte ? <Link href="/register" className="text-[var(--green)] hover:underline ml-2 italic">Rejoindre l'élite →</Link>
                    </p>
                    
                    <div className="flex justify-center gap-8 text-[9px] font-black uppercase tracking-widest text-[var(--text3)]">
                        <Link href="/legal/privacy" className="hover:text-[var(--green)] transition-colors">Vie Privée</Link>
                        <Link href="/contact" className="hover:text-[var(--green)] transition-colors">Support</Link>
                        <Link href="/legal/terms" className="hover:text-[var(--green)] transition-colors">Légal</Link>
                    </div>

                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-[var(--text3)] opacity-40">
                        © 2026 AgroMaître Group • Souveraineté Digitale
                    </p>
                </div>
            </div>
        </div>
    );
}
