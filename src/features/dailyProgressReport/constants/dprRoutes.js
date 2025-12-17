/**
 * Daily Progress Report Feature Routes
 * Routes specific to DPR feature
 */

export const DPR_ROUTES = {
  DPR_LIST: '/dpr',
  PROJECT_REPORTS: '/dpr/projects/:projectId',
  REPORT_DETAILS: '/dpr/projects/:projectId/reports/:reportId',
  ADD_REPORT: '/dpr/projects/:projectId/add-report',
};

export default DPR_ROUTES;

