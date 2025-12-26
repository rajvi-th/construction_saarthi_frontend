/**
 * CustomDateRangeModal Component
 * Modal for selecting custom date range for download
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import Button from './Button';
import DatePicker from './DatePicker';

export default function CustomDateRangeModal({
  isOpen,
  onClose,
  onDownload,
}) {
  const { t } = useTranslation('finance');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    if (isOpen) {
      setStartDate(new Date());
      setEndDate(new Date());
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
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [isOpen]);

  const handleDownload = () => {
    onDownload({ startDate, endDate });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl w-full max-w-md my-auto">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-gray-100">
          <h3 className="text-base sm:text-lg font-medium text-primary">
            {t('customDateRange', { defaultValue: 'Custom Date Range' })}
          </h3>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-6 py-4 space-y-3 sm:space-y-4">
          <DatePicker
            label={t('startDate', { defaultValue: 'Start Date' })}
            value={startDate}
            onChange={(date) => setStartDate(date)}
          />
          <DatePicker
            label={t('endDate', { defaultValue: 'End Date' })}
            value={endDate}
            onChange={(date) => setEndDate(date)}
          />
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 pb-4 sm:pb-6">
          <Button 
            variant="secondary" 
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            {t('cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button 
            variant="primary" 
            onClick={handleDownload}
            className="w-full sm:w-auto"
          >
            {t('download', { defaultValue: 'Download' })}
          </Button>
        </div>
      </div>
    </div>
  );
}

