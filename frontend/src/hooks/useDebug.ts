import { useEffect, useState } from "react";

export interface DebugInfo {
    diagnostic: string;
    suggested_patch: string;
    usage: { input_tokens: number; output_tokens: number };
}

/**
 * Hook qui interroge l'endpoint `/debug/info/<error_id>` du backend.
 * En mode dev il se base sur le polling (intervalle 3 s)     on pourra le remplacer par WebSocket plus tard.
 */
export function useDebug(errorId: string | null) {
    const [info, setInfo] = useState<DebugInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!errorId) return;
        let cancelled = false;
        const fetchInfo = async () => {
            setLoading(true);
            try {
                const resp = await fetch(`/debug/info/${errorId}`);
                if (resp.status === 202) {
                    // Pas encore disponible     on revient + tard.
                    setLoading(false);
                    return;
                }
                if (!resp.ok) throw new Error(`status ${resp.status}`);
                const data = await resp.json();
                if (!cancelled) setInfo(data);
            } catch (e: any) {
                if (!cancelled) setError(e.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchInfo();
        const timer = setInterval(fetchInfo, 3000);
        return () => {
            cancelled = true;
            clearInterval(timer);
        };
    }, [errorId]);

    return { info, loading, error };
}
