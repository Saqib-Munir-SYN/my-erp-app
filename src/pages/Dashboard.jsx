import { useApp } from '../context/AppContext';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useMemo, useCallback } from 'react';

export default function Dashboard() {
  const { products, customers, globalSearch } = useApp();

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
          <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">
            {globalSearch ? `Showing results for "${globalSearch}"` : 'Real-time metrics from your central ERP database.'}
          </p>
        </div>
        {globalSearch && (
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-4 py-2 rounded-full">
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
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Sales Trend (12 Months)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} isAnimationActive={false} />
              <Line type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={2} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products Chart */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Top Products by Stock</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProductsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="stock" fill="#3b82f6" radius={[8, 8, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* INVENTORY STATUS & CUSTOMER GROWTH */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Status Pie Chart */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Inventory Status</h2>
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
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Customer Growth Chart */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Customer Growth Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Line type="monotone" dataKey="orders" stroke="#ec4899" strokeWidth={3} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RECENT ORDERS & INVENTORY BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Orders</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-150">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">Order #{order.id}</p>
                  <p className="text-sm text-slate-600 truncate">{order.customer}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-bold text-slate-900">{order.amount}</p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Inventory Breakdown</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredProducts.length > 0 ? (
              filteredProducts.slice(0, 5).map(p => (
                <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-150">
                  <span className="font-medium text-slate-700 truncate flex-1">{p.name}</span>
                  <div className="flex items-center gap-3 ml-4">
                    <div className="w-20 bg-slate-200 rounded-full h-2 shrink-0">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${p.stock < 10 ? 'bg-red-500' : p.stock < 20 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(p.stock, 30) * 3.33}%` }}
                      ></div>
                    </div>
                    <span className={`${p.stock < 10 ? 'text-red-600' : 'text-slate-500'} font-bold text-sm min-w-fit`}>{p.stock}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400 text-sm">No products match your search</div>
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

// Enhanced StatCard with trend
function StatCard({ label, value, icon, color, bg, trend }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className={`${bg} ${color} w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-4`}>
        {icon}
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <h2 className="text-3xl font-black text-slate-900 mt-1">{value}</h2>
      <p className="text-green-600 text-sm font-semibold mt-2">{trend}</p>
    </div>
  );
}