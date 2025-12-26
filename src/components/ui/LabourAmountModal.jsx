/**
 * LabourAmountModal
 * Generic amount entry modal (Pay Advance, Add Bonus, Add Deduction)
 */

import { useEffect, useState } from 'react';
import Button from './Button';
import Input from './Input';

export default function LabourAmountModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  amountLabel = 'Payable Amount',
  primaryActionText = 'Add',
  isSubmitting = false,
}) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setAmount('');
      setError('');
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (error || isSubmitting) return;
    onSubmit?.(amount);
  };

  const handleAmountChange = (e) => {
    if (isSubmitting) return;
    const raw = e.target.value;
    // Do not allow negative numbers
    if (String(raw).includes('-')) {
      const cleaned = String(raw).replace(/-/g, '');
      setAmount(cleaned);
      setError('Amount cannot be negative');
      return;
    }

    const num = Number(raw);
    if (!Number.isNaN(num) && num < 0) {
      setError('Amount cannot be negative');
    } else {
      setError('');
    }
    setAmount(raw);
  };

  const isPrimaryDisabled = !String(amount).trim() || Boolean(error);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose?.();
      }}
    >
      <div className="bg-white rounded-[16px] shadow-xl w-full max-w-xl my-auto px-6 py-6">
        <h2 className="text-base font-semibold text-primary mb-4">{title}</h2>

        <div className="" />

        <div className="">
          <Input
            label={amountLabel}
            placeholder="₹ 00"
            value={amount}
            onChange={handleAmountChange}
            type="number"
            step="any"
            min="0"
            error={error}
            disabled={isSubmitting}
          />

        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <Button variant="secondary" size="sm" className="w-[120px]" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="w-[120px]"
            onClick={handleSubmit}
            disabled={isPrimaryDisabled || isSubmitting}
          >
            {isSubmitting ? 'Please wait…' : primaryActionText}
          </Button>
        </div>
      </div>
    </div>
  );
}


