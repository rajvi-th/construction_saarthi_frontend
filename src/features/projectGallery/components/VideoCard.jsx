import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MoreVertical, Play } from 'lucide-react';
import DropdownMenu from '../../../components/ui/DropdownMenu';

export default function VideoCard({ video, onPlay, onDelete }) {
  const { t } = useTranslation('projectGallery');
  const [imageError, setImageError] = useState(false);

  // Extract video name from URL
  const getVideoName = () => {
    if (video.name) return video.name;
    if (video.fileName) return video.fileName;
    if (video.url) {
      const urlParts = video.url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      return fileName.split('?')[0] || 'Video';
    }
    return 'Video';
  };

  // Format date (e.g., "12 May 2025")
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Get thumbnail URL (if available) or use video URL as fallback
  const getThumbnailUrl = () => {
    if (imageError) return null;
    return video.thumbnail || video.thumbnailUrl || video.url || null;
  };

  const videoName = getVideoName();
  const date = formatDate(video.createdAt || video.date);
  const thumbnailUrl = getThumbnailUrl();

  const menuItems = [
    {
      label: t('actions.delete', { defaultValue: 'Delete' }),
      onClick: () => {
        if (onDelete) onDelete(video);
      },
      textColor: 'text-red-600',
    },
  ];

  return (
    <div className="relative group cursor-pointer" onClick={() => onPlay?.(video) || (video.url && window.open(video.url, '_blank'))}>
      {/* Video Thumbnail */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={videoName}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <Play className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
          <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center hover:bg-black/90 transition-colors shadow-lg">
            <Play className="w-7 h-7 text-white ml-1" fill="white" />
          </div>
        </div>

        {/* Options Menu */}
        <div
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <DropdownMenu
            items={menuItems}
            position="right"
            trigger={
              <button className="p-2 cursor-pointer">
                <MoreVertical className="w-4 h-4 text-secondary" />
              </button>
            }
          />
        </div>
      </div>
    </div>
  );
}

