'use client';

import { Link } from '@/i18n/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { authApi } from '@/lib/api';
import { GoogleLogin } from '@react-oauth/google';
import { useLocale } from 'next-intl';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const locale = useLocale();

    // Utilisation du nouveau contexte Auth
    const { login, user } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login({ email, password });
            toast.success('Connexion r  ussie !');
            // La redirection est g  r  e par le login() de l'AuthProvider
        } catch (error: any) {
            console.error('Login error:', error);
            const message = error.response?.data?.error || error.response?.data?.message || 'Erreur de connexion. Veuillez v  rifier vos identifiants.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
        try {
            if (credentialResponse.credential) {
                // Pour Google, on peut appeler directement l'api ou   tendre l'AuthProvider
                // Ici on utilise l'API pour d  clencher la cr  ation du cookie
                await authApi.googleLogin(credentialResponse.credential);
                window.location.href = `/${locale}/dashboard`;
                toast.success('Connexion Google r  ussie !');
            }
        } catch (error: any) {
            console.error('Google login error:', error);
            const message = error.response?.data?.error || error.response?.data?.message || '  chec de la connexion Google';
            toast.error(message);
        }
    };

    const handleGoogleError = () => {
        toast.error('  chec de la connexion Google');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-background-light dark:bg-background-dark transition-colors duration-200 font-display">
            {/* Logo / Branding Header */}
            <div className="mb-8 flex flex-col items-center">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined text-white text-3xl notranslate" translate="no">shield_person</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white" suppressHydrationWarning>IMS Secure</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Intervention Management System</p>
            </div>

            {/* Login Card */}
            <div className="w-full max-w-[440px] bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {/* Header Image Component Style */}
                <div className="w-full h-32 bg-primary/10 flex items-center justify-center overflow-hidden relative">
                    <div
                        className="absolute inset-0 opacity-10 bg-cover bg-center"
                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCf-Sk1u3Dvs0aBHThfocpPqpAV-DzyqkHPPTAUSU_PqnsG_V09B1VCGb6JWS2rQWjye7nun2qQJdaiiaK0yWglbmxz9DRxEH5JRmXPgPCQRITJFokOS5EfXcwQmRpe_1c6ChlhELBzAMb6jlZxVCucIqPk3zqRO9jnXr9PIA5H96Ybo6JO1ZBlGEnmJNzgUcvnG7SeL4_Jf0B9B6-eGi-BNtRBFLNXOIH6Ypm1NHcRllOFkisWyqOtMWeIXhezrHOY1gvd0hONs75m')" }}
                    ></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <h2 className="text-xl font-semibold text-primary dark:text-primary">Welcome Back</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-medium">Authentication Required</p>
                    </div>
                </div>

                <div className="p-8">
                    <div className="mb-6 flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            theme="filled_blue"
                            shape="pill"
                            text="signin_with"

                        />
                    </div>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-slate-900 text-slate-500">Ou continuer avec</span>
                        </div>
                    </div>

                    <form className="space-y-6" onSubmit={handleLogin}>
                        {/* Username/Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="identifier">Identifiant ou Email</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl notranslate" translate="no">mail</span>
                                <input
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                                    id="identifier"
                                    name="identifier"
                                    placeholder="Entrez votre email"
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">Mot de passe</label>
                                <a className="text-xs font-semibold text-primary hover:underline" href="#">Mot de passe oubli   ?</a>
                            </div>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl notranslate" translate="no">lock</span>
                                <input
                                    className="w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                                    id="password"
                                    name="password"
                                    placeholder="Entrez votre mot de passe"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <span className="material-symbols-outlined text-xl notranslate" translate="no">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center">
                            <input
                                className="w-4 h-4 text-primary bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded focus:ring-primary"
                                id="remember"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <label className="ml-2 block text-sm text-slate-600 dark:text-slate-400" htmlFor="remember">Rester connect  </label>
                        </div>

                        {/* Sign In Button */}
                        <button
                            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3.5 rounded-lg shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                                    <span>Connexion...</span>
                                </>
                            ) : (
                                <>
                                    <span>Se connecter</span>
                                    <span className="material-symbols-outlined text-lg notranslate" translate="no">login</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Security Footer inside card */}
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
                        <span className="material-symbols-outlined text-sm notranslate" translate="no">encrypted</span>
                        <span className="text-xs">Connexion chiffr  e de bout en bout</span>
                    </div>
                </div>
            </div>

            {/* Footer Links */}
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                <a className="hover:text-primary transition-colors" href="#">Politique de s  curit  </a>
                <a className="hover:text-primary transition-colors" href="#">Support</a>
                <a className="hover:text-primary transition-colors" href="#">Confidentialit  </a>
            </div>

            <div className="mt-8 text-center text-sm">
                <span className="text-slate-600 dark:text-slate-400">Pas encore de compte ? </span>
                <Link href="/register" className="text-primary hover:underline font-semibold">
                    Cr  er un compte
                </Link>
            </div>

            <p className="mt-8 text-xs text-slate-400 dark:text-slate-600">
                   2024 ReclamTrack Solutions. Tous droits r  serv  s.
            </p>
        </div>
    );
}
