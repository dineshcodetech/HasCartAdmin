/**
 * useBanners Hook
 * Handles banner data fetching and management
 */
import { useState, useEffect, useCallback } from 'react'
import { apiCall } from '../services/api'
import { API_ENDPOINTS } from '../constants'

export function useBanners() {
    const [banners, setBanners] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchBanners = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            // Updated to use the correct API endpoint and fetch all banners for admin
            const response = await apiCall(`${API_ENDPOINTS.ADMIN_BANNERS}?all=true`)

            if (response.ok && response.data.success) {
                // Ensure we handle both {data: [...]} and {data: {banners: [...]}} patterns
                const bannerData = Array.isArray(response.data.data)
                    ? response.data.data
                    : (response.data.data?.banners || [])

                setBanners(bannerData)
            } else {
                setError(response.data?.message || 'Failed to fetch banners')
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch banners')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchBanners()
    }, [fetchBanners])

    const createBanner = async (bannerData) => {
        try {
            console.log('Attempting to create banner:', bannerData)
            const response = await apiCall(API_ENDPOINTS.ADMIN_BANNERS, {
                method: 'POST',
                body: JSON.stringify(bannerData),
            })

            console.log('Create banner response:', response)

            if (response.ok && response.data.success) {
                await fetchBanners()
                return { success: true, data: response.data.data }
            } else {
                const errorMsg = response.data?.message || 'Failed to create banner'
                console.error('Create banner error:', errorMsg)
                return { success: false, error: errorMsg }
            }
        } catch (err) {
            console.error('Create banner Exception:', err)
            return { success: false, error: err.message || 'Failed to create banner' }
        }
    }

    const updateBanner = async (id, bannerData) => {
        try {
            const response = await apiCall(`${API_ENDPOINTS.ADMIN_BANNERS}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(bannerData),
            })

            if (response.ok && response.data.success) {
                await fetchBanners()
                return { success: true, data: response.data.data }
            } else {
                return { success: false, error: response.data?.message || 'Failed to update banner' }
            }
        } catch (err) {
            return { success: false, error: err.message || 'Failed to update banner' }
        }
    }

    const deleteBanner = async (id) => {
        try {
            const response = await apiCall(`${API_ENDPOINTS.ADMIN_BANNERS}/${id}`, {
                method: 'DELETE',
            })

            if (response.ok && response.data.success) {
                await fetchBanners()
                return { success: true }
            } else {
                return { success: false, error: response.data?.message || 'Failed to delete banner' }
            }
        } catch (err) {
            return { success: false, error: err.message || 'Failed to delete banner' }
        }
    }

    return {
        banners,
        loading,
        error,
        refetch: fetchBanners,
        createBanner,
        updateBanner,
        deleteBanner,
    }
}

export default useBanners
