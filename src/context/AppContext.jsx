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

  const [globalSearch, setGlobalSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 2. PERSISTENCE: Save to LocalStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('erp_products', JSON.stringify(products));
  }, [products]);

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

  // 5. MEMOIZE VALUE TO PREVENT UNNECESSARY RE-RENDERS
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
      globalSearch,
      loading,
      error,
      addProduct,
      updateProduct,
      deleteProduct,
      addCustomer,
      updateCustomer,
      deleteCustomer,
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