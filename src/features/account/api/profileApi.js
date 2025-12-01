/**
 * Profile API
 * API calls for user profile management
 */

import http from '../../../services/http';
import { ACCOUNT_ENDPOINTS_FLAT } from '../constants/accountEndpoints';

/**
 * Get user profile
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfile = async () => {
  return http.get(ACCOUNT_ENDPOINTS_FLAT.USER_PROFILE);
};

/**
 * Update user profile
 * @param {Object} data - Profile data
 * @param {string} data.full_name - Full name
 * @param {string} data.language - Language code
 * @param {string} data.company_Name - Company name
 * @param {string} data.address - Address
 * @param {string} data.company_tagline - Company tagline
 * @param {string} data.gstin - GSTIN number
 * @param {File} [data.profile] - Profile picture file
 * @param {File} [data.company_logo] - Company logo file
 * @param {File|File[]} [data.pan_card] - PAN card file(s) - can be single file or array of files
 * @returns {Promise<Object>} API response
 */
export const updateUserProfile = async (data) => {
  const formData = new FormData();

  // Append only if value exists
  if (data.full_name) formData.append("full_name", data.full_name);
  if (data.language) formData.append("language", data.language);
  if (data.company_Name) formData.append("company_Name", data.company_Name);
  if (data.address) formData.append("address", data.address);
  if (data.company_tagline) formData.append("company_tagline", data.company_tagline);
  if (data.gstin) formData.append("gstin", data.gstin);

  // Files (single only - same as Postman)
  if (data.profile instanceof File) {
    formData.append("profile", data.profile);
  }

  if (data.company_logo instanceof File) {
    formData.append("company_logo", data.company_logo);
  }

  if (data.pan_card instanceof File) {
    formData.append("pan_card", data.pan_card);
  }
  
  // Send request
  return http.put(
    ACCOUNT_ENDPOINTS_FLAT.USER_PROFILE,
    formData
  );
};


