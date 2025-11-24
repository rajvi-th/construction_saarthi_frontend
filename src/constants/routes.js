
export const ROUTES = {
  // Auth Routes
  LOGIN: '/',
  REGISTER: '/register',
  VERIFY_OTP: '/verify-otp',
};

// Helper function to generate dynamic routes
export const getRoute = (route, params = {}) => {
  let path = route;
  Object.keys(params).forEach((key) => {
    path = path.replace(`:${key}`, params[key]);
  });
  return path;
};

// Example usage:
// import { ROUTES, getRoute } from '../constants/routes';
// navigate(ROUTES.PROJECT_DETAILS.replace(':id', '123'));
// or
// navigate(getRoute(ROUTES.PROJECT_DETAILS, { id: '123' }));

export default ROUTES;

