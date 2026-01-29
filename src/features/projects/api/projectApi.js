/**
 * Projects API
 * API calls for projects feature
 */

import http from '../../../services/http';
import axios from 'axios';
import config from '../../../config';
import { PROJECT_ENDPOINTS_FLAT } from '../constants/projectEndpoints';

/**
 * Get all projects for a workspace
 * @param {string|number} workspaceId - Workspace ID
 * @returns {Promise<Array>} List of projects
 */
export const getAllProjects = async (workspaceId) => {
  if (!workspaceId) {
    throw new Error('Workspace ID is required');
  }

  const response = await http.get(`${PROJECT_ENDPOINTS_FLAT.PROJECT_LIST}/${workspaceId}`);

  // Handle response structure - projects can be in different formats
  let projectsData = response?.projects || response?.data?.projects || response?.data || response || {};

  // If projects is an object (key-value pairs), convert to array and preserve IDs
  if (projectsData && typeof projectsData === 'object' && !Array.isArray(projectsData)) {
    projectsData = Object.entries(projectsData).map(([key, value]) => {
      // Extract ID from key if it's in format "project:id"
      const extractedId = key.startsWith('project:')
        ? key.replace('project:', '')
        : key;

      // Merge the extracted ID with the project data
      return {
        ...value,
        id: value.id || extractedId,
        project_id: value.project_id || extractedId,
        _key: key, // Preserve original key for reference
      };
    });
  }

  // Ensure it's an array
  return Array.isArray(projectsData) ? projectsData : [];
};

/**
 * Get project details by project ID
 * @param {string|number} projectId - Project ID
 * @param {string|number} workspaceId - Workspace ID (optional, for filtering)
 * @returns {Promise<Object>} Project details
 */
export const getProjectDetails = async (projectId, workspaceId = null) => {
  if (!projectId) {
    throw new Error('Project ID is required');
  }

  try {
    // Try to fetch from details endpoint first
    const response = await http.get(`${PROJECT_ENDPOINTS_FLAT.PROJECT_DETAILS}/${projectId}`);

    const projectData = response?.project || response?.data?.project || response?.data || response || null;

    if (projectData) {
      return projectData;
    }

    // If details endpoint doesn't return data, fetch all projects and filter
    if (workspaceId) {
      const allProjects = await getAllProjects(workspaceId);
      const project = allProjects.find(p =>
        p.id?.toString() === projectId.toString() ||
        p.project_id?.toString() === projectId.toString()
      );

      if (project) {
        return project;
      }
    }

    throw new Error('Project not found');
  } catch (error) {
    // If details endpoint fails and workspaceId is provided, try fetching all and filtering
    if (workspaceId && error?.response?.status === 404) {
      const allProjects = await getAllProjects(workspaceId);
      const project = allProjects.find(p =>
        p.id?.toString() === projectId.toString() ||
        p.project_id?.toString() === projectId.toString()
      );

      if (project) {
        return project;
      }
    }

    throw error;
  }
};

/**
 * Get all builders for a workspace
 * @param {string|number} workspaceId - Workspace ID
 * @returns {Promise<Array>} List of builders
 */
export const getAllBuilders = async (workspaceId) => {
  if (!workspaceId) {
    throw new Error('Workspace ID is required');
  }

  const response = await http.get(`${PROJECT_ENDPOINTS_FLAT.BUILDER_LIST}?workspace_id=${workspaceId}`);

  // Handle response structure - API returns { builders: [...] }
  const buildersData = response?.builders || response?.data?.builders || response?.data || response || [];

  // Ensure it's an array
  return Array.isArray(buildersData) ? buildersData : [];
};

/**
 * Create a new builder
 * @param {Object} data - Builder data
 * @param {string} data.full_name - Builder full name
 * @param {string} data.country_code - Country code (e.g., "+91")
 * @param {string} data.phone_number - Phone number
 * @param {string} data.language - Language code (e.g., "en")
 * @param {string} [data.company_Name] - Company name (optional)
 * @param {string} [data.address] - Address (optional)
 * @param {string} data.role - Role (default: "builder")
 * @param {string|number} data.workspace_id - Workspace ID
 * @returns {Promise<Object>} Created builder
 */
