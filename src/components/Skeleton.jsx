export function SkeletonCard() {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 animate-pulse">
      <div className="h-10 bg-slate-200 rounded w-3/4 mb-4"></div>
      <div className="h-8 bg-slate-200 rounded w-1/2 mb-3"></div>
      <div className="h-6 bg-slate-200 rounded w-2/3 mb-3"></div>
      <div className="h-4 bg-slate-200 rounded w-full"></div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
      <div className="h-12 bg-slate-100 border-b border-slate-200 animate-pulse"></div>
      <div className="space-y-0">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-14 bg-white border-b border-slate-100 animate-pulse flex items-center px-6">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-slate-100 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}