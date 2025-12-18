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
  BANNERS: '/banners',
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
  ADMIN_BANNERS: '/api/banners',
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
  APPAREL: 'Apparel',
  APPLIANCES: 'Appliances',
  AUTOMOTIVE: 'Automotive',
  BABY: 'Baby',
  BEAUTY: 'Beauty',
  BOOKS: 'Books',
  COLLECTIBLES: 'Collectibles',
  COMPUTERS: 'Computers',
  ELECTRONICS: 'Electronics',
  EVERYTHING_ELSE: 'EverythingElse',
  FASHION: 'Fashion',
  FURNITURE: 'Furniture',
  GARDEN_AND_OUTDOOR: 'GardenAndOutdoor',
  GIFT_CARDS: 'GiftCards',
  GROCERY_AND_GOURMET_FOOD: 'GroceryAndGourmetFood',
  HEALTH_PERSONAL_CARE: 'HealthPersonalCare',
  HOME_AND_KITCHEN: 'HomeAndKitchen',
  INDUSTRIAL: 'Industrial',
  JEWELRY: 'Jewelry',
  KINDLE_STORE: 'KindleStore',
  LUGGAGE: 'Luggage',
  LUXURY_BEAUTY: 'LuxuryBeauty',
  MOBILE_APPS: 'MobileApps',
  MOVIES_AND_TV: 'MoviesAndTV',
  MUSIC: 'Music',
  MUSICAL_INSTRUMENTS: 'MusicalInstruments',
  OFFICE_PRODUCTS: 'OfficeProducts',
  PET_SUPPLIES: 'PetSupplies',
  SHOES: 'Shoes',
  SOFTWARE: 'Software',
  SPORTS_AND_OUTDOORS: 'SportsAndOutdoors',
  TOOLS_AND_HOME_IMPROVEMENT: 'ToolsAndHomeImprovement',
  TOYS_AND_GAMES: 'ToysAndGames',
  VIDEO_GAMES: 'VideoGames',
  WATCHES: 'Watches',
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
    path: ROUTES.BANNERS,
    label: 'Banners',
    icon: '🖼️',
  },
  {
    path: ROUTES.ANALYTICS,
    label: 'Analytics',
    icon: '📈',
  },
]

