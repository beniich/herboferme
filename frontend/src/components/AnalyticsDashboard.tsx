"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

interface Overview {
    total_errors: number;
    errors_last_24h: number;
    avg_input_tokens: number;
    avg_output_tokens: number;
    top_5_endpoints: { endpoint: string; count: number }[];
}

interface Trend {
    date: string; // ISO "2024   02   01"
    count: number;
}

export const AnalyticsDashboard: React.FC = () => {
    const {
        data: overview,
        isLoading: loadingOverview,
        error: errOverview,
    } = useQuery({
        queryKey: ["overview"],
        queryFn: async (): Promise<Overview> => {
            const r = await fetch("/analytics/overview");
            if (!r.ok) throw new Error("Failed to fetch overview");
            return r.json();
        }
    });

    const {
        data: trends,
        isLoading: loadingTrends,
        error: errTrends,
    } = useQuery({
        queryKey: ["trends", { days: 30 }],
        queryFn: async (): Promise<Trend[]> => {
            const r = await fetch("/analytics/trends?days=30");
            if (!r.ok) throw new Error("Failed to fetch trends");
            return r.json();
        },
        // keepPreviousData is deprecated in v5, simplified here for newer React Query
    });

    return (
        <div style={{ padding: "2rem", fontFamily: "system-ui", background: "#f5f5f5", borderRadius: "8px", marginTop: "2rem" }}>
            <h2 style={{ color: "#333" }}>     Tableau de bord d'analytics IA</h2>

            {/* ---------- Overview ---------- */}
            {loadingOverview && <p>Chargement des indicateurs   </p>}
            {errOverview && <p style={{ color: "red" }}>Erreur: {String(errOverview)}</p>}
            {overview && (
                <section style={{ marginBottom: "2rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                    <div style={{ background: "white", padding: "1rem", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                        <h3 style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", color: "#666" }}>Total erreurs</h3>
                        <p style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0, color: "#e74c3c" }}>{overview.total_errors}</p>
                    </div>

                    <div style={{ background: "white", padding: "1rem", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                        <h3 style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", color: "#666" }}>Derni  res 24h</h3>
                        <p style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0, color: "#e67e22" }}>{overview.errors_last_24h}</p>
                    </div>

                    <div style={{ background: "white", padding: "1rem", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                        <h3 style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", color: "#666" }}>Co  t IA (tokens)</h3>
                        <p style={{ margin: 0 }}>
                            In: <strong>{overview.avg_input_tokens}</strong><br />
                            Out: <strong>{overview.avg_output_tokens}</strong>
                        </p>
                    </div>
                </section>
            )}

            {overview && overview.top_5_endpoints.length > 0 && (
                <section style={{ marginBottom: "2rem" }}>
                    <h3>Top erreurs par endpoint</h3>
                    <div style={{ background: "white", borderRadius: "8px", overflow: "hidden" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "#eee", textAlign: "left" }}>
                                    <th style={{ padding: "0.75rem" }}>Endpoint</th>
                                    <th style={{ padding: "0.75rem" }}>Occurrences</th>
                                </tr>
                            </thead>
                            <tbody>
                                {overview.top_5_endpoints.map((e, i) => (
                                    <tr key={e.endpoint} style={{ borderTop: "1px solid #eee" }}>
                                        <td style={{ padding: "0.75rem", fontFamily: "monospace" }}>{e.endpoint}</td>
                                        <td style={{ padding: "0.75rem" }}>{e.count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* ---------- Trends (chart) ---------- */}
            {loadingTrends && <p>Chargement de la courbe   </p>}
            {errTrends && <p style={{ color: "red" }}>{String(errTrends)}</p>}
            {trends && trends.length > 0 && (
                <section style={{ background: "white", padding: "1rem", borderRadius: "8px" }}>
                    <h3>  volution des erreurs (30 jours)</h3>
                    <div style={{ height: "300px", width: "100%" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trends}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 10 }}
                                    tickFormatter={(val) => {
                                        const d = new Date(val);
                                        return `${d.getDate()}/${d.getMonth() + 1}`;
                                    }}
                                />
                                <YAxis allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                                />
                                <Bar dataKey="count" fill="#ff6b6b" name="Erreurs" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>
            )}
        </div>
    );
};
