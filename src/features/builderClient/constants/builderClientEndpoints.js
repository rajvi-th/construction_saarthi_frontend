/**
 * Builder Client Feature API Endpoints
 * All builder and client-related endpoints
 * Uses unified endpoint with role parameter
 */

export const BUILDER_CLIENT_ENDPOINTS = {
  // Unified endpoint for builders, clients, vendors
  USER_ROLES: '/builder/user-roles', // GET /builder/user-roles?workspace_id={id}&role={role}
  // Builder Endpoints
  BUILDER: {
    GET: '/builder', // GET /builder/{id} - Get single builder
    CREATE: '/builder/create', // POST /builder/create
    UPDATE: '/builder', // PUT /builder/{id}
    DELETE: '/builder', // DELETE /builder/{id}
  },
  // Client Endpoints
  CLIENT: {
    GET: '/client', // GET /client/{id} - Get single client
    CREATE: '/client/create',
    UPDATE: '/client/edit', // PUT /client/edit/{id}
    DELETE: '/client', // DELETE /client/{id}
  },
};

// Flattened endpoints for easier access
export const BUILDER_CLIENT_ENDPOINTS_FLAT = {
  // Unified endpoint
  USER_ROLES: BUILDER_CLIENT_ENDPOINTS.USER_ROLES,
  
  // Builder
  BUILDER_GET: BUILDER_CLIENT_ENDPOINTS.BUILDER.GET, // GET /builder/{id}
  BUILDER_CREATE: BUILDER_CLIENT_ENDPOINTS.BUILDER.CREATE, // POST /builder/create
  BUILDER_UPDATE: BUILDER_CLIENT_ENDPOINTS.BUILDER.UPDATE, // PUT /builder/{id}
  BUILDER_DELETE: BUILDER_CLIENT_ENDPOINTS.BUILDER.DELETE, // DELETE /builder/{id}
  
  // Client
  CLIENT_GET: BUILDER_CLIENT_ENDPOINTS.CLIENT.GET, // GET /client/{id}
  CLIENT_CREATE: BUILDER_CLIENT_ENDPOINTS.CLIENT.CREATE,
  CLIENT_UPDATE: BUILDER_CLIENT_ENDPOINTS.CLIENT.UPDATE, // PUT /client/edit/{id}
  CLIENT_DELETE: BUILDER_CLIENT_ENDPOINTS.CLIENT.DELETE, // DELETE /client/{id}
};

export default BUILDER_CLIENT_ENDPOINTS_FLAT;

