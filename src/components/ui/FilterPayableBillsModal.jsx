/**
 * FilterPayableBillsModal Component
 * Modal for filtering payable bills
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import Button from './Button';
import DatePicker from './DatePicker';
import Input from './Input';
import Radio from './Radio';
import Checkbox from './Checkbox';

export default function FilterPayableBillsModal({
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
    status: '',
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
        startDate: initialFilters.startDate || null,
        endDate: initialFilters.endDate || null,
        receiverName: initialFilters.receiverName || '',
        status: initialFilters.status || '',
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

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handlePaymentModeChange = (mode, checked) => {
    setFilters((prev) => ({
      ...prev,
      paymentModes: checked
        ? [...prev.paymentModes, mode]
        : prev.paymentModes.filter((m) => m !== mode),
    }));
  };

  const handleReset = () => {
    const resetFilters = {
      startDate: null,
      endDate: null,
      receiverName: '',
      status: '',
      paymentModes: [],
      amount: '',
    };
    setFilters(resetFilters);
    onReset(resetFilters);
  };

if (!isOpen) return null;

return (
  <>
    {/* Overlay */}
    <div
      className="fixed inset-0 bg-black/50 z-50"
      onClick={onClose}
    />

    {/* Drawer */}
    <div className="fixed right-0 top-0 h-screen w-full sm:max-w-md bg-white shadow-2xl z-[60] flex flex-col">

      {/* Header */}
      <div className="sticky top-0 bg-white px-6 py-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-primary">
          {t('filter', { defaultValue: 'Filter' })}
        </h3>
        <button onClick={onClose} className="p-1 rounded-full">
          <X className="w-5 h-5 text-primary" />
        </button>
      </div>

      {/* Body (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-primary mb-3">
            {t('dateRange', { defaultValue: 'Date Range' })}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <Input
            label={t('to', { defaultValue: 'To' })}
            placeholder={t('enterReceiverName', { defaultValue: 'Enter receiver name' })}
            value={filters.receiverName}
            onChange={(e) => setFilters((prev) => ({ ...prev, receiverName: e.target.value }))}
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-primary mb-3">
            {t('status', { defaultValue: 'Status' })}
          </label>
          <div className="space-y-3">
            <Radio
              name="status"
              label={t('pending', { defaultValue: 'Pending' })}
              value="pending"
              checked={filters.status === 'pending'}
              onChange={() => setFilters((prev) => ({ ...prev, status: 'pending' }))}
            />
            <Radio
              name="status"
              label={t('paid', { defaultValue: 'Paid' })}
              value="paid"
              checked={filters.status === 'paid'}
              onChange={() => setFilters((prev) => ({ ...prev, status: 'paid' }))}
            />
          </div>
        </div>

        {/* Payment Modes */}
        <div>
          <label className="block text-sm font-medium text-primary mb-3">
            {t('paymentModes', { defaultValue: 'Payment Modes' })}
          </label>
          <div className="space-y-3">
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
          <Input
            label={t('amount', { defaultValue: 'Amount' })}
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

      {/* Footer (Fixed Bottom) */}
      <div className=" bg-white px-6 py-4 flex justify-end gap-3">
        <Button variant="secondary" onClick={handleReset}>
          {t('reset', { defaultValue: 'Reset' })}
        </Button>
        <Button variant="primary" onClick={handleApply}>
          {t('apply', { defaultValue: 'Apply' })}
        </Button>
      </div>
    </div>
  </>
);

}

