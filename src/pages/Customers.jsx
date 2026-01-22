import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

const ITEMS_PER_PAGE = 10;

export default function Customers() {
  const { customers, setCustomers } = useApp();
  const { isDark } = useTheme();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", status: "Active" });
  const [currentPage, setCurrentPage] = useState(1);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCustomers = filteredCustomers.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({ name: "", email: "", status: "Active" });
    setIsModalOpen(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setFormData({ name: customer.name, email: customer.email, status: customer.status });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingCustomer) {
      setCustomers(customers.map(c => 
        c.id === editingCustomer.id ? { ...c, ...formData } : c
      ));
    } else {
      setCustomers([...customers, { id: Date.now(), ...formData }]);
    }
    setIsModalOpen(false);
    setCurrentPage(1);
  };

  const deleteCustomer = (id) => {
    if(window.confirm("Delete this customer record?")) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Customer Directory
          </h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Manage your customer relationships and accounts
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input 
              type="text"
              placeholder="Search customers..."
              className={`pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none w-64 text-sm shadow-sm ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <button 
            onClick={openAddModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100"
          >
            + New Customer
          </button>
        </div>
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
              <th className="p-4">Company</th>
              <th className="p-4">Email</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className={isDark ? 'divide-y divide-slate-700' : 'divide-y divide-slate-100'}>
            {paginatedCustomers.length > 0 ? (
              paginatedCustomers.map((c) => (
                <tr key={c.id} className={`transition-colors ${
                  isDark
                    ? 'hover:bg-slate-700 border-slate-700'
                    : 'hover:bg-slate-50/50 border-slate-100'
                }`}>
                  <td className={`p-4 font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {c.name}
                  </td>
                  <td className={`p-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {c.email}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      c.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1">
                    <button 
                      onClick={() => openEditModal(c)} 
                      className="px-3 py-1.5 text-indigo-600 font-bold text-xs hover:bg-indigo-50 rounded-lg uppercase tracking-tighter"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteCustomer(c.id)} 
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
                  No customers found.
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
            Page {currentPage} of {totalPages} ({filteredCustomers.length} total)
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
              ← Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg font-bold text-sm transition-all ${
                  currentPage === page
                    ? 'bg-indigo-600 text-white'
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
                  ? 'border border-slate-600 hover:bg-slate-700 text-slate-300'
                  : 'border border-slate-200 hover:bg-slate-50 text-slate-900'
              }`}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-3xl shadow-2xl border p-8 ${
            isDark
              ? 'bg-slate-800 border-slate-700'
              : 'bg-white border-slate-100'
          }`}>
            <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {editingCustomer ? "Update Customer" : "Add Customer"}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className={`block text-[10px] font-black uppercase mb-2 ${
                  isDark ? 'text-slate-400' : 'text-slate-400'
                }`}>
                  Company Name
                </label>
                <input 
                  autoFocus
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none border ${
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
                  Email Address
                </label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none border ${
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
                  Status
                </label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className={`w-full p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none border ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
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
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all"
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