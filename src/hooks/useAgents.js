/**
 * Custom hook for fetching and managing agents
 * Provides loading, error, and data states with refetch capability
 */
import { useState, useEffect, useCallback } from 'react'
import { agentService } from '../services/api'
import { getErrorMessage } from '../utils/errorHandler'

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
      // getAllAgents already returns a filtered array of agents
      const agentsList = await agentService.getAllAgents()
      
      // Ensure we have an array
      setAgents(Array.isArray(agentsList) ? agentsList : [])
    } catch (err) {
      const errorMessage = getErrorMessage(err) || 'Failed to load agents'
      setError(errorMessage)
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


