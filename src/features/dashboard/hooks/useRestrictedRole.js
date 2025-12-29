import { useWorkspaceRole } from './useWorkspaceRole';

/**
 * Custom hook to check if the current user has a restricted role
 * Restricted roles: supervisor, builder, contractor
 * These roles have limited permissions (cannot edit/delete projects, create projects, etc.)
 * @returns {boolean} True if user has a restricted role
 */
export const useRestrictedRole = () => {
  const currentUserRole = useWorkspaceRole();
  
  // List of restricted roles (case-insensitive)
  const restrictedRoles = ['supervisor', 'builder', 'contractor'];
  
  const isRestricted = restrictedRoles.some(
    (role) => currentUserRole?.toLowerCase() === role.toLowerCase()
  );
  
  return isRestricted;
};

