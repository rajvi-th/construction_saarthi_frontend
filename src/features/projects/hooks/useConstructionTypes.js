/**
 * Custom hook for fetching and managing construction types
 * @param {string|number} workspaceId - Workspace ID
 * @returns {Object} { constructionTypes, isLoadingConstructionTypes, error, refetch, createConstructionType }
 */

import { useState, useEffect, useCallback } from 'react';
import { getAllConstructionTypes, createConstructionType as createConstructionTypeApi } from '../api';
import { showError, showSuccess } from '../../../utils/toast';

export const useConstructionTypes = (workspaceId) => {
  const [constructionTypes, setConstructionTypes] = useState([]);
  const [isLoadingConstructionTypes, setIsLoadingConstructionTypes] = useState(false);
  const [error, setError] = useState(null);

  const fetchConstructionTypes = useCallback(async () => {
    if (!workspaceId) {
      setConstructionTypes([]);
      setIsLoadingConstructionTypes(false);
      return;
    }

    try {
      setIsLoadingConstructionTypes(true);
      setError(null);
      const constructionTypesData = await getAllConstructionTypes(workspaceId);

      // Transform to dropdown options format
      const constructionTypeOptions = constructionTypesData.map((type) => ({
        value: type.id?.toString() || type.constructionTypeId?.toString() || type._id?.toString(),
        label: type.name || type.constructionTypeName || '',
      })).filter(type => type.label); // Filter out empty names

      setConstructionTypes(constructionTypeOptions);
    } catch (err) {
      console.error('Error fetching construction types:', err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to load construction types';
      setError(errorMessage);
      showError(errorMessage);
      setConstructionTypes([]);
    } finally {
      setIsLoadingConstructionTypes(false);
    }
  }, [workspaceId]);

  const createConstructionType = useCallback(async (data) => {
    if (!workspaceId) {
      showError('Workspace not selected');
      throw new Error('Workspace not selected');
    }

    try {
      // Create construction type via API
      const response = await createConstructionTypeApi({
        workspaceId: workspaceId,
        name: data.label,
        requiresFloors: data.requiresFloors !== undefined ? data.requiresFloors : true,
      });

      // Refetch construction types to get the updated list with the new item
      await fetchConstructionTypes();

      // Get the new construction type ID from response
      const newConstructionTypeId = response?.id?.toString() ||
        response?.data?.id?.toString() ||
        response?.constructionTypeId?.toString() ||
        data.value;

      // Find the newly created construction type from the refetched list
      const newConstructionType = {
        value: newConstructionTypeId,
        label: data.label,
        requiresFloors: data.requiresFloors,
      };

      showSuccess('Construction type added successfully');

      return newConstructionType;
    } catch (err) {
      console.error('Error creating construction type:', err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create construction type';
      showError(errorMessage);
      throw err;
    }
  }, [workspaceId, fetchConstructionTypes]);

  useEffect(() => {
    fetchConstructionTypes();
  }, [fetchConstructionTypes]);

  return {
    constructionTypes,
    isLoadingConstructionTypes,
    error,
    refetch: fetchConstructionTypes,
    createConstructionType,
  };
};

export default useConstructionTypes;

