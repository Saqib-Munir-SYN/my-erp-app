import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

const ITEMS_PER_PAGE = 10;

export default function Inventory() {
  const { products, addProduct, updateProduct, deleteProduct, globalSearch } = useApp();
  const { isDark } = useTheme();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: "", stock: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [localSearch, setLocalSearch] = useState("");

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(localSearch.toLowerCase()) ||
    p.SKU.toLowerCase().includes(localSearch.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handleSave = (e) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct({ ...editingProduct, name: formData.name, stock: Number(formData.stock) });
    } else {
      addProduct({
        id: Date.now(),
        name: formData.name,
        SKU: `SKU-${Math.floor(Math.random() * 1000)}`,
        stock: Number(formData.stock)
      });
    }
    setIsModalOpen(false);
    setFormData({ name: "", stock: 0 });
    setCurrentPage(1);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ name: "", stock: 0 });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({ name: product.name, stock: product.stock });
    setIsModalOpen(true);
  };

  const handleSearchChange = (e) => {
    setLocalSearch(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Inventory Management
          </h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Manage products and stock levels
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input 
              type="text"
              placeholder="Search products..."
              className={`pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-64 text-sm shadow-sm ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
              value={localSearch}
              onChange={handleSearchChange}
            />
          </div>
          <button 
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-bold transition-all shadow-lg shadow-blue-100"
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* Table */}
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
              <th className="p-4">Product Name</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Stock</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className={isDark ? 'divide-y divide-slate-700' : 'divide-y divide-slate-100'}>
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((p) => (
                <tr key={p.id} className={`transition-colors ${
                  isDark
                    ? 'hover:bg-slate-700 border-slate-700'
                    : 'hover:bg-slate-50/50 border-slate-100'
                }`}>
                  <td className={`p-4 font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {p.name}
                  </td>
                  <td className={`p-4 text-sm font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {p.SKU}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-lg font-bold text-sm ${
                      p.stock < 5 ? 'bg-red-100 text-red-700' : 
                      p.stock < 10 ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {p.stock} units
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1">
                    <button 
                      onClick={() => openEditModal(p)} 
                      className="px-3 py-1.5 text-blue-600 font-bold text-xs hover:bg-blue-50 rounded-lg uppercase tracking-tighter"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteProduct(p.id)} 
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
                <td colSpan="4" className={`p-12 text-center italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={`flex items-center justify-between p-4 rounded-2xl border ${
          isDark
            ? 'bg-slate-800 border-slate-700'
            : 'bg-white border-slate-200'
        }`}>
          <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Page {currentPage} of {totalPages} ({filteredProducts.length} total)
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-lg font-bold text-sm transition-all disabled:opacity-50 ${
                isDark
                  ? 'border-slate-600 hover:bg-slate-700 text-slate-300'
                  : 'border border-slate-200 hover:bg-slate-50 text-slate-900'
              }`}
            >
              ← Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg font-bold text-sm transition-all ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : isDark
                      ? 'border border-slate-600 hover:bg-slate-700 text-slate-300'
                      : 'border border-slate-200 hover:bg-slate-50 text-slate-900'
                }`}
              >
                {page}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-lg font-bold text-sm transition-all disabled:opacity-50 ${
                isDark
                  ? 'border-slate-600 hover:bg-slate-700 text-slate-300'
                  : 'border border-slate-200 hover:bg-slate-50 text-slate-900'
              }`}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-3xl shadow-2xl border p-8 ${
            isDark
              ? 'bg-slate-800 border-slate-700'
              : 'bg-white border-slate-100'
          }`}>
            <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {editingProduct ? "Edit Product" : "Add Product"}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className={`block text-[10px] font-black uppercase mb-2 ${
                  isDark ? 'text-slate-400' : 'text-slate-400'
                }`}>
                  Product Name
                </label>
                <input 
                  autoFocus
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none border ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                  required
                />
              </div>
              <div>
                <label className={`block text-[10px] font-black uppercase mb-2 ${
                  isDark ? 'text-slate-400' : 'text-slate-400'
                }`}>
                  Stock Quantity
                </label>
                <input 
                  type="number" 
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  className={`w-full p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none border ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                  min="0"
                  required
                />
              </div>
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
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}