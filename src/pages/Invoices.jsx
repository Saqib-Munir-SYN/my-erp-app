import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import html2pdf from 'html2pdf.js';

const ITEMS_PER_PAGE = 10;

export default function Invoices() {
  const { invoices, updateInvoice, deleteInvoice, generateInvoiceFromOrder, customers, orders } = useApp();
  const { isDark } = useTheme();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({ method: 'credit_card', amount: 0 });
  const pdfRef = useRef();

  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedInvoices = filteredInvoices.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && dueDate;
  };

  const getStatusColor = (status) => {
    const colors = {
      'unpaid': isDark ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700',
      'partial': isDark ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-700',
      'paid': isDark ? 'bg-emerald-900 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
    };
    return colors[status] || colors['unpaid'];
  };

  const getCustomerName = (customerId) => {
    return customers.find(c => c.id === parseInt(customerId))?.name || 'Unknown';
  };

  const handlePayment = (invoice) => {
    setEditingInvoice(invoice);
    setPaymentData({ method: 'credit_card', amount: invoice.total - (invoice.amountPaid || 0) });
    setShowPaymentModal(true);
  };

  const recordPayment = () => {
    const amountPaid = (editingInvoice.amountPaid || 0) + parseFloat(paymentData.amount);
    const newStatus = amountPaid >= editingInvoice.total ? 'paid' : 'partial';
    
    updateInvoice({
      ...editingInvoice,
      amountPaid,
      status: newStatus,
      lastPaymentDate: new Date().toISOString(),
      lastPaymentMethod: paymentData.method
    });
    
    setShowPaymentModal(false);
    setEditingInvoice(null);
  };

  const exportToPDF = (invoice) => {
    const element = document.getElementById(`invoice-${invoice.id}`);
    if (!element) return;

    const opt = {
      margin: 10,
      filename: `${invoice.invoiceNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const handleGenerateFromOrder = (orderId) => {
    generateInvoiceFromOrder(orderId);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Invoices & Payments
          </h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Manage invoices, payments & AR tracking
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input 
              type="text"
              placeholder="Search invoices..."
              className={`pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-violet-500 outline-none w-64 text-sm shadow-sm ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="relative group">
            <button className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2 rounded-xl font-bold transition-all shadow-lg shadow-violet-100">
              + Actions ▼
            </button>
            <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg hidden group-hover:block z-10 ${
              isDark ? 'bg-slate-700 border border-slate-600' : 'bg-white border border-slate-200'
            }`}>
              <button className={`w-full text-left px-4 py-2 hover:bg-violet-600 hover:text-white rounded-t-lg ${
                isDark ? 'text-slate-300' : 'text-slate-900'
              }`}>
                📄 New Invoice
              </button>
              <button className={`w-full text-left px-4 py-2 hover:bg-violet-600 hover:text-white rounded-b-lg ${
                isDark ? 'text-slate-300' : 'text-slate-900'
              }`}>
                📦 From Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Invoices', value: invoices.length, icon: '📄', color: 'text-blue-600' },
          { label: 'Unpaid', value: invoices.filter(i => i.status === 'unpaid').length, icon: '⚠️', color: 'text-red-600' },
          { label: 'Partial', value: invoices.filter(i => i.status === 'partial').length, icon: '⏳', color: 'text-yellow-600' },
          { label: 'Paid', value: invoices.filter(i => i.status === 'paid').length, icon: '✓', color: 'text-emerald-600' }
        ].map((stat, idx) => (
          <div key={idx} className={`p-4 rounded-xl shadow-sm border ${
            isDark
              ? 'bg-slate-800 border-slate-700'
              : 'bg-white border-slate-200'
          }`}>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.icon}</div>
            <p className={`text-xs uppercase font-bold mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {stat.label}
            </p>
            <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {stat.value}
            </p>
          </div>
        ))}
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
              <th className="p-4">Invoice #</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Paid</th>
              <th className="p-4">Status</th>
              <th className="p-4">Due Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className={isDark ? 'divide-y divide-slate-700' : 'divide-y divide-slate-100'}>
            {paginatedInvoices.length > 0 ? (
              paginatedInvoices.map((inv) => (
                <tr key={inv.id} className={`transition-colors ${
                  isDark
                    ? 'hover:bg-slate-700 border-slate-700'
                    : 'hover:bg-slate-50/50 border-slate-100'
                }`}>
                  <td className={`p-4 font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {inv.invoiceNumber}
                  </td>
                  <td className={`p-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {getCustomerName(inv.customerId)}
                  </td>
                  <td className="p-4 font-bold text-violet-600">
                    ${inv.total?.toFixed(2) || '0.00'}
                  </td>
                  <td className={`p-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    ${(inv.amountPaid || 0).toFixed(2)}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${getStatusColor(inv.status)}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className={`p-4 text-sm font-semibold ${
                    isOverdue(inv.dueDate) ? 'text-red-600' : isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {new Date(inv.dueDate).toLocaleDateString()}
                    {isOverdue(inv.dueDate) && <span className="ml-2">🔴 OVERDUE</span>}
                  </td>
                  <td className="p-4 text-right space-x-1">
                    {inv.status !== 'paid' && (
                      <button 
                        onClick={() => handlePayment(inv)} 
                        className="px-3 py-1.5 text-emerald-600 font-bold text-xs hover:bg-emerald-50 rounded-lg uppercase tracking-tighter"
                      >
                        Pay
                      </button>
                    )}
                    <button 
                      onClick={() => exportToPDF(inv)} 
                      className="px-3 py-1.5 text-blue-600 font-bold text-xs hover:bg-blue-50 rounded-lg uppercase tracking-tighter"
                    >
                      PDF
                    </button>
                    <button 
                      onClick={() => deleteInvoice(inv.id)} 
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
                <td colSpan="7" className={`p-12 text-center italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  No invoices found. Create one from an order.
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

      {/* PAYMENT MODAL */}
      {showPaymentModal && editingInvoice && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-3xl shadow-2xl border p-8 ${
            isDark
              ? 'bg-slate-800 border-slate-700'
              : 'bg-white border-slate-100'
          }`}>
            <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Record Payment
            </h2>

            <div className={`p-4 rounded-lg mb-6 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Invoice Amount</p>
              <p className="text-2xl font-bold text-violet-600">${editingInvoice.total?.toFixed(2)}</p>
              <p className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Already Paid</p>
              <p className={`text-lg font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                ${(editingInvoice.amountPaid || 0).toFixed(2)}
              </p>
              <p className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Remaining</p>
              <p className={`text-lg font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                ${(editingInvoice.total - (editingInvoice.amountPaid || 0)).toFixed(2)}
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); recordPayment(); }} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold uppercase mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Payment Method
                </label>
                <select 
                  value={paymentData.method}
                  onChange={(e) => setPaymentData({...paymentData, method: e.target.value})}
                  className={`w-full p-3 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none border ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="credit_card">💳 Credit Card</option>
                  <option value="bank_transfer">🏦 Bank Transfer</option>
                  <option value="check">✓ Check</option>
                  <option value="cash">💵 Cash</option>
                </select>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Payment Amount
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({...paymentData, amount: parseFloat(e.target.value)})}
                  max={editingInvoice.total - (editingInvoice.amountPaid || 0)}
                  className={`w-full p-3 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none border ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowPaymentModal(false)} 
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
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HIDDEN PDF TEMPLATE */}
      {paginatedInvoices.map(inv => (
        <div 
          key={inv.id}
          id={`invoice-${inv.id}`}
          className="hidden"
          style={{ padding: '20px', backgroundColor: 'white', color: 'black', fontFamily: 'Arial' }}
        >
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>INVOICE</h1>
            <p style={{ fontSize: '14px' }}><strong>Invoice Number:</strong> {inv.invoiceNumber}</p>
            <p style={{ fontSize: '14px' }}><strong>Date:</strong> {new Date(inv.createdAt).toLocaleDateString()}</p>
            <p style={{ fontSize: '14px' }}><strong>Due Date:</strong> {new Date(inv.dueDate).toLocaleDateString()}</p>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>Bill To:</h3>
            <p style={{ fontSize: '14px' }}>
              <strong>{getCustomerName(inv.customerId)}</strong><br />
              Customer ID: {inv.customerId}
            </p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #000' }}>
                <th style={{ textAlign: 'left', padding: '8px', fontSize: '12px' }}>Description</th>
                <th style={{ textAlign: 'center', padding: '8px', fontSize: '12px' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '8px', fontSize: '12px' }}>Unit Price</th>
                <th style={{ textAlign: 'right', padding: '8px', fontSize: '12px' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {inv.items?.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '8px', fontSize: '12px' }}>Product ID: {item.productId}</td>
                  <td style={{ textAlign: 'center', padding: '8px', fontSize: '12px' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right', padding: '8px', fontSize: '12px' }}>${item.price?.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '8px', fontSize: '12px' }}>
                    ${(item.quantity * item.price * (1 - (item.discount || 0) / 100)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginLeft: 'auto', width: '300px', marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #ddd' }}>
              <span>Subtotal:</span>
              <span>${inv.subtotal?.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #ddd' }}>
              <span>Tax ({inv.tax ? ((inv.tax / inv.subtotal) * 100).toFixed(0) : 0}%):</span>
              <span>${inv.tax?.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #ddd' }}>
              <span>Shipping:</span>
              <span>${inv.shipping?.toFixed(2) || '0.00'}</span>
            </div>
            {inv.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #ddd' }}>
                <span>Discount:</span>
                <span>-${inv.discount?.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', fontSize: '16px', fontWeight: 'bold' }}>
              <span>Total Due:</span>
              <span>${inv.total?.toFixed(2)}</span>
            </div>
          </div>

          {inv.amountPaid > 0 && (
            <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
              <p><strong>Amount Paid:</strong> ${inv.amountPaid?.toFixed(2)}</p>
              <p><strong>Balance Due:</strong> ${(inv.total - inv.amountPaid).toFixed(2)}</p>
              <p><strong>Payment Status:</strong> {inv.status}</p>
            </div>
          )}

          <div style={{ fontSize: '12px', color: '#666', marginTop: '30px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
            <p>Thank you for your business!</p>
            <p>Please remit payment by the due date. Late payments may incur additional charges.</p>
          </div>
        </div>
      ))}
    </div>
  );
}
