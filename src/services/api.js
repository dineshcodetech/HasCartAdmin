/**
 * API Service Layer
 * Centralized API calls using the HTTP client
 */
import { httpClient } from './httpClient'
import { API_ENDPOINTS } from '../constants'

/**
 * Admin API Services
 */
export const adminService = {
  /**
   * Admin login
   * @param {string} email - Admin email
   * @param {string} password - Admin password
   * @returns {Promise<Object>} Login response with token and admin data
   */
  async login(email, password) {
    return await httpClient.post(API_ENDPOINTS.ADMIN_LOGIN, {
      email,
      password,
    })
  },

  /**
   * Get dashboard statistics
   * @returns {Promise<Object>} Dashboard stats
   */
  async getDashboardStats() {
    return await httpClient.get(API_ENDPOINTS.ADMIN_DASHBOARD)
  },
}

/**
 * User API Services
 */
export const userService = {
  /**
   * Get all users
   * @returns {Promise<Array>} List of users
   */
  async getAllUsers() {
    return await httpClient.get(API_ENDPOINTS.ADMIN_USERS)
  },

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async createUser(userData) {
    return await httpClient.post(API_ENDPOINTS.USERS, userData)
  },
}

/**
 * Agent API Services
 * Note: Agents are users with role="agent". All agent operations use the /api/users endpoint.
 */
export const agentService = {
  /**
   * Get all agents
   * Fetches all users and filters by role="agent"
   * @returns {Promise<Array>} List of agents
   */
  async getAllAgents() {
    const response = await httpClient.get(API_ENDPOINTS.ADMIN_USERS)
    // Handle API response format: { success: true, message: "...", data: [...] }
    // Or direct array or other formats for backward compatibility
    const usersList = Array.isArray(response) 
      ? response 
      : response.data || response.users || []
    // Filter by role="agent"
    return usersList.filter(user => user.role === 'agent')
  },

  /**
   * Create a new agent
   * Uses POST /api/users with role="agent"
   * @param {Object} agentData - Agent data (should include role: "agent")
   * @returns {Promise<Object>} Created agent
   */
  async createAgent(agentData) {
    // Ensure role is set to "agent"
    const dataWithRole = {
      ...agentData,
      role: 'agent'
    }
    return await httpClient.post(API_ENDPOINTS.USERS, dataWithRole)
  },
}

/**
 * Product API Services
 * All product APIs fetch data from Amazon Product Advertising API
 */
