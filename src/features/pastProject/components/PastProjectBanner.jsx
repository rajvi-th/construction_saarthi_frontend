/**
 * Past Project Banner Component
 * Reusable component for displaying past project banner with image, title, and address
 * Adapted from ProjectBanner but without progress/status for past projects
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Placeholder image (SVG data URI)
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI0MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5QYXN0IFByb2plY3QgSW1hZ2U8L3RleHQ+PC9zdmc+';

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

export default function PastProjectBanner({ project }) {
  const { t } = useTranslation('pastProjects');
  const [imageError, setImageError] = useState(false);
  
  const imageSrc = getProjectImage(project);
  const displayImage = imageError ? PLACEHOLDER_IMAGE : imageSrc;
  const title = project.site_name || project.name || t('untitled', { defaultValue: 'Untitled Project' });
  const address = project.address || t('detail.noAddressProvided', { defaultValue: 'No address provided' });

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Project Image */}
      <div className="w-full h-[220px] relative bg-gray-100">
        <img
          src={displayImage}
          alt={title}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Project Info */}
      <div className="p-5">
        <div className="flex flex-col">
          <h2 className="text-lg sm:text-[22px] font-bold text-primary">
            {title}
          </h2>
          <p className="text-secondary text-sm sm:text-base">
            {address}
          </p>
        </div>
      </div>
    </div>
  );
}

