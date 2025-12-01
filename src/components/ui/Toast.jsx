/**
 * Toast Component Wrapper
 * Re-export toast utilities for easy access
 */

export { 
  showSuccess, 
  showError, 
  showWarning, 
  showInfo, 
  showLoading, 
  dismissToast, 
  updateToast 
} from '../../utils/toast';

export { default as toast } from 'react-hot-toast';
