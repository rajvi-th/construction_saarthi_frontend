/**
 * Available Plans Component
 * Displays all available subscription plans with benefits
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { getAvailablePlans, getSubscriptionPlans } from '../api/subscriptionApi';
import { showError } from '../../../utils/toast';

export default function AvailablePlans({ selectedPlanId, onPlanSelect }) {
  const { t } = useTranslation('subscription');
  const [benefits, setBenefits] = useState([]);
  const [isLoadingBenefits, setIsLoadingBenefits] = useState(true);
  const [plans, setPlans] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  useEffect(() => {
    const fetchBenefits = async () => {
      try {
        setIsLoadingBenefits(true);
        const response = await getAvailablePlans();
        
        // Ensure response is an array
        const benefitsData = Array.isArray(response) ? response : [];
        
        // Filter active and non-deleted benefits, map to description
        const activeBenefits = benefitsData
          .filter(item => {
            if (!item || !item.description) return false;
            // Include if is_active is true or undefined/null (default to true)
            if (item.is_active === false) return false;
            // Exclude if is_deleted is true
            if (item.is_deleted === true) return false;
            return true;
          })
          .map(item => item.description)
          .filter(Boolean); // Remove any empty descriptions
        
        setBenefits(activeBenefits);
      } catch (error) {
        console.error('Error fetching available plans:', error);
        const errorMessage = error?.response?.data?.message || 
                           error?.message || 
                           'Failed to load benefits';
        showError(errorMessage);
        // Fallback to default benefits on error
        setBenefits([
          t('availablePlans.benefits.unlimitedAccess', { defaultValue: 'Unlimited access to all current + future modules' }),
          t('availablePlans.benefits.exportDownload', { defaultValue: 'Export/Download capabilities unlocked' }),
          t('availablePlans.benefits.freeUsers', { defaultValue: '3 Free Additional Users (supervisor/engineer/client)' }),
          t('availablePlans.benefits.calculations', { defaultValue: '50 Construction Calculations per subscription (more purchasable)' }),
        ]);
      } finally {
        setIsLoadingBenefits(false);
      }
    };

    fetchBenefits();
  }, [t]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsLoadingPlans(true);
        const response = await getSubscriptionPlans();
        
        // Ensure response is an array
        const plansData = Array.isArray(response) ? response : [];
        
        // Filter active and non-deleted plans
        const activePlans = plansData
          .filter(plan => {
            if (!plan) return false;
            // Include if is_active is true or undefined/null (default to true)
            if (plan.is_active === false) return false;
            // Exclude if is_deleted is true
            if (plan.is_deleted === true) return false;
            return true;
          })
          .map((plan, index) => {
            const planName = (plan.name || '').toLowerCase();
            
            // Determine display name and id based on plan name
            let displayName, planId;
            if (planName.includes('12 month') || planName.includes('12month') || planName.includes('yearly')) {
              displayName = t('availablePlans.plans.yearly', { defaultValue: 'Yearly' });
              planId = 'yearly';
            } else if (planName.includes('3 year') || planName.includes('3year') || 
                       planName.includes('36 month') || planName.includes('36month')) {
              displayName = t('availablePlans.plans.3years', { defaultValue: '3 Years' });
              planId = '3years';
            } else {
              // Use original name if no match
              displayName = plan.name || '';
              planId = plan.id || `plan-${index}`;
            }
            
            // Build description from plan data
            const freeUsersCount = (plan.free_main_user_count || 0) + (plan.free_sub_user_count || 0);
            const description = freeUsersCount > 0 
              ? t('availablePlans.plans.description', { defaultValue: `Contractor + ${freeUsersCount} Free Users` })
              : t('availablePlans.plans.description', { defaultValue: 'Contractor + 3 Free Users' });
            
            return {
              id: planId,
              apiId: plan.id,
              name: displayName,
              description: description,
              price: parseFloat(plan.price) || 0,
              isSelected: (planId === selectedPlanId) || (index === 0 && !selectedPlanId),
              originalData: plan,
            };
          });
        
        // Sort: Yearly first, then 3 Years, then others
        activePlans.sort((a, b) => {
          if (a.id === 'yearly') return -1;
          if (b.id === 'yearly') return 1;
          if (a.id === '3years') return -1;
          if (b.id === '3years') return 1;
          // Sort by original index/price if neither is yearly or 3years
          return parseFloat(a.originalData?.price || 0) - parseFloat(b.originalData?.price || 0);
        });
        
        setPlans(activePlans);
      } catch (error) {
        console.error('Error fetching subscription plans:', error);
        const errorMessage = error?.response?.data?.message || 
                           error?.message || 
                           'Failed to load subscription plans';
        showError(errorMessage);
        // Fallback to empty array on error
        setPlans([]);
      } finally {
        setIsLoadingPlans(false);
      }
    };

    fetchPlans();
  }, [t]);

  // Notify parent of selected plan when plans are loaded or selectedPlanId changes
  useEffect(() => {
    if (plans.length > 0 && onPlanSelect) {
      const selectedPlan = plans.find(
        plan => plan.id === selectedPlanId || (!selectedPlanId && plan.id === 'yearly')
      ) || plans[0];
      
      if (selectedPlan) {
        onPlanSelect(selectedPlan.id, selectedPlan);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plans, selectedPlanId]);

  // Update selected plan when selectedPlanId prop changes
  useEffect(() => {
    if (plans.length > 0) {
      setPlans(prevPlans => {
        const hasChanges = prevPlans.some(plan => {
          const shouldBeSelected = plan.id === selectedPlanId || (!selectedPlanId && plan.id === 'yearly');
          return plan.isSelected !== shouldBeSelected;
        });
        
        if (!hasChanges) return prevPlans;
        
        return prevPlans.map(plan => ({
          ...plan,
          isSelected: plan.id === selectedPlanId || (!selectedPlanId && plan.id === 'yearly'),
        }));
      });
    }
  }, [selectedPlanId, plans.length]);

  const handlePlanSelect = (planId) => {
    const updatedPlans = plans.map(plan => ({
      ...plan,
      isSelected: plan.id === planId,
    }));
    setPlans(updatedPlans);
    if (onPlanSelect) {
      // Find the selected plan and pass full plan data
      const selectedPlan = updatedPlans.find(plan => plan.id === planId);
      onPlanSelect(planId, selectedPlan);
    }
  };

  return (
    <section className="mb-6">
      <h2 className=" font-medium text-primary mb-4">
        {t('availablePlans.title', { defaultValue: 'Available Plans' })}
      </h2>

      {/* Benefits List */}
      <div className="mb-4 space-y-2">
        {isLoadingBenefits ? (
          <div className="flex items-center justify-center py-4">
            <p className="text-sm text-primary-light">{t('common.loading', { defaultValue: 'Loading benefits...' })}</p>
          </div>
        ) : benefits.length > 0 ? (
          benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-2">
              <Check className="w-5 h-5 text-[#B3330E] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
              <p className="text-sm text-primary">{benefit}</p>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center py-4">
            <p className="text-sm text-primary-light">{t('availablePlans.noBenefits', { defaultValue: 'No benefits available' })}</p>
          </div>
        )}
      </div>

      {/* Plans Grid */}
      {isLoadingPlans ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-primary-light">{t('common.loading', { defaultValue: 'Loading plans...' })}</p>
        </div>
      ) : plans.length > 0 ? (
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
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
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
      ) : (
        <div className="flex items-center justify-center py-8">
          <p className="text-primary-light">{t('availablePlans.noPlans', { defaultValue: 'No plans available' })}</p>
        </div>
      )}
    </section>
  );
}

