import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import MemberForm from '../components/MemberForm';
import { ROUTES_FLAT } from '../../../constants/routes';

export default function AddNewMemberPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (memberData) => {
        setIsLoading(true);

        // API call to add member
        // await addMember(memberData);

        setTimeout(() => {
            setIsLoading(false);
            // Navigate back or show success message
            navigate(-1);
        }, 1000);
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

