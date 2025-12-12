/**
 * Past Project API
 * API functions for past project operations
 */

import axios from 'axios';
import http from '../../../services/http';
import config from '../../../config';
import { PAST_PROJECT_ENDPOINTS_FLAT } from '../constants/pastProjectEndpoints';

/**
 * Get past projects for a workspace
 * @param {string|number} workspaceId - Workspace ID (required)
 * @param {Object} filters - Optional filters (projectKey, name, status, address)
 * @returns {Promise<Array>} Array of past projects
 */
export const getPastProjects = async (workspaceId, filters = {}) => {
  if (!workspaceId) {
    throw new Error('Workspace ID is required');
  }

  const url = `${config.API_BASE_URL}${PAST_PROJECT_ENDPOINTS_FLAT.PAST_PROJECT_LIST}/${workspaceId}`;
  const token = localStorage.getItem('token');

  try {
    // Check if filters are provided
    const hasFilters = filters.projectKey || filters.name || filters.status || filters.address;
    
    // Use axios.request for GET with body (non-standard but as per API example)
    const response = await axios.request({
      method: 'GET',
      url,
      headers: {
        'Content-Type': 'text/plain',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      // Include body if filters are provided
      ...(hasFilters && {
        data: JSON.stringify({
          projectKey: filters.projectKey,
          name: filters.name,
          status: filters.status,
          address: filters.address,
        }),
      }),
    });

    return response.data;
  } catch (error) {
    console.error('Get past projects error:', error);
    throw error;
  }
};

/**
 * Start a new past project - gets projectKey
 * @param {string|number} workspaceId - Workspace ID
 * @returns {Promise<Object>} Response containing projectKey
 */
export const startPastProject = async (workspaceId) => {
  if (!workspaceId) {
    throw new Error('Workspace ID is required');
  }

  const url = `${config.API_BASE_URL}${PAST_PROJECT_ENDPOINTS_FLAT.PAST_PROJECT_START}/${workspaceId}`;
  const token = localStorage.getItem('token');

  try {
    const response = await axios.post(
      url,
      {},
      {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Start past project error:', error);
    throw error;
  }
};

/**
 * Create a past project
 * @param {string|number} workspaceId - Workspace ID
 * @param {Object} data - Project data
 * @param {string} data.projectKey - Project key from start API
 * @param {string} data.name - Project name
 * @param {string} data.address - Project address
 * @returns {Promise<Object>} Created project
 */
export const createPastProject = async (workspaceId, data) => {
  if (!workspaceId) {
    throw new Error('Workspace ID is required');
  }

  if (!data.projectKey || !data.name || !data.address) {
    throw new Error('Project key, name, and address are required');
  }

  const url = `${config.API_BASE_URL}${PAST_PROJECT_ENDPOINTS_FLAT.PAST_PROJECT_CREATE}/${workspaceId}`;
  const token = localStorage.getItem('token');

  try {
    const response = await axios.post(
      url,
      {
        projectKey: data.projectKey,
        name: data.name,
        address: data.address,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Create past project error:', error);
    throw error;
  }
};

/**
 * Upload media files for a past project
 * @param {string} projectKey - Project key
 * @param {File[]} files - Array of File objects to upload
 * @returns {Promise<Object>} Upload response
 */
export const uploadPastProjectMedia = async (projectKey, files) => {
  if (!projectKey) {
    throw new Error('Project key is required');
  }

  if (!files || files.length === 0) {
    throw new Error('At least one file is required');
  }

  const formData = new FormData();
  
  // Add projectKey to formData
  formData.append('projectKey', projectKey);
  
  // Add all files with key 'media'
  files.forEach((file) => {
    if (file instanceof File) {
      formData.append('media', file);
    } else if (file && file.file && file.file instanceof File) {
      formData.append('media', file.file);
    }
  });

  const url = `${config.API_BASE_URL}${PAST_PROJECT_ENDPOINTS_FLAT.PAST_PROJECT_UPLOAD}`;
  const token = localStorage.getItem('token');

  try {
    const response = await axios.post(
      url,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Upload past project media error:', error);
    throw error;
  }
};


