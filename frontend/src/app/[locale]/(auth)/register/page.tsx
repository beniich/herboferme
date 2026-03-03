'use client';

import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/providers/AuthProvider';
import { Link } from '@/i18n/navigation';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, UserPlus } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Inscription via API Frontend
            const { authApi } = await import('@/lib/api');
            await authApi.register({ email, password, nom, prenom });
            
            // 2. Connexion automatique apr  s inscription r  ussie
            await login({ email, password }); 
            toast.success('Inscription r  ussie !');
        } catch (err: any) {
            setError(err.response?.data?.error || "Erreur d'inscription");
            toast.error("  chec de l'inscription");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-background-light dark:bg-background-dark">
            <div className="mb-8 flex flex-col items-center">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20 text-white">
                    <ShieldCheck className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Inscription</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Cr  er un nouveau compte</p>
            </div>

            <div className="w-full max-w-[440px] bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
                {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="nom" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Nom
                            </label>
                            <input
                                id="nom"
                                type="text"
                                required
                                value={nom}
                                onChange={(e) => setNom(e.target.value)}
                                placeholder="Votre nom"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white outline-none"
                            />
                        </div>
                        <div>
                            <label htmlFor="prenom" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Pr  nom
                            </label>
                            <input
                                id="prenom"
                                type="text"
                                required
                                value={prenom}
                                onChange={(e) => setPrenom(e.target.value)}
                                placeholder="Votre pr  nom"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="votre@email.com"
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Mot de passe
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="                        "
                                className="w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <LoadingSpinner /> : <UserPlus className="w-5 h-5" />}
                        <span>{loading ? 'Inscription...' : "S'inscrire"}</span>
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-slate-600 dark:text-slate-400">D  j   un compte ? </span>
                    <Link href="/login" className="text-primary hover:underline font-semibold">
                        Se connecter
                    </Link>
                </div>
            </div>
        </div>
    );
}
