export function Pagination({ currentPage, totalPages, onPageChange, itemsPerPage, onItemsPerPageChange }) {
  return (
    <div className="flex items-center justify-between py-6 px-4">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-slate-700">Items per page:</label>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
        >
          ← Previous
        </button>

        <div className="flex items-center gap-1">
          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            let pageNum = i + 1;
            if (totalPages > 5) {
              if (currentPage > 3) pageNum = currentPage - 2 + i;
              if (currentPage > totalPages - 3) pageNum = totalPages - 4 + i;
            }
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  currentPage === pageNum
                    ? 'bg-blue-500 text-white'
                    : 'border border-slate-300 hover:bg-slate-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
        >
          Next →
        </button>
      </div>

      <div className="text-sm text-slate-600 font-medium">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
}