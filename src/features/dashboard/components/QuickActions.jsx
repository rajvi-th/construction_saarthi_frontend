import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const QuickActions = ({ quickActions }) => {
  const { t } = useTranslation('dashboard');

  return (
    <div>
      <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-primary mb-4 sm:mb-6">
        {t('quickActions.title')}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
        {quickActions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <button
              key={index}
              onClick={action.onClick}
              className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 transition-all flex flex-col items-center justify-center aspect-square relative cursor-pointer"
            >
              {action.badgeIcon && (
                <div 
                  className="absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(92.59deg, #FFF8F6 0%, #FFE2DA 100%)',
                    border: '2px solid #FBFBFB',
                  }}
                >
                  <img 
                    src={action.badgeIcon} 
                    alt="AI" 
                    className="w-6 h-6"
                  />
                </div>
              )}
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[rgba(71,85,105,0.04)] flex items-center justify-center mb-3 sm:mb-4 border border-black-soft">
                <IconComponent className="w-5 h-5 sm:w-7 sm:h-7 text-accent" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-primary text-center">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

QuickActions.propTypes = {
  quickActions: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.elementType.isRequired,
      label: PropTypes.string.isRequired,
      badgeIcon: PropTypes.string,
      onClick: PropTypes.func,
    })
  ).isRequired,
};

export default QuickActions;

