import { useState, useEffect, useCallback } from 'react';
import { getWorkspaceMembers, deleteMember } from '../../auth/api';
import { showError, showSuccess } from '../../../utils/toast';
import { useTranslation } from 'react-i18next';

/**
 * Custom hook for fetching and managing workspace members
 * @param {string|number} workspaceId - The ID of the selected workspace
 * @returns {Object} { members, isLoadingMembers, isDeletingMember, error, refetch, deleteMember }
 */
export const useMembers = (workspaceId) => {
  const { t } = useTranslation('common');
  const [members, setMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isDeletingMember, setIsDeletingMember] = useState(false);
  const [error, setError] = useState(null);

  const fetchMembers = useCallback(async () => {
    if (!workspaceId) {
      setMembers([]);
      setIsLoadingMembers(false);
      setError(null);
      return;
    }

    try {
      setIsLoadingMembers(true);
      setError(null);
      const response = await getWorkspaceMembers(workspaceId);

      // Handle different response structures
      const membersData = response?.data || response?.members || response || [];
      const membersList = Array.isArray(membersData) ? membersData : [];

      setMembers(membersList);
    } catch (err) {
      console.error('Error fetching members:', err);
      const errorMessage = err?.response?.data?.message ||
        err?.message ||
        'Failed to load members';
      setError(errorMessage);
      showError(errorMessage);
      setMembers([]);
    } finally {
      setIsLoadingMembers(false);
    }
  }, [workspaceId]);

  const handleDeleteMember = useCallback(async (memberId) => {
    if (!workspaceId || !memberId) {
      showError('Workspace ID or Member ID is missing');
      return false;
    }

    try {
      setIsDeletingMember(true);
      await deleteMember({
        workspace_id: Number(workspaceId),
        member_id: Number(memberId),
      });
      showSuccess(t('successMessages.deleted', { defaultValue: 'Member deleted successfully' }));
      // Refresh members list after successful deletion
      await fetchMembers();
      return true;
    } catch (err) {
      console.error('Error deleting member:', err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        t('errors.generic', { defaultValue: 'Failed to delete member. Please try again.' });
      showError(errorMessage);
      return false;
    } finally {
      setIsDeletingMember(false);
    }
  }, [workspaceId, fetchMembers, t]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return {
    members,
    isLoadingMembers,
    isDeletingMember,
    error,
    refetch: fetchMembers,
    deleteMember: handleDeleteMember,
  };
};

export default useMembers;

