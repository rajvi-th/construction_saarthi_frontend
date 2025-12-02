/**
 * Available Plans Component
 * Displays all available subscription plans with benefits
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';

export default function AvailablePlans({ selectedPlanId, onPlanSelect }) {
  const { t } = useTranslation('subscription');

  const BENEFITS = [
    t('availablePlans.benefits.unlimitedAccess', { defaultValue: 'Unlimited access to all current + future modules' }),
    t('availablePlans.benefits.exportDownload', { defaultValue: 'Export/Download capabilities unlocked' }),
    t('availablePlans.benefits.freeUsers', { defaultValue: '3 Free Additional Users (supervisor/engineer/client)' }),
    t('availablePlans.benefits.calculations', { defaultValue: '50 Construction Calculations per subscription (more purchasable)' }),
  ];

  const PLANS = [
    {
      id: 'monthly',
      name: t('availablePlans.plans.monthly', { defaultValue: 'Monthly' }),
      description: t('availablePlans.plans.description', { defaultValue: 'Contractor + 3 Free Users' }),
      price: 999,
      savings: 450,
      savingsType: 'amount',
      isSelected: true,
    },
    {
      id: '3month',
      name: t('availablePlans.plans.3month', { defaultValue: '3 Month Plan' }),
      description: t('availablePlans.plans.description', { defaultValue: 'Contractor + 3 Free Users' }),
      price: 1499,
      savings: 650,
      savingsType: 'amount',
      isSelected: false,
    },
    {
      id: '6month',
      name: t('availablePlans.plans.6month', { defaultValue: '6 Month Plan' }),
      description: t('availablePlans.plans.description', { defaultValue: 'Contractor + 3 Free Users' }),
      price: 2499,
      savings: 850,
      savingsType: 'amount',
      isSelected: false,
    },
    {
      id: '12month',
      name: t('availablePlans.plans.12month', { defaultValue: '12 Month Plan' }),
      description: t('availablePlans.plans.description', { defaultValue: 'Contractor + 3 Free Users' }),
      price: 3999,
      savings: null,
      savingsType: 'bestValue',
      isSelected: false,
    },
  ];
  const [plans, setPlans] = useState(
    PLANS.map(plan => ({
      ...plan,
      isSelected: plan.id === selectedPlanId || plan.id === 'monthly',
    }))
  );

  const handlePlanSelect = (planId) => {
    const updatedPlans = plans.map(plan => ({
      ...plan,
      isSelected: plan.id === planId,
    }));
    setPlans(updatedPlans);
    if (onPlanSelect) {
      onPlanSelect(planId);
    }
  };

  return (
    <section className="mb-6">
      <h2 className=" font-medium text-primary mb-4">
        {t('availablePlans.title', { defaultValue: 'Available Plans' })}
      </h2>

      {/* Benefits List */}
      <div className="mb-4 space-y-2">
        {BENEFITS.map((benefit, index) => (
          <div key={index} className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#B3330E] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
            <p className="text-sm text-primary">{benefit}</p>
          </div>
        ))}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => handlePlanSelect(plan.id)}
            className={`relative bg-white rounded-2xl border-1 p-4 md:p-5 cursor-pointer transition-all ${
              plan.isSelected
                ? 'border-accent !bg-[#F9F4EE]'
                : 'border-lightGray bg-[#F6F6F6CC]'
            }`}
          >
            {/* Savings Badge */}
            {plan.savings && plan.savingsType === 'amount' && (
              <div className="absolute -top-2 right-3 bg-[#FF9500] text-white text-[10px] md:text-xs font-semibold px-2.5 py-1 rounded-lg shadow-sm z-10">
                {t('availablePlans.saveAmount', { 
                  defaultValue: 'Save ₹{{amount}}',
                  amount: plan.savings 
                })}
              </div>
            )}
            {plan.savingsType === 'bestValue' && (
              <div className="absolute -top-2 right-3 bg-[#34C759] text-white text-[10px] md:text-xs font-semibold px-2.5 py-1 rounded-lg shadow-sm z-10">
                {t('availablePlans.bestValue', { defaultValue: 'Best Value' })}
              </div>
            )}

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    plan.isSelected
                      ? 'border-[#B3330E] bg-[#B3330E]'
                      : 'border-[#9CA3AF] bg-white'
                  }`}>
                    {plan.isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-medium text-primary">
                    {plan.name}
                  </p>
                  <p className="text-xs md:text-sm text-primary-light mt-1">
                    {plan.description}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <p className="text-[20px] font-medium text-accent">
                  ₹{plan.price.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

