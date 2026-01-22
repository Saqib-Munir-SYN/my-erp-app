import { useCallback, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { NavLink } from '../components/NavLink';
import logo from '../assets/logo.svg';

export default function MainLayout({ children }) {
  const { globalSearch, setGlobalSearch } = useApp();
  const { isDark, toggleTheme } = useTheme();
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
    { path: '/orders', label: 'Orders', icon: '🛒' },
    { path: '/invoices', label: 'Invoices', icon: '🧾' },
  ], []);

  return (
    <div className={`flex min-h-screen font-sans ${isDark ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
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
        <header className={`h-20 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-b flex items-center justify-between px-8 shadow-sm sticky top-0 z-40`}>
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input
                type="text"
                placeholder="Search..."
                value={globalSearch}
                onChange={handleSearchChange}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all duration-150 ${
                  isDark 
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:bg-slate-700' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
                }`}
              />
            </div>
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-6 ml-8">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-colors hover:bg-opacity-80 ${
                isDark
                  ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              type="button"
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* Logo Image */}
            {logo && (
              <img
                src={logo}
                alt="Company Logo"
                className="h-10 w-auto object-contain hover:opacity-80 transition-opacity"
              />
            )}

            {/* User Profile */}
            <div className={`hidden md:flex items-center gap-3 pl-6 border-l ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black text-white shadow-lg shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #60a5fa, #4f46e5)'
                }}
              >
                AD
              </div>
              <div>
                <p className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Admin</p>
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>System Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className={`flex-1 p-8 overflow-y-auto ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}