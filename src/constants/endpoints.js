/**
 * API Endpoints Configuration (Legacy - Maintained for Backward Compatibility)
 * 
 * @deprecated This file is maintained for backward compatibility.
 * For new code, use feature-specific constants:
 * - Auth endpoints: src/features/auth/constants/authEndpoints.js
 * - Global endpoints: src/constants/apiEndpoints.js
 * 
 * This file re-exports from feature constants to maintain existing imports.
 */

// Re-export from auth feature constants for backward compatibility
export { 
  AUTH_ENDPOINTS as ENDPOINTS,
  AUTH_ENDPOINTS_FLAT as ENDPOINTS_FLAT 
} from '../features/auth/constants/authEndpoints';

// Default export for backward compatibility
export { AUTH_ENDPOINTS_FLAT as default } from '../features/auth/constants/authEndpoints';
