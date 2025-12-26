/**
 * Subscription API
 * API calls for subscription features
 */

import http from '../../../services/http';
import { SUBSCRIPTION_ENDPOINTS_FLAT } from '../constants/subscriptionEndpoints';

/**
 * Get available plans (benefits list)
 * @returns {Promise<Array>} List of available plan benefits
 */
export const getAvailablePlans = async () => {
  try {
    const response = await http.get(SUBSCRIPTION_ENDPOINTS_FLAT.AVAILABLE_PLANS);
    
    // Handle different response structures
    if (Array.isArray(response)) {
      return response;
    }
    
    // Check for features property (API returns { features: [...] })
    if (response?.features && Array.isArray(response.features)) {
      return response.features;
    }
    
    // Fallback to other possible structures
    return response?.data || response?.plans || [];
  } catch (error) {
    console.error('Get available plans error:', error);
    throw error;
  }
};

/**
 * Get subscription plans
 * @returns {Promise<Array>} List of subscription plans
 */
export const getSubscriptionPlans = async () => {
  try {
    const response = await http.get(SUBSCRIPTION_ENDPOINTS_FLAT.GET_SUBSCRIPTION_PLANS);
    
    // Handle different response structures
    if (Array.isArray(response)) {
      return response;
    }
    
    return response?.data || response?.plans || [];
  } catch (error) {
    console.error('Get subscription plans error:', error);
    throw error;
  }
};

