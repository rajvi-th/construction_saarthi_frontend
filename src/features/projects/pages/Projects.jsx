/**
 * Projects List Page
 * Displays all projects with search, filter, and project cards
 * Uses feature API + shared UI components for a human-friendly, maintainable structure.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SearchBar from '../../../components/ui/SearchBar';
import Button from '../../../components/ui/Button';
import Dropdown from '../../../components/ui/Dropdown';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import Loader from '../../../components/ui/Loader';
import { ProjectCard } from '../components';
import { PROJECT_ROUTES } from '../constants';
import { useDebounce } from '../../../hooks/useDebounce';
import { useAuth } from '../../../hooks/useAuth';
import { getAllProjects } from '../api';
import { showError } from '../../../utils/toast';
import { ChevronDown } from "lucide-react";

export default function Projects() {
  const { t } = useTranslation('projects');
  const navigate = useNavigate();
  const { selectedWorkspace } = useAuth();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProjects, setIsFetchingProjects] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [projectToDelete, setProjectToDelete] = useState(null);
  const debouncedSearch = useDebounce(searchQuery, 500);

  const STATUS_OPTIONS = [
    { value: '', label: t('status.all') },
    { value: 'completed', label: t('status.completed') },
    { value: 'in_progress', label: t('status.inProgress') },
    // { value: 'pending', label: 'Pending' },
  ];

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      if (!selectedWorkspace) {
        setProjects([]);
        setFilteredProjects([]);
        setIsFetchingProjects(false);
        return;
      }

      try {
        setIsFetchingProjects(true);
        const projectsData = await getAllProjects(selectedWorkspace);

        // Transform API response to match component structure
        const transformedProjects = projectsData.map((project) => {
          // Extract project ID from various possible formats
          const projectId = 
            project.id || 
            project.project_id || 
            (typeof project === 'object' && project !== null ? Object.keys(project)[0]?.replace('project:', '') : null) ||
            `project-${Date.now()}-${Math.random()}`;

          // Extract project data (handle nested structure)
          const projectData = project?.data || project?.details || project || {};

          // Get profile photo URL - handle string, array, and object formats
          let profilePhotoUrl = null;
          
          // Helper function to extract URL from profilePhoto
          const extractProfilePhotoUrl = (profilePhoto) => {
            if (!profilePhoto) return null;
            
            // If it's already a string URL, use it directly
            if (typeof profilePhoto === 'string') {
              return profilePhoto;
            }
            
            // If it's an array, get the first item
            if (Array.isArray(profilePhoto) && profilePhoto.length > 0) {
              const firstItem = profilePhoto[0];
              // If first item is a string, use it
              if (typeof firstItem === 'string') {
                return firstItem;
              }
              // If first item is an object, get the url property
              if (typeof firstItem === 'object' && firstItem !== null) {
                return firstItem.url || null;
              }
            }
            
            // If it's an object, get the url property
            if (typeof profilePhoto === 'object' && !Array.isArray(profilePhoto) && profilePhoto !== null) {
              return profilePhoto.url || null;
            }
            
            return null;
          };
          
          // Check profilePhoto in project root
          if (project.profilePhoto) {
            profilePhotoUrl = extractProfilePhotoUrl(project.profilePhoto);
          }
          
          // Check in media object if not found yet
          if (!profilePhotoUrl && project.media?.profilePhoto) {
            profilePhotoUrl = extractProfilePhotoUrl(project.media.profilePhoto);
          }
          
          // Check in projectData/details if not found yet
          if (!profilePhotoUrl && projectData.profilePhoto) {
            profilePhotoUrl = extractProfilePhotoUrl(projectData.profilePhoto);
          }
          
          // Fallback to other image fields
          if (!profilePhotoUrl) {
            profilePhotoUrl = 
              project.image ||
              project.image_url ||
              project.photo ||
              projectData.image ||
              projectData.image_url ||
              projectData.photo ||
              null;
          }

          // Get site name
          const siteName = 
            projectData.site_name ||
            projectData.name ||
            projectData.title ||
            project.name ||
            project.title ||
            'Untitled Project';

          // Get address
          const address = 
            projectData.address ||
            projectData.location ||
            project.address ||
            project.location ||
            '';

          // Get status
          const status = 
            projectData.status ||
            project.status ||
            projectData.project_status ||
            'in_progress';

          // Get progress/completion percentage
          const progress = 
            projectData.progress ||
            projectData.completion_percentage ||
            project.progress ||
            project.completion_percentage ||
            0;

          return {
            id: projectId,
            site_name: siteName,
            name: siteName,
            address: address,
            status: status,
            progress: typeof progress === 'number' ? progress : parseInt(progress) || 0,
            profile_photo: profilePhotoUrl,
            // Keep original data for reference
            originalData: project,
          };
        });

        setProjects(transformedProjects);
        setFilteredProjects(transformedProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
        const errorMessage = 
          error?.response?.data?.message ||
          error?.message ||
          'Failed to load projects';
        showError(errorMessage);
        setProjects([]);
        setFilteredProjects([]);
      } finally {
        setIsFetchingProjects(false);
      }
    };

    fetchProjects();
  }, [selectedWorkspace]);

  // Filter projects based on search and status
  useEffect(() => {
    setIsLoading(true);

    const timeout = setTimeout(() => {
      const search = debouncedSearch.trim().toLowerCase();
      const status = statusFilter.trim().toLowerCase();

      const results = projects.filter((project) => {
        const projectStatus = (project.status || '').toLowerCase();
        const matchesStatus = !status || projectStatus === status;

        if (!matchesStatus) return false;

        if (!search) return true;

        const target =
          `${project.site_name || project.name || ''} ${project.address || ''}`.toLowerCase();

        return target.includes(search);
      });

      setFilteredProjects(results);
      setIsLoading(false);
    }, 200); // small delay to leverage debounce

    return () => clearTimeout(timeout);
  }, [debouncedSearch, statusFilter, projects]);

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

  const handleConfirmDelete = () => {
    // For now, just close modal and filter from local list (static data)
    if (projectToDelete) {
      setFilteredProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));
      setProjectToDelete(null);
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
            <h1 className="!text-[22px] font-semibold text-primary">
              {t('header.title')}
            </h1>

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
                  onEdit={handleEditProject}
                  onDelete={handleRequestDelete}
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
            />
          </>
        )}
      </div>
    </div>
  );
}

