/**
 * Subscription API Endpoints
 * Centralized endpoint configuration for subscription feature
 */

export const SUBSCRIPTION_ENDPOINTS = {
  BASE: '/api/subscription',
  LIST: '/api/subscription/list',
  DETAILS: '/api/subscription/:id',
  CREATE: '/api/subscription/create',
  UPDATE: '/api/subscription/:id/update',
  CANCEL: '/api/subscription/:id/cancel',
  AVAILABLE_PLANS: '/available-plans',
  GET_SUBSCRIPTION_PLANS: '/subscription/getAllPlansWithPurchase',
};

// Flattened endpoints for easier access
export const SUBSCRIPTION_ENDPOINTS_FLAT = {
  BASE: SUBSCRIPTION_ENDPOINTS.BASE,
  LIST: SUBSCRIPTION_ENDPOINTS.LIST,
  DETAILS: SUBSCRIPTION_ENDPOINTS.DETAILS,
  CREATE: SUBSCRIPTION_ENDPOINTS.CREATE,
  UPDATE: SUBSCRIPTION_ENDPOINTS.UPDATE,
  CANCEL: SUBSCRIPTION_ENDPOINTS.CANCEL,
  AVAILABLE_PLANS: SUBSCRIPTION_ENDPOINTS.AVAILABLE_PLANS,
  GET_SUBSCRIPTION_PLANS: SUBSCRIPTION_ENDPOINTS.GET_SUBSCRIPTION_PLANS,
};

export default SUBSCRIPTION_ENDPOINTS_FLAT;

