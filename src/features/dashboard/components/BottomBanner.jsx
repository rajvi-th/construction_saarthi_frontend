import { useTranslation } from 'react-i18next';
import { MoveRight } from 'lucide-react';

import dashFinance from '../../../assets/images/dashFinance.svg';
import dashFinanceOverlay from '../../../assets/images/dashFinanceOverlay.svg';

const BottomBanner = ({ onManageFinance }) => {
  const { t } = useTranslation('dashboard');

  return (
    <div
      className="relative mt-6 sm:mt-8 md:mt-10 h-[160px] sm:h-[180px] md:h-[200px] rounded-xl overflow-hidden"
      style={{
        backgroundImage: `url(${dashFinance})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30 sm:bg-black/35 md:bg-black/40" />

      {/* SVG Overlay */}
      <img
        src={dashFinanceOverlay}
        alt="Finance overlay"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-10">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
          Stay on Top of Your Site Budget
        </h2>

        <p className="text-xs md:text-sm text-white/70 mb-3 sm:mb-4 max-w-xl">
          Track expenses, manage payments & control material costs in one place.
        </p>

        <button
          onClick={onManageFinance || (() => {})}
          className="w-fit bg-white text-[#C25E09] rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base font-semibold flex items-center gap-2 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          Manage Finance
          <MoveRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};

export default BottomBanner;
