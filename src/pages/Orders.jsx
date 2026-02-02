/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useMemo, useEffect, useCallback } from 'react';
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
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    customerId: "",
    items: [],
    discountAmount: 0,
    taxRate: 10,
    shippingCost: 0,
    status: "draft"
  });

  // ESC key handler
  useEffect(() => {
    if (!isModalOpen) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isModalOpen]);

  // Safe number parser
  const toNumber = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  const formatCurrency = useCallback((val) => toNumber(val).toFixed(2));

  // Memoized calculation
  const calculatedTotals = useMemo(() => {
    const subtotal = formData.items.reduce((sum, item) => {
      const price = toNumber(item.price);
      const qty = toNumber(item.quantity);
      const discount = toNumber(item.discount);
      return sum + (price * qty * (1 - discount / 100));
    }, 0);
    
    const taxRate = toNumber(formData.taxRate);
    const shipping = toNumber(formData.shippingCost);
    const discount = toNumber(formData.discountAmount);
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax + shipping - discount;
    
    return {
      subtotal: formatCurrency(subtotal),
      tax: formatCurrency(tax),
      total: formatCurrency(total),
      isValid: total >= 0
    };
  }, [formData.items, formData.taxRate, formData.shippingCost, formData.discountAmount, formatCurrency]);

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
    const term = searchTerm.toLowerCase();
    return orders.filter(o => 
      o.orderNumber?.toLowerCase().includes(term) ||
      customers.find(c => c.id === o.customerId)?.name?.toLowerCase().includes(term)
    );
  }, [orders, searchTerm, customers]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const validateForm = () => {
    const errors = {};
    if (!formData.customerId) errors.customerId = "Customer is required";
    if (formData.items.length === 0) errors.items = "At least one item is required";
    if (formData.items.some(item => !item.productId)) errors.items = "All items must have a product selected";
    
    const total = toNumber(calculatedTotals.total);
    if (total < 0) errors.total = "Total cannot be negative";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

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
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (order) => {
    setEditingOrder(order);
    setFormData({
      customerId: order.customerId || "",
      items: order.items?.map(item => ({
        ...item,
        price: toNumber(item.price),
        quantity: toNumber(item.quantity),
        discount: toNumber(item.discount)
      })) || [],
      discountAmount: toNumber(order.discountAmount),
      taxRate: toNumber(order.taxRate) || 10,
      shippingCost: toNumber(order.shippingCost),
      status: order.status || "draft"
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: "", quantity: 1, price: 0, discount: 0 }]
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      if (field === 'productId' && value) {
        const product = products.find(p => p.id === parseInt(value));
        if (product && product.price) {
          newItems[index].price = toNumber(product.price);
        }
      }
      
      return { ...prev, items: newItems };
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const orderData = {
        customerId: formData.customerId,
        items: formData.items.map(item => ({
          ...item,
          price: toNumber(item.price),
          quantity: toNumber(item.quantity),
          discount: toNumber(item.discount)
        })),
        discountAmount: toNumber(formData.discountAmount),
        taxRate: toNumber(formData.taxRate),
        shippingCost: toNumber(formData.shippingCost),
        subtotal: toNumber(calculatedTotals.subtotal),
        tax: toNumber(calculatedTotals.tax),
        total: toNumber(calculatedTotals.total),
        status: formData.status
      };

      if (editingOrder) {
        updateOrder({ ...editingOrder, ...orderData });
      } else {
        addOrder(orderData);
      }
      
      setIsModalOpen(false);
      setCurrentPage(1);
    } catch (err) {
      console.error('Save order error:', err);
      alert('Failed to save order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this order? This cannot be undone.')) {
      deleteOrder(id);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700',
      confirmed: isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700',
      shipped: isDark ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-700',
      invoiced: isDark ? 'bg-emerald-900 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
    };
    return colors[status] || colors.draft;
  };

  const getCustomerName = useCallback((customerId) => {
    return customers.find(c => c.id === parseInt(customerId))?.name || 'Unknown';
  }, [customers]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
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
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        <table className="w-full text-left">
          <thead className={`text-xs uppercase font-bold tracking-widest border-b ${
            isDark ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <tr>
              <th className="p-4">Order #</th>
              <th className="p-4">Customer</th>
              <th className="p-4 text-right">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className={isDark ? 'divide-y divide-slate-700' : 'divide-y divide-slate-100'}>
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) => (
                <tr key={order.id} className={`transition-colors ${
                  isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-50/50'
                }`}>
                  <td className={`p-4 font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {order.orderNumber}
                  </td>
                  <td className={`p-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {getCustomerName(order.customerId)}
                  </td>
                  <td className="p-4 font-bold text-emerald-600 text-right">
                    ${formatCurrency(order.total)}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className={`p-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="p-4 text-right space-x-1">
                    <button 
                      onClick={() => openEditModal(order)} 
                      className="px-3 py-1.5 text-emerald-600 font-bold text-xs hover:bg-emerald-50 rounded-lg uppercase tracking-tighter"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(order.id)} 
                      className={`px-3 py-1.5 font-bold text-xs rounded-lg uppercase tracking-tighter ${
                        isDark ? 'text-slate-400 hover:text-red-400 hover:bg-slate-700' : 'text-slate-400 hover:bg-red-50 hover:text-red-600'
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
                  {searchTerm ? 'No orders match your search.' : 'No orders found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className={`flex items-center justify-between p-4 rounded-2xl border ${
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-lg font-bold text-sm transition-all disabled:opacity-50 ${
                isDark ? 'border border-slate-600 hover:bg-slate-700 text-slate-300' : 'border border-slate-200 hover:bg-slate-50 text-slate-900'
              }`}
            >
              ← Prev
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-lg font-bold text-sm transition-all disabled:opacity-50 ${
                isDark ? 'border border-slate-600 hover:bg-slate-700 text-slate-300' : 'border border-slate-200 hover:bg-slate-50 text-slate-900'
              }`}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
        >
          <div className={`w-full max-w-4xl rounded-3xl shadow-2xl border overflow-y-auto max-h-[90vh] ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
          }`}>
            <div className="p-8">
              <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {editingOrder ? "Edit Order" : "Create New Order"}
              </h2>

              <form onSubmit={handleSave} className="space-y-6">
                {/* Customer */}
                <div>
                  <label className={`block text-xs font-bold uppercase mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Customer *
                  </label>
                  <select 
                    value={formData.customerId}
                    onChange={(e) => setFormData(prev => ({...prev, customerId: e.target.value}))}
                    className={`w-full p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none border ${
                      formErrors.customerId ? 'border-red-500' : isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="">Select a customer</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {formErrors.customerId && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.customerId}</p>
                  )}
                </div>

                {/* Items */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className={`block text-xs font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Order Items *
                    </label>
                    <button 
                      type="button"
                      onClick={handleAddItem}
                      className="text-xs text-emerald-600 font-bold hover:underline"
                    >
                      + Add Item
                    </button>
                  </div>
                  
                  {formErrors.items && (
                    <p className="text-red-500 text-xs mb-2">{formErrors.items}</p>
                  )}
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {formData.items.map((item, idx) => (
                      <div key={idx} className={`p-4 rounded-lg border flex gap-2 items-center ${
                        isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <select 
                          value={item.productId}
                          onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                          className={`flex-1 px-3 py-2 rounded border text-sm ${
                            isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'
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
                            isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'
                          }`}
                        />
                        <input 
                          type="number" 
                          step="0.01"
                          value={item.price}
                          onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                          placeholder="Price"
                          className={`w-24 px-3 py-2 rounded border text-sm ${
                            isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'
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
                            isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'
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
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Discount Amount
                    </label>
                    <input 
                      type="number" 
                      min="0"
                      step="0.01"
                      value={formData.discountAmount}
                      onChange={(e) => setFormData(prev => ({...prev, discountAmount: e.target.value}))}
                      className={`w-full px-3 py-2 rounded border text-sm ${
                        isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
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
                      onChange={(e) => setFormData(prev => ({...prev, taxRate: e.target.value}))}
                      className={`w-full px-3 py-2 rounded border text-sm ${
                        isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
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
                      onChange={(e) => setFormData(prev => ({...prev, shippingCost: e.target.value}))}
                      className={`w-full px-3 py-2 rounded border text-sm ${
                        isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
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
                        ${calculatedTotals.subtotal}
                      </div>
                    </div>
                    <div>
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Tax:</span>
                      <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        ${calculatedTotals.tax}
                      </div>
                    </div>
                    <div>
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Total:</span>
                      <div className="text-lg font-bold text-emerald-600">
                        ${calculatedTotals.total}
                      </div>
                    </div>
                  </div>
                  {formErrors.total && (
                    <p className="text-red-500 text-xs mt-2">{formErrors.total}</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className={`block text-xs font-bold uppercase mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Status
                  </label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({...prev, status: e.target.value}))}
                    className={`w-full p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none border ${
                      isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
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
                    disabled={isSubmitting}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                      isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !calculatedTotals.isValid}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Order'}
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