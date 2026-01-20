import { useCallback, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { NavLink } from '../components/NavLink';
import logo from '../assets/logo.svg';

export default function MainLayout({ children }) {
  const { globalSearch, setGlobalSearch } = useApp();
  const [showApiInfo, setShowApiInfo] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const handleSearchChange = useCallback((e) => {
    setGlobalSearch(e.target.value);
  }, [setGlobalSearch]);

  const handleSidebarEnter = useCallback(() => {
    setSidebarExpanded(true);
  }, []);

  const handleSidebarLeave = useCallback(() => {
    setSidebarExpanded(false);
  }, []);

  const navItems = useMemo(() => [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/inventory', label: 'Inventory', icon: '📦' },
    { path: '/customers', label: 'Customers', icon: '👥' },
    { path: '/products', label: 'Products', icon: '🛍️' },
  ], []);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* SIDEBAR */}
      <nav
        onMouseEnter={handleSidebarEnter}
        onMouseLeave={handleSidebarLeave}
        className={`${
          sidebarExpanded ? 'w-64' : 'w-20'
        } text-white p-4 shadow-2xl sticky top-0 h-screen overflow-y-auto transition-all duration-300 ease-in-out flex flex-col`}
        style={{
          willChange: 'width',
          background: 'linear-gradient(to bottom, #0f172a, #020617)'
        }}
      >
        {/* Logo/Brand - CENTERED */}
        <div className="mb-8 flex items-center justify-center h-12">
          {sidebarExpanded ? (
            <h2 
              className="text-2xl font-black bg-clip-text text-transparent whitespace-nowrap"
              style={{
                backgroundImage: 'linear-gradient(to right, #60a5fa, #818cf8)'
              }}
            >
              ERP Pro
            </h2>
          ) : (
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-black text-lg shrink-0"
              style={{
                background: 'linear-gradient(135deg, #60a5fa, #4f46e5)'
              }}
            >
              E
            </div>
          )}
        </div>

        {/* Navigation Links - CENTERED ICONS */}
        <ul className="space-y-2 mb-8 flex-1">
          {navItems.map((item) => (
            <li key={item.path} className="flex justify-center">
              <div className="w-full">
                <NavLink
                  to={item.path}
                  icon={item.icon}
                  label={item.label}
                  expanded={sidebarExpanded}
                />
              </div>
            </li>
          ))}
        </ul>

        {/* API Integration Info - CENTERED */}
        <div className="border-t border-slate-700 pt-4 mt-auto flex flex-col items-center w-full">
          <button
            onClick={() => setShowApiInfo(!showApiInfo)}
            className={`${
              sidebarExpanded ? 'w-full' : 'w-10 h-10'
            } flex items-center justify-center rounded-xl hover:bg-slate-800/50 transition-colors text-xs font-medium text-slate-300 p-2`}
            type="button"
          >
            <span className="text-lg">🔌</span>
            {sidebarExpanded && (
              <>
                <span className="ml-2 flex-1 text-left">API</span>
                <span className="text-slate-500">{showApiInfo ? '▼' : '▶'}</span>
              </>
            )}
          </button>
          {showApiInfo && sidebarExpanded && (
            <div className="bg-slate-800/50 rounded-lg p-3 text-[11px] text-slate-300 space-y-2 border border-slate-700 mt-2 w-full">
              <p className="font-bold text-slate-200">Base URL</p>
              <p className="font-mono text-blue-400 text-[10px] break-all">
                {import.meta.env.VITE_API_URL || 'localhost:3000/api'}
              </p>
            </div>
          )}
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm sticky top-0 z-40">
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input
                type="text"
                placeholder="Search..."
                value={globalSearch}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-sm transition-all duration-150"
              />
            </div>
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-6 ml-8">
            {/* Logo Image */}
            {logo && (
              <img
                src={logo}
                alt="Company Logo"
                className="h-10 w-auto object-contain hover:opacity-80 transition-opacity"
              />
            )}

            {/* User Profile */}
            <div className="hidden md:flex items-center gap-3 pl-6 border-l border-slate-200">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black text-white shadow-lg shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #60a5fa, #4f46e5)'
                }}
              >
                AD
              </div>
              <div>
                <p className="text-slate-700 font-bold text-sm">Admin</p>
                <p className="text-slate-400 text-xs">System Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}