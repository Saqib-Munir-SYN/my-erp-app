import { useState } from 'react';
import { useApp } from '../context/AppContext';

const ITEMS_PER_PAGE = 10;

export default function Inventory() {
  const { products, addProduct, updateProduct, deleteProduct, globalSearch } = useApp();

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
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Inventory Management</h1>
          <p className="text-slate-500 text-sm">Manage products and stock levels</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input 
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-64 text-sm shadow-sm"
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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold tracking-widest">
            <tr>
              <th className="p-4">Product Name</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Stock</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-slate-800">{p.name}</td>
                  <td className="p-4 text-slate-600 text-sm font-mono">{p.SKU}</td>
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
                      className="px-3 py-1.5 text-slate-400 font-bold text-xs hover:bg-red-50 hover:text-red-600 rounded-lg uppercase tracking-tighter"
                    >
                      Del
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-12 text-center text-slate-400 italic">No products found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
          <span className="text-sm text-slate-600">
            Page {currentPage} of {totalPages} ({filteredProducts.length} total)
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 font-bold text-sm"
            >
              ← Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg font-bold text-sm ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 font-bold text-sm"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">{editingProduct ? "Edit Product" : "Add Product"}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Product Name</label>
                <input 
                  autoFocus
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Stock Quantity</label>
                <input 
                  type="number" 
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  min="0"
                  required
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 rounded-xl font-bold transition-all"
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