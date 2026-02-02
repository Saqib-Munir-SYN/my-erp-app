/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useMemo, useEffect, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Users, 
  DollarSign, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

// Unified color palette
const COLORS = {
  emerald: '#10b981',
  violet: '#8b5cf6',
  blue: '#3b82f6',
  amber: '#f59e0b',
  rose: '#f43f5e',
  slate: isDark => isDark ? '#475569' : '#94a3b8'
};

export default function Dashboard() {
  const { products, customers, orders, invoices, globalSearch, loading } = useApp();
  const { isDark } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Real calculations from your data
  const stats = useMemo(() => {
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalCollected = invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
    const pendingAmount = totalRevenue - totalCollected;
    const lowStockProducts = products.filter(p => p.stock < 10).length;
    const overdueInvoices = invoices.filter(inv => {
      if (inv.status === 'paid') return false;
      const due = new Date(inv.dueDate);
      return !isNaN(due) && due < new Date();
    }).length;

    return {
      totalRevenue,
      totalCollected,
      pendingAmount,
      totalCustomers: customers.length,
      totalOrders: orders.length,
      lowStockProducts,
      overdueInvoices,
      productCount: products.length
    };
  }, [products, customers, orders, invoices]);

  // Chart data from real orders
  const salesData = useMemo(() => {
    const last6Months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = d.toLocaleString('default', { month: 'short' });
      const monthOrders = orders.filter(o => {
        const oDate = new Date(o.createdAt);
        return oDate.getMonth() === d.getMonth() && oDate.getFullYear() === d.getFullYear();
      });
      const monthInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.createdAt);
        return invDate.getMonth() === d.getMonth() && invDate.getFullYear() === d.getFullYear();
      });
      
      last6Months.push({
        name: monthKey,
        orders: monthOrders.length,
        revenue: monthInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0),
        collected: monthInvoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0)
      });
    }
    return last6Months;
  }, [orders, invoices]);

  const inventoryStatus = useMemo(() => [
    { name: 'In Stock', value: products.filter(p => p.stock >= 20).length, color: COLORS.emerald },
    { name: 'Low Stock', value: products.filter(p => p.stock > 0 && p.stock < 20).length, color: COLORS.amber },
    { name: 'Out of Stock', value: products.filter(p => p.stock === 0).length, color: COLORS.rose },
  ], [products]);

  const recentActivity = useMemo(() => {
    const activities = [
      ...orders.slice(-3).map(o => ({
        id: `ord-${o.id}`,
        type: 'order',
        title: `New order ${o.orderNumber}`,
        subtitle: `From ${customers.find(c => c.id === o.customerId)?.name || 'Unknown'}`,
        amount: `$${(o.total || 0).toFixed(2)}`,
        time: new Date(o.createdAt).toLocaleDateString(),
        icon: Package,
        color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
      })),
      ...invoices.slice(-3).map(inv => ({
        id: `inv-${inv.id}`,
        type: 'invoice',
        title: `Invoice ${inv.invoiceNumber} ${inv.status}`,
        subtitle: inv.status === 'paid' ? 'Payment received' : 'Awaiting payment',
        amount: `$${(inv.total || 0).toFixed(2)}`,
        time: new Date(inv.createdAt).toLocaleDateString(),
        icon: DollarSign,
        color: inv.status === 'paid' ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'
      }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);
    
    return activities;
  }, [orders, invoices, customers]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl lg:text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Dashboard
          </h1>
          <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Welcome back! Here's what's happening with your business.
          </p>
        </div>
        {globalSearch && (
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
            <span>🔍</span>
            <span>Filtered by: "{globalSearch}"</span>
            <button 
              onClick={() => {/* clear search */}}
              className="ml-1 hover:text-emerald-500"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`$${stats.totalRevenue.toLocaleString()}`}
          change="+12.5%"
          trend="up"
          icon={DollarSign}
          color="emerald"
          isDark={isDark}
        />
        <StatCard 
          title="Pending Collection" 
          value={`$${stats.pendingAmount.toLocaleString()}`}
          change="+5.2%"
          trend="up"
          icon={TrendingUp}
          color="violet"
          isDark={isDark}
        />
        <StatCard 
          title="Active Customers" 
          value={stats.totalCustomers}
          change="+8.1%"
          trend="up"
          icon={Users}
          color="blue"
          isDark={isDark}
        />
        <StatCard 
          title="Low Stock Items" 
          value={stats.lowStockProducts}
          change={stats.lowStockProducts > 0 ? "Needs attention" : "All good"}
          trend={stats.lowStockProducts > 0 ? "down" : "up"}
          icon={AlertCircle}
          color={stats.lowStockProducts > 0 ? "rose" : "emerald"}
          isDark={isDark}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Revenue Chart */}
        <div className={`lg:col-span-2 rounded-2xl border p-4 lg:p-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>Revenue Overview</h3>
            <select className={`text-xs rounded-lg px-2 py-1 border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-64 sm:h-80">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.violet} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.violet} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke={isDark ? '#64748b' : '#94a3b8'} 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke={isDark ? '#64748b' : '#94a3b8'} 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value/1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#0f172a' : '#fff', 
                      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => [`$${value.toLocaleString()}`, '']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={COLORS.emerald} 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="collected" 
                    stroke={COLORS.violet} 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorCollected)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Inventory Status */}
        <div className={`rounded-2xl border p-4 lg:p-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h3 className={`font-bold text-lg mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Inventory Status</h3>
          <div className="h-64">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventoryStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {inventoryStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#0f172a' : '#fff', 
                      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, 
                      borderRadius: '8px' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-4 space-y-2">
            {inventoryStatus.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>{item.name}</span>
                </div>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Recent Activity */}
        <div className={`rounded-2xl border p-4 lg:p-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>Recent Activity</h3>
            <button className={`text-xs font-medium ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'}`}>
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activity.color}`}>
                    <activity.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {activity.title}
                    </p>
                    <p className={`text-xs truncate ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                      {activity.subtitle}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {activity.amount}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className={`text-center py-8 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                No recent activity
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`rounded-2xl border p-4 lg:p-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h3 className={`font-bold text-lg mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickActionButton 
              icon={Package}
              label="New Order"
              color="emerald"
              isDark={isDark}
              onClick={() => window.location.href = '/orders'}
            />
            <QuickActionButton 
              icon={Users}
              label="Add Customer"
              color="blue"
              isDark={isDark}
              onClick={() => window.location.href = '/customers'}
            />
            <QuickActionButton 
              icon={DollarSign}
              label="Create Invoice"
              color="violet"
              isDark={isDark}
              onClick={() => window.location.href = '/invoices'}
            />
            <QuickActionButton 
              icon={TrendingUp}
              label="View Reports"
              color="amber"
              isDark={isDark}
              onClick={() => {/* TODO */}}
            />
          </div>

          {/* Alerts */}
          {stats.overdueInvoices > 0 && (
            <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className={`font-semibold text-sm ${isDark ? 'text-rose-400' : 'text-rose-700'}`}>
                  {stats.overdueInvoices} Overdue Invoice{stats.overdueInvoices !== 1 ? 's' : ''}
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-rose-400/70' : 'text-rose-600'}`}>
                  Action required to avoid cash flow issues.
                </p>
              </div>
            </div>
          )}
          
          {stats.lowStockProducts > 0 && (
            <div className="mt-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className={`font-semibold text-sm ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                  {stats.lowStockProducts} Low Stock Alert{stats.lowStockProducts !== 1 ? 's' : ''}
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-amber-400/70' : 'text-amber-600'}`}>
                  Restock soon to avoid out-of-stock situations.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Components
function StatCard({ title, value, change, trend, icon: Icon, color, isDark }) {
  const colors = {
    emerald: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
    violet: 'text-violet-500 bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/20',
    blue: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20',
    rose: 'text-rose-500 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20',
    amber: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
  };

  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : null;

  return (
    <div className={`rounded-2xl border p-6 transition-all duration-200 hover:shadow-lg ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {TrendIcon && (
          <div className={`flex items-center gap-1 text-xs font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
            <TrendIcon className="w-3 h-3" />
            <span>{change}</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{title}</p>
        <p className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
      </div>
    </div>
  );
}

function QuickActionButton({ icon: Icon, label, color, isDark, onClick }) {
  const colors = {
    emerald: 'hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-500/10 dark:hover:border-emerald-500/30',
    blue: 'hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-500/10 dark:hover:border-blue-500/30',
    violet: 'hover:bg-violet-50 hover:border-violet-200 dark:hover:bg-violet-500/10 dark:hover:border-violet-500/30',
    amber: 'hover:bg-amber-50 hover:border-amber-200 dark:hover:bg-amber-500/10 dark:hover:border-amber-500/30',
  };

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${colors[color]} ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
    >
      <Icon className={`w-6 h-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} />
      <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{label}</span>
    </button>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 lg:space-y-8 animate-pulse">
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    </div>
  );
}