export const createBuilder = async (data) => {
  if (!data.full_name || !data.full_name.trim()) {
    throw new Error('Builder full name is required');
  }

  if (!data.workspace_id) {
    throw new Error('Workspace ID is required');
  }

  const requestBody = {
    full_name: data.full_name.trim(),
    country_code: data.country_code || '+91',
    phone_number: data.phone_number || '',
    language: data.language || 'en',
    company_Name: data.company_Name || '',
    address: data.address || '',
    role: data.role || 'builder',
    workspace_id: data.workspace_id,
  };

  const response = await http.post(PROJECT_ENDPOINTS_FLAT.BUILDER_CREATE, requestBody);

  return response?.data || response || {};
};

/**
 * Start a project to get projectKey for media upload
 * @param {string|number} workspaceId - Workspace ID
 * @returns {Promise<Object>} Response with projectKey
 */
export const startProject = async (workspaceId) => {
  if (!workspaceId) {
    throw new Error('Workspace ID is required');
  }

  const response = await http.post(`${PROJECT_ENDPOINTS_FLAT.PROJECT_START}/${workspaceId}`);

  return response?.data || response || {};
};

/**
 * Upload media files using projectKey
 * @param {string} projectKey - Project key from startProject
 * @param {Object} files - Object with keys as media types and values as file arrays
 * @param {Array} [files.profilePhoto] - Profile photo files
 * @param {Array} [files.video] - Video files
 * @param {Array} [files.media] - Media/document files
 * @returns {Promise<Object>} Upload response
 */
