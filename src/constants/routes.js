/**
 * Routes Configuration
 * All routes in one place - simple and easy to manage
 */

export const ROUTES = {
  // Auth Routes
  AUTH: {
    LOGIN: '/',
    REGISTER: '/register',
    VERIFY_OTP: '/verify-otp',
    LANGUAGE_SELECTION: '/select-language',
    WORKSPACE_SELECTION: '/select-workspace',
    CREATE_WORKSPACE: '/create-workspace',
    ADD_NEW_MEMBER: '/add-new-member',
    EDIT_MEMBER: '/edit-member',
  },

  // Projects Routes
  PROJECTS: {
    LIST: '/projects',
    DETAILS: '/projects/:id',
    ADD_NEW: '/projects/add-new',
    EDIT: '/projects/:id/edit',
  },
  // Dashboard Routes
  DASHBOARD: {
    HOME: '/dashboard',
    PROJECTS: '/projects',
    SETTINGS: '/settings',
    MEMBERS: '/members',
  },
  // Account Routes
  ACCOUNT: {
    MY_ACCOUNT: '/account',
    MY_PROFILE: '/account/profile',
    CHANGE_LANGUAGE: '/account/change-language',
  },
  // Business Card Routes
  BUSINESS_CARD: {
    LIST: '/business-card',
    ADD: '/business-card/add',
    EDIT: '/business-card/:id/edit',
  },
  // Refer & Earn Routes
  REFER_EARN: {
    HOME: '/refer-earn',
    WALLET: '/refer-earn/wallet',
  },
};

// Flattened routes for easier access
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

  // Projects
  PROJECTS: ROUTES.PROJECTS.LIST,
  PROJECT_DETAILS: ROUTES.PROJECTS.DETAILS,
  ADD_NEW_PROJECT: ROUTES.PROJECTS.ADD_NEW,
  EDIT_PROJECT: ROUTES.PROJECTS.EDIT,
  
  // Dashboard
  DASHBOARD: ROUTES.DASHBOARD.HOME,
  PROJECTS: ROUTES.DASHBOARD.PROJECTS,
  SETTINGS: ROUTES.DASHBOARD.SETTINGS,
  MEMBERS: ROUTES.DASHBOARD.MEMBERS,
  
  // Account
  MY_ACCOUNT: ROUTES.ACCOUNT.MY_ACCOUNT,
  MY_PROFILE: ROUTES.ACCOUNT.MY_PROFILE,
  CHANGE_LANGUAGE: ROUTES.ACCOUNT.CHANGE_LANGUAGE,
  
  // Business Card
  BUSINESS_CARD: ROUTES.BUSINESS_CARD.LIST,
  ADD_BUSINESS_CARD: ROUTES.BUSINESS_CARD.ADD,
  EDIT_BUSINESS_CARD: ROUTES.BUSINESS_CARD.EDIT,

  // Refer & Earn
  REFER_EARN: ROUTES.REFER_EARN.HOME,
  REFER_EARN_WALLET: ROUTES.REFER_EARN.WALLET,
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
