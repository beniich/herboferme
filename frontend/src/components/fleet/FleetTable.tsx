import React from 'react';
import { Vehicle } from '@/hooks/useFleetData';
import { VehicleTableRow } from './VehicleTableRow';

interface FleetTableProps {
  vehicles: Vehicle[];
  isLoading: boolean;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (vehicleId: string) => void;
}

export const FleetTable = React.memo(
  ({ vehicles, isLoading, onEdit, onDelete }: FleetTableProps) => {
    if (isLoading) {
      return (
        <div className="fleet-table-skeleton" style={{ padding: '20px' }}>
          <div className="skeleton-rows" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton-row" style={{ height: '48px', background: 'var(--bg2)', borderRadius: '8px' }} />
            ))}
          </div>
        </div>
      );
    }

    if (!vehicles.length) {
      return (
        <div className="fleet-empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
          <div className="empty-icon" style={{ fontSize: '64px', marginBottom: '16px' }}>🚗</div>
          <div className="empty-title" style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: 'var(--text2)' }}>Aucun véhicule trouvé</div>
          <div className="empty-subtitle" style={{ fontSize: '14px' }}>Ajoutez votre premier véhicule pour commencer</div>
        </div>
      );
    }

    return (
      <div className="fleet-table-wrapper" style={{ overflowX: 'auto' }}>
        <table className="fleet-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: 'var(--text3)', borderBottom: '1px solid var(--border)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Véhicule</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: 'var(--text3)', borderBottom: '1px solid var(--border)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Modèle</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: 'var(--text3)', borderBottom: '1px solid var(--border)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>KM / Année</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: 'var(--text3)', borderBottom: '1px solid var(--border)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Statut</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: 'var(--text3)', borderBottom: '1px solid var(--border)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <VehicleTableRow
                key={vehicle._id}
                vehicle={vehicle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
);
FleetTable.displayName = 'FleetTable';
