/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  // 1. INITIALIZE: Try to get data from LocalStorage, or use defaults
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('erp_products');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: "Industrial Widget", SKU: "WID-01", stock: 5 },
      { id: 2, name: "Heavy Duty Motor", SKU: "MOT-02", stock: 8 },
    ];
  });

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('erp_customers');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: "Acme Corp", email: "billing@acme.com", status: "Active" },
    ];
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('erp_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem('erp_invoices');
    return saved ? JSON.parse(saved) : [];
  });

  const [globalSearch, setGlobalSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 2. PERSISTENCE: Save to LocalStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('erp_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('erp_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('erp_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('erp_customers', JSON.stringify(customers));
  }, [customers]);

  // 3. PRODUCT ACTIONS
  const addProduct = useCallback((item) => {
    const newProduct = {
      ...item,
      id: item.id || Date.now(),
      createdAt: new Date().toISOString(),
    };
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  }, []);

  const updateProduct = useCallback((updatedItem) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === updatedItem.id
          ? { ...p, ...updatedItem, updatedAt: new Date().toISOString() }
          : p
      )
    );
  }, []);

  const deleteProduct = useCallback((id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  // 4. CUSTOMER ACTIONS
  const addCustomer = useCallback((customer) => {
    const newCustomer = {
      ...customer,
      id: customer.id || Date.now(),
      createdAt: new Date().toISOString(),
    };
    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer;
  }, []);

  const updateCustomer = useCallback((updatedCustomer) => {
    setCustomers(prev =>
      prev.map(c =>
        c.id === updatedCustomer.id
          ? { ...c, ...updatedCustomer, updatedAt: new Date().toISOString() }
          : c
      )
    );
  }, []);

  const deleteCustomer = useCallback((id) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  }, []);

  // 6. ORDER ACTIONS
  const addOrder = useCallback((order) => {
    const newOrder = {
      ...order,
      id: order.id || Date.now(),
      orderNumber: `ORD-${Date.now()}`,
      status: order.status || 'draft',
      createdAt: new Date().toISOString(),
    };
    setOrders(prev => [...prev, newOrder]);
    return newOrder;
  }, []);

  const updateOrder = useCallback((updatedOrder) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === updatedOrder.id
          ? { ...o, ...updatedOrder, updatedAt: new Date().toISOString() }
          : o
      )
    );
  }, []);

  const deleteOrder = useCallback((id) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  }, []);

  // 7. INVOICE ACTIONS
  const addInvoice = useCallback((invoice) => {
    const newInvoice = {
      ...invoice,
      id: invoice.id || Date.now(),
      invoiceNumber: `INV-${Date.now()}`,
      status: invoice.status || 'unpaid',
      createdAt: new Date().toISOString(),
    };
    setInvoices(prev => [...prev, newInvoice]);
    return newInvoice;
  }, []);

  const updateInvoice = useCallback((updatedInvoice) => {
    setInvoices(prev =>
      prev.map(i =>
        i.id === updatedInvoice.id
          ? { ...i, ...updatedInvoice, updatedAt: new Date().toISOString() }
          : i
      )
    );
  }, []);

  const deleteInvoice = useCallback((id) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
  }, []);

  const generateInvoiceFromOrder = useCallback((orderId) => {
    const order = orders.find(o => o.id === parseInt(orderId));
    if (!order) return null;

    // Check if invoice already exists for this order
    const existingInvoice = invoices.find(inv => inv.orderId === order.id);
    if (existingInvoice) return existingInvoice;

    // Ensure all items have numeric prices/quantities
    const itemsWithNumbers = (order.items || []).map(item => ({
      ...item,
      productId: item.productId,
      quantity: parseInt(item.quantity) || 0,
      price: parseFloat(item.price) || 0,
      discount: parseFloat(item.discount) || 0
    }));

    const invoice = {
      id: Date.now(),
      orderId: order.id,
      invoiceNumber: `INV-${Date.now()}`,
      customerId: order.customerId,
      items: itemsWithNumbers,
      subtotal: parseFloat(order.subtotal) || 0,
      tax: parseFloat(order.tax) || 0,
      shipping: parseFloat(order.shipping) || 0,
      discount: parseFloat(order.discount) || 0,
      total: parseFloat(order.total) || 0,
      status: 'draft',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amountPaid: 0,
      paymentHistory: [],
      template: 'standard',
      isRecurring: false,
      recurringFrequency: null,
      lastRecurringDate: null,
      createdAt: new Date().toISOString(),
    };

    addInvoice(invoice);
    return invoice;
  }, [orders, invoices, addInvoice]);

  const sendInvoiceToCustomer = useCallback((invoiceId) => {
    updateInvoice({
      id: invoiceId,
      status: 'sent',
      sentAt: new Date().toISOString()
    });
  }, [updateInvoice]);

  const recordPayment = useCallback((invoiceId, paymentData) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return null;

    const previousAmountPaid = invoice.amountPaid || 0;
    const newAmountPaid = previousAmountPaid + paymentData.amount;
    
    let newStatus = invoice.status;
    if (newAmountPaid >= invoice.total) {
      newStatus = 'paid';
    } else if (newAmountPaid > 0) {
      newStatus = 'partial';
    }

    const paymentRecord = {
      id: Date.now(),
      amount: paymentData.amount,
      method: paymentData.method,
      notes: paymentData.notes || '',
      date: new Date().toISOString(),
      reference: paymentData.reference || '',
    };

    const updatedInvoice = {
      ...invoice,
      id: invoiceId,
      amountPaid: newAmountPaid,
      status: newStatus,
      paymentHistory: [...(invoice.paymentHistory || []), paymentRecord],
      lastPaymentDate: new Date().toISOString(),
      lastPaymentMethod: paymentData.method,
    };

    updateInvoice(updatedInvoice);
    return updatedInvoice;
  }, [invoices, updateInvoice]);

  const checkAndMarkOverdue = useCallback(() => {
    const today = new Date();
    invoices.forEach(invoice => {
      if (invoice.dueDate && invoice.status !== 'paid') {
        const dueDate = new Date(invoice.dueDate);
        if (dueDate < today && invoice.status !== 'overdue') {
          updateInvoice({
            id: invoice.id,
            status: 'overdue'
          });
        }
      }
    });
  }, [invoices, updateInvoice]);

  const createRecurringInvoice = useCallback((invoiceTemplate) => {
    const newInvoice = {
      ...invoiceTemplate,
      id: Date.now(),
      invoiceNumber: `INV-${Date.now()}`,
      isRecurring: true,
      createdAt: new Date().toISOString(),
      status: 'draft',
      amountPaid: 0,
      paymentHistory: [],
    };
    addInvoice(newInvoice);
    return newInvoice;
  }, [addInvoice]);

  // Auto-check for overdue invoices on mount and when invoices change
  // Replace the overdue check useEffect with this:
