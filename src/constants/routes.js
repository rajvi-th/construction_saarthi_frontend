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
  // Subscription Routes
  SUBSCRIPTION: {
    HOME: '/subscription',
    ADDED_MEMBERS: '/subscription/added-members',
    COUPON: '/subscription/coupon',
  },
  // Site Inventory Routes
  SITE_INVENTORY: {
    LIST: '/site-inventory',
    ADD: '/site-inventory/add',
    EDIT: '/site-inventory/:id/edit',
    DETAILS: '/site-inventory/:id',
    CONSUMABLE_DETAILS: '/site-inventory/consumable/:id',
    ADD_NEW_ASK: '/site-inventory/add-new-ask',
    ADD_STOCK: '/site-inventory/restock/add-stock',
  },
  // Builder Client Routes
  BUILDER_CLIENT: {
    BUILDERS: '/builders',
    ADD: '/builders/add',
    EDIT: '/builders/:id/edit',
  },
  // Vendors Routes
  VENDORS: {
    LIST: '/vendors',
    ADD: '/vendors/add',
    EDIT: '/vendors/:id/edit',
  },

  // Past Projects Routes
  PAST_PROJECTS: {
    LIST: '/past-work',
    ADD: '/past-work/add',
  },
  // Past Work Routes
  PAST_WORK: {
    LIST: '/past-work',
    DETAILS: '/past-work/:id',
    ADD_NEW: '/past-work/add-new',
    EDIT: '/past-work/:id/edit',
  },
  // Project Gallery Routes
  PROJECT_GALLERY: {
    HOME: '/gallery',
    PROJECT_GALLERY: '/gallery/:projectId',
    UPLOAD: '/gallery/:projectId/upload',
  },
  // Daily Progress Report Routes
  DPR: {
    LIST: '/dpr',
    PROJECT_REPORTS: '/dpr/projects/:projectId',
    REPORT_DETAILS: '/dpr/projects/:projectId/reports/:reportId',
    ADD_REPORT: '/dpr/projects/:projectId/add-report',
  },
  // Notes Routes
  NOTES: {
    LIST: '/notes',
    PROJECT_NOTES: '/notes/projects/:projectId',
    ADD: '/notes/add',
    DETAILS: '/notes/:id',
    EDIT: '/notes/:id/edit',
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
  
  // Subscription
  SUBSCRIPTION: ROUTES.SUBSCRIPTION.HOME,
  SUBSCRIPTION_ADDED_MEMBERS: ROUTES.SUBSCRIPTION.ADDED_MEMBERS,
  SUBSCRIPTION_COUPON: ROUTES.SUBSCRIPTION.COUPON,
  
  // Site Inventory
  SITE_INVENTORY: ROUTES.SITE_INVENTORY.LIST,
  ADD_SITE_INVENTORY: ROUTES.SITE_INVENTORY.ADD,
  EDIT_SITE_INVENTORY: ROUTES.SITE_INVENTORY.EDIT,
  INVENTORY_ITEM_DETAILS: ROUTES.SITE_INVENTORY.DETAILS,
  CONSUMABLE_ITEM_DETAILS: ROUTES.SITE_INVENTORY.CONSUMABLE_DETAILS,
  ADD_NEW_ASK: ROUTES.SITE_INVENTORY.ADD_NEW_ASK,
  ADD_STOCK: ROUTES.SITE_INVENTORY.ADD_STOCK,
  
  // Builder Client
  BUILDERS: ROUTES.BUILDER_CLIENT.BUILDERS,
  ADD_BUILDER: ROUTES.BUILDER_CLIENT.ADD,
  EDIT_BUILDER: ROUTES.BUILDER_CLIENT.EDIT,
  
  // Vendors
  VENDORS: ROUTES.VENDORS.LIST,
  ADD_VENDOR: ROUTES.VENDORS.ADD,
  EDIT_VENDOR: ROUTES.VENDORS.EDIT,

  // Past Projects
  PAST_PROJECTS: ROUTES.PAST_PROJECTS.LIST,
  PAST_PROJECTS_ADD: ROUTES.PAST_PROJECTS.ADD,
  
  // Past Work
  PAST_WORK: ROUTES.PAST_WORK.LIST,
  PAST_WORK_DETAILS: ROUTES.PAST_WORK.DETAILS,
  EDIT_PAST_WORK: ROUTES.PAST_WORK.EDIT,
  
  // Project Gallery
  PROJECT_GALLERY: ROUTES.PROJECT_GALLERY.HOME,
  PROJECT_GALLERY_DETAILS: ROUTES.PROJECT_GALLERY.PROJECT_GALLERY,
  PROJECT_GALLERY_UPLOAD: ROUTES.PROJECT_GALLERY.UPLOAD,
  
  // Daily Progress Report
  DPR: ROUTES.DPR.LIST,
  DPR_PROJECT_REPORTS: ROUTES.DPR.PROJECT_REPORTS,
  DPR_REPORT_DETAILS: ROUTES.DPR.REPORT_DETAILS,
  DPR_ADD_REPORT: ROUTES.DPR.ADD_REPORT,
  
  // Notes
  NOTES: ROUTES.NOTES.LIST,
  NOTES_PROJECT_NOTES: ROUTES.NOTES.PROJECT_NOTES,
  NOTES_ADD: ROUTES.NOTES.ADD,
  NOTES_DETAILS: ROUTES.NOTES.DETAILS,
  NOTES_EDIT: ROUTES.NOTES.EDIT,
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
