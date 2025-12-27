import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAvailablePlans, getSubscriptionPlans } from '../api/subscriptionApi';

const SubscriptionContext = createContext(null);

export const useSubscriptionContext = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscriptionContext must be used within SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(true);
  const [error, setError] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [isLoadingAvailablePlans, setIsLoadingAvailablePlans] = useState(true);

  // Fetch subscription plans (used by AvailablePlans and AddOns)
  const fetchSubscriptionPlans = useCallback(async () => {
    try {
      setIsLoadingSubscriptions(true);
      const response = await getSubscriptionPlans();
      
      // Ensure response is an array
      const plansData = Array.isArray(response) ? response : [];
      
      // Filter active and non-deleted plans
      const activePlans = plansData.filter(plan => {
        if (!plan) return false;
        if (plan.is_active === false) return false;
        if (plan.is_deleted === true) return false;
        return true;
      });
      
      setSubscriptions(activePlans);
      setError(null);
      return activePlans;
    } catch (err) {
      console.error('Error fetching subscription plans:', err);
      setError(err);
      setSubscriptions([]);
      return [];
    } finally {
      setIsLoadingSubscriptions(false);
    }
  }, []);

  // Fetch available plans/benefits (used by AvailablePlans)
  const fetchAvailablePlans = useCallback(async () => {
    try {
      setIsLoadingAvailablePlans(true);
      const response = await getAvailablePlans();
      
      // Ensure response is an array
      const benefitsData = Array.isArray(response) ? response : [];
      
      // Filter active and non-deleted benefits
      const activeBenefits = benefitsData.filter(item => {
        if (!item || !item.description) return false;
        if (item.is_active === false) return false;
        if (item.is_deleted === true) return false;
        return true;
      });
      
      setAvailablePlans(activeBenefits);
      setError(null);
      return activeBenefits;
    } catch (err) {
      console.error('Error fetching available plans:', err);
      setError(err);
      setAvailablePlans([]);
      return [];
    } finally {
      setIsLoadingAvailablePlans(false);
    }
  }, []);

  // Fetch both on mount - only once
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      await Promise.all([
        fetchSubscriptionPlans(),
        fetchAvailablePlans()
      ]);
    };
    
    if (isMounted) {
      fetchData();
    }
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only fetch once on mount

  const refetch = useCallback(async () => {
    await Promise.all([
      fetchSubscriptionPlans(),
      fetchAvailablePlans()
    ]);
  }, [fetchSubscriptionPlans, fetchAvailablePlans]);

  const value = {
    subscriptions,
    availablePlans,
    isLoadingSubscriptions,
    isLoadingAvailablePlans,
    error,
    refetch,
    fetchSubscriptionPlans,
    fetchAvailablePlans,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

