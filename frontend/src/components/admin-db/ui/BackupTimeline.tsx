import React from "react";

interface Backup {
    id: string;
    timestamp: string;
    sizeGB: number;
    durationSec: number;
    status: string;
    error?: string;
}

export default function BackupTimeline({ backups }: { backups: Backup[] }) {
    return (
        <div className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Backup History</h3>
                <button className="px-3 py-1 bg-primary/10 text-primary text-sm rounded hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-sm align-middle mr-1">add</span> New Backup
                </button>
            </div>

            <ul className="space-y-3">
                {backups.map((b) => (
                    <li
                        key={b.id}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded border border-slate-100 dark:border-slate-700/50"
                    >
                        <div className="flex items-center gap-2">
                            {b.status === "success" ? (
                                <span className="material-symbols-outlined text-emerald-500">
                                    check_circle
                                </span>
                            ) : (
                                <span className="material-symbols-outlined text-red-500">
                                    error
                                </span>
                            )}
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                {new Date(b.timestamp).toISOString().replace("T", " ").slice(0, 16)}
                            </span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            {b.sizeGB} GB     {Math.round(b.durationSec / 60)} min
                            {b.status === "failed" && b.error ? `     ${b.error}` : ""}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
