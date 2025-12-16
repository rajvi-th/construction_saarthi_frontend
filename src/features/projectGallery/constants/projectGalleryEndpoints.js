/**
 * Project Gallery API Endpoints
 * Centralized endpoint definitions for project gallery operations
 */

const PROJECT_GALLERY_ENDPOINTS = {
  PROJECT_GALLERY: {
    GET_GALLERY: '/project/gallary/:projectId', // GET /project/gallary/:projectId?type=document&dateFilter=custom
    DELETE_MEDIA: '/media', // DELETE /api/media with body { id: "31" }
    UPLOAD_MEDIA: '/project/edit/:projectId', // PUT /api/project/edit/:projectId with FormData
  },
};

// Flattened endpoints for easy access
const PROJECT_GALLERY_ENDPOINTS_FLAT = {
  GET_GALLERY: PROJECT_GALLERY_ENDPOINTS.PROJECT_GALLERY.GET_GALLERY,
  DELETE_MEDIA: PROJECT_GALLERY_ENDPOINTS.PROJECT_GALLERY.DELETE_MEDIA,
  UPLOAD_MEDIA: PROJECT_GALLERY_ENDPOINTS.PROJECT_GALLERY.UPLOAD_MEDIA,
};

export { PROJECT_GALLERY_ENDPOINTS };
export default PROJECT_GALLERY_ENDPOINTS_FLAT;

