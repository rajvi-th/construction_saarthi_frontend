import { useState } from 'react';

// Placeholder image (SVG data URI)
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlBhc3QgUHJvamVjdCBJbWFnZTwvdGV4dD48L3N2Zz4=';

// Helper function to get first valid URL from array or string
const getFirstImageUrl = (value) => {
  if (!value) return null;
  if (Array.isArray(value)) {
    return value.length > 0 ? value[0] : null;
  }
  if (typeof value === 'string' && value.trim()) {
    return value;
  }
  return null;
};

// Get project image from multiple sources with fallback
const getProjectImage = (project) => {
  // 1. Check pastWorkMedia array (only non-deleted items)
  if (project.pastWorkMedia && Array.isArray(project.pastWorkMedia)) {
    const activeMedia = project.pastWorkMedia.filter(
      (media) => !media.isDeleted && media.url
    );
    
    // Prefer image types (typeId 1, 3, or 12), fallback to any media
    const imageMedia = activeMedia.find(
      (media) => {
        const typeId = String(media.typeId || '');
        return typeId === '1' || typeId === '3' || typeId === '12' || 
               media.typeId === 1 || media.typeId === 3 || media.typeId === 12;
      }
    );
    
    if (imageMedia?.url) return imageMedia.url;
    
    // Fallback: find first image by file extension
    const imageByExtension = activeMedia.find((media) => {
      const url = (media.url || '').toLowerCase();
      return url.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i);
    });
    if (imageByExtension?.url) return imageByExtension.url;
    
    // Last fallback: any media
    if (activeMedia[0]?.url) return activeMedia[0].url;
  }
  
  // 2. Check array fields (API returns arrays)
  const profilePhotoUrl = getFirstImageUrl(project.profilePhoto);
  if (profilePhotoUrl) return profilePhotoUrl;

  const photoUrl = getFirstImageUrl(project.photo);
  if (photoUrl) return photoUrl;

  const myPastWorkphotoUrl = getFirstImageUrl(project.myPastWorkphoto);
  if (myPastWorkphotoUrl) return myPastWorkphotoUrl;
  
  // 3. Check string fields (backward compatibility)
  if (project.profile_photo) {
    const url = getFirstImageUrl(project.profile_photo);
    if (url) return url;
  }
  if (project.image) {
    const url = getFirstImageUrl(project.image);
    if (url) return url;
  }
  
  // 4. Return placeholder if no image found
  return PLACEHOLDER_IMAGE;
};

/**
 * Past Project Card Component
 * Simple card with image on left and details on right
 * Fully responsive and dynamic
 */
export default function PastProjectCard({ project, onOpenDetails }) {
  const [imageError, setImageError] = useState(false);
  
  const imageSrc = getProjectImage(project);
  const displayImage = imageError ? PLACEHOLDER_IMAGE : imageSrc;

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
            src={displayImage}
            alt={title}
            onError={handleImageError}
            className="w-full h-48 sm:h-full sm:min-h-[140px] object-cover rounded-lg bg-gray-100"
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

