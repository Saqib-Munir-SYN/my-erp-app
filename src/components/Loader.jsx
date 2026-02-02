import { useTheme } from '../context/ThemeContext';

export function Loader({ fullscreen = false, text = 'Loading...', size = 'md' }) {
  const { isDark } = useTheme();
  
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4'
  };
  
  const sizeClass = sizes[size] || sizes.md;

  const spinner = (
    <div className="relative flex items-center justify-center">
      {/* Outer glow effect */}
      <div className={`absolute inset-0 rounded-full blur-md opacity-30 bg-emerald-500 animate-pulse`} />
      
      {/* Spinning gradient ring */}
      <div className={`${sizeClass} rounded-full border-transparent border-t-emerald-500 border-r-emerald-500 border-b-slate-200 dark:border-b-slate-700 border-l-slate-200 dark:border-l-slate-700 animate-spin`} 
           style={{ animationDuration: '0.8s' }} />
      
      {/* Center dot */}
      <div className="absolute w-2 h-2 rounded-full bg-emerald-500" />
    </div>
  );

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      {spinner}
      {text && (
        <span className={`text-sm font-medium tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {text}
        </span>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm transition-colors duration-300 ${isDark ? 'bg-slate-950/90' : 'bg-white/90'}`}>
        {content}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center p-8 rounded-2xl ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
      {content}
    </div>
  );
}