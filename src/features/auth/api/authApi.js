/**
 * Auth API
 * API calls for authentication
 */

import http from '../../../services/http';
import { ENDPOINTS_FLAT } from '../../../constants/endpoints';

/**
 * Send OTP
 * @param {Object} data - OTP request data
 * @param {string} data.country_code - Country code (e.g., "+91")
 * @param {string} data.phone_number - Phone number
 * @param {string} [data.full_name] - Full name (required for register type)
 * @param {string} [data.referral_code] - Referral code (optional)
 * @param {string} data.type - "register" or "login"
 * @returns {Promise<Object>} API response
 */
export const sendOTP = async (data) => {
  const requestBody = {
    country_code: data.country_code,
    phone_number: data.phone_number,
    type: data.type,
  };

  // Add full_name only for register type
  if (data.type === 'register' && data.full_name) {
    requestBody.full_name = data.full_name;
  }

  // Add referral_code if provided
  if (data.referral_code && data.referral_code.trim()) {
    requestBody.referral_code = data.referral_code.trim();
  }

  const response = await http.post(ENDPOINTS_FLAT.SEND_OTP, requestBody);
  
  // Log OTP to console if present in response
  if (response?.otp) {
    console.log(response.otp);
  } else if (response?.data?.otp) {
    console.log(response.data.otp);
  }
  
  return response;
};

/**
 * Verify OTP
 * @param {Object} data - OTP verification data
 * @param {string} data.country_code - Country code (must match send-otp)
 * @param {string} data.phone_number - Phone number (must match send-otp)
 * @param {string} data.otp - OTP code (6 digits)
 * @param {string} [data.full_name] - Full name (required only for register type)
 * @param {string} [data.referral_code] - Referral code (optional, only for signup)
 * @param {string} data.type - "register" or "login" (must match send-otp)
 * @returns {Promise<Object>} API response with user and token
 */
export const verifyOTP = async (data) => {
  const requestBody = {
    country_code: data.country_code,
    phone_number: data.phone_number,
    otp: data.otp,
    type: data.type,
  };

  // Add full_name only for register type
  if (data.type === 'register' && data.full_name) {
    requestBody.full_name = data.full_name;
  }

  // Add referral_code if provided
  if (data.referral_code && data.referral_code.trim()) {
    requestBody.referral_code = data.referral_code.trim();
  }

  return http.post(ENDPOINTS_FLAT.VERIFY_OTP, requestBody);
};

/**
 * Login user (if needed separately)
 * @param {Object} data - Login data
 * @param {string} data.phone - Phone number
 * @param {string} data.otp - OTP code
 * @returns {Promise<Object>} API response
 */
export const login = async (data) => {
  return http.post(ENDPOINTS_FLAT.LOGIN, data);
};

/**
 * Get user workspaces
 * @returns {Promise<Array>} List of workspaces
 */
export const getWorkspaces = async () => {
  return http.get(ENDPOINTS_FLAT.WORKSPACE_LIST);
};

/**
 * Update user language preference
 * @param {string} language - Language code (e.g., 'en', 'hi', 'gu')
 * @returns {Promise<Object>} API response
 */
export const updateLanguage = async (language) => {
  return http.put(ENDPOINTS_FLAT.LANGUAGE, { language });
};

/**
 * Logout user
 * @returns {Promise<Object>} API response
 */
export const logout = async () => {
  return http.post(ENDPOINTS_FLAT.LOGOUT);
};

