/**
 * UpdateBudgetModal Component
 * Modal for updating the total estimated budget
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from './Button';
import NumberInput from './NumberInput';

export default function UpdateBudgetModal({
  isOpen,
  onClose,
  onUpdate,
  currentBudget = '',
}) {
  const { t } = useTranslation('finance');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Convert current budget format (like "1.2 Cr") to number string
      setAmount(currentBudget || '');
      setError('');
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
  }, [isOpen, currentBudget]);

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

  const handleUpdate = () => {
    if (!amount.trim()) {
      setError('Amount is required');
      return;
    }

    onUpdate(amount.trim());
    setAmount('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

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
          <h3 className="text-2xl font-semibold text-primary">
            {t('totalEstBudget', { defaultValue: 'Total Est. Budget' })}
          </h3>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          <NumberInput
            label={t('amount', { defaultValue: 'Amount' })}
            placeholder="00,00,000"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (error) setError('');
            }}
            error={error}
            showCurrency
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 pb-6
                flex-row
                max-[324px]:flex-col">
          <Button 
            variant="secondary" 
            onClick={onClose}
             className="max-[324px]:w-full"
          >
            {t('cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdate}
             className="max-[324px]:w-full"
          >
            {t('updateBudget', { defaultValue: 'Update Budget' })}
          </Button>
        </div>
      </div>
    </div>
  );
}

