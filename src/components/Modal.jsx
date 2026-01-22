import { useTheme } from '../context/ThemeContext';

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const { isDark } = useTheme();
  if (!isOpen) return null;

  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }[size] || 'max-w-md';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className={`relative ${sizeClass} w-full mx-4 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-300 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <h2 className={`text-xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{title}</h2>
          <button
            onClick={onClose}
            className={`text-2xl transition-colors ${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'}`}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}