/**
 * MemberModal Component
 * Modal for adding and editing members
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import MemberForm from '../../auth/components/MemberForm';
import { addMember, updateMember } from '../../auth/api';
import { useAuth } from '../../auth/store';
import { showSuccess, showError } from '../../../utils/toast';

export default function MemberModal({
  isOpen,
  onClose,
  member = null, // null for add, member object for edit
  onSuccess,
}) {
  const { t, i18n } = useTranslation('auth');
  const { selectedWorkspace } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = !!member;
  const title = isEditMode
    ? t('createWorkspace.editMember', { defaultValue: 'Edit Member' })
    : t('createWorkspace.addNewMember.title', { defaultValue: 'Add New Member' });

  const workspaceId = selectedWorkspace;
  const currentLanguage = i18n.language || 'en';

  // Close modal on Escape key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyPress = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      document.addEventListener('keydown', handleKeyPress);
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleKeyPress);
      };
    }
  }, [isOpen, onClose]);

  const handleSubmit = async (memberData) => {
    // Validate workspace_id is required
    if (!workspaceId) {
      showError('Workspace ID is required. Please select a workspace.');
      return;
    }

    // Validate all required fields
    if (!memberData.name || !memberData.phone_number || !memberData.roleId) {
      showError('Please fill all required fields.');
      return;
    }

    setIsLoading(true);

    try {
      if (isEditMode) {
        // Update member
        if (!member?.id && !member?.member_id) {
          showError('Member ID is required.');
          return;
        }

        const requestData = {
          member_id: Number(member.id || member.member_id),
          workspace_id: Number(workspaceId),
          // Backend may require user_id for identifying the user in the workspace
          user_id: Number(
            member.user_id ||
              member.userId ||
              member.id ||
              member.member_id
          ),
          country_code: memberData.country_code || '+91',
          phone_number: memberData.phone_number,
          name: memberData.name,
          roleId: Number(memberData.roleId),
        };

        await updateMember(requestData);
        showSuccess(
          t('createWorkspace.addNewMember.updateSuccess', {
            defaultValue: 'Member updated successfully!',
          })
        );
      } else {
        // Add member
        const requestData = {
          country_code: memberData.country_code || '+91',
          phone_number: memberData.phone_number,
          name: memberData.name,
          roleId: Number(memberData.roleId),
          workspace_id: Number(workspaceId),
          language: currentLanguage,
        };

        await addMember(requestData);
        showSuccess(
          t('createWorkspace.addNewMember.success', {
            defaultValue: 'Member added successfully!',
          })
        );
      }

      // Call success callback and close modal
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} member:`, error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t(
          isEditMode
            ? 'createWorkspace.addNewMember.updateError'
            : 'createWorkspace.addNewMember.error',
          {
            defaultValue: isEditMode
              ? 'Failed to update member. Please try again.'
              : 'Failed to add member. Please try again.',
          }
        );
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl w-full max-w-2xl my-auto relative">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-primary">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 transition-colors cursor-pointer hover:opacity-70"
            aria-label="Close"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 sm:py-8 lg:py-10">
          <MemberForm
            initialData={member}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

