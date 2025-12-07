/**
 * Custom hook for fetching and managing users
 * Provides loading, error, and data states with refetch capability
 */
import { useState, useEffect, useCallback } from 'react'
import { userService } from '../services/api'
import { getErrorMessage } from '../utils/errorHandler'

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
      const data = await userService.getAllUsers()
      
      // Handle different response formats
      const usersList = Array.isArray(data) 
        ? data 
        : data.users || data.data || []
      
      setUsers(usersList)
    } catch (err) {
      const errorMessage = getErrorMessage(err) || 'Failed to load users'
      setError(errorMessage)
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


