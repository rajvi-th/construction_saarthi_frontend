import { useState, useCallback } from 'react';
import { 
  createBuilder, 
  updateBuilder, 
  getBuilder, 
  deleteBuilder,
  getBuilders,
} from '../api';
import { showError, showSuccess } from '../../../utils/toast';
import { useTranslation } from 'react-i18next';

/**
 * Custom hook for builder and client operations
 * @returns {Object} Builder and client operations with loading states
 */
export const useBuilderClient = () => {
  const { t: tCommon } = useTranslation('common');
  const { t } = useTranslation('builderClient');
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Create a new builder
   * @param {Object} formData - Builder form data
   * @returns {Promise<Object>} Created builder data
   */
  const createBuilderData = useCallback(async (formData) => {
    try {
      setIsCreating(true);
      setError(null);

      const response = await createBuilder(formData);

      showSuccess(
        tCommon('successMessages.created', {
          defaultValue: 'Builder created successfully',
        })
      );

      return response;
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        t('errors.createBuilderFailed', { defaultValue: 'Failed to create builder. Please try again.' });
      
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, [tCommon, t]);

  /**
   * Update an existing builder
   * @param {string} id - Builder ID
   * @param {Object} formData - Builder form data
   * @returns {Promise<Object>} Updated builder data
   */
  const updateBuilderData = useCallback(async (id, formData) => {
    try {
      setIsUpdating(true);
      setError(null);

      const response = await updateBuilder(id, formData);

      showSuccess(
        tCommon('successMessages.updated', {
          defaultValue: 'Builder updated successfully',
        })
      );

      return response;
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        t('errors.updateBuilderFailed', { defaultValue: 'Failed to update builder. Please try again.' });
      
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [tCommon, t]);

  /**
   * Get builder by ID
   * @param {string} id - Builder ID
   * @returns {Promise<Object>} Builder data
   */
  const getBuilderData = useCallback(async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getBuilder(id);
      
      let responseData = null;
      
      if (response?.success && response?.data) {
        responseData = response.data;
      } else if (response?.data) {
        responseData = response.data;
      } else if (response && typeof response === 'object') {
        responseData = response;
      }
      
      return responseData;
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        t('errors.fetchBuilderFailed', { defaultValue: 'Failed to load builder. Please try again.' });
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  /**
   * Get list of builders
   * @param {string|number} workspaceId - Workspace ID
   * @returns {Promise<Array>} List of builders
   */
  const getBuildersList = useCallback(async (workspaceId) => {
    if (!workspaceId) {
      return [];
    }
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await getBuilders(workspaceId);
      
      const buildersArray = Array.isArray(response?.users) ? response.users : [];
      
      return buildersArray;
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        t('errors.fetchBuildersFailed', { defaultValue: 'Failed to load builders. Please try again.' });
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  /**
   * Delete builder
   * @param {string} id - Builder ID
   * @returns {Promise<Object>} API response
   */
  const deleteBuilderData = useCallback(async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await deleteBuilder(id);
      
      showSuccess(
        tCommon('successMessages.deleted', {
          defaultValue: 'Builder deleted successfully',
        })
      );

      return response;
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        t('errors.deleteBuilderFailed', { defaultValue: 'Failed to delete builder. Please try again.' });
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [tCommon, t]);

  return {
    // Builder operations
    createBuilder: createBuilderData,
    updateBuilder: updateBuilderData,
    getBuilder: getBuilderData,
    getBuilders: getBuildersList,
    deleteBuilder: deleteBuilderData,
    
    // Loading states
    isCreating,
    isUpdating,
    isLoading,
    error,
  };
};

export default useBuilderClient;

