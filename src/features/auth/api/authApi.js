/**
 * Auth API
 * API calls for authentication
 */

import http from '../../../services/http';
// Use feature-specific constants (backward compatible with global endpoints.js)
import { AUTH_ENDPOINTS_FLAT } from '../constants/authEndpoints';

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

  const response = await http.post(AUTH_ENDPOINTS_FLAT.SEND_OTP, requestBody);
  
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

  return http.post(AUTH_ENDPOINTS_FLAT.VERIFY_OTP, requestBody);
};

/**
 * Login user (if needed separately)
 * @param {Object} data - Login data
 * @param {string} data.phone - Phone number
 * @param {string} data.otp - OTP code
 * @returns {Promise<Object>} API response
 */
export const login = async (data) => {
  return http.post(AUTH_ENDPOINTS_FLAT.LOGIN, data);
};

/**
 * Get user workspaces
 * @returns {Promise<Array>} List of workspaces
 */
export const getWorkspaces = async () => {
  return http.get(AUTH_ENDPOINTS_FLAT.WORKSPACE_LIST);
};

/**
 * Create workspace
 * @param {Object} data - Workspace creation data
 * @param {string} data.name - Workspace name
 * @param {string} [data.role] - User role (default: "owner")
 * @returns {Promise<Object>} API response with workspace details
 */
export const createWorkspace = async (data) => {
  const requestBody = {
    name: data.name.trim(),
    role: data.role || 'owner', // Default role is "owner"
  };

  return http.post(AUTH_ENDPOINTS_FLAT.WORKSPACE_CREATE, requestBody);
};

/**
 * Get workspace members
 * @param {string|number} workspaceId - Workspace ID
 * @returns {Promise<Array>} List of workspace members
 */
export const getWorkspaceMembers = async (workspaceId) => {
  return http.get(`${AUTH_ENDPOINTS_FLAT.WORKSPACE_MEMBERS}/${workspaceId}`);
};

/**
 * Update user language preference
 * @param {string} language - Language code (e.g., 'en', 'hi', 'gu')
 * @returns {Promise<Object>} API response
 */
export const updateLanguage = async (language) => {
  return http.put(AUTH_ENDPOINTS_FLAT.LANGUAGE, { language });
};

/**
 * Logout user
 * @returns {Promise<Object>} API response
 */
export const logout = async () => {
  return http.post(AUTH_ENDPOINTS_FLAT.LOGOUT);
};

/**
 * Get all roles
 * @returns {Promise<Array>} List of roles
 */
export const getAllRoles = async () => {
  return http.get(AUTH_ENDPOINTS_FLAT.ADMIN_GET_ALL_ROLE);
};

/**
 * Get workspace roles
 * Uses /workspace/role endpoint
 * @returns {Promise<Array>} List of roles for current workspace/user
 */
export const getWorkspaceRoles = async () => {
  return http.get(AUTH_ENDPOINTS_FLAT.WORKSPACE_ROLE);
};

/**
 * Add member to workspace
 * @param {Object} data - Member data
 * @param {string} data.country_code - Country code (e.g., "+91")
 * @param {string} data.phone_number - Phone number
 * @param {string} data.name - Member name
 * @param {number} data.roleId - Role ID
 * @param {number} data.workspace_id - Workspace ID
 * @param {string} data.language - Language code (e.g., "en")
 * @returns {Promise<Object>} API response
 */
export const addMember = async (data) => {
  return http.post(AUTH_ENDPOINTS_FLAT.MEMBER_ADD, {
    country_code: data.country_code,
    phone_number: data.phone_number,
    name: data.name,
    roleId: data.roleId,
    workspace_id: data.workspace_id,
    language: data.language,
  });
};

/**
 * Update member in workspace
 * @param {Object} data - Member data
 * @param {number} data.member_id - Member ID
 * @param {number} data.workspace_id - Workspace ID
 * @param {string} data.country_code - Country code (e.g., "+91")
 * @param {string} data.phone_number - Phone number
 * @param {string} data.name - Member name
 * @param {number} data.roleId - Role ID
 * @returns {Promise<Object>} API response
 */
export const updateMember = async (data) => {
  return http.put(AUTH_ENDPOINTS_FLAT.WORKSPACE_UPDATE_MEMBER, {
    member_id: data.member_id,
    workspace_id: data.workspace_id,
    user_id: data.user_id,
    country_code: data.country_code,
    phone_number: data.phone_number,
    name: data.name,
    roleId: data.roleId,
  });
};

/**
 * Delete member from workspace
 * @param {Object} data - Member deletion data
 * @param {number} data.workspace_id - Workspace ID
 * @param {number} data.member_id - Member ID
 * @returns {Promise<Object>} API response
 */
export const deleteMember = async (data) => {
  return http.delete(AUTH_ENDPOINTS_FLAT.WORKSPACE_DELETE_MEMBER, {
    data: {
      workspace_id: data.workspace_id,
      member_id: data.member_id,
    },
  });
};

