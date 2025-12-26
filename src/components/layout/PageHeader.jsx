/**
 * PageHeader Component
 * Reusable header component with back button and title
 * Can be extended with additional actions/buttons
 */

import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PageHeader({
  title,
  onBack,
  showBackButton = true,
  className = '',
  children, // For additional actions/buttons on the right side
  titleActions, // For actions that should appear in the title line (e.g., on mobile)
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`mb-4 sm:mb-5 md:mb-6 ${className}`}>
      {/* Title Row */}
      <div className="flex flex-col gap-3 sm:gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
        {/* Title Section */}
        <div className={`flex items-center gap-2 sm:gap-3 min-w-0 flex-1 ${titleActions ? 'justify-between md:justify-start' : ''}`}>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="p-1 pl-0 transition-colors cursor-pointer flex-shrink-0"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary" />
              </button>
            )}
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-primary min-w-0 break-words line-clamp-2 sm:line-clamp-1">
              {title}
            </h1>
          </div>
          {/* Title Actions - shown in title line on right side (typically for mobile) */}
          {titleActions && (
            <div className="flex items-center flex-shrink-0 md:hidden ml-2">
              {titleActions}
            </div>
          )}
        </div>
        {/* Actions Section - Hidden on tablet, shown on desktop */}
        {children && (
          <div className="hidden lg:block w-full sm:w-auto min-w-0 flex-shrink-0">
            {children}
          </div>
        )}
      </div>
      {/* Actions Section Below - Only shown on tablet */}
      {children && (
        <div className="mt-3 md:mt-4 lg:hidden">
          {children}
        </div>
      )}
    </div>
  );
}
