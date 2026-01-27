/**
 * Past Project Detail Page
 * Shows detailed information about a past project including banner, documents, and gallery
 * Fully responsive and dynamic
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/Button';
import Loader from '../../../components/ui/Loader';
import PageHeader from '../../../components/layout/PageHeader';
import { PAST_PROJECT_ROUTES } from '../constants';
import { getRoute } from '../../../constants/routes';
import { useAuth } from '../../../hooks/useAuth';
import pencilIcon from '../../../assets/icons/pencil.svg';
import PastProjectBanner from '../components/PastProjectBanner';
import PastProjectDocumentsGallery from '../components/PastProjectDocumentsGallery';
import { getPastProjectById } from '../api/pastProjectApi';
import { showError } from '../../../utils/toast';

export default function PastProjectDetail() {
  const { t } = useTranslation(['pastProjects', 'common']);
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { selectedWorkspace } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get project from location state or fetch by ID
  const projectFromState = location.state?.project;
  const [project, setProject] = useState(projectFromState);

  // Synchronize state if navigation state changes
  useEffect(() => {
    if (location.state?.project) {
      setProject(location.state.project);
    }
  }, [location.state?.project]);

  useEffect(() => {
    // If no project data or we want to refresh, fetch by ID
    // We pass selectedWorkspace for fallback logic in the API
    if (id && (!project || location.state?.refresh)) {
      setIsLoading(true);
      setError(null);

      getPastProjectById(id, selectedWorkspace)
        .then((projectData) => {
          setProject(projectData);
        })
        .catch((err) => {
          console.error('Error fetching project:', err);
          const errorMessage =
            err?.response?.data?.message ||
            err?.message ||
            t('error.failedToLoad', { defaultValue: 'Failed to load project details' });
          setError(errorMessage);
          showError(errorMessage);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id, selectedWorkspace, t, location.state?.refresh, project]);

  // Effect to update location state with project name for breadcrumbs
  useEffect(() => {
    if (project && (project.site_name || project.name)) {
      const name = project.site_name || project.name;
      // Only update if the name in state is missing or different to avoid infinite loops
      if (location.state?.projectName !== name) {
        navigate(location.pathname, {
          replace: true,
          state: {
            ...location.state,
            projectName: name
          }
        });
      }
    }
  }, [project, location.state, location.pathname, navigate]);

  const handleBack = () => {
    navigate(PAST_PROJECT_ROUTES.LIST);
  };

  const handleEdit = () => {
    if (!project) return;

    // Get project ID (can be id, projectKey, or _id)
    const projectId = project.id || project.projectKey || project._id;

    if (!projectId) {
      console.error('Project ID not found');
      return;
    }

    // Navigate to edit page
    navigate(getRoute(PAST_PROJECT_ROUTES.EDIT, { id: projectId }), {
      state: {
        project,
        projectName: project.site_name || project.name
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (error || (!project && !isLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-secondary text-lg mb-2">
            {error || t('error.projectNotFound', { ns: 'pastProjects', defaultValue: 'Past project not found' })}
          </p>
          <Button variant="primary" onClick={handleBack}>
            {t('detail.backToPastWork', { ns: 'pastProjects', defaultValue: 'Back to Past Work' })}
          </Button>
        </div>
      </div>
    );
  }


  return (
    <div >
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title={project.site_name || project.name}
          showBackButton={true}
          backTo={PAST_PROJECT_ROUTES.LIST}
        >
          <Button
            size="xs"
            onClick={handleEdit}
            className="!border-accent font-medium !text-accent text-xs sm:!text-sm !bg-[#B02E0C0F] !rounded-full px-3 py-1.5 sm:px-5 sm:py-2.5"
          >
            <img src={pencilIcon} alt={t('detail.editProject', { ns: 'pastProjects', defaultValue: 'Edit Project' })} className="w-4 h-4 object-contain" />
            {t('detail.editProject', { ns: 'pastProjects', defaultValue: 'Edit Project' })}
          </Button>
        </PageHeader>
      </div>


      <div className="max-w-7xl mx-auto">
        {/* Project Banner Section */}
        <div className="mb-6">
          <PastProjectBanner project={project} />
        </div>

        {/* Documents and Gallery Section */}
        <PastProjectDocumentsGallery project={project} />
      </div>
    </div>
  );
}

