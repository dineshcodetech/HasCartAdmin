/**
 * Authentication Context
 * Simplified to match React Native pattern
 */
import { createContext, useContext, useState, useEffect } from 'react'
import { STORAGE_KEYS } from '../constants'
import { getStorageItem, getStorageString, setStorageString, setStorageItem, removeStorageItem } from '../utils/storage'
import { apiCall } from '../services/api'

const AuthContext = createContext(null)

/**
 * AuthProvider Component
 * Provides authentication context to the application
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  /**
   * Initialize auth state from storage - matches React Native pattern
   */
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const storedToken = getStorageString(STORAGE_KEYS.ADMIN_TOKEN)
        const userData = getStorageItem(STORAGE_KEYS.ADMIN_USER)

        if (storedToken && userData) {
          setUser(userData)
          setToken(storedToken)
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
          setUser(null)
          setToken(null)
        }
      } catch (error) {
        console.error('Error checking auth status:', error)
        setIsAuthenticated(false)
        setUser(null)
        setToken(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  /**
   * Login user with email and password - simplified pattern
   */
  const login = async (email, password) => {
    try {
      const response = await apiCall('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      if (response.ok && response.data) {
        const data = response.data
        const newToken = data.token || data.data?.token
        const admin = data.admin || data.user || data.data?.admin || data.data?.user || data.data

        if (newToken) {
          setStorageString(STORAGE_KEYS.ADMIN_TOKEN, newToken)
          setToken(newToken)
          if (admin) {
            setStorageItem(STORAGE_KEYS.ADMIN_USER, admin)
            setUser(admin)
          }
          setIsAuthenticated(true)
          return { token: newToken, admin }
        } else {
          throw new Error(data.message || 'No token received')
        }
      } else {
        throw new Error(response.data?.message || 'Authentication failed')
      }
    } catch (error) {
      removeStorageItem(STORAGE_KEYS.ADMIN_TOKEN)
      removeStorageItem(STORAGE_KEYS.ADMIN_USER)
      setIsAuthenticated(false)
      setUser(null)
      setToken(null)
      throw error
    }
  }

  /**
   * Logout user and clear stored data
   */
  const logout = () => {
    setUser(null)
    setToken(null)
    setIsAuthenticated(false)
    removeStorageItem(STORAGE_KEYS.ADMIN_TOKEN)
    removeStorageItem(STORAGE_KEYS.ADMIN_USER)
  }

  const value = {
    user,
    token, // Expose token
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
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
