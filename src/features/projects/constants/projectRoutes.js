/**
 * Projects Feature Routes
 * Routes specific to projects feature
 */

export const PROJECT_ROUTES = {
  PROJECTS: '/projects',
  // Use slug in URL for project details (e.g. /projects/shivaay-residency-bopal)
  PROJECT_DETAILS: '/projects/:slug',
  ADD_NEW_PROJECT: '/projects/add-new',
  EDIT_PROJECT: '/projects/:id/edit',
};

export default PROJECT_ROUTES;

