'use client';

import React, { useEffect, useState, useRef, memo } from 'react';
import { useOrgStore } from '@/store/orgStore';

interface SensorReading {
  sensorId:   string;
  parcelId:   string;
  sensorName: string;
  timestamp:  string;
  readings: {
    soilMoisture:    number;
    soilTemperature: number;
    airTemperature:  number;
    airHumidity:     number;
    lightIntensity:  number;
    conductivity:    number;
    ph:              number;
    batteryLevel:    number;
  };
  status: 'online' | 'offline' | 'warning';
}

// ─── Gauge circulaire SVG ──────────────────────────────────────────────────
const Gauge = memo(({ value, max, label, unit, color }: {
  value: number; max: number; label: string; unit: string; color: string;
}) => {
  const pct = Math.min(1, value / max);
  const r   = 28;
  const arc = 2 * Math.PI * r * 0.75;
  const dash = arc * pct;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6"
          strokeDasharray={`${arc} ${2 * Math.PI * r}`} strokeLinecap="round"
          transform="rotate(135 36 36)" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${arc - dash}`} strokeLinecap="round"
          transform="rotate(135 36 36)"
          style={{ transition: 'stroke-dasharray 0.6s ease' }} />
        <text x="36" y="38" textAnchor="middle" fill={color} fontSize="13" fontFamily="monospace" fontWeight="700">
          {value?.toFixed?.(1) ?? value}
        </text>
        <text x="36" y="50" textAnchor="middle" fill="#666" fontSize="8" fontFamily="monospace">
          {unit}
        </text>
      </svg>
      <div style={{ fontSize: '10px', color: 'var(--text3)', textAlign: 'center' }}>{label}</div>
    </div>
  );
});
Gauge.displayName = 'Gauge';

// ─── Carte capteur ──────────────────────────────────────────────────────────
const SensorCard = memo(({ sensor }: { sensor: SensorReading }) => {
  const r = sensor.readings;
  const isOffline = sensor.status === 'offline';
  const soilOk    = r.soilMoisture >= 30 && r.soilMoisture <= 70;

  return (
    <div className="panel" style={{ opacity: isOffline ? 0.5 : 1 }}>
      <div className="panel-header">
        <div className="panel-title" style={{ fontSize: '12px' }}>
          <div className="dot" style={{ background: isOffline ? 'var(--red)' : soilOk ? 'var(--green2)' : 'var(--gold2)' }} />
          {sensor.sensorName}
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
          {new Date(sensor.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      <div className="panel-body" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Gauge value={r.soilMoisture}    max={100} label="Hum. Sol"    unit="%"     color={r.soilMoisture < 25 ? '#ef4444' : '#22c55e'} />
          <Gauge value={r.airTemperature}  max={50}  label="T° Air"      unit="°C"    color={r.airTemperature > 35 ? '#f97316' : '#60a5fa'} />
          <Gauge value={r.airHumidity}     max={100} label="Hum. Air"    unit="%"     color="#a78bfa" />
          <Gauge value={r.ph}              max={14}  label="pH Sol"      unit="pH"    color={r.ph >= 6 && r.ph <= 7.5 ? '#22c55e' : '#f59e0b'} />
          <Gauge value={r.batteryLevel}    max={100} label="Batterie"    unit="%"     color={r.batteryLevel < 20 ? '#ef4444' : '#6ee7b7'} />
        </div>

        {/* Alertes capteur */}
        <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {r.soilMoisture < 25 && (
            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: 'rgba(239,68,68,0.15)', color: 'var(--red)' }}>
              💧 Sol très sec
            </span>
          )}
          {r.airTemperature > 35 && (
            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: 'rgba(249,115,22,0.15)', color: 'var(--gold2)' }}>
              🌡️ Chaleur excessive
            </span>
          )}
          {r.batteryLevel < 20 && (
            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: 'rgba(239,68,68,0.15)', color: 'var(--red)' }}>
              🔋 Batterie faible
            </span>
          )}
          {!r.soilMoisture && !r.airTemperature && !r.batteryLevel && (
            <span style={{ fontSize: '10px', color: 'var(--green2)' }}>✅ Tous paramètres normaux</span>
          )}
        </div>
      </div>
    </div>
  );
});
SensorCard.displayName = 'SensorCard';

// ─── Page IoT ────────────────────────────────────────────────────────────────
export default function IoTDashboardPage() {
  const [sensors, setSensors] = useState<SensorReading[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Chargement initial depuis REST
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/api/iot/latest`);
        const data = await res.json();
        setSensors(data?.data ?? []);
      } catch { /* ignore */ }
    };
    load();
  }, []);

  // WebSocket pour données temps réel
  useEffect(() => {
    const WS_URL = process.env.NEXT_PUBLIC_SOCKET_URL?.replace('http', 'ws') ?? 'ws://localhost:2065';
    const ws     = new WebSocket(`${WS_URL}/ws/iot`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      console.log('[IoT] WebSocket connecté');
    };

    ws.onmessage = (event) => {
      try {
        const reading: SensorReading = JSON.parse(event.data);
        setSensors(prev => {
          const idx = prev.findIndex(s => s.sensorId === reading.sensorId);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = reading;
            return next;
          }
          return [...prev, reading];
        });
      } catch { /* ignore */ }
    };

    ws.onclose = () => {
      setConnected(false);
      console.log('[IoT] WebSocket déconnecté');
    };

    return () => ws.close();
  }, []);

  const avgSoilMoisture = sensors.length
    ? (sensors.reduce((s, r) => s + (r.readings?.soilMoisture ?? 0), 0) / sensors.length).toFixed(1)
    : '—';
  const avgTemp = sensors.length
    ? (sensors.reduce((s, r) => s + (r.readings?.airTemperature ?? 0), 0) / sensors.length).toFixed(1)
    : '—';
  const alertCount = sensors.filter(s =>
    s.readings?.soilMoisture < 25 || s.readings?.airTemperature > 35 || s.readings?.batteryLevel < 20
  ).length;

  return (
    <div className="page active">
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
        <div>
          <div className="page-label">Capteurs · Temps réel</div>
          <h1 className="page-title">📡 Dashboard IoT</h1>
          <div className="page-sub">{sensors.length} capteur(s) · mis à jour en continu</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: connected ? '#22c55e' : '#ef4444',
            boxShadow: connected ? '0 0 6px #22c55e' : 'none', transition: 'all 0.3s' }} />
          <span style={{ fontSize: '11px', color: connected ? 'var(--green2)' : 'var(--red)', fontFamily: 'var(--font-mono)' }}>
            {connected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* KPIs globaux */}
      <div className="kpi-grid kpi-grid-4" style={{ marginBottom: '20px' }}>
        {[
          { icon: '📡', label: 'Capteurs actifs',   value: sensors.filter(s => s.status === 'online').length, unit: `/ ${sensors.length}`, color: 'var(--blue)' },
          { icon: '💧', label: 'Hum. sol moy.',     value: avgSoilMoisture, unit: '%',  color: 'var(--teal)'  },
          { icon: '🌡️', label: 'T° air moyenne',    value: avgTemp,         unit: '°C', color: 'var(--amber)' },
          { icon: '🔔', label: 'Alertes actives',   value: alertCount,      unit: '',   color: alertCount > 0 ? 'var(--red)' : 'var(--green)' },
        ].map(kpi => (
          <div key={kpi.label} className="kpi-card" style={{ '--kpi-color': kpi.color } as React.CSSProperties}>
            <div className="kpi-icon">{kpi.icon}</div>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value">{kpi.value}<span className="kpi-unit">{kpi.unit}</span></div>
          </div>
        ))}
      </div>

      {/* GRILLE CAPTEURS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {sensors.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text3)', padding: '60px' }}>
            📡 En attente des capteurs...
          </div>
        ) : (
          sensors.map(sensor => <SensorCard key={sensor.sensorId} sensor={sensor} />)
        )}
      </div>
    </div>
  );
}
