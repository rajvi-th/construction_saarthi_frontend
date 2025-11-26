/**
 * Button Component
 * Reusable button component with primary and secondary variants
 * Supports leftIcon and leftIconName props for icons (left side only)
 */

import * as LucideIcons from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  leftIcon,
  leftIconName,
  iconClassName = '',
  iconSize,
  ...props
}) {
  const baseClasses = 'rounded-lg transition-colors focus:outline-none cursor-pointer flex items-center justify-center gap-2';

  const variants = {
    primary: 'bg-accent text-white hover:bg-[#9F290A] focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-[#FBFBFB] text-secondary border border-gray-200 hover:bg-gray-50 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2 text-base',
    lg: 'px-8 py-3 text-lg',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
  };

  // Get icon component from lucide-react by name
  const getIconByName = (iconName, customSize) => {
    if (!iconName) return null;
    const IconComponent = LucideIcons[iconName];
    if (!IconComponent) {
      return null;
    }
    const sizeClass = customSize || iconSizes[size];
      return <IconComponent className={sizeClass} strokeWidth={3} />;
  };

  // Render left icon (priority: leftIcon > leftIconName)
  const renderLeftIcon = () => {
    if (leftIcon) return leftIcon;
    if (leftIconName) return getIconByName(leftIconName, iconSize);
    return null;
  };

  const leftIconElement = renderLeftIcon();

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {leftIconElement && (
        <span className={`flex items-center justify-center bg-white rounded-full p-1 ${iconClassName || ''}`}>
          {leftIconElement}
        </span>
      )}
      {children}
    </button>
  );
}
