/**
 * CreateSectionModal Component
 * Modal for creating a new section
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from './Button';
import Input from './Input';

export default function CreateSectionModal({
  isOpen,
  onClose,
  onCreate,
}) {
  const { t } = useTranslation('finance');
  const [sectionName, setSectionName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSectionName('');
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

  const handleCreate = () => {
    if (!sectionName.trim()) {
      setError('Section name is required');
      return;
    }

    onCreate(sectionName.trim());
    setSectionName('');
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
          <h3 className="text-2xl font-medium text-primary">
            {t('createSection', { defaultValue: 'Create Section' })}
          </h3>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          <Input
            label={t('sectionName', { defaultValue: 'Section Name' })}
            placeholder={t('enterSectionName', { defaultValue: 'Enter section name' })}
            value={sectionName}
            onChange={(e) => {
              setSectionName(e.target.value);
              if (error) setError('');
            }}
            error={error}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 pb-6
                flex-row
                max-[325px]:flex-col">
  <Button
    variant="secondary"
    onClick={onClose}
    className="max-[325px]:w-full"
  >
    {t('cancel', { defaultValue: 'Cancel' })}
  </Button>

  <Button
    variant="primary"
    onClick={handleCreate}
    className="max-[325px]:w-full"
  >
    {t('createSection', { defaultValue: 'Create Section' })}
  </Button>
</div>

      </div>
    </div>
  );
}

