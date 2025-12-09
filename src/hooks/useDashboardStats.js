/**
 * Custom hook for fetching dashboard statistics
 * Simplified to match React Native pattern
 */
import { useState, useEffect, useCallback } from 'react'
import { apiCall } from '../services/api'

/**
 * Hook to fetch and manage dashboard statistics
 * @returns {Object} Dashboard stats data, loading state, error state, and refetch function
 */
export function useDashboardStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiCall('/api/admin/dashboard', { method: 'GET' })
      
      if (response.ok && response.data) {
        const data = response.data
        setStats({
          totalUsers: data.totalUsers || 0,
          totalProducts: data.totalProducts || 0,
          totalOrders: data.totalOrders || 0,
          totalRevenue: data.totalRevenue || 0,
        })
      } else {
        setError(response.data?.message || 'Failed to load dashboard statistics')
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard statistics')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  }
}


