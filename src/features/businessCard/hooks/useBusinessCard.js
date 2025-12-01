import { useState, useCallback } from 'react';
import { 
  createBusinessCard, 
  updateBusinessCard, 
  getBusinessCard, 
  deleteBusinessCard,
  getBusinessCards 
} from '../api';
import { showError, showSuccess } from '../../../utils/toast';
import { useTranslation } from 'react-i18next';

/**
 * Custom hook for business card operations
 * @returns {Object} { createCard, updateCard, getCard, deleteCard, getCards, isCreating, isUpdating, isLoading, error }
 */
export const useBusinessCard = () => {
  const { t: tCommon } = useTranslation('common');
  const { t } = useTranslation('businessCard');
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Create a new business card
   * @param {Object} formData - Business card form data
   * @returns {Promise<Object>} Created business card data
   */
  const createCard = useCallback(async (formData) => {
    try {
      setIsCreating(true);
      setError(null);

      // Transform form data to match API structure
      const apiData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        countryCode: formData.countryCode,
        phoneNumber: (formData.contactNumber || formData.phoneNumber || '').replace(/\s/g, ''),
        companyName: formData.companyName,
        address: formData.address,
        companyTagline: formData.companyTagline,
        logo: formData.companyLogo || formData.logo, // File object
      };

      const response = await createBusinessCard(apiData);

      showSuccess(
        tCommon('successMessages.created', {
          defaultValue: 'Business card created successfully',
        })
      );

      return response;
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        t('errors.createFailed', { defaultValue: 'Failed to create business card. Please try again.' });
      
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, [tCommon, t]);

  /**
   * Update an existing business card
   * @param {string} id - Business card ID
   * @param {Object} formData - Business card form data
   * @returns {Promise<Object>} Updated business card data
   */
  const updateCard = useCallback(async (id, formData) => {
    try {
      setIsUpdating(true);
      setError(null);

      // Transform form data to match API structure
      const apiData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        countryCode: formData.countryCode,
        phoneNumber: formData.contactNumber?.replace(/\s/g, '') || formData.phoneNumber?.replace(/\s/g, ''),
        companyName: formData.companyName,
        address: formData.address,
        companyTagline: formData.companyTagline,
        logo: formData.companyLogo, // File object (only if new file is uploaded)
      };

      const response = await updateBusinessCard(id, apiData);

      showSuccess(
        tCommon('successMessages.updated', {
          defaultValue: 'Business card updated successfully',
        })
      );

      return response;
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        t('errors.updateFailed', { defaultValue: 'Failed to update business card. Please try again.' });
      
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [tCommon, t]);

  /**
   * Get business card by ID
   * @param {string} id - Business card ID
   * @returns {Promise<Object>} Business card data
   */
  const getCard = useCallback(async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getBusinessCard(id);
      
      // Handle different response structures
      // API returns: { success: true, data: { ... } }
      // Or direct data object
      let responseData = null;
      
      if (response?.success && response?.data) {
        // Response has success and data properties
        responseData = response.data;
      } else if (response?.data) {
        // Response has data property
        responseData = response.data;
      } else if (response && typeof response === 'object') {
        // Response is direct data object
        responseData = response;
      }
      
      return responseData;
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        t('errors.fetchFailed', { defaultValue: 'Failed to load business card. Please try again.' });
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  /**
   * Get list of business cards
   * @returns {Promise<Object>} List of business cards
   */
  const getCards = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getBusinessCards();
      
      // Handle different response structures
      // API might return: { data: [...] } or { data: { data: [...] } } or directly [...]
      let cardsArray = [];
      
      if (Array.isArray(response?.data)) {
        cardsArray = response.data;
      } else if (Array.isArray(response?.data?.data)) {
        cardsArray = response.data.data;
      } else if (Array.isArray(response)) {
        cardsArray = response;
      } else if (response?.data && typeof response.data === 'object') {
        // If data is an object, try to extract array from it
        cardsArray = response.data.data || Object.values(response.data).filter(Array.isArray)[0] || [];
      }
      
      // Ensure we have an array
      if (!Array.isArray(cardsArray)) {
        cardsArray = [];
      }
      
      return cardsArray;
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        t('errors.fetchFailed', { defaultValue: 'Failed to load business cards. Please try again.' });
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  /**
   * Delete business card
   * @param {string} id - Business card ID
   * @returns {Promise<Object>} API response
   */
  const deleteCard = useCallback(async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await deleteBusinessCard(id);
      
      showSuccess(
        tCommon('successMessages.deleted', {
          defaultValue: 'Business card deleted successfully',
        })
      );

      return response;
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to delete business card. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [tCommon]);

  return {
    createCard,
    updateCard,
    getCard,
    getCards,
    deleteCard,
    isCreating,
    isUpdating,
    isLoading,
    error,
  };
};

export default useBusinessCard;

