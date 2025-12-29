import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CircularProgress from '../../../components/ui/CircularProgress';
import DropdownMenu from '../../../components/ui/DropdownMenu';
import ProjectStatusPill from './ProjectStatusPill';

/**
 * Single project card
 * Kept dumb/presentational so it's easy to reuse and test.
 * Updated for better responsiveness on smaller screens.
 */
export default function ProjectCard({ project, onOpenDetails, onEdit, onDelete }) {
  const { t } = useTranslation('projects');
  const [imageError, setImageError] = useState(false);

  const title = project.site_name || project.name || 'Untitled project';
  const address = project.address || 'No address provided';
  const status = project.status || 'Completed';
  const progress = project.progress ?? project.completion_percentage ?? 0;
  const imageSrc = project.profile_photo || project.image || '';
  const showImage = Boolean(imageSrc) && !imageError;

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div
      onClick={onOpenDetails}
      className="bg-white rounded-[16px] shadow-[0px_15px_40px_rgba(18,18,18,0.06)] transition-shadow cursor-pointer hover:shadow-[0px_15px_40px_rgba(18,18,18,0.1)]"
    >
      <div className="flex flex-col gap-4 p-3.5 sm:flex-row sm:items-center">
        {/* Project Image */}
        <div className="w-full sm:w-64 flex-shrink-0 relative">
          {showImage ? (
            <img
              src={imageSrc}
              alt={title}
              onError={handleImageError}
              className="w-full h-36 sm:h-40 md:h-44 object-cover rounded-[12px]"
            />
          ) : (
            <div
              className="w-full h-36 sm:h-40 md:h-44 rounded-[12px] bg-[#F3F4F6] flex items-center justify-center text-xs text-[#060C1280]"
              aria-label={t('projectCard.noImage', 'No image')}
              title={t('projectCard.noImage', 'No image')}
            >
              {t('projectCard.noImage', 'No image')}
            </div>
          )}

          {/* Circular progress over image on small screens (bottom-right) */}
          <div className="absolute bottom-1 right-1 sm:hidden ">
            <CircularProgress percentage={progress} size={45} strokeWidth={5} className='bg-white/60 rounded-full' />
          </div>
        </div>

        {/* Project Details */}
        <div className="flex-1 flex flex-col gap-2 min-h-[120px] px-0 sm:px-1.5">
          <div>
            <h3 className="text-base sm:text-lg font-medium text-primary">
              {title}
            </h3>
            <p className="mt-1 text-xs sm:text-[13px] text-[#060C1280] line-clamp-2">
              {address}
            </p>
          </div>

          {/* Status + menu in flex row */}
          <div className="mt-2 sm:mt-auto pt-1 flex items-center justify-between gap-2">
            <ProjectStatusPill status={status} />

            {/* Menu button visible on small screens here */}
            {(onEdit || onDelete) && (
              <div className="sm:hidden" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu
                  position="right"
                  items={[
                    onEdit && {
                      label: t('projectCard.editProject'),
                      onClick: () => onEdit(project),
                    },
                    onDelete && {
                      label: t('projectCard.deleteProject'),
                      onClick: () => onDelete(project),
                      textColor: 'text-accent',
                    },
                  ].filter(Boolean)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Progress + Menu on >= sm screens (right side) */}
        <div className="hidden sm:flex flex-shrink-0 flex-col items-end justify-between w-full sm:w-auto gap-2">
          {(onEdit || onDelete) && (
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu
                position="right"
                items={[
                  onEdit && {
                    label: t('projectCard.editProject'),
                    onClick: () => onEdit(project),
                  },
                  onDelete && {
                    label: t('projectCard.deleteProject'),
                    onClick: () => onDelete(project),
                    textColor: 'text-accent',
                  },
                ].filter(Boolean)}
              />
            </div>
          )}

          <div className="mt-4">
            <CircularProgress percentage={progress} size={78} strokeWidth={7} />
          </div>
        </div>
      </div>
    </div>
  );
}
