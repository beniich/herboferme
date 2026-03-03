
export default function GovernanceLanding() {
    return (
        <div className="min-h-screen bg-brand-midnight text-white flex flex-col items-center justify-center p-6 text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-500/5 blur-[120px] -z-10"></div>
            <div className="max-w-4xl space-y-12">
                <div className="w-24 h-24 bg-blue-500/20 rounded-3xl flex items-center justify-center mx-auto text-blue-400 border border-blue-500/20 animate-bounce">
                    <span className="material-symbols-outlined text-5xl">account_balance</span>
                </div>
                <h1 className="text-6xl md:text-8xl font-display font-black uppercase italic tracking-tighter">
                    Gouvernance <br />
                    <span className="text-blue-500 not-italic">Num  rique</span>
                </h1>
                <p className="text-xl text-slate-400 font-light leading-relaxed">
                    Nous transformons l'administration publique avec des solutions de transparence,
                    de gestion des r  clamations et d'e-gouvernance de nouvelle g  n  ration.
                </p>
                <div className="flex flex-wrap justify-center gap-6 pt-10">
                    <button className="px-10 py-5 bg-brand-orange text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-brand-orange/20 hover:scale-105 transition-all">
                        Demander une Consultation
                    </button>
                    <button className="px-10 py-5 glass-card rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                        Nos R  f  rences
                    </button>
                </div>
            </div>
        </div>
    );
}
