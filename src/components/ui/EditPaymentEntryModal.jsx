/**
 * EditPaymentEntryModal Component
 * Modal for editing an existing payment entry - matches original design
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from './Button';
import Input from './Input';
import Dropdown from './Dropdown';
import DatePicker from './DatePicker';
import Textarea from './Textarea';

export default function EditPaymentEntryModal({
  isOpen,
  onClose,
  onUpdate,
  paymentEntry,
  banks = [],
  onAddBank,
}) {
  const { t } = useTranslation('finance');

  const [formData, setFormData] = useState({
    paymentNo: '',
    date: new Date(),
    from: '',
    to: '',
    amount: '',
    mode: '',
    bankName: '',
    description: '',
  });

  const [errors, setErrors] = useState({});

  /* ---------------- Payment Modes (Dropdown) ---------------- */
  const paymentModes = [
    { value: 'cash', label: t('cash', { defaultValue: 'Cash' }) },
    { value: 'cheque', label: t('cheque', { defaultValue: 'Cheque' }) },
    { value: 'bank_transfer', label: t('bankTransfer', { defaultValue: 'Bank Transfer' }) },
    { value: 'upi', label: t('upi', { defaultValue: 'UPI' }) },
    { value: 'other', label: t('other', { defaultValue: 'Other' }) },
  ];

  /* ---------------- Populate data on open ---------------- */
  useEffect(() => {
    if (isOpen && paymentEntry) {
      const modeMap = {
        Cash: 'cash',
        Cheque: 'cheque',
        'Bank Transfer': 'bank_transfer',
        UPI: 'upi',
        Other: 'other',
        cash: 'cash',
        cheque: 'cheque',
        bank_transfer: 'bank_transfer',
        upi: 'upi',
        other: 'other',
      };

      const amountValue = paymentEntry.amount
        ? paymentEntry.amount.replace(/[₹,]/g, '')
        : '';

      let parsedDate = new Date();
      if (paymentEntry.date) {
        const d = new Date(paymentEntry.date);
        parsedDate = isNaN(d.getTime()) ? new Date() : d;
      }

      setFormData({
        paymentNo: paymentEntry.paymentNo || '',
        date: parsedDate,
        from: paymentEntry.from || paymentEntry.name || '',
        to: paymentEntry.to || '',
        amount: amountValue,
        mode: modeMap[paymentEntry.mode] || paymentEntry.mode || '',
        bankName: paymentEntry.bankName || '',
        description: paymentEntry.description || '',
      });

      setErrors({});
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, paymentEntry]);

  /* ---------------- Escape key close ---------------- */
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress);
    }
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, onClose]);

  /* ---------------- Handlers ---------------- */
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleUpdate = () => {
    const newErrors = {};

    if (!formData.to.trim()) {
      newErrors.to = t('toRequired', { defaultValue: 'To field is required' });
    }

    if (!formData.amount || parseFloat(formData.amount.replace(/[^\d.]/g, '')) <= 0) {
      newErrors.amount = t('amountRequired', { defaultValue: 'Amount is required' });
    }

    if (!formData.mode) {
      newErrors.mode = t('modeRequired', { defaultValue: 'Payment mode is required' });
    }

    if (
      ['cheque', 'bank_transfer', 'upi'].includes(formData.mode) &&
      !formData.bankName
    ) {
      newErrors.bankName = t('bankNameRequired', { defaultValue: 'Bank name is required' });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onUpdate(formData);
    onClose();
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

  const bankOptions = banks.map((b) => ({ value: b, label: b }));

  /* ---------------- Render ---------------- */
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl w-full max-w-2xl my-auto overflow-y-auto">
         <div className="max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="text-lg sm:text-xl font-medium text-primary">
            {t('editPaymentEntry', { defaultValue: 'Edit Payment Entry' })}
          </h3>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-6 py-3 sm:pb-6 space-y-3 sm:space-y-4">
          {/* Payment No */}
          <div>
            <label className="block text-sm mb-2">
              {t('paymentNo', { defaultValue: 'Payment No' })}{' '}
              <span className="text-secondary">({t('autoGenerated', { defaultValue: 'Auto-generated' })})</span>
            </label>
            <input
              disabled
              value={formData.paymentNo}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm cursor-not-allowed bg-gray-50"
            />
          </div>

          <DatePicker
            label={t('date', { defaultValue: 'Date' })}
            value={formData.date}
            onChange={(d) => handleChange('date', d)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Input
              label={t('from', { defaultValue: 'From' })}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Input
              label={t('amount', { defaultValue: 'Amount' })}
              value={formData.amount}
              placeholder="₹.00"
              error={errors.amount}
              onChange={(e) =>
                handleChange('amount', e.target.value.replace(/[^\d.]/g, ''))
              }
            />

            {/* MODE DROPDOWN (COMMON) */}
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

          {/* BANK NAME (Cheque / Bank Transfer / UPI) */}
          {['cheque', 'bank_transfer', 'upi'].includes(formData.mode) && (
            <Dropdown
              label={t('bankName', { defaultValue: 'Bank Name' })}
              value={formData.bankName}
              options={bankOptions}
              placeholder={t('selectBank', { defaultValue: 'Select Bank' })}
              error={errors.bankName}
              showSeparator={!!onAddBank}
              onAddNew={onAddBank ? handleBankAdded : undefined}
              addButtonLabel={t('addNewBank', { defaultValue: 'Add New Bank' })}
              onChange={(value) => handleChange('bankName', value)}
            />
          )}

          <Textarea
            label={t('milestoneDescription', { defaultValue: 'Milestone Description' })}
            placeholder={t('writeDescription', { defaultValue: 'Write description' })}
            rows={4}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 pb-4 sm:pb-6 sticky bottom-0 bg-white border-t border-gray-100 pt-4">
          <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto">
            {t('cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button variant="primary" onClick={handleUpdate} className="w-full sm:w-auto">
            {t('update', { defaultValue: 'Update' })}
          </Button>
        </div>
      </div></div>
    </div>
  );
}
