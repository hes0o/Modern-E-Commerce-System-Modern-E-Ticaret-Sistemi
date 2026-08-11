import SearchBar from './SearchBar'
import Pagination from './Pagination'

export default function DataTable({
  columns,
  data,
  loading = false,
  searchable = true,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Kayıtlarda ara...',
  actions,
  page = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  emptyText = 'Gösterilecek veri bulunamadı',
}) {
  return (
    <div className="card space-y-4 p-4 sm:p-5">
      {(searchable || actions) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {searchable ? (
            <SearchBar
              value={searchValue}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
              className="w-full sm:w-80"
            />
          ) : <div />}
          {actions && <div className="flex items-center gap-2 self-end sm:self-auto">{actions}</div>}
        </div>
      )}

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={col.headerClassName || ''}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx}>
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="py-4">
                      <div className="h-4 skeleton w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-slate-400 font-medium">
                  <div className="flex flex-col items-center gap-2">
                    <p>{emptyText}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => (
                <tr key={row.id || rIdx} className="group">
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className={col.className || ''}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {onPageChange && (
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}
