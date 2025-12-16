/**
 * Project Gallery API
 * API functions for project gallery operations
 */

import http from '../../../services/http';
import { PROJECT_GALLERY_ENDPOINTS_FLAT } from '../constants';

/**
 * Get project gallery items
 * @param {Object} params - Query parameters
 * @param {string|number} params.projectId - Project ID (required)
 * @param {string} params.type - Media type: 'photo', 'video', or 'document' (optional)
 * @param {string} params.dateFilter - Date filter: 'custom', 'recent', 'oldest', etc. (optional)
 * @returns {Promise} API response
 */
export const getProjectGallery = async (params = {}) => {
  try {
    const { projectId, type, dateFilter, ...otherParams } = params;
    
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (type) {
      queryParams.append('type', type);
    }
    if (dateFilter) {
      queryParams.append('dateFilter', dateFilter);
    }
    
    // Add any other query parameters
    Object.keys(otherParams).forEach(key => {
      if (otherParams[key] !== undefined && otherParams[key] !== null) {
        queryParams.append(key, otherParams[key]);
      }
    });

    const queryString = queryParams.toString();
    const url = PROJECT_GALLERY_ENDPOINTS_FLAT.GET_GALLERY
      .replace(':projectId', projectId) + (queryString ? `?${queryString}` : '');

    const response = await http.get(url);
    // http service already returns response.data, so response is the data object directly
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete media (photo, video, or document)
 * @param {string|number} mediaId - Media ID to delete
 * @returns {Promise} API response
 */
export const deleteMedia = async (mediaId) => {
  try {
    const response = await http.delete(
      PROJECT_GALLERY_ENDPOINTS_FLAT.DELETE_MEDIA,
      {
        data: {
          id: String(mediaId),
        },
      }
    );
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Upload media files to project
 * @param {string|number} projectId - Project ID
 * @param {File[]} files - Array of File objects to upload
 * @returns {Promise} API response
 */
export const uploadProjectMedia = async (projectId, files) => {
  try {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new Error('At least one file is required');
    }

    const formData = new FormData();
    
    // Append each file with the same "media" key (as per API requirement)
    files.forEach((file) => {
      if (file instanceof File) {
        formData.append('media', file);
      }
    });

    const url = PROJECT_GALLERY_ENDPOINTS_FLAT.UPLOAD_MEDIA.replace(':projectId', String(projectId));
    
    // Don't set Content-Type header - let axios/http service handle it for FormData
    const response = await http.put(url, formData);
    
    return response;
  } catch (error) {
    throw error;
  }
};

