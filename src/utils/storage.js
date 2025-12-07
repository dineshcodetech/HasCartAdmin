/**
 * Utility functions for localStorage operations
 */

/**
 * Get item from localStorage
 * @param {string} key - Storage key
 * @returns {any|null} Parsed value or null
 */
export const getStorageItem = (key) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error)
    return null
  }
}

/**
 * Set item in localStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 */
export const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error)
  }
}

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 */
export const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error)
  }
}

/**
 * Get string item from localStorage (non-JSON)
 * @param {string} key - Storage key
 * @returns {string|null}
 */
export const getStorageString = (key) => {
  try {
    return localStorage.getItem(key)
  } catch (error) {
    console.error(`Error reading string from localStorage (${key}):`, error)
    return null
  }
}

/**
 * Set string item in localStorage (non-JSON)
 * @param {string} key - Storage key
 * @param {string} value - Value to store
 */
export const setStorageString = (key, value) => {
  try {
    localStorage.setItem(key, value)
  } catch (error) {
    console.error(`Error writing string to localStorage (${key}):`, error)
  }
}

/**
 * Clear all storage items
 */
export const clearStorage = () => {
  try {
    localStorage.clear()
  } catch (error) {
    console.error('Error clearing localStorage:', error)
  }
}

