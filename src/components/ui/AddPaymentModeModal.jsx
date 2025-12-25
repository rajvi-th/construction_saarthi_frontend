/**
 * Add Payment Mode Modal Component
 * Modal for adding new payment mode
 */

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import { useTranslation } from 'react-i18next';

export default function AddPaymentModeModal({
  isOpen,
  onClose,
  onSave,
}) {
  const { t } = useTranslation('finance');
  const [modeName, setModeName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setModeName('');
      setError('');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [isOpen, onClose]);

  const handleSave = () => {
    if (!modeName.trim()) {
      setError(t('modeNameRequired', { defaultValue: 'Payment mode name is required' }));
      return;
    }

    onSave({
      name: modeName.trim(),
    });
    
    setModeName('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md my-auto">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <h3 className="text-lg font-medium text-primary">
            {t('addPaymentMode', { defaultValue: 'Add Payment Mode' })}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-primary" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          <Input
            label={t('paymentModeName', { defaultValue: 'Payment Mode Name' })}
            value={modeName}
            onChange={(e) => {
              setModeName(e.target.value);
              if (error) setError('');
            }}
            placeholder={t('enterPaymentModeName', { defaultValue: 'Enter payment mode name' })}
            error={error}
            autoFocus
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 pb-4 border-t border-gray-100 pt-4">
          <Button variant="secondary" onClick={onClose}>
            {t('cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {t('add', { defaultValue: 'Add' })}
          </Button>
        </div>
      </div>
    </div>
  );
}

