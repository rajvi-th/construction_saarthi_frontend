/**
 * Offers & Rewards Component
 * Displays coupon application section
 */

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, TicketPercent } from 'lucide-react';
import { ROUTES_FLAT } from '../../../constants/routes';

export default function OffersRewards({ appliedCoupon }) {
  const { t } = useTranslation('subscription');
  const navigate = useNavigate();

  const handleApplyCoupon = () => {
    navigate(ROUTES_FLAT.SUBSCRIPTION_COUPON);
  };

  return (
    <section className="mb-6">
      <h2 className="font-medium text-primary mb-2">
        {t('offersRewards.title', { defaultValue: 'Offers & Rewards' })}
      </h2>

      {appliedCoupon ? (
        <div className="w-full bg-white rounded-2xl border border-[#E5E7EB] p-4 md:p-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center text-accent flex-shrink-0">
              <TicketPercent className="w-4 h-4" strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-medium text-primary truncate">
                {appliedCoupon.code}
              </p>
              <p className="text-xs sm:text-sm text-primary-light truncate">
                {appliedCoupon.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleApplyCoupon}
            className="text-xs sm:text-sm font-medium text-accent hover:underline whitespace-nowrap"
          >
            {t('offersRewards.changeCoupon', { defaultValue: 'Change' })}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleApplyCoupon}
          className="w-full bg-white rounded-2xl border border-[#E5E7EB] p-4 md:p-5 flex items-center justify-between gap-3 hover:bg-[#F9FAFB] transition-colors cursor-pointer"
        >
          <span className="text-sm md:text-base text-primary">
            {t('offersRewards.applyCoupon', { defaultValue: 'Apply Coupon' })}
          </span>
          <ChevronRight className="w-5 h-5 text-primary-light flex-shrink-0" />
        </button>
      )}
    </section>
  );
}
