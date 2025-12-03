/**
 * Vendors API
 * API calls for vendor management
 * Uses unified endpoint with role parameter
 */

import http from '../../../services/http';
import { BUILDER_CLIENT_ENDPOINTS_FLAT } from '../../builderClient/constants/builderClientEndpoints';

/**
 * Get list of vendors
 * @param {string|number} workspaceId - Workspace ID
 * @returns {Promise<Object>} List of vendors
 */
export const getVendors = async (workspaceId) => {
  if (!workspaceId) {
    throw new Error('Workspace ID is required');
  }
  return http.get(`${BUILDER_CLIENT_ENDPOINTS_FLAT.USER_ROLES}?workspace_id=${workspaceId}&role=vendors`);
};

/**
 * Get vendor details
 * @param {string} id - Vendor ID
 * @returns {Promise<Object>} Vendor data
 */
export const getVendor = async (id) => {
  return http.get(`${BUILDER_CLIENT_ENDPOINTS_FLAT.BUILDER_GET}/${id}`);
};

/**
 * Create vendor
 * @param {Object} data - Vendor data
 * @returns {Promise<Object>} API response
 */
export const createVendor = async (data) => {
  return http.post(BUILDER_CLIENT_ENDPOINTS_FLAT.BUILDER_CREATE, data);
};

/**
 * Update vendor
 * @param {string} id - Vendor ID
 * @param {Object} data - Vendor data
 * @returns {Promise<Object>} API response
 */
export const updateVendor = async (id, data) => {
  return http.put(`${BUILDER_CLIENT_ENDPOINTS_FLAT.BUILDER_UPDATE}/${id}`, data);
};

/**
 * Delete vendor
 * @param {string} id - Vendor ID
 * @returns {Promise<Object>} API response
 */
export const deleteVendor = async (id) => {
  return http.delete(`${BUILDER_CLIENT_ENDPOINTS_FLAT.BUILDER_DELETE}/${id}`);
};

