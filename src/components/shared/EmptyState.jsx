/**
 * EmptyState Component
 * Displays empty state UI when there's no data to show
 * Used across all features for consistent empty states
 * Supports both Lucide icons and custom images/SVGs
 */

import { useTranslation } from 'react-i18next';
import { Inbox, Search, FolderOpen, Package } from 'lucide-react';
import Button from '../ui/Button';

export default function EmptyState({
  icon = 'inbox',
  image, // Custom image/SVG source
  title,
  message,
  actionLabel,
  onAction,
  className = '',
  iconSize = 'lg',
  imageClassName = '', // Custom className for image
  padding = 'default', // 'default', 'sm', 'md', 'lg'
}) {
  const { t } = useTranslation();

  // Icon mapping
  const icons = {
    inbox: Inbox,
    search: Search,
    folder: FolderOpen,
    package: Package,
  };

  const IconComponent = icons[icon] || Inbox;

  const iconSizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  const paddingClasses = {
    sm: 'py-8 sm:py-10',
    default: 'py-12 sm:py-16 md:py-20',
    md: 'py-12 sm:py-16 md:py-20',
    lg: 'py-16 sm:py-20 md:py-24',
  };

  // Default messages
  const defaultTitle = title || t('emptyState.title', { ns: 'common', defaultValue: 'No data found' });
  const defaultMessage = message || t('emptyState.message', { ns: 'common', defaultValue: 'There is no data to display at the moment.' });

  return (
    <div className={`flex flex-col items-center justify-center px-4 ${paddingClasses[padding]} ${className}`}>
      {/* Icon or Image */}
      {image ? (
        <div className={`mb-6 sm:mb-8 ${imageClassName || ''}`}>
          <img
            src={image}
            alt="Empty State"
            className={`w-full h-auto ${imageClassName.includes('max-w') ? '' : 'max-w-[251px]'}`}
          />
        </div>
      ) : (
        <div className="mb-4">
          <div className={`${iconSizes[iconSize]} text-secondary opacity-50`}>
            <IconComponent className="w-full h-full" strokeWidth={1.5} />
          </div>
        </div>
      )}

      {/* Title */}
      {defaultTitle && (
        <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-primary mb-3 sm:mb-4 text-center">
          {defaultTitle}
        </h3>
      )}

      {/* Message */}
      {defaultMessage && (
        <p className="text-sm sm:text-base text-secondary mb-6 sm:mb-8 text-center max-w-md">
          {defaultMessage}
        </p>
      )}

      {/* Action Button */}
      {actionLabel && onAction && (
        <Button
          variant="primary"
          size="md"
          onClick={onAction}
          className="px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
