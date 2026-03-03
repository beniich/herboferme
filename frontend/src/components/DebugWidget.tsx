"use client";

import React, { useEffect, useState } from "react";
import { useDebug } from "../hooks/useDebug";

/**
 * Widget flottant disponible en dev uniquement (d  termin   via VITE_DEBUG_WIDGET_ENABLED).
 * - Se d  clenche avec le raccourci Ctrl+Alt+D.
 * - S'abonne    l'  v  nement global `debug-error` qui porte `{errorId}`.
 */
const DEBUG_WIDGET_ENABLED = process.env.NEXT_PUBLIC_DEBUG_WIDGET_ENABLED === "true" && process.env.NODE_ENV !== "production";

export default function DebugWidget() {
    const [visible, setVisible] = useState(false);
    const [errorId, setErrorId] = useState<string | null>(null);
    const { info, loading, error } = useDebug(errorId);

    // Raccourci clavier
    useEffect(() => {
        if (!DEBUG_WIDGET_ENABLED) return;
        const handler = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.altKey && e.key === "d") setVisible((v) => !v);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    // Ecoute d'un event global (d  clench   par le middleware backend)
    useEffect(() => {
        if (!DEBUG_WIDGET_ENABLED) return;
        const listener = (ev: Event) => {
            const custom = ev as CustomEvent<{ errorId: string }>;
            setErrorId(custom.detail.errorId);
        };
        window.addEventListener("debug-error", listener as EventListener);
        return () => window.removeEventListener("debug-error", listener as EventListener);
    }, []);

    if (!DEBUG_WIDGET_ENABLED || !visible) return null;

    return (
        <div
            style={{
                position: "fixed",
                bottom: "1rem",
                right: "1rem",
                width: "420px",
                maxHeight: "80vh",
                background: "#1e1e1e",
                color: "#fff",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                overflow: "auto",
                zIndex: 9999,
                fontFamily: "system-ui",
            }}
        >
            <div
                style={{
                    background: "#2d2d2d",
                    padding: "0.5rem 1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <strong>IA Debug Console</strong>
                <button
                    onClick={() => setVisible(false)}
                    style={{
                        background: "transparent",
                        border: "none",
                        color: "#ff6b6b",
                        fontSize: "1.2rem",
                        cursor: "pointer",
                    }}
                    title="Fermer"
                >

                </button>
            </div>

            <div style={{ padding: "0.75rem 1rem" }}>
                {/* Aucun error_id */}
                {!errorId && <p style={{ opacity: 0.7, fontStyle: "italic" }}>Aucune erreur d  tect  e.</p>}

                {/* Loading */}
                {errorId && loading && <p style={{ opacity: 0.7 }}>Analyse en cours   </p>}

                {/* Error */}
                {error && <p style={{ color: "#ff6b6b" }}>Erreur : {error}</p>}

                {/* Resultat IA */}
                {info && (
                    <>
                        <section style={{ marginBottom: "1rem" }}>
                            <h4 style={{ margin: "0 0 0.25rem", color: "#9cdcfe" }}>Diagnostic</h4>
                            <pre
                                style={{
                                    whiteSpace: "pre-wrap",
                                    background: "#252526",
                                    padding: "0.5rem",
                                    borderRadius: "4px",
                                }}
                            >
                                {info.diagnostic}
                            </pre>
                        </section>

                        {info.suggested_patch && (
                            <section style={{ marginBottom: "1rem" }}>
                                <h4 style={{ margin: "0 0 0.25rem", color: "#c5e1a5" }}>Patch sugg  r  </h4>
                                <pre
                                    style={{
                                        whiteSpace: "pre-wrap",
                                        background: "#1e1e1e",
                                        padding: "0.5rem",
                                        borderRadius: "4px",
                                        overflowX: "auto",
                                    }}
                                >
                                    {info.suggested_patch}
                                </pre>
                                <button
                                    onClick={() => navigator.clipboard.writeText(info.suggested_patch)}
                                    style={{
                                        marginTop: "0.5rem",
                                        background: "#0e639c",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "4px",
                                        padding: "0.25rem 0.5rem",
                                        cursor: "pointer",
                                    }}
                                >
                                    Copier le diff
                                </button>
                            </section>
                        )}

                        <small style={{ color: "#aaa" }}>
                            Tokens : {info.usage.input_tokens} / {info.usage.output_tokens}
                        </small>
                    </>
                )}
            </div>
        </div>
    );
}