export const productService = {
  /**
   * Get all products (Admin) - Search and get products from Amazon API
   * @param {Object} params - Query parameters
   * @param {string} params.keywords - Search keywords (default: "all")
   * @param {string} params.search - Alternative to keywords
   * @param {string} params.searchIndex - Amazon search index/category (default: "All")
   * @param {number} params.itemCount - Number of items to return (default: 10)
   * @param {number} params.limit - Alternative to itemCount
   * @param {number} params.minPrice - Minimum price filter
   * @param {number} params.maxPrice - Maximum price filter
   * @param {string} params.brand - Brand filter
   * @param {number} params.page - Page number for pagination (default: 1)
   * @returns {Promise<Object>} Products list from Amazon API
   */
  async getAllProducts(params = {}) {
    const queryParams = new URLSearchParams()
    
    // Map parameters according to API documentation
    if (params.keywords !== undefined && params.keywords !== null && params.keywords !== '') {
      queryParams.append('keywords', params.keywords)
    } else if (params.search !== undefined && params.search !== null && params.search !== '') {
      queryParams.append('search', params.search)
    } else {
      // Default to "all" if no keywords provided
      queryParams.append('keywords', 'all')
    }
    
    if (params.searchIndex) queryParams.append('searchIndex', params.searchIndex)
    if (params.itemCount) queryParams.append('itemCount', params.itemCount)
    if (params.limit) queryParams.append('limit', params.limit)
    if (params.minPrice) queryParams.append('minPrice', params.minPrice)
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice)
    if (params.brand) queryParams.append('brand', params.brand)
    if (params.page) queryParams.append('page', params.page)
    
    const queryString = queryParams.toString()
    const endpoint = queryString 
      ? `${API_ENDPOINTS.ADMIN_PRODUCTS}?${queryString}`
      : `${API_ENDPOINTS.ADMIN_PRODUCTS}?keywords=all`
    
    return await httpClient.get(endpoint)
  },

  /**
   * Search products (Public) - Search products by keyword query
   * @param {Object} params - Query parameters
   * @param {string} params.q - Search query (required)
   * @param {string} params.searchIndex - Amazon search index (default: "All")
   * @param {number} params.itemCount - Number of items (default: 10)
   * @param {number} params.minPrice - Minimum price filter
   * @param {number} params.maxPrice - Maximum price filter
   * @param {string} params.brand - Brand filter
   * @returns {Promise<Object>} Search results from Amazon API
   */
  async searchProducts(params = {}) {
    const queryParams = new URLSearchParams()
    
    if (!params.q) {
      throw new Error('Search query (q) is required')
    }
    
    queryParams.append('q', params.q)
    if (params.searchIndex) queryParams.append('searchIndex', params.searchIndex)
    if (params.itemCount) queryParams.append('itemCount', params.itemCount)
    if (params.minPrice) queryParams.append('minPrice', params.minPrice)
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice)
    if (params.brand) queryParams.append('brand', params.brand)
    
    return await httpClient.get(`/api/products/search?${queryParams.toString()}`)
  },

  /**
   * Get products by category (Public)
   * @param {string} category - Amazon SearchIndex (e.g., "Electronics", "Books", "Clothing", "All")
   * @param {Object} params - Query parameters
   * @param {string} params.keywords - Search keywords (required)
   * @param {number} params.itemCount - Number of items (default: 10)
   * @param {number} params.minPrice - Minimum price filter
   * @param {number} params.maxPrice - Maximum price filter
   * @param {string} params.brand - Brand filter
   * @returns {Promise<Object>} Products filtered by category
   */
  async getProductsByCategory(category, params = {}) {
    if (!params.keywords) {
      throw new Error('Keywords are required for category search')
    }
    
    const queryParams = new URLSearchParams()
    queryParams.append('keywords', params.keywords)
    if (params.itemCount) queryParams.append('itemCount', params.itemCount)
    if (params.minPrice) queryParams.append('minPrice', params.minPrice)
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice)
    if (params.brand) queryParams.append('brand', params.brand)
    
    return await httpClient.get(`/api/products/category/${category}?${queryParams.toString()}`)
  },

  /**
   * Get product by ASIN (Public)
   * @param {string} asin - Amazon ASIN (10-character alphanumeric code)
   * @returns {Promise<Object>} Detailed product information
   */
  async getProductByAsin(asin) {
    if (!asin || asin.length !== 10) {
      throw new Error('Valid ASIN (10 alphanumeric characters) is required')
    }
    return await httpClient.get(`/api/products/${asin}`)
  },

  /**
   * Get product by ASIN (Admin)
   * @param {string} asin - Amazon ASIN (10-character alphanumeric code)
   * @returns {Promise<Object>} Detailed product information
   */
  async getProductByAsinAdmin(asin) {
    if (!asin || asin.length !== 10) {
      throw new Error('Valid ASIN (10 alphanumeric characters) is required')
    }
    return await httpClient.get(`${API_ENDPOINTS.ADMIN_PRODUCTS}/asin/${asin}`)
  },

  /**
   * Get product statistics (Admin)
   * @returns {Promise<Object>} Product statistics information
   */
  async getProductStats() {
    return await httpClient.get(`${API_ENDPOINTS.ADMIN_PRODUCTS}/stats`)
  },

  /**
   * Get product by ID (if stored locally)
   * @param {string} id - Product ID
   * @returns {Promise<Object>} Product data
   */
  async getProductById(id) {
    return await httpClient.get(`${API_ENDPOINTS.ADMIN_PRODUCTS}/${id}`)
  },

  /**
   * Create a new product
   * @param {Object} productData - Product data or ASIN for auto-fetch
   * @returns {Promise<Object>} Created product
   */
  async createProduct(productData) {
    return await httpClient.post(API_ENDPOINTS.ADMIN_PRODUCTS, productData)
  },

  /**
   * Update product
   * @param {string} id - Product ID
   * @param {Object} productData - Fields to update
   * @returns {Promise<Object>} Updated product
   */
  async updateProduct(id, productData) {
    return await httpClient.put(`${API_ENDPOINTS.ADMIN_PRODUCTS}/${id}`, productData)
  },

  /**
   * Delete product
   * @param {string} id - Product ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteProduct(id) {
    return await httpClient.delete(`${API_ENDPOINTS.ADMIN_PRODUCTS}/${id}`)
  },

  /**
   * Bulk delete products
   * @param {Array<string>} productIds - Array of product IDs
   * @returns {Promise<Object>} Bulk deletion result
   */
  async bulkDeleteProducts(productIds) {
    return await httpClient.delete(`${API_ENDPOINTS.ADMIN_PRODUCTS}/bulk`, {
      productIds,
    })
  },

  /**
   * Bulk update product status
   * @param {Array<string>} productIds - Array of product IDs
   * @param {string} status - New status (active/inactive/archived)
   * @returns {Promise<Object>} Bulk update result
   */
  async bulkUpdateStatus(productIds, status) {
    return await httpClient.patch(`${API_ENDPOINTS.ADMIN_PRODUCTS}/bulk/status`, {
      productIds,
      status,
    })
  },

  /**
   * Sync product with Amazon
   * @param {string} id - Product ID
   * @returns {Promise<Object>} Synced product data
   */
  async syncProduct(id) {
    return await httpClient.post(`${API_ENDPOINTS.ADMIN_PRODUCTS}/${id}/sync`)
  },
}

// Legacy exports for backward compatibility
export const adminLogin = async (email, password) => {
  const data = await adminService.login(email, password)
  return { data }
}

export const getDashboardStats = async () => {
  const data = await adminService.getDashboardStats()
  return { data }
}

export const getAllUsers = async () => {
  const data = await userService.getAllUsers()
  return { data }
}

export const createUser = async (userData) => {
  const data = await userService.createUser(userData)
  return { data }
}

export const getAllProducts = async () => {
  const data = await productService.getAllProducts()
  return { data }
}
