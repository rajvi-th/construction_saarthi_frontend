/**
 * Custom hook for fetching and managing contract types
 * @param {string|number} workspaceId - Workspace ID
 * @returns {Object} { contractTypes, isLoadingContractTypes, error, refetch, createContractType }
 */

import { useState, useEffect, useCallback } from 'react';
import { getAllContractTypes, createContractType as createContractTypeApi } from '../api';
import { showError, showSuccess } from '../../../utils/toast';

export const useContractTypes = (workspaceId) => {
  const [contractTypes, setContractTypes] = useState([]);
  const [isLoadingContractTypes, setIsLoadingContractTypes] = useState(false);
  const [error, setError] = useState(null);

  const fetchContractTypes = useCallback(async () => {
    if (!workspaceId) {
      setContractTypes([]);
      setIsLoadingContractTypes(false);
      return;
    }

    try {
      setIsLoadingContractTypes(true);
      setError(null);
      const contractTypesData = await getAllContractTypes(workspaceId);

      // Transform to dropdown options format
      const contractTypeOptions = contractTypesData.map((type) => ({
        value: type.id?.toString() || type.contractTypeId?.toString() || type._id?.toString(),
        label: type.name || type.contractTypeName || '',
      })).filter(type => type.label); // Filter out empty names

      setContractTypes(contractTypeOptions);
    } catch (err) {
      console.error('Error fetching contract types:', err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to load contract types';
      setError(errorMessage);
      showError(errorMessage);
      setContractTypes([]);
    } finally {
      setIsLoadingContractTypes(false);
    }
  }, [workspaceId]);

  const createContractType = useCallback(async (data) => {
    try {
      // Create contract type via API
      const response = await createContractTypeApi({
        name: data.label,
      });

      // Get the new contract type ID from response
      const newContractTypeId = response?.id?.toString() ||
        response?.data?.id?.toString() ||
        response?.contractTypeId?.toString() ||
        data.value;

      // Add to contract types list
      const newContractType = {
        value: newContractTypeId,
        label: data.label,
      };

      setContractTypes((prev) => {
        // Check if it already exists
        const exists = prev.some((type) => type.label.toLowerCase() === data.label.toLowerCase());
        if (exists) {
          return prev;
        }
        return [...prev, newContractType];
      });

      showSuccess('Contract type added successfully');

      return newContractType;
    } catch (err) {
      console.error('Error creating contract type:', err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create contract type';
      showError(errorMessage);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchContractTypes();
  }, [fetchContractTypes]);

  return {
    contractTypes,
    isLoadingContractTypes,
    error,
    refetch: fetchContractTypes,
    createContractType,
  };
};

export default useContractTypes;

