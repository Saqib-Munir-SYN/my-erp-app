import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { SkeletonTable } from './Skeleton';

export function Table({ columns, data, onEdit, onDelete, loading = false }) {
  const { isDark } = useTheme();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) return <SkeletonTable />;

  if (!data || data.length === 0) {
    return (
      <div className={`rounded-xl border p-12 text-center ${
        isDark
          ? 'bg-slate-800 border-slate-700'
          : 'bg-white border-slate-200'
      }`}>
        <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          📭 No data available
        </p>
      </div>
    );
  }

  // Mobile Card View
  if (isMobile) {
    return (
      <div className="space-y-4">
        {data.map((row, idx) => (
          <div key={row.id || idx} className={`rounded-lg border p-4 ${
            isDark
              ? 'bg-slate-800 border-slate-700'
              : 'bg-white border-slate-200'
          }`}>
            {columns.map(col => (
              <div key={col.key} className={`flex justify-between mb-2 pb-2 border-b last:border-0 ${
                isDark ? 'border-slate-700' : 'border-slate-100'
              }`}>
                <span className={`font-semibold text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {col.label}:
                </span>
                <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </span>
              </div>
            ))}
            <div className={`flex gap-2 mt-3 pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              {onEdit && (
                <button
                  onClick={() => onEdit(row)}
                  className={`flex-1 px-3 py-2 rounded font-semibold text-sm transition-colors ${
                    isDark
                      ? 'text-blue-400 hover:bg-slate-700'
                      : 'text-blue-600 hover:bg-blue-50'
                  }`}
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
                  className={`flex-1 px-3 py-2 rounded font-semibold text-sm transition-colors ${
                    isDark
                      ? 'text-red-400 hover:bg-slate-700'
                      : 'text-red-600 hover:bg-red-50'
                  }`}
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
    <div className={`overflow-x-auto rounded-xl border shadow-sm ${
      isDark
        ? 'bg-slate-800 border-slate-700'
        : 'bg-white border-slate-200'
    }`}>
      <table className="w-full">
        <thead className={`border-b ${
          isDark
            ? 'bg-slate-700 border-slate-600'
            : 'bg-slate-50 border-slate-200'
        }`}>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                {col.label}
              </th>
            ))}
            <th className={`px-6 py-4 text-center text-xs font-bold uppercase tracking-wider ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody className={isDark ? 'divide-y divide-slate-700' : 'divide-y divide-slate-200'}>
          {data.map((row, idx) => (
            <tr key={row.id || idx} className={`transition-colors ${
              isDark
                ? 'hover:bg-slate-700'
                : 'hover:bg-slate-50'
            }`}>
              {columns.map(col => (
                <td key={col.key} className={`px-6 py-4 text-sm font-medium ${
                  isDark ? 'text-slate-200' : 'text-slate-900'
                }`}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              <td className="px-6 py-4 text-center space-x-3 flex justify-center">
                {onEdit && (
                  <button
                    onClick={() => onEdit(row)}
                    className={`font-semibold text-sm transition-colors ${
                      isDark
                        ? 'text-blue-400 hover:text-blue-300'
                        : 'text-blue-600 hover:text-blue-800'
                    }`}
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
                    className={`font-semibold text-sm transition-colors ${
                      isDark
                        ? 'text-red-400 hover:text-red-300'
                        : 'text-red-600 hover:text-red-800'
                    }`}
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