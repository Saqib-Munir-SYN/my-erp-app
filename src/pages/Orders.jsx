import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

const ITEMS_PER_PAGE = 10;

export default function Orders() {
  const { orders, addOrder, updateOrder, deleteOrder, customers, products } = useApp();
  const { isDark } = useTheme();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    customerId: "",
    items: [],
    discountAmount: 0,
    taxRate: 10,
    shippingCost: 0,
    status: "draft"
  });

  const filteredOrders = orders.filter(o => 
    o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const openAddModal = () => {
    setEditingOrder(null);
    setFormData({
      customerId: "",
      items: [],
      discountAmount: 0,
      taxRate: 10,
      shippingCost: 0,
      status: "draft"
    });
    setIsModalOpen(true);
  };

  const openEditModal = (order) => {
    setEditingOrder(order);
    setFormData({
      customerId: order.customerId,
      items: order.items || [],
      discountAmount: order.discountAmount || 0,
      taxRate: order.taxRate || 10,
      shippingCost: order.shippingCost || 0,
      status: order.status || "draft"
    });
    setIsModalOpen(true);
  };

  const calculateOrderTotal = () => {
    const subtotal = formData.items.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const qty = parseInt(item.quantity) || 0;
      const discount = parseFloat(item.discount) || 0;
      return sum + (price * qty * (1 - discount / 100));
    }, 0);
    
    const tax = subtotal * (parseFloat(formData.taxRate) / 100);
    const shipping = parseFloat(formData.shippingCost) || 0;
    const discount = parseFloat(formData.discountAmount) || 0;
    
    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: (subtotal + tax + shipping - discount).toFixed(2)
    };
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: "", quantity: 1, price: 0, discount: 0 }]
    });
  };

  const handleRemoveItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    if (field === 'productId') {
      const product = products.find(p => p.id === parseInt(value));
      if (product) {
        newItems[index].price = 50 + Math.random() * 100;
      }
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const handleSave = (e) => {
    e.preventDefault();
    const totals = calculateOrderTotal();
    
    if (editingOrder) {
      updateOrder({
        ...editingOrder,
        ...formData,
        subtotal: parseFloat(totals.subtotal),
        tax: parseFloat(totals.tax),
        total: parseFloat(totals.total)
      });
    } else {
      addOrder({
        ...formData,
        subtotal: parseFloat(totals.subtotal),
        tax: parseFloat(totals.tax),
        total: parseFloat(totals.total)
      });
    }
    
    setIsModalOpen(false);
    setCurrentPage(1);
  };

  const getStatusColor = (status) => {
    const colors = {
      'draft': isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700',
      'confirmed': isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700',
      'shipped': isDark ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-700',
      'invoiced': isDark ? 'bg-emerald-900 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
    };
    return colors[status] || colors['draft'];
  };

  const getCustomerName = (customerId) => {
    return customers.find(c => c.id === parseInt(customerId))?.name || 'Unknown';
  };

  const totals = calculateOrderTotal();

  return (
    <div className="space-y-6">
      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Sales Orders
          </h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Create and manage customer orders
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input 
              type="text"
              placeholder="Search orders..."
              className={`pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none w-64 text-sm shadow-sm ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <button 
            onClick={openAddModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-bold transition-all shadow-lg shadow-emerald-100"
          >
            + New Order
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className={`rounded-2xl shadow-sm overflow-hidden border ${
        isDark
          ? 'bg-slate-800 border-slate-700'
          : 'bg-white border-slate-200'
      }`}>
        <table className="w-full text-left">
          <thead className={`text-xs uppercase font-bold tracking-widest border-b ${
            isDark
              ? 'bg-slate-700 border-slate-600 text-slate-300'
              : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <tr>
              <th className="p-4">Order #</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className={isDark ? 'divide-y divide-slate-700' : 'divide-y divide-slate-100'}>
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((o) => (
                <tr key={o.id} className={`transition-colors ${
                  isDark
                    ? 'hover:bg-slate-700 border-slate-700'
                    : 'hover:bg-slate-50/50 border-slate-100'
                }`}>
                  <td className={`p-4 font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {o.orderNumber}
                  </td>
                  <td className={`p-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {getCustomerName(o.customerId)}
                  </td>
                  <td className="p-4 font-bold text-emerald-600">
                    ${o.total?.toFixed(2) || '0.00'}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${getStatusColor(o.status)}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className={`p-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right space-x-1">
                    <button 
                      onClick={() => openEditModal(o)} 
                      className="px-3 py-1.5 text-emerald-600 font-bold text-xs hover:bg-emerald-50 rounded-lg uppercase tracking-tighter"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm('Delete this order?')) deleteOrder(o.id);
                      }} 
                      className={`px-3 py-1.5 font-bold text-xs rounded-lg uppercase tracking-tighter ${
                        isDark
                          ? 'text-slate-400 hover:text-red-400 hover:bg-slate-700'
                          : 'text-slate-400 hover:bg-red-50 hover:text-red-600'
                      }`}
                    >
                      Del
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className={`p-12 text-center italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className={`flex items-center justify-between p-4 rounded-2xl border ${
          isDark
            ? 'bg-slate-800 border-slate-700'
            : 'bg-white border-slate-200'
        }`}>
          <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-lg font-bold text-sm transition-all disabled:opacity-50 ${
                isDark
                  ? 'border border-slate-600 hover:bg-slate-700 text-slate-300'
                  : 'border border-slate-200 hover:bg-slate-50 text-slate-900'
              }`}
            >
              ← Prev
            </button>
            <button 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-lg font-bold text-sm transition-all disabled:opacity-50 ${
                isDark
                  ? 'border border-slate-600 hover:bg-slate-700 text-slate-300'
                  : 'border border-slate-200 hover:bg-slate-50 text-slate-900'
              }`}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-4xl rounded-3xl shadow-2xl border overflow-y-auto max-h-[90vh] ${
            isDark
              ? 'bg-slate-800 border-slate-700'
              : 'bg-white border-slate-100'
          }`}>
            <div className="p-8">
              <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {editingOrder ? "Edit Order" : "Create New Order"}
              </h2>

              <form onSubmit={handleSave} className="space-y-6">
                {/* Customer Selection */}
                <div>
                  <label className={`block text-xs font-bold uppercase mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Customer *
                  </label>
                  <select 
                    value={formData.customerId}
                    onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                    className={`w-full p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none border ${
                      isDark
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                    required
                  >
                    <option value="">Select a customer</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                    ))}
                  </select>
                </div>

                {/* Order Items */}
                <div>
                  <label className={`block text-xs font-bold uppercase mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Order Items
                  </label>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {formData.items.map((item, idx) => (
                      <div key={idx} className={`p-4 rounded-lg border flex gap-3 ${
                        isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <select 
                          value={item.productId}
                          onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                          className={`flex-1 px-3 py-2 rounded border text-sm ${
                            isDark
                              ? 'bg-slate-800 border-slate-600 text-white'
                              : 'bg-white border-slate-200 text-slate-900'
                          }`}
                        >
                          <option value="">Select product</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                        <input 
                          type="number" 
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          placeholder="Qty"
                          className={`w-20 px-3 py-2 rounded border text-sm ${
                            isDark
                              ? 'bg-slate-800 border-slate-600 text-white'
                              : 'bg-white border-slate-200 text-slate-900'
                          }`}
                        />
                        <input 
                          type="number" 
                          step="0.01"
                          value={item.price}
                          onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                          placeholder="Price"
                          className={`w-24 px-3 py-2 rounded border text-sm ${
                            isDark
                              ? 'bg-slate-800 border-slate-600 text-white'
                              : 'bg-white border-slate-200 text-slate-900'
                          }`}
                        />
                        <input 
                          type="number" 
                          min="0"
                          max="100"
                          value={item.discount}
                          onChange={(e) => handleItemChange(idx, 'discount', e.target.value)}
                          placeholder="Disc %"
                          className={`w-24 px-3 py-2 rounded border text-sm ${
                            isDark
                              ? 'bg-slate-800 border-slate-600 text-white'
                              : 'bg-white border-slate-200 text-slate-900'
                          }`}
                        />
                        <button 
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="px-3 py-2 text-red-600 font-bold text-sm hover:bg-red-50 rounded"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <button 
                    type="button"
                    onClick={handleAddItem}
                    className="mt-3 px-4 py-2 text-emerald-600 font-bold text-sm hover:bg-emerald-50 rounded-lg border border-emerald-300"
                  >
                    + Add Item
                  </button>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Discount %
                    </label>
                    <input 
                      type="number" 
                      min="0"
                      step="0.01"
                      value={formData.discountAmount}
                      onChange={(e) => setFormData({...formData, discountAmount: e.target.value})}
                      className={`w-full px-3 py-2 rounded border text-sm ${
                        isDark
                          ? 'bg-slate-700 border-slate-600 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Tax %
                    </label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={formData.taxRate}
                      onChange={(e) => setFormData({...formData, taxRate: e.target.value})}
                      className={`w-full px-3 py-2 rounded border text-sm ${
                        isDark
                          ? 'bg-slate-700 border-slate-600 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Shipping
                    </label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={formData.shippingCost}
                      onChange={(e) => setFormData({...formData, shippingCost: e.target.value})}
                      className={`w-full px-3 py-2 rounded border text-sm ${
                        isDark
                          ? 'bg-slate-700 border-slate-600 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Totals */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Subtotal:</span>
                      <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        ${totals.subtotal}
                      </div>
                    </div>
                    <div>
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Tax:</span>
                      <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        ${totals.tax}
                      </div>
                    </div>
                    <div>
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Total:</span>
                      <div className="text-lg font-bold text-emerald-600">
                        ${totals.total}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className={`block text-xs font-bold uppercase mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Status
                  </label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className={`w-full p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none border ${
                      isDark
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="draft">Draft</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="invoiced">Invoiced</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                      isDark
                        ? 'bg-slate-700 hover:bg-slate-600 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition-all"
                  >
                    Save Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
