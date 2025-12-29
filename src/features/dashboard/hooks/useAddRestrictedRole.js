import { useWorkspaceRole } from './useWorkspaceRole';

/**
 * Custom hook to check if the current user has a role that cannot add/create items
 * Restricted roles for add/create: builder, contractor
 * Supervisor can view but builder and contractor cannot add/create
 * @returns {boolean} True if user has a role that cannot add/create (builder, contractor)
 */
export const useAddRestrictedRole = () => {
  const currentUserRole = useWorkspaceRole();
  
  // List of roles that cannot add/create (case-insensitive)
  // Supervisor is NOT included - they can add/create
  const addRestrictedRoles = ['builder', 'contractor'];
  
  const isAddRestricted = addRestrictedRoles.some(
    (role) => currentUserRole?.toLowerCase() === role.toLowerCase()
  );
  
  return isAddRestricted;
};

