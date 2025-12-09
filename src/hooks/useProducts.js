/**
 * Custom hook for fetching and managing products
 * Simplified to match React Native pattern
 */
import { useState, useEffect, useCallback } from 'react'
import { apiCall } from '../services/api'

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
      
      // Build query string - matches React Native pattern
      const queryParams = new URLSearchParams()
      const keywords = filters.search || filters.keywords || 'all'
      queryParams.append('keywords', keywords)
      queryParams.append('itemCount', pagination.limit)
      queryParams.append('page', pagination.page)
      
      if (filters.searchIndex || filters.category) {
        queryParams.append('searchIndex', filters.searchIndex || filters.category)
      }
      if (filters.brand) queryParams.append('brand', filters.brand)
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice)
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice)
      
      const response = await apiCall(`/api/admin/products?${queryParams.toString()}`, {
        method: 'GET',
      })
      
      // Handle response - simplified pattern
      let productsData = []
      let totalCount = 0
      
      if (response.ok && response.data) {
        const data = response.data
        
        // Handle different response formats
        if (data.success) {
          if (data.data && Array.isArray(data.data)) {
            productsData = data.data
            totalCount = data.pagination?.total || data.data.length
          } else if (data.data?.SearchResult?.Items) {
            productsData = data.data.SearchResult.Items
            totalCount = data.data.SearchResult.TotalResultCount || productsData.length
          }
        } else if (Array.isArray(data)) {
          productsData = data
          totalCount = data.length
        } else if (data.data && Array.isArray(data.data)) {
          productsData = data.data
          totalCount = data.total || data.data.length
        }
      }
      
      setProducts(productsData)
      setPagination(prev => ({
        ...prev,
        total: totalCount,
        totalPages: Math.ceil(totalCount / prev.limit) || 1,
      }))
    } catch (err) {
      setError(err.message || 'Failed to load products')
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


