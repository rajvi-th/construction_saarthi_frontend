import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import MemberForm from '../components/MemberForm';
import { ROUTES_FLAT } from '../../../constants/routes';
import { addMember } from '../api';
import { useAuth } from '../store';
import { showSuccess, showError } from '../../../utils/toast';

export default function AddNewMemberPage() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedWorkspace } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Get workspace_id from location state or selected workspace
    const workspaceId = location.state?.workspaceId || selectedWorkspace;
    const currentLanguage = i18n.language || 'en';

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
            // Prepare API request body - workspace_id is required
            const requestData = {
                country_code: memberData.country_code || '+91',
                phone_number: memberData.phone_number,
                name: memberData.name,
                roleId: Number(memberData.roleId), 
                workspace_id: Number(workspaceId),
                language: currentLanguage,
            };

            console.log('Adding member with data:', requestData);

            // API call to add member
            await addMember(requestData);

            // Show success message
            showSuccess(
                t('createWorkspace.addNewMember.success', { 
                    ns: 'auth', 
                    defaultValue: 'Member added successfully!' 
                })
            );

            // Navigate to CreateWorkspace page with workspace_id
            navigate(ROUTES_FLAT.CREATE_WORKSPACE, {
                state: { workspaceId: workspaceId }
            });
        } catch (error) {
            console.error('Error adding member:', error);
            const errorMessage = error?.response?.data?.message || 
                                error?.message || 
                                t('createWorkspace.addNewMember.error', { 
                                    ns: 'auth', 
                                    defaultValue: 'Failed to add member. Please try again.' 
                                });
            showError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
            {/* Main Content */}
            <main className="w-full max-w-2xl">
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8 lg:p-10">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-1 transition-colors cursor-pointer mb-2"
                            aria-label={t('common.back', { defaultValue: 'Back' })}
                        >
                            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </button>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-medium text-primary">
                            {t('createWorkspace.addNewMember.title', { ns: 'auth', defaultValue: 'Add New Member' })}
                        </h1>
                    </div>

                    <MemberForm
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        isLoading={isLoading}
                    />
                </div>
            </main>
        </div>
    );
}

