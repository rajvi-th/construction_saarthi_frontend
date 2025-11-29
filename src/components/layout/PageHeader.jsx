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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
        {/* Title Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="p-1 pl-0! transition-colors cursor-pointer flex-shrink-0"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </button>
          )}
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-primary">
            {title}
          </h1>
        </div>
        {/* Actions Section */}
        {children && (
          <div className="w-full lg:w-auto">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

