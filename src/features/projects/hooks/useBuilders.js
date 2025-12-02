/**
 * Custom hook for fetching and managing builders
 * @param {string|number} workspaceId - Workspace ID
 * @returns {Object} { builders, isLoadingBuilders, error, refetch, createBuilder }
 */

import { useState, useEffect, useCallback } from 'react';
import { getAllBuilders, createBuilder as createBuilderApi } from '../api';
import { showError, showSuccess } from '../../../utils/toast';

export const useBuilders = (workspaceId) => {
  const [builders, setBuilders] = useState([]);
  const [isLoadingBuilders, setIsLoadingBuilders] = useState(false);
  const [error, setError] = useState(null);

  const fetchBuilders = useCallback(async () => {
    if (!workspaceId) {
      setBuilders([]);
      setIsLoadingBuilders(false);
      return;
    }

    try {
      setIsLoadingBuilders(true);
      setError(null);
      const buildersData = await getAllBuilders(workspaceId);

      // Transform builders to dropdown options format
      // API returns { builders: [{ id, full_name }] }
      const builderOptions = buildersData.map((builder) => ({
        value: builder.id?.toString() || builder.builderId?.toString() || builder._id?.toString(),
        label: builder.full_name || builder.name || builder.builderName || '',
      })).filter(builder => builder.label); // Filter out empty names

      setBuilders(builderOptions);
    } catch (err) {
      console.error('Error fetching builders:', err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to load builders';
      setError(errorMessage);
      showError(errorMessage);
      setBuilders([]);
    } finally {
      setIsLoadingBuilders(false);
    }
  }, [workspaceId]);

  const createBuilder = useCallback(async (builderData) => {
    if (!workspaceId) {
      showError('Workspace not selected');
      return null;
    }

    try {
      // Create builder via API with form data
      const response = await createBuilderApi({
        full_name: builderData.full_name || builderData.label,
        country_code: builderData.country_code || '+91',
        phone_number: builderData.phone_number || '',
        language: builderData.language || 'en',
        company_Name: builderData.company_Name || '',
        address: builderData.address || '',
        role: 'builder',
        workspace_id: builderData.workspace_id || workspaceId,
      });

      // Get the new builder ID from response
      const newBuilderId = response?.id?.toString() ||
        response?.data?.id?.toString() ||
        response?.builderId?.toString() ||
        builderData.value;

      // Add to builders list
      const newBuilder = {
        value: newBuilderId,
        label: builderData.full_name || builderData.label,
      };

      setBuilders((prev) => [...prev, newBuilder]);
      showSuccess('Builder added successfully');

      return newBuilder;
    } catch (err) {
      console.error('Error creating builder:', err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create builder';
      showError(errorMessage);
      throw err;
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchBuilders();
  }, [fetchBuilders]);

  return {
    builders,
    isLoadingBuilders,
    error,
    refetch: fetchBuilders,
    createBuilder,
  };
};

export default useBuilders;

