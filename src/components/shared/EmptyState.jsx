/**
 * EmptyState Component
 * Displays empty state UI when there's no data to show
 * Used across all features for consistent empty states
 */

import { useTranslation } from 'react-i18next';
import { Inbox, Search, FolderOpen, Package } from 'lucide-react';
import Button from '../ui/Button';

export default function EmptyState({
  icon = 'inbox',
  title,
  message,
  actionLabel,
  onAction,
  className = '',
  iconSize = 'lg',
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

  // Default messages
  const defaultTitle = title || t('emptyState.title', { ns: 'common', defaultValue: 'No data found' });
  const defaultMessage = message || t('emptyState.message', { ns: 'common', defaultValue: 'There is no data to display at the moment.' });

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      {/* Icon */}
      <div className="mb-4">
        <div className={`${iconSizes[iconSize]} text-secondary opacity-50`}>
          <IconComponent className="w-full h-full" strokeWidth={1.5} />
        </div>
      </div>

      {/* Title */}
      {defaultTitle && (
        <h3 className="text-lg font-semibold text-primary mb-2 text-center">
          {defaultTitle}
        </h3>
      )}

      {/* Message */}
      {defaultMessage && (
        <p className="text-sm text-secondary mb-6 text-center max-w-md">
          {defaultMessage}
        </p>
      )}

      {/* Action Button */}
      {actionLabel && onAction && (
        <Button
          variant="primary"
          size="md"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
