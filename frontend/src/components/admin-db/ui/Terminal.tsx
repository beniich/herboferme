'use client';

import React, { useEffect, useRef, useState } from "react";
import { useDbSocket } from "@/hooks/useDbSocket";

interface Log {
    timestamp: string;
    type: string;
    container: string;
    message: string;
}

export default function Terminal() {
    const [logs, setLogs] = useState<Log[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const socket = useDbSocket('/logs');

    useEffect(() => {
        if (!socket) return;

        const handleLog = (log: Log) => {
            setLogs((prev) => [...prev, log].slice(-200)); // garder les 200 derni  res lignes
        };

        socket.on("log", handleLog);

        return () => {
            socket.off("log", handleLog);
        };
    }, [socket]);

    // Auto   scroll quand un nouveau log arrive
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [logs]);

    // Helper pour choisir la couleur selon le type
    const colorClass = (type: string) => {
        switch (type) {
            case "INFO":
                return "bg-blue-500/20 text-blue-400";
            case "WARN":
                return "bg-amber-500/20 text-amber-400";
            case "ERROR":
                return "bg-red-500/20 text-red-400";
            case "BACKUP":
                return "bg-emerald-500/20 text-emerald-400";
            default:
                return "bg-slate-600/20 text-slate-300";
        }
    };

    return (
        <section className="mt-10">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Console SQL Interactive
                </h2>
                <div className="flex gap-1 bg-slate-800 p-0.5 rounded-md">
                    <button className="px-2 py-1 text-xs font-bold bg-slate-700 text-white rounded">
                        SELECT
                    </button>
                    <button className="px-2 py-1 text-xs font-bold text-slate-400 hover:text-white">
                        INSERT
                    </button>
                    <button className="px-2 py-1 text-xs font-bold text-slate-400 hover:text-white">
                        BACKUP
                    </button>
                </div>
            </div>

            <div className="rounded-xl bg-black font-mono text-sm overflow-hidden border border-slate-800 shadow-2xl flex flex-col h-[460px]">
                {/* barre de recherche */}
                <div className="bg-slate-900 border-b border-slate-800 p-2 flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-600 text-sm">search</span>
                    <input
                        className="bg-transparent border-none focus:ring-0 text-xs text-slate-300 flex-1 placeholder:text-slate-600 outline-none"
                        placeholder="Recherche (ex : SELECT *, error, user_id=123)..."
                    />
                    <span className="text-[10px] text-slate-600">CTRL + F</span>
                </div>

                {/* log container */}
                <div
                    ref={containerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800"
                >
                    {logs.map((log, idx) => (
                        <p key={idx} className="text-slate-400 leading-relaxed font-mono text-xs">
                            <span className="text-slate-600 mr-2">{`[${log.timestamp}]`}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold mr-2 uppercase tracking-wider ${colorClass(log.type)}`}>
                                {log.type}
                            </span>
                            <span className="font-semibold text-slate-300 mr-1">{log.container}:</span>
                            <span className="text-slate-400">{log.message}</span>
                        </p>
                    ))}
                    {logs.length === 0 && (
                        <div className="h-full flex items-center justify-center text-slate-700 italic">
                            En attente de logs...
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
