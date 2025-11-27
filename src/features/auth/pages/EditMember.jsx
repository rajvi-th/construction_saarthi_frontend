import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import MemberForm from '../components/MemberForm';
import { ROUTES_FLAT } from '../../../constants/routes';
import { updateMember } from '../api';
import { useAuth } from '../store';
import { showSuccess, showError } from '../../../utils/toast';

export default function EditMemberPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedWorkspace } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [memberData, setMemberData] = useState(null);

    // Get workspace_id from location state or selected workspace
    const workspaceId = location.state?.workspaceId || selectedWorkspace;

    // Get member data from location state or from URL params
    useEffect(() => {
        if (location.state?.member) {
            setMemberData(location.state.member);
        } else {
            // If no member data, redirect back
            navigate(-1);
        }
    }, [location.state, navigate]);

    const handleSubmit = async (updatedData) => {
        // Validate workspace_id is required
        if (!workspaceId) {
            showError('Workspace ID is required. Please select a workspace.');
            return;
        }

        // Validate member_id is required
        if (!memberData?.id && !memberData?.member_id) {
            showError('Member ID is required.');
            return;
        }

        setIsLoading(true);

        try {
            // Prepare API request body
            const requestData = {
                member_id: Number(memberData.id || memberData.member_id),
                workspace_id: Number(workspaceId),
                country_code: updatedData.country_code || '+91',
                phone_number: updatedData.phone_number,
                name: updatedData.name,
                roleId: Number(updatedData.roleId),
            };

            console.log('Updating member with data:', requestData);

            // API call to update member
            await updateMember(requestData);

            // Show success message
            showSuccess(
                t('createWorkspace.addNewMember.updateSuccess', { 
                    ns: 'auth', 
                    defaultValue: 'Member updated successfully!' 
                })
            );

            // Navigate back to CreateWorkspace page with workspace_id
            navigate(ROUTES_FLAT.CREATE_WORKSPACE, {
                state: { workspaceId: workspaceId }
            });
        } catch (error) {
            console.error('Error updating member:', error);
            const errorMessage = error?.response?.data?.message || 
                                error?.message || 
                                t('createWorkspace.addNewMember.updateError', { 
                                    ns: 'auth', 
                                    defaultValue: 'Failed to update member. Please try again.' 
                                });
            showError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    if (!memberData) {
        return null; // Or show loading spinner
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
            {/* Main Content */}
            <main className="w-full max-w-2xl">
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8 lg:p-10">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <button
                            onClick={() => navigate(-1)}
                            className="transition-colors cursor-pointer mb-2"
                            aria-label={t('common.back', { defaultValue: 'Back' })}
                        >
                            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </button>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-medium text-primary">
                            {t('createWorkspace.editMember', { ns: 'auth', defaultValue: 'Edit Member' })}
                        </h1>
                    </div>

                    <MemberForm
                        initialData={memberData}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        isLoading={isLoading}
                    />
                </div>
            </main>
        </div>
    );
}

