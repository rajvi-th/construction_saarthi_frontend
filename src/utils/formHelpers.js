/**
 * Form helper utilities
 * Common functions for working with React Hook Form
 */

import { yupResolver } from '@hookform/resolvers/yup';

/**
 * Create form resolver with Yup schema
 * @param {yup.ObjectSchema} schema - Yup validation schema
 * @returns {Function} - Form resolver
 */
export const createFormResolver = (schema) => {
  return yupResolver(schema);
};

/**
 * Get form error message
 * @param {object} errors - Form errors object
 * @param {string} fieldName - Field name
 * @returns {string|null} - Error message or null
 */
export const getFormError = (errors, fieldName) => {
  return errors[fieldName]?.message || null;
};

/**
 * Check if form field has error
 * @param {object} errors - Form errors object
 * @param {string} fieldName - Field name
 * @returns {boolean} - True if field has error
 */
export const hasFormError = (errors, fieldName) => {
  return !!errors[fieldName];
};

/**
 * Format form data for API submission
 * @param {object} data - Form data
 * @param {array} excludeFields - Fields to exclude
 * @returns {object} - Formatted data
 */
export const formatFormData = (data, excludeFields = []) => {
  const formatted = { ...data };
  excludeFields.forEach((field) => {
    delete formatted[field];
  });
  return formatted;
};

/**
 * Reset form with default values
 * @param {Function} reset - React Hook Form reset function
 * @param {object} defaultValues - Default form values
 */
export const resetForm = (reset, defaultValues = {}) => {
  reset(defaultValues);
};

/**
 * Handle form submission with loading state
 * @param {Function} onSubmit - Submit handler
 * @param {Function} setLoading - Loading state setter
 * @returns {Function} - Wrapped submit handler
 */
export const handleFormSubmit = (onSubmit, setLoading) => {
  return async (data) => {
    try {
      setLoading(true);
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
};

