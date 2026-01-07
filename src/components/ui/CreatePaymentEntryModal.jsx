/**
 * CreatePaymentEntryModal Component
 * Modal for creating a new payment entry - matches original design
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from './Button';
import Input from './Input';
import Dropdown from './Dropdown';
import DatePicker from './DatePicker';
import Textarea from './Textarea';

export default function CreatePaymentEntryModal({
  isOpen,
  onClose,
  onCreate,
  banks = [],
  onAddBank,
  existingEntries = [], // Pass existing payment entries to get next number
}) {
  const { t } = useTranslation('finance');

  const [formData, setFormData] = useState({
    paymentNo: 'RCPT-023',
    date: new Date(),
    from: 'Shree Builders',
    to: '',
    amount: '',
    mode: '',
    bankName: '',
    description: '',
  });

  const [errors, setErrors] = useState({});

  const paymentModes = [
    { value: 'cash', label: t('cash', { defaultValue: 'Cash' }) },
    { value: 'cheque', label: t('cheque', { defaultValue: 'Cheque' }) },
    { value: 'bank_transfer', label: t('bankTransfer', { defaultValue: 'Bank Transfer' }) },
    { value: 'upi', label: t('upi', { defaultValue: 'UPI' }) },
    { value: 'other', label: t('other', { defaultValue: 'Other' }) },
  ];

  // Generate auto payment number in format RCPT-XXX (sequential, always 3 digits)
  const generatePaymentNumber = () => {
    // Extract numbers from existing entries (only 3-digit numbers)
    const numbers = existingEntries
      .map((entry) => {
        const paymentNo = entry.paymentNo || entry.payment_no || '';
        // Match RCPT-XXX format (only match 1-3 digit numbers)
        const match = paymentNo.match(/RCPT-(\d{1,3})$/);
        if (match) {
          const num = parseInt(match[1], 10);
          // Only consider numbers that are 3 digits or less (001-999)
          return num > 0 && num <= 999 ? num : 0;
        }
        return 0;
      })
      .filter((num) => num > 0);

    // Get the highest number, or start from 22 if no entries (so next is 023)
    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 22;
    
    // Generate next sequential number (always 3 digits)
    const nextNumber = maxNumber + 1;
    
    // Ensure the number doesn't exceed 999, if it does, wrap around to 001
    const finalNumber = nextNumber > 999 ? 1 : nextNumber;
    
    // Ensure always 3 digits with leading zeros
    const paddedNumber = String(finalNumber).padStart(3, '0');
    return `RCPT-${paddedNumber}`;
  };

  useEffect(() => {
    if (isOpen) {
      // Generate auto payment number when modal opens
      const autoPaymentNo = generatePaymentNumber();
      setFormData({
        paymentNo: autoPaymentNo,
        date: new Date(),
        from: 'Shree Builders',
        to: '',
        amount: '',
        mode: '',
        bankName: '',
        description: '',
      });
      setErrors({});
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

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleCreate = () => {
    const newErrors = {};

    if (!formData.to.trim()) {
      newErrors.to = t('toRequired', { defaultValue: 'To field is required' });
    }

    const amountValue = formData.amount
      ? parseFloat(formData.amount.replace(/[^\d.]/g, ''))
      : 0;

    if (!formData.amount || isNaN(amountValue) || amountValue <= 0) {
      newErrors.amount = t('amountRequired', { defaultValue: 'Amount is required' });
    }

    if (!formData.mode) {
      newErrors.mode = t('modeRequired', { defaultValue: 'Payment mode is required' });
    }

    if (
      (formData.mode === 'cheque' ||
        formData.mode === 'bank_transfer' ||
        formData.mode === 'upi') &&
      !formData.bankName
    ) {
      newErrors.bankName = t('bankNameRequired', { defaultValue: 'Bank name is required' });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onCreate(formData);
    onClose();
  };

  const handleBankSelectChange = (value) => {
    handleChange('bankName', value);
  };

  const handleBankAdded = async (data) => {
    // AddItemModal calls onSave with just a string (the bank name)
    const bankName = typeof data === 'string' ? data : (data.label || data.name || data);
    
    if (onAddBank && !banks.includes(bankName)) {
      try {
        await onAddBank(bankName);
        // Use the bank name returned from API or the original name
        handleChange('bankName', bankName);
      } catch (error) {
        // Error is already handled in handleAddBank
        // Don't update bankName if creation failed
      }
    } else {
      handleChange('bankName', bankName);
    }
  };

  if (!isOpen) return null;

  const bankOptions = banks.map((bank) => ({
    value: bank,
    label: bank,
  }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl w-full max-w-2xl my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="text-lg sm:text-xl font-medium text-primary">
            {t('createPaymentEntry', { defaultValue: 'Create Payment Entry' })}
          </h3>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4">
          {/* Payment No */}
          <div>
            <label className="block text-sm mb-2">
              {t('paymentNo', { defaultValue: 'Payment No' })}{' '}
              <span className="text-secondary">({t('autoGenerated', { defaultValue: 'Auto-generated' })})</span>
            </label>
            <input
              disabled
              value={formData.paymentNo}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm cursor-not-allowed bg-gray-50"
            />
          </div>

          {/* Date */}
          <DatePicker
            label={t('date', { defaultValue: 'Date' })}
            value={formData.date}
            onChange={(date) => handleChange('date', date)}
          />

          {/* From / To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Input
              label={t('from', { defaultValue: 'From' })}
              placeholder={t('enterName', { defaultValue: 'Enter name' })}
              value={formData.from}
              onChange={(e) => handleChange('from', e.target.value)}
            />
            <Input
              label={t('to', { defaultValue: 'To' })}
              placeholder={t('enterName', { defaultValue: 'Enter name' })}
              value={formData.to}
              error={errors.to}
              onChange={(e) => handleChange('to', e.target.value)}
            />
          </div>

          {/* Amount / Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Input
              label={t('amount', { defaultValue: 'Amount' })}
              placeholder="₹.00"
              value={formData.amount}
              error={errors.amount}
              onChange={(e) =>
                handleChange(
                  'amount',
                  e.target.value.replace(/[^\d.]/g, '')
                )
              }
            />

            <Dropdown
              label={t('mode', { defaultValue: 'Mode' })}
              value={formData.mode}
              options={paymentModes}
              placeholder={t('selectMode', { defaultValue: 'Select Mode' })}
              error={errors.mode}
              onChange={(value) => {
                handleChange('mode', value);
                handleChange('bankName', '');
              }}
            />
          </div>

          {/* Bank Name (Cheque / Bank Transfer / UPI) */}
          {(formData.mode === 'cheque' ||
            formData.mode === 'bank_transfer' ||
            formData.mode === 'upi') && (
            <Dropdown
              label={t('bankName', { defaultValue: 'Bank Name' })}
              value={formData.bankName}
              options={bankOptions}
              placeholder={t('selectBank', { defaultValue: 'Select Bank' })}
              error={errors.bankName}
              showSeparator={!!onAddBank}
              onChange={handleBankSelectChange}
              onAddNew={onAddBank ? handleBankAdded : undefined}
              addButtonLabel={t('addNewBank', { defaultValue: 'Add New Bank' })}
            />
          )}

          {/* Description */}
          <Textarea
            label={t('milestoneDescription', { defaultValue: 'Milestone Description' })}
            placeholder={t('writeDescription', { defaultValue: 'Write description' })}
            rows={4}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 pt-3 sm:pt-2 pb-4 sm:pb-4 sticky bottom-0 bg-white border-t border-gray-100">
          <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto">
            {t('cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button variant="primary" onClick={handleCreate} className="w-full sm:w-auto">
            {t('create', { defaultValue: 'Create' })}
          </Button>
        </div>
      </div>
    </div>
  );
}
