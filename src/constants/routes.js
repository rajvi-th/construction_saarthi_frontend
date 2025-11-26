/**
 * Routes Configuration
 * Organized by feature modules for scalability (400+ pages)
 * Always use ROUTES constants instead of hardcoded paths
 */

export const ROUTES = {
  // Auth Routes
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    VERIFY_OTP: '/verify-otp',
    LANGUAGE_SELECTION: '/select-language',
    WORKSPACE_SELECTION: '/select-workspace',
    CREATE_WORKSPACE: '/create-workspace',
    ADD_NEW_MEMBER: '/add-new-member',
    EDIT_MEMBER: '/edit-member',
  },

};

// Flattened routes for backward compatibility and easier access
export const ROUTES_FLAT = {
  // Auth
  LOGIN: ROUTES.AUTH.LOGIN,
  REGISTER: ROUTES.AUTH.REGISTER,
  VERIFY_OTP: ROUTES.AUTH.VERIFY_OTP,
  LANGUAGE_SELECTION: ROUTES.AUTH.LANGUAGE_SELECTION,
  WORKSPACE_SELECTION: ROUTES.AUTH.WORKSPACE_SELECTION,
  CREATE_WORKSPACE: ROUTES.AUTH.CREATE_WORKSPACE,
  ADD_NEW_MEMBER: ROUTES.AUTH.ADD_NEW_MEMBER,
  EDIT_MEMBER: ROUTES.AUTH.EDIT_MEMBER,
};

/**
 * Helper function to generate dynamic routes with parameters
 * @param {string} route - Route path with :param placeholders
 * @param {object} params - Object with parameter values
 * @returns {string} - Route with parameters replaced
 * 
 * @example
 * getRoute(ROUTES.PROJECTS.DETAILS, { id: '123' }) // '/projects/123'
 */
export const getRoute = (route, params = {}) => {
  let path = route;
  Object.keys(params).forEach((key) => {
    path = path.replace(`:${key}`, params[key]);
  });
  return path;
};

// Export both structured and flat routes
export default ROUTES_FLAT;

