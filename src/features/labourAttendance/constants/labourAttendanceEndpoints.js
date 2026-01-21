/**
 * Labour Attendance Feature API Endpoints
 */

export const LABOUR_ATTENDANCE_ENDPOINTS = {
  SHIFT_TYPES: '/shift-type',
  CATEGORIES: {
    LIST: (workspaceId) => `/category/${workspaceId}`,
    CREATE: '/category/create',
  },
  PROJECTS: {
    // Backend provided endpoint (as per user spec)
    LIST_ALL: (workspaceId) => `/category/All/${workspaceId}`,
    // Fallback to standard projects list used elsewhere in app
    LIST_STANDARD: (workspaceId) => `/project/${workspaceId}`,
  },
  LABOUR: {
    ADD: '/labour/add-labour',
    UPDATE: '/labour/edit-labour',
    DELETE: '/labour',
    GET: '/labour',
    PROJECT_LABOURS: '/labour/project-labours',
    ADD_NOTE: '/labour/add-note',
    PROFILE: '/labour/profile',
    PROFILE_ALL: '/labour/all',
  },
  ATTENDANCE: {
    MOVE: '/attendance/move',
    CREATE: '/attendance/create',
    GET: '/attendance',
    OT_PAYABLE_BILL: '/attendance/OT_payable_bill',
  },
  PAY_LABOUR: {
    CREATE: '/expense-section/payLabour/create',
  },
};

export default LABOUR_ATTENDANCE_ENDPOINTS;


