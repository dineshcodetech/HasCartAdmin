/**
 * Reusable Pagination Component
 */
import Button from './Button'

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  itemName = 'items',
  onRowsPerPageChange,
}) {
  if (totalPages <= 1 && totalItems <= itemsPerPage) return null

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 flex-wrap gap-4">
      <div className="flex items-center gap-4">
        <div className="text-gray-600 text-sm">
          Showing {startIndex + 1} to {endIndex} of {totalItems} {itemName}
        </div>

        {onRowsPerPageChange && (
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <span>Rows per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
              className="bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none focus:border-primary"
            >
              {[10, 20, 50, 100].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="secondary"
          size="small"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ← Previous
        </Button>

        <div className="flex gap-1 items-center">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            // Show better pagination logic: 1, ..., cur-1, cur, cur+1, ..., last
            const isFirst = page === 1;
            const isLast = page === totalPages;
            const isNearCurrent = Math.abs(page - currentPage) <= 1;

            if (isFirst || isLast || isNearCurrent) {
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'primary' : 'secondary'}
                  size="small"
                  onClick={() => onPageChange(page)}
                  className="min-w-[2.5rem] px-3 py-2"
                >
                  {page}
                </Button>
              )
            }

            if (page === currentPage - 2 || page === currentPage + 2) {
              return <span key={page} className="px-1 text-gray-400">...</span>
            }
            return null
          })}
        </div>

        <Button
          variant="secondary"
          size="small"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next →
        </Button>
      </div>
    </div>
  )
}


