/**
 * Custom hook for fetching dashboard statistics
 * Provides loading, error, and data states
 */
import { useState, useEffect, useCallback } from 'react'
import { adminService } from '../services/api'
import { getErrorMessage } from '../utils/errorHandler'

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
      const data = await adminService.getDashboardStats()
      
      setStats({
        totalUsers: data.totalUsers || 0,
        totalProducts: data.totalProducts || 0,
        totalOrders: data.totalOrders || 0,
        totalRevenue: data.totalRevenue || 0,
      })
    } catch (err) {
      const errorMessage = getErrorMessage(err) || 'Failed to load dashboard statistics'
      setError(errorMessage)
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


