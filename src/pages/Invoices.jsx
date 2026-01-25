import { useState, useRef, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import html2pdf from 'html2pdf.js';

const ITEMS_PER_PAGE = 10;

const INVOICE_STATUSES = {
  draft: { label: 'Draft', color: (isDark) => isDark ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-600', icon: '📝' },
  sent: { label: 'Sent', color: (isDark) => isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700', icon: '✈️' },
  unpaid: { label: 'Unpaid', color: (isDark) => isDark ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700', icon: '⚠️' },
  partial: { label: 'Partial', color: (isDark) => isDark ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-700', icon: '⏳' },
  paid: { label: 'Paid', color: (isDark) => isDark ? 'bg-emerald-900 text-emerald-300' : 'bg-emerald-100 text-emerald-700', icon: '✓' },
  overdue: { label: 'Overdue', color: (isDark) => isDark ? 'bg-red-950 text-red-400' : 'bg-red-200 text-red-900', icon: '🔴' },
};

export default function Invoices() {
  const { invoices, updateInvoice, deleteInvoice, generateInvoiceFromOrder, customers, orders, recordPayment, createRecurringInvoice } = useApp();
  const { isDark } = useTheme();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPaymentHistory, setShowPaymentHistory] = useState(null);
  
  const [paymentData, setPaymentData] = useState({ 
    method: 'credit_card', 
    amount: 0,
    reference: '',
    notes: ''
  });

  const [templateData, setTemplateData] = useState({
    name: '',
    frequency: 'monthly', // monthly, quarterly, annual
  });

  const pdfRef = useRef();

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customers.find(c => c.id === inv.customerId)?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, filterStatus, customers]);

  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedInvoices = filteredInvoices.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  // Calculate stats
  const stats = useMemo(() => ({
    total: invoices.length,
    draft: invoices.filter(i => i.status === 'draft').length,
    sent: invoices.filter(i => i.status === 'sent').length,
    unpaid: invoices.filter(i => i.status === 'unpaid').length,
    partial: invoices.filter(i => i.status === 'partial').length,
    paid: invoices.filter(i => i.status === 'paid').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    totalAmount: invoices.reduce((sum, i) => sum + (i.total || 0), 0),
    amountCollected: invoices.reduce((sum, i) => sum + (i.amountPaid || 0), 0),
  }), [invoices]);

  const getCustomerName = (customerId) => {
    return customers.find(c => c.id === parseInt(customerId))?.name || 'Unknown';
  };

  const getOrderNumber = (orderId) => {
    return orders.find(o => o.id === parseInt(orderId))?.orderNumber || 'N/A';
  };

  const isOverdue = (dueDate, status) => {
    return status !== 'paid' && dueDate && new Date(dueDate) < new Date();
  };

  const handleGenerateFromOrder = (orderId) => {
    const invoice = generateInvoiceFromOrder(orderId);
    if (invoice) {
      setCurrentPage(1);
      // Auto-send notification
      setTimeout(() => {
        updateInvoice({
          id: invoice.id,
          status: 'sent',
          sentAt: new Date().toISOString()
        });
      }, 500);
    }
  };

  const handleSendInvoice = (invoice) => {
    updateInvoice({
      id: invoice.id,
      status: 'sent',
      sentAt: new Date().toISOString()
    });
  };

  const handlePaymentClick = (invoice) => {
    setEditingInvoice(invoice);
    setPaymentData({ 
      method: 'credit_card', 
      amount: parseFloat((invoice.total - (invoice.amountPaid || 0)).toFixed(2)),
      reference: '',
      notes: ''
    });
    setIsPaymentModalOpen(true);
  };

  const submitPayment = () => {
    if (!editingInvoice || !paymentData.amount || paymentData.amount <= 0) return;
    
    recordPayment(editingInvoice.id, paymentData);
    setIsPaymentModalOpen(false);
    setEditingInvoice(null);
    setPaymentData({ method: 'credit_card', amount: 0, reference: '', notes: '' });
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

  // Helper function to safely format numbers
  const toNumber = (val) => parseFloat(val) || 0;
  const formatCurrency = (val) => toNumber(val).toFixed(2);

  const handleCreateTemplate = () => {
    if (!editingInvoice || !templateData.name) return;
    createRecurringInvoice({
      ...editingInvoice,
      template: templateData.name,
      isRecurring: true,
      recurringFrequency: templateData.frequency,
      lastRecurringDate: new Date().toISOString()
    });
    setIsTemplateModalOpen(false);
    setTemplateData({ name: '', frequency: 'monthly' });
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
            Manage invoices, payments, and A/R tracking
          </p>
        </div>
        
        <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {[
          { label: 'Total', value: stats.total, icon: '📄', color: 'text-blue-600' },
          { label: 'Draft', value: stats.draft, icon: '📝', color: 'text-slate-600' },
          { label: 'Sent', value: stats.sent, icon: '✈️', color: 'text-cyan-600' },
          { label: 'Unpaid', value: stats.unpaid, icon: '⚠️', color: 'text-red-600' },
          { label: 'Partial', value: stats.partial, icon: '⏳', color: 'text-yellow-600' },
          { label: 'Paid', value: stats.paid, icon: '✓', color: 'text-emerald-600' },
          { label: 'Overdue', value: stats.overdue, icon: '🔴', color: 'text-red-700' },
          { label: 'Amount Due', value: `$${(stats.totalAmount - stats.amountCollected).toFixed(2)}`, icon: '💰', color: 'text-violet-600' }
        ].map((stat, idx) => (
          <div key={idx} className={`p-2 rounded-lg shadow-sm border text-xs ${
            isDark
              ? 'bg-slate-800 border-slate-700'
              : 'bg-white border-slate-200'
          }`}>
            <div className={`text-lg font-bold ${stat.color}`}>{stat.icon}</div>
            <p className={`text-[10px] uppercase font-bold mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {stat.label}
            </p>
            <p className={`text-sm font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* STATUS FILTER */}
      <div className="flex gap-2 flex-wrap">
        {['all', ...Object.keys(INVOICE_STATUSES)].map(status => (
          <button
            key={status}
            onClick={() => { setFilterStatus(status); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              filterStatus === status
                ? 'bg-violet-600 text-white shadow-lg'
                : isDark
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {status === 'all' ? '📋 All' : `${INVOICE_STATUSES[status].icon} ${INVOICE_STATUSES[status].label}`}
          </button>
        ))}
      </div>

      {/* GENERATE FROM ORDERS SECTION */}
      {orders.length > 0 && (
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <h3 className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>📦 Generate Invoices from Orders</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {orders.map(order => {
              const hasInvoice = invoices.some(inv => inv.orderId === order.id);
              return (
                <div key={order.id} className={`flex items-center justify-between p-3 rounded-lg ${
                  isDark ? 'bg-slate-700' : 'bg-slate-50'
                }`}>
                  <div className="flex-1">
                    <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {order.orderNumber} - {getCustomerName(order.customerId)}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      ${order.total?.toFixed(2)} • {order.status}
                    </p>
                  </div>
                  <button
                    onClick={() => handleGenerateFromOrder(order.id)}
                    disabled={hasInvoice}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-all ${
                      hasInvoice
                        ? 'bg-emerald-600 text-white cursor-not-allowed opacity-60'
                        : 'bg-violet-600 hover:bg-violet-700 text-white'
                    }`}
                  >
                    {hasInvoice ? '✓ Generated' : '+ Generate'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className={`rounded-2xl shadow-sm overflow-hidden border ${
        isDark
          ? 'bg-slate-800 border-slate-700'
          : 'bg-white border-slate-200'
      }`}>
        <table className="w-full text-left text-sm">
          <thead className={`text-xs uppercase font-bold tracking-widest border-b ${
            isDark
              ? 'bg-slate-700 border-slate-600 text-slate-300'
              : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <tr>
              <th className="p-4">Invoice #</th>
              <th className="p-4">Order #</th>
              <th className="p-4">Customer</th>
              <th className="p-4 text-right">Amount</th>
              <th className="p-4 text-right">Paid</th>
              <th className="p-4">Status</th>
              <th className="p-4">Due Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className={isDark ? 'divide-y divide-slate-700' : 'divide-y divide-slate-100'}>
            {paginatedInvoices.length > 0 ? (
              paginatedInvoices.map((inv) => {
                const statusConfig = INVOICE_STATUSES[inv.status] || INVOICE_STATUSES.draft;
                return (
                  <tr key={inv.id} className={`transition-colors ${
                    isDark
                      ? 'hover:bg-slate-700 border-slate-700'
                      : 'hover:bg-slate-50/50 border-slate-100'
                  }`}>
                    <td className={`p-4 font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {inv.invoiceNumber}
                    </td>
                    <td className={`p-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {getOrderNumber(inv.orderId)}
                    </td>
                    <td className={`p-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {getCustomerName(inv.customerId)}
                    </td>
                    <td className="p-4 font-bold text-violet-600 text-right">
                      ${inv.total?.toFixed(2) || '0.00'}
                    </td>
                    <td className={`p-4 text-sm text-right font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      ${(inv.amountPaid || 0).toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase inline-block ${statusConfig.color(isDark)}`}>
                        {statusConfig.icon} {statusConfig.label}
                      </span>
                    </td>
                    <td className={`p-4 text-sm font-semibold ${
                      isOverdue(inv.dueDate, inv.status) ? 'text-red-600 font-bold' : isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {inv.status === 'draft' && (
                          <button 
                            onClick={() => handleSendInvoice(inv)}
                            title="Send Invoice"
                            className="px-2 py-1.5 text-blue-600 font-bold text-xs hover:bg-blue-50 rounded-lg"
                          >
                            ✈️
                          </button>
                        )}
                        {inv.status !== 'paid' && (
                          <button 
                            onClick={() => handlePaymentClick(inv)}
                            title="Record Payment"
                            className="px-2 py-1.5 text-emerald-600 font-bold text-xs hover:bg-emerald-50 rounded-lg"
                          >
                            💰
                          </button>
                        )}
                        <button 
                          onClick={() => setShowPaymentHistory(showPaymentHistory === inv.id ? null : inv.id)}
                          title="Payment History"
                          className="px-2 py-1.5 text-cyan-600 font-bold text-xs hover:bg-cyan-50 rounded-lg"
                        >
                          📋
                        </button>
                        <button 
                          onClick={() => exportToPDF(inv)}
                          title="Export to PDF"
                          className="px-2 py-1.5 text-orange-600 font-bold text-xs hover:bg-orange-50 rounded-lg"
                        >
                          📄
                        </button>
                        <button 
                          onClick={() => { setEditingInvoice(inv); setIsTemplateModalOpen(true); }}
                          title="Create Template"
                          className="px-2 py-1.5 text-indigo-600 font-bold text-xs hover:bg-indigo-50 rounded-lg"
                        >
                          🎨
                        </button>
                        <button 
                          onClick={() => deleteInvoice(inv.id)}
                          title="Delete"
                          className={`px-2 py-1.5 font-bold text-xs rounded-lg ${
                            isDark
                              ? 'text-slate-400 hover:text-red-400 hover:bg-slate-700'
                              : 'text-slate-400 hover:bg-red-50 hover:text-red-600'
                          }`}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className={`p-12 text-center italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  No invoices found. Generate one from an order above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAYMENT HISTORY - EXPANDABLE ROWS */}
      {showPaymentHistory && (
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          {(() => {
            const invoice = invoices.find(i => i.id === showPaymentHistory);
            return invoice ? (
              <div>
                <h3 className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  💳 Payment History - {invoice.invoiceNumber}
                </h3>
                {invoice.paymentHistory && invoice.paymentHistory.length > 0 ? (
                  <div className="space-y-2">
                    {invoice.paymentHistory.map((payment, idx) => (
                      <div key={idx} className={`p-3 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              ${payment.amount.toFixed(2)} • {payment.method.replace('_', ' ')}
                            </p>
                            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {new Date(payment.date).toLocaleString()}
                            </p>
                            {payment.reference && (
                              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Ref: {payment.reference}
                              </p>
                            )}
                            {payment.notes && (
                              <p className={`text-xs mt-1 italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {payment.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No payment history yet.</p>
                )}
              </div>
            ) : null;
          })()}
        </div>
      )}

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

      {/* PAYMENT RECORDING MODAL */}
      {isPaymentModalOpen && editingInvoice && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-3xl shadow-2xl border p-8 ${
            isDark
              ? 'bg-slate-800 border-slate-700'
              : 'bg-white border-slate-100'
          }`}>
            <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              💰 Record Payment
            </h2>

            <div className={`p-4 rounded-lg mb-6 space-y-2 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Invoice Total</p>
                <p className="text-2xl font-bold text-violet-600">${editingInvoice.total?.toFixed(2)}</p>
              </div>
              <div className="pt-2 border-t border-slate-600">
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Already Paid</p>
                <p className={`text-lg font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                  ${(editingInvoice.amountPaid || 0).toFixed(2)}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-600">
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Remaining Balance</p>
                <p className={`text-lg font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  ${(editingInvoice.total - (editingInvoice.amountPaid || 0)).toFixed(2)}
                </p>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); submitPayment(); }} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold uppercase mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Payment Amount *
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({...paymentData, amount: parseFloat(e.target.value) || 0})}
                  max={editingInvoice.total - (editingInvoice.amountPaid || 0)}
                  className={`w-full p-3 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none border font-bold ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                  required
                />
              </div>

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
                  <option value="other">📌 Other</option>
                </select>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Reference Number (e.g., Check #, Transaction ID)
                </label>
                <input 
                  type="text"
                  value={paymentData.reference}
                  onChange={(e) => setPaymentData({...paymentData, reference: e.target.value})}
                  placeholder="Optional"
                  className={`w-full p-3 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none border ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Notes
                </label>
                <textarea 
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                  placeholder="Optional notes about this payment"
                  rows="2"
                  className={`w-full p-3 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none border resize-none ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsPaymentModalOpen(false)} 
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

      {/* INVOICE TEMPLATE MODAL */}
      {isTemplateModalOpen && editingInvoice && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-3xl shadow-2xl border p-8 ${
            isDark
              ? 'bg-slate-800 border-slate-700'
              : 'bg-white border-slate-100'
          }`}>
            <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              🎨 Create Invoice Template
            </h2>

            <form onSubmit={(e) => { e.preventDefault(); handleCreateTemplate(); }} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold uppercase mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Template Name *
                </label>
                <input 
                  type="text"
                  value={templateData.name}
                  onChange={(e) => setTemplateData({...templateData, name: e.target.value})}
                  placeholder="e.g., Monthly Service Invoice"
                  className={`w-full p-3 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none border ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Recurring Frequency
                </label>
                <select 
                  value={templateData.frequency}
                  onChange={(e) => setTemplateData({...templateData, frequency: e.target.value})}
                  className={`w-full p-3 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none border ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="weekly">📆 Weekly</option>
                  <option value="monthly">📅 Monthly</option>
                  <option value="quarterly">🗓️ Quarterly</option>
                  <option value="annual">📋 Annual</option>
                </select>
              </div>

              <p className={`text-xs italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                This template will be used to automatically generate recurring invoices.
              </p>

              <div className="flex gap-2 pt-4">
                <button 
                  type="button" 
                  onClick={() => { setIsTemplateModalOpen(false); setEditingInvoice(null); }} 
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
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all"
                >
                  Create Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HIDDEN PDF TEMPLATE */}
      {paginatedInvoices.map(inv => {
        const customer = customers.find(c => c.id === inv.customerId);
        return (
          <div 
            key={inv.id}
            id={`invoice-${inv.id}`}
            className="hidden"
            style={{ padding: '40px', backgroundColor: 'white', color: 'black', fontFamily: 'Arial, sans-serif' }}
          >
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#7c3aed', marginBottom: '5px' }}>INVOICE</h1>
                <p style={{ fontSize: '12px', color: '#666' }}>Invoice #{inv.invoiceNumber}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '12px', marginBottom: '5px' }}>
                  <strong>Date:</strong> {new Date(inv.createdAt).toLocaleDateString()}
                </p>
                <p style={{ fontSize: '12px', marginBottom: '5px' }}>
                  <strong>Due Date:</strong> {new Date(inv.dueDate).toLocaleDateString()}
                </p>
                <p style={{ fontSize: '12px' }}>
                  <strong>Status:</strong> {INVOICE_STATUSES[inv.status]?.label || inv.status}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
              <div>
                <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#333', marginBottom: '10px', textTransform: 'uppercase' }}>From:</h3>
                <p style={{ fontSize: '14px', fontWeight: 'bold' }}>ERP Pro</p>
                <p style={{ fontSize: '12px', color: '#666' }}>Your Company Address</p>
              </div>
              <div>
                <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#333', marginBottom: '10px', textTransform: 'uppercase' }}>Bill To:</h3>
                <p style={{ fontSize: '14px', fontWeight: 'bold' }}>{customer?.name}</p>
                <p style={{ fontSize: '12px', color: '#666' }}>{customer?.email}</p>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #7c3aed' }}>
                  <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px', fontWeight: 'bold', color: '#333' }}>Description</th>
                  <th style={{ textAlign: 'center', padding: '12px', fontSize: '12px', fontWeight: 'bold', color: '#333' }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: '12px', fontSize: '12px', fontWeight: 'bold', color: '#333' }}>Unit Price</th>
                  <th style={{ textAlign: 'right', padding: '12px', fontSize: '12px', fontWeight: 'bold', color: '#333' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {inv.items?.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px', fontSize: '12px' }}>Product ID: {item.productId}</td>
                    <td style={{ textAlign: 'center', padding: '12px', fontSize: '12px' }}>{toNumber(item.quantity)}</td>
                    <td style={{ textAlign: 'right', padding: '12px', fontSize: '12px' }}>${formatCurrency(item.price)}</td>
                    <td style={{ textAlign: 'right', padding: '12px', fontSize: '12px' }}>
                      ${formatCurrency(toNumber(item.quantity) * toNumber(item.price) * (1 - toNumber(item.discount) / 100))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginLeft: 'auto', width: '300px', marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #ddd', fontSize: '12px' }}>
                <span>Subtotal:</span>
                <span>${formatCurrency(inv.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #ddd', fontSize: '12px' }}>
                <span>Tax:</span>
                <span>${formatCurrency(inv.tax)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #ddd', fontSize: '12px' }}>
                <span>Shipping:</span>
                <span>${formatCurrency(inv.shipping)}</span>
              </div>
              {toNumber(inv.discount) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #ddd', fontSize: '12px' }}>
                  <span>Discount:</span>
                  <span>-${formatCurrency(inv.discount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', fontSize: '14px', fontWeight: 'bold', color: '#7c3aed' }}>
                <span>Total Due:</span>
                <span>${formatCurrency(inv.total)}</span>
              </div>
            </div>

            {toNumber(inv.amountPaid) > 0 && (
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f9ff', borderLeft: '4px solid #7c3aed' }}>
                <p style={{ fontSize: '12px', marginBottom: '5px' }}>
                  <strong>Amount Paid:</strong> ${formatCurrency(inv.amountPaid)}
                </p>
                <p style={{ fontSize: '12px', marginBottom: '5px' }}>
                  <strong>Balance Due:</strong> ${formatCurrency(toNumber(inv.total) - toNumber(inv.amountPaid))}
                </p>
              </div>
            )}

            <div style={{ fontSize: '11px', color: '#999', marginTop: '40px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
              <p>Thank you for your business! Please remit payment by the due date.</p>
              <p>Late payments may incur additional charges per your agreement.</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
