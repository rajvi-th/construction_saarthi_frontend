/**
 * Project Banner Component
 * Reusable component for displaying project banner with image, title, address, status, and progress
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CircularProgress from '../../../components/ui/CircularProgress';
import ProjectStatusPill from './ProjectStatusPill';

// Status badge color mapping
const getStatusColor = (status) => {
  const statusMap = {
    completed: 'green',
    pending: 'pink',
    in_progress: 'blue',
    upcoming: 'yellow',
  };
  return statusMap[status?.toLowerCase()] || 'green';
};

export default function ProjectBanner({ project }) {
  const { t } = useTranslation('projects');
  const [imageError, setImageError] = useState(false);
  
  // Simple gray placeholder as data URI (no external dependency)
  const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI0MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
  const imageSrc = imageError 
    ? defaultImage 
    : project.profile_photo || project.image || defaultImage;
  const title = project.site_name || project.name || 'Untitled Project';
  const address = project.address || 'No address provided';
  const status = project.status || 'Completed';
  const progress = project.progress ?? project.completion_percentage ?? 0;

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Project Image */}
      <div className="w-full h-[220px] relative">
        <img
          src={imageSrc}
          alt={title}
          onError={handleImageError}
          className="w-full h-full object-cover"
        />

        {/* Progress on image for small screens */}
        <div className="absolute bottom-2 right-2 sm:hidden">
          <CircularProgress
            percentage={progress}
            size={56}
            strokeWidth={7}
            className="bg-white/70 rounded-full"
          />
        </div>
      </div>

      {/* Project Info */}
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-lg sm:text-[22px] font-bold text-primary">
              {title}
            </h2>
            <p className="text-secondary mb-3 sm:mb-4 text-sm sm:text-base">
              {address}
            </p>
            <ProjectStatusPill status={status} />
          </div>

          {/* Progress on the right for ≥ sm screens */}
          <div className="hidden sm:block flex-shrink-0">
            <CircularProgress
              percentage={progress}
              size={74}
              strokeWidth={8}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

