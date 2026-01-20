import { useState, useEffect } from 'react';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    fetch('https://ea723e8f-f1fe-4042-94ff-dd5a55eed317.mock.pstmn.io/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center py-8">Loading...</div>;

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Products</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-700">Items per page:</label>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="px-4 py-2 border border-slate-300 rounded-lg bg-white hover:border-blue-500 transition-colors focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value={6}>6</option>
            <option value={12}>12</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentProducts.map(product => (
          <div
            key={product.id}
            className="border border-slate-200 p-5 rounded-xl bg-white shadow-md hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 cursor-pointer group"
          >
            <div className="overflow-hidden rounded-lg mb-4 h-48 bg-slate-100">
              <img
                src={product.image}
                alt={product.title}
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <h2 className="font-bold text-slate-900 line-clamp-2">{product.title}</h2>
            <p className="text-blue-600 font-semibold mt-2">${product.price}</p>
            <p className="text-sm text-slate-500 capitalize mt-1">{product.category}</p>
            <p className="text-yellow-500 font-semibold mt-2">⭐ {product.rating.rate} ({product.rating.count})</p>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-center gap-6 mt-12">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          ← Previous
        </button>
        <span className="text-lg font-semibold text-slate-900 min-w-fit">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Next →
        </button>
      </div>
    </div>
  );
}