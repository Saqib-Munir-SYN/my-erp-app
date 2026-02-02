/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Loader } from './Loader'; // Assuming you have this component

export default function Products() {
  const { isDark } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [searchTerm, setSearchTerm] = useState(""); // Added search functionality
  const [retryCount, setRetryCount] = useState(0);

  // Fetch with error handling and retry capability
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch('https://ea723e8f-f1fe-4042-94ff-dd5a55eed317.mock.pstmn.io/products')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch products`);
        return res.json();
      })
      .then(data => {
        if (!isMounted) return;
        
        // Validation: ensure data is array
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received');
        }
        
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        if (!isMounted) return;
        console.error('Products fetch error:', err);
        setError(err.message);
        setLoading(false);
      });

    return () => { isMounted = false; };
  }, [retryCount]); // Retry capability

  // Safe number formatter
  const formatPrice = (price) => {
    const num = parseFloat(price);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  // Filtered products (added search functionality for consistency)
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(p => 
      p.title?.toLowerCase().includes(term) ||
      p.category?.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevious = useCallback(() => {
    setCurrentPage(p => Math.max(1, p - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentPage(p => Math.min(totalPages, p + 1));
  }, [totalPages]);

  const handleItemsPerPageChange = (e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val > 0) {
      setItemsPerPage(val);
      setCurrentPage(1);
    }
  };

  const handleRetry = () => {
    setRetryCount(c => c + 1);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader />
    </div>
  );

  if (error) return (
    <div className={`text-center py-12 ${isDark ? 'text-white' : 'text-slate-900'}`}>
      <div className="text-4xl mb-4">⚠️</div>
      <h2 className="text-xl font-bold mb-2">Failed to load products</h2>
      <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{error}</p>
      <button 
        onClick={handleRetry}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Products
          </h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Browse all available products ({filteredProducts.length} items)
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Added search for consistency with other pages */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input 
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className={`pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-64 text-sm shadow-sm ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Show:
            </label>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className={`px-3 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 outline-none text-sm ${
                isDark
                  ? 'bg-slate-700 border border-slate-600 text-white'
                  : 'bg-white border border-slate-300 text-slate-900'
              }`}
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className={`text-center py-12 rounded-xl border ${
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
        }`}>
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
            {searchTerm ? 'No products match your search.' : 'No products available.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentProducts.map(product => {
              // Defensive destructuring with defaults
              const { 
                id, 
                title = 'Untitled Product', 
                price = 0, 
                category = 'uncategorized',
                image,
                rating = {}
              } = product;
              
              const { rate = 0, count = 0 } = rating;
              
              return (
                <div
                  key={id}
                  className={`border p-5 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 cursor-pointer group overflow-hidden ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`overflow-hidden rounded-lg mb-4 h-48 ${isDark ? 'bg-slate-700' : 'bg-slate-100'} flex items-center justify-center`}>
                    {image ? (
                      <img
                        src={image}
                        alt={title}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<span class="text-4xl">📦</span>';
                        }}
                      />
                    ) : (
                      <span className="text-4xl">📦</span>
                    )}
                  </div>
                  <h2 className={`font-bold line-clamp-2 h-12 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {title}
                  </h2>
                  <p className="text-blue-600 font-semibold mt-2 text-lg">
                    ${formatPrice(price)}
                  </p>
                  <p className={`text-sm capitalize mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {category}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-yellow-500">
                    <span>⭐</span>
                    <span className="font-semibold text-sm">{rate}</span>
                    <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>({count})</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-6 mt-12">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-400 text-white rounded-lg transition-all duration-200 font-medium"
              >
                ← Previous
              </button>
              <span className={`text-lg font-semibold min-w-fit ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-400 text-white rounded-lg transition-all duration-200 font-medium"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}