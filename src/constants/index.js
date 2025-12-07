/**
 * Application Constants
 * Centralized constants for routes, storage keys, API endpoints, etc.
 */
import { APP_CONFIG } from '../config'

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  USERS: '/users',
  AGENTS: '/agents',
  PRODUCTS: '/products',
  ROOT: '/',
}

export const STORAGE_KEYS = {
  ADMIN_TOKEN: 'adminToken',
  ADMIN_USER: 'adminUser',
}

export const API_ENDPOINTS = {
  ADMIN_LOGIN: '/api/admin/login',
  ADMIN_DASHBOARD: '/api/admin/dashboard',
  ADMIN_USERS: '/api/admin/users',
  ADMIN_AGENTS: '/api/admin/agents',
  ADMIN_PRODUCTS: '/api/admin/products',
  USERS: '/api/users',
  AGENTS: '/api/agents',
}

export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
}

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  AGENT: 'agent',
}

export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
}

export const PRODUCT_CONDITION = {
  NEW: 'new',
  USED: 'used',
  REFURBISHED: 'refurbished',
}

export const MENU_ITEMS = [
  {
    path: ROUTES.DASHBOARD,
    label: 'Dashboard',
    icon: '📊',
  },
  {
    path: ROUTES.USERS,
    label: 'Users',
    icon: '👥',
  },
  {
    path: ROUTES.AGENTS,
    label: 'Agents',
    icon: '🤝',
  },
  {
    path: ROUTES.PRODUCTS,
    label: 'Products',
    icon: '📦',
  },
]

