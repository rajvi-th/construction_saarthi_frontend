import { useState, useEffect, useCallback } from 'react';
// import { getSubscriptions } from '../api';
import { showError } from '../../../utils/toast';

/**
 * Custom hook for fetching and managing subscriptions
 * @returns {Object} { subscriptions, isLoadingSubscriptions, error, refetch }
 */
export const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setIsLoadingSubscriptions(true);
      setError(null);
      const response = await getSubscriptions();

      // Handle different response structures
      const subscriptionsData = response?.data || response?.subscriptions || response || [];
      const subscriptionsList = Array.isArray(subscriptionsData) ? subscriptionsData : [];

      setSubscriptions(subscriptionsList);
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      const errorMessage = err?.response?.data?.message ||
        err?.message ||
        'Failed to load subscriptions';
      setError(errorMessage);
      showError(errorMessage);
      setSubscriptions([]);
    } finally {
      setIsLoadingSubscriptions(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  return {
    subscriptions,
    isLoadingSubscriptions,
    error,
    refetch: fetchSubscriptions,
  };
};

export default useSubscriptions;

