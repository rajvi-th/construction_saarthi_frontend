import PropTypes from 'prop-types';
import { statusBadgeBgColors } from '../../../components/ui/StatusBadge';

const StatisticsCards = ({ statistics }) => {
  const getIconColor = (color) => {
    const textColors = {
      blue: 'text-blue-500',
      yellow: 'text-yellow-500',
      orange: 'text-orange-500',
      purple: 'text-purple-500',
    };
    return textColors[color] || 'text-gray-500';
  };

  const getIconBgColor = (color) => {
    const bgColors = {
      blue: statusBadgeBgColors.blue,
      yellow: statusBadgeBgColors.yellow,
      orange: statusBadgeBgColors.yellow, // Yellow in StatusBadge is actually orange-tinted
      purple: statusBadgeBgColors.purple,
    };
    return bgColors[color] || statusBadgeBgColors.yellow;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8 cursor-pointer">
      {statistics.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 transition-shadow"
          >
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className={`p-2 sm:p-3 rounded-full ${getIconBgColor(stat.color)} ${getIconColor(stat.color)}`}>
                <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">
              {stat.value}
            </div>
            <div className="text-xs sm:text-sm text-secondary">
              {stat.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

StatisticsCards.propTypes = {
  statistics: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.elementType.isRequired,
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default StatisticsCards;

