// /**
//  * Subscription API
//  * API calls for subscription features
//  */

// import http from '../../../services/http';
// import { SUBSCRIPTION_ENDPOINTS_FLAT } from '../constants/subscriptionEndpoints';

// /**
//  * Get all subscriptions
//  * @returns {Promise<Array>} List of subscriptions
//  */
// export const getSubscriptions = async () => {
//   return http.get(SUBSCRIPTION_ENDPOINTS_FLAT.LIST);
// };

// /**
//  * Get subscription details by ID
//  * @param {string|number} subscriptionId - Subscription ID
//  * @returns {Promise<Object>} Subscription details
//  */
// export const getSubscriptionDetails = async (subscriptionId) => {
//   if (!subscriptionId) {
//     throw new Error('Subscription ID is required');
//   }
  
//   return http.get(SUBSCRIPTION_ENDPOINTS_FLAT.DETAILS.replace(':id', subscriptionId));
// };

// /**
//  * Create a new subscription
//  * @param {Object} subscriptionData - Subscription data
//  * @returns {Promise<Object>} Created subscription
//  */
// export const createSubscription = async (subscriptionData) => {
//   return http.post(SUBSCRIPTION_ENDPOINTS_FLAT.CREATE, subscriptionData);
// };

// /**
//  * Update subscription
//  * @param {string|number} subscriptionId - Subscription ID
//  * @param {Object} subscriptionData - Updated subscription data
//  * @returns {Promise<Object>} Updated subscription
//  */
// export const updateSubscription = async (subscriptionId, subscriptionData) => {
//   if (!subscriptionId) {
//     throw new Error('Subscription ID is required');
//   }
  
//   return http.put(SUBSCRIPTION_ENDPOINTS_FLAT.UPDATE.replace(':id', subscriptionId), subscriptionData);
// };

// /**
//  * Cancel subscription
//  * @param {string|number} subscriptionId - Subscription ID
//  * @returns {Promise<Object>} Cancelled subscription
//  */
// export const cancelSubscription = async (subscriptionId) => {
//   if (!subscriptionId) {
//     throw new Error('Subscription ID is required');
//   }
  
//   return http.post(SUBSCRIPTION_ENDPOINTS_FLAT.CANCEL.replace(':id', subscriptionId));
// };

