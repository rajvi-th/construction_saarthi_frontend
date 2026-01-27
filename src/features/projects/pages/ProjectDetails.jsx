import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
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
import { useRestrictedRole } from '../../dashboard/hooks';

export default function ProjectDetails() {
  const { t } = useTranslation('projects');
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { selectedWorkspace } = useAuth();
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Check if user has restricted role (supervisor, builder, contractor)
  const isRestricted = useRestrictedRole();

  // Get project ID from navigation state or URL params
  const projectIdFromState = location.state?.projectId || id;

  const { project, isLoading } = useProjectDetails(projectIdFromState, selectedWorkspace);

  // Sync project name to location state for breadcrumbs
  useEffect(() => {
    if (project && (project.site_name || project.name)) {
      const name = project.site_name || project.name;
      if (location.state?.projectName !== name) {
        navigate(location.pathname, {
          replace: true,
          state: {
            ...location.state,
            projectName: name,
          },
        });
      }
    }
  }, [project, location.state, location.pathname, navigate]);

  const handleEdit = () => {
    if (!project) return;
    navigate(PROJECT_ROUTES.EDIT_PROJECT.replace(':id', project.id), {
      state: {
        projectName: project.site_name || project.name
      }
    });
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
          navigate(getRoute(ROUTES_FLAT.FINANCE_PROJECT_DETAILS, { projectId: project.id }), {
            state: { projectName: project.site_name || project.name }
          });
        }
        break;
      case 'calculator':
        navigate(ROUTES_FLAT.CALCULATION_PROJECTS);
        break;
      case 'documents':
        if (project?.id) {
          navigate(getRoute(ROUTES_FLAT.DOCUMENTS_PROJECT_DOCUMENTS, { projectId: project.id }));
        }
        break;
      case 'labour':
        if (project?.id) {
          navigate(getRoute(ROUTES_FLAT.LABOUR_ATTENDANCE_PROJECT, { projectId: project.id }));
        }
        break;
      case 'gallery':
        if (project?.id) {
          navigate(getRoute(ROUTES_FLAT.PROJECT_GALLERY_DETAILS, { projectId: project.id }));
        }
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
        if (project?.id) {
          navigate(getRoute(ROUTES_FLAT.NOTES_PROJECT_NOTES, { projectId: project.id }));
        }
        break;
      default:
        break;
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
            showBackButton={true}
            backTo={PROJECT_ROUTES.PROJECTS}
          />
          {/* Right: Actions - Hide for restricted roles */}
          {!isRestricted && (
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
                        setProjectToDelete(project);
                      },
                      icon: <Trash className="w-4 h-4 text-accent" />,
                      textColor: 'text-accent',
                    },
                  ]}
                />
              </div>
            </div>
          )}
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

