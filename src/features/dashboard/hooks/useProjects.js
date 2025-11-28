import { useState, useEffect, useCallback } from 'react';
import { getProjects } from '../api';
import { showError } from '../../../utils/toast';

/**
 * Custom hook for fetching and managing projects
 * @param {string|number} workspaceId - The ID of the selected workspace
 * @returns {Object} { projects, isLoadingProjects, error, refetch }
 */
export const useProjects = (workspaceId) => {
  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    if (!workspaceId) {
      setProjects([]);
      setIsLoadingProjects(false);
      setError(null);
      return;
    }

    try {
      setIsLoadingProjects(true);
      setError(null);
      const response = await getProjects(workspaceId);

      // Handle different response structures
      const projectsData = response?.data || response?.projects || response || [];
      const projectsList = Array.isArray(projectsData) ? projectsData : [];

      // Transform API response to match component structure
      const transformedProjects = projectsList.map((project) => ({
        id: project.id || project.project_id,

        // Use profilePhoto as main image
        image:
          project.profilePhoto?.[0] ||
          project.document?.[0] ||
          project.image ||
          project.image_url ||
          project.photo ||
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",

        title: project.name || project.title || "Untitled Project",

        // Use project.details.address if present
        address:
          project.details?.address ||
          project.address ||
          project.location ||
          "",

        // Budget & balance
        budget:
          project.details?.estimatedBudget ||
          project.budget ||
          "₹0",

        balance: project.balance || "₹0",

        onClick: () => { },
      }));

      setProjects(transformedProjects);
    } catch (err) {
      console.error('Error fetching projects:', err);
      const errorMessage = err?.response?.data?.message ||
        err?.message ||
        'Failed to load projects';
      setError(errorMessage);
      showError(errorMessage);
      setProjects([]);
    } finally {
      setIsLoadingProjects(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    isLoadingProjects,
    error,
    refetch: fetchProjects,
  };
};

export default useProjects;

