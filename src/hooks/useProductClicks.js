import { useState, useEffect, useCallback } from 'react'
import { apiCall } from '../services/api'

export function useProductClicks() {
    const [clicks, setClicks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    })

    const [filters, setFilters] = useState({
        category: '',
        agentId: '',
        startDate: '',
        endDate: ''
    })

    // To trigger refetch when filters change
    const [fetchTrigger, setFetchTrigger] = useState(0)

    const fetchClicks = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const queryParams = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
            })

            if (filters.category) queryParams.append('category', filters.category)
            if (filters.agentId) queryParams.append('agentId', filters.agentId)
            if (filters.startDate) queryParams.append('startDate', filters.startDate)
            if (filters.endDate) queryParams.append('endDate', filters.endDate)

            const response = await apiCall(`/api/admin/analytics/clicks?${queryParams}`)

            if (response.ok && response.data?.success) {
                setClicks(response.data.data.clicks)
                setPagination(prev => ({ ...prev, ...response.data.data.pagination }))
            } else {
                setError(response.data?.message || 'Failed to load click data')
            }
        } catch (err) {
            setError(err.message || 'Failed to load click data')
        } finally {
            setLoading(false)
        }
    }, [pagination.page, pagination.limit, filters, fetchTrigger]) // dependent on page/limit/filters

    useEffect(() => {
        fetchClicks()
    }, [fetchClicks])

    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }))
        setPagination(prev => ({ ...prev, page: 1 })) // Reset to page 1 on filter change
        // Using fetchTrigger isn't strictly necessary if added to dependency array, but safer
    }

    const updatePage = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }))
    }

    return {
        clicks,
        loading,
        error,
        pagination,
        filters,
        updateFilter,
        updatePage,
        refetch: fetchClicks
    }
}
