import { useState, useCallback } from 'react';
import {
  createSiteInventory,
  updateSiteInventory,
  getSiteInventory,
  deleteSiteInventory,
  getSiteInventoryList
} from '../api';
import { showError, showSuccess } from '../../../utils/toast';
import { useTranslation } from 'react-i18next';

/**
 * Custom hook for site inventory operations
 * @returns {Object} { createItem, updateItem, getItem, deleteItem, getItems, isCreating, isUpdating, isLoading, error }
 */
export const useSiteInventory = () => {
  const { t: tCommon } = useTranslation('common');
  const { t } = useTranslation('siteInventory');
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Create a new site inventory item
   * @param {Object} formData - Site inventory form data
   * @returns {Promise<Object>} Created site inventory data
   */
  const createItem = useCallback(async (formData) => {
    try {
      setIsCreating(true);
      setError(null);

      const response = await createSiteInventory(formData);

      showSuccess(
        tCommon('successMessages.created', {
          defaultValue: 'Site inventory item created successfully',
        })
      );

      return response;
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        t('errors.createFailed', { defaultValue: 'Failed to create site inventory item. Please try again.' });

      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, [tCommon, t]);

  /**
   * Update an existing site inventory item
   * @param {string} id - Site inventory item ID
   * @param {Object} formData - Site inventory form data
   * @returns {Promise<Object>} Updated site inventory data
   */
  const updateItem = useCallback(async (id, formData) => {
    try {
      setIsUpdating(true);
      setError(null);

      const response = await updateSiteInventory(id, formData);

      showSuccess(
        tCommon('successMessages.updated', {
          defaultValue: 'Site inventory item updated successfully',
        })
      );

      return response;
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        t('errors.updateFailed', { defaultValue: 'Failed to update site inventory item. Please try again.' });

      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [tCommon, t]);

  /**
   * Get site inventory item by ID
   * @param {string} id - Site inventory item ID
   * @returns {Promise<Object>} Site inventory data
   */
  const getItem = useCallback(async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getSiteInventory(id);

      // Handle different response structures
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
        t('errors.fetchFailed', { defaultValue: 'Failed to load site inventory item. Please try again.' });
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  /**
   * Get list of site inventory items
   * @param {Object} [params] - Query parameters
   * @param {string|number} [params.projectID] - Project ID filter
   * @param {string|number} [params.inventoryTypeId] - Inventory type ID filter (1=Reusable, 2=Consumable)
   * @returns {Promise<Array>} List of site inventory items
   */
  const getItems = useCallback(async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getSiteInventoryList(params);

      let itemsArray = [];

      // Most common: axios response { data: { items: [...] } }
      if (Array.isArray(response?.data?.items)) {
        itemsArray = response.data.items;
      }
      // http wrapper returning data directly { items: [...] }
      else if (Array.isArray(response?.items)) {
        itemsArray = response.items;
      }
      // data is already array
      else if (Array.isArray(response?.data)) {
        itemsArray = response.data;
      }
      // plain array
      else if (Array.isArray(response)) {
        itemsArray = response;
      }

      // safety fallback only
      if (!Array.isArray(itemsArray)) {
        itemsArray = [];
      }

      return itemsArray;
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        t('errors.fetchFailed', { defaultValue: 'Failed to load site inventory items. Please try again.' });

      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [t]);


  /**
   * Delete site inventory item
   * @param {string} id - Site inventory item ID
   * @returns {Promise<Object>} API response
   */
  const deleteItem = useCallback(async (id) => {
    try {
      setIsDeleting(true);
      setError(null);
      const response = await deleteSiteInventory(id);

      showSuccess(
        tCommon('successMessages.deleted', {
          defaultValue: 'Site inventory item deleted successfully',
        })
      );

      return response;
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to delete site inventory item. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, [tCommon]);

  return {
    createItem,
    updateItem,
    getItem,
    getItems,
    deleteItem,
    isCreating,
    isUpdating,
    isDeleting,
    isLoading,
    error,
  };
};

export default useSiteInventory;

