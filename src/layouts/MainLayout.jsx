import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { NavLink } from '../components/NavLink';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingBag, 
  ShoppingCart, 
  FileText, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Search, 
  Bell,
  Zap,
  Hexagon,
  User
} from 'lucide-react';

export default function MainLayout({ children }) {
  const { globalSearch, setGlobalSearch } = useApp();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showApiInfo, setShowApiInfo] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setGlobalSearch(e.target.value);
  }, [setGlobalSearch]);

  // Navigation items with Lucide icons
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/inventory', label: 'Inventory', icon: Package },
    { path: '/customers', label: 'Customers', icon: Users },
    { path: '/products', label: 'Products', icon: ShoppingBag },
    { path: '/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/invoices', label: 'Invoices', icon: FileText },
  ];

  return (
    <div className={`min-h-screen font-sans antialiased ${isDark ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarExpanded ? 'lg:w-64' : 'lg:w-20'}`}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-slate-800/50">
          <div className={`flex items-center gap-3 transition-all duration-300 w-full ${sidebarExpanded ? '' : 'lg:justify-center'}`}>
            {/* Geometric Logo */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-violet-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20">
              <Hexagon className="w-6 h-6" strokeWidth={2.5} />
            </div>
            
            {/* ERP Pro Text */}
            <div className={`overflow-hidden transition-all duration-300 ${sidebarExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0 lg:hidden'}`}>
              <span className="font-black text-xl text-white whitespace-nowrap tracking-tight">
                ERP<span className="text-emerald-400">Pro</span>
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              icon={item.icon}
              label={item.label}
              expanded={sidebarExpanded}
              onClick={() => setMobileMenuOpen(false)}
            />
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-800/50">
          <button
            onClick={() => setShowApiInfo(!showApiInfo)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200 ${sidebarExpanded ? '' : 'lg:justify-center'}`}
          >
            <Zap className="w-5 h-5 shrink-0" />
            {sidebarExpanded && (
              <>
                <span className="whitespace-nowrap text-sm font-medium flex-1 text-left">API Status</span>
                <span className="text-xs">{showApiInfo ? '▼' : '▶'}</span>
              </>
            )}
          </button>
          
          {showApiInfo && sidebarExpanded && (
            <div className="mt-2 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-300">Connected</span>
              </div>
              <p className="text-slate-500 font-mono text-[10px] truncate">
                {import.meta.env.VITE_API_URL || 'localhost:3000'}
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-20 min-h-screen flex flex-col transition-all duration-300">
        {/* Header */}
        <header className={`h-16 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 border-b transition-all duration-200 ${scrolled ? 'shadow-lg' : ''} ${isDark ? 'bg-slate-900/95 border-slate-800 backdrop-blur' : 'bg-white/95 border-slate-200 backdrop-blur'}`}>
          {/* Left: Mobile Menu + Search */}
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="relative max-w-md w-full hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search across all data..."
                value={globalSearch}
                onChange={handleSearchChange}
                className={`w-full pl-10 pr-4 py-2 rounded-xl border text-sm transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
              />
              {globalSearch && (
                <button 
                  onClick={() => setGlobalSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${isDark ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <button className={`relative p-2 rounded-xl transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            </button>

            {/* User Profile */}
            <div className={`flex items-center gap-3 pl-4 border-l ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="text-right hidden sm:block">
                <p className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Admin</p>
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>System Admin</p>
              </div>
    
              {/* User Icon with Status Dot */}
              <div className="relative">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                  <User className="w-5 h-5" />
                </div>
                {/* Online Status Dot */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Search */}
        <div className="sm:hidden px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={globalSearch}
              onChange={handleSearchChange}
              className={`w-full pl-10 pr-4 py-2 rounded-xl border text-sm ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
            />
          </div>
        </div>

        {/* Page Content */}
        <main className={`flex-1 p-4 lg:p-8 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}