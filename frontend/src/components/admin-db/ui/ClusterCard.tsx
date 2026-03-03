import React from "react";

interface ClusterProps {
    id: string;
    name: string;
    role: string;
    status: string;
    version: string;
    uptime?: string;
    lag?: number;
    cpu: number;
    ram: { used: number; total: number };
    iops: number;
    connections: number;
}

export default function ClusterCard({ cluster }: { cluster: ClusterProps }) {
    const statusBadge: Record<string, { bg: string; txt: string; label: string }> = {
        healthy: { bg: "bg-emerald-500/10", txt: "text-emerald-500", label: "Healthy" },
        sync: { bg: "bg-emerald-500/10", txt: "text-emerald-500", label: "Sync" },
        lagging: { bg: "bg-amber-500/10", txt: "text-amber-500", label: `Lag ${cluster.lag}s` },
        failed: { bg: "bg-red-500/10", txt: "text-red-500", label: "Failed" },
    };

    const badge = statusBadge[cluster.status] || statusBadge["healthy"];

    return (
        <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-900 dark:text-white">
                    {cluster.name}
                </span>
                <span className={`px-2 py-0.5 ${badge.bg} ${badge.txt} text-xs font-black uppercase rounded`}>
                    {badge.label}
                </span>
            </div>

            {cluster.role === "master" && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    Version {cluster.version}     Uptime {cluster.uptime}
                </p>
            )}
            {cluster.role === "replica" && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    Version {cluster.version}     Lag {cluster.lag}s
                </p>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                    <p className="font-medium text-slate-700 dark:text-slate-300">CPU</p>
                    <p className="text-slate-600 dark:text-slate-400">{cluster.cpu}%</p>
                </div>
                <div>
                    <p className="font-medium text-slate-700 dark:text-slate-300">RAM</p>
                    <p className="text-slate-600 dark:text-slate-400">{cluster.ram?.used ?? "   "} GB / {cluster.ram?.total ?? "   "} GB</p>
                </div>
                <div>
                    <p className="font-medium text-slate-700 dark:text-slate-300">IOPS</p>
                    <p className="text-slate-600 dark:text-slate-400">{cluster.iops}</p>
                </div>
                <div>
                    <p className="font-medium text-slate-700 dark:text-slate-300">Connections</p>
                    <p className="text-slate-600 dark:text-slate-400">{cluster.connections}</p>
                </div>
            </div>
        </div>
    );
}
