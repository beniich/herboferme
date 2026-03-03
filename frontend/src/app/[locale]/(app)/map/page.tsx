'use client';

import React, { useState, useCallback, memo } from 'react';
import dynamic from 'next/dynamic';
import type { ParcelAnalysis } from '@/components/NdviMap';
import useSWR from 'swr';
import { useOrgStore } from '@/store/orgStore';

const NdviMap = dynamic(() => import('@/components/NdviMap'), { ssr: false });

const IA_URL = process.env.NEXT_PUBLIC_IA_URL || 'http://localhost:5001';
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchParcelAnalyses = async (orgId: string): Promise<ParcelAnalysis[]> => {
  const parcelsRes = await fetch(`${API_URL}/api/crops`, {
    headers: { 'x-organization-id': orgId },
  });
  const parcels = await parcelsRes.json();
  const list    = parcels?.data ?? parcels ?? [];

  const res = await fetch(`${IA_URL}/satellite/analyze`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ parcels: list.slice(0, 20) }),
  });
  const data = await res.json();
  return data?.data ?? [];
};

// ─── Panel détail parcelle ─────────────────────────────────────────────────
const ParcelDetail = memo(({ parcel, onClose }: { parcel: ParcelAnalysis; onClose: () => void }) => {
  const [reco, setReco]       = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${IA_URL}/recommendations`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          parcelId:   parcel.parcelId,
          parcelName: parcel.parcelName,
          ndvi:       parcel.ndvi,
          stressScore:parcel.stressScore,
          stressZones:parcel.stressZones,
        }),
      });
      setReco(await res.json());
    } finally { setLoading(false); }
  }, [parcel]);

  const urgencyColor: Record<string, string> = {
    critical: 'var(--red)', high: 'var(--gold2)', medium: 'var(--blue)', low: 'var(--green)',
  };
  const priorityColor: Record<string, string> = {
    'immédiate': 'var(--red)', '48h': 'var(--gold2)', '7j': 'var(--blue)', 'préventif': 'var(--green2)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '15px' }}>{parcel.parcelName}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '18px' }}>×</button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {[
          { label: 'NDVI moyen',   value: parcel.ndvi?.mean?.toFixed(3), color: parcel.ndvi?.mean > 0.5 ? 'var(--green2)' : 'var(--gold2)' },
          { label: 'Score stress', value: `${parcel.stressScore}/100`,   color: parcel.recommendation?.color },
          { label: 'Zones stress', value: parcel.stressZones?.length,    color: 'var(--text2)' },
          { label: 'NDVI min',     value: parcel.ndvi?.min?.toFixed(3),  color: 'var(--red)' },
        ].map(kpi => (
          <div key={kpi.label} style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text3)', marginBottom: '4px' }}>{kpi.label}</div>
            <div style={{ fontSize: '18px', fontFamily: 'var(--font-mono)', color: kpi.color as string, fontWeight: 600 }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Statut */}
      <div style={{ padding: '10px', borderRadius: '8px', background: `${parcel.recommendation?.color}18`, border: `1px solid ${parcel.recommendation?.color}40` }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: parcel.recommendation?.color }}>{parcel.recommendation?.label}</div>
        {parcel.recommendation?.action && (
          <div style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '4px' }}>⚡ {parcel.recommendation.action}</div>
        )}
      </div>

      {/* Recommandations IA */}
      {!reco ? (
        <button onClick={loadRecommendations} disabled={loading} style={{ padding: '9px', borderRadius: '8px', border: '1px solid rgba(58,122,184,0.3)', background: 'rgba(58,122,184,0.1)', color: 'var(--blue)', cursor: 'pointer', fontSize: '13px' }}>
          {loading ? '⏳ Analyse IA...' : '🤖 Obtenir recommandations IA'}
        </button>
      ) : (
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text3)', marginBottom: '8px', letterSpacing: '1px' }}>RECOMMANDATIONS IA</div>
          <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '10px', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
            {reco.summary}
          </div>
          {reco.recommendations?.map((r: any, i: number) => (
            <div key={i} style={{ padding: '10px', marginBottom: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>{r.title}</span>
                <span style={{ fontSize: '10px', color: priorityColor[r.priority] ?? 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{r.priority}</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text2)' }}>{r.action}</div>
              {r.quantity && <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '3px' }}>📏 {r.quantity}</div>}
            </div>
          ))}
          <div style={{ fontSize: '11px', color: 'var(--text3)', textAlign: 'right' }}>Confiance IA: {reco.confidence}%</div>
        </div>
      )}
    </div>
  );
});
ParcelDetail.displayName = 'ParcelDetail';

// ─── Page principale ──────────────────────────────────────────────────────────
export default function MapPage() {
  const { activeOrganization } = useOrgStore();
  const orgId = activeOrganization?._id ?? '';
  const [selected, setSelected] = useState<ParcelAnalysis | null>(null);

  const { data: parcels = [], isLoading, mutate } = useSWR(
    orgId ? `ndvi-${orgId}` : null,
    () => fetchParcelAnalyses(orgId),
    { revalidateOnFocus: false, dedupingInterval: 300_000 }
  );

  const criticalCount = parcels.filter(p => p.recommendation?.level === 'critical').length;
  const highCount     = parcels.filter(p => p.recommendation?.level === 'high').length;

  return (
    <div className="page active" style={{ height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexShrink: 0 }}>
        <div>
          <div className="page-label">Satellite · NDVI · Stress hydrique</div>
          <h1 className="page-title">🗺️ Carte Interactive</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {criticalCount > 0 && (
            <div style={{ padding: '5px 12px', borderRadius: '20px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--red)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
              ⚠️ {criticalCount} critique{criticalCount > 1 ? 's' : ''}
            </div>
          )}
          {highCount > 0 && (
            <div style={{ padding: '5px 12px', borderRadius: '20px', background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', color: 'var(--gold2)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
              🔶 {highCount} élevé{highCount > 1 ? 's' : ''}
            </div>
          )}
          <button onClick={() => mutate()} style={{ padding: '7px 12px', borderRadius: '8px', fontSize: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer' }}>
            ↺ Actualiser
          </button>
        </div>
      </div>

      {/* CONTENU */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 320px' : '1fr', gap: '16px', flex: 1, minHeight: 0 }}>
        {/* CARTE */}
        <div className="panel" style={{ overflow: 'hidden', padding: 0 }}>
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text3)' }}>
              🛰️ Analyse satellite en cours...
            </div>
          ) : (
            <NdviMap parcels={parcels} onParcelSelect={setSelected} />
          )}
        </div>

        {/* PANEL DÉTAIL */}
        {selected && (
          <div className="panel" style={{ overflow: 'auto' }}>
            <div className="panel-body" style={{ padding: '16px' }}>
              <ParcelDetail parcel={selected} onClose={() => setSelected(null)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
