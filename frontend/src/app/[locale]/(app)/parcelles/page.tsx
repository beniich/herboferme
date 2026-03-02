'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cropsApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Crop {
  _id: string;
  name: string;
  category: string;
  plotId: string;
  status: string;
  plantedDate: string;
  surface?: number;
}

const STATUS_MAP: Record<string, { label: string; pill: string }> = {
  PLANTED:   { label: 'Planté',          pill: 'pill-blue' },
  GROWING:   { label: 'En croissance',   pill: 'pill-green' },
  READY:     { label: 'Prêt à récolter', pill: 'pill-gold' },
  HARVESTED: { label: 'Récolté',         pill: 'pill-teal' },
};

export default function ParcellesPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await cropsApi.getAll() as any;
      setCrops(res?.data || []);
    } catch {
      toast.error('Erreur lors du chargement des parcelles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const uniquePlots = new Set(crops.map(c => c.plotId)).size;
  const totalSurface = crops.reduce((sum, c) => sum + (c.surface || 0), 0);
  const activeIrrigation = crops.filter(c => c.status === 'GROWING' || c.status === 'PLANTED').length;

  return (
    <div className="page active" id="page-parcelles">
      <div style={{ padding: '24px' }}>
        <div className="page-header">
          <div className="page-label" style={{ color: 'var(--green)' }}>Gestion des Terres</div>
          <h1 className="page-title">Parcelles & Cultures</h1>
        </div>
        <div className="kpi-grid kpi-grid-4">
          <div className="kpi-card" style={{ '--kpi-color': 'var(--green)' } as React.CSSProperties}>
            <div className="kpi-icon">🗺️</div>
            <div className="kpi-label">Nb Parcelles</div>
            <div className="kpi-value">{loading ? '—' : uniquePlots}<span className="kpi-unit">unités</span></div>
            <div className="kpi-trend neutral">= stable</div>
          </div>
          <div className="kpi-card" style={{ '--kpi-color': 'var(--green2)' } as React.CSSProperties}>
            <div className="kpi-icon">🌾</div>
            <div className="kpi-label">Surface Cultivée</div>
            <div className="kpi-value">{loading ? '—' : totalSurface}<span className="kpi-unit">ha</span></div>
          </div>
          <div className="kpi-card" style={{ '--kpi-color': 'var(--teal)' } as React.CSSProperties}>
            <div className="kpi-icon">💧</div>
            <div className="kpi-label">Cultures Actives</div>
            <div className="kpi-value">{loading ? '—' : activeIrrigation}<span className="kpi-unit">parc.</span></div>
          </div>
          <div className="kpi-card" style={{ '--kpi-color': 'var(--gold)' } as React.CSSProperties}>
            <div className="kpi-icon">🚜</div>
            <div className="kpi-label">Prêt à récolter</div>
            <div className="kpi-value">{loading ? '—' : crops.filter(c => c.status === 'READY').length}<span className="kpi-unit">parc.</span></div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div className="panel-title"><div className="dot" style={{ background: 'var(--green)' }}></div>Registre des Parcelles</div>
            <div className="panel-action" onClick={fetchData} style={{ cursor: 'pointer' }}>↺ Actualiser</div>
          </div>
          <div className="panel-body" style={{ padding: '0' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>Chargement…</div>
            ) : crops.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>Aucune parcelle ou culture enregistrée</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Parcelle (Plot ID)</th>
                    <th>Culture</th>
                    <th>Surface (ha)</th>
                    <th>Date de Plantation</th>
                    <th>Statut Moteur</th>
                  </tr>
                </thead>
                <tbody>
                  {crops.map(c => (
                    <tr key={c._id}>
                      <td style={{ fontWeight: 700 }}>{c.plotId || 'N/A'}</td>
                      <td>{c.name}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{c.surface || '0'}</td>
                      <td>{c.plantedDate ? new Date(c.plantedDate).toLocaleDateString() : 'N/A'}</td>
                      <td><span className={`pill ${STATUS_MAP[c.status]?.pill || 'pill-green'}`}>{STATUS_MAP[c.status]?.label || c.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="content-grid cg-2" style={{ marginTop: '20px' }}>
          <div className="panel">
            <div className="panel-header"><div className="panel-title">Répartition des Cultures</div></div>
            <div className="panel-body">
              <div className="gauge-row"><div className="gauge-label">🌾 Céréales</div><div className="gauge-track"><div className="gauge-fill" style={{ width: '45%', background: 'var(--amber)' }}></div></div><div className="gauge-val">45%</div></div>
              <div className="gauge-row"><div className="gauge-label">🌿 P.A.M</div><div className="gauge-track"><div className="gauge-fill" style={{ width: '25%', background: 'var(--green)' }}></div></div><div className="gauge-val">25%</div></div>
              <div className="gauge-row"><div className="gauge-label">🌳 Arboriculture</div><div className="gauge-track"><div className="gauge-fill" style={{ width: '20%', background: 'var(--green2)' }}></div></div><div className="gauge-val">20%</div></div>
              <div className="gauge-row"><div className="gauge-label">🥕 Maraîchage</div><div className="gauge-track"><div className="gauge-fill" style={{ width: '10%', background: 'var(--teal)' }}></div></div><div className="gauge-val">10%</div></div>
            </div>
          </div>
          <div className="panel">
            <div className="panel-header"><div className="panel-title">Santé Végétale (Satelite)</div></div>
            <div className="panel-body">
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '42px', color: 'var(--green2)', fontWeight: 'bold' }}>NDVI 0.78</div>
                <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '8px' }}>Indice de vigueur moyen du domaine</div>
                <div style={{ marginTop: '16px', color: 'var(--text2)', fontSize: '13px' }}>
                  📈 +4% par rapport à la moyenne saisonnière
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
