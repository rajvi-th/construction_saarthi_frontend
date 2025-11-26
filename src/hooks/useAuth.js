/**
 * useAuth Hook
 * Centralized export for authentication hook
 * Re-exports from auth store for consistent imports across the project
 * 
 * Usage:
 * import { useAuth } from '../hooks/useAuth';
 * // or
 * import { useAuth } from '@/hooks/useAuth';
 */

export { useAuth } from '../features/auth/store';
