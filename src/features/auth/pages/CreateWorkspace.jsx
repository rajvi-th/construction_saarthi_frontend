import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import DropdownMenu from '../../../components/ui/DropdownMenu';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { ROUTES_FLAT } from '../../../constants/routes';
import { statusBadgeColors } from '../../../components/ui/StatusBadge';
import { createWorkspace, getWorkspaceMembers } from '../api';
import { showError, showSuccess } from '../../../utils/toast';
import { useAuth } from '../store';

export default function CreateWorkspacePage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { selectWorkspace } = useAuth();
    const [workspaceName, setWorkspaceName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingMembers, setIsFetchingMembers] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState(null);
    const [isWorkspaceCreated, setIsWorkspaceCreated] = useState(false);
    const [createdWorkspaceId, setCreatedWorkspaceId] = useState(null);
    
    // Get workspace_id from location state (if editing existing workspace)
    const workspaceId = location.state?.workspaceId || createdWorkspaceId;

    // Members data - fetched from API if workspace_id exists
    const [members, setMembers] = useState([]);

    // Fetch workspace members if workspace_id exists
    useEffect(() => {
        const fetchMembers = async () => {
            if (workspaceId) {
                try {
                    setIsFetchingMembers(true);
                    const response = await getWorkspaceMembers(workspaceId);
                    const membersData = response?.data || response?.members || response || [];
                    setMembers(Array.isArray(membersData) ? membersData : []);
                } catch (error) {
                    console.error('Error fetching workspace members:', error);
                    setMembers([]);
                } finally {
                    setIsFetchingMembers(false);
                }
            }
        };

        fetchMembers();
    }, [workspaceId]);


    const getAvatarStyle = (color) => {
        const colorKey = color || 'red';
        const colors = statusBadgeColors[colorKey] || statusBadgeColors.red;
        return {
            backgroundColor: colors.background,
            borderColor: colors.border,
            color: colors.text,
        };
    };

    const handleEditMember = (memberId) => {
        const member = members.find(m => (m.id === memberId || m.member_id === memberId));
        if (member) {
            navigate(ROUTES_FLAT.EDIT_MEMBER, { 
                state: { 
                    member: member,
                    workspaceId: workspaceId 
                } 
            });
        }
    };

    const handleAddMember = () => {
        // Navigate to Add New Member page with workspace_id
        navigate(ROUTES_FLAT.ADD_NEW_MEMBER, {
            state: { workspaceId: workspaceId }
        });
    };

    const handleRemoveMemberClick = (memberId) => {
        setMemberToRemove(memberId);
    };

    const handleConfirmRemove = () => {
        if (memberToRemove) {
            setMembers(members.filter(m => m.id !== memberToRemove));
            setMemberToRemove(null);
        }
    };

    const handleCancelRemove = () => {
        setMemberToRemove(null);
    };

    const handleCreateWorkspace = async (e) => {
        e.preventDefault();
        if (!workspaceName.trim()) return;

        setIsLoading(true);

        try {
            // API call to create workspace
            const response = await createWorkspace({
                name: workspaceName.trim(),
                role: 'owner', // Default role is "owner" for workspace creator
            });

            console.log('Workspace creation response:', response);

            // Show success message
            showSuccess(
                response?.message || 
                t('createWorkspace.success', { ns: 'auth', defaultValue: 'Workspace created successfully!' })
            );

            // Get workspace ID from response - check multiple possible locations
            const newWorkspaceId = response?.workspace?.id ||
                                  response?.data?.workspace?.id ||
                                  response?.data?.id || 
                                  response?.data?.workspace_id ||
                                  response?.id || 
                                  response?.workspace_id;
            
            console.log('Extracted workspace ID:', newWorkspaceId);
            
            // Set workspace created state regardless of ID availability
            setIsWorkspaceCreated(true);
            
            // Save workspace selection if ID is available
            if (newWorkspaceId) {
                selectWorkspace(newWorkspaceId);
                setCreatedWorkspaceId(newWorkspaceId);
                
                // Fetch members for the newly created workspace
                try {
                    setIsFetchingMembers(true);
                    const membersResponse = await getWorkspaceMembers(newWorkspaceId);
                    const membersData = membersResponse?.data || membersResponse?.members || membersResponse || [];
                    setMembers(Array.isArray(membersData) ? membersData : []);
                } catch (error) {
                    console.error('Error fetching workspace members:', error);
                    setMembers([]);
                } finally {
                    setIsFetchingMembers(false);
                }
            } else {
                // If no workspace ID, still show success but don't fetch members
                console.warn('Workspace ID not found in response');
                setMembers([]);
            }
        } catch (error) {
            console.error('Error creating workspace:', error);
            // Error handling - show error message
            const errorMessage = error?.response?.data?.message || 
                                error?.message || 
                                t('createWorkspace.error', { 
                                    ns: 'auth', 
                                    defaultValue: 'Failed to create workspace. Please try again.' 
                                });
            showError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoToWorkspace = () => {
        navigate(ROUTES_FLAT.DASHBOARD);
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            {/* Main Content - Centered */}
            <main className="w-full max-w-xl px-4 sm:px-6">
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8 lg:p-10">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <button
                            onClick={() => navigate(-1)}
                            className="cursor-pointer mb-4"
                            aria-label={t('common.back', { defaultValue: 'Back' })}
                        >
                            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </button>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-medium text-primary">
                            {t('createWorkspace.title', { ns: 'auth', defaultValue: 'Create Workspace' })}
                        </h1>
                    </div>

                    <form onSubmit={handleCreateWorkspace} className="space-y-6">
                        {/* Workspace Name */}
                        <div>
                            <Input
                                label={t('createWorkspace.workspaceName', { ns: 'auth', defaultValue: 'Workspace Name' })}
                                placeholder={t('createWorkspace.enterName', { ns: 'auth', defaultValue: 'Enter workspace name' })}
                                value={workspaceName}
                                onChange={(e) => setWorkspaceName(e.target.value)}
                                required
                                disabled={isLoading || isWorkspaceCreated}
                            />
                            <p className="mt-2 text-sm text-secondary">
                                {t('createWorkspace.nameHint', { 
                                    ns: 'auth', 
                                    defaultValue: 'Give your workspace a unique name to identify it easily.' 
                                })}
                            </p>
                        </div>

                        {/* Invite Members Section */}
                        {isWorkspaceCreated && (
                            <div className="space-y-4">
                                <div className="bg-[#FBFBFB] shadow-md border border-[rgba(176,46,12,0.04)] rounded-xl p-4 ">
                                    <h2 className="text-lg sm:text-xl font-medium text-primary mb-2">
                                        {t('createWorkspace.inviteMembers', { ns: 'auth', defaultValue: 'Invite Members (Optional)' })}
                                    </h2>
                                    <p className="text-sm sm:text-base text-secondary">
                                        {t('createWorkspace.inviteMembersDescription', {
                                            ns: 'auth',
                                            defaultValue: "Enter the mobile number of the member you'd like to add to your workspace."
                                        })}
                                    </p>

                                    {/* Add Member Button */}    
                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
                                        <Button
                                            type="button"
                                            onClick={handleAddMember}
                                            variant="primary"
                                            className="w-full sm:w-auto px-4 py-2"
                                            leftIconName="Plus"
                                            iconClassName="text-accent"
                                            iconSize="w-3 h-3"
                                        >
                                            {t('createWorkspace.addMember', { ns: 'auth', defaultValue: 'Add Member' })}
                                        </Button>
                                    </div>
                                </div>

                                {/* Members List */}
                                {isFetchingMembers ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                                    </div>
                                ) : members.length > 0 ? (
                                    <div className="space-y-3 sm:space-y-4">
                                        {members.map((member) => (
                                            <div
                                                key={member.id || member.member_id}
                                                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                            >
                                                {/* Avatar */}
                                                <div
                                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center font-semibold text-sm sm:text-base flex-shrink-0 border"
                                                    style={getAvatarStyle(member.color)}
                                                >
                                                    {(() => {
                                                        const name = member.name || member.full_name || 'U';
                                                        const words = name.trim().split(/\s+/);
                                                        if (words.length >= 2) {
                                                            return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
                                                        } else {
                                                            return name.substring(0, 2).toUpperCase();
                                                        }
                                                    })()}
                                                </div>

                                                {/* Member Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1 flex-wrap">
                                                        <h3 className="text-sm sm:text-base font-medium text-primary">
                                                            {member.name || member.full_name || 'Unknown'}
                                                        </h3>
                                                        {member.isYou && (
                                                            <span className="text-xs sm:text-sm text-secondary">
                                                                {t('createWorkspace.you', { ns: 'auth', defaultValue: '(You)' })}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs sm:text-sm text-secondary mt-0.5">
                                                        {member.phone || member.phone_number || 'N/A'}
                                                    </p>
                                                </div>

                                                {/* Role */}
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <span className="text-xs sm:text-sm font-medium text-primary">
                                                        {t(`createWorkspace.roles.${(member.role || 'member').toLowerCase()}`, {
                                                            ns: 'auth',
                                                            defaultValue: member.role || 'Member'
                                                        })}
                                                    </span>

                                                    {/* More Options */}
                                                    {!member.isYou && (
                                                        <DropdownMenu
                                                            items={[
                                                                {
                                                                    label: t('createWorkspace.editMember', {
                                                                        ns: 'auth',
                                                                        defaultValue: 'Edit Member'
                                                                    }),
                                                                    icon: <Pencil className="w-4 h-4 text-gray-600" />,
                                                                    textColor: 'text-gray-700',
                                                                    onClick: () => handleEditMember(member.id || member.member_id),
                                                                },
                                                                {
                                                                    label: t('createWorkspace.removeFromWorkspace', {
                                                                        ns: 'auth',
                                                                        defaultValue: 'Remove From Workspace'
                                                                    }),
                                                                    icon: <Trash2 className="w-4 h-4 text-accent" />,
                                                                    textColor: 'text-accent',
                                                                    onClick: () => handleRemoveMemberClick(member.id || member.member_id),
                                                                },
                                                            ]}
                                                            position="right"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="pt-4 sm:pt-6">
                            <Button
                                type={isWorkspaceCreated ? "button" : "submit"}
                                onClick={isWorkspaceCreated ? handleGoToWorkspace : undefined}
                                variant="primary"
                                className="w-full py-3 text-base sm:text-lg"
                                disabled={(!workspaceName.trim() || isLoading) && !isWorkspaceCreated}
                            >
                                {isLoading
                                    ? t('loading', { defaultValue: 'Loading...' })
                                    : isWorkspaceCreated
                                        ? t('createWorkspace.goToWorkspace', {
                                            ns: 'auth',
                                            defaultValue: 'Go to Workspace'
                                        })
                                        : t('createWorkspace.createButton', {
                                            ns: 'auth',
                                            defaultValue: 'Create Workspace'
                                        })
                                }
                            </Button>
                        </div>
                    </form>
                </div>
            </main>

            {/* Remove Member Confirmation Modal */}
            {memberToRemove && (() => {
                const member = members.find(m => m.id === memberToRemove);
                if (!member) return null;
                
                return (
                    <ConfirmModal
                        isOpen={!!memberToRemove}
                        onClose={handleCancelRemove}
                        onConfirm={handleConfirmRemove}
                        title={t('createWorkspace.removeMemberModal.title', {
                            ns: 'auth',
                            defaultValue: `Remove ${member.name}`,
                            name: member.name
                        })}
                        message={t('createWorkspace.removeMemberModal.message', {
                            ns: 'auth',
                            defaultValue: `Are you sure you want to remove ${member.name} from this workspace? This action is irreversible, and your data cannot be recovered.`,
                            name: member.name
                        })}
                        confirmText={t('createWorkspace.removeMemberModal.confirm', {
                            ns: 'auth',
                            defaultValue: 'Yes, Remove'
                        })}
                        cancelText={t('createWorkspace.removeMemberModal.cancel', {
                            ns: 'auth',
                            defaultValue: 'Cancel'
                        })}
                        confirmVariant="primary"
                    />
                );
            })()}
        </div>
    );
}

