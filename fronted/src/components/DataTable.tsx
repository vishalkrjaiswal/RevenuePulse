import React from 'react';
import { ChevronRight } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  loading?: boolean;
}

export default function DataTable({ columns, data = [], onRowClick, loading }: DataTableProps) {
  if (loading) {
    return (
      <div className="glass-card p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-surface rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr className="bg-surface/50">
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
              {onRowClick && <th style={{width: '50px'}}></th>}
            </tr>
          </thead>
          <tbody>
            {(data || []).map((row, index) => (
              <tr 
                key={index}
                className={onRowClick ? 'cursor-pointer' : ''}
                onClick={() => onRowClick?.(row)}
              >
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render 
                    ? column.render(row[column.key], row)
                    : (row[column.key] !== undefined ? String(row[column.key]) : '-')
                  }
                </td>
              ))}
                {onRowClick && (
                  <td>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {(!data || data.length === 0) && (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No data available</p>
        </div>
      )}
    </div>
  );
}