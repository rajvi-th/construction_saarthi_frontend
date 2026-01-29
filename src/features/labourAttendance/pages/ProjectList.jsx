/**
 * Labour Attendance - Project List Page
 * Same UI as NotesList (projects list with search + status filter)
 * Title changed to "Labour Attendance"
 */

import { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../components/layout/PageHeader';
import SearchBar from '../../../components/ui/SearchBar';
import Dropdown from '../../../components/ui/Dropdown';
import { useAuth } from '../../auth/store';
import { useLabourAttendanceProjects } from '../hooks/useLabourAttendanceProjects';
import { ROUTES_FLAT, getRoute } from '../../../constants/routes';
import EmptyState from '../../../components/shared/EmptyState';
import EmptyStateSvg from '../../../assets/icons/EmptyState.svg';

import { ChevronDown } from 'lucide-react';

export default function ProjectList() {
    const { t } = useTranslation(['labourAttendance', 'projects']);
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedWorkspace } = useAuth();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [imageErrors, setImageErrors] = useState({});

    // Fetch projects from API
    const { projects, isLoading } = useLabourAttendanceProjects(selectedWorkspace);

    const statusOptions = [
        { value: '', label: t('status.all', { ns: 'projects' }) },
        { value: 'completed', label: t('status.completed', { ns: 'projects' }) },
        { value: 'in_progress', label: t('status.inProgress', { ns: 'projects' }) },
        { value: 'upcoming', label: t('status.upcoming', { ns: 'projects' }) },
    ];

    const handleImageError = (projectId) => {
        setImageErrors((prev) => ({ ...prev, [projectId]: true }));
    };

    // Navigate to Labour Attendance page for the selected project
    const handleLabourAttendanceClick = (project) => {
        const path = getRoute(
            ROUTES_FLAT.LABOUR_ATTENDANCE_PROJECT,
            { projectId: project.id }
        );

        navigate(path, {
            state: {
                projectName: project.name,
                fromDashboard: location.state?.fromDashboard,
            },
        });
    };

    // Filter projects based on search query and status
    const filteredProjects = useMemo(() => {
        const status = statusFilter ? statusFilter.toLowerCase() : '';
        const search = searchQuery.toLowerCase();

        return projects.filter((project) => {
            // Search filter: match name or address
            const target = `${project.name} ${project.address}`.toLowerCase();
            if (!target.includes(search)) return false;

            // Status filter: handle variations consistently with useProjects hook
            if (status) {
                const projectStatus = (project.status || '').toLowerCase();
                if (status === 'in_progress') {
                    return projectStatus === 'in_progress' || projectStatus === 'in process' || projectStatus === 'inprocess';
                } else if (status === 'completed') {
                    return projectStatus === 'completed' || projectStatus === 'complete';
                } else if (status === 'upcoming') {
                    return projectStatus === 'upcoming' || projectStatus === 'pending' || projectStatus === 'not_started';
                } else {
                    return projectStatus === status;
                }
            }

            return true;
        });
    }, [projects, searchQuery, statusFilter]);

    return (
        <div className="max-w-7xl mx-auto">
            <PageHeader title={t('projectList.title')} onBack={() => navigate(-1)}>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 md:gap-3">
                    <SearchBar
                        placeholder={t('projectList.searchProjects')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full lg:w-[200px]"
                    />
                    <Dropdown
                        options={statusOptions}
                        value={statusFilter}
                        onChange={setStatusFilter}
                        placeholder={t('status.label', { ns: 'projects' })}
                        className="w-full sm:w-[140px] sm:flex-shrink-0"
                        showSeparator={false}
                        onAddNew={null}
                        addButtonLabel=""
                        customButton={(isOpen, setIsOpen, selectedOption) => (
                            <button
                                type="button"
                                onClick={() => setIsOpen(!isOpen)}
                                className="w-full sm:w-[140px] py-3 px-4 rounded-xl border border-[#E5E7EB] bg-white text-sm flex items-center justify-between cursor-pointer"
                            >
                                <span className="text-primary">{selectedOption?.label || t('status.label', { ns: 'projects' })}</span>
                                <ChevronDown
                                    className={`w-4 h-4 text-primary transition-transform ${isOpen ? "rotate-180" : ""}`}
                                />
                            </button>
                        )}
                    />
                </div>
            </PageHeader>

            {/* Projects List */}
            <div>
                {isLoading ? (
                    <div className="flex items-center justify-center py-8 sm:py-12">
                        <div className="text-sm sm:text-base text-secondary">
                            {t('common.loading')}
                        </div>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <EmptyState
                        image={EmptyStateSvg}
                        title={t('projectList.noProjects', { defaultValue: 'No Projects Found' })}
                        message={t('projectList.noProjectsMessage', { defaultValue: 'You don\'t have any active projects for labor attendance yet.' })}
                    />
                ) : (
                    <div className="space-y-3 sm:space-y-4">
                        {filteredProjects.map((project) => {
                            const hasImageError = imageErrors[project.id];
                            const imageSrc = project.image;

                            // Only show image if API provides valid, non-empty image URL and no error occurred
                            const isValidImage =
                                imageSrc !== null &&
                                imageSrc !== undefined &&
                                typeof imageSrc === 'string' &&
                                imageSrc.trim() !== '' &&
                                !hasImageError;
                            const showImage = isValidImage;

                            return (
                                <div
                                    key={project.id}
                                    onClick={() => handleLabourAttendanceClick(project)}
                                    className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 shadow-md"
                                >
                                    {/* Project Image */}
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                        {showImage ? (
                                            <img
                                                src={imageSrc}
                                                alt={project.name}
                                                onError={() => handleImageError(project.id)}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 p-1">
                                                <svg
                                                    className="w-4 h-4 sm:w-5 sm:h-5 mb-1"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                </svg>
                                                <span className="text-[10px] sm:text-xs text-center leading-tight">
                                                    {t('projectList.noImage')}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Project Details */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm sm:text-base font-semibold text-primary mb-1 truncate">
                                            {project.name}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-secondary mb-2 line-clamp-1">
                                            {project.address}
                                        </p>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                                            <span className="text-secondary">
                                                {t('projectList.budget')}: <span className="font-medium text-primary">{project.budget}</span>
                                            </span>
                                            <div className="hidden sm:block w-[1px] h-3 bg-secondary/30" />
                                            <span className="text-secondary">
                                                {t('projectList.balance')}: <span className="font-medium text-primary">{project.balance}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}