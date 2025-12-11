import { useState, useCallback } from 'react';
import {
  getVendors,
  createVendor,
  updateVendor,
  deleteVendor,
} from '../api';
import { showError, showSuccess } from '../../../utils/toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';

/**
 * Custom hook for vendor operations
 * @returns {Object} Vendor operations with loading states
 */
export const useVendors = () => {
  const { t: tCommon } = useTranslation('common');
  const { t } = useTranslation('builderClient'); 
  const { selectedWorkspace } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Create a new vendor
   * @param {Object} formData - Vendor form data
   * @returns {Promise<Object>} Created vendor data
   */
  const createVendorData = useCallback(async (formData) => {
    try {
      setIsCreating(true);
      setError(null);

      const response = await createVendor(formData);

      showSuccess(
        tCommon('successMessages.created', {
          defaultValue: 'Vendor created successfully',
        })
      );

      return response;
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        t('errors.createBuilderFailed', { defaultValue: 'Failed to create vendor. Please try again.' });
      
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, [tCommon, t]);

  /**
   * Update an existing vendor
   * @param {string} id - Vendor ID
   * @param {Object} formData - Vendor form data
   * @returns {Promise<Object>} Updated vendor data
   */
  const updateVendorData = useCallback(async (id, formData) => {
    try {
      setIsUpdating(true);
      setError(null);

      const response = await updateVendor(id, formData);

      showSuccess(
        tCommon('successMessages.updated', {
          defaultValue: 'Vendor updated successfully',
        })
      );

      return response;
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        t('errors.updateBuilderFailed', { defaultValue: 'Failed to update vendor. Please try again.' });
      
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [tCommon, t]);

  /**
   * Get vendor by ID
   * Fetches vendors list for current workspace and finds matching vendor
   * @param {string|number} id - Vendor user ID
   * @returns {Promise<Object|null>} Vendor data
   */
  const getVendorData = useCallback(async (id) => {
    if (!selectedWorkspace) {
      const errorMessage = t('errors.workspaceRequired', { defaultValue: 'Workspace is required' });
      showError(errorMessage);
      throw new Error(errorMessage);
    }

    try {
      setIsLoading(true);
      setError(null);

      // Use unified vendors list endpoint and find by id
      const response = await getVendors(selectedWorkspace);
      const vendorsArray = Array.isArray(response?.users) ? response.users : [];

      const vendor =
        vendorsArray.find(
          (v) =>
            String(v.id) === String(id) ||
            String(v.user_id) === String(id)
        ) || null;

      return vendor;
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        t('errors.fetchBuilderFailed', { defaultValue: 'Failed to load vendor. Please try again.' });
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [t, selectedWorkspace]);

  /**
   * Get list of vendors
   * @param {string|number} workspaceId - Workspace ID
   * @returns {Promise<Array>} List of vendors
   */
  const getVendorsList = useCallback(async (workspaceId) => {
    if (!workspaceId) {
      return [];
    }
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await getVendors(workspaceId);
      
      const vendorsArray = Array.isArray(response?.users) ? response.users : [];
      
      return vendorsArray;
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        t('errors.fetchBuildersFailed', { defaultValue: 'Failed to load vendors. Please try again.' });
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  /**
   * Delete vendor
   * @param {string} id - Vendor ID
   * @returns {Promise<Object>} API response
   */
  const deleteVendorData = useCallback(async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await deleteVendor(id);
      
      showSuccess(
        tCommon('successMessages.deleted', {
          defaultValue: 'Vendor deleted successfully',
        })
      );

      return response;
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        t('errors.deleteBuilderFailed', { defaultValue: 'Failed to delete vendor. Please try again.' });
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [tCommon, t]);

  return {
    // Vendor operations
    createVendor: createVendorData,
    updateVendor: updateVendorData,
    getVendor: getVendorData,
    getVendors: getVendorsList,
    deleteVendor: deleteVendorData,
    
    // Loading states
    isCreating,
    isUpdating,
    isLoading,
    error,
  };
};

export default useVendors;

