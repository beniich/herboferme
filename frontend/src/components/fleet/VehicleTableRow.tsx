import React from 'react';
import { Vehicle } from '@/hooks/useFleetData';

interface VehicleTableRowProps {
  vehicle: Vehicle;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (vehicleId: string) => void;
}

export const VehicleTableRow = React.memo(
  ({ vehicle, onEdit, onDelete }: VehicleTableRowProps) => {
    const statusColors = {
      active: { bg: 'rgba(90, 158, 69, 0.2)', text: 'var(--green2)' },
      maintenance: { bg: 'rgba(200, 146, 26, 0.2)', text: 'var(--gold2)' },
      hors_service: { bg: 'rgba(192, 57, 43, 0.2)', text: 'var(--red)' },
    };

    const statusIcons = {
      active: '✓',
      maintenance: '⚠',
      hors_service: '✕',
    };

    const status = vehicle.status || 'active';
    const colors = statusColors[status as keyof typeof statusColors];

    return (
      <tr className="vehicle-row" style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
        <td className="vehicle-name" style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text1)' }}>{vehicle.name}</td>
        <td className="vehicle-model" style={{ padding: '12px 16px', color: 'var(--text2)', fontSize: '14px' }}>{vehicle.model}</td>
        <td className="vehicle-km" style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--text2)' }}>{vehicle.kmPerYear?.toLocaleString('fr-FR')} km/an</td>
        <td className="vehicle-status" style={{ padding: '12px 16px' }}>
          <span
            className="status-badge"
            style={{
              background: colors.bg,
              color: colors.text,
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            {statusIcons[status as keyof typeof statusIcons]} {status.replace('_', ' ').toUpperCase()}
          </span>
        </td>
        <td className="vehicle-actions" style={{ padding: '12px 16px', display: 'flex', gap: '8px' }}>
          {onEdit && (
            <button
              onClick={() => onEdit(vehicle)}
              className="btn-icon"
              title="Modifier"
              style={{ padding: '6px 10px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '6px', fontSize: '14px', transition: 'all 0.2s' }}
            >
              ✏️
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(vehicle._id)}
              className="btn-icon btn-danger"
              title="Supprimer"
              style={{ padding: '6px 10px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '6px', fontSize: '14px', transition: 'all 0.2s' }}
            >
              🗑️
            </button>
          )}
        </td>
      </tr>
    );
  }
);
VehicleTableRow.displayName = 'VehicleTableRow';
