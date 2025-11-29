/**
 * Business Card API
 * API calls for business card management
 */

import http from '../../../services/http';
import { BUSINESS_CARD_ENDPOINTS_FLAT } from '../constants/businessCardEndpoints';

/**
 * Create business card
 * @param {Object} data - Business card data
 * @param {string} data.firstName - First name
 * @param {string} data.lastName - Last name
 * @param {string} data.email - Email address
 * @param {string} data.countryCode - Country code (e.g., +91)
 * @param {string} data.phoneNumber - Phone number
 * @param {string} data.companyName - Company name
 * @param {string} data.address - Address
 * @param {string} data.companyTagline - Company tagline
 * @param {File} [data.logo] - Company logo file
 * @returns {Promise<Object>} API response
 */
export const createBusinessCard = async (data) => {
  const formData = new FormData();

  // Append text fields
  if (data.firstName) formData.append('firstName', data.firstName);
  if (data.lastName) formData.append('lastName', data.lastName);
  if (data.email) formData.append('email', data.email);
  if (data.countryCode) formData.append('countyCode', data.countryCode); // Note: API uses "countyCode" (typo)
  if (data.phoneNumber) formData.append('phoneNumber', data.phoneNumber);
  if (data.companyName) formData.append('companyName', data.companyName);
  if (data.address) formData.append('address', data.address);
  if (data.companyTagline) formData.append('companyTagline', data.companyTagline);

  // Append logo file if exists
  if (data.logo instanceof File) {
    formData.append('logo', data.logo);
  }

  return http.post(
    BUSINESS_CARD_ENDPOINTS_FLAT.BUSINESS_CARD_CREATE,
    formData
  );
};

/**
 * Get business card details
 * @param {string} id - Business card ID
 * @returns {Promise<Object>} Business card data
 */
export const getBusinessCard = async (id) => {
  return http.get(`${BUSINESS_CARD_ENDPOINTS_FLAT.BUSINESS_CARD_GET}/${id}`);
};

/**
 * Update business card
 * @param {string} id - Business card ID
 * @param {Object} data - Business card data (same structure as create)
 * @returns {Promise<Object>} API response
 */
export const updateBusinessCard = async (id, data) => {
  const formData = new FormData();

  // Append text fields
  if (data.firstName) formData.append('firstName', data.firstName);
  if (data.lastName) formData.append('lastName', data.lastName);
  if (data.email) formData.append('email', data.email);
  if (data.countryCode) formData.append('countyCode', data.countryCode);
  if (data.phoneNumber) formData.append('phoneNumber', data.phoneNumber);
  if (data.companyName) formData.append('companyName', data.companyName);
  if (data.address) formData.append('address', data.address);
  if (data.companyTagline) formData.append('companyTagline', data.companyTagline);

  // Append logo file if exists
  if (data.logo instanceof File) {
    formData.append('logo', data.logo);
  }

  return http.put(
    `${BUSINESS_CARD_ENDPOINTS_FLAT.BUSINESS_CARD_UPDATE}/${id}`,
    formData
  );
};

/**
 * Delete business card
 * @param {string} id - Business card ID
 * @returns {Promise<Object>} API response
 */
export const deleteBusinessCard = async (id) => {
  return http.delete(`${BUSINESS_CARD_ENDPOINTS_FLAT.BUSINESS_CARD_DELETE}/${id}`);
};

/**
 * Get list of business cards
 * @returns {Promise<Object>} List of business cards
 */
export const getBusinessCards = async () => {
  return http.get(BUSINESS_CARD_ENDPOINTS_FLAT.BUSINESS_CARD_LIST);
};

