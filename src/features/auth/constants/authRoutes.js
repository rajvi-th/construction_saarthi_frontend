/**
 * Auth Feature Routes
 * Routes specific to authentication flow
 * Note: Entry routes (LOGIN, REGISTER) remain in global routes.js
 */

export const AUTH_ROUTES = {
  // Auth flow routes (these are also in global routes, kept here for feature reference)
  VERIFY_OTP: '/verify-otp',
  LANGUAGE_SELECTION: '/select-language',
  WORKSPACE_SELECTION: '/select-workspace',
  CREATE_WORKSPACE: '/create-workspace',
  ADD_NEW_MEMBER: '/add-new-member',
  EDIT_MEMBER: '/edit-member',
};

export default AUTH_ROUTES;

