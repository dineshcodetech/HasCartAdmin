import { useState, useEffect, useCallback } from 'react'
import { apiCall } from '../services/api'

/**
 * Hook to fetch and manage agents list (filtered users)
 */
export function useAgents() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      // Call users API with agent role and high limit for dropdowns
      const response = await apiCall('/api/admin/users?role=agent&limit=1000', { method: 'GET' })

      if (response.ok && response.data?.data) {
        setAgents(response.data.data.users || [])
      } else {
        setAgents([])
      }
    } catch (err) {
      setError(err.message || 'Failed to load agents')
      setAgents([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  return {
    agents,
    loading,
    error,
    refetch: fetchAgents,
  }
}
