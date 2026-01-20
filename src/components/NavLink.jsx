import { Link, useLocation } from 'react-router-dom';

export function NavLink({ to, icon, label, expanded }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center justify-center px-3 py-3 rounded-lg transition-all duration-200 w-full ${
        isActive
          ? 'bg-blue-500 text-white shadow-lg'
          : 'hover:bg-slate-800/50 text-white'
      }`}
    >
      <span className="text-xl shrink-0">{icon}</span>
      {expanded && (
        <span className="ml-3 text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
          {label}
        </span>
      )}
    </Link>
  );
}