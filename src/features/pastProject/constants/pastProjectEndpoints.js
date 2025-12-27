/**
 * Past Project Feature API Endpoints
 * Central place to manage all past-project related endpoints
 */

export const PAST_PROJECT_ENDPOINTS = {
  PAST_PROJECT: {
    LIST: '/my-past-work', // GET /my-past-work/:workspaceid
    START: '/my-past-work/start', // POST /my-past-work/start/:workspaceID
    CREATE: '/my-past-work/create', // POST /my-past-work/create/:workspaceID
    UPLOAD: '/my-past-work/upload', // POST /my-past-work/upload
    GET_BY_ID: '/my-past-work/getProjectID', // GET /my-past-work/getProjectID/:projectId
    UPDATE: '/my-past-work/update', // PUT /my-past-work/update/:projectId or PUT /my-past-work/update
  },
};

// Flattened endpoints for easier access
export const PAST_PROJECT_ENDPOINTS_FLAT = {
  PAST_PROJECT_LIST: PAST_PROJECT_ENDPOINTS.PAST_PROJECT.LIST,
  PAST_PROJECT_START: PAST_PROJECT_ENDPOINTS.PAST_PROJECT.START,
  PAST_PROJECT_CREATE: PAST_PROJECT_ENDPOINTS.PAST_PROJECT.CREATE,
  PAST_PROJECT_UPLOAD: PAST_PROJECT_ENDPOINTS.PAST_PROJECT.UPLOAD,
  PAST_PROJECT_GET_BY_ID: PAST_PROJECT_ENDPOINTS.PAST_PROJECT.GET_BY_ID,
  PAST_PROJECT_UPDATE: PAST_PROJECT_ENDPOINTS.PAST_PROJECT.UPDATE,
};

export default PAST_PROJECT_ENDPOINTS_FLAT;

