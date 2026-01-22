import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useMemo, useCallback } from 'react';

export default function Dashboard() {
  const { products, customers, globalSearch } = useApp();
  const { isDark } = useTheme();

  // Memoize all filtered data and calculations
  const { filteredProducts, filteredCustomers, totalStock, lowStockCount, topProductsData, categoryData } = useMemo(() => {
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(globalSearch.toLowerCase())
    );
    const filteredCusts = customers.filter(c =>
      c.name.toLowerCase().includes(globalSearch.toLowerCase())
    );

    return {
      filteredProducts: filtered,
      filteredCustomers: filteredCusts,
      totalStock: filtered.reduce((acc, item) => acc + (Number(item.stock) || 0), 0),
      lowStockCount: filtered.filter(p => p.stock < 10).length,
      topProductsData: filtered.slice(0, 5).map(p => ({
        name: p.name.substring(0, 15),
        stock: p.stock,
      })),
      categoryData: [
        { name: "In Stock", value: filtered.filter(p => p.stock > 20).length, color: '#10b981' },
        { name: "Low Stock", value: filtered.filter(p => p.stock > 0 && p.stock <= 20).length, color: '#f59e0b' },
        { name: "Out of Stock", value: filtered.filter(p => p.stock === 0).length, color: '#ef4444' },
      ],
    };
  }, [products, customers, globalSearch]);

  const salesTrendData = useMemo(() => [
    { month: 'Jan', sales: 4000, orders: 240 },
    { month: 'Feb', sales: 3000, orders: 221 },
    { month: 'Mar', sales: 2000, orders: 229 },
    { month: 'Apr', sales: 2780, orders: 200 },
    { month: 'May', sales: 1890, orders: 229 },
    { month: 'Jun', sales: 2390, orders: 200 },
    { month: 'Jul', sales: 3490, orders: 210 },
    { month: 'Aug', sales: 4200, orders: 290 },
    { month: 'Sep', sales: 3800, orders: 250 },
    { month: 'Oct', sales: 4100, orders: 270 },
    { month: 'Nov', sales: 4500, orders: 300 },
    { month: 'Dec', sales: 5200, orders: 350 },
  ], []);

  const recentOrders = useMemo(() => [
    { id: 1001, customer: 'John Doe', amount: '$1,250', status: 'Completed', date: '2 hours ago' },
    { id: 1002, customer: 'Jane Smith', amount: '$890', status: 'Pending', date: '4 hours ago' },
    { id: 1003, customer: 'Mike Johnson', amount: '$2,150', status: 'Processing', date: '1 day ago' },
    { id: 1004, customer: 'Sarah Lee', amount: '$450', status: 'Completed', date: '2 days ago' },
    { id: 1005, customer: 'Tom Wilson', amount: '$1,800', status: 'Pending', date: '3 days ago' },
  ], []);

  const getStatusColor = useCallback((status) => {
    const colors = {
      'Completed': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Processing': 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className={`text-4xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Dashboard</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {globalSearch ? `Showing results for "${globalSearch}"` : 'Real-time metrics from your central ERP database.'}
          </p>
        </div>
        {globalSearch && (
          <span className={`text-xs font-bold px-4 py-2 rounded-full ${isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
            🔍 Search Filter Active
          </span>
        )}
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Matching Stock" value={totalStock} icon="📦" color="text-blue-600" bg="bg-blue-50" trend="↑ 12%" />
        <StatCard label="Low Stock Alerts" value={lowStockCount} icon="⚠️" color="text-red-600" bg="bg-red-50" trend="↑ 5%" />
        <StatCard label="Matching Clients" value={filteredCustomers.length} icon="👥" color="text-indigo-600" bg="bg-indigo-50" trend="↑ 23%" />
        <StatCard label="Est. Segment Value" value="$4,200" icon="💰" color="text-emerald-600" bg="bg-emerald-50" trend="↓ 2%" />
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className={`rounded-xl shadow-md p-6 border hover:shadow-lg transition-shadow duration-300 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Sales Trend (12 Months)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#475569' : '#e2e8f0'} />
              <XAxis dataKey="month" stroke={isDark ? '#94a3b8' : '#64748b'} />
              <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} />
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#fff', border: '1px solid ' + (isDark ? '#475569' : '#e2e8f0'), borderRadius: '8px', color: isDark ? '#fff' : '#000' }} />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} isAnimationActive={false} />
              <Line type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={2} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products Chart */}
        <div className={`rounded-xl shadow-md p-6 border hover:shadow-lg transition-shadow duration-300 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Top Products by Stock</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProductsData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#475569' : '#e2e8f0'} />
              <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} />
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#fff', border: '1px solid ' + (isDark ? '#475569' : '#e2e8f0'), borderRadius: '8px', color: isDark ? '#fff' : '#000' }} />
              <Bar dataKey="stock" fill="#3b82f6" radius={[8, 8, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* INVENTORY STATUS & CUSTOMER GROWTH */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Status Pie Chart */}
        <div className={`rounded-xl shadow-md p-6 border hover:shadow-lg transition-shadow duration-300 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Inventory Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                isAnimationActive={false}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#fff', border: '1px solid ' + (isDark ? '#475569' : '#e2e8f0'), borderRadius: '8px', color: isDark ? '#fff' : '#000' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Customer Growth Chart */}
        <div className={`rounded-xl shadow-md p-6 border hover:shadow-lg transition-shadow duration-300 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Customer Growth Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#475569' : '#e2e8f0'} />
              <XAxis dataKey="month" stroke={isDark ? '#94a3b8' : '#64748b'} />
              <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} />
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#fff', border: '1px solid ' + (isDark ? '#475569' : '#e2e8f0'), borderRadius: '8px', color: isDark ? '#fff' : '#000' }} />
              <Line type="monotone" dataKey="orders" stroke="#ec4899" strokeWidth={3} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RECENT ORDERS & INVENTORY BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className={`p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow duration-300 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
          <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>Recent Orders</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentOrders.map(order => (
              <div key={order.id} className={`flex items-center justify-between p-3 rounded-lg hover:bg-opacity-50 transition-colors duration-150 ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'}`}>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Order #{order.id}</p>
                  <p className={`text-sm truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{order.customer}</p>
                </div>
                <div className="text-right ml-4">
                  <p className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{order.amount}</p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Breakdown */}
        <div className={`p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow duration-300 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
          <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>Inventory Breakdown</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredProducts.length > 0 ? (
              filteredProducts.slice(0, 5).map(p => (
                <div key={p.id} className={`flex justify-between items-center p-3 rounded-lg hover:bg-opacity-50 transition-colors duration-150 ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'}`}>
                  <span className={`font-medium truncate flex-1 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{p.name}</span>
                  <div className="flex items-center gap-3 ml-4">
                    <div className={`w-20 rounded-full h-2 shrink-0 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${p.stock < 10 ? 'bg-red-500' : p.stock < 20 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(p.stock, 30) * 3.33}%` }}
                      ></div>
                    </div>
                    <span className={`font-bold text-sm min-w-fit ${p.stock < 10 ? 'text-red-600' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>{p.stock}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className={`text-center py-10 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No products match your search</div>
            )}
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="flex flex-wrap gap-4 justify-center py-8">
        <button className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95">
          + New Order
        </button>
        <button className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95">
          + Add Customer
        </button>
        <button className="px-8 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95">
          📊 Generate Report
        </button>
        <button className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95">
          📦 Update Inventory
        </button>
      </div>
    </div>
  );
}

// Enhanced StatCard with theme support
function StatCard({ label, value, icon, color, bg, trend }) {
  const { isDark } = useTheme();
  
  const lightBg = bg === 'bg-blue-50' ? '#eff6ff' : bg === 'bg-red-50' ? '#fef2f2' : bg === 'bg-indigo-50' ? '#eef2ff' : '#f0fdf4';
  const darkBg = bg === 'bg-blue-50' ? '#1e3a8a' : bg === 'bg-red-50' ? '#7f1d1d' : bg === 'bg-indigo-50' ? '#3730a3' : '#064e3b';
  
  return (
    <div className={`p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow duration-300 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
      <div className={`${color} w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-4`} style={{ backgroundColor: isDark ? darkBg : lightBg }}>
        {icon}
      </div>
      <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
      <h2 className={`text-3xl font-black mt-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{value}</h2>
      <p className="text-green-600 text-sm font-semibold mt-2">{trend}</p>
    </div>
  );
}