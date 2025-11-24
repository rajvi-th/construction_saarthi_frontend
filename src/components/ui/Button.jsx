/**
 * Button Component
 * Reusable button component with primary and secondary variants
 */

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  ...props
}) {
  const baseClasses = 'rounded-lg font-medium transition-colors focus:outline-none cursor-pointer';

  const variants = {
    primary: 'bg-accent text-white hover:bg-[#9F290A] focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-[#FBFBFB] text-secondary border border-gray-200 hover:bg-gray-50 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2 text-base',
    lg: 'px-8 py-3 text-lg',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
