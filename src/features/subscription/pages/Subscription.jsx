/**
 * Subscription Page
 * Displays subscription plans and current subscription status
 * Uses feature API + shared UI components
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../../../components/layout/PageHeader';
import Loader from '../../../components/ui/Loader';
import Button from '../../../components/ui/Button';
import { useSubscriptions } from '../hooks';
import {
  CurrentPlan,
  AvailablePlans,
  AddOns,
  OffersRewards,
  SubscriptionBottomBar,
} from '../components';
import { ROUTES_FLAT } from '../../../constants/routes';

export default function Subscription() {
  const { t } = useTranslation('subscription');
  const navigate = useNavigate();
  const location = useLocation();
  const { subscriptions, isLoadingSubscriptions } = useSubscriptions();
  const [selectedPlanId, setSelectedPlanId] = useState('monthly');
  const [appliedCoupon, setAppliedCoupon] = useState(
    location.state?.appliedCoupon || null
  );

  useEffect(() => {
    if (location.state?.appliedCoupon) {
      setAppliedCoupon(location.state.appliedCoupon);
    }
  }, [location.state?.appliedCoupon]);

  const handleViewWallet = () => {
    navigate(ROUTES_FLAT.REFER_EARN_WALLET);
  };

  const handlePlanSelect = (planId) => {
    setSelectedPlanId(planId);
  };

  const handleCancel = () => {
    // TODO: Handle cancel action
    console.log('Cancel clicked');
  };

  const handleContinue = () => {
    // TODO: Handle continue/payment action
    console.log('Continue clicked');
  };

  // Get selected plan details
  const selectedPlan = {
    name: selectedPlanId === 'monthly' ? t('availablePlans.plans.monthly', { defaultValue: 'Monthly' }) : 
          selectedPlanId === '3month' ? t('availablePlans.plans.3month', { defaultValue: '3 Month Plan' }) :
          selectedPlanId === '6month' ? t('availablePlans.plans.6month', { defaultValue: '6 Month Plan' }) : 
          t('availablePlans.plans.12month', { defaultValue: '12 Month Plan' }),
    price: selectedPlanId === 'monthly' ? 999 :
           selectedPlanId === '3month' ? 1499 :
           selectedPlanId === '6month' ? 2499 : 3999,
    period: selectedPlanId === 'monthly' 
      ? t('availablePlans.plans.periodMonth', { defaultValue: 'Month' })
      : t('availablePlans.plans.periodMonths', { defaultValue: 'Months' }),
    description: t('availablePlans.plans.description', { defaultValue: 'Contractor + 3 Free Users' }),
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto px-0 md:px-4">
        <PageHeader 
          title={t('header.title', { defaultValue: 'My Subscription' })}
          showBackButton={false}
        >
          <div className="flex justify-start md:justify-end">
            <Button
              variant="primary"
              size="sm"
              className="whitespace-nowrap rounded-lg px-4 py-2"
              onClick={handleViewWallet}
            >
              {t('header.viewWallet', { defaultValue: 'View My Wallet' })}
            </Button>
          </div>
        </PageHeader>

        {isLoadingSubscriptions ? (
          <div className="flex items-center justify-center py-20">
            <Loader size="lg" />
          </div>
        ) : (
          <div className="space-y-6">
            <CurrentPlan />
            <AvailablePlans 
              selectedPlanId={selectedPlanId}
              onPlanSelect={handlePlanSelect}
            />
            <AddOns />
            <OffersRewards appliedCoupon={appliedCoupon} />
            
            {/* Bottom Bar - Inside Page Content */}
            <SubscriptionBottomBar
              selectedPlan={selectedPlan}
              onCancel={handleCancel}
              onContinue={handleContinue}
            />
          </div>
        )}
      </div>
    </div>
  );
}
