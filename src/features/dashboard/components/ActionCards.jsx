import { ChevronRight } from 'lucide-react';
import PropTypes from 'prop-types';

const ActionCards = ({ actionCards }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {actionCards.map((action, index) => {
        const IconComponent = action.icon;
        const isSvg = action.isSvg || false;
        
        return (
          <button
            key={index}
            onClick={action.onClick}
            className="bg-[#F9F5EF] rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 transition-all text-left flex items-center justify-between group border border-[rgba(6,12,18,0.06)] cursor-pointer"
          >
            <div className="flex items-center gap-4 sm:gap-6 flex-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-white border border-[rgba(231,215,193,0.6)] flex items-center justify-center flex-shrink-0">
                {isSvg ? (
                  <img 
                    src={IconComponent} 
                    alt={action.title || 'icon'} 
                    className="w-6 h-6 sm:w-8 sm:h-8"
                  />
                ) : (
                  <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-white bg-accent rounded-full " strokeWidth={2} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                {action.badge && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-accent mb-1 sm:mb-2 px-2 py-1 rounded-full"
                  style={{ background: 'linear-gradient(92.59deg, #FFFFFF 0%, #FFE2DA 100%)' }}>
                    {action.badgeIcon && (
                      <img 
                        src={action.badgeIcon} 
                        alt="AI" 
                        className="w-3 h-3 sm:w-4 sm:h-4"
                      />
                    )}
                    {action.badge}
                  </span>
                )}
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-primary">
                  {action.title}
                </h3>
                <p className="text-xs sm:text-sm text-secondary">
                  {action.description}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-secondary group-hover:text-accent transition-colors flex-shrink-0 ml-2 sm:ml-4" />
          </button>
        );
      })}
    </div>
  );
};

ActionCards.propTypes = {
  actionCards: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.oneOfType([PropTypes.elementType, PropTypes.string]).isRequired,
      isSvg: PropTypes.bool,
      badge: PropTypes.string,
      badgeIcon: PropTypes.string,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      onClick: PropTypes.func,
    })
  ).isRequired,
};

export default ActionCards;

