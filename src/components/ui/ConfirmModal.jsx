/**
 * ConfirmModal Component
 * Reusable confirmation dialog modal for delete and other actions
 */

import { useEffect } from 'react';
import Button from './Button';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Project',
  message,
  confirmText = 'Yes, Delete',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  isLoading = false,
}) {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm?.();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md my-auto">
        {/* Header */}
        <div className="px-6 py-4">
          <h3 className="text-2xl font-semibold text-primary">{title}</h3>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          <div className="text-base text-secondary">
            {typeof message === 'string' ? <p>{message}</p> : message}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          <Button 
            variant="secondary" 
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button 
            variant={confirmVariant} 
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

