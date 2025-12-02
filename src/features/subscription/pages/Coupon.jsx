/**
 * Coupon Page
 * Displays and manages subscription coupons
 * Uses feature API + shared UI components
 */

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/layout/PageHeader';
import Loader from '../../../components/ui/Loader';
import Button from '../../../components/ui/Button';
import { ROUTES_FLAT } from '../../../constants/routes';
import couponIcon from '../../../assets/icons/Coupon.svg';

const COUPONS = [
  {
    id: 1,
    code: 'SAVE20',
    title: '20% off*',
    description: 'Save ₹200 on this subscription',
    validity: '01–31 Oct 2025',
  },
  {
    id: 2,
    code: 'SAVE30',
    title: '30% off*',
    description: 'Save ₹300 on this subscription',
    validity: '01–31 Oct 2025',
  },
  {
    id: 3,
    code: 'SAVE40',
    title: '40% off*',
    description: 'Save ₹400 on this subscription',
    validity: '01–31 Oct 2025',
  },
  {
    id: 4,
    code: 'WELCOME10',
    title: '10% off*',
    description: 'Welcome offer for new users',
    validity: '01–31 Oct 2025',
  },
];

export default function Coupon() {
  const { t } = useTranslation('subscription');
  const navigate = useNavigate();

  const [searchCode, setSearchCode] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Placeholder for API

  const normalizedSearch = searchCode.trim().toLowerCase();

  const filteredCoupons = useMemo(() => {
    if (!normalizedSearch) return COUPONS;
    return COUPONS.filter((coupon) =>
      coupon.code.toLowerCase().includes(normalizedSearch)
    );
  }, [normalizedSearch]);

  const handleSearchChange = (e) => {
    setSearchCode(e.target.value);
  };

  const applyCouponAndGoBack = (coupon) => {
    if (!coupon) return;

    navigate(ROUTES_FLAT.SUBSCRIPTION, {
      state: {
        appliedCoupon: coupon,
      },
      replace: true,
    });
  };

  const handleTopApply = () => {
    const matching = COUPONS.find(
      (c) => c.code.toLowerCase() === normalizedSearch
    );
    if (matching) {
      applyCouponAndGoBack(matching);
    }
  };

  const handleCouponApply = (coupon) => {
    applyCouponAndGoBack(coupon);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto px-0 md:px-4">
        <PageHeader
          title={t('header.coupon', { defaultValue: 'Apply Coupon' })}
          showBackButton
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size="lg" />
          </div>
        ) : (
          <>
            {/* Search bar with inline Apply text button (like design) */}
            <div className="mb-4 sm:mb-6">
              <div className="w-full rounded-2xl border border-lightGray bg-secondary-light flex items-center justify-between px-4 sm:px-5 py-2.5 sm:py-3">
                <input
                  type="text"
                  value={searchCode}
                  onChange={handleSearchChange}
                  placeholder={t('coupon.searchPlaceholder', {
                    defaultValue: 'Enter Coupon Code',
                  })}
                  className="flex-1 bg-transparent text-sm md:text-base text-primary placeholder:text-secondary focus:outline-none border-none"
                />
                <button
                  type="button"
                  onClick={handleTopApply}
                  disabled={!normalizedSearch}
                  className={`ml-3 text-sm md:text-base font-medium cursor-pointer ${
                    normalizedSearch
                      ? 'text-accent'
                      : 'text-accent/40 cursor-default'
                  }`}
                >
                  {t('coupon.applyButton', { defaultValue: 'Apply' })}
                </button>
              </div>
            </div>

            {/* Available Coupons label */}
            <h2 className="text-sm md:text-base font-medium text-primary mb-3">
              {t('coupon.availableCoupons', { defaultValue: 'Available Coupons' })}
            </h2>

            {/* Coupons list */}
            <div className="space-y-3 sm:space-y-4 pb-4">
              {filteredCoupons.map((coupon) => (
                <article
                  key={coupon.id}
                  className="bg-white rounded-2xl border border-[#E5E7EB] flex overflow-hidden max-h-[170px]"
                >
                  {/* Left coupon strip with image and text overlay (hidden on small screens) */}
                  <div className="hidden sm:block w-[60px] flex-shrink-0 relative overflow-hidden">
                    <img
                      src={couponIcon}
                      alt={t('coupon.couponCodeLabel', { defaultValue: 'Coupon Code' })}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className="!text-[14px] sm:text-xs font-semibold uppercase tracking-[0.13em] text-white whitespace-pre leading-tight rotate-180"
                        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                      >
                        {t('coupon.couponCodeLabel', {
                          defaultValue: 'COUPON CODE',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Middle content */}
                  <div className="flex-1 px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 flex flex-col gap-1 sm:gap-1.5">
                    <p className="text-xs sm:text-sm font-medium text-primary-light">
                      {coupon.title}
                    </p>
                    <p className="text-base sm:text-lg font-semibold text-primary">
                      {coupon.code}
                    </p>
                    <p className="text-xs sm:text-sm text-[#2563EB] cursor-pointer">
                      {coupon.description}
                    </p>
                    <p className="text-[11px] sm:text-xs text-primary-light">
                      {t('coupon.validityLabel', { defaultValue: 'Validity:' })}{' '}
                      {coupon.validity}
                    </p>
                  </div>

                  {/* Right Apply button */}
                  <div className="pr-3 pt-3 flex items-start justify-end">
                    <Button
                      variant="primary"
                      size="md"
                      className="whitespace-nowrap rounded-xl px-3 py-1.5 text-xs sm:px-3 sm:py-1.5 sm:text-xs md:px-5 md:py-2 md:text-sm"
                      onClick={() => handleCouponApply(coupon)}
                    >
                      {t('coupon.applyButton', { defaultValue: 'Apply' })}
                    </Button>
                  </div>
                </article>
              ))}

              {!filteredCoupons.length && (
                <p className="text-secondary text-sm mt-2">
                  {t('emptyState.noCoupons', { defaultValue: 'No coupons available.' })}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
