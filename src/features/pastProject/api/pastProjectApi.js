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
    throw error;
  }
};

/**
 * Get past project by ID
 * @param {string|number} projectId - Project ID
 * @returns {Promise<Object>} Project details with pastWorkMedia
 */
export const getPastProjectById = async (projectId) => {
  if (!projectId) {
    throw new Error('Project ID is required');
  }

  const url = `${config.API_BASE_URL}${PAST_PROJECT_ENDPOINTS_FLAT.PAST_PROJECT_GET_BY_ID}/${projectId}`;
  const token = localStorage.getItem('token');

  try {
    const response = await axios.get(url, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    return response.data?.data || response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update a past project
 * @param {string|number} projectId - Project ID
 * @param {Object} data - Project data to update
 * @param {string} data.name - Project name
 * @param {string} data.address - Project address
 * @param {string} data.projectKey - Optional project key (if available)
 * @param {string|number} workspaceId - Optional workspace ID (if needed by API)
 * @returns {Promise<Object>} Updated project
 */
export const updatePastProject = async (projectId, data, workspaceId = null) => {
  if (!projectId) {
    throw new Error('Project ID is required');
  }

  if (!data.name || !data.address) {
    throw new Error('Project name and address are required');
  }

  const token = localStorage.getItem('token');
  
  // Build request body - include projectKey if available (similar to create API)
  // Backend requires 'files' to be an array (even if empty) - 'files is not iterable' error occurs otherwise
  const requestBody = {
    name: data.name,
    address: data.address,
    files: Array.isArray(data.files) ? data.files : [], // Always ensure files is an array
  };
  
  // Include projectKey if provided (backend might require it)
  if (data.projectKey) {
    requestBody.projectKey = data.projectKey;
  }
  
  // Include workspaceId if provided
  if (workspaceId) {
    requestBody.workspaceId = workspaceId;
  }
  
  // Try different endpoint patterns based on common API structures
  const endpointsToTry = [];
  
  // Pattern 1: PUT /my-past-work/update/:projectId (ID in URL) - Most common pattern
  endpointsToTry.push({
    url: `${config.API_BASE_URL}${PAST_PROJECT_ENDPOINTS_FLAT.PAST_PROJECT_UPDATE}/${projectId}`,
    body: requestBody,
  });
  
  // Pattern 2: PUT /my-past-work/update (ID in body)
  endpointsToTry.push({
    url: `${config.API_BASE_URL}${PAST_PROJECT_ENDPOINTS_FLAT.PAST_PROJECT_UPDATE}`,
    body: {
      id: projectId,
      ...requestBody,
    },
  });
  
  // Pattern 3: PUT /my-past-work/update/:workspaceId/:projectId (if workspaceId provided)
  if (workspaceId) {
    endpointsToTry.push({
      url: `${config.API_BASE_URL}${PAST_PROJECT_ENDPOINTS_FLAT.PAST_PROJECT_UPDATE}/${workspaceId}/${projectId}`,
      body: {
        name: data.name,
        address: data.address,
        files: Array.isArray(data.files) ? data.files : [], // Always ensure files is an array
        ...(data.projectKey && { projectKey: data.projectKey }),
      },
    });
  }

  let lastError = null;
  
  for (const endpoint of endpointsToTry) {
    try {
      // Ensure files is always a proper array (not undefined/null)
      const bodyToSend = {
        ...endpoint.body,
        files: Array.isArray(endpoint.body.files) ? endpoint.body.files : [],
      };
      
      const response = await axios.put(
        endpoint.url,
        bodyToSend,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      return response.data?.data || response.data;
    } catch (error) {
      lastError = error;
      
      // If 404, try next pattern
      if (error.response?.status === 404) {
        continue;
      }
      
      // If 500, endpoint exists but server error - extract detailed error message
      // Don't try other patterns for 500, throw immediately with detailed error
      if (error.response?.status === 500) {
        const errorData = error.response?.data;
        const errorMessage = 
          errorData?.message || 
          errorData?.error ||
          (typeof errorData === 'string' ? errorData : null) ||
          error.message ||
          'Server error occurred while updating project';
        
        // Create enhanced error with server message
        const enhancedError = new Error(errorMessage);
        enhancedError.response = error.response;
        enhancedError.config = error.config;
        enhancedError.status = 500;
        throw enhancedError;
      }
      
      // For other errors (400, 401, 403, etc.), throw immediately
      throw error;
    }
  }
  
  // If all patterns failed with 404, throw the last error
  if (lastError) {
    throw lastError;
  }
  
  throw new Error('Failed to update past project: No suitable endpoint found.');
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
    // Don't set Content-Type manually - axios will set it with the correct boundary for multipart/form-data
    const response = await axios.post(
      url,
      formData,
      {
        headers: {
          // Let axios set Content-Type with boundary automatically
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        timeout: 300000, // 5 minutes timeout for file uploads
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};


