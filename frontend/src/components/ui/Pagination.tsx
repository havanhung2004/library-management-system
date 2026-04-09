import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const delta = 1; // pages around current

  // Build page numbers with ellipsis
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - delta && i <= page + delta)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== -1) {
      pages.push(-1); // ellipsis marker
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((p, i) =>
        p === -1 ? (
          <span key={`ellipsis-${i}`} className="px-2 text-slate-500 text-sm">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`min-w-[36px] h-9 rounded-lg text-sm font-bold transition-all ${
              p === page
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;
