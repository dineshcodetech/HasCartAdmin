/**
 * Custom hook for fetching referral statistics with filters
 */
import { useState, useEffect, useCallback } from 'react'
import { apiCall } from '../services/api'

export function useReferralStats(initialFilters = {}) {
    const [stats, setStats] = useState({
        totalClicks: 0,
        userCount: 0,
        agentCount: 0
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [filters, setFilters] = useState({
        asin: initialFilters.asin || '',
        startDate: initialFilters.startDate || '',
        endDate: initialFilters.endDate || ''
    })

    const fetchReferralStats = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const queryParams = new URLSearchParams()
            if (filters.asin) queryParams.append('asin', filters.asin)
            if (filters.startDate) queryParams.append('startDate', filters.startDate)
            if (filters.endDate) queryParams.append('endDate', filters.endDate)

            const response = await apiCall(`/api/admin/referral-stats?${queryParams}`)

            if (response.ok && response.data?.success) {
                setStats(response.data.data)
            } else {
                setError(response.data?.message || 'Failed to load referral statistics')
            }
        } catch (err) {
            setError(err.message || 'Failed to load referral statistics')
        } finally {
            setLoading(false)
        }
    }, [filters])

    useEffect(() => {
        fetchReferralStats()
    }, [fetchReferralStats])

    return {
        stats,
        loading,
        error,
        filters,
        setFilters,
        refetch: fetchReferralStats
    }
}
