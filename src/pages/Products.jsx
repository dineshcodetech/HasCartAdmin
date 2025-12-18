/**
 * Products Page Component
 * Displays product management interface with table, filters, pagination, and operations
 */
import { useState, useEffect } from 'react'
import { useProducts } from '../hooks'
import { formatDate, formatCurrency } from '../utils/formatters'
import { PRODUCT_STATUS, PRODUCT_CONDITION, AMAZON_SEARCH_INDEX } from '../constants'
import { apiCall } from '../services/api'
import Pagination from '../components/ui/Pagination'

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
      // Only select products that have local IDs (stored in database)
      setSelectedProducts(
        products
          .map((p, index) => p._id || p.id || (p.ASIN || p.asin ? `amazon-${index}` : null))
          .filter(id => id && (id.startsWith('amazon-') ? false : true)) // Only select local products
      )
    }
  }

  const handleBulkOperation = async () => {
    if (!bulkAction || selectedProducts.length === 0) return

    setOperationLoading(true)
    setOperationError('')
    setOperationSuccess('')

    try {
      let response
      if (bulkAction === 'delete') {
        response = await apiCall('/api/admin/products/bulk', {
          method: 'DELETE',
          body: JSON.stringify({ productIds: selectedProducts }),
        })
      } else {
        response = await apiCall('/api/admin/products/bulk/status', {
          method: 'PATCH',
          body: JSON.stringify({ productIds: selectedProducts, status: bulkAction }),
        })
      }

      if (response.ok) {
        setOperationSuccess(
          bulkAction === 'delete'
            ? `Successfully deleted ${selectedProducts.length} product(s)`
            : `Successfully updated ${selectedProducts.length} product(s) status to ${bulkAction}`
        )
        setSelectedProducts([])
        setBulkAction('')
        refetch()
      } else {
        setOperationError(response.data?.message || 'Failed to perform bulk operation')
      }
    } catch (err) {
      setOperationError(err.message || 'Failed to perform bulk operation')
    } finally {
      setOperationLoading(false)
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return

    setOperationLoading(true)
    setOperationError('')

    try {
      const response = await apiCall(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setOperationSuccess('Product deleted successfully')
        refetch()
      } else {
        setOperationError(response.data?.message || 'Failed to delete product')
      }
    } catch (err) {
      setOperationError(err.message || 'Failed to delete product')
    } finally {
      setOperationLoading(false)
    }
  }

  const handleSyncProduct = async (productId) => {
    setOperationLoading(true)
    setOperationError('')

    try {
      const response = await apiCall(`/api/admin/products/${productId}/sync`, {
        method: 'POST',
      })

      if (response.ok) {
        setOperationSuccess('Product synced successfully')
        refetch()
      } else {
        setOperationError(response.data?.message || 'Failed to sync product')
      }
    } catch (err) {
      setOperationError(err.message || 'Failed to sync product')
    } finally {
      setOperationLoading(false)
    }
  }

  const clearFilters = () => {
    updateFilters({
      keywords: '',
      search: '',
      searchIndex: '',
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      status: '',
      condition: '',
      sort: '-createdAt',
    })
  }

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="mb-12">
        <div className="flex justify-between items-start mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-wide text-primary mb-2">
              Products.
            </h1>
            <p className="text-xs text-gray-400 tracking-widest uppercase">
              Product Management
            </p>
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-5 py-2 text-xs font-bold tracking-[0.15em] uppercase border-b border-primary text-primary hover:opacity-70"
            >
              {showFilters ? 'Hide Filters' : 'Filters'}
            </button>
            <button
              onClick={refetch}
              disabled={loading || operationLoading}
              className="px-5 py-2 text-xs font-bold tracking-[0.15em] uppercase border-b border-primary text-primary hover:opacity-70 disabled:opacity-40"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {(error || operationError) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-sm text-red-700 font-bold">{operationError || error}</p>
        </div>
      )}

      {operationSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-secondary/30 rounded-lg">
          <p className="text-sm text-secondary font-bold">✓ {operationSuccess}</p>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <span className="text-sm font-bold text-primary uppercase tracking-wide">
              {selectedProducts.length} product(s) selected
            </span>
            <div className="flex gap-2 items-center flex-wrap">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-4 py-2 text-xs border-b border-gray-200 bg-transparent text-primary font-medium tracking-wide outline-none focus:border-primary cursor-pointer"
              >
                <option value="">Select action...</option>
                <option value={PRODUCT_STATUS.ACTIVE}>Set Active</option>
                <option value={PRODUCT_STATUS.INACTIVE}>Set Inactive</option>
                <option value={PRODUCT_STATUS.ARCHIVED}>Set Archived</option>
                <option value="delete">Delete</option>
              </select>
              <button
                onClick={handleBulkOperation}
                disabled={!bulkAction || operationLoading}
                className="px-6 py-2 text-xs font-bold tracking-[0.15em] uppercase bg-secondary text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-md transition-all"
              >
                {operationLoading ? '...' : 'Apply Action'}
              </button>
              <button
                onClick={() => {
                  setSelectedProducts([])
                  setBulkAction('')
                }}
                className="px-4 py-2 text-xs font-bold tracking-[0.15em] uppercase border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 p-6 bg-gray-50 border border-gray-200">
          <h2 className="text-xl font-bold tracking-wide text-primary mb-6">Filters</h2>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-400 mb-2 block">Search Keywords</label>
                <input
                  type="text"
                  value={filters.search || filters.keywords || ''}
                  onChange={(e) => {
                    handleFilterChange('search', e.target.value)
                    handleFilterChange('keywords', e.target.value)
                  }}
                  placeholder="Enter search keywords"
                  className="w-full border-b border-gray-200 py-2 text-sm text-primary font-medium tracking-wide outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-400 mb-2 block">Amazon Category</label>
                <select
                  value={filters.searchIndex || filters.category || ''}
                  onChange={(e) => {
                    handleFilterChange('searchIndex', e.target.value)
                    handleFilterChange('category', e.target.value)
                  }}
                  className="w-full px-4 py-2 text-xs border-b border-gray-200 bg-transparent text-primary font-medium tracking-wide outline-none focus:border-primary cursor-pointer"
                >
                  <option value="">All Categories</option>
                  <option value={AMAZON_SEARCH_INDEX.ALL}>All</option>
                  <option value={AMAZON_SEARCH_INDEX.ELECTRONICS}>Electronics</option>
                  <option value={AMAZON_SEARCH_INDEX.BOOKS}>Books</option>
                  <option value={AMAZON_SEARCH_INDEX.CLOTHING}>Clothing</option>
                  <option value={AMAZON_SEARCH_INDEX.HOME_GARDEN}>Home & Garden</option>
                  <option value={AMAZON_SEARCH_INDEX.SPORTS_OUTDOORS}>Sports & Outdoors</option>
                  <option value={AMAZON_SEARCH_INDEX.AUTOMOTIVE}>Automotive</option>
                  <option value={AMAZON_SEARCH_INDEX.BEAUTY}>Beauty</option>
                  <option value={AMAZON_SEARCH_INDEX.HEALTH_PERSONAL_CARE}>Health & Personal Care</option>
                  <option value={AMAZON_SEARCH_INDEX.TOYS_GAMES}>Toys & Games</option>
                  <option value={AMAZON_SEARCH_INDEX.COMPUTERS}>Computers</option>
                  <option value={AMAZON_SEARCH_INDEX.MUSIC}>Music</option>
                  <option value={AMAZON_SEARCH_INDEX.MOVIES_TV}>Movies & TV</option>
                  <option value={AMAZON_SEARCH_INDEX.VIDEO_GAMES}>Video Games</option>
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-400 mb-2 block">Brand</label>
                <input
                  type="text"
                  value={filters.brand || ''}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  placeholder="Filter by brand"
                  className="w-full border-b border-gray-200 py-2 text-sm text-primary font-medium tracking-wide outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-400 mb-2 block">Min Price</label>
                <input
                  type="number"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  placeholder="Minimum price"
                  className="w-full border-b border-gray-200 py-2 text-sm text-primary font-medium tracking-wide outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-400 mb-2 block">Max Price</label>
                <input
                  type="number"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  placeholder="Maximum price"
                  className="w-full border-b border-gray-200 py-2 text-sm text-primary font-medium tracking-wide outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-400 mb-2 block">Sort By</label>
                <select
                  value={filters.sort || '-createdAt'}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full px-4 py-2 text-xs border-b border-gray-200 bg-transparent text-primary font-medium tracking-wide outline-none focus:border-primary cursor-pointer"
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
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-xs font-bold tracking-[0.15em] uppercase border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-8">
        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-xl font-bold tracking-wide text-primary mb-6">
            All Products ({pagination.total || products.length})
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-primary text-sm tracking-wide font-bold animate-pulse">Loading...</div>
            </div>
          ) : products.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                        <input
                          type="checkbox"
                          checked={selectedProducts.length === products.length && products.length > 0}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 cursor-pointer accent-primary"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Image</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Title</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">ASIN</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Price</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, index) => {
                      const productId = product._id || product.id || product.ASIN || product.asin || `amazon-${index}`
                      const productAsin = product.ASIN || product.asin || 'N/A'
                      const productTitle = product.ItemInfo?.Title?.DisplayValue || product.title || product.Title?.DisplayValue || product.Title || 'N/A'
                      const productImage = product.Images?.Primary?.Large?.URL || product.Images?.Primary?.Medium?.URL || product.Images?.Primary?.Small?.URL || product.imageUrl || product.image || null
                      const productPrice = product.Offers?.Listings?.[0]?.Price?.DisplayAmount || product.Offers?.Listings?.[0]?.Price?.Amount || product.Price?.DisplayAmount || product.Price?.Amount || product.price || null
                      const isSelected = selectedProducts.includes(productId)
                      const hasLocalId = product._id || product.id

                      return (
                        <tr key={productId} className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-gray-100' : ''}`}>
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleProductSelection(productId)}
                              className="w-4 h-4 cursor-pointer"
                              disabled={!hasLocalId}
                            />
                          </td>
                          <td className="px-4 py-4">
                            {productImage ? (
                              <img src={productImage} alt={productTitle} className="w-12 h-12 object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
                            ) : null}
                            <div className="w-12 h-12 flex items-center justify-center bg-gray-100 text-2xl" style={{ display: productImage ? 'none' : 'flex' }}>📦</div>
                          </td>
                          <td className="px-4 py-4 text-primary font-medium max-w-xs truncate" title={productTitle}>{productTitle}</td>
                          <td className="px-4 py-4 text-primary font-mono text-sm">{productAsin}</td>
                          <td className="px-4 py-4 text-primary font-bold">{productPrice ? (typeof productPrice === 'string' ? productPrice : formatCurrency(productPrice)) : 'N/A'}</td>
                          <td className="px-4 py-4">
                            {hasLocalId ? (
                              <span className="text-xs font-bold uppercase tracking-wider text-secondary">{product.status || 'active'}</span>
                            ) : (
                              <span className="text-xs font-bold uppercase tracking-wider text-primary">Amazon</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                onPageChange={(page) => {
                  updatePagination({ page })
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
            </div>
          ) : (
            <p className="text-center py-12 text-gray-400 italic">No products found</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Products
