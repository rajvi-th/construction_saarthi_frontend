/**
 * Loader Component
 * Loading spinner matching the application theme
 */

export default function Loader({
  size = 'md',
  color = 'accent',
  className = '',
}) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const colors = {
    accent: 'border-accent',
    primary: 'border-primary',
    secondary: 'border-secondary',
  };

  return (
    <div className={`${className}`}>
      <div
        className={`
          ${sizes[size]} 
          border-4 
          ${colors[color] || colors.accent}
          border-t-transparent 
          rounded-full 
          animate-spin
        `}
      />
    </div>
  );
}
