/**
 * Custom hook for fetching and managing users
 * Simplified to match React Native pattern
 */
import { useState, useEffect, useCallback } from 'react'
import { apiCall } from '../services/api'

/**
 * Hook to fetch and manage users list
 * @returns {Object} Users data, loading state, error state, and refetch function
 */
export function useUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiCall('/api/admin/users', { method: 'GET' })
      
      if (response.ok && response.data) {
        const data = response.data
        const usersList = Array.isArray(data) 
          ? data 
          : data.users || data.data || []
        setUsers(usersList)
      } else {
        setError(response.data?.message || 'Failed to load users')
      }
    } catch (err) {
      setError(err.message || 'Failed to load users')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
  }
}


