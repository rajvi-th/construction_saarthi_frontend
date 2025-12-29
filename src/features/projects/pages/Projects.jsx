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
import { ProjectCard } from '../components';
import { PROJECT_ROUTES } from '../constants';
import { useAuth } from '../../../hooks/useAuth';
import { useProjects, useDeleteProject } from '../hooks';
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
    // { value: 'pending', label: 'Pending' },
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
        <div className="mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:flex-wrap lg:items-center">
            <PageHeader title={t('header.title')} 
            showBackButton={false}
            />


            {/* Actions: search, filter, button */}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 w-full md:max-w-3xl lg:w-auto">
              <SearchBar
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:flex-1 lg:max-w-[260px]"
              />

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
                    {/* Title */}
                    <span className="text-primary">{selectedOption?.label || t('status.label')}</span>

                    {/* Chevron Down */}
                    <ChevronDown
                      className={`w-4 h-4 text-primary transition-transform ${isOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>
                )}
              />

              {!isRestricted && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleAddNewProject}
                  leftIconName="Plus"
                  iconSize="w-3 h-3 text-accent"
                  className="w-full sm:w-auto whitespace-nowrap rounded-lg py-2.5"
                >
                  {t('actions.addNewProject')}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Projects List */}
        {isFetchingProjects || isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size="lg" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-secondary text-lg mb-2">{t('emptyState.noProjects')}</p>
              <p className="text-secondary text-sm">
                {searchQuery || statusFilter
                  ? t('emptyState.adjustSearch')
                  : t('emptyState.getStarted')}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpenDetails={() => handleProjectClick(project)}
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

