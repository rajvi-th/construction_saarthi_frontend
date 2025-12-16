/**
 * Tabs Component for Project Gallery
 * Reusable tabs component with support for active state
 */

export default function Tabs({
  tabs = [],
  activeTab,
  onTabChange,
  className = '',
}) {
  if (!tabs || tabs.length === 0) return null;

  return (
    <div className={`mb-6 border-b border-gray-200 ${className}`}>
      <div className="flex gap-6 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onTabChange?.(tab.id);
              }}
              className={`relative pb-3 px-1 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

