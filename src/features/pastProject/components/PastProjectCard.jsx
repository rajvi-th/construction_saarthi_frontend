import { useState } from 'react';

/**
 * Past Project Card Component
 * Simple card with image on left and details on right
 * Fully responsive and dynamic
 */
export default function PastProjectCard({ project, onOpenDetails }) {
  const [imageError, setImageError] = useState(false);
  
  const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlBhc3QgUHJvamVjdCBJbWFnZTwvdGV4dD48L3N2Zz4=';
  const imageSrc =
    imageError
      ? defaultImage
      : project.profile_photo ||
        project.image ||
        defaultImage;

  const title = project.site_name || project.name || 'Untitled project';
  const address = project.address || 'No address provided';

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div
      onClick={onOpenDetails}
      className="bg-white rounded-[16px] shadow-[0px_15px_40px_rgba(18,18,18,0.06)] transition-shadow cursor-pointer overflow-hidden p-4"
    >
      <div className="flex flex-col sm:flex-row gap-0">
        {/* Project Image - Left Side */}
        <div className="w-full md:w-[180px] lg:w-[180px] flex-shrink-0">
          <img
            src={imageSrc}
            alt={title}
            onError={handleImageError}
            className="w-full h-48 sm:h-full sm:min-h-[140px] object-cover rounded-lg"
          />
        </div>

        {/* Project Details - Right Side */}
        <div className="flex-1 flex flex-col justify-center px-3.5">
          <h3 className="text-[20px] font-medium text-primary mb-2 sm:mb-3">
            {title}
          </h3>
          <p className="text-primary-light leading-relaxed">
            {address}
          </p>
        </div>
      </div>
    </div>
  );
}

