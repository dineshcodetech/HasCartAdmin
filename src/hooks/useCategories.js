/**
 * useCategories Hook
 * Handles category data fetching and management
 */
import { useState, useEffect, useCallback } from 'react'
import { apiCall } from '../services/api'
import { API_ENDPOINTS } from '../constants'

export function useCategories() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0,
    })

    const fetchCategories = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const queryParams = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
            })

            const response = await apiCall(`${API_ENDPOINTS.ADMIN_CATEGORIES}?${queryParams}`)

            if (response.ok && response.data.success) {
                setCategories(response.data.data.categories || [])
                setPagination(prev => ({
                    ...prev,
                    ...response.data.data.pagination,
                }))
            } else {
                setError(response.data?.message || 'Failed to fetch categories')
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch categories')
        } finally {
            setLoading(false)
        }
    }, [pagination.page, pagination.limit])

    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    const createCategory = async (categoryData) => {
        try {
            const response = await apiCall(API_ENDPOINTS.ADMIN_CATEGORIES, {
                method: 'POST',
                body: JSON.stringify(categoryData),
            })

            if (response.ok && response.data.success) {
                await fetchCategories()
                return { success: true, data: response.data.data }
            } else {
                return { success: false, error: response.data?.message || 'Failed to create category' }
            }
        } catch (err) {
            return { success: false, error: err.message || 'Failed to create category' }
        }
    }

    const updateCategory = async (id, categoryData) => {
        try {
            const response = await apiCall(`${API_ENDPOINTS.ADMIN_CATEGORIES}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(categoryData),
            })

            if (response.ok && response.data.success) {
                await fetchCategories()
                return { success: true, data: response.data.data }
            } else {
                return { success: false, error: response.data?.message || 'Failed to update category' }
            }
        } catch (err) {
            return { success: false, error: err.message || 'Failed to update category' }
        }
    }

    const deleteCategory = async (id) => {
        try {
            const response = await apiCall(`${API_ENDPOINTS.ADMIN_CATEGORIES}/${id}`, {
                method: 'DELETE',
            })

            if (response.ok && response.data.success) {
                await fetchCategories()
                return { success: true }
            } else {
                return { success: false, error: response.data?.message || 'Failed to delete category' }
            }
        } catch (err) {
            return { success: false, error: err.message || 'Failed to delete category' }
        }
    }

    const updatePagination = (newPagination) => {
        setPagination(prev => ({ ...prev, ...newPagination }))
    }

    return {
        categories,
        loading,
        error,
        pagination,
        refetch: fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory,
        updatePagination,
    }
}

export default useCategories
