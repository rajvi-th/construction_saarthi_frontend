/**
 * FilterPaymentModal Component
 * Modal for filtering payment entries - matches original design
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import Button from './Button';
import DatePicker from './DatePicker';
import Input from './Input';
import Checkbox from './Checkbox';

export default function FilterPaymentModal({
  isOpen,
  onClose,
  onApply,
  onReset,
  initialFilters = {},
}) {
  const { t } = useTranslation('finance');
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    receiverName: '',
    paymentModes: [],
    amount: '',
  });

  const paymentModes = [
    { value: 'cash', label: t('cash', { defaultValue: 'Cash' }) },
    { value: 'cheque', label: t('cheque', { defaultValue: 'Cheque' }) },
    { value: 'bank_transfer', label: t('bankTransfer', { defaultValue: 'Bank Transfer' }) },
    { value: 'upi', label: t('upi', { defaultValue: 'UPI' }) },
    { value: 'other', label: t('other', { defaultValue: 'Other' }) },
  ];

  useEffect(() => {
    if (isOpen) {
      setFilters({
        startDate: initialFilters.startDate || new Date(),
        endDate: initialFilters.endDate || new Date(),
        receiverName: initialFilters.receiverName || '',
        paymentModes: initialFilters.paymentModes || [],
        amount: initialFilters.amount || '',
      });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialFilters]);

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

  const handlePaymentModeChange = (mode, checked) => {
    setFilters((prev) => ({
      ...prev,
      paymentModes: checked
        ? [...prev.paymentModes, mode]
        : prev.paymentModes.filter((m) => m !== mode),
    }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      startDate: null,
      endDate: null,
      receiverName: '',
      paymentModes: [],
      amount: '',
    };
    setFilters(resetFilters);
    onReset(resetFilters);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-end bg-black/50
             p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl w-full max-w-md my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-base sm:text-lg font-medium text-primary">
            {t('filter', { defaultValue: 'Filter' })}
          </h3>
          <button
            onClick={onClose}
            className="p-1 cursor-pointer rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-primary" />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-6 py-4 sm:pb-4 space-y-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2 sm:mb-3">
              {t('dateRange', { defaultValue: 'Date Range' })}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <DatePicker
                label={t('startDate', { defaultValue: 'Start Date' })}
                value={filters.startDate}
                onChange={(date) => setFilters((prev) => ({ ...prev, startDate: date }))}
              />
              <DatePicker
                label={t('endDate', { defaultValue: 'End Date' })}
                value={filters.endDate}
                onChange={(date) => setFilters((prev) => ({ ...prev, endDate: date }))}
              />
            </div>
          </div>

          {/* Receiver Name */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              {t('receiverName', { defaultValue: 'Receiver name' })}
            </label>
            <div>
              <label className="block text-xs text-secondary mb-2">
                {t('to', { defaultValue: 'To' })}
              </label>
              <Input
                placeholder={t('enterReceiverName', { defaultValue: 'Enter receiver name' })}
                value={filters.receiverName}
                onChange={(e) => setFilters((prev) => ({ ...prev, receiverName: e.target.value }))}
              />
            </div>
          </div>

          {/* Payment Modes */}
          <div>
            <label className="block text-sm font-medium text-primary mb-3">
              {t('paymentModes', { defaultValue: 'Payment Modes' })}
            </label>
            <div className="space-y-2">
              {paymentModes.map((mode) => (
                <Checkbox
                  key={mode.value}
                  label={mode.label}
                  checked={filters.paymentModes.includes(mode.value)}
                  onChange={(e) => handlePaymentModeChange(mode.value, e.target.checked)}
                />
              ))}
            </div>
          </div>

          {/* Payment Amount */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              {t('paymentAmount', { defaultValue: 'Payment Amount' })}
            </label>
            <div>
              <label className="block text-xs text-secondary mb-2">
                {t('amount', { defaultValue: 'Amount' })}
              </label>
              <Input
                type="text"
                placeholder="₹.00"
                value={filters.amount}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d.]/g, '');
                  setFilters((prev) => ({ ...prev, amount: value }));
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 pb-4 sm:pb-6 sticky bottom-0 bg-white pt-4">
          <Button 
            variant="secondary" 
            onClick={handleReset}
            className="w-full sm:w-auto"
          >
            {t('reset', { defaultValue: 'Reset' })}
          </Button>
          <Button 
            variant="primary" 
            onClick={handleApply}
            className="w-full sm:w-auto"
          >
            {t('apply', { defaultValue: 'Apply' })}
          </Button>
        </div>
      </div>
    </div>
  );
}
