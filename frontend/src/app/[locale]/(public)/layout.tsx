'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { 
    Facebook, 
    Twitter, 
    Instagram, 
    Linkedin, 
    Mail, 
    Phone, 
    MapPin, 
    ArrowRight, 
    Sprout, 
    ShieldCheck, 
    Zap, 
    Globe, 
    ChevronRight,
    PlayCircle,
    CheckCircle2,
    Lock,
    LogIn
} from 'lucide-react';

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [scrolled, setScrolled] = useState(false);
    const cursorRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);

        // Cursor logic
        const moveCursor = (e: MouseEvent) => {
            if (cursorRef.current && ringRef.current) {
                cursorRef.current.style.left = `${e.clientX}px`;
                cursorRef.current.style.top = `${e.clientY}px`;
                
                // Add a small lag to the ring for premium feel
                setTimeout(() => {
                    if (ringRef.current) {
                        ringRef.current.style.left = `${e.clientX}px`;
                        ringRef.current.style.top = `${e.clientY}px`;
                    }
                }, 50);
            }
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const isClickable = target.closest('a') || target.closest('button') || target.closest('.clickable');
            if (isClickable) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, []);

    return (
        <div className={`agro-theme relative min-h-screen flex flex-col font-sans transition-all duration-700 use-custom-cursor selection:bg-[var(--gold)] selection:text-white`}>
            {/* Premium Overlays */}
            <div className="agro-theme-grain" />
            <div 
                ref={cursorRef} 
                className={`agro-custom-cursor ${isHovering ? 'scale-150 w-4 h-4' : 'scale-100 w-3 h-3'} pointer-events-none hidden lg:block`}
            />
            <div 
                ref={ringRef} 
                className={`agro-custom-cursor-ring ${isHovering ? 'w-16 h-16 border-[var(--gold)] border-2' : 'w-10 h-10'} pointer-events-none transition-all duration-300 hidden lg:block`}
            />

            {/* Premium Glassmorphism Header */}
            <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ${scrolled ? 'py-4' : 'py-8'}`}>
                <div className="max-w-7xl mx-auto px-6">
                    <nav className={`flex items-center justify-between px-10 py-5 rounded-[2.5rem] border transition-all duration-700 bg-white/70 backdrop-blur-2xl ${scrolled ? 'shadow-2xl border-[var(--green)]/10 scale-[0.98]' : 'border-transparent shadow-none'}`}>
                        <Link href="/" className="flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--green)] to-[var(--green2)] flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-transform duration-500">
                                <Sprout size={24} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-black text-[var(--green)] tracking-tighter uppercase italic">AgroMaître</span>
                                <span className="text-[10px] font-black text-[var(--text3)] uppercase tracking-[0.4em]">Écosystème Digital</span>
                            </div>
                        </Link>

                        <div className="hidden lg:flex items-center gap-10">
                            {[
                                { name: 'Écosystème', href: '/features' },
                                { name: 'AgroSync', href: '/agrosync' },
                                { name: 'Journal', href: '/blog' },
                                { name: 'Vision', href: '/about' },
                            ].map((item) => (
                                <Link 
                                    key={item.href} 
                                    href={item.href} 
                                    className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text3)] hover:text-[var(--green)] transition-all relative group italic"
                                >
                                    {item.name}
                                    <span className="absolute -bottom-2 left-0 w-0 h-1 bg-[var(--green)] transition-all group-hover:w-full"></span>
                                </Link>
                            ))}
                        </div>

                        <div className="flex items-center gap-6">
                            <Link href="/login" className="hidden sm:flex items-center gap-2 group text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text3)] hover:text-[var(--green)] transition-all italic">
                                <LogIn size={14} className="group-hover:-translate-x-1 transition-transform" />
                                Connexion
                            </Link>
                            <Link href="/register" className="px-10 py-4 bg-[var(--green)] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-[var(--green2)] transition-all shadow-2xl shadow-[var(--green)]/20 hover:scale-105 active:scale-95 italic">
                                Inscription
                            </Link>
                        </div>
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                {children}
            </main>

            {/* PRE-FOOTER: BORDERLESS MOTION */}
            <div className="bg-white py-14 border-y border-[var(--border)] overflow-hidden">
                <div className="flex whitespace-nowrap animate-marquee">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-16 px-16 text-[10px] font-black text-[var(--green)]/20 uppercase tracking-[0.5em] italic">
                            <span>Souss-Massa-Drâa</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] opacity-40"></div>
                            <span>Gharb-Chrarda-Beni Hssen</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] opacity-40"></div>
                            <span>Marrakech-Safi</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] opacity-40"></div>
                            <span>Casablanca-Settat</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] opacity-40"></div>
                        </div>
                    ))}
                </div>
            </div>

            <footer className="bg-white pt-40 pb-16 border-t border-[var(--border)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--green)]/5 blur-[150px] rounded-full pointer-events-none"></div>
                
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-20 mb-32">
                        <div className="lg:col-span-12 mb-10">
                             <Link href="/" className="flex items-center gap-6 group">
                                <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-[var(--green)] to-[var(--green2)] flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform duration-700">
                                    <Sprout size={32} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-3xl font-black text-[var(--green)] tracking-tighter uppercase italic">AgroMaître</span>
                                    <span className="text-[11px] font-black text-[var(--text3)] uppercase tracking-[0.5em] mt-1">Souveraineté Digitale Agricole</span>
                                </div>
                            </Link>
                        </div>

                        <div className="lg:col-span-5 space-y-12">
                            <p className="text-2xl text-[var(--text2)] leading-[1.6] font-normal italic opacity-80 max-w-lg border-l-4 border-[var(--green)]/20 pl-10">
                                Bâtir la souveraineté alimentaire par <span className="text-[var(--text)] font-black">l'innovation marocaine</span>. 
                                La donnée au service de la terre.
                            </p>
                            <div className="flex gap-6">
                                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                    <a key={i} href="#" title="Social Link" className="w-14 h-14 rounded-2xl bg-[var(--bg)] flex items-center justify-center text-[var(--green)] hover:bg-[var(--green)] hover:text-white transition-all shadow-sm border border-[var(--border)] group">
                                        <Icon size={22} className="group-hover:scale-110 transition-transform" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-8">
                            <h4 className="text-[12px] font-black text-[var(--text)] uppercase tracking-[0.4em] italic mb-10">Exploration</h4>
                            <ul className="space-y-6">
                                {[
                                    { name: 'Écosystème', href: '/features' },
                                    { name: 'AgroSync', href: '/agrosync' },
                                    { name: 'Journal', href: '/blog' },
                                    { name: 'Carrières', href: '/careers' },
                                    { name: 'Vision', href: '/about' },
                                ].map((link) => (
                                    <li key={link.href}>
                                        <Link href={link.href} className="text-[10px] font-black text-[var(--text3)] uppercase tracking-[0.2em] hover:text-[var(--green)] transition-all flex items-center gap-4 group italic">
                                            <div className="w-2 h-2 rounded-full bg-[var(--border)] group-hover:bg-[var(--gold)] group-hover:scale-150 transition-all"></div>
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="lg:col-span-2 space-y-8">
                            <h4 className="text-[12px] font-black text-[var(--text)] uppercase tracking-[0.4em] italic mb-10">Soutien</h4>
                            <ul className="space-y-6">
                                {[
                                    { name: 'Centre d\'Aide', href: '/help' },
                                    { name: 'Support Expert', href: '/contact' },
                                    { name: 'Vie Privée', href: '/legal/privacy' },
                                    { name: 'Contrats', href: '/legal/terms' },
                                    { name: 'Sécurité', href: '/legal/gdpr' },
                                ].map((link) => (
                                    <li key={link.href}>
                                        <Link href={link.href} className="text-[10px] font-black text-[var(--text3)] uppercase tracking-[0.2em] hover:text-[var(--green)] transition-all flex items-center gap-4 group italic">
                                            <div className="w-2 h-2 rounded-full bg-[var(--border)] group-hover:bg-[var(--gold)] group-hover:scale-150 transition-all"></div>
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="lg:col-span-3">
                            <div className="p-12 rounded-[4rem] bg-[var(--sidebar-bg)] text-white relative overflow-hidden shadow-electric">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--gold)] opacity-20 blur-[60px] rounded-full"></div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.5em] mb-6 italic text-[var(--gold)]">Newsletter</h4>
                                <p className="text-sm font-medium leading-relaxed mb-10 opacity-60">
                                    Veille stratégique et analyses du marché agricole marocain.
                                </p>
                                <div className="relative group/input">
                                    <input 
                                        type="email" 
                                        placeholder="votre@email.ma" 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-xs font-black placeholder:text-white/20 outline-none focus:border-[var(--gold)] transition-all"
                                    />
                                    <button className="absolute right-2 top-2 p-3.5 bg-[var(--gold)] rounded-xl text-white hover:bg-[var(--gold)]/80 transition-all shadow-lg active:scale-95">
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-20 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="flex items-center gap-8">
                            <span className="text-[10px] font-black text-[var(--text3)] uppercase tracking-[0.4em]">© 2026 AgroMaître Group. Souveraineté Digitale.</span>
                        </div>
                        
                        <div className="flex items-center gap-12 group clickable">
                             <div className="flex items-center gap-4 animate-pulse">
                                <span className="w-2 h-2 bg-[var(--red)] rounded-full shadow-[0_0_10px_var(--red)]"></span>
                                <span className="text-[10px] font-black text-[var(--text)] uppercase tracking-widest italic">Hub National : Casablanca, Maroc</span>
                            </div>
                            <div className="flex items-center gap-2 grayscale group-hover:grayscale-0 transition-all duration-700">
                                <div className="w-10 h-6 bg-[#C1272D] relative overflow-hidden rounded-[2px] shadow-sm">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-4 h-4 bg-transparent border-[1.5px] border-[#006233] rotate-[18deg] scale-[1.3]" 
                                             style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-10 text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text3)]">
                            <Link href="/help" className="hover:text-[var(--green)]">Aide</Link>
                            <Link href="/" className="hover:text-[var(--green)]">Status</Link>
                            <Link href="/legal/privacy" className="hover:text-[var(--green)]">Confidentialité</Link>
                        </div>
                    </div>
                </div>

                {/* Back to top pulse */}
                <div 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="fixed bottom-12 right-12 w-16 h-16 rounded-full bg-white border border-[var(--border)] shadow-2xl flex items-center justify-center text-[var(--green)] hover:bg-[var(--green)] hover:text-white transition-all cursor-pointer z-50 group hover:-translate-y-2 active:scale-95 clickable"
                >
                    <ChevronRight className="-rotate-90 group-hover:scale-110 transition-transform" />
                </div>
            </footer>

            <style jsx global>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 60s linear infinite;
                    display: flex;
                    width: max-content;
                }
            `}</style>
        </div>
    );
}
