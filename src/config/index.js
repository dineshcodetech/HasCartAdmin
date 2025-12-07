/**
 * Application Configuration
 * Centralized configuration values
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export const APP_CONFIG = {
  APP_NAME: 'HasCart Admin',
  TOKEN_PREFIX: 'Bearer',
  DEFAULT_PAGE_SIZE: 10,
  DATE_FORMAT: 'en-US',
}

