/**
 * Toast utility functions
 * Centralized toast notifications using react-hot-toast
 * Colors match the application theme
 */

import toast from 'react-hot-toast';

// Theme colors
const THEME_COLORS = {
  primary: '#060C12',
  secondary: '#6B6B6B',
  accent: '#B02E0C',
  blackSoft: 'rgba(18, 18, 18, 0.06)',
};

/**
 * Show success toast
 * @param {string} message - Success message
 */
export const showSuccess = (message) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: 'rgba(52, 199, 89, 0.08)',
      color: '#34C759',
      border: '1px solid rgba(52, 199, 89, 0.4)',
      borderRadius: '8px',
      padding: '12px 16px',
    },
    iconTheme: {
      primary: '#34C759',
      secondary: 'rgba(52, 199, 89, 0.08)',
    },
  });
};

/**
 * Show error toast
 * @param {string} message - Error message
 */
export const showError = (message) => {
  toast.error(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: THEME_COLORS.accent,
      color: '#fff',
      borderRadius: '8px',
      padding: '12px 16px',
    },
    iconTheme: {
      primary: '#fff',
      secondary: THEME_COLORS.accent,
    },
  });
};

/**
 * Show warning toast
 * @param {string} message - Warning message
 */
export const showWarning = (message) => {
  toast(message, {
    icon: '⚠️',
    duration: 3000,
    position: 'top-right',
    style: {
      background: THEME_COLORS.secondary,
      color: '#fff',
      borderRadius: '8px',
      padding: '12px 16px',
    },
  });
};

/**
 * Show info toast
 * @param {string} message - Info message
 */
export const showInfo = (message) => {
  toast(message, {
    icon: 'ℹ️',
    duration: 3000,
    position: 'top-right',
    style: {
      background: THEME_COLORS.secondary,
      color: '#fff',
      borderRadius: '8px',
      padding: '12px 16px',
    },
  });
};

/**
 * Show loading toast
 * @param {string} message - Loading message
 * @returns {string} - Toast ID for dismissing
 */
export const showLoading = (message = 'Loading...') => {
  return toast.loading(message, {
    position: 'top-right',
    style: {
      background: THEME_COLORS.primary,
      color: '#fff',
      borderRadius: '8px',
      padding: '12px 16px',
    },
  });
};

/**
 * Dismiss toast by ID
 * @param {string} toastId - Toast ID
 */
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

/**
 * Update toast (useful for loading states)
 * @param {string} toastId - Toast ID
 * @param {object} options - Toast options
 */
export const updateToast = (toastId, options) => {
  toast.dismiss(toastId);
  if (options.type === 'success') {
    showSuccess(options.message);
  } else if (options.type === 'error') {
    showError(options.message);
  } else {
    toast(options.message, {
      ...options,
      id: toastId,
    });
  }
};

// Export default toast instance for custom usage
export default toast;

