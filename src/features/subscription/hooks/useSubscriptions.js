import { useSubscriptionContext } from '../context/SubscriptionContext';

/**
 * Hook to access subscription data from context
 * This ensures API calls are made only once and shared across components
 */
export const useSubscriptions = () => {
  return useSubscriptionContext();
};

export default useSubscriptions;

