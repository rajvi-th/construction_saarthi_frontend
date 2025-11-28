/**
 * Dashboard Feature API Endpoints
 * All dashboard-related endpoints
 */

export const DASHBOARD_ENDPOINTS = {
  PROJECT: {
    LIST: '/project', // GET /api/project/{{workspace_id}}
  },
};

// Flattened endpoints for easier access
export const DASHBOARD_ENDPOINTS_FLAT = {
  PROJECT_LIST: DASHBOARD_ENDPOINTS.PROJECT.LIST,
};

export default DASHBOARD_ENDPOINTS_FLAT;

