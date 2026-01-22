import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Invoices from './pages/Invoices';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppProvider>
          <ToastProvider>
            <Router>
              <MainLayout>
              <Routes>
                {/* 1. Dashboard Route */}
                <Route path="/" element={<Dashboard />} />

                {/* 2. Inventory Route */}
                <Route path="/inventory" element={<Inventory />} />

                {/* 3. Customers Route */}
                <Route path="/customers" element={<Customers />} />

                {/* 4. Products Route */}
                <Route path="/products" element={<Products />} />

                {/* 5. Orders/Sales Route */}
                <Route path="/orders" element={<Orders />} />

                {/* 6. Invoices & Payments Route */}
                <Route path="/invoices" element={<Invoices />} />

                {/* 7. Safety Net: Catch-all for broken links */}
                <Route
                  path="*"
                  element={
                    <div className="text-center py-20 px-4">
                      <h2 className="text-4xl font-bold text-slate-900 mb-4">404</h2>
                      <p className="text-slate-600 mb-6 text-lg">The page you're looking for doesn't exist.</p>
                      <a
                        href="/"
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
                      >
                        ← Go Back Home
                      </a>
                    </div>
                  }
                />
              </Routes>
            </MainLayout>
              </Router>
            </ToastProvider>
          </AppProvider>
        </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;