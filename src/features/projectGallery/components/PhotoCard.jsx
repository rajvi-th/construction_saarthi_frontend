/**
 * Photo Card Component
 * Displays photo thumbnail with options menu
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MoreVertical } from 'lucide-react';
import DropdownMenu from '../../../components/ui/DropdownMenu';

export default function PhotoCard({ photo, onView, onDelete }) {
  const { t } = useTranslation('projectGallery');
  const [imageError, setImageError] = useState(false);

  // Extract photo name from URL
  const getPhotoName = () => {
    if (photo.name) return photo.name;
    if (photo.fileName) return photo.fileName;
    if (photo.url) {
      const urlParts = photo.url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      return fileName.split('?')[0] || 'Photo';
    }
    return 'Photo';
  };

  // Get image URL
  const getImageUrl = () => {
    if (imageError) return null;
    return photo.url || photo.imageUrl || photo.thumbnail || null;
  };

  const photoName = getPhotoName();
  const imageUrl = getImageUrl();

  const menuItems = [
    {  
      label: t('actions.delete', { defaultValue: 'Delete' }),
      onClick: () => {
        if (onDelete) onDelete(photo);
      },
      textColor: 'text-red-600',
    },
  ];

  return (
    <div className="relative group cursor-pointer" onClick={() => onView?.(photo) || (photo.url && window.open(photo.url, '_blank'))}>
      {/* Photo Thumbnail */}
      <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={photoName}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}

        {/* Options Menu */}
        <div
          className="absolute top-1 right-0 z-20"
          onClick={(e) => {
            // Prevent card onClick from firing when clicking menu
            e.stopPropagation();
          }}
        >
          <DropdownMenu
            items={menuItems}
            position="right"
            trigger={
              <button
                type="button"
                className="p-2 cursor-pointer hover:bg-black/10 rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-secondary" />
              </button>
            }
          />
        </div>
      </div>
    </div>
  );
}

