import { useTheme } from '../context/ThemeContext';

export function Loader({ fullscreen = false, text = 'Loading...' }) {
  const { isDark } = useTheme();
  
  const loader = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative w-12 h-12">
        {/* Track */}
        <div className={`absolute inset-0 rounded-full border-4 ${isDark ? 'border-slate-700' : 'border-slate-200'}`} />
        {/* Spinning part */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin" />
      </div>
      {text && (
        <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {text}
        </span>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center z-50 ${isDark ? 'bg-slate-950/80' : 'bg-white/80'} backdrop-blur-sm`}>
        {loader}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center py-12 ${isDark ? 'bg-slate-900' : 'bg-white'} rounded-xl`}>
      {loader}
    </div>
  );
}