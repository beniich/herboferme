import React, { useMemo, useState } from 'react';

export interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  width?: string;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  keyField?: keyof T;
  onRowClick?: (item: T) => void;
  actions?: {
    label: string;
    icon: string;
    onClick: (item: T) => void;
    danger?: boolean;
  }[];
  pagination?: {
    pageSize: number;
    page: number;
    onPageChange: (page: number) => void;
  };
}

export const DataTable = React.memo(function DataTable<T extends Record<string, any>>({
  data,
  columns,
  isLoading,
  keyField = '_id' as keyof T,
  onRowClick,
  actions,
  pagination,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortedData = useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      return 0;
    });
  }, [data, sortKey, sortDirection]);

  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (pagination.page - 1) * pagination.pageSize;
    return sortedData.slice(start, start + pagination.pageSize);
  }, [sortedData, pagination]);

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>
        Chargement...
      </div>
    );
  }

  if (!data.length) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text3)' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
        <div style={{ fontSize: '16px', marginBottom: '4px' }}>Aucune donnée</div>
      </div>
    );
  }

  return (
    <>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '12px',
                  color: 'var(--text3)',
                  cursor: col.sortable ? 'pointer' : 'default',
                  userSelect: 'none',
                  width: col.width,
                }}
                onClick={() => {
                  if (col.sortable) {
                    if (sortKey === col.key) {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortKey(col.key);
                      setSortDirection('asc');
                    }
                  }
                }}
              >
                {col.label}
                {sortKey === col.key && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
              </th>
            ))}
            {actions && actions.length > 0 && <th style={{ padding: '12px 16px', textAlign: 'left' }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row) => (
            <tr
              key={String(row[keyField])}
              style={{
                borderBottom: '1px solid var(--border)',
                cursor: onRowClick ? 'pointer' : 'default',
                transition: 'background 0.2s',
              }}
              onClick={() => onRowClick?.(row)}
              onMouseEnter={(e) => {
                if (onRowClick) {
                  (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255, 255, 255, 0.02)';
                }
              }}
              onMouseLeave={(e) => {
                if (onRowClick) {
                  (e.currentTarget as HTMLTableRowElement).style.background = '';
                }
              }}
            >
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  style={{
                    padding: '12px 16px',
                    color: 'var(--text2)',
                    fontSize: '14px',
                  }}
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              {actions && actions.length > 0 && (
                <td style={{ padding: '12px 16px', display: 'flex', gap: '8px' }}>
                  {actions.map((action) => (
                    <button
                      key={action.label}
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick(row);
                      }}
                      title={action.label}
                      style={{
                        padding: '6px 10px',
                        border: 'none',
                        background: action.danger ? 'rgba(192, 57, 43, 0.1)' : 'rgba(58, 122, 184, 0.1)',
                        color: action.danger ? 'var(--red)' : 'var(--blue)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                      }}
                    >
                      {action.icon}
                    </button>
                  ))}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {pagination && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
          <button
            onClick={() => pagination.onPageChange(Math.max(1, pagination.page - 1))}
            disabled={pagination.page === 1}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              color: pagination.page === 1 ? 'var(--text3)' : 'var(--text)',
              cursor: pagination.page === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            ← Précédent
          </button>
          <span style={{ fontSize: '14px', color: 'var(--text2)' }}>Page {pagination.page}</span>
          <button
            onClick={() => pagination.onPageChange(pagination.page + 1)}
            disabled={paginatedData.length < pagination.pageSize}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              color: paginatedData.length < pagination.pageSize ? 'var(--text3)' : 'var(--text)',
              cursor: paginatedData.length < pagination.pageSize ? 'not-allowed' : 'pointer',
            }}
          >
            Suivant →
          </button>
        </div>
      )}
    </>
  );
});
DataTable.displayName = 'DataTable';
