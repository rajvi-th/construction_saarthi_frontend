/**
 * Projects List Page
 * Displays all projects with search, filter, and project cards
 * Uses feature API + shared UI components for a human-friendly, maintainable structure.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SearchBar from '../../../components/ui/SearchBar';
import Button from '../../../components/ui/Button';
import Dropdown from '../../../components/ui/Dropdown';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import Loader from '../../../components/ui/Loader';
import EmptyState from '../../../components/shared/EmptyState';
import EmptyStateSvg from '../../../assets/icons/EmptyState.svg';
import { ProjectCard } from '../components';
import { PROJECT_ROUTES } from '../constants';
import { useAuth } from '../../../hooks/useAuth';
import { useProjects, useDeleteProject } from '../hooks';
import { updateProjectStatus } from '../api/projectApi';
import { useRestrictedRole } from '../../dashboard/hooks';
import { ChevronDown } from "lucide-react";
import PageHeader from '../../../components/layout/PageHeader';

export default function Projects() {
  const { t } = useTranslation('projects');
  const navigate = useNavigate();
  const { selectedWorkspace } = useAuth();

  // Check if user has restricted role (supervisor, builder, contractor)
  const isRestricted = useRestrictedRole();
  const [projectToDelete, setProjectToDelete] = useState(null);

  const {
    filteredProjects,
    isLoading,
    isFetchingProjects,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    refetch: refetchProjects,
  } = useProjects(selectedWorkspace);

  const { deleteProject: deleteProjectHook, isDeleting } = useDeleteProject();

  const STATUS_OPTIONS = [
    { value: '', label: t('status.all') },
    { value: 'completed', label: t('status.completed') },
    { value: 'in_progress', label: t('status.inProgress') },
    { value: 'upcoming', label: t('status.upcoming') },
  ];

  const handleAddNewProject = () => {
    navigate(PROJECT_ROUTES.ADD_NEW_PROJECT);
  };

  const handleProjectClick = (project) => {
    const projectName = project.site_name || project.name || '';
    const slug = projectName
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    navigate(PROJECT_ROUTES.PROJECT_DETAILS.replace(':slug', slug || project.id), {
      state: {
        projectName,
        projectId: project.id,
      },
    });
  };

  const handleEditProject = (project) => {
    navigate(PROJECT_ROUTES.EDIT_PROJECT.replace(':id', project.id));
  };

  const handleStatusChange = async (project, newStatus) => {
    try {
      await updateProjectStatus(project.id, newStatus, project);
      await refetchProjects();
    } catch (error) {
      console.error("Failed to update status", error);
      // Optional: Add toast notification here
    }
  };

  const handleRequestDelete = (project) => {
    setProjectToDelete(project);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;

    try {
      await deleteProjectHook(projectToDelete.id);

      // Refetch projects list to update UI
      await refetchProjects();

      // Close modal
      setProjectToDelete(null);
    } catch (error) {
      // Error is already handled in the hook
      console.error("Error deleting project:", error);
    }
  };

  const handleCloseDeleteModal = () => {
    setProjectToDelete(null);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-0 md:py-7">
        {/* Header Section */}
        <PageHeader
          title={t('header.title')}
          showBackButton={false}
          className='capitalize'
        >
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center w-full lg:w-auto">
            <div className="flex-1 w-full sm:w-auto sm:flex-none">
              <SearchBar
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-[260px]"
              />
            </div>

            <Dropdown
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder={t('status.label')}
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
                  <span className="text-primary">{selectedOption?.label || t('status.label')}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-primary transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
              )}
            />

            {!isRestricted && (
              <Button
                variant="primary"
                onClick={handleAddNewProject}
                leftIconName="Plus"
                iconSize="w-4 h-4"
                className="w-full sm:w-auto whitespace-nowrap"
              >
                {t('actions.addNewProject')}
              </Button>
            )}
          </div>
        </PageHeader>

        {/* Projects List */}
        {isFetchingProjects || isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size="lg" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <EmptyState
            image={EmptyStateSvg}
            title={t('emptyState.noProjects')}
            message={searchQuery || statusFilter
              ? t('emptyState.adjustSearch')
              : t('emptyState.getStarted')}
            actionLabel={!searchQuery && !statusFilter && !isRestricted ? t('actions.addNewProject') : undefined}
            onAction={!searchQuery && !statusFilter && !isRestricted ? handleAddNewProject : undefined}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpenDetails={() => handleProjectClick(project)}
                  onStatusChange={(status) => handleStatusChange(project, status)}
                  onEdit={!isRestricted ? handleEditProject : null}
                  onDelete={!isRestricted ? handleRequestDelete : null}
                />
              ))}
            </div>

            {/* Delete confirmation modal */}
            <ConfirmModal
              isOpen={!!projectToDelete}
              onClose={handleCloseDeleteModal}
              onConfirm={handleConfirmDelete}
              title={t('deleteModal.title')}
              maxWidthClass="max-w-xl"
              message={
                projectToDelete ? (
                  <p>
                    {t('deleteModal.message')}{' '}
                    <span className="font-medium text-primary">
                      {projectToDelete.site_name || projectToDelete.name}
                    </span>{' '}
                    {t('deleteModal.messageSuffix')}
                  </p>
                ) : (
                  ''
                )
              }
              confirmText={t('deleteModal.confirm')}
              cancelText={t('cancel', { ns: 'common' })}
              confirmVariant="primary"
              isLoading={isDeleting}
            />
          </>
        )}
      </div>
    </div>
  );
}

