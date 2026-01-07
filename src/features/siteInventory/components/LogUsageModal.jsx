/**
 * LogUsageModal Component
 * Modal for logging usage of consumable inventory items
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/Button';
import NumberInput from '../../../components/ui/NumberInput';
import RichTextEditor from '../../../components/ui/RichTextEditor';

export default function LogUsageModal({
  isOpen,
  onClose,
  onLogUsage,
  item,
  title,
  subtitle,
}) {
  const { t } = useTranslation('siteInventory');

  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen && item) {
      setQuantity('');
      setDescription('');
      setErrors({});
    }
  }, [isOpen, item]);

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

  const validate = () => {
    const newErrors = {};

    if (!quantity || parseFloat(quantity) <= 0) {
      newErrors.quantity = t('logUsageModal.errors.quantityRequired', { defaultValue: 'Quantity is required' });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogUsage = async () => {
    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      await onLogUsage?.({
        ...item,
        quantity: parseFloat(quantity),
        reason: description,
      });
      onClose();
      // Reset form
      setQuantity('');
      setDescription('');
      setErrors({});
    } catch (error) {
      console.error('Error logging usage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setQuantity('');
      setDescription('');
      setErrors({});
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          handleClose();
        }
      }}
    >
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-xl my-auto">
        {/* Header */}
        <div className="px-6 py-4">
          <h3 className="text-2xl font-medium text-primary">
            {title || t('logUsageModal.title', { defaultValue: 'Log Usage' })}
          </h3>
          <p className="text-base text-secondary mt-2">
            {subtitle || t('logUsageModal.subtitle', { defaultValue: 'Enter the quantity used on your site.' })}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 space-y-4">
          {/* Quantity Field */}
          <div>
            <NumberInput
              label={t('logUsageModal.quantity', { defaultValue: 'Quantity' })}
              value={quantity}
              onChange={(e) => {
                const value = e.target.value;
                setQuantity(value);
                if (errors.quantity) {
                  setErrors({ ...errors, quantity: '' });
                }
              }}
              placeholder="00"
              required
              error={errors.quantity}
              disabled={isLoading}
            />
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              {t('logUsageModal.description', { defaultValue: 'Description' })}
            </label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder={t('logUsageModal.descriptionPlaceholder', { defaultValue: 'Enter text here' })}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            {t('logUsageModal.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            variant="primary"
            onClick={handleLogUsage}
            disabled={isLoading}
          >
            {isLoading
              ? t('logUsageModal.adding', { defaultValue: 'Adding...' })
              : t('logUsageModal.addLog', { defaultValue: 'Add Log' })
            }
          </Button>
        </div>
      </div>
    </div>
  );
}

