/**
 * Projects Feature API Endpoints
 * All project-related endpoints
 */

export const PROJECT_ENDPOINTS = {
  // Project Endpoints
  PROJECT: {
    LIST: '/project',
    CREATE: '/project/create',
    UPDATE: '/project/edit',
    DELETE: '/project/delete',
    DETAILS: '/project/getProjectID',
    SEARCH: '/project/search',
  },

  // Builder Endpoints (for dropdown)
  BUILDER: {
    LIST: '/builder',
    CREATE: '/builder/create',
  },
  
  // Project Start (for media upload)
  PROJECT_START: {
    START: '/project/start',
  },
  
  // Project Upload Media
  PROJECT_UPLOAD: {
    UPLOAD: '/project/upload',
  },
  
  // Construction Type Endpoints
  CONSTRUCTION: {
    LIST: '/construction',
    CREATE: '/construction',
  },
  
  // Contract Type Endpoints
  CONTRACT_TYPE: {
    LIST: '/contract-type',
    CREATE: '/contract-type',
  },
};

// Flattened endpoints for easier access
export const PROJECT_ENDPOINTS_FLAT = {
  // Project
  PROJECT_LIST: PROJECT_ENDPOINTS.PROJECT.LIST,
  PROJECT_CREATE: PROJECT_ENDPOINTS.PROJECT.CREATE,
  PROJECT_UPDATE: PROJECT_ENDPOINTS.PROJECT.UPDATE,
  PROJECT_DELETE: PROJECT_ENDPOINTS.PROJECT.DELETE,
  PROJECT_DETAILS: PROJECT_ENDPOINTS.PROJECT.DETAILS,
  PROJECT_SEARCH: PROJECT_ENDPOINTS.PROJECT.SEARCH,

  // Builder
  BUILDER_LIST: PROJECT_ENDPOINTS.BUILDER.LIST,
  BUILDER_CREATE: PROJECT_ENDPOINTS.BUILDER.CREATE,
  
  // Project Start
  PROJECT_START: PROJECT_ENDPOINTS.PROJECT_START.START,
  
  // Project Upload
  PROJECT_UPLOAD: PROJECT_ENDPOINTS.PROJECT_UPLOAD.UPLOAD,
  
  // Construction Type
  CONSTRUCTION_LIST: PROJECT_ENDPOINTS.CONSTRUCTION.LIST,
  CONSTRUCTION_CREATE: PROJECT_ENDPOINTS.CONSTRUCTION.CREATE,
  
  // Contract Type
  CONTRACT_TYPE_LIST: PROJECT_ENDPOINTS.CONTRACT_TYPE.LIST,
  CONTRACT_TYPE_CREATE: PROJECT_ENDPOINTS.CONTRACT_TYPE.CREATE,
};

export default PROJECT_ENDPOINTS_FLAT;

