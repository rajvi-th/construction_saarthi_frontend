/**
 * DownloadPDFModal Component
 * Modal for downloading content as PDF with title input
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { X } from 'lucide-react';

export default function DownloadPDFModal({
  isOpen,
  onClose,
  onDownload,
  defaultTitle = '',
  isLoading = false,
}) {
  const { t } = useTranslation('calculation');
  const [title, setTitle] = useState(defaultTitle);

  useEffect(() => {
    if (isOpen) {
      setTitle(defaultTitle);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, defaultTitle]);

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

  const handleDownload = async () => {
    if (onDownload) {
      await onDownload(title);
    }
    onClose();
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
        <div className="px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-medium text-primary">
            {t('downloadPDF.title', { defaultValue: 'Download as PDF' })}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <Input
            label={t('downloadPDF.titleLabel', { defaultValue: 'Title' })}
            placeholder={t('downloadPDF.titlePlaceholder', { defaultValue: 'Enter title' })}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-4"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          <Button 
            variant="secondary" 
            onClick={onClose}
            disabled={isLoading}
          >
            {t('downloadPDF.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button 
            variant="primary" 
            onClick={handleDownload}
            disabled={isLoading}
          >
            {isLoading 
              ? t('downloadPDF.downloading', { defaultValue: 'Downloading...' }) 
              : t('downloadPDF.download', { defaultValue: 'Download' })
            }
          </Button>
        </div>
      </div>
    </div>
  );
}

