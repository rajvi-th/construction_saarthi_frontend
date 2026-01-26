/**
 * Project Banner Component
 * Reusable component for displaying project banner with image, title, address, status, and progress
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CircularProgress from '../../../components/ui/CircularProgress';
import ProjectStatusPill from './ProjectStatusPill';


export default function ProjectBanner({ project }) {
  const { t } = useTranslation('projects');
  const [imageError, setImageError] = useState(false);

  // Find profilePhoto from media array
  const mediaArray = project?.media || [];
  const profilePhotoMedia = mediaArray.find(
    (item) => item.typeName === 'profilePhoto' || item.typeId === '1' || item.typeId === 1
  );

  const imageSrc = profilePhotoMedia?.url || project?.profilePhoto || project?.profile_photo || '';

  const title = project?.site_name || project?.name || 'Untitled Project';
  const address = project?.details?.address || project?.address || 'No address provided';
  const status = project?.status || 'Completed';

  // Calculate progress based on dates if available
  const calculateProgress = () => {
    // 1. Try to get dates and calculate strictly based on time
    // Project details might be nested in 'details' or direct
    const p = project?.details || project || {};
    const startStr = p.startDate || p.start_date || project?.startDate || project?.start_date;
    const endStr = p.endDate || p.completion_date || p.end_date || project?.endDate || project?.completion_date || project?.end_date;

    if (startStr && endStr) {
      try {
        const startDate = new Date(startStr);
        const endDate = new Date(endStr);
        const today = new Date();

        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          // Set all to midnight for accurate date-only comparison
          const s = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
          const e = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
          const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());

          // If project hasn't started yet (today is before start date)
          if (t < s) return 0;

          // If project is already past end date
          if (t >= e) return 100;

          const totalDuration = e.getTime() - s.getTime();
          const elapsedDuration = t.getTime() - s.getTime();

          if (totalDuration <= 0) return 100;

          const calculated = Math.round((elapsedDuration / totalDuration) * 100);
          return Math.min(Math.max(calculated, 0), 100);
        }
      } catch (error) {
        console.warn('Date parsing failed for progress calculation', error);
      }
    }

    // 2. Fallback to status only if no valid dates are provided
    if (status.toLowerCase() === 'completed' || status.toLowerCase() === 'complete') {
      return 100;
    }

    // 3. Final fallback: use progress field from API if exists
    return project?.progress ?? project?.completion_percentage ?? 0;
  };

  const progress = calculateProgress();

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center p-4 gap-6">
      {/* Project Image - Reduced width and horizontal on desktop */}
      <div className="w-full sm:w-72 h-[180px] sm:h-44 relative bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}

        {/* Progress on image for mobile screens only */}
        <div className="absolute bottom-2 right-2 sm:hidden">
          <CircularProgress
            percentage={progress}
            size={52}
            strokeWidth={6}
            className="bg-white/80 rounded-full"
          />
        </div>
      </div>

      {/* Project Info - Now alongside the image */}
      <div className="flex-1 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-primary truncate max-w-2xl">
              {title}
            </h2>
            <p className="text-secondary mt-1 mb-4 text-sm sm:text-base line-clamp-2 max-w-xl">
              {address}
            </p>
            <div className="flex items-center gap-4">
              <ProjectStatusPill status={status} readOnly />
            </div>
          </div>

          {/* Progress on the right for ≥ md screens */}
          <div className="hidden md:block flex-shrink-0 pr-4">
            <CircularProgress
              percentage={progress}
              size={82}
              strokeWidth={8}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

