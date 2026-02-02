import { Link, useLocation } from 'react-router-dom';

export function NavLink({ to, icon: Icon, label, expanded, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden mb-1 ${
        isActive
          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
      }`}
    >
      {/* Background gradient for active */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600" />
      )}
      
      {/* Icon - Works with Lucide components */}
      <span className="relative z-10 shrink-0 flex items-center justify-center w-5 h-5">
        {typeof Icon === 'string' ? (
          <span className="text-xl">{Icon}</span>
        ) : (
          <Icon className="w-5 h-5" strokeWidth={2} />
        )}
      </span>
      
      {/* Label */}
      <span className={`relative z-10 ml-3 text-sm font-medium whitespace-nowrap transition-all duration-300 ${expanded ? 'opacity-100 translate-x-0' : 'lg:opacity-0 lg:-translate-x-4'}`}>
        {label}
      </span>
      
      {/* Active indicator dot when collapsed */}
      {isActive && !expanded && (
        <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
      )}
    </Link>
  );
}