import { useState, useEffect, useCallback } from 'react'
import { apiCall } from '../services/api'

/**
 * Hook to fetch and manage users list with filtering and pagination
 */
export function useUsers(initialFilters = {}) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 })
  const [filters, setFilters] = useState(initialFilters)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      queryParams.append('page', pagination.page)
      queryParams.append('limit', pagination.limit)

      const response = await apiCall(`/api/admin/users?${queryParams}`, { method: 'GET' })

      if (response.ok && response.data?.data) {
        const { users: list, pagination: pag } = response.data.data
        setUsers(list || [])
        setPagination(pag || { page: 1, limit: 50, total: 0, totalPages: 1 })
      } else {
        // Fallback for old API response format if any
        const data = response.data?.data || response.data || []
        if (Array.isArray(data)) {
          setUsers(data)
        } else if (data.users) {
          setUsers(data.users)
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load users')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.page, pagination.limit])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const updatePagination = (newPag) => {
    setPagination(prev => ({ ...prev, ...newPag }))
  }

  return {
    users,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    updatePagination,
    refetch: fetchUsers,
  }
}
