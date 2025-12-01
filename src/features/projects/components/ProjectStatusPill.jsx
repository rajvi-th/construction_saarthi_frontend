const STATUS_PILL_COLORS = {
  completed: {
    text: '#34C759',
    border: '#34C759',
    background: 'rgba(52, 199, 89, 0.12)',
  },
  pending: {
    text: '#FF3B30',
    border: '#FF3B30',
    background: 'rgba(255, 59, 48, 0.12)',
  },
  in_progress: {
    text: '#0A84FF',
    border: '#0A84FF',
    background: 'rgba(10, 132, 255, 0.12)',
  },
  upcoming: {
    text: '#FF9500',
    border: '#FF9500',
    background: 'rgba(255, 149, 0, 0.12)',
  },
};

export default function ProjectStatusPill({ status }) {
  const key = status?.toLowerCase?.() || 'completed';
  const colors = STATUS_PILL_COLORS[key] || STATUS_PILL_COLORS.completed;

  return (
    <span
      className="inline-flex items-center px-2 py-1 rounded-full text-[13px] capitalize border"
      style={{
        color: colors.text,
        borderColor: colors.border,
        backgroundColor: colors.background,
      }}
    >
      {status}
    </span>
  );
}

