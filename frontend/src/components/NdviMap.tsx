'use client';

import React, { useEffect, useRef, memo } from 'react';

export interface ParcelAnalysis {
  parcelId:    string;
  parcelName:  string;
  stressScore: number;
  ndvi:        { mean: number; min: number; max: number; grid: number[][] };
  stressZones: Array<{ center: [number, number]; radius: number; severity: number }>;
  recommendation: { level: string; label: string; color: string; action: string | null };
  location?:   { lat: number; lng: number; polygon?: [number, number][] };
}

interface Props {
  parcels:         ParcelAnalysis[];
  onParcelSelect?: (parcel: ParcelAnalysis) => void;
}

const STRESS_COLORS: Record<string, string> = {
  healthy:  '#22c55e',
  moderate: '#f59e0b',
  high:     '#f97316',
  critical: '#ef4444',
};

export default memo(function NdviMap({ parcels, onParcelSelect }: Props) {
  const mapRef       = useRef<any>(null);
  const leafletRef   = useRef<any>(null);
  const heatLayerRef = useRef<any>(null);
  const markersRef   = useRef<any[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      // @ts-ignore
      await import('leaflet.heat');

      if (mapRef.current) return; // Déjà initialisé

      const map = L.map('ndvi-map', {
        center: [33.97, -6.85], // Coordonnées Al Baraka
        zoom: 14,
        zoomControl: true,
      });

      // Fond de carte satellite
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: 'Esri World Imagery', maxZoom: 19 }
      ).addTo(map);

      // Labels par-dessus le satellite
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, opacity: 0.6 }
      ).addTo(map);

      mapRef.current     = map;
      leafletRef.current = L;
    };

    initMap();
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  // Mise à jour heatmap et marqueurs quand parcelles changent
  useEffect(() => {
    if (!mapRef.current || !leafletRef.current || parcels.length === 0) return;
    const L   = leafletRef.current;
    const map = mapRef.current;

    // Supprimer anciens marqueurs
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    heatLayerRef.current?.remove();

    // Points heatmap stress hydrique
    const heatPoints: [number, number, number][] = [];

    parcels.forEach(parcel => {
      const lat = parcel.location?.lat ?? 33.97 + Math.random() * 0.02;
      const lng = parcel.location?.lng ?? -6.85 + Math.random() * 0.02;
      const color = STRESS_COLORS[parcel.recommendation?.level ?? 'moderate'];

      // Point heatmap (intensité = stress/100)
      heatPoints.push([lat, lng, parcel.stressScore / 100]);

      // Cercle de la parcelle
      const circle = L.circle([lat, lng], {
        color,
        fillColor: color,
        fillOpacity: 0.35,
        radius: 150,
        weight: 2,
      }).addTo(map);

      // Popup riche
      circle.bindPopup(`
        <div style="font-family: monospace; min-width: 200px;">
          <div style="font-weight: bold; margin-bottom: 6px; font-size: 14px;">
            ${parcel.parcelName}
          </div>
          <div style="color: ${color}; font-size: 13px; margin-bottom: 4px;">
            ● ${parcel.recommendation?.label}
          </div>
          <table style="font-size: 12px; width: 100%;">
            <tr><td>NDVI</td><td><b>${parcel.ndvi?.mean?.toFixed(3)}</b></td></tr>
            <tr><td>Stress</td><td><b>${parcel.stressScore}/100</b></td></tr>
            <tr><td>Zones stress</td><td><b>${parcel.stressZones?.length}</b></td></tr>
          </table>
          ${parcel.recommendation?.action
            ? `<div style="margin-top: 8px; padding: 6px; background: ${color}22; border-radius: 4px; font-size: 11px;">⚡ ${parcel.recommendation.action}</div>`
            : ''}
        </div>
      `, { maxWidth: 250 });

      circle.on('click', () => onParcelSelect?.(parcel));
      markersRef.current.push(circle);
    });

    // Heatmap NDVI stress
    // @ts-ignore
    if (window.L?.heatLayer) {
      // @ts-ignore
      heatLayerRef.current = window.L.heatLayer(heatPoints, {
        radius: 40, blur: 25, maxZoom: 17,
        gradient: { 0.0: '#22c55e', 0.4: '#f59e0b', 0.7: '#f97316', 1.0: '#ef4444' },
      }).addTo(map);
    }

  }, [parcels, onParcelSelect]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '400px' }}>
      <div id="ndvi-map" style={{ width: '100%', height: '100%', borderRadius: '8px' }} />

      {/* Légende */}
      <div style={{
        position: 'absolute', bottom: '20px', left: '10px', zIndex: 1000,
        background: 'rgba(0,0,0,0.75)', borderRadius: '8px', padding: '10px 14px',
        backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{ fontSize: '10px', color: '#aaa', marginBottom: '6px', letterSpacing: '1px' }}>STRESS HYDRIQUE</div>
        {[
          { color: '#22c55e', label: 'Sain (0-25)'       },
          { color: '#f59e0b', label: 'Modéré (25-50)'    },
          { color: '#f97316', label: 'Élevé (50-75)'     },
          { color: '#ef4444', label: 'Critique (75-100)' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: color }} />
            <span style={{ fontSize: '11px', color: '#ddd' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
});
