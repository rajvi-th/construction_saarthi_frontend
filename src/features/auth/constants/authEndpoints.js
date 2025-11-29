/**
 * Auth Feature API Endpoints
 * All authentication and workspace-related endpoints
 */

export const AUTH_ENDPOINTS = {
  // Auth Endpoints
  AUTH: {
    SEND_OTP: '/user/send-otp',
    VERIFY_OTP: '/user/verify-otp',
    LOGIN: '/user/login',
    REGISTER: '/user/register',
    LOGOUT: '/user/logout',
    REFRESH_TOKEN: '/user/refresh-token',
    LANGUAGE: '/user/language',
  },

  // Workspace Endpoints (part of auth flow)
  WORKSPACE: {
    LIST: '/workspace',
    CREATE: '/workspace',
    UPDATE: '/workspace/update',
    DELETE: '/workspace/delete',
    DETAILS: '/workspace/details',
    MEMBERS: '/workspace/member',
    UPDATE_MEMBER: '/workspace/member',
    DELETE_MEMBER: '/workspace/member',
  },

  // Member Endpoints (part of auth/workspace flow)
  MEMBER: {
    ADD: '/workspace/addmember',
    UPDATE: '/member/update',
    DELETE: '/member/delete',
    LIST: '/member/list',
  },

  // Admin Endpoints (used in auth flow)
  ADMIN: {
    GET_ALL_ROLE: '/admin/getAllRole',
  },
};

// Flattened endpoints for easier access
export const AUTH_ENDPOINTS_FLAT = {
  // Auth
  SEND_OTP: AUTH_ENDPOINTS.AUTH.SEND_OTP,
  VERIFY_OTP: AUTH_ENDPOINTS.AUTH.VERIFY_OTP,
  LOGIN: AUTH_ENDPOINTS.AUTH.LOGIN,
  REGISTER: AUTH_ENDPOINTS.AUTH.REGISTER,
  LOGOUT: AUTH_ENDPOINTS.AUTH.LOGOUT,
  REFRESH_TOKEN: AUTH_ENDPOINTS.AUTH.REFRESH_TOKEN,
  LANGUAGE: AUTH_ENDPOINTS.AUTH.LANGUAGE,

  // Workspace
  WORKSPACE_LIST: AUTH_ENDPOINTS.WORKSPACE.LIST,
  WORKSPACE_CREATE: AUTH_ENDPOINTS.WORKSPACE.CREATE,
  WORKSPACE_UPDATE: AUTH_ENDPOINTS.WORKSPACE.UPDATE,
  WORKSPACE_DELETE: AUTH_ENDPOINTS.WORKSPACE.DELETE,
  WORKSPACE_DETAILS: AUTH_ENDPOINTS.WORKSPACE.DETAILS,
  WORKSPACE_MEMBERS: AUTH_ENDPOINTS.WORKSPACE.MEMBERS,
  WORKSPACE_UPDATE_MEMBER: AUTH_ENDPOINTS.WORKSPACE.UPDATE_MEMBER,
  WORKSPACE_DELETE_MEMBER: AUTH_ENDPOINTS.WORKSPACE.DELETE_MEMBER,

  // Member
  MEMBER_ADD: AUTH_ENDPOINTS.MEMBER.ADD,
  MEMBER_UPDATE: AUTH_ENDPOINTS.MEMBER.UPDATE,
  MEMBER_DELETE: AUTH_ENDPOINTS.MEMBER.DELETE,
  MEMBER_LIST: AUTH_ENDPOINTS.MEMBER.LIST,

  // Admin
  ADMIN_GET_ALL_ROLE: AUTH_ENDPOINTS.ADMIN.GET_ALL_ROLE,
};

export default AUTH_ENDPOINTS_FLAT;

