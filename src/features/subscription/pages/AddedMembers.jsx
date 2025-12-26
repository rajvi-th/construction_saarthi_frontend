/**
 * Added Members Page
 * Displays members added to the subscription
 * Uses feature API + shared UI components
 */

import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../components/layout/PageHeader';
import Loader from '../../../components/ui/Loader';
import ActionBar from '../../../components/layout/ActionBar';
import { MoreVertical, Trash2 } from 'lucide-react';
import DropdownMenu from '../../../components/ui/DropdownMenu';
import RemoveMemberModal from '../../../components/ui/RemoveMemberModal';
import { AddMemberModal } from '../components';
import { getWorkspaceMembers, deleteMember } from '../../auth/api';
import { useAuth } from '../../auth/store';
import { showError, showSuccess } from '../../../utils/toast';

const getInitials = (name = '') => {
    const parts = name.trim().split(' ');
    const first = parts[0]?.[0] || '';
    const second = parts[1]?.[0] || '';
    return (first + second).toUpperCase();
};

const getAvatarClasses = (role) => {
    if (role?.toLowerCase() === 'client') {
        return 'bg-[#ECFDF3] text-[#16A34A] border border-[#BBF7D0]';
    }
    return 'bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]';
};

export default function AddedMembers() {
    const { t } = useTranslation('subscription');
    const { selectedWorkspace } = useAuth();
    const [search, setSearch] = useState('');
    const [members, setMembers] = useState([]);
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState(null);
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const fetchMembers = async () => {
            if (!selectedWorkspace) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const response = await getWorkspaceMembers(selectedWorkspace);
                
                // Handle different response structures (same pattern as useMembers hook)
                const membersData = response?.data || response?.members || response || [];
                const membersList = Array.isArray(membersData) ? membersData : [];
                
                // Map API response to component format
                const mappedMembers = membersList.map(member => ({
                    id: member.id,
                    name: member.name || '',
                    phone: member.phone_number 
                        ? `${member.country_code || ''} ${member.phone_number}`.trim()
                        : '',
                    role: member.role || '',
                    planLabel: 'Free Plan', // Default value, update if API provides this
                    isPaid: false, // Default value, update if API provides this
                    extraPrice: null, // Default value, update if API provides this
                }));
                
                setMembers(mappedMembers);
            } catch (error) {
                console.error('Error fetching workspace members:', error);
                const errorMessage = error?.response?.data?.message || 
                                   error?.message || 
                                   'Failed to load members';
                showError(errorMessage);
                setMembers([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMembers();
    }, [selectedWorkspace, refreshKey]);

    const filteredMembers = useMemo(() => {
        if (!search.trim()) return members;
        const term = search.toLowerCase();
        return members.filter(
            (member) =>
                member.name.toLowerCase().includes(term) ||
                member.phone.toLowerCase().includes(term) ||
                member.role.toLowerCase().includes(term)
        );
    }, [search, members]);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handleAddNewMember = () => {
        setIsAddMemberModalOpen(true);
    };

    const handleOpenRemoveModal = (member) => {
        setMemberToRemove(member);
        setIsRemoveModalOpen(true);
    };

    const handleCloseRemoveModal = () => {
        setIsRemoveModalOpen(false);
        setMemberToRemove(null);
    };

    const handleConfirmRemove = async () => {
        if (!memberToRemove || !selectedWorkspace) {
            showError(t('addedMembers.errors.removeFailed', {
                defaultValue: 'Failed to remove member. Please try again.',
            }));
            return;
        }

        setIsDeleting(true);

        try {
            // Prepare API request body
            const requestData = {
                workspace_id: Number(selectedWorkspace),
                member_id: Number(memberToRemove.id),
            };

            // API call to delete member
            await deleteMember(requestData);

            // Show success message
            showSuccess(t('addedMembers.success.removeSuccess', {
                defaultValue: 'Member removed successfully!',
            }));

            // Refresh members list after successful deletion
            setRefreshKey(prev => prev + 1);

            // Close modal
            handleCloseRemoveModal();
        } catch (error) {
            console.error('Error removing member:', error);
            const errorMessage = error?.response?.data?.message ||
                error?.message ||
                t('addedMembers.errors.removeFailed', {
                    defaultValue: 'Failed to remove member. Please try again.',
                });
            showError(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCloseAddMemberModal = () => {
        setIsAddMemberModalOpen(false);
    };

    const handleSaveMember = (memberData) => {
        // This callback is kept for backward compatibility
        // The actual API call is now handled in AddMemberModal
        console.log('Member data saved:', memberData);
    };

    const handleMemberAdded = () => {
        // Refresh members list after successful addition
        setRefreshKey(prev => prev + 1);
    };

    return (

        <div className="max-w-7xl mx-auto px-0 md:px-4">
            <PageHeader
                title={t('header.addedMembers', { defaultValue: 'Added Members' })}
                showBackButton
            >
                <ActionBar
                    searchPlaceholder={t('addedMembers.searchPlaceholder', {
                        defaultValue: 'Search member',
                    })}
                    searchValue={search}
                    onSearchChange={handleSearchChange}
                    showSort={false}
                    sortBy={null}
                    onSortChange={null}
                    actionButtonLabel={t('addedMembers.addNewMember', {
                        defaultValue: 'Add New Member',
                    })}
                    onActionClick={handleAddNewMember}
                    actionButtonIcon="Plus"
                    className="w-full"
                />
            </PageHeader>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader size="lg" />
                </div>
            ) : (
                <div className="space-y-3 sm:space-y-2">
                    {filteredMembers.map((member) => (
                        <div
                            key={member.id}
                            className="bg-white rounded-2xl border border-[#E5E7EB] px-4 sm:px-5 py-3 sm:py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                        >
                            {/* Left: avatar + main info */}
                            <div className="flex items-center gap-3 sm:gap-4 min-w-0 w-full sm:w-auto">
                                <div
                                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${getAvatarClasses(
                                        member.role
                                    )}`}
                                >
                                    {getInitials(member.name)}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm sm:text-base font-medium text-primary truncate">
                                        {member.name}
                                        <span className="ml-1 text-xs font-normal text-primary-light">
                                            · {member.planLabel}
                                        </span>
                                        {member.isPaid && member.extraPrice && (
                                            <span className="ml-1 text-xs font-medium text-accent">
                                                · ₹{member.extraPrice}
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-primary-light mt-0.5 truncate">
                                        {member.phone}
                                    </p>
                                </div>
                            </div>

                            {/* Right: Remove Member menu */}
                            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end mt-2 sm:mt-0">
                                <span className="text-xs sm:text-sm font-medium text-accent">
                                    {member.role}
                                </span>
                                <DropdownMenu
                                    position="right"
                                    className="flex-shrink-0"
                                    items={[
                                        {
                                            label: t('addedMembers.menu.remove', {
                                                defaultValue: 'Remove Member',
                                            }),
                                            textColor: 'text-accent',
                                            icon: (
                                                <Trash2 className="w-4 h-4 text-accent" strokeWidth={2.2} />
                                            ),
                                            onClick: () => handleOpenRemoveModal(member),
                                        },
                                    ]}
                                    trigger={
                                        <button
                                            type="button"
                                            className="p-1.5 rounded-full cursor-pointer"
                                            aria-label="More actions"
                                        >
                                            <MoreVertical className="w-4 h-4 text-secondary" />
                                        </button>
                                    }
                                />
                            </div>
                        </div>
                    ))}

                    {!filteredMembers.length && (
                        <p className="text-secondary text-sm mt-4">
                            {t('emptyState.noMembers', { defaultValue: 'No members added yet.' })}
                        </p>
                    )}
                </div>
            )}

            <RemoveMemberModal
                isOpen={isRemoveModalOpen}
                onClose={handleCloseRemoveModal}
                onConfirm={handleConfirmRemove}
                memberName={memberToRemove?.name}
                isLoading={isDeleting}
            />

            <AddMemberModal
                isOpen={isAddMemberModalOpen}
                onClose={handleCloseAddMemberModal}
                onSave={handleSaveMember}
                onMemberAdded={handleMemberAdded}
                existingMembersCount={members.length}
                memberPrice={99}
            />
        </div>
    );
}
