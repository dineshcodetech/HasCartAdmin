/**
 * Custom hook for fetching and managing agents
 * Simplified to match React Native pattern
 */
import { useState, useEffect, useCallback } from 'react'
import { apiCall } from '../services/api'

/**
 * Hook to fetch and manage agents list
 * @returns {Object} Agents data, loading state, error state, and refetch function
 */
export function useAgents() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiCall('/api/admin/users', { method: 'GET' })
      
      if (response.ok && response.data) {
        const data = response.data
        const usersList = Array.isArray(data) 
          ? data 
          : data.users || data.data || []
        // Filter by role="agent"
        const agentsList = usersList.filter(user => user.role === 'agent')
        setAgents(agentsList)
      } else {
        setError(response.data?.message || 'Failed to load agents')
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


