import { useTranslation } from 'react-i18next';
import { MoveRight } from 'lucide-react';
import dashboardBanner from '../../../assets/images/dashboard.png';

const DashboardBanner = ({ onTryItNow }) => {
  const { t } = useTranslation('dashboard');

  return (
    <div 
      className="relative mb-4 sm:mb-6 md:mb-8 h-[200px] rounded-xl overflow-hidden"
      style={{
        backgroundImage: `url(${dashboardBanner})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/30 sm:bg-black/35 md:bg-black/40"></div>
      <div className="relative h-full flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
          {t('banner.title')}
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-white/65  mb-3 sm:mb-4 md:mb-5 lg:mb-6 max-w-full sm:max-w-xl md:max-w-2xl">
          {t('banner.description')}
        </p>
        <button
          onClick={onTryItNow || (() => {})}
          className="w-fit bg-white text-accent rounded-lg px-3 py-1 text-xs sm:text-sm md:text-base font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          {t('banner.tryItNow')}
          <MoveRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};

export default DashboardBanner;

