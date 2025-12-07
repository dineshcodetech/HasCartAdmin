/**
 * Custom hook for fetching and managing products
 * Provides loading, error, pagination, filtering, and data states
 */
import { useState, useEffect, useCallback } from 'react'
import { productService } from '../services/api'
import { getErrorMessage } from '../utils/errorHandler'

/**
 * Hook to fetch and manage products list with pagination and filtering
 * @param {Object} initialFilters - Initial filter parameters
 * @returns {Object} Products data, pagination, loading, error states, and refetch function
 */
export function useProducts(initialFilters = {}) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: initialFilters.page || 1,
    limit: initialFilters.limit || 10,
    total: 0,
    totalPages: 0,
  })
  const [filters, setFilters] = useState({
    keywords: initialFilters.keywords || '',
    search: initialFilters.search || '',
    searchIndex: initialFilters.searchIndex || initialFilters.category || '',
    category: initialFilters.category || '',
    brand: initialFilters.brand || '',
    minPrice: initialFilters.minPrice || '',
    maxPrice: initialFilters.maxPrice || '',
    sort: initialFilters.sort || '-createdAt',
    status: initialFilters.status || '',
    condition: initialFilters.condition || '',
    ...initialFilters,
  })

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Map filters to Amazon API parameters
      const params = {
        page: pagination.page,
        itemCount: pagination.limit,
        // Use search as keywords if provided, otherwise use keywords filter
        keywords: filters.search || filters.keywords || 'all',
        // Map category to searchIndex (Amazon category)
        ...(filters.category && { searchIndex: filters.category }),
        ...(filters.brand && { brand: filters.brand }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
      }
      
      const response = await productService.getAllProducts(params)
      
      // Handle API response formats according to backend documentation
      // Admin endpoint: { success: true, pagination: {...}, data: [...] }
      // Public endpoint: { success: true, page: 1, data: { SearchResult: { Items: [...] } } }
      let productsData = []
      let totalCount = 0
      let currentPage = pagination.page
      let totalPages = 0
      let limit = pagination.limit
      
      if (response.success) {
        // Admin endpoint response format
        if (response.pagination && Array.isArray(response.data)) {
          productsData = response.data
          totalCount = response.pagination.total || response.data.length
          currentPage = response.pagination.page || currentPage
          totalPages = response.pagination.pages || Math.ceil(totalCount / limit) || 1
          limit = response.pagination.limit || limit
        }
        // Public endpoint response format
        else if (response.data && response.data.SearchResult && response.data.SearchResult.Items) {
          productsData = response.data.SearchResult.Items
          totalCount = response.data.SearchResult.TotalResultCount || productsData.length
          currentPage = response.page || currentPage
          totalPages = Math.ceil(totalCount / limit) || 1
        }
        // Direct data array (backward compatibility)
        else if (Array.isArray(response.data)) {
          productsData = response.data
          totalCount = response.total || productsData.length
          totalPages = Math.ceil(totalCount / limit) || 1
        }
        // Legacy formats for backward compatibility
        else if (Array.isArray(response)) {
          productsData = response
          totalCount = response.length
          totalPages = Math.ceil(totalCount / limit) || 1
        } else if (response.products && Array.isArray(response.products)) {
          productsData = response.products
          totalCount = response.total || response.products.length
          totalPages = Math.ceil(totalCount / limit) || 1
        } else if (response.SearchResult && response.SearchResult.Items) {
          productsData = response.SearchResult.Items
          totalCount = response.SearchResult.TotalResultCount || productsData.length
          totalPages = Math.ceil(totalCount / limit) || 1
        }
      } else {
        // Handle non-standard responses
        if (Array.isArray(response)) {
          productsData = response
          totalCount = response.length
        } else if (response.data && Array.isArray(response.data)) {
          productsData = response.data
          totalCount = response.total || response.data.length
        } else {
          productsData = []
          totalCount = 0
        }
        totalPages = Math.ceil(totalCount / limit) || 1
      }
      
      setProducts(productsData)
      setPagination(prev => ({
        page: currentPage,
        limit: limit,
        total: totalCount,
        totalPages: totalPages || Math.ceil(totalCount / limit) || 1,
      }))
    } catch (err) {
      const errorMessage = getErrorMessage(err) || 'Failed to load products'
      setError(errorMessage)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, filters])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to page 1 when filters change
  }, [])

  const updatePagination = useCallback((newPagination) => {
    setPagination(prev => ({ ...prev, ...newPagination }))
  }, [])

  const refetch = useCallback(() => {
    fetchProducts()
  }, [fetchProducts])

  return {
    products,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    updatePagination,
    refetch,
  }
}


