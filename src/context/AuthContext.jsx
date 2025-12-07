/**
 * Authentication Context
 * Manages authentication state and provides authentication methods
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { adminService } from '../services/api'
import { STORAGE_KEYS } from '../constants'
import { getStorageItem, getStorageString, setStorageString, setStorageItem, removeStorageItem } from '../utils/storage'
import { getErrorMessage } from '../utils/errorHandler'

const AuthContext = createContext(null)

/**
 * AuthProvider Component
 * Provides authentication context to the application
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  /**
   * Initialize auth state from storage
   */
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const savedUser = getStorageItem(STORAGE_KEYS.ADMIN_USER)
        const savedToken = getStorageString(STORAGE_KEYS.ADMIN_TOKEN)
        
        if (savedUser && savedToken && typeof savedToken === 'string' && savedToken.trim().length > 0) {
          setUser(savedUser)
          setIsAuthenticated(true)
        } else {
          // Clear invalid or missing data
          if (savedUser || savedToken) {
            console.warn('Invalid or incomplete auth data found, clearing storage...')
            removeStorageItem(STORAGE_KEYS.ADMIN_USER)
            removeStorageItem(STORAGE_KEYS.ADMIN_TOKEN)
          }
          setIsAuthenticated(false)
          setUser(null)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        // Clear invalid stored data
        removeStorageItem(STORAGE_KEYS.ADMIN_USER)
        removeStorageItem(STORAGE_KEYS.ADMIN_TOKEN)
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User and token data
   */
  const login = useCallback(async (email, password) => {
    try {
      const response = await adminService.login(email, password)
      
      // Handle different response structures
      // Structure 1: { token, admin }
      // Structure 2: { data: { token, admin } }
      // Structure 3: { token, user } or { token, admin: {...} }
      // Structure 4: { token, data: { id, name, email, ... } } - user data directly in data
      let token, admin
      
      if (response.token && (response.admin || response.user)) {
        // Structure 1 & 3: token and admin/user at top level
        token = response.token
        admin = response.admin || response.user
      } else if (response.token && response.data && !response.data.token) {
        // Structure 4: token at top level, user data directly in data object
        token = response.token
        admin = response.data
      } else if (response.data && response.data.token) {
        // Structure 2: nested in data object
        token = response.data.token
        admin = response.data.admin || response.data.user || response.data
      } else {
        throw new Error('Invalid login response structure')
      }
      
      
      // Validate token exists and is a string
      if (!token || typeof token !== 'string' || token.trim().length === 0) {
        throw new Error('No valid token received from server')
      }
      
      // Store token and user data
      const tokenToStore = token.trim()
      setStorageString(STORAGE_KEYS.ADMIN_TOKEN, tokenToStore)
      setStorageItem(STORAGE_KEYS.ADMIN_USER, admin)
      
      // Verify token was stored correctly
      const storedToken = getStorageString(STORAGE_KEYS.ADMIN_TOKEN)
      if (!storedToken || storedToken !== tokenToStore) {
        console.error('Token storage verification failed')
        removeStorageItem(STORAGE_KEYS.ADMIN_TOKEN)
        removeStorageItem(STORAGE_KEYS.ADMIN_USER)
        throw new Error('Failed to save authentication token. Please try again.')
      }
      
      setUser(admin)
      setIsAuthenticated(true)
      
      return { token: tokenToStore, admin }
    } catch (error) {
      // Clear any partial data on error
      removeStorageItem(STORAGE_KEYS.ADMIN_TOKEN)
      removeStorageItem(STORAGE_KEYS.ADMIN_USER)
      setIsAuthenticated(false)
      setUser(null)
      
      const errorMessage = getErrorMessage(error) || 'Login failed. Please check your credentials.'
      throw new Error(errorMessage)
    }
  }, [])

  /**
   * Logout user and clear stored data
   */
  const logout = useCallback(() => {
    setUser(null)
    setIsAuthenticated(false)
    removeStorageItem(STORAGE_KEYS.ADMIN_TOKEN)
    removeStorageItem(STORAGE_KEYS.ADMIN_USER)
  }, [])

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to access authentication context
 * @returns {Object} Authentication context value
 * @throws {Error} If used outside AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
