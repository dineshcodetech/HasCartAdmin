// API Configuration
// Matches React Native app pattern - simple and direct
import { API_BASE_URL } from '../config'
import { getStorageString } from '../utils/storage'
import { STORAGE_KEYS } from '../constants'

// Log the API URL for debugging
console.log('API_BASE_URL configured as:', API_BASE_URL)

/**
 * Simple API call function - matches React Native pattern
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response with {data, status, ok}
 */
export const apiCall = async (endpoint, options = {}) => {
  try {
    const token = getStorageString(STORAGE_KEYS.ADMIN_TOKEN)
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...options,
    })

    const data = await response.json()
    return { data, status: response.status, ok: response.ok }
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}
