/**
 * Products Page Component
 * Displays product management interface with table, filters, pagination, and operations
 */
import { useState, useEffect } from 'react'
import { useProducts } from '../hooks'
import { formatDate, formatCurrency } from '../utils/formatters'
import { PRODUCT_STATUS, PRODUCT_CONDITION } from '../constants'
import { productService } from '../services/api'
import { getErrorMessage } from '../utils/errorHandler'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorMessage from '../components/ui/ErrorMessage'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

function Products() {
  const { products, loading, error, pagination, filters, updateFilters, updatePagination, refetch } = useProducts()
  const [selectedProducts, setSelectedProducts] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [bulkAction, setBulkAction] = useState('')
  const [operationLoading, setOperationLoading] = useState(false)
  const [operationError, setOperationError] = useState('')
  const [operationSuccess, setOperationSuccess] = useState('')

  // Clear messages after timeout
  useEffect(() => {
    if (operationSuccess) {
      const timer = setTimeout(() => setOperationSuccess(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [operationSuccess])

  useEffect(() => {
    if (operationError) {
      const timer = setTimeout(() => setOperationError(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [operationError])

  const handlePageChange = (page) => {
    updatePagination({ page })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFilterChange = (key, value) => {
    updateFilters({ [key]: value })
  }

  const handleSortChange = (sort) => {
    updateFilters({ sort })
  }

  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.map(p => p._id || p.id))
    }
  }

  const handleBulkOperation = async () => {
    if (!bulkAction || selectedProducts.length === 0) return

    setOperationLoading(true)
    setOperationError('')
    setOperationSuccess('')

    try {
      if (bulkAction === 'delete') {
        await productService.bulkDeleteProducts(selectedProducts)
        setOperationSuccess(`Successfully deleted ${selectedProducts.length} product(s)`)
      } else {
        await productService.bulkUpdateStatus(selectedProducts, bulkAction)
        setOperationSuccess(`Successfully updated ${selectedProducts.length} product(s) status to ${bulkAction}`)
      }
      setSelectedProducts([])
      setBulkAction('')
      refetch()
    } catch (err) {
      const errorMessage = getErrorMessage(err) || 'Failed to perform bulk operation'
      setOperationError(errorMessage)
    } finally {
      setOperationLoading(false)
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return

    setOperationLoading(true)
    setOperationError('')

    try {
      await productService.deleteProduct(productId)
      setOperationSuccess('Product deleted successfully')
      refetch()
    } catch (err) {
      const errorMessage = getErrorMessage(err) || 'Failed to delete product'
      setOperationError(errorMessage)
    } finally {
      setOperationLoading(false)
    }
  }

  const handleSyncProduct = async (productId) => {
    setOperationLoading(true)
    setOperationError('')

    try {
      await productService.syncProduct(productId)
      setOperationSuccess('Product synced successfully')
      refetch()
    } catch (err) {
      const errorMessage = getErrorMessage(err) || 'Failed to sync product'
      setOperationError(errorMessage)
    } finally {
      setOperationLoading(false)
    }
  }

  const clearFilters = () => {
    updateFilters({
      status: '',
      category: '',
      brand: '',
      search: '',
      minPrice: '',
      maxPrice: '',
      condition: '',
      sort: '-createdAt',
    })
  }

  const totalPages = pagination.totalPages || Math.ceil((pagination.total || products.length) / pagination.limit)

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-8 gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <h1 className="text-gray-900 text-3xl font-semibold mb-2">Product Management</h1>
          <p className="text-gray-600 text-base m-0">Manage your product catalog</p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <Button 
            variant="secondary" 
            size="small" 
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? '✕ Hide Filters' : '🔍 Filters'}
          </Button>
          <Button 
            variant="secondary" 
            size="small" 
            onClick={refetch}
            disabled={loading || operationLoading}
            loading={loading || operationLoading}
          >
            🔄 Refresh
          </Button>
        </div>
      </div>

      {(error || operationError) && (
        <ErrorMessage 
          message={operationError || error} 
          onDismiss={() => {
            setOperationError('')
            setOperationSuccess('')
          }}
          className="mb-6"
        />
      )}

      {operationSuccess && (
        <div className="p-4 rounded-lg bg-green-50 text-green-800 border border-green-200 font-medium mb-6">
          ✓ {operationSuccess}
        </div>
      )}

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <Card className="bg-yellow-50 border-yellow-300 mb-6">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <span className="font-semibold text-yellow-800">
              {selectedProducts.length} product(s) selected
            </span>
            <div className="flex gap-2 items-center flex-wrap">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-4 py-2 text-sm border-2 border-gray-200 rounded-lg bg-white cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
              >
                <option value="">Select action...</option>
                <option value={PRODUCT_STATUS.ACTIVE}>Set Active</option>
                <option value={PRODUCT_STATUS.INACTIVE}>Set Inactive</option>
                <option value={PRODUCT_STATUS.ARCHIVED}>Set Archived</option>
                <option value="delete">Delete</option>
              </select>
              <Button
                variant="primary"
                size="small"
                onClick={handleBulkOperation}
                disabled={!bulkAction || operationLoading}
                loading={operationLoading}
              >
                Apply
              </Button>
              <Button
                variant="secondary"
                size="small"
                onClick={() => {
                  setSelectedProducts([])
                  setBulkAction('')
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      {showFilters && (
        <Card title="Filters" className="bg-gray-50 mb-6">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                label="Search"
                type="text"
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by name, ASIN, SKU..."
              />
              <div className="flex flex-col gap-2 mb-4">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-md transition-all duration-200 font-inherit outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-600 focus:ring-opacity-10 cursor-pointer appearance-none bg-white pr-10 bg-[url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23333\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E')] bg-no-repeat bg-[right_1rem_center]"
                >
                  <option value="">All Statuses</option>
                  <option value={PRODUCT_STATUS.ACTIVE}>Active</option>
                  <option value={PRODUCT_STATUS.INACTIVE}>Inactive</option>
                  <option value={PRODUCT_STATUS.ARCHIVED}>Archived</option>
                </select>
              </div>
              <div className="flex flex-col gap-2 mb-4">
                <label className="text-sm font-medium text-gray-700">Condition</label>
                <select
                  value={filters.condition || ''}
                  onChange={(e) => handleFilterChange('condition', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-md transition-all duration-200 font-inherit outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-600 focus:ring-opacity-10 cursor-pointer appearance-none bg-white pr-10 bg-[url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23333\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E')] bg-no-repeat bg-[right_1rem_center]"
                >
                  <option value="">All Conditions</option>
                  <option value={PRODUCT_CONDITION.NEW}>New</option>
                  <option value={PRODUCT_CONDITION.USED}>Used</option>
                  <option value={PRODUCT_CONDITION.REFURBISHED}>Refurbished</option>
                </select>
              </div>
              <Input
                label="Category"
                type="text"
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                placeholder="Filter by category"
              />
              <Input
                label="Brand"
                type="text"
                value={filters.brand || ''}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                placeholder="Filter by brand"
              />
              <div className="flex flex-col gap-2 mb-4">
                <label className="text-sm font-medium text-gray-700">Sort By</label>
                <select
                  value={filters.sort || '-createdAt'}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-md transition-all duration-200 font-inherit outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-600 focus:ring-opacity-10 cursor-pointer appearance-none bg-white pr-10 bg-[url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23333\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E')] bg-no-repeat bg-[right_1rem_center]"
                >
                  <option value="-createdAt">Newest First</option>
                  <option value="createdAt">Oldest First</option>
                  <option value="-price">Price: High to Low</option>
                  <option value="price">Price: Low to High</option>
                  <option value="title">Title: A to Z</option>
                  <option value="-title">Title: Z to A</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                size="small"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-8">
        <Card 
          title={`All Products (${pagination.total || products.length})`}
          className="overflow-hidden"
        >
          {loading ? (
            <LoadingSpinner 
              message="Loading products..." 
              className="py-12"
            />
          ) : products.length > 0 ? (
            <>
              <div className="overflow-x-auto -m-6 p-6">
                <table className="w-full border-collapse bg-white">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-4 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedProducts.length === products.length && products.length > 0}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </th>
                      <th className="px-4 py-4 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider">Image</th>
                      <th className="px-4 py-4 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider">Title</th>
                      <th className="px-4 py-4 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider">ASIN</th>
                      <th className="px-4 py-4 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider">Price</th>
                      <th className="px-4 py-4 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider">Status</th>
                      <th className="px-4 py-4 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider">Stock</th>
                      <th className="px-4 py-4 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider">Created</th>
                      <th className="px-4 py-4 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => {
                      const productId = product._id || product.id
                      const isSelected = selectedProducts.includes(productId)
                      return (
                        <tr 
                          key={productId} 
                          className={`transition-colors border-b border-gray-200 last:border-b-0 ${
                            isSelected ? 'bg-yellow-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleProductSelection(productId)}
                              className="w-4 h-4 cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-4">
                            {product.imageUrl ? (
                              <img 
                                src={product.imageUrl} 
                                alt={product.title || 'Product'} 
                                className="w-12 h-12 object-cover rounded"
                              />
                            ) : (
                              <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded text-2xl">📦</div>
                            )}
                          </td>
                          <td className="px-4 py-4 text-gray-900 font-semibold max-w-xs truncate">{product.title || 'N/A'}</td>
                          <td className="px-4 py-4 text-blue-600 font-mono text-sm">{product.asin || 'N/A'}</td>
                          <td className="px-4 py-4 text-green-700 font-semibold">
                            {product.price ? formatCurrency(product.price) : 'N/A'}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                              product.status === PRODUCT_STATUS.ACTIVE
                                ? 'bg-green-100 text-green-700'
                                : product.status === PRODUCT_STATUS.INACTIVE
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {product.status || 'active'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-gray-600">{product.stock || 'N/A'}</td>
                          <td className="px-4 py-4 text-gray-600 text-sm">
                            {product.createdAt ? formatDate(product.createdAt) : 'N/A'}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex gap-2">
                              <Button
                                variant="secondary"
                                size="small"
                                onClick={() => handleSyncProduct(productId)}
                                disabled={operationLoading}
                                title="Sync with Amazon"
                              >
                                🔄
                              </Button>
                              <Button
                                variant="secondary"
                                size="small"
                                onClick={() => handleDeleteProduct(productId)}
                                disabled={operationLoading}
                                title="Delete"
                              >
                                🗑️
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 flex-wrap gap-4">
                  <div className="text-gray-600 text-sm">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total || products.length)} of{' '}
                    {pagination.total || products.length} products
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      ← Previous
                    </Button>
                    
                    <div className="flex gap-1 items-center">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= pagination.page - 1 && page <= pagination.page + 1)
                        ) {
                          return (
                            <Button
                              key={page}
                              variant={pagination.page === page ? 'primary' : 'secondary'}
                              size="small"
                              onClick={() => handlePageChange(page)}
                              className="min-w-[2.5rem] px-3 py-2"
                            >
                              {page}
                            </Button>
                          )
                        } else if (page === pagination.page - 2 || page === pagination.page + 2) {
                          return <span key={page} className="px-2 text-gray-600 font-medium">...</span>
                        }
                        return null
                      })}
                    </div>
                    
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === totalPages}
                    >
                      Next →
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-center py-12 px-8 text-gray-400 italic">No products found</p>
          )}
        </Card>
      </div>
    </div>
  )
}

export default Products

