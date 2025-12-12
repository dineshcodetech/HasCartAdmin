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
  CATEGORIES: '/categories',
  ANALYTICS: '/analytics',
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
  ADMIN_PRODUCTS: '/api/admin/products',
  ADMIN_CATEGORIES: '/api/admin/categories',
  ADMIN_ANALYTICS_CLICKS: '/api/admin/analytics/clicks',
  USERS: '/api/users',
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

/**
 * Amazon Search Index (Category) values
 * Used for filtering products by Amazon category
 */
export const AMAZON_SEARCH_INDEX = {
  ALL: 'All',
  ELECTRONICS: 'Electronics',
  BOOKS: 'Books',
  CLOTHING: 'Clothing',
  HOME_GARDEN: 'HomeGarden',
  SPORTS_OUTDOORS: 'SportsOutdoors',
  AUTOMOTIVE: 'Automotive',
  BEAUTY: 'Beauty',
  HEALTH_PERSONAL_CARE: 'HealthPersonalCare',
  TOYS_GAMES: 'ToysGames',
  COMPUTERS: 'Computers',
  MUSIC: 'Music',
  MOVIES_TV: 'MoviesTV',
  VIDEO_GAMES: 'VideoGames',
  PET_SUPPLIES: 'PetSupplies',
  OFFICE_PRODUCTS: 'OfficeProducts',
  TOOLS_HOME_IMPROVEMENT: 'ToolsHomeImprovement',
  BABY: 'Baby',
  GROCERY_GOURMET_FOOD: 'GroceryGourmetFood',
  JEWELRY: 'Jewelry',
  WATCHES: 'Watches',
  SHOES: 'Shoes',
  HANDMADE: 'Handmade',
  INDUSTRIAL: 'Industrial',
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
  {
    path: ROUTES.CATEGORIES,
    label: 'Categories',
    icon: '📁',
  },
  {
    path: ROUTES.ANALYTICS,
    label: 'Analytics',
    icon: '📈',
  },
]

