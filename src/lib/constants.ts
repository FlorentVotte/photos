/**
 * Application-wide constants
 * Centralizes magic numbers and configuration values
 */

// Time constants (in milliseconds)
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
} as const;

// Rate limiting
export const RATE_LIMITS = {
  /** Login attempts: 5 per 15 minutes */
  LOGIN_WINDOW_MS: 15 * TIME.MINUTE,
  LOGIN_MAX_ATTEMPTS: 5,
  /** Sync requests: 1 per minute */
  SYNC_WINDOW_MS: TIME.MINUTE,
} as const;

// Sync configuration
export const SYNC = {
  /** Default interval for watch mode (30 minutes) */
  DEFAULT_INTERVAL_MS: 30 * TIME.MINUTE,
  /** Timeout for sync process (5 minutes) */
  PROCESS_TIMEOUT_MS: 5 * TIME.MINUTE,
  /** Initial retry delay for rendition polling */
  INITIAL_RETRY_DELAY_MS: TIME.SECOND,
  /** Maximum retry delay for rendition polling */
  MAX_RETRY_DELAY_MS: 5 * TIME.SECOND,
  /** Maximum wait time for rendition generation */
  MAX_RENDITION_WAIT_MS: 30 * TIME.SECOND,
} as const;

// Search and pagination
export const PAGINATION = {
  /** Default search results limit */
  SEARCH_LIMIT: 50,
  /** Photos per page in infinite scroll */
  PHOTOS_PER_PAGE: 20,
  /** Adobe API album fetch limit */
  ADOBE_ALBUM_LIMIT: 1000,
} as const;

// Validation limits
export const VALIDATION = {
  MAX_TITLE_LENGTH: 200,
  MAX_SUBTITLE_LENGTH: 500,
  MAX_DESCRIPTION_LENGTH: 5000,
  MAX_LOCATION_LENGTH: 200,
  MAX_DATE_LENGTH: 100,
  MAX_ID_LENGTH: 100,
  MAX_PATH_LENGTH: 500,
} as const;

// UI/Animation
export const UI = {
  /** Default slideshow interval */
  SLIDESHOW_INTERVAL_MS: 4 * TIME.SECOND,
  /** Transition duration for animations */
  TRANSITION_DURATION_MS: 300,
  /** Minimum swipe distance for touch navigation */
  MIN_SWIPE_DISTANCE_PX: 50,
  /** Double-tap detection window */
  DOUBLE_TAP_WINDOW_MS: 300,
  /** Maximum zoom level */
  MAX_ZOOM_SCALE: 4,
} as const;

// Session/Auth
export const AUTH = {
  /** Session token expiry (2 hours) */
  SESSION_EXPIRY_SECONDS: 2 * 60 * 60,
} as const;
