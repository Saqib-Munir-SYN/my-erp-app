import { useState, useEffect } from 'react';
import { SkeletonTable } from './Skeleton';

export function Table({ columns, data, onEdit, onDelete, loading = false }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) return <SkeletonTable />;

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <p className="text-slate-500 text-lg">📭 No data available</p>
      </div>
    );
  }

  // Mobile Card View
  if (isMobile) {
    return (
      <div className="space-y-4">
        {data.map((row, idx) => (
          <div key={row.id || idx} className="bg-white rounded-lg border border-slate-200 p-4">
            {columns.map(col => (
              <div key={col.key} className="flex justify-between mb-2 pb-2 border-b border-slate-100 last:border-0">
                <span className="font-semibold text-slate-600 text-sm">{col.label}:</span>
                <span className="text-slate-900 font-medium">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </span>
              </div>
            ))}
            <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
              {onEdit && (
                <button
                  onClick={() => onEdit(row)}
                  className="flex-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded font-semibold text-sm"
                  type="button"
                >
                  ✎ Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure?')) {
                      onDelete(row.id);
                    }
                  }}
                  className="flex-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded font-semibold text-sm"
                  type="button"
                >
                  🗑 Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Desktop Table View
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full">
        <thead className="bg-linear-to-r from-slate-50 to-slate-100 border-b border-slate-200">
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
            <th className="px-6 py-4 text-center text-xs font-bold text-slate-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {data.map((row, idx) => (
            <tr key={row.id || idx} className="hover:bg-slate-50 transition-colors">
              {columns.map(col => (
                <td key={col.key} className="px-6 py-4 text-sm text-slate-900 font-medium">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              <td className="px-6 py-4 text-center space-x-3 flex justify-center">
                {onEdit && (
                  <button
                    onClick={() => onEdit(row)}
                    className="text-blue-600 hover:text-blue-800 font-semibold text-sm transition-colors"
                    type="button"
                  >
                    ✎ Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure?')) {
                        onDelete(row.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-800 font-semibold text-sm transition-colors"
                    type="button"
                  >
                    🗑 Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}