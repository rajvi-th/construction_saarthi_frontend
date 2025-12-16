/**
 * usePastProjects Hook
 * Basic scaffold – extend once API and UI requirements are final.
 */

import { useState, useCallback } from 'react';
import { getPastProjects } from '../api/pastProjectApi';
import { showError } from '../../../utils/toast';

export const usePastProjects = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPastProjects = useCallback(
    async (params = {}) => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Extract workspaceId and optional filters
        const { workspaceId, ...filters } = params;
        
        if (!workspaceId) {
          throw new Error('Workspace ID is required');
        }

        const response = await getPastProjects(workspaceId, filters);

        const data =
          Array.isArray(response) ?
            response :
            response?.data || response?.projects || [];

        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to load past projects.';
        setError(message);
        showError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    items,
    isLoading,
    error,
    fetchPastProjects,
  };
};

export default usePastProjects;


