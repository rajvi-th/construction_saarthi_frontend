/**
 * ReleaseModal Component
 * Modal for releasing material from site (reusable items).
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/ui/Button';
import NumberInput from '../../../components/ui/NumberInput';

export default function ReleaseModal({
  isOpen,
  onClose,
  onRelease,
  item,
  distribution,
  title,
  subtitle,
}) {
  const { t } = useTranslation('siteInventory');

  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reset when modal opens / item changes
  useEffect(() => {
    if (isOpen) {
      setQuantity('');
      setError('');
    }
  }, [isOpen, item, distribution]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [isOpen]);

  const validate = () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      setError(
        t('releaseModal.errors.quantityRequired', {
          defaultValue: 'Quantity is required',
        }),
      );
      return false;
    }
    setError('');
    return true;
  };

  const handleRelease = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await onRelease?.({
        item,
        distribution,
        quantity: parseFloat(quantity),
      });
      handleClose();
    } catch (err) {
      console.error('Error releasing material:', err);
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    onClose?.();
    setQuantity('');
    setError('');
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
            {title ||
              t('releaseModal.title', {
                defaultValue: 'Release Material',
                itemName: item?.material?.name || '',
              })}
          </h3>
          <p className="text-base text-secondary mt-2">
            {subtitle ||
              t('releaseModal.subtitle', {
                defaultValue: 'Enter the quantity you want to release from site.',
              })}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 space-y-4">
          <NumberInput
            label={t('releaseModal.quantity', {
              defaultValue: 'Release Quantity',
            })}
            value={quantity}
            onChange={(e) => {
              const value = e.target.value;
              setQuantity(value);
              if (error) setError('');
            }}
            placeholder="00"
            required
            error={error}
            disabled={isLoading}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            {t('releaseModal.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            variant="primary"
            onClick={handleRelease}
            disabled={isLoading}
          >
            {t('releaseModal.release', { defaultValue: 'Release' })}
          </Button>
        </div>
      </div>
    </div>
  );
}


