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
 * @param {Array<string|number>} keepMediaIds - Array of existing media IDs to preserve
 * @returns {Promise} API response
 */
export const uploadProjectMedia = async (projectId, files, keepMediaIds = []) => {
  try {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    if (!files || !Array.isArray(files)) {
      throw new Error('Files must be an array');
    }

    const formData = new FormData();
    
    // Append each file with the same "media" key
    files.forEach((file) => {
      if (file instanceof File) {
        formData.append('media', file);
      }
    });

    // Append existing media IDs to keep (as JSON string)
    if (keepMediaIds && Array.isArray(keepMediaIds) && keepMediaIds.length > 0) {
      formData.append('keepMediaIds', JSON.stringify(keepMediaIds.map(id => String(id))));
    }

    const url = PROJECT_GALLERY_ENDPOINTS_FLAT.UPLOAD_MEDIA.replace(':projectId', String(projectId));
    
    // http service handles FormData
    const response = await http.put(url, formData);
    
    return response;
  } catch (error) {
    throw error;
  }
};

