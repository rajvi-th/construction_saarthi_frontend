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

      // Helper to extract URL from various media formats
      const getMediaUrl = (media) => {
        if (!media) return null;
        if (typeof media === 'string') return media;
        if (Array.isArray(media)) return typeof media[0] === 'string' ? media[0] : media[0]?.url;
        if (typeof media === 'object' && media.url) return media.url;
        return null;
      };

      // Transform API response to match component structure
      const transformedProjects = projectsList.map((project) => {
        const p = project.details || project;

        // Robustly extract profile photo URL
        const imageUrl = getMediaUrl(project.profilePhoto) ||
          getMediaUrl(project.profile_photo) ||
          getMediaUrl(project.media?.profilePhoto) ||
          getMediaUrl(p.profilePhoto) ||
          getMediaUrl(p.profile_photo) ||
          '';

        return {
          id: project.id || project.project_id,
          image: imageUrl,
          title: project.name || project.title || "Untitled Project",
          address: p.address || project.address || project.location || "",
          budget: p.estimatedBudget || project.budget || "₹0",
          balance: project.balance || "₹0",
          onClick: () => { },
        };
      });

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

