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
    totalAdmins: 0,
    totalAgents: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalCategories: 0,
    totalClicks: 0,
    clicksBreakdown: {
      today: 0,
      week: 0,
      month: 0,
      year: 0
    },
    earningsToday: 0,
    recentUsers: [],
    recentClicks: [],
    topProducts: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiCall('/api/admin/dashboard', { method: 'GET' })

      if (response.ok && response.data && response.data.success) {
        const data = response.data.data
        setStats({
          totalUsers: data.totalUsers || 0,
          totalAdmins: data.totalAdmins || 0,
          totalAgents: data.totalAgents || 0,
          totalCustomers: data.totalCustomers || 0,
          totalProducts: data.totalProducts || 0,
          totalCategories: data.totalCategories || 0,
          totalClicks: data.totalClicks || 0,
          clicksBreakdown: data.clicksBreakdown || { today: 0, week: 0, month: 0, year: 0 },
          earningsToday: data.earningsToday || 0,
          recentUsers: data.recentUsers || [],
          recentClicks: data.recentClicks || [],
          topProducts: data.topProducts || [],
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


