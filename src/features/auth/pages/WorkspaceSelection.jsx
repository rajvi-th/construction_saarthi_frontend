import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { ROUTES_FLAT } from '../../../constants/routes';
import { useAuth } from '../store';
import { getWorkspaces } from '../api';
import { showError } from '../../../utils/toast';

export default function WorkspaceSelectionPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { selectWorkspace, selectedWorkspace: storeSelectedWorkspace } = useAuth();
    const [selectedWorkspace, setSelectedWorkspace] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [workspaces, setWorkspaces] = useState([]);
    const [isFetching, setIsFetching] = useState(true);

    // Fetch workspaces from API
    useEffect(() => {
        const fetchWorkspaces = async () => {
            try {
                setIsFetching(true);
                const response = await getWorkspaces();
                
                // Handle different response structures
                const workspacesData = response?.data || response?.workspaces || response || [];
                setWorkspaces(Array.isArray(workspacesData) ? workspacesData : []);
            } catch (error) {
                console.error('Error fetching workspaces:', error);
                const errorMessage = error?.response?.data?.message || 
                                   error?.message || 
                                   t('workspaceSelection.fetchError', { 
                                     ns: 'auth', 
                                     defaultValue: 'Failed to load workspaces' 
                                   });
                showError(errorMessage);
                setWorkspaces([]);
            } finally {
                setIsFetching(false);
            }
        };

        fetchWorkspaces();
    }, [t]);

    const handleWorkspaceSelect = (workspaceId) => {
        setSelectedWorkspace(workspaceId);
    };

    const handleContinue = async (e) => {
        e.preventDefault();
        if (!selectedWorkspace) return;

        setIsLoading(true);

        // Save workspace selection using auth store (automatically syncs to localStorage)
        selectWorkspace(selectedWorkspace);

        // Small delay for UX, then navigate
        setTimeout(() => {
            setIsLoading(false);
            // Navigate to dashboard or next step
            navigate(ROUTES_FLAT.LOGIN);
        }, 500);
    };

    const handleCreateNew = () => {
        // Navigate to create workspace page
        navigate(ROUTES_FLAT.CREATE_WORKSPACE);
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8 lg:p-10">
                    {/* Card Title */}
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-medium text-primary mb-6 sm:mb-8">
                        {t('workspaceSelection.title', { ns: 'auth', defaultValue: 'Existing Workspace' })}
                    </h2>

                    {/* Workspace List */}
                    <div className="space-y-3 sm:space-y-4">
                        {/* Existing Workspaces */}
                        {workspaces.map((workspace) => {
                            const isSelected = selectedWorkspace === workspace.id;
                            return (
                                <button
                                    key={workspace.id}
                                    type="button"
                                    onClick={() => handleWorkspaceSelect(workspace.id)}
                                    className={`
                    w-full p-4 sm:p-5 rounded-xl sm:rounded-2xl
                    transition-all duration-200
                    flex items-center gap-4 sm:gap-5
                    border-2 border-black-soft cursor-pointer
                    ${isSelected
                                            ? 'shadow-md'
                                            : 'bg-white shadow-md'
                                        }
                    focus:outline-none 
                  `}
                                    aria-label={`Select ${workspace.name}`}
                                >
                                    {/* Workspace Icon */}
                                    <div
                                        className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center font-bold text-white text-base sm:text-lg lg:text-xl flex-shrink-0"
                                        style={{
                                            backgroundColor: workspace.color === 'red'
                                                ? 'rgba(255, 59, 48, 0.4)'
                                                : 'rgba(255, 149, 0, 0.4)'
                                        }}
                                    >
                                        {workspace.initials}
                                    </div>

                                    {/* Workspace Info */}
                                    <div className="flex-1 text-left ">
                                        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-primary mb-1">
                                            {workspace.name}
                                        </h3>
                                        <p className="text-sm sm:text-base text-secondary">
                                            {workspace.members} {t('workspaceSelection.members', { ns: 'auth', defaultValue: 'Members' })}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}

                        {/* New Workspace Button */}
                        <button
                            type="button"
                            onClick={handleCreateNew}
                            className="
                w-full p-4  rounded-xl sm:rounded-2xl
                transition-all duration-200 
                flex items-center gap-4 sm:gap-5
                bg-white cursor-pointer
                focus:outline-none 
              "
                            aria-label="Create New Workspace"
                        >
                            {/* Plus Icon */}
                            <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                                <Plus className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                            </div>

                            {/* New Workspace Text */}
                            <div className="flex-1 text-left">
                                <h3 className="text-base sm:text-lg font-medium text-accent">
                                    {t('workspaceSelection.newWorkspace', { ns: 'auth', defaultValue: 'New Workspace' })}
                                </h3>
                            </div>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

