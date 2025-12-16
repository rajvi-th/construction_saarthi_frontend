/**
 * Custom hook for fetching and managing project details
 * @param {string|number} projectId - Project ID
 * @param {string|number} workspaceId - Workspace ID
 * @returns {Object} { project, isLoading, error, refetch }
 */

import { useState, useEffect, useCallback } from 'react';
import { getProjectDetails } from '../api';
import { showError } from '../../../utils/toast';

export const useProjectDetails = (projectId, workspaceId) => {
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to transform API response to component structure
  const transformProjectData = useCallback((projectData) => {
    const details = projectData?.details || {};

    // Helper function to extract profile photo URL
    const extractProfilePhotoUrl = (profilePhoto) => {
      if (!profilePhoto) return null;

      if (typeof profilePhoto === 'string') {
        return profilePhoto;
      }

      if (Array.isArray(profilePhoto) && profilePhoto.length > 0) {
        const firstItem = profilePhoto[0];
        if (typeof firstItem === 'string') {
          return firstItem;
        }
        if (typeof firstItem === 'object' && firstItem !== null) {
          return firstItem.url || null;
        }
      }

      if (typeof profilePhoto === 'object' && !Array.isArray(profilePhoto) && profilePhoto !== null) {
        return profilePhoto.url || null;
      }

      return null;
    };

    // Format total area with sq.ft
    const formatSize = (totalArea) => {
      if (!totalArea) return null;
      const area = typeof totalArea === 'number' ? totalArea : parseFloat(totalArea);
      return isNaN(area) ? null : `${area.toLocaleString('en-IN')} sq.ft`;
    };

    // Format number of floors
    const formatFloors = (numberOfFloors) => {
      if (!numberOfFloors) return null;
      const floors = typeof numberOfFloors === 'number' ? numberOfFloors : parseInt(numberOfFloors);
      return isNaN(floors) ? null : `G+${floors}`;
    };

    // Format estimated budget
    const formatBudget = (estimatedBudget) => {
      if (!estimatedBudget) return null;
      const budget = typeof estimatedBudget === 'number' ? estimatedBudget : parseFloat(estimatedBudget);
      if (isNaN(budget)) return null;

      // Format as currency
      if (budget >= 10000000) {
        return `₹${(budget / 10000000).toFixed(2)} Crore`;
      } else if (budget >= 100000) {
        return `₹${(budget / 100000).toFixed(2)} Lakhs`;
      } else {
        return `₹${budget.toLocaleString('en-IN')}`;
      }
    };

    // Extract profilePhoto from media array if available
    const mediaArray = projectData?.media || [];
    const profilePhotoFromMedia = mediaArray.find(
      (item) => item.typeName === 'profilePhoto' || item.typeId === '1' || item.typeId === 1
    );
    const profilePhotoUrl = profilePhotoFromMedia?.url || extractProfilePhotoUrl(projectData.profilePhoto);

    return {
      id: projectData.id || projectData.project_id,
      site_name: projectData.name || details.name || 'Untitled Project',
      name: projectData.name || details.name || 'Untitled Project',
      address: details.address || projectData.address || '',
      status: projectData.status || 'in_progress',
      progress: details.progress || projectData.progress || 0,
      completion_percentage: details.completion_percentage || projectData.completion_percentage || 0,
      profilePhoto: profilePhotoUrl, // Also add as profilePhoto for backward compatibility
      media: mediaArray, // Preserve media array
      builder_name: details.builderName || projectData.builder_name || '',
      contact_number: details.contactNumber || projectData.contact_number || '',
      builder_company: details.builderCompany || projectData.builder_company || '',
      start_date: details.startDate || projectData.start_date || null,
      completion_date: details.endDate || projectData.completion_date || null,
      size: formatSize(details.totalArea || projectData.totalArea || projectData.size),
      no_of_floors: formatFloors(details.numberOfFloors || projectData.numberOfFloors || projectData.no_of_floors),
      construction_type: details.constructionTypeName || projectData.construction_type || '',
      contract_type: details.contractTypeName || projectData.contract_type || '',
      estimated_budget: formatBudget(details.estimatedBudget || projectData.estimatedBudget),
      description: details.description || projectData.description || projectData.project_description || '',
      project_description: details.description || projectData.description || projectData.project_description || '',
      // Keep original data for reference
      originalData: projectData,
    };
  }, []);

  const fetchProjectDetails = useCallback(async () => {
    if (!projectId) {
      setIsLoading(false);
      return;
    }

    if (!workspaceId) {
      showError('Workspace not selected');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const projectData = await getProjectDetails(projectId, workspaceId);

      // Transform API response to match component structure
      const transformedProject = transformProjectData(projectData);

      setProject(transformedProject);
    } catch (err) {
      console.error('Error fetching project details:', err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to load project details. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
      setProject(null);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, workspaceId, transformProjectData]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  return {
    project,
    isLoading,
    error,
    refetch: fetchProjectDetails,
  };
};

export default useProjectDetails;

