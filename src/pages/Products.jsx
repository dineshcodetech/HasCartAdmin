/**
 * Products Page Component
 * Displays product management interface with table, filters, pagination, and operations
 */
import { useState, useEffect } from 'react'
import { useProducts } from '../hooks'
import { formatDate, formatCurrency } from '../utils/formatters'
import { PRODUCT_STATUS, PRODUCT_CONDITION, AMAZON_SEARCH_INDEX } from '../constants'
import { apiCall } from '../services/api'

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

  const totalPages = pagination.totalPages || Math.ceil((pagination.total || products.length) / pagination.limit)

  return (
    <div className="p-8 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-12">
        <div className="flex justify-between items-start mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-light tracking-wide text-black mb-2">
              Products.
            </h1>
            <p className="text-xs text-gray-400 tracking-widest uppercase">
              Product Management
            </p>
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-5 py-2 text-xs font-bold tracking-[0.15em] uppercase border-b border-black hover:opacity-70"
            >
              {showFilters ? 'Hide Filters' : 'Filters'}
            </button>
            <button
              onClick={refetch}
              disabled={loading || operationLoading}
              className="px-5 py-2 text-xs font-bold tracking-[0.15em] uppercase border-b border-black hover:opacity-70 disabled:opacity-40"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {(error || operationError) && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200">
          <p className="text-sm text-black">{operationError || error}</p>
        </div>
      )}

      {operationSuccess && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200">
          <p className="text-sm text-black">✓ {operationSuccess}</p>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <span className="text-sm font-bold text-black uppercase tracking-wide">
              {selectedProducts.length} product(s) selected
            </span>
            <div className="flex gap-2 items-center flex-wrap">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-4 py-2 text-xs border-b border-gray-200 bg-transparent text-black font-medium tracking-wide outline-none focus:border-black cursor-pointer"
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
                className="px-4 py-2 text-xs font-bold tracking-[0.15em] uppercase bg-black text-white hover:opacity-70 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {operationLoading ? '...' : 'Apply'}
              </button>
              <button
                onClick={() => {
                  setSelectedProducts([])
                  setBulkAction('')
                }}
                className="px-4 py-2 text-xs font-bold tracking-[0.15em] uppercase border border-black hover:bg-black hover:text-white transition-colors"
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
          <h2 className="text-xl font-light tracking-wide text-black mb-6">Filters</h2>
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
                  className="w-full border-b border-gray-200 py-2 text-sm text-black font-medium tracking-wide outline-none focus:border-black"
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
                  className="w-full px-4 py-2 text-xs border-b border-gray-200 bg-transparent text-black font-medium tracking-wide outline-none focus:border-black cursor-pointer"
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
                  className="w-full border-b border-gray-200 py-2 text-sm text-black font-medium tracking-wide outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-400 mb-2 block">Min Price</label>
                <input
                  type="number"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  placeholder="Minimum price"
                  className="w-full border-b border-gray-200 py-2 text-sm text-black font-medium tracking-wide outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-400 mb-2 block">Max Price</label>
                <input
                  type="number"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  placeholder="Maximum price"
                  className="w-full border-b border-gray-200 py-2 text-sm text-black font-medium tracking-wide outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-400 mb-2 block">Sort By</label>
                <select
                  value={filters.sort || '-createdAt'}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full px-4 py-2 text-xs border-b border-gray-200 bg-transparent text-black font-medium tracking-wide outline-none focus:border-black cursor-pointer"
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
                className="px-4 py-2 text-xs font-bold tracking-[0.15em] uppercase border border-black hover:bg-black hover:text-white transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-8">
        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-xl font-light tracking-wide text-black mb-6">
            All Products ({pagination.total || products.length})
          </h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-black text-sm tracking-wide">Loading...</div>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedProducts.length === products.length && products.length > 0}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Image</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Title</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">ASIN</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Price</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, index) => {
                      // Handle Amazon API response format according to backend documentation
                      // Amazon products have structure: { ASIN, DetailPageURL, Images, ItemInfo, Offers, CustomerReviews, ... }
                      const productId = product._id || product.id || product.ASIN || product.asin || `amazon-${index}`
                      const productAsin = product.ASIN || product.asin || 'N/A'
                      
                      // Extract title from ItemInfo.Title.DisplayValue (Amazon API format)
                      const productTitle = product.ItemInfo?.Title?.DisplayValue || 
                                         product.title || 
                                         product.Title?.DisplayValue ||
                                         product.Title ||
                                         'N/A'
                      
                      // Extract image from Images.Primary.Large.URL or Medium.URL (Amazon API format)
                      const productImage = product.Images?.Primary?.Large?.URL || 
                                         product.Images?.Primary?.Medium?.URL ||
                                         product.Images?.Primary?.Small?.URL ||
                                         product.imageUrl || 
                                         product.image || 
                                         null
                      
                      // Extract price from Offers.Listings[0].Price (Amazon API format)
                      const productPrice = product.Offers?.Listings?.[0]?.Price?.DisplayAmount || 
                                        product.Offers?.Listings?.[0]?.Price?.Amount ||
                                        product.Price?.DisplayAmount || 
                                        product.Price?.Amount || 
                                        product.price || 
                                        null
                      const isSelected = selectedProducts.includes(productId)
                      const hasLocalId = product._id || product.id
                      
                      return (
                        <tr 
                          key={productId} 
                          className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                            isSelected ? 'bg-gray-100' : ''
                          }`}
                        >
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
                              <img 
                                src={productImage} 
                                alt={productTitle} 
                                className="w-12 h-12 object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                  e.target.nextSibling.style.display = 'flex'
                                }}
                              />
                            ) : null}
                            <div className="w-12 h-12 flex items-center justify-center bg-gray-100 text-2xl" style={{ display: productImage ? 'none' : 'flex' }}>
                              📦
                            </div>
                          </td>
                          <td className="px-4 py-4 text-black font-medium max-w-xs truncate" title={productTitle}>
                            {productTitle}
                          </td>
                          <td className="px-4 py-4 text-black font-mono text-sm">{productAsin}</td>
                          <td className="px-4 py-4 text-black font-medium">
                            {productPrice ? (typeof productPrice === 'string' ? productPrice : formatCurrency(productPrice)) : 'N/A'}
                          </td>
                          <td className="px-4 py-4">
                            {hasLocalId ? (
                              <span className="text-xs font-bold uppercase tracking-wider text-black">
                                {product.status || 'active'}
                              </span>
                            ) : (
                              <span className="text-xs font-bold uppercase tracking-wider text-black">
                                Amazon
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-400">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total || products.length)} of{' '}
                    {pagination.total || products.length} products
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 text-xs font-bold tracking-wide uppercase border border-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black hover:text-white transition-colors"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= pagination.page - 1 && page <= pagination.page + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 text-xs font-bold tracking-wide uppercase border ${
                              pagination.page === page
                                ? 'bg-black text-white border-black'
                                : 'border-black hover:bg-black hover:text-white'
                            } transition-colors`}
                          >
                            {page}
                          </button>
                        )
                      } else if (page === pagination.page - 2 || page === pagination.page + 2) {
                          return <span key={page} className="px-2 text-black">...</span>
                        }
                        return null
                      })}
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === totalPages}
                      className="px-4 py-2 text-xs font-bold tracking-wide uppercase border border-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black hover:text-white transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-center py-12 text-gray-400 italic">No products found</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Products

