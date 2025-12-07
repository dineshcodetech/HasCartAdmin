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
 */
export const agentService = {
  /**
   * Get all agents
   * @returns {Promise<Array>} List of agents
   */
  async getAllAgents() {
    return await httpClient.get(API_ENDPOINTS.ADMIN_AGENTS)
  },

  /**
   * Create a new agent
   * @param {Object} agentData - Agent data
   * @returns {Promise<Object>} Created agent
   */
  async createAgent(agentData) {
    return await httpClient.post(API_ENDPOINTS.AGENTS, agentData)
  },
}

/**
 * Product API Services
 */
export const productService = {
  /**
   * Get all products with filters, pagination, and sorting
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Products list with pagination info
   */
  async getAllProducts(params = {}) {
    const queryParams = new URLSearchParams()
    
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })
    
    const queryString = queryParams.toString()
    const endpoint = queryString 
      ? `${API_ENDPOINTS.ADMIN_PRODUCTS}?${queryString}`
      : API_ENDPOINTS.ADMIN_PRODUCTS
    
    return await httpClient.get(endpoint)
  },

  /**
   * Get product by ID
   * @param {string} id - Product ID
   * @returns {Promise<Object>} Product data
   */
  async getProductById(id) {
    return await httpClient.get(`${API_ENDPOINTS.ADMIN_PRODUCTS}/${id}`)
  },

  /**
   * Get product by ASIN
   * @param {string} asin - Amazon ASIN
   * @returns {Promise<Object>} Product data
   */
  async getProductByAsin(asin) {
    return await httpClient.get(`${API_ENDPOINTS.ADMIN_PRODUCTS}/asin/${asin}`)
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
   * Get product statistics
   * @returns {Promise<Object>} Product statistics
   */
  async getProductStats() {
    return await httpClient.get(`${API_ENDPOINTS.ADMIN_PRODUCTS}/stats`)
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
