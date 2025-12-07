/**
 * Centralized HTTP Client with interceptors and error handling
 */
import { API_BASE_URL, APP_CONFIG } from '../config'
import { STORAGE_KEYS } from '../constants'
import { getStorageString, removeStorageItem } from '../utils/storage'
import { getErrorMessage, isAuthError } from '../utils/errorHandler'

/**
 * Custom HTTP Error class
 */
export class HttpError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.data = data
  }
}

/**
 * Create headers for API requests
 * @param {Object} additionalHeaders - Additional headers to include
 * @returns {Object} Headers object
 */
const createHeaders = (additionalHeaders = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...additionalHeaders,
  }

  const token = getStorageString(STORAGE_KEYS.ADMIN_TOKEN)
  if (token) {
    headers.Authorization = `${APP_CONFIG.TOKEN_PREFIX} ${token}`
  }

  return headers
}

/**
 * Handle API response
 * @param {Response} response - Fetch response
 * @returns {Promise<any>} Parsed response data
 */
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type')
  const isJson = contentType && contentType.includes('application/json')
  
  let data
  try {
    data = isJson ? await response.json() : await response.text()
  } catch (error) {
    data = null
  }

  if (!response.ok) {
    // Handle authentication errors
    if (response.status === 401) {
      // Clear auth data
      removeStorageItem(STORAGE_KEYS.ADMIN_TOKEN)
      removeStorageItem(STORAGE_KEYS.ADMIN_USER)
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    const errorMessage = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`
    throw new HttpError(errorMessage, response.status, data)
  }

  return data
}

/**
 * HTTP Client class
 */
class HttpClient {
  constructor(baseURL) {
    this.baseURL = baseURL
  }

  /**
   * Make HTTP request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<any>} Response data
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      ...options,
      headers: createHeaders(options.headers),
    }

    try {
      const response = await fetch(url, config)
      return await handleResponse(response)
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      
      // Network or other errors
      throw new HttpError(
        error.message || 'Network error occurred',
        null,
        null
      )
    }
  }

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Additional options
   * @returns {Promise<any>} Response data
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'GET',
      ...options,
    })
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {any} data - Request body
   * @param {Object} options - Additional options
   * @returns {Promise<any>} Response data
   */
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    })
  }

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {any} data - Request body
   * @param {Object} options - Additional options
   * @returns {Promise<any>} Response data
   */
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    })
  }

  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {any} data - Request body
   * @param {Object} options - Additional options
   * @returns {Promise<any>} Response data
   */
  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    })
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {any} data - Request body (optional)
   * @param {Object} options - Additional options
   * @returns {Promise<any>} Response data
   */
  async delete(endpoint, data, options = {}) {
    const requestOptions = {
      method: 'DELETE',
      ...options,
    }
    
    // Add body if data is provided
    if (data !== undefined) {
      requestOptions.body = JSON.stringify(data)
    }
    
    return this.request(endpoint, requestOptions)
  }
}

// Create and export singleton instance
export const httpClient = new HttpClient(API_BASE_URL)

