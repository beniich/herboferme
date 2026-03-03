import React from "react";

interface ChartPoint {
    x: number;
    y: number;
}

export default function ReplicationChart({ data = [] }: { data: ChartPoint[] }) {
    // data = array d'objets {x:0   800, y:0   200}
    const path = data
        .map((pt, i) => `${i === 0 ? "M" : "L"}${pt.x},${pt.y}`)
        .join(" ");

    return (
        <div className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Replication Lag (ms)     24 h
                </h3>
                <select className="bg-slate-100 dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 rounded px-2 py-1 border border-slate-200 dark:border-slate-700 outline-none">
                    <option>1h</option>
                    <option defaultValue="24h">24h</option>
                    <option>7d</option>
                </select>
            </div>

            <div className="w-full h-48 overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                    {/* Grille */}
                    <line className="stroke-slate-200 dark:stroke-slate-700" x1="0" y1="50" x2="800" y2="50" strokeWidth="1" />
                    <line className="stroke-slate-200 dark:stroke-slate-700" x1="0" y1="100" x2="800" y2="100" strokeWidth="1" />
                    <line className="stroke-slate-200 dark:stroke-slate-700" x1="0" y1="150" x2="800" y2="150" strokeWidth="1" />

                    {/* Courbe */}
                    <path d={path} stroke="#3b82f6" strokeWidth="3" fill="none" strokeLinecap="round" />

                    {/* Ligne de base */}
                    <line x1="0" y1="190" x2="800" y2="190" className="stroke-slate-300 dark:stroke-slate-600" strokeDasharray="4" strokeOpacity="0.5" />
                </svg>
            </div>
        </div>
    );
}
