/**
 * Project Information Card Component
 * Reusable component for displaying project information details
 */

import { useTranslation } from 'react-i18next';

export default function ProjectInfoCard({ project }) {
  const { t } = useTranslation('projects');

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h3 className="text-[20px] font-medium text-primary mb-4">
        {t('projectDetails.projectInformation')}
      </h3>
      <div className="grid grid-cols-1 gap-y-3">
        {project.start_date && project.completion_date && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 sm:flex sm:items-start sm:gap-6">
            <span className="text-primary text-xs sm:text-sm font-medium sm:min-w-[130px]">
              {t('projectDetails.projectDuration')}
            </span>
            <p className="text-primary/50 text-xs sm:text-sm font-normal">
              {formatDate(project.start_date)} - {formatDate(project.completion_date)}
            </p>
          </div>
        )}
        {project.size && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 sm:flex sm:items-start sm:gap-6">
            <span className="text-primary text-xs sm:text-sm font-medium sm:min-w-[130px]">
              {t('projectDetails.size')}
            </span>
            <p className="text-primary/50 text-xs sm:text-sm font-normal">{project.size} sq.ft</p>
          </div>
        )}
        {project.no_of_floors && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 sm:flex sm:items-start sm:gap-6">
            <span className="text-primary text-xs sm:text-sm font-medium sm:min-w-[130px]">
              {t('projectDetails.noOfFloors')}
            </span>
            <p className="text-primary/50 text-xs sm:text-sm font-normal">{project.no_of_floors}</p>
          </div>
        )}
        {project.construction_type && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 sm:flex sm:items-start sm:gap-6">
            <span className="text-primary text-xs sm:text-sm font-medium sm:min-w-[130px]">
              {t('projectDetails.constructionType')}
            </span>
            <p className="text-primary/50 text-xs sm:text-sm font-normal">{project.construction_type}</p>
          </div>
        )}
        {project.contract_type && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 sm:flex sm:items-start sm:gap-6">
            <span className="text-primary text-xs sm:text-sm font-medium sm:min-w-[130px]">
              {t('projectDetails.contractType')}
            </span>
            <p className="text-primary/50 text-xs sm:text-sm font-normal">{project.contract_type}</p>
          </div>
        )}
        {project.estimated_budget && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 sm:flex sm:items-start sm:gap-6">
            <span className="text-primary text-xs sm:text-sm font-medium sm:min-w-[130px]">
              {t('projectDetails.estBudget')}
            </span>
            <p className="text-primary/50 text-xs sm:text-sm font-normal">{project.estimated_budget}</p>
          </div>
        )}
      </div>
    </div>
  );
}

