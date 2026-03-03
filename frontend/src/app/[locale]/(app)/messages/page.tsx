'use client';

export default function MessagesPage() {
    return (
        <div className="font-mono text-slate-100 min-h-screen p-6 relative flex flex-col overflow-hidden">
            <link href="https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

            {/* Background elements to match AgroSync aesthetic */}
            <div style={{
                position:"fixed",inset:0,pointerEvents:"none",zIndex:0,
                background:`radial-gradient(ellipse at 15% 15%, rgba(106, 4, 15, 0.15) 0%,transparent 55%),
                            radial-gradient(ellipse at 85% 85%, rgba(55, 6, 23, 0.2) 0%,transparent 55%),
                            radial-gradient(ellipse at 50% 50%, rgba(3, 7, 30, 0) 0%, #03071e 100%)`
            }} />

            <div className="relative z-10 mb-8 mt-2 pl-2">
                <p style={{fontSize:"10px",letterSpacing:"4px",textTransform:"uppercase",color:"#8fbc5a",fontFamily:"monospace",marginBottom:"8px"}}>Module Communication</p>
                <h1 style={{fontFamily:"'Lora',serif",fontSize:"40px",lineHeight:1.1,marginBottom:"6px",color:"#f0e8d8"}}>Centre de Messages</h1>
                <p style={{fontSize:"11px",color:"#9a8f7e",fontFamily:"monospace"}}>Discussions avec l'  quipe, les fournisseurs et les clients</p>
            </div>

            <div className="relative z-10 flex flex-1 h-[calc(100vh-160px)] gap-6">

                {/* Left Sidebar: Chat List */}
                <div
                    className="w-80 lg:w-96 flex flex-col rounded-[2rem] overflow-hidden"
                    style={{
                        background:"rgba(255,255,255,0.03)",
                        border:"1px solid rgba(255,255,255,0.08)",
                        backdropFilter:"blur(20px)",
                        boxShadow:"0 8px 32px rgba(0,0,0,0.4)"
                    }}
                >
                    <div className="p-6 space-y-5 border-b border-white/5">
                        <div className="flex items-center justify-between">
                            <h2 style={{fontFamily:"'Lora',serif",fontSize:"22px",color:"#f0e8d8"}}>Discussions</h2>
                            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                                style={{
                                    background:"rgba(143,188,90,0.15)",
                                    border:"1px solid rgba(143,188,90,0.3)",
                                    color:"#8fbc5a"
                                }}
                            >
                                <span className="material-symbols-outlined text-sm">edit_square</span>
                                Nouveau
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-xl">search</span>
                            <input
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-1 focus:ring-[#8fbc5a]/50 text-sm text-[#f0e8d8] placeholder-white/30 transition-all outline-none"
                                placeholder="Chercher contact ou r  f  rence..."
                                type="text"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            <button className="px-4 py-1.5 rounded-full text-xs transition-all" style={{background:"rgba(143,188,90,0.2)",color:"#8fbc5a",border:"1px solid rgba(143,188,90,0.3)"}}>Tout</button>
                            <button className="px-4 py-1.5 rounded-full text-xs transition-all hover:bg-white/10" style={{background:"rgba(255,255,255,0.03)",color:"#9a8f7e",border:"1px solid rgba(255,255,255,0.08)"}}>Urgent</button>
                            <button className="px-4 py-1.5 rounded-full text-xs transition-all hover:bg-white/10" style={{background:"rgba(255,255,255,0.03)",color:"#9a8f7e",border:"1px solid rgba(255,255,255,0.08)"}}>Fournisseurs</button>
                        </div>
                    </div>

                    {/* Chat Items */}
                    <div className="flex-1 overflow-y-auto" style={{scrollbarWidth:"thin",scrollbarColor:"#2a2018 transparent"}}>
                        {/* Active Chat Item */}
                        <div className="flex items-center gap-4 px-6 py-5 cursor-pointer transition-all relative group" style={{background:"rgba(143,188,90,0.08)"}}>
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8fbc5a] rounded-r-md"></div>
                            <div className="relative shrink-0">
                                <span className="h-12 w-12 rounded-full flex items-center justify-center font-bold" style={{background:"linear-gradient(135deg, #2d4a2d, #4a3020)",border:"1px solid rgba(143,188,90,0.4)",color:"#f0e8d8"}}>AB</span>
                                <div className="absolute bottom-0 right-0 h-3.5 w-3.5 border-[2px] border-[#0e1116] rounded-full" style={{background:"#8fbc5a"}}></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="text-[13px] font-bold truncate" style={{color:"#f0e8d8"}}>Coop  rative Atlas</h3>
                                    <span className="text-[10px]" style={{color:"#8fbc5a"}}>14:02</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-[11px] truncate" style={{color:"#c4b89a"}}>Re: Commande lait F  vrier confirm  e.</p>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold" style={{background:"rgba(143,188,90,0.2)",color:"#8fbc5a"}}>2</span>
                                </div>
                            </div>
                        </div>

                        {/* Other Item 1 */}
                        <div className="flex items-center gap-4 px-6 py-5 cursor-pointer transition-all hover:bg-white/5 border-b border-white/5">
                            <div className="relative shrink-0">
                                <span className="h-12 w-12 rounded-full flex items-center justify-center font-bold" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#9a8f7e"}}>SM</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="text-[13px] font-bold truncate" style={{color:"#e0d4c0"}}>Sarah Miller (V  t  rinaire)</h3>
                                    <span className="text-[10px]" style={{color:"#7a6a5a"}}>13:45</span>
                                </div>
                                <p className="text-[11px] truncate" style={{color:"#9a8f7e"}}>Le vaccin pour les bovins est pr  t...</p>
                            </div>
                        </div>

                        {/* Other Item 2 */}
                        <div className="flex items-center gap-4 px-6 py-5 cursor-pointer transition-all hover:bg-white/5 border-b border-white/5">
                            <div className="relative shrink-0">
                                <span className="h-12 w-12 rounded-full flex items-center justify-center font-bold" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#9a8f7e"}}>MT</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="text-[13px] font-bold truncate" style={{color:"#e0d4c0"}}>March   de Rabat (Grossiste)</h3>
                                    <span className="text-[10px]" style={{color:"#7a6a5a"}}>Hier</span>
                                </div>
                                <p className="text-[11px] truncate" style={{color:"#9a8f7e"}}>On aura besoin de 200kg de tomates.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Pane: Messaging Thread */}
                <div
                    className="flex-1 flex flex-col rounded-[2rem] overflow-hidden"
                    style={{
                        background:"rgba(255,255,255,0.02)",
                        border:"1px solid rgba(255,255,255,0.06)",
                        backdropFilter:"blur(20px)",
                        boxShadow:"0 8px 32px rgba(0,0,0,0.4)"
                    }}
                >
                    {/* Thread Header */}
                    <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-white/[0.02] shadow-sm z-10">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full flex items-center justify-center font-bold" style={{background:"linear-gradient(135deg, #2d4a2d, #4a3020)",border:"1px solid rgba(143,188,90,0.4)",color:"#f0e8d8"}}>AB</div>
                            <div>
                                <h2 style={{fontFamily:"'Lora',serif",fontSize:"18px",color:"#f0e8d8",lineHeight:1.2}}>Coop  rative Atlas</h2>
                                <span className="text-[10px] font-medium flex items-center gap-1.5 mt-0.5" style={{color:"#8fbc5a",letterSpacing:"1px",textTransform:"uppercase"}}>
                                    <span className="h-2 w-2 rounded-full animate-pulse" style={{background:"#8fbc5a",boxShadow:"0 0 8px rgba(143,188,90,0.8)"}}></span>
                                    En ligne
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="h-10 w-10 rounded-xl flex items-center justify-center transition-all hover:bg-white/10 text-white/50 hover:text-[#f0e8d8] border border-white/5 bg-white/5">
                                <span className="material-symbols-outlined text-[20px]">call</span>
                            </button>
                            <button className="h-10 w-10 rounded-xl flex items-center justify-center transition-all hover:bg-white/10 text-white/50 hover:text-[#f0e8d8] border border-white/5 bg-white/5">
                                <span className="material-symbols-outlined text-[20px]">more_vert</span>
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-8" style={{scrollbarWidth:"thin",scrollbarColor:"#2a2018 transparent"}}>
                        <div className="text-center">
                            <span className="text-[10px] px-3 py-1 bg-white/5 border border-white/10 rounded-full" style={{color:"#7a6a5a",letterSpacing:"1px"}}>Aujourd'hui</span>
                        </div>

                        {/* Message In */}
                        <div className="flex items-end gap-3 max-w-[80%]">
                            <div className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold mb-5" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#9a8f7e"}}>CA</div>
                            <div className="flex flex-col gap-1">
                                <div className="px-5 py-4 rounded-2xl rounded-bl-sm shadow-md" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}>
                                    <p className="text-[13px] leading-relaxed" style={{color:"#c4b89a"}}>Bonjour, le paiement pour les 4800L de lait de F  vrier a   t   valid  . La facture est g  n  r  e.</p>
                                </div>
                                <span className="text-[9px] ml-1" style={{color:"#5a4a3a"}}>13:45</span>
                            </div>
                        </div>

                        {/* Message Out */}
                        <div className="flex items-end justify-end gap-3 ml-auto max-w-[80%]">
                            <div className="flex flex-col items-end gap-1">
                                <div className="px-5 py-4 rounded-2xl rounded-br-sm shadow-md border" style={{background:"linear-gradient(135deg, rgba(143,188,90,0.2), rgba(74,124,31,0.2))",borderColor:"rgba(143,188,90,0.3)"}}>
                                    <p className="text-[13px] leading-relaxed" style={{color:"#f0e8d8"}}>Merci beaucoup. Bien re  u sur notre journal comptable.</p>
                                </div>
                                <div className="flex items-center gap-1.5 mr-1">
                                    <span className="text-[9px]" style={{color:"#5a4a3a"}}>13:47</span>
                                    <span className="material-symbols-outlined text-[13px]" style={{color:"#8fbc5a"}}>done_all</span>
                                </div>
                            </div>
                        </div>

                        {/* Message In 2 */}
                        <div className="flex items-end gap-3 max-w-[80%]">
                            <div className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold mb-5" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#9a8f7e"}}>CA</div>
                            <div className="flex flex-col gap-1">
                                <div className="px-5 py-4 rounded-2xl rounded-bl-sm shadow-md" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}>
                                    <p className="text-[13px] leading-relaxed" style={{color:"#c4b89a"}}>Parfait. Concernant la commande de Mars, on maintient les 5000L par semaine ?</p>
                                </div>
                                <span className="text-[9px] ml-1" style={{color:"#5a4a3a"}}>14:02</span>
                            </div>
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="p-6 border-t border-white/5 bg-white/[0.01]">
                        <div className="flex items-end gap-3 rounded-2xl p-2 focus-within:ring-1 focus-within:ring-[#8fbc5a] transition-all" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.1)"}}>
                            <button className="p-3 rounded-xl transition-all hover:bg-white/10 hover:scale-105" style={{color:"#9a8f7e"}}>
                                <span className="material-symbols-outlined text-[20px]">attach_file</span>
                            </button>
                            <textarea
                                className="flex-1 bg-transparent border-none focus:ring-0 text-[13px] py-3 px-1 resize-none min-h-[46px] max-h-[140px] outline-none"
                                style={{color:"#f0e8d8"}}
                                placeholder="  crivez votre message..."
                                rows={1}
                            ></textarea>
                            <button className="h-[46px] w-[54px] flex items-center justify-center rounded-xl shadow-lg transition-all active:scale-95 hover:brightness-110" style={{background:"#8fbc5a",color:"white",boxShadow:"0 4px 14px rgba(143,188,90,0.3)"}}>
                                <span className="material-symbols-outlined text-[20px]">send</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
