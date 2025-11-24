/**
 * CircularProgress Component
 * Reusable circular progress indicator with percentage display
 */

export default function CircularProgress({
  percentage = 0,
  size = 120,
  strokeWidth = 8,
  color = '#B02E0C', // accent color
  backgroundColor = '#E2E7ED',
  showPercentage = true,
  className = '',
}) {
  // Ensure percentage is between 0 and 100
  const normalizedPercentage = Math.min(Math.max(percentage, 0), 100);
  
  // Calculate radius and circumference
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalizedPercentage / 100) * circumference;
  
  // Center position
  const center = size / 2;
  const viewBox = `0 0 ${size} ${size}`;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={viewBox}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      
      {/* Percentage text */}
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-semibold text-primary">
            {Math.round(normalizedPercentage)}%
          </span>
        </div>
      )}
    </div>
  );
}

