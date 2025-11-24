/**
 * StatusBadge Component
 * Displays status badge with colored background and border
 */

export default function StatusBadge({ text, color = 'red' }) {
    const colors = {
        red: 'border-1 border-[rgba(255,59,48,0.4)] bg-[rgba(255,59,48,0.08)] text-[#FF3B30]',
        green: 'border-1 border-[rgba(52,199,89,0.4)] bg-[rgba(52,199,89,0.08)] text-[#34C759]',
        yellow: 'border-1 border-[rgba(255,149,0,0.4)] bg-[rgba(255,149,0,0.08)] text-[#FF9500]',
        blue: 'border-1 border-[rgba(0,122,255,0.4)] bg-[rgba(0,122,255,0.078)] text-[#007AFF]',
        purple: 'border-1 border-[rgba(175,82,222,0.4)] bg-[rgba(175,82,222,0.078)] text-[#AF52DE]',
        pink: 'border-1 border-[rgba(255,45,85,0.4)] bg-[rgba(255,45,85,0.006)] text-[#FF2D55]',
        darkblue: 'border-1 border-[rgba(33,0,93,0.4)] bg-[rgba(33,0,93,0.06)] text-[#21005D]',
    };

    return (
        <div
            className={`px-3 py-2 rounded-lg flex items-center justify-center font-semibold ${colors[color] || colors.red}`}
        >
            {text}
        </div>
    );
}
