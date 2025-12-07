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
}) {
  if (totalPages <= 1) return null

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 flex-wrap gap-4">
      <div className="text-gray-600 text-sm">
        Showing {startIndex + 1} to {endIndex} of {totalItems} {itemName}
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
            // Show first page, last page, current page, and pages around current
            if (
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
            ) {
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
            } else if (page === currentPage - 2 || page === currentPage + 2) {
              return <span key={page} className="px-2 text-gray-600 font-medium">...</span>
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


