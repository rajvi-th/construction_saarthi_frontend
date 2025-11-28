/**
 * Dashboard API
 * API calls for dashboard features
 */

import http from '../../../services/http';
import { DASHBOARD_ENDPOINTS_FLAT } from '../constants/dashboardEndpoints';

/**
 * Get all projects for a workspace
 * @param {string|number} workspaceId - Workspace ID
 * @returns {Promise<Array>} List of projects
 */
export const getProjects = async (workspaceId) => {
  if (!workspaceId) {
    throw new Error('Workspace ID is required');
  }
  
  return http.get(`${DASHBOARD_ENDPOINTS_FLAT.PROJECT_LIST}/${workspaceId}`);
};

