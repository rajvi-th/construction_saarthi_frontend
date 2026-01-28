/**
 * Custom hook for fetching projects for Notes feature
 * @param {string|number} workspaceId - The ID of the selected workspace
 * @returns {Object} { projects, isLoading, error, refetch }
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getNotesProjects } from '../api/notesApi';
import { showError } from '../../../utils/toast';

export const useNotesProjects = (workspaceId) => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const isFetchingRef = useRef(false);
  const lastWorkspaceIdRef = useRef(null);

  const fetchProjects = useCallback(async (forceRefetch = false) => {
    if (!workspaceId) {
      setProjects([]);
      setIsLoading(false);
      setError(null);
      lastWorkspaceIdRef.current = null;
      isFetchingRef.current = false;
      return;
    }

    // Prevent duplicate calls (unless forced)
    if (isFetchingRef.current && !forceRefetch) {
      return;
    }

    // Check if workspaceId changed - if same ID and not forced, skip
    const currentWorkspaceId = workspaceId;
    if (!forceRefetch && lastWorkspaceIdRef.current === currentWorkspaceId && lastWorkspaceIdRef.current !== null) {
      return;
    }

    try {
      isFetchingRef.current = true;
      lastWorkspaceIdRef.current = currentWorkspaceId;
      setIsLoading(true);
      setError(null);
      const response = await getNotesProjects(currentWorkspaceId);

      // Handle different response structures
      const projectsData = response?.data || response?.projects || response || [];
      const projectsList = Array.isArray(projectsData) ? projectsData : [];

      // Transform API response to match component structure
      const transformedProjects = projectsList.map((project) => {
        const details = project.details || {};

        // Format budget
        let budgetFormatted = '₹0';
        const budgetValue = details.estimatedBudget || project.estimatedBudget || project.budget;
        if (budgetValue) {
          if (typeof budgetValue === 'string') {
            budgetFormatted = budgetValue;
          } else if (typeof budgetValue === 'number') {
            if (budgetValue >= 10000000) {
              budgetFormatted = `₹${(budgetValue / 10000000).toFixed(1)}Cr`;
            } else if (budgetValue >= 100000) {
              budgetFormatted = `₹${(budgetValue / 100000).toFixed(1)}L`;
            } else {
              budgetFormatted = `₹${budgetValue.toLocaleString()}`;
            }
          }
        }

        // Format balance
        let balanceFormatted = '₹0';
        const balanceValue = project.balance || details.balance;
        if (balanceValue) {
          if (typeof balanceValue === 'string') {
            balanceFormatted = balanceValue;
          } else if (typeof balanceValue === 'number') {
            if (balanceValue >= 100000) {
              balanceFormatted = `₹${(balanceValue / 100000).toFixed(1)}L`;
            } else {
              balanceFormatted = `₹${balanceValue.toLocaleString()}`;
            }
          }
        }

        // Get image URL - only return if API provides valid image
        const getImageUrl = () => {
          const getMediaUrl = (media) => {
            if (!media) return null;
            if (typeof media === 'string') return media;
            if (Array.isArray(media)) return typeof media[0] === 'string' ? media[0] : media[0]?.url;
            if (typeof media === 'object' && media.url) return media.url;
            return null;
          };

          return (
            getMediaUrl(project.profilePhoto) ||
            getMediaUrl(project.profile_photo) ||
            getMediaUrl(project.media?.profilePhoto) ||
            getMediaUrl(project.media?.profile_photo) ||
            getMediaUrl(details.profilePhoto) ||
            getMediaUrl(details.profile_photo) ||
            getMediaUrl(project.image) ||
            null
          );
        };

        return {
          id: project.id || project.project_id,
          name: project.name || details.name || 'Untitled Project',
          address: details.address || project.address || project.location || '',
          budget: budgetFormatted,
          balance: balanceFormatted,
          image: getImageUrl(),
        };
      });

      setProjects(transformedProjects);
    } catch (err) {
      console.error('Error fetching projects for notes:', err);
      const errorMessage = err?.response?.data?.message ||
        err?.message ||
        'Failed to load projects';
      setError(errorMessage);
      showError(errorMessage);
      setProjects([]);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [workspaceId]);

  useEffect(() => {
    // Reset refs when workspaceId changes
    if (lastWorkspaceIdRef.current !== workspaceId) {
      isFetchingRef.current = false;
    }
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]); // Only depend on workspaceId to avoid unnecessary re-fetches

  const refetch = useCallback(() => {
    return fetchProjects(true); // Force refetch
  }, [fetchProjects]);

  return {
    projects,
    isLoading,
    error,
    refetch,
  };
};

export default useNotesProjects;

