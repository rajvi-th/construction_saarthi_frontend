/**
 * Custom hook for fetching and managing inventory types
 * @returns {Object} { inventoryTypes, inventoryTypeOptions, isLoading, error, refetch }
 */

import { useState, useEffect, useCallback } from 'react';
import { getInventoryTypes } from '../api/siteInventoryApi';
import { showError } from '../../../utils/toast';

export const useInventoryTypes = () => {
  const [inventoryTypes, setInventoryTypes] = useState([]);
  const [inventoryTypeOptions, setInventoryTypeOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInventoryTypes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const typesData = await getInventoryTypes();
      
      // Transform to options format for dropdowns
      const options = typesData.map((type) => ({
        value: type.id?.toString() || type.inventoryTypeId?.toString() || type._id?.toString(),
        label: type.name || type.typeName || type.label || '',
        inventoryTypeId: type.id || type.inventoryTypeId || type._id,
        originalData: type,
      })).filter(type => type.label); // Filter out empty labels
      
      setInventoryTypes(typesData);
      setInventoryTypeOptions(options);
    } catch (err) {
      console.error('Error fetching inventory types:', err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to load inventory types';
      setError(errorMessage);
      showError(errorMessage);
      setInventoryTypes([]);
      setInventoryTypeOptions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventoryTypes();
  }, [fetchInventoryTypes]);

  return {
    inventoryTypes,
    inventoryTypeOptions,
    isLoading,
    error,
    refetch: fetchInventoryTypes,
  };
};

export default useInventoryTypes;

