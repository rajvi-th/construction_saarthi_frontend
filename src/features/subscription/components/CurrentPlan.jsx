/**
 * Current Plan Component
 * Displays the user's current subscription plan
 */

import { useTranslation } from 'react-i18next';

export default function CurrentPlan({ currentPlan = null }) {
  const { t } = useTranslation('subscription');

  // Default to Trial if no plan
  const plan = currentPlan || {
    name: 'Trial',
    daysLeft: 6,
    price: 0.00,
    isActive: true,
  };

  return (
    <section className="mb-6">
      <h2 className="text-base md:text-lg font-semibold text-primary mb-3">
        {t('currentPlan.title', { defaultValue: 'Your Current Plan' })}
      </h2>
      <div className="bg-secondary-light rounded-2xl border border-lightGray px-4 py-4.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              plan.isActive 
                ? 'border-[#B3330E] bg-[#B3330E]' 
                : 'border-[#9CA3AF] bg-white'
            }`}>
              {plan.isActive && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[20px] font-semibold text-primary">
              {plan.name}
            </p>
            {plan.daysLeft !== undefined && plan.daysLeft > 0 && (
              <p className=" text-primary-light mt-0.5">
                {t('currentPlan.daysLeft', { 
                  defaultValue: '{{days}} Days left in Free Trial',
                  days: plan.daysLeft 
                })}
              </p>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          <p className="text-base md:text-lg font-medium text-accent">
            ₹{plan.price.toFixed(2)}
          </p>
        </div>
      </div>
    </section>
  );
}

