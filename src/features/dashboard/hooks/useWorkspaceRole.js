import { useState, useEffect } from 'react';
import { useAuth } from '../../../features/auth/store';
import { getWorkspaces } from '../../../features/auth/api';

/**
 * Custom hook to get the logged-in user's role in the current workspace
 * @returns {string} The user's role in the current workspace (e.g., 'contractor', 'owner', 'builder', etc.)
 */
export const useWorkspaceRole = () => {
  const { selectedWorkspace, user } = useAuth();
  const [currentUserRole, setCurrentUserRole] = useState('');
  
  // Get logged-in user's ID
  const loggedInUserId = user?.id?.toString() || user?.user_id?.toString() || '';
  
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!selectedWorkspace || !loggedInUserId) {
        setCurrentUserRole('');
        return;
      }
      
      try {
        const response = await getWorkspaces();
        const workspacesData = response?.data || response?.workspaces || response || [];
        const list = Array.isArray(workspacesData) ? workspacesData : [];
        
        // Find current workspace
        const currentWorkspace = list.find(
          (w) => w.id?.toString() === selectedWorkspace?.toString()
        );
        
        if (currentWorkspace?.members && Array.isArray(currentWorkspace.members)) {
          // Find logged-in user's role in workspace members
          const currentUserMember = currentWorkspace.members.find(
            (member) => member.id?.toString() === loggedInUserId
          );
          
          if (currentUserMember?.role) {
            setCurrentUserRole(currentUserMember.role);
          } else if (currentWorkspace.isOwner) {
            setCurrentUserRole('owner');
          } else {
            setCurrentUserRole('');
          }
        } else if (currentWorkspace?.isOwner) {
          setCurrentUserRole('owner');
        } else {
          setCurrentUserRole('');
        }
      } catch (error) {
        setCurrentUserRole('');
      }
    };
    
    fetchUserRole();
  }, [selectedWorkspace, loggedInUserId]);
  
  return currentUserRole;
};

