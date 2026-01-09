/**
 * Project Card Component for DPR
 * Displays project information in a card format
 */

import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export default function ProjectCard({ project, onClick }) {
  const { t } = useTranslation('dpr');
  const [imageError, setImageError] = useState(false);

  const title = project.site_name || project.name || 'Untitled project';
  const address = project.address || '';
  const imageSrc = project.profile_photo || project.image || '';
  const showImage = Boolean(imageSrc) && !imageError;

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-[16px] shadow-[0px_15px_40px_rgba(18,18,18,0.06)] transition-shadow cursor-pointer p-4"
    >
      <div className="flex items-center gap-4">
        {/* Project Image */}
        <div className="w-20 h-20 flex-shrink-0">
          {showImage ? (
            <img
              src={imageSrc}
              alt={title}
              onError={handleImageError}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <div
              className="w-full h-full rounded-xl bg-[#F3F4F6] flex items-center justify-center text-xs text-[#060C1280]"
              aria-label={t('no_image', 'No image')}
              title={t('no_image', 'No image')}
            >
              {t('no_image', 'No image')}
            </div>
          )}
        </div>

        {/* Project Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-primary truncate">
            {title}
          </h3>
          <p className="mt-1 text-sm text-[#060C1280] truncate">
            {address}
          </p>
        </div>
      </div>
    </div>
  );
}

