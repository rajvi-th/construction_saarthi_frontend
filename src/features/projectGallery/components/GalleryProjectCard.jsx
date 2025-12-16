/**
 * Gallery Project Card Component
 * Displays project in gallery view with thumbnail, name, location, and address
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES_FLAT } from '../../../constants/routes';

export default function GalleryProjectCard({ project }) {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  
  // Get image from various possible fields
  const getImageUrl = () => {
    if (imageError) return null;
    
    // Check transformed project data (from useProjects hook)
    if (project.profile_photo) return project.profile_photo;
    
    // Check original data
    const originalData = project.originalData || project;
    
    // Check direct profilePhoto field (from API response)
    if (originalData.profilePhoto) return originalData.profilePhoto;
    
    // Check media array for profilePhoto
    if (originalData.media && Array.isArray(originalData.media)) {
      const profilePhoto = originalData.media.find(
        (m) => m.typeName === 'profilePhoto' || m.typeId === '1' || m.typeId === 1
      );
      if (profilePhoto?.url) return profilePhoto.url;
    }
    
    // Check media object (if media is an object with profilePhoto key)
    if (originalData.media && typeof originalData.media === 'object' && !Array.isArray(originalData.media)) {
      const profilePhoto = originalData.media.profilePhoto;
      if (profilePhoto) {
        if (typeof profilePhoto === 'string') return profilePhoto;
        if (Array.isArray(profilePhoto) && profilePhoto.length > 0) {
          return typeof profilePhoto[0] === 'string' ? profilePhoto[0] : profilePhoto[0]?.url;
        }
        if (profilePhoto.url) return profilePhoto.url;
      }
    }
    
    // Check other image fields
    return (
      originalData.profile_photo ||
      originalData.image ||
      originalData.thumbnail ||
      null
    );
  };

  const imageSrc = getImageUrl();
  
  // Get project name - from transformed data or original
  const projectName = project.site_name || project.name || 'Untitled Project';
  
  // Get original data for details
  const originalData = project.originalData || project;
  const details = originalData.details || {};
  
  // Extract location from address (first part before comma) or use city if available
  const fullAddress = project.address || details.address || '';
  const addressParts = fullAddress.split(',').map(part => part.trim());
  const location = addressParts.length > 1 ? addressParts[addressParts.length - 1] : ''; // Last part is usually city/location
  
  // Get full address
  const address = project.address || details.address || 'No address provided';

  const handleImageError = () => {
    setImageError(true);
  };

  const handleCardClick = () => {
    navigate(ROUTES_FLAT.PROJECT_GALLERY_DETAILS.replace(':projectId', project.id), {
      state: {
        projectName,
        projectId: project.id,
      },
    });
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex gap-4 items-center">
        {/* Thumbnail Image */}
        {imageSrc && (
          <div className="flex-shrink-0">
            <img
              src={imageSrc}
              alt={projectName}
              onError={handleImageError}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover "
            />
          </div>
        )}

        {/* Project Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-primary mb-1 line-clamp-1 capitalize ">
            {projectName}
            {location && (
              <span className="text-secondary font-normal">, {location}</span>
            )}
          </h3>
          <p className="text-sm text-secondary line-clamp-2 capitalize">
            {address}
          </p>
        </div>
      </div>
    </div>
  );
}

