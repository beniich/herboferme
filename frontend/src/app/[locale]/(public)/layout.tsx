import React from 'react';
import { Link } from '@/i18n/navigation';
import { Sprout, Menu, User, LogIn, Github, Twitter, Linkedin, Facebook, Mail, Phone, MapPin, Globe } from 'lucide-react';

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans selection:bg-[var(--green)] selection:text-white">
            {/* Premium Glassmorphism Navbar */}
            <nav className="h-20 border-b border-white/10 bg-white/70 backdrop-blur-2xl sticky top-0 z-[100] flex items-center justify-between px-6 lg:px-20 transition-all duration-500">
                <Link href="/" className="flex items-center gap-4 group no-underline">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--green)] to-[var(--green2)] flex items-center justify-center text-white shadow-xl shadow-[var(--green)]/30 group-hover:rotate-6 transition-transform duration-500">
                        <Sprout size={24} />
                    </div>
                    <div>
                        <div className="text-xl font-black text-[var(--text)] leading-none tracking-tighter italic uppercase group-hover:text-[var(--green)] transition-colors">AgroMaître</div>
                        <div className="text-[9px] text-[var(--text3)] uppercase tracking-[0.3em] font-black mt-1">Écosystème Digital</div>
                    </div>
                </Link>

                <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] italic">
                    <Link href="/about" className="text-[var(--text2)] hover:text-[var(--green)] transition-all hover:-translate-y-0.5">À Propos</Link>
                    <Link href="/services" className="text-[var(--text2)] hover:text-[var(--green)] transition-all hover:-translate-y-0.5">Services</Link>
                    <Link href="/pricing" className="text-[var(--text2)] hover:text-[var(--green)] transition-all hover:-translate-y-0.5">Tarifs</Link>
                    <Link href="/press" className="text-[var(--text2)] hover:text-[var(--green)] transition-all hover:-translate-y-0.5">Presse</Link>
                    <Link href="/contact" className="text-[var(--text2)] hover:text-[var(--green)] transition-all hover:-translate-y-0.5">Contact</Link>
                </div>

                <div className="flex items-center gap-6">
                    <Link href="/login" className="hidden sm:flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border-2 border-[var(--border)] hover:border-[var(--green)] hover:text-[var(--green)] transition-all italic">
                        <LogIn size={14} />
                        Connexion
                    </Link>
                    <Link href="/register" className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] bg-[var(--green)] text-white hover:bg-[var(--green2)] transition-all shadow-2xl shadow-[var(--green)]/30 hover:scale-105 active:scale-95 italic">
                        Essai Gratuit
                    </Link>
                </div>
            </nav>

            <main className="flex-1">
                {children}
            </main>

            {/* Premium Elegant Footer */}
            <footer className="bg-white border-t border-[var(--border)] pt-24 pb-12 px-6 lg:px-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--green)]/5 blur-[120px] rounded-full -z-0"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--gold)]/5 blur-[120px] rounded-full -z-0"></div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 relative z-10">
                    <div className="space-y-8">
                        <Link href="/" className="flex items-center gap-4 no-underline group">
                            <div className="w-10 h-10 rounded-xl bg-[var(--green)] flex items-center justify-center text-white shadow-lg shadow-[var(--green)]/20">
                                <Sprout size={20} />
                            </div>
                            <span className="text-xl font-black text-[var(--text)] italic uppercase tracking-tight">AgroMaître</span>
                        </Link>
                        <p className="text-sm text-[var(--text2)] leading-relaxed font-normal opacity-70">
                            Propulser l'agriculture marocaine vers l'ère numérique. Intelligence, précision et durabilité au cœur de chaque hectare.
                        </p>
                        <div className="flex gap-5">
                            <a href="#" aria-label="Twitter AgroMaître" className="w-10 h-10 rounded-xl bg-[var(--bg)] flex items-center justify-center text-[var(--text3)] hover:bg-[var(--green)] hover:text-white transition-all shadow-sm"><Twitter size={18} /></a>
                            <a href="#" aria-label="LinkedIn AgroMaître" className="w-10 h-10 rounded-xl bg-[var(--bg)] flex items-center justify-center text-[var(--text3)] hover:bg-[var(--green)] hover:text-white transition-all shadow-sm"><Linkedin size={18} /></a>
                            <a href="#" aria-label="Facebook AgroMaître" className="w-10 h-10 rounded-xl bg-[var(--bg)] flex items-center justify-center text-[var(--text3)] hover:bg-[var(--green)] hover:text-white transition-all shadow-sm"><Facebook size={18} /></a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black text-[var(--green)] uppercase tracking-[0.3em] mb-8 italic">Écosystème</h4>
                        <ul className="space-y-4 text-xs font-black uppercase tracking-[0.1em] text-[var(--text3)] list-none p-0">
                            <li><Link href="/features" className="hover:text-[var(--text)] transition-colors">Fonctionnalités</Link></li>
                            <li><Link href="/pricing" className="hover:text-[var(--text)] transition-colors">Tarification</Link></li>
                            <li><Link href="/system-info" className="hover:text-[var(--text)] transition-colors">Technologie</Link></li>
                            <li><Link href="/services" className="hover:text-[var(--text)] transition-colors">Nos Services</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black text-[var(--green)] uppercase tracking-[0.3em] mb-8 italic">Ressources</h4>
                        <ul className="space-y-4 text-xs font-black uppercase tracking-[0.1em] text-[var(--text3)] list-none p-0">
                            <li><Link href="/about" className="hover:text-[var(--text)] transition-colors">Notre Vision</Link></li>
                            <li><Link href="/blog" className="hover:text-[var(--text)] transition-colors">Journal Fertile</Link></li>
                            <li><Link href="/careers" className="hover:text-[var(--text)] transition-colors">Rejoindre l'Équipe</Link></li>
                            <li><Link href="/press" className="hover:text-[var(--text)] transition-colors">Espace Presse</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black text-[var(--green)] uppercase tracking-[0.3em] mb-8 italic">Contact</h4>
                        <ul className="space-y-4 text-xs font-black uppercase tracking-[0.1em] text-[var(--text3)] list-none p-0">
                            <li className="flex items-center gap-3"><Mail size={14} className="text-[var(--green)]" /> contact@agromaitre.ma</li>
                            <li className="flex items-center gap-3"><Phone size={14} className="text-[var(--green)]" /> +212 5 22 00 00 00</li>
                            <li className="flex items-center gap-3"><MapPin size={14} className="text-[var(--green)]" /> Technopark, Casablanca</li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto border-t border-[var(--border)] mt-24 pt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black text-[var(--text3)] uppercase tracking-[0.4em] italic">
                    <p>© {new Date().getFullYear()} AGROMAÎTRE DATA SYSTEMS. FIÈREMENT PROPULSÉ AU MAROC.</p>
                    <div className="flex gap-10">
                        <Link href="/legal/privacy" className="hover:text-[var(--green)] transition-colors">Confidentialité</Link>
                        <Link href="/legal/terms" className="hover:text-[var(--green)] transition-colors">CGU</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