useEffect(() => {
  // Only check on mount, not on every invoice change
  const timeoutId = setTimeout(() => {
    checkAndMarkOverdue();
  }, 1000); // Small delay to ensure initial render completes
  
  return () => clearTimeout(timeoutId);
   }, []); // Empty dependency array - run once on mount

  // 8. MEMOIZE VALUE TO PREVENT UNNECESSARY RE-RENDERS
  const value = useMemo(
    () => ({
      // Products
      products,
      setProducts,
      addProduct,
      updateProduct,
      deleteProduct,

      // Customers
      customers,
      setCustomers,
      addCustomer,
      updateCustomer,
      deleteCustomer,

      // Orders
      orders,
      setOrders,
      addOrder,
      updateOrder,
      deleteOrder,

      // Invoices
      invoices,
      setInvoices,
      addInvoice,
      updateInvoice,
      deleteInvoice,
      generateInvoiceFromOrder,
      sendInvoiceToCustomer,
      recordPayment,
      checkAndMarkOverdue,
      createRecurringInvoice,

      // Global State
      globalSearch,
      setGlobalSearch,
      loading,
      setLoading,
      error,
      setError,
    }),
    [
      products,
      customers,
      orders,
      invoices,
      globalSearch,
      loading,
      error,
      addProduct,
      updateProduct,
      deleteProduct,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addOrder,
      updateOrder,
      deleteOrder,
      addInvoice,
      updateInvoice,
      deleteInvoice,
      generateInvoiceFromOrder,
      sendInvoiceToCustomer,
      recordPayment,
      checkAndMarkOverdue,
      createRecurringInvoice,
    ]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}