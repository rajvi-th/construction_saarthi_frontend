/**
 * Subscription Page
 * Displays subscription plans and current subscription status
 * Uses feature API + shared UI components
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../../../components/layout/PageHeader';
import Loader from '../../../components/ui/Loader';
import Button from '../../../components/ui/Button';
import { SubscriptionProvider } from '../context/SubscriptionContext';
import { useSubscriptions } from '../hooks';
import {
  CurrentPlan,
  AvailablePlans,
  AddOns,
  OffersRewards,
  SubscriptionBottomBar,
} from '../components';
import { ROUTES_FLAT } from '../../../constants/routes';

function SubscriptionContent() {
  const { t } = useTranslation('subscription');
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoadingSubscriptions } = useSubscriptions();
  const [selectedPlanId, setSelectedPlanId] = useState('yearly');
  const [selectedPlan, setSelectedPlan] = useState(null);
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

  const handlePlanSelect = useCallback((planId, planData) => {
    setSelectedPlanId(planId);
    if (planData) {
      // Convert plan data to format expected by SubscriptionBottomBar
      setSelectedPlan({
        name: planData.name,
        price: planData.price,
        period: planId === 'yearly' ? 'Year' : planId === '3years' ? '3 Years' : 'Month',
        description: planData.description,
      });
    }
  }, []); // Empty dependency array - callback is stable

  const handleCancel = () => {
    // TODO: Handle cancel action
    console.log('Cancel clicked');
  };

  const handleContinue = () => {
    // TODO: Handle continue/payment action
    console.log('Continue clicked');
  };

  // Default plan if none selected
  const displayPlan = selectedPlan || {
    name: t('availablePlans.plans.yearly', { defaultValue: 'Yearly' }),
    price: 3999,
    period: 'Year',
    description: t('availablePlans.plans.description', { defaultValue: 'Contractor + 3 Free Users' }),
  };

  return (

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
              selectedPlan={displayPlan}
              onCancel={handleCancel}
              onContinue={handleContinue}
            />
          </div>
        )}
      </div>
  );
}

export default function Subscription() {
  return (
    <SubscriptionProvider>
      <SubscriptionContent />
    </SubscriptionProvider>
  );
}
