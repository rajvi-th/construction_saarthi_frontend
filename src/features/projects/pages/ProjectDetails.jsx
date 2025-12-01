/**
 * Project Details Page
 * Displays detailed information about a specific project
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Trash } from 'lucide-react';
import Button from '../../../components/ui/Button';
import DropdownMenu from '../../../components/ui/DropdownMenu';
import Loader from '../../../components/ui/Loader';
import { getProjectDetails } from '../api';
import { PROJECT_ROUTES } from '../constants';
import { showError } from '../../../utils/toast';
import { useAuth } from '../../../hooks/useAuth';
import {
  ProjectBanner,
  SiteManagementTools,
  BuilderClientInfo,
  ProjectInfoCard,
} from '../components';
import pencilIcon from '../../../assets/icons/pencil.svg';

export default function ProjectDetails() {
  const { t } = useTranslation('projects');
  const navigate = useNavigate();
  const { slug } = useParams();
  const location = useLocation();
  const { selectedWorkspace } = useAuth();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      // Get project ID from navigation state
      const projectIdFromState = location.state?.projectId;

      if (!projectIdFromState) {
        setIsLoading(false);
        return;
      }

      if (!selectedWorkspace) {
        showError('Workspace not selected');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const projectData = await getProjectDetails(projectIdFromState, selectedWorkspace);

        // Transform API response to match component structure
        const transformedProject = transformProjectData(projectData);

        setProject(transformedProject);
      } catch (error) {
        console.error('Error fetching project details:', error);
        const errorMessage = 
          error?.response?.data?.message ||
          error?.message ||
          'Failed to load project details. Please try again.';
        showError(errorMessage);
        setProject(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectDetails();
  }, [location.state?.projectId, selectedWorkspace]);

  // Helper function to transform API response to component structure
  const transformProjectData = (projectData) => {
    const details = projectData?.details || {};
    
    // Helper function to extract profile photo URL
    const extractProfilePhotoUrl = (profilePhoto) => {
      if (!profilePhoto) return null;
      
      if (typeof profilePhoto === 'string') {
        return profilePhoto;
      }
      
      if (Array.isArray(profilePhoto) && profilePhoto.length > 0) {
        const firstItem = profilePhoto[0];
        if (typeof firstItem === 'string') {
          return firstItem;
        }
        if (typeof firstItem === 'object' && firstItem !== null) {
          return firstItem.url || null;
        }
      }
      
      if (typeof profilePhoto === 'object' && !Array.isArray(profilePhoto) && profilePhoto !== null) {
        return profilePhoto.url || null;
      }
      
      return null;
    };

    // Format total area with sq.ft
    const formatSize = (totalArea) => {
      if (!totalArea) return null;
      const area = typeof totalArea === 'number' ? totalArea : parseFloat(totalArea);
      return isNaN(area) ? null : `${area.toLocaleString('en-IN')} sq.ft`;
    };

    // Format number of floors
    const formatFloors = (numberOfFloors) => {
      if (!numberOfFloors) return null;
      const floors = typeof numberOfFloors === 'number' ? numberOfFloors : parseInt(numberOfFloors);
      return isNaN(floors) ? null : `G+${floors}`;
    };

    // Format estimated budget
    const formatBudget = (estimatedBudget) => {
      if (!estimatedBudget) return null;
      const budget = typeof estimatedBudget === 'number' ? estimatedBudget : parseFloat(estimatedBudget);
      if (isNaN(budget)) return null;
      
      // Format as currency
      if (budget >= 10000000) {
        return `₹${(budget / 10000000).toFixed(2)} Crore`;
      } else if (budget >= 100000) {
        return `₹${(budget / 100000).toFixed(2)} Lakhs`;
      } else {
        return `₹${budget.toLocaleString('en-IN')}`;
      }
    };

    const profilePhotoUrl = extractProfilePhotoUrl(projectData.profilePhoto);

    return {
      id: projectData.id || projectData.project_id,
      site_name: projectData.name || details.name || 'Untitled Project',
      name: projectData.name || details.name || 'Untitled Project',
      address: details.address || projectData.address || '',
      status: projectData.status || 'in_progress',
      progress: details.progress || projectData.progress || 0,
      completion_percentage: details.completion_percentage || projectData.completion_percentage || 0,
      profile_photo: profilePhotoUrl,
      image: profilePhotoUrl,
      builder_name: details.builderName || projectData.builder_name || '',
      contact_number: details.contactNumber || projectData.contact_number || '',
      builder_company: details.builderCompany || projectData.builder_company || '',
      start_date: details.startDate || projectData.start_date || null,
      completion_date: details.endDate || projectData.completion_date || null,
      size: formatSize(details.totalArea || projectData.totalArea || projectData.size),
      no_of_floors: formatFloors(details.numberOfFloors || projectData.numberOfFloors || projectData.no_of_floors),
      construction_type: details.constructionTypeName || projectData.construction_type || '',
      contract_type: details.contractTypeName || projectData.contract_type || '',
      estimated_budget: formatBudget(details.estimatedBudget || projectData.estimatedBudget),
      description: details.description || projectData.description || projectData.project_description || '',
      project_description: details.description || projectData.description || projectData.project_description || '',
      // Keep original data for reference
      originalData: projectData,
    };
  };

  const handleBack = () => {
    navigate(PROJECT_ROUTES.PROJECTS);
  };

  const handleEdit = () => {
    if (!project) return;
    navigate(PROJECT_ROUTES.EDIT_PROJECT.replace(':id', project.id));
  };

  const handleToolClick = (toolId) => {
    // TODO: Navigate to specific tool pages
    console.log('Tool clicked:', toolId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-secondary text-lg mb-2">{t('projectDetails.notFound')}</p>
          <Button variant="primary" onClick={handleBack}>
            {t('projectDetails.backToProjects')}
          </Button>
        </div>
      </div>
    );
  }

  const description = project.description || project.project_description || '';
  const truncatedDescription = description.length > 200 ? description.substring(0, 200) + '...' : description;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Back button + title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={handleBack}
              className=" hover:bg-white/50 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-6 w-6 text-primary" />
            </button>
            <h1 className="text-lg sm:text-[22px] font-bold text-primary leading-snug line-clamp-2">
              {project.site_name || project.name}
            </h1>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 justify-between flex-wrap sm:flex-nowrap sm:justify-end">
            <Button
              variant=""
              size="xs"
              onClick={handleEdit}
              leftIconWrapperClassName="!bg-transparent !p-0"
              leftIcon={
                <img src={pencilIcon} alt="Edit project" className="w-3 h-3 object-contain" />
              }
              className="!border-accent text-accent text-xs sm:!text-sm bg-[#B02E0C0F] !rounded-full px-3 py-1.5 sm:px-5 sm:py-2.5"
            >
              {t('projectDetails.editProject')}
            </Button>
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu
                items={[
                  {
                    label: t('projectDetails.deleteProject'),
                    onClick: () => {
                      // TODO: Implement delete with confirmation
                      console.log('Delete project:', project?.id);
                    },
                    icon: <Trash className="w-4 h-4 text-accent" />,
                    textColor: 'text-accent',
                   },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto ">
        {/* Project Banner Section */}
        <div className="mb-6">
          <ProjectBanner project={project} />
        </div>

        {/* Site Management Tools Section */}
        <div className="mb-6">
          <SiteManagementTools onToolClick={handleToolClick} />
        </div>

        {/* Builder / Client Information + Project Information */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
          <BuilderClientInfo project={project} />
          <ProjectInfoCard project={project} />
        </div>

        {/* Project Description Section */}
        {description && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-[20px] font-medium text-primary mb-3">{t('projectDetails.projectDescription')}</h3>
            <p className="text-primary/50 text-sm font-normal">
              {showFullDescription ? description : truncatedDescription}
            </p>
            {description.length > 200 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-accent font-medium mt-2 hover:underline cursor-pointer"
              >
                {showFullDescription ? t('projectDetails.readLess') : t('projectDetails.readMore')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

