// Static version - no API integration
export const useSubscriptions = () => {
  return {
    subscriptions: [],
    isLoadingSubscriptions: false,
    error: null,
    refetch: () => Promise.resolve(),
  };
};

export default useSubscriptions;

