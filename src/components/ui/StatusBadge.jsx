/**
 * StatusBadge Component
 * Displays status badge with colored background and border
 */

// Export background colors (without borders) for reuse
export const statusBadgeBgColors = {
  red: "bg-[rgba(255,59,48,0.08)]",
  green: "bg-[rgba(52,199,89,0.08)]",
  yellow: "bg-[rgba(255,149,0,0.08)]",
  blue: "bg-[rgba(0,122,255,0.078)]",
  purple: "bg-[rgba(175,82,222,0.078)]",
  pink: "bg-[rgba(255,45,85,0.006)]",
  darkblue: "bg-[rgba(33,0,93,0.06)]",
};

// Export colors from StatusBadge for reuse across the app
export const statusBadgeColors = {
  red: {
    border: "rgba(255, 59, 48, 1)",
    background: "rgba(255,59, 48, 0.08)",
    text: "#FF3B30",
  },
  green: {
    border: "rgba(52, 199, 89, 0.4)",
    background: "rgba(52, 199, 89, 0.08)",
    text: "#34C759",
  },
  yellow: {
    border: "rgba(255, 149, 0, 0.4)",
    background: "rgba(255, 149, 0, 0.08)",
    text: "#FF9500",
  },
  blue: {
    border: "rgba(0, 122, 255, 0.4)",
    background: "rgba(0, 122, 255, 0.078)",
    text: "#007AFF",
  },
  purple: {
    border: "rgba(175, 82, 222, 0.4)",
    background: "rgba(175, 82, 222, 0.078)",
    text: "#AF52DE",
  },
  pink: {
    border: "rgba(255, 45, 85, 0.4)",
    background: "#FFEEF3",
    text: "#FF2D55",
  },
  darkblue: {
    border: "rgba(33, 0, 93, 0.4)",
    background: "rgba(33, 0, 93, 0.06)",
    text: "#21005D",
  },
};

// Export individual color arrays for convenience
export const statusBadgeColorHex = {
  red: statusBadgeColors.red.text,
  green: statusBadgeColors.green.text,
  yellow: statusBadgeColors.yellow.text,
  blue: statusBadgeColors.blue.text,
  purple: statusBadgeColors.purple.text,
  pink: statusBadgeColors.pink.text,
  darkblue: statusBadgeColors.darkblue.text,
};

export const statusBadgeBorderColors = {
  red: statusBadgeColors.red.border,
  green: statusBadgeColors.green.border,
  yellow: statusBadgeColors.yellow.border,
  blue: statusBadgeColors.blue.border,
  purple: statusBadgeColors.purple.border,
  pink: statusBadgeColors.pink.border,
  darkblue: statusBadgeColors.darkblue.border,
};

export const statusBadgeAvatarColors = {
  red: statusBadgeColors.red.border,
  green: statusBadgeColors.green.border,
  yellow: statusBadgeColors.yellow.border,
  blue: statusBadgeColors.blue.border,
  purple: statusBadgeColors.purple.border,
  pink: statusBadgeColors.pink.border,
  darkblue: statusBadgeColors.darkblue.border,
};
export default function StatusBadge({ text, color = "red", className = "" }) {
  // Fallback to red if an unknown color is passed
  const selectedColors = statusBadgeColors[color] || statusBadgeColors.red;

  return (
    <div
      className={`px-3 py-1 rounded-full flex items-center justify-center font-medium border ${className}`}
      style={{
        borderColor: selectedColors.border,
        backgroundColor: selectedColors.background,
        color: selectedColors.text,
      }}
    >
      {text}
    </div>
  );
}
