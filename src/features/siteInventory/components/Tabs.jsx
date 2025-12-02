/**
 * Tabs Component
 * Reusable tabs component with support for badges and active state
 * Site Inventory specific tabs component
 */

export default function Tabs({
  tabs = [],
  activeTab,
  onTabChange,
  className = '',
}) {
  if (!tabs || tabs.length === 0) return null;

  return (
    <div className={`mb-6 border-b border-black-soft ${className}`}>
      <div className="flex gap-6 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className={`relative pb-3 px-1 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              {tab.label}
              {tab.badge !== undefined && tab.badge !== null && (
                <span className="ml-2 inline-flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                  <span className="text-accent text-base">
                    {tab.badge}
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

