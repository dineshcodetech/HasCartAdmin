/**
 * Utility functions for error handling
 */

/**
 * Extracts error message from error object
 * @param {Error|Object} error - Error object
 * @returns {string} Error message
 */
export const getErrorMessage = (error) => {
  if (typeof error === 'string') return error
  
  if (error?.response?.data) {
    const data = error.response.data
    
    // Handle validation errors
    if (data.errors && typeof data.errors === 'object') {
      const errorMessages = Object.values(data.errors).flat()
      return errorMessages.join(', ')
    }
    
    return data.message || data.error || 'An error occurred'
  }
  
  return error?.message || 'An unexpected error occurred'
}

/**
 * Checks if error is an authentication error
 * @param {Error|Object} error - Error object
 * @returns {boolean}
 */
export const isAuthError = (error) => {
  return error?.response?.status === 401 || error?.response?.status === 403
}

