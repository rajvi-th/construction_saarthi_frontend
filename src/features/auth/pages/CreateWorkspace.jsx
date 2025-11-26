import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import DropdownMenu from '../../../components/ui/DropdownMenu';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { ROUTES_FLAT } from '../../../constants/routes';
import { statusBadgeColors } from '../../../components/ui/StatusBadge';

export default function CreateWorkspacePage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [workspaceName, setWorkspaceName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState(null);

    // Mock members data - Replace with API call
    const [members, setMembers] = useState([
        {
            id: 1,
            name: 'Jai Sharma',
            phone: '+91 67546 34523',
            role: 'Owner',
            initials: 'JS',
            color: 'red',
            isYou: true,
        },
        {
            id: 2,
            name: 'Aarav Mishra',
            phone: '+91 67546 34523',
            role: 'Supervisor',
            initials: 'AM',
            color: 'green',
            isYou: false,
        },
        {
            id: 3,
            name: 'Vicky Treutel',
            phone: '+91 67546 34523',
            role: 'Builder',
            initials: 'VT',
            color: 'blue',
            isYou: false,
        },
        {
            id: 4,
            name: 'Debra Grimes',
            phone: '+91 67546 34523',
            role: 'Builder',
            initials: 'DG',
            color: 'yellow',
            isYou: false,
        },
    ]);


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
        const member = members.find(m => m.id === memberId);
        if (member) {
            navigate(ROUTES_FLAT.EDIT_MEMBER, { state: { member } });
        }
    };

    const handleAddMember = () => {
        // Navigate to Add New Member page
        navigate(ROUTES_FLAT.ADD_NEW_MEMBER);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!workspaceName.trim()) return;

        setIsLoading(true);

        // API call to create workspace
        // await createWorkspace({ name: workspaceName, members });

        setTimeout(() => {
            setIsLoading(false);
            // Navigate to workspace or dashboard
            navigate(ROUTES_FLAT.WORKSPACE_SELECTION);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main Content */}
            <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8 lg:p-10">
                    {/* Header inside card */}
                    <div className="items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                        <button
                            onClick={() => navigate(-1)}
                            className="cursor-pointer mb-2"
                            aria-label={t('common.back', { defaultValue: 'Back' })}
                        >
                            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </button>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-medium text-primary">
                            {t('createWorkspace.title', { ns: 'auth', defaultValue: 'Create Workspace' })}
                        </h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                        {/* Workspace Name */}
                        <div>
                            <Input
                                label={t('createWorkspace.workspaceName', { ns: 'auth', defaultValue: 'Workspace Name' })}
                                placeholder={t('createWorkspace.enterName', { ns: 'auth', defaultValue: 'Enter name' })}
                                value={workspaceName}
                                onChange={(e) => setWorkspaceName(e.target.value)}
                                required
                            />
                        </div>

                        {/* Invite Members Section */}
                        <div className="space-y-4">
                            <div className="bg-[#FBFBFB] shadow-md border border-[rgba(176,46,12,0.04)] rounded-xl p-4">
                                <h2 className="text-lg sm:text-xl font-medium text-primary mb-2">
                                    {t('createWorkspace.inviteMembers', { ns: 'auth', defaultValue: 'Invite Members (Optional)' })}
                                </h2>
                                <p className="text-sm sm:text-base text-secondary">
                                    {t('createWorkspace.inviteMembersDescription', {
                                        ns: 'auth',
                                        defaultValue: "Enter the mobile number of the member you'd like to add to your workspace."
                                    })}
                                </p>

                                {/* Add Member Input */}    
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
                            {members.length > 0 && (
                                <div className="space-y-3 sm:space-y-4">
                                    {members.map((member) => (
                                        <div
                                            key={member.id}
                                            className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                        >
                                            {/* Avatar */}
                                            <div
                                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center font-semibold text-sm sm:text-base flex-shrink-0 border"
                                                style={getAvatarStyle(member.color)}
                                            >
                                                {member.initials}
                                            </div>

                                            {/* Member Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1 flex-wrap">
                                                    <h3 className="text-sm sm:text-base font-medium text-primary">
                                                        {member.name}
                                                    </h3>
                                                    {member.isYou && (
                                                        <span className="text-xs sm:text-sm text-secondary ">
                                                            {t('createWorkspace.you', { ns: 'auth', defaultValue: '(You)' })}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs sm:text-sm text-secondary mt-0.5">
                                                    {member.phone}
                                                </p>
                                            </div>

                                            {/* Role */}
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <span className="text-xs sm:text-sm font-medium text-primary ">
                                                    {t(`createWorkspace.roles.${member.role.toLowerCase()}`, {
                                                        ns: 'auth',
                                                        defaultValue: member.role
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
                                                                onClick: () => handleEditMember(member.id),
                                                            },
                                                            {
                                                                label: t('createWorkspace.removeFromWorkspace', {
                                                                    ns: 'auth',
                                                                    defaultValue: 'Remove From Workspace'
                                                                }),
                                                                icon: <Trash2 className="w-4 h-4 text-accent" />,
                                                                textColor: 'text-accent',
                                                                onClick: () => handleRemoveMemberClick(member.id),
                                                            },
                                                        ]}
                                                        position="right"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4 sm:pt-6">
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full py-3 text-base sm:text-lg"
                                disabled={!workspaceName.trim() || isLoading}
                            >
                                {isLoading
                                    ? t('loading', { defaultValue: 'Loading...' })
                                    : t('createWorkspace.goToWorkspace', {
                                        ns: 'auth',
                                        defaultValue: 'Go to my Workspace'
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

