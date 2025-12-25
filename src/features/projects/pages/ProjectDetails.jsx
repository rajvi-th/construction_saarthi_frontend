import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trash } from 'lucide-react';
import Button from '../../../components/ui/Button';
import DropdownMenu from '../../../components/ui/DropdownMenu';
import Loader from '../../../components/ui/Loader';
import { PROJECT_ROUTES } from '../constants';
import { useAuth } from '../../../hooks/useAuth';
import { ROUTES_FLAT, getRoute } from '../../../constants/routes';
import {
  ProjectBanner,
  SiteManagementTools,
  BuilderClientInfo,
  ProjectInfoCard,
} from '../components';
import pencilIcon from '../../../assets/icons/pencil.svg';
import PageHeader from '../../../components/layout/PageHeader';
import { useProjectDetails } from '../hooks';

export default function ProjectDetails() {
  const { t } = useTranslation('projects');
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedWorkspace } = useAuth();
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Get project ID from navigation state
  const projectIdFromState = location.state?.projectId;
  
  const { project, isLoading } = useProjectDetails(projectIdFromState, selectedWorkspace);

  const handleBack = () => {
    navigate(PROJECT_ROUTES.PROJECTS);
  };

  const handleEdit = () => {
    if (!project) return;
    navigate(PROJECT_ROUTES.EDIT_PROJECT.replace(':id', project.id));
  };

  const handleToolClick = (toolId) => {
    // Navigate to specific tool pages based on toolId
    switch (toolId) {
      case 'inventory':
        // Navigate to site inventory with project context
        navigate(ROUTES_FLAT.SITE_INVENTORY, {
          state: {
            projectId: project?.id,
            projectName: project?.site_name || project?.name,
          },
        });
        break;
      case 'finance':
        // Navigate to finance project detail page
        if (project?.id) {
          navigate(getRoute(ROUTES_FLAT.FINANCE_PROJECT_DETAILS, { projectId: project.id }));
        }
        break;
      case 'calculator':
        // TODO: Navigate to calculator page
        console.log('Calculator tool clicked');
        break;
      case 'documents':
        // TODO: Navigate to documents page
        console.log('Documents tool clicked');
        break;
      case 'labour':
        // TODO: Navigate to labour sheet page
        console.log('Labour sheet tool clicked');
        break;
      case 'gallery':
        // TODO: Navigate to gallery page
        console.log('Gallery tool clicked');
        break;
      case 'dpr':
        navigate(ROUTES_FLAT.DPR, {
          state: {
            projectId: project?.id,
            projectName: project?.site_name || project?.name,
          },
        });
        break;
      case 'notes':
        // Navigate to project notes page
        if (project?.id) {
          navigate(getRoute(ROUTES_FLAT.NOTES_PROJECT_NOTES, { projectId: project.id }));
        }
        break;
      default:
        console.log('Tool clicked:', toolId);
    }
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
          <PageHeader
            title={project.site_name || project.name}
            className="flex-1 min-w-0"
          />
          {/* Right: Actions */}
          <div className="flex items-center gap-2 justify-between flex-wrap sm:flex-nowrap sm:justify-end">
            <Button
              size="xs"
              onClick={handleEdit}
              className="!border-accent font-medium !text-accent text-xs sm:!text-sm !bg-[#B02E0C0F] !rounded-full px-3 py-1.5 sm:px-5 sm:py-2.5"
            >
              <img src={pencilIcon} alt="Edit project" className="w-4 h-4 object-contain" />
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

