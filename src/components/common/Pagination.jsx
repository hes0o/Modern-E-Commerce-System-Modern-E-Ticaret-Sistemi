import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, onPageChange, totalItems, itemsPerPage }) {
  if (totalPages <= 1) return null

  const startItem = (page - 1) * itemsPerPage + 1
  const endItem = Math.min(page * itemsPerPage, totalItems)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-2">
      <p className="text-xs text-slate-500">
        Toplam <span className="font-semibold text-slate-700">{totalItems}</span> kayıttan{' '}
        <span className="font-semibold text-slate-700">{startItem}</span> -{' '}
        <span className="font-semibold text-slate-700">{endItem}</span> arası gösteriliyor
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="btn btn-secondary btn-sm"
          aria-label="Önceki Sayfa"
        >
          <ChevronLeft size={16} />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
          if (
            p === 1 ||
            p === totalPages ||
            (p >= page - 1 && p <= page + 1)
          ) {
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`btn btn-sm min-w-[32px] ${p === page
                    ? 'btn-primary'
                    : 'btn-ghost text-slate-600'
                  }`}
              >
                {p}
              </button>
            )
          }
          if (p === page - 2 || p === page + 2) {
            return (
              <span key={p} className="px-1 text-xs text-slate-400">
                ...
              </span>
            )
          }
          return null
        })}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="btn btn-secondary btn-sm"
          aria-label="Sonraki Sayfa"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
