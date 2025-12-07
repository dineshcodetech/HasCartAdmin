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
    sort: initialFilters.sort || '-createdAt',
    status: initialFilters.status || '',
    category: initialFilters.category || '',
    brand: initialFilters.brand || '',
    search: initialFilters.search || '',
    minPrice: initialFilters.minPrice || '',
    maxPrice: initialFilters.maxPrice || '',
    condition: initialFilters.condition || '',
    ...initialFilters,
  })

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sort: filters.sort,
        ...(filters.status && { status: filters.status }),
        ...(filters.category && { category: filters.category }),
        ...(filters.brand && { brand: filters.brand }),
        ...(filters.search && { search: filters.search }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.condition && { condition: filters.condition }),
      }
      
      const response = await productService.getAllProducts(params)
      
      // Handle different response formats
      if (response.products && Array.isArray(response.products)) {
        setProducts(response.products)
        setPagination(prev => ({
          ...prev,
          total: response.total || response.products.length,
          totalPages: response.totalPages || Math.ceil((response.total || response.products.length) / pagination.limit),
        }))
      } else if (Array.isArray(response)) {
        setProducts(response)
        setPagination(prev => ({
          ...prev,
          total: response.length,
          totalPages: Math.ceil(response.length / pagination.limit),
        }))
      } else {
        setProducts(response.data || [])
        setPagination(prev => ({
          ...prev,
          total: response.total || 0,
          totalPages: response.totalPages || 0,
        }))
      }
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


