/**
 * Builder Client API
 * API calls for builder and client management
 * Uses unified endpoint with role parameter
 */

import http from '../../../services/http';
import { BUILDER_CLIENT_ENDPOINTS_FLAT } from '../constants/builderClientEndpoints';

/**
 * Get list of users by role (builders, clients, vendors)
 * @param {string|number} workspaceId - Workspace ID
 * @param {string} role - Role type: 'builders', 'clients', 'vendors'
 * @returns {Promise<Object>} List of users
 */
export const getUsersByRole = async (workspaceId, role) => {
  if (!workspaceId || !role) {
    throw new Error('Workspace ID and role are required');
  }
  return http.get(`${BUILDER_CLIENT_ENDPOINTS_FLAT.USER_ROLES}?workspace_id=${workspaceId}&role=${role}`);
};

/**
 * Get user-role mapping for a specific user in a workspace
 * Backend endpoint example:
 *   GET /builder/user-roles/{userId}?workspace_id={workspaceId}&role={role}
 *
 * @param {string|number} userId - User ID (builder / client / vendor user id)
 * @param {string|number} workspaceId - Workspace ID
 * @param {string} role - Role key, e.g. 'contractor', 'builder', 'vendors'
 * @returns {Promise<Object>} API response with role mapping (id etc.)
 */
export const getUserRoleByUserId = async (userId, workspaceId, role) => {
  if (!userId || !workspaceId || !role) {
    throw new Error('userId, workspaceId and role are required');
  }

  return http.get(
    `${BUILDER_CLIENT_ENDPOINTS_FLAT.USER_ROLES}/${userId}?workspace_id=${workspaceId}&role=${role}`
  );
};

/**
 * Get list of builders
 * @param {string|number} workspaceId - Workspace ID
 * @returns {Promise<Object>} List of builders
 */
export const getBuilders = async (workspaceId) => {
  return getUsersByRole(workspaceId, 'builder');
};

/**
 * Get list of clients
 * @param {string|number} workspaceId - Workspace ID
 * @returns {Promise<Object>} List of clients
 */
export const getClients = async (workspaceId) => {
  return getUsersByRole(workspaceId, 'clients');
};

/**
 * Get list of vendors
 * @param {string|number} workspaceId - Workspace ID
 * @returns {Promise<Object>} List of vendors
 */
export const getVendors = async (workspaceId) => {
  return getUsersByRole(workspaceId, 'vendors');
};

/**
 * Create builder
 * @param {Object} data - Builder data
 * @returns {Promise<Object>} API response
 */
export const createBuilder = async (data) => {
  return http.post(BUILDER_CLIENT_ENDPOINTS_FLAT.BUILDER_CREATE, data);
};

/**
 * Update builder
 * @param {string} id - Builder ID
 * @param {Object} data - Builder data
 * @returns {Promise<Object>} API response
 */
export const updateBuilder = async (id, data) => {
  return http.put(`${BUILDER_CLIENT_ENDPOINTS_FLAT.BUILDER_UPDATE}/${id}`, data);
};

/**
 * Delete builder
 * @param {string} id - Builder ID
 * @returns {Promise<Object>} API response
 */
export const deleteBuilder = async (id) => {
  return http.delete(`${BUILDER_CLIENT_ENDPOINTS_FLAT.BUILDER_DELETE}/${id}`);
};

/**
 * Get client details
 * @param {string} id - Client ID
 * @returns {Promise<Object>} Client data
 */
export const getClient = async (id) => {
  return http.get(`${BUILDER_CLIENT_ENDPOINTS_FLAT.CLIENT_GET}/${id}`);
};

/**
 * Create client
 * @param {Object} data - Client data
 * @returns {Promise<Object>} API response
 */
export const createClient = async (data) => {
  return http.post(BUILDER_CLIENT_ENDPOINTS_FLAT.CLIENT_CREATE, data);
};

/**
 * Update client
 * @param {string} id - Client ID
 * @param {Object} data - Client data
 * @returns {Promise<Object>} API response
 */
export const updateClient = async (id, data) => {
  return http.put(`${BUILDER_CLIENT_ENDPOINTS_FLAT.CLIENT_UPDATE}/${id}`, data);
};

/**
 * Delete client
 * @param {string} id - Client ID
 * @returns {Promise<Object>} API response
 */
export const deleteClient = async (id) => {
  return http.delete(`${BUILDER_CLIENT_ENDPOINTS_FLAT.CLIENT_DELETE}/${id}`);
};