export const uploadMedia = async (projectKey, files) => {
  if (!projectKey) {
    throw new Error('Project key is required');
  }

  const formData = new FormData();

  // Add projectKey to formData
  formData.append('projectKey', projectKey);

  // Add files by key (media type)
  Object.entries(files).forEach(([key, fileArray]) => {
    // Skip if empty
    if (!fileArray || (Array.isArray(fileArray) && fileArray.length === 0)) {
      return;
    }

    if (Array.isArray(fileArray) && fileArray.length > 0) {
      fileArray.forEach((file, index) => {
        // If file is a File object, append it
        if (file instanceof File) {
          formData.append(key, file);
        } else if (file && file.file && file.file instanceof File) {
          // If file is wrapped in an object with .file property
          formData.append(key, file.file);
        }
      });
    } else if (fileArray instanceof File) {
      // Single file
      formData.append(key, fileArray);
    } else if (fileArray && fileArray.file && fileArray.file instanceof File) {
      // Single file wrapped in object
      formData.append(key, fileArray.file);
    }
  });

  // Use axios directly with FormData (bypass http service to set Content-Type correctly)
  const token = localStorage.getItem('token');

  try {
    const response = await axios.post(
      `${config.API_BASE_URL}${PROJECT_ENDPOINTS_FLAT.PROJECT_UPLOAD}`,
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
    throw error;
  }
};

/**
 * Create a new project
 * @param {Object} data - Project data
 * @param {string|number} data.workspaceId - Workspace ID (will be used in URL path)
 * @param {string} data.projectKey - Project key from startProject
 * @param {string} data.name - Project name
 * @param {string} data.status - Project status
 * @param {string} data.address - Project address
 * @param {number} data.builderId - Builder ID
 * @param {string} data.startDate - Start date (YYYY-MM-DD)
 * @param {string} data.endDate - End date (YYYY-MM-DD)
 * @param {string} data.totalArea - Total area
 * @param {number} data.gaugeTypeId - Gauge type ID (1 for sqft, 2 for meter)
 * @param {string} data.perUnitRate - Per unit rate
 * @param {string} data.numberOfFloors - Number of floors
 * @param {number} data.contractTypeId - Contract type ID
 * @param {number} data.constructionTypeId - Construction type ID
 * @param {string} data.description - Project description
 * @param {string} data.estimatedBudget - Estimated budget
 * @returns {Promise<Object>} Created project
 */
export const createProject = async (data) => {
  if (!data.workspaceId) {
    throw new Error('Workspace ID is required');
  }

  if (!data.projectKey) {
    throw new Error('Project key is required');
  }

  if (!data.name || !data.name.trim()) {
    throw new Error('Project name is required');
  }

  const requestBody = {
    projectKey: data.projectKey,
    name: data.name.trim(),
    status: data.status || 'pending',
    address: data.address || '',
    builderId: data.builderId ? Number(data.builderId) : null,
    startDate: data.startDate || null,
    endDate: data.endDate || null,
    totalArea: data.totalArea ? String(data.totalArea) : null,
    gaugeTypeId: data.gaugeTypeId ? Number(data.gaugeTypeId) : null,
    perUnitRate: data.perUnitRate ? String(data.perUnitRate) : null,
    numberOfFloors: data.numberOfFloors ? String(data.numberOfFloors) : null,
    contractTypeId: data.contractTypeId ? Number(data.contractTypeId) : null,
    constructionTypeId: data.constructionTypeId ? Number(data.constructionTypeId) : null,
    description: data.description || '',
    estimatedBudget: data.estimatedBudget ? String(data.estimatedBudget) : null,
  };

  // Include workspaceId in the URL path: /project/create/{workspaceId}
  const response = await http.post(
    `${PROJECT_ENDPOINTS_FLAT.PROJECT_CREATE}/${data.workspaceId}`,
    requestBody
  );

  return response?.data || response || {};
};

/**
 * Get all construction types for a workspace
 * @param {string|number} workspaceId - Workspace ID
 * @returns {Promise<Array>} List of construction types
 */
export const getAllConstructionTypes = async (workspaceId) => {
  if (!workspaceId) {
    throw new Error('Workspace ID is required');
  }

  const response = await http.get(`${PROJECT_ENDPOINTS_FLAT.CONSTRUCTION_LIST}/${workspaceId}`);

  // Handle response structure - API returns { constructions: [...] }
  // http service already returns response.data, so response is the data object
  const constructionTypesData =
    response?.constructions ||
    response?.data?.constructions ||
    response?.constructionTypes ||
    response?.construction ||
    (Array.isArray(response) ? response : response?.data) ||
    [];

  // Ensure it's an array
  return Array.isArray(constructionTypesData) ? constructionTypesData : [];
};

/**
 * Create a new construction type
 * @param {Object} data - Construction type data
 * @param {string|number} data.workspaceId - Workspace ID (required)
 * @param {string} data.name - Construction type name
 * @param {boolean} [data.requiresFloors] - Whether this type requires floors (optional, not in API)
 * @returns {Promise<Object>} Created construction type
 */
export const createConstructionType = async (data) => {
  if (!data.name || !data.name.trim()) {
    throw new Error('Construction type name is required');
  }

  if (!data.workspaceId) {
    throw new Error('Workspace ID is required');
  }

  const requestBody = {
    name: data.name.trim(),
    workspace_id: Number(data.workspaceId),
  };

  const response = await http.post(PROJECT_ENDPOINTS_FLAT.CONSTRUCTION_CREATE, requestBody);

  return response?.data || response || {};
};

/**
 * Edit/Update an existing project
 * @param {string|number} projectId - Project ID
 * @param {Object} data - Project data
 * @param {string} data.name - Project name
 * @param {string} data.status - Project status (pending, in_progress, completed)
 * @param {number} data.builderId - Builder ID
 * @param {string} data.description - Project description
 * @param {number} data.gaugeTypeId - Gauge type ID (1 for sqft, 2 for meter)
 * @param {number} data.constructionTypeId - Construction type ID
 * @param {number} data.contractTypeId - Contract type ID
 * @param {string} data.startDate - Start date (YYYY-MM-DD)
 * @param {string} data.endDate - End date (YYYY-MM-DD)
 * @param {string} data.perUnitRate - Per unit rate
 * @param {string} data.totalArea - Total area
 * @param {string} data.numberOfFloors - Number of floors
 * @param {string} data.estimatedBudget - Estimated budget
 * @param {string} data.address - Project address
 * @param {File} [data.profilePhoto] - Profile photo file
 * @param {File|File[]} [data.media] - Media files (videos/photos)
 * @returns {Promise<Object>} Updated project
 */
export const editProject = async (projectId, data) => {
  if (!projectId) {
    throw new Error('Project ID is required');
  }

  if (!data.name || !data.name.trim()) {
    throw new Error('Project name is required');
  }

  const formData = new FormData();

  // Append text fields - always send required fields, send optional fields only if they have values
  formData.append('name', data.name.trim());
  formData.append('status', data.status || 'pending');
  if (data.builderId) formData.append('builderId', String(data.builderId));
  if (data.description !== null && data.description !== undefined) {
    formData.append('description', data.description || '');
  }
  if (data.gaugeTypeId) formData.append('gaugeTypeId', String(data.gaugeTypeId));
  if (data.constructionTypeId) formData.append('constructionTypeId', String(data.constructionTypeId));
  if (data.contractTypeId) formData.append('contractTypeId', String(data.contractTypeId));
  if (data.startDate) formData.append('startDate', data.startDate);
  if (data.endDate) formData.append('endDate', data.endDate);
  if (data.perUnitRate !== null && data.perUnitRate !== undefined) {
    formData.append('perUnitRate', String(data.perUnitRate || ''));
  }
  if (data.totalArea !== null && data.totalArea !== undefined) {
    formData.append('totalArea', String(data.totalArea || ''));
  }
  if (data.numberOfFloors !== null && data.numberOfFloors !== undefined) {
    formData.append('numberOfFloors', String(data.numberOfFloors || ''));
  }
  if (data.estimatedBudget !== null && data.estimatedBudget !== undefined) {
    formData.append('estimatedBudget', String(data.estimatedBudget || ''));
  }
  if (data.address !== null && data.address !== undefined) {
    formData.append('address', data.address || '');
  }

  // Append files
  if (data.profilePhoto instanceof File) {
    formData.append('profilePhoto', data.profilePhoto);
  }

  // Handle media files
  // keepMediaIds: Existing file IDs to keep (JSON array)
  // media: New File objects to upload
  if (data.keepMediaIds && Array.isArray(data.keepMediaIds)) {
    formData.append('keepMediaIds', JSON.stringify(data.keepMediaIds));
  }

  if (data.media) {
    if (Array.isArray(data.media)) {
      data.media.forEach((item) => {
        if (item instanceof File) {
          formData.append('media', item);
        }
      });
    } else if (data.media instanceof File) {
      formData.append('media', data.media);
    }
  }

  // Use axios directly with FormData (similar to uploadMedia)
  const token = localStorage.getItem('token');

  try {
    const response = await axios.put(
      `${config.API_BASE_URL}${PROJECT_ENDPOINTS_FLAT.PROJECT_UPDATE}/${projectId}`,
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
    throw error;
  }
};

/**
 * Delete a project
 * @param {string|number} projectId - Project ID
 * @returns {Promise<Object>} Delete response
 */
export const deleteProject = async (projectId) => {
  if (!projectId) {
    throw new Error('Project ID is required');
  }

  // Based on Postman request: DELETE /api/project/{id}
  const response = await http.delete(`${PROJECT_ENDPOINTS_FLAT.PROJECT_LIST}/${projectId}`);

  return response?.data || response || {};
};

/**
 * Get all contract types for a workspace
 * @param {string|number} workspaceId - Workspace ID
 * @returns {Promise<Array>} List of contract types
 */
export const getAllContractTypes = async (workspaceId) => {
  if (!workspaceId) {
    throw new Error('Workspace ID is required');
  }

  const response = await http.get(`${PROJECT_ENDPOINTS_FLAT.CONTRACT_TYPE_LIST}/${workspaceId}`);

  // Handle response structure - API might return { contractTypes: [...] } or { contract_types: [...] }
  // http service already returns response.data, so response is the data object
  const contractTypesData =
    response?.contractTypes ||
    response?.contract_types ||
    response?.data?.contractTypes ||
    response?.data?.contract_types ||
    response?.contract_type ||
    (Array.isArray(response) ? response : response?.data) ||
    [];

  // Ensure it's an array
  return Array.isArray(contractTypesData) ? contractTypesData : [];
};

/**
 * Create a new contract type
 * @param {Object} data - Contract type data
 * @param {string|number} data.workspaceId - Workspace ID (required)
 * @param {string} data.name - Contract type name
 * @returns {Promise<Object>} Created contract type
 */
export const createContractType = async (data) => {
  if (!data.name || !data.name.trim()) {
    throw new Error('Contract type name is required');
  }

  if (!data.workspaceId) {
    throw new Error('Workspace ID is required');
  }

  const requestBody = {
    name: data.name.trim(),
    workspace_id: Number(data.workspaceId),
  };

  const response = await http.post(PROJECT_ENDPOINTS_FLAT.CONTRACT_TYPE_CREATE, requestBody);

  return response?.data || response || {};
};

/**
 * Update project status
 * @param {string|number} projectId - Project ID
 * @param {string} status - New status (e.g. 'completed', 'in_progress', 'upcoming')
 * @returns {Promise<Object>} Update response
 */
/**
 * Update project status
 * @param {string|number} projectId - Project ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Update response
 */
/**
 * Update project status
 * @param {string|number} projectId - Project ID
 * @param {string} status - New status
 * @param {Object} [currentProject] - Current project object (required for fallback to edit endpoint)
 * @returns {Promise<Object>} Update response
 */
export const updateProjectStatus = async (projectId, status, currentProject = null) => {
  if (!projectId) {
    throw new Error('Project ID is required');
  }

  // PATCH /api/project/update-status/{id} is getting blocked by CORS.
  // We try to fallback to the generic edit project endpoint (PUT) which is allowed.
  // To do this, we need the project name, so we use currentProject if available.

  // Map form status to API status - consistently with hooks
  const mapStatus = (s) => {
    if (s === "upcoming") return "pending";
    return s || "pending";
  };

  const apiStatus = mapStatus(status);

  if (currentProject && currentProject.name) {
    return editProject(projectId, {
      ...currentProject,
      status: apiStatus
    });
  }

  // If we don't have project data, we force a fetch first
  try {
    const project = await getProjectDetails(projectId);
    return editProject(projectId, {
      ...project,
      status: apiStatus
    });
  } catch (error) {
    console.warn("Fallback to edit failed, attempting PATCH as last resort");
    // Last resort: try the PATCH endpoint even if it might fail CORS or 404
    const response = await http.patch(
      `/project/update-status/${projectId}`,
      { status: apiStatus }
    );
    return response?.data || response || {};
  }
};

/**
 * Get project prompt (AI insights/calculations)
 * @param {string|number} projectId - Project ID
 * @param {string} [feature='construction_cost'] - Feature name
 * @returns {Promise<Object>} Prompt response
 */
export const getProjectPrompt = async (projectId, feature = 'construction_cost') => {
  if (!projectId) {
    throw new Error('Project ID is required');
  }

  try {
    const response = await http.get(`${PROJECT_ENDPOINTS_FLAT.PROJECT_PROMPT}/${projectId}?feature=${feature}`);
    return response?.data || response || {};
  } catch (error) {
    console.error('Error fetching project prompt:', error);
    // Don't throw as this is often a background task
    return { success: false, error: error.message };
  }
};

/**
 * Calculate project (AI based calculations)
 * @param {Object} data - Calculation request data
 * @returns {Promise<Object>} Calculation results
 */
export const calculateProject = async (data) => {
  const response = await http.post(PROJECT_ENDPOINTS_FLAT.PROJECT_CALCULATE, data);
  return response?.data || response || {};
};

/**
 * Get project documents
 * @param {string|number} projectId - Project ID
 * @returns {Promise<Array>} List of documents
 */
export const getProjectDocuments = async (projectId) => {
  if (!projectId) {
    throw new Error('Project ID is required');
  }

  const response = await http.get(`${PROJECT_ENDPOINTS_FLAT.PROJECT_DOCUMENTS}/${projectId}`);

  // Handle response structure
  return response?.documents || response?.data?.documents || response?.data || response || [];
};

/**
 * Get project document details
 * @param {string|number} projectId - Project ID
 * @param {string|number} documentId - Document ID
 * @returns {Promise<Object>} Document details
 */
export const getProjectDocumentDetails = async (projectId, documentId) => {
  if (!projectId || !documentId) {
    throw new Error('Project ID and Document ID are required');
  }

  const response = await http.get(`${PROJECT_ENDPOINTS_FLAT.PROJECT_DOCUMENT_DETAILS}/${projectId}/${documentId}`);

  return response?.document || response?.data?.document || response?.data || response || null;
};
/**
 * Get calculation history
 * @returns {Promise<Array>} List of calculation history items
 */
export const getCalculationHistory = async () => {
  try {
    const response = await http.get(PROJECT_ENDPOINTS_FLAT.PROJECT_CALCULATION_HISTORY);
    // Handle various response formats
    const data = response?.data || response?.history || response?.calculations || response;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching calculation history:', error);
    throw error;
  }
};

/**
 * Get calculation details by ID
 * @param {string|number} calculationId - Calculation ID
 * @returns {Promise<Object>} Calculation details
 */
export const getCalculationDetails = async (calculationId) => {
  if (!calculationId) {
    throw new Error('Calculation ID is required');
  }

  try {
    const response = await http.get(`${PROJECT_ENDPOINTS_FLAT.PROJECT_CALCULATION_DETAILS}/${calculationId}`);
    return response?.data || response || {};
  } catch (error) {
    console.error('Error fetching calculation details:', error);
    throw error;
  }
};
