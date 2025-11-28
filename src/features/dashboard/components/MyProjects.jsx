import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import PropTypes from 'prop-types';
import Button from '../../../components/ui/Button';
import { ROUTES_FLAT } from '../../../constants/routes';

const MyProjects = ({ projects, onCreateProject }) => {
  const { t } = useTranslation('dashboard');
  const navigate = useNavigate();

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-primary">
          {t('projects.title')}
        </h2>
        <button
          onClick={() => navigate(ROUTES_FLAT.PROJECTS)}
          className="text-sm sm:text-base text-accent cursor-pointer"
        >
          {t('projects.viewAll')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {projects.slice(0, 3).map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden transition-shadow cursor-pointer"
            onClick={project.onClick || (() => {})}
          >
            <div className="relative h-40 sm:h-48">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-primary mb-1 sm:mb-2 capitalize">
                {project.title}
              </h3>
              <p className="text-xs sm:text-sm text-secondary mb-3 sm:mb-4 capitalize">
                {project.address}
              </p>
              <div className="flex items-center gap-2">
                <div className="text-xs sm:text-sm">
                  <span className="text-secondary">
                    {t('dashboard.projects.budget', { ns: 'common', defaultValue: 'Budget:' })}
                  </span>{' '}
                  <span className="font-medium text-primary">{project.budget}</span>
                </div>
                <div className="h-4 w-px bg-secondary"></div>
                <div className="text-xs sm:text-sm">
                  <span className="text-secondary">
                    {t('dashboard.projects.balance', { ns: 'common', defaultValue: 'Balance' })}
                  </span>{' '}
                  <span className="font-medium text-primary">{project.balance}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Create New Project Card */}
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
            onClick={onCreateProject || (() => {})}
            leftIcon={<Plus className="w-3 h-3 text-accent" strokeWidth={3} />}
            className="w-full"
          >
            {t('dashboard.projects.createProject', { ns: 'common', defaultValue: 'Create Project' })}
          </Button>
        </div>
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

