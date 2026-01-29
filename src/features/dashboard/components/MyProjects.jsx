import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import PropTypes from 'prop-types';
import Button from '../../../components/ui/Button';
import { ROUTES_FLAT } from '../../../constants/routes';
import { PROJECT_ROUTES } from '../../projects/constants';
import { useRestrictedRole } from '../hooks';

const ProjectItem = ({ project, t, onClick }) => {
  const [imageError, setImageError] = useState(false);
  const showImage = Boolean(project.image) && !imageError;

  return (
    <div
      className="bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden transition-shadow cursor-pointer hover:shadow-md h-full flex flex-col"
      onClick={onClick || project.onClick || (() => { })}
    >
      <div className="relative h-40 sm:h-48 bg-[#F3F4F6] flex-shrink-0">
        {showImage ? (
          <img
            src={project.image}
            alt={project.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-[#060C1280]">
            {t('projects.noImage', { ns: 'dashboard', defaultValue: 'No image' })}
          </div>
        )}
      </div>
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <h3 className="text-base sm:text-lg font-semibold text-primary mb-1 capitalize truncate">
          {project.title}
        </h3>
        <p className="text-xs sm:text-sm text-secondary mb-3 capitalize line-clamp-1">
          {project.address}
        </p>
        <div className="mt-auto flex items-center gap-2">
          <div className="text-[11px] sm:text-xs">
            <span className="text-secondary">
              {t('budget', { ns: 'common', defaultValue: 'Budget:' })}
            </span>{' '}
            <span className="font-semibold text-primary">{project.budget}</span>
          </div>
          <div className="h-3 w-px bg-gray-200"></div>
          <div className="text-[11px] sm:text-xs">
            <span className="text-secondary">
              {t('balance', { ns: 'common', defaultValue: 'Balance:' })}
            </span>{' '}
            <span className="font-semibold text-primary">{project.balance}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const MyProjects = ({ projects, onCreateProject }) => {
  const { t } = useTranslation(['dashboard', 'projects', 'common']);
  const navigate = useNavigate();

  // Check if user has restricted role (supervisor, builder, contractor)
  const isRestricted = useRestrictedRole();

  const handleProjectClick = (project) => {
    const projectName = project.title || '';
    const slug = projectName
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    navigate(PROJECT_ROUTES.PROJECT_DETAILS.replace(':slug', slug || project.id), {
      state: {
        projectId: project.id,
        projectName: project.title,
        fromDashboard: true,
        fromProjects: true,
      },
    });
  };

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-primary">
          {t('projects.title')}
        </h2>
        <button
          onClick={() => navigate(ROUTES_FLAT.PROJECTS, { state: { fromDashboard: true } })}
          className="text-sm sm:text-base text-accent font-medium hover:underline cursor-pointer"
        >
          {t('projects.viewAll')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {projects.slice(0, 3).map((project) => (
          <ProjectItem
            key={project.id}
            project={project}
            t={t}
            onClick={() => handleProjectClick(project)}
          />
        ))}

        {/* Create New Project Card - Hide for restricted roles */}
        {!isRestricted && (
          <div
            className="bg-white rounded-xl sm:rounded-2xl shadow-sm flex flex-col items-center justify-center p-6 sm:p-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(to bottom, #FFFFFF 0%, #FFE2DA 100%)'
            }}
          >
            <h3 className="text-base sm:text-lg font-semibold text-primary mb-2 text-center">
              {t('dashboard.projects.startNew', { ns: 'common', defaultValue: 'Start a New Construction Project' })}
            </h3>
            <p className="text-xs sm:text-sm text-secondary mb-4 sm:mb-6 text-center">
              {t('dashboard.projects.startNewDescription', { ns: 'common', defaultValue: 'Start tracking your site now.' })}
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={onCreateProject || (() => { })}
              leftIcon={<Plus className="w-3 h-3 text-accent" strokeWidth={3} />}
              className="w-full"
            >
              {t('dashboard.projects.createProject', { ns: 'common', defaultValue: 'Create Project' })}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

MyProjects.propTypes = {
  projects: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      image: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      address: PropTypes.string.isRequired,
      budget: PropTypes.string.isRequired,
      balance: PropTypes.string.isRequired,
      onClick: PropTypes.func,
    })
  ).isRequired,
  onCreateProject: PropTypes.func,
};

export default MyProjects;